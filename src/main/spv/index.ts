import {ChainDAO} from './ChainDAO'
import {CFilterSync, CFilterSyncStatus} from './cfilterSync'
import {GENESIS_HASH} from './genesis'
import {HeaderSync, HeaderSyncStatus} from './headerSync'
import {SpvCommand, SpvEvent, SpvStatus, SpvUtxoSummary} from './messages'

declare const process: NodeJS.Process & {
  parentPort: {
    on: (event: 'message', listener: (msg: { data: SpvCommand }) => void) => void
    postMessage: (msg: SpvEvent) => void
  }
}

let chainDAO: ChainDAO | null = null
let headerSync: HeaderSync | null = null
let cfilterSync: CFilterSync | null = null
let activeNetwork: SpvStatus['network'] = null
let activeWalletId: string | null = null
let activeWatchAddresses: string[] = []
let activeBirthdayHeight = 1
let cfilterStarted = false

let status: SpvStatus = {
  phase: 'idle',
  network: null,
  walletId: null,
  tipHeight: 0,
  tipHash: null,
  estimatedChainHeight: 0,
  cfheadersHeight: 0,
  cfilterScanHeight: 0,
  matchedBlocksPending: 0,
  utxoCount: 0,
  totalBalance: '0',
  peerCount: 0,
  filterCapablePeerCount: 0,
  lastError: null,
  updatedAt: Date.now(),
}

function emit(next: Partial<SpvStatus>): void {
  status = { ...status, ...next, updatedAt: Date.now() }
  process.parentPort.postMessage({ type: 'status', status })
}

function emitUtxos(utxos: SpvUtxoSummary[]): void {
  process.parentPort.postMessage({ type: 'utxos', utxos })
}

function reportError(message: string): void {
  status = { ...status, lastError: message, updatedAt: Date.now() }
  process.parentPort.postMessage({ type: 'status', status })
  process.parentPort.postMessage({ type: 'error', message })
}

function emitFromHeaderSync(s: HeaderSyncStatus): void {
  emit({
    // CFilter sync re-narrates phase once it takes over; until then mirror
    // header-sync phases directly into SpvStatus.
    phase: cfilterStarted
      ? status.phase
      : s.phase === 'syncing-headers' || s.phase === 'connecting' || s.phase === 'stopped'
        ? s.phase
        : 'synced-headers',
    network: activeNetwork,
    walletId: activeWalletId,
    tipHeight: s.tipHeight,
    tipHash: s.tipHash,
    estimatedChainHeight: s.estimatedChainHeight,
    peerCount: s.peerCount,
  })

  if (s.phase === 'synced' && !cfilterStarted && chainDAO && activeNetwork && s.tipHash) {
    cfilterStarted = true
    startCFilterSync(s.tipHeight, s.tipHash).catch(err => {
      reportError(err instanceof Error ? err.message : String(err))
    })
  }
}

function emitFromCFilterSync(s: CFilterSyncStatus): void {
  // Map cfilter sub-phases to the wire SpvPhase enum.
  const phase: SpvStatus['phase'] =
    s.phase === 'connecting' ? 'syncing-cfcheckpt'
    : s.phase === 'cfcheckpt' ? 'syncing-cfcheckpt'
    : s.phase === 'cfheaders' ? 'syncing-cfheaders'
    : s.phase === 'cfilters' ? 'syncing-cfilters'
    : s.phase === 'synced' ? 'synced'
    : s.phase === 'stopped' ? 'stopped'
    : status.phase
  emit({
    phase,
    cfheadersHeight: s.cfheadersHeight,
    cfilterScanHeight: s.cfilterScanHeight,
    matchedBlocksPending: s.matchedBlocksPending,
    utxoCount: s.utxoCount,
    totalBalance: s.totalBalance,
    // Header pool and cfilter pool are independent; report whichever has more
    // peers so the renderer never sees the count drop on transition.
    peerCount: Math.max(status.peerCount, s.peerCount),
    filterCapablePeerCount: s.filterCapablePeerCount,
  })
}

async function startCFilterSync(tipHeight: number, tipHashDisplayHex: string): Promise<void> {
  if (!chainDAO || !activeNetwork || !activeWalletId) return
  cfilterSync = new CFilterSync({
    network: activeNetwork,
    walletId: activeWalletId,
    chainDAO,
    chainTipHeight: tipHeight,
    chainTipHashDisplayHex: tipHashDisplayHex,
    watchAddresses: activeWatchAddresses,
    birthdayHeight: activeBirthdayHeight,
    emitStatus: emitFromCFilterSync,
    emitUtxos,
  })
  await cfilterSync.start()
}

