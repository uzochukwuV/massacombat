import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { chainId, rpcUrl } from '@/utils/evmConfig';

// Define the custom chain based on evmConfig
const devnetChain = defineChain({
  id: chainId,
  name: 'Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.codenut.dev' },
  },
});

export const config = getDefaultConfig({
  appName: 'BattleChain V2',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [devnetChain],
  ssr: false,
});
