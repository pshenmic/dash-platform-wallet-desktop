import {z} from 'zod'

const NetworkCheckpointSchema = z.object({
  checkpointHeight: z.number().int().nonnegative(),
  checkpointHash: z.string().nullable(),
})

export type NetworkCheckpoint = z.infer<typeof NetworkCheckpointSchema>

export const ChainPreferencesSchema = z.object({
  mainnet: NetworkCheckpointSchema,
  testnet: NetworkCheckpointSchema,
})

export type ChainPreferencesJSON = z.infer<typeof ChainPreferencesSchema>

export class ChainPreferences {
  mainnet: NetworkCheckpoint
  testnet: NetworkCheckpoint

  constructor(mainnet: NetworkCheckpoint, testnet: NetworkCheckpoint) {
    this.mainnet = mainnet
    this.testnet = testnet
  }

  toJSON(): ChainPreferencesJSON {
    return {
      mainnet: { ...this.mainnet },
      testnet: { ...this.testnet },
    }
  }

  static fromObject(value: unknown): ChainPreferences {
    const {mainnet, testnet} = ChainPreferencesSchema.parse(value)
    return new ChainPreferences(mainnet, testnet)
  }

  static default(): ChainPreferences {
    return new ChainPreferences(
      { checkpointHeight: 0, checkpointHash: null },
      { checkpointHeight: 0, checkpointHash: null },
    )
  }
}