async function teardown(): Promise<void> {
  if (cfilterSync) {
    cfilterSync.stop()
    cfilterSync = null
  }
  if (headerSync) {
    headerSync.stop()
    headerSync = null
  }
  if (chainDAO) {
    await chainDAO.close().catch(() => {})
    chainDAO = null
  }
  cfilterStarted = false
}

async function handleStart(cmd: Extract<SpvCommand, { type: 'start' }>): Promise<void> {
  await teardown()

  activeNetwork = cmd.network
  activeWalletId = cmd.walletId
  activeWatchAddresses = cmd.watchAddresses ?? []
  activeBirthdayHeight = cmd.birthdayHeight && cmd.birthdayHeight > 0 ? cmd.birthdayHeight : 1
  emit({
    phase: 'connecting',
    network: cmd.network,
    walletId: cmd.walletId,
    tipHeight: 0,
    tipHash: null,
    estimatedChainHeight: 0,
    cfheadersHeight: 0,
    cfilterScanHeight: 0,
    matchedBlocksPending: 0,
    utxoCount: 0,
    totalBalance: '0',
    peerCount: 0,
    filterCapablePeerCount: 0,
    lastError: null,
  })

  chainDAO = new ChainDAO(cmd.chainDbPath)
  await chainDAO.open()

  const persisted = await chainDAO.initSyncState(cmd.network)

  if (!chainDAO || !persisted) {
    reportError('Chain DB init failed — see utility process logs')
    await teardown()
    return
  }

  // Emit the initial UTXO snapshot for THIS wallet so the renderer can
  // populate before sync. Compute total balance up front too.
  const initialUtxos = await chainDAO.getAllUtxos(cmd.walletId)
  if (initialUtxos.length > 0) {
    emitUtxos(initialUtxos)
    let initialBalance = 0n
    for (const u of initialUtxos) initialBalance += BigInt(u.satoshis)
    emit({utxoCount: initialUtxos.length, totalBalance: initialBalance.toString()})
  }

  let resumeHeight = persisted.tipHeight
  let resumeHash = persisted.tipHash
  console.log(`[spv] persisted state: height=${resumeHeight} hash=${resumeHash ?? 'null'}`)
  if (cmd.startHeight > resumeHeight) {
    resumeHeight = cmd.startHeight
    resumeHash = cmd.startHash
    console.log(`[spv] checkpoint override: height=${resumeHeight} hash=${resumeHash}`)
  }
  if (!resumeHash) {
    resumeHash = GENESIS_HASH[cmd.network]
    resumeHeight = 1
    console.log(`[spv] genesis fallback: height=${resumeHeight} hash=${resumeHash}`)
  }
  console.log(`[spv] starting sync from height=${resumeHeight} hash=${resumeHash} watchAddresses=${activeWatchAddresses.length} birthday=${activeBirthdayHeight}`)

  headerSync = new HeaderSync({
    network: cmd.network,
    chainDAO,
    initialTipHeight: resumeHeight,
    initialTipHash: resumeHash,
    emit: emitFromHeaderSync,
    onChainExtended: headers => {
      if (cfilterSync) cfilterSync.onChainExtended(headers)
    },
  })
  headerSync.start()
}

function handleAddWatchAddresses(cmd: Extract<SpvCommand, { type: 'addWatchAddresses' }>): void {
  // Hot-add only applies if the active sync is for THIS wallet.
  if (!activeWalletId || cmd.walletId !== activeWalletId) return
  const merged = new Set(activeWatchAddresses)
  for (const a of cmd.addresses) merged.add(a)
  activeWatchAddresses = [...merged]
  if (cfilterSync) cfilterSync.addWatchAddresses(cmd.addresses)
}

async function handleStop(): Promise<void> {
  await teardown()
  activeNetwork = null
  activeWalletId = null
  activeWatchAddresses = []
  activeBirthdayHeight = 1
  emit({
    phase: 'stopped',
    network: null,
    walletId: null,
    tipHeight: 0,
    tipHash: null,
    estimatedChainHeight: 0,
    cfheadersHeight: 0,
    cfilterScanHeight: 0,
    matchedBlocksPending: 0,
    utxoCount: 0,
    totalBalance: '0',
    peerCount: 0,
    filterCapablePeerCount: 0,
  })
}

process.parentPort.on('message', ({ data }) => {
  if (data.type === 'start') {
    console.log(data)
    handleStart(data).catch(err => {
      console.error('err')
      reportError(err instanceof Error ? err.message : String(err))
    })
    return
  }
  if (data.type === 'stop') {
    console.log(data)
    handleStop().catch(err => reportError(err instanceof Error ? err.message : String(err)))
    return
  }
  if (data.type === 'addWatchAddresses') {
    handleAddWatchAddresses(data)
  }
})

emit({ phase: 'idle' })