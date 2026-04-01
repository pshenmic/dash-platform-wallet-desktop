const DAV_PER_DASH = 10_000_000n

export function formatCompactCredits(value: bigint): string {
  const sign = value < 0n ? '-' : ''
  const abs = value < 0n ? -value : value
  const UNITS = [
    { threshold: 1_000_000_000_000n, suffix: 'T' },
    { threshold: 1_000_000_000n, suffix: 'B' },
    { threshold: 1_000_000n, suffix: 'M' },
  ] as const
  for (const { threshold, suffix } of UNITS) {
    if (abs >= threshold) {
      const whole = abs / threshold
      const rem = abs % threshold
      const decimal = (rem * 10n) / threshold
      return decimal === 0n
        ? `${sign}${whole}${suffix}`
        : `${sign}${whole}.${decimal}${suffix}`
    }
  }
  return `${sign}${abs}`
}

export function davToDash(dav: bigint): string {
  const sign = dav < 0n ? "-" : ""
  const abs = dav < 0n ? -dav : dav
  const whole = abs / DAV_PER_DASH
  const frac = abs % DAV_PER_DASH
  if (frac === 0n) return `${sign}${whole}`
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "")
  return `${sign}${whole}.${fracStr}`
}
