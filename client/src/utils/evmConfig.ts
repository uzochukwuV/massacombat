// EVM Configuration for BattleChain V2
// This file serves as the unified entry point for ALL contract definitions and chain configurations

const targetChainName = import.meta.env.VITE_CHAIN || 'devnet';

// Temporary configuration until contracts are deployed
// After deployment, this will be replaced with actual metadata.json
export const selectedChain = {
  network: 'devnet',
  chainId: '20258',
  rpc_url: 'https://dev-rpc.codenut.dev',
  contracts: []
};

export const chainId = parseInt(selectedChain.chainId);
export const rpcUrl = selectedChain.rpc_url;

// Contract addresses - will be updated after deployment
export const contracts = {
  BattleChainCharacter: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    abi: [] as const
  },
  BattleEngine: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    abi: [] as const
  },
  EconomicSystem: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    abi: [] as const
  },
  MatchmakingManager: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    abi: [] as const
  }
};

/**
 * To build for different chains, set the VITE_CHAIN environment variable:
 *
 * VITE_CHAIN=devnet pnpm run build    (for local development)
 * VITE_CHAIN=bsc pnpm run build       (for BSC network)
 * VITE_CHAIN=polygon pnpm run build   (for Polygon network)
 */
