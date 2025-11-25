import { useState, useCallback, useEffect } from 'react';
import { getWallets, WalletName } from "@massalabs/wallet-provider";

interface WalletProvider {
  address: string;
  name: string;
}

interface UseWalletReturn {
  isConnected: boolean;
  userAddress: string;
  provider: WalletProvider | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const walletList = await getWallets();
      const wallet = walletList.find((w) => w.name() === WalletName.MassaWallet);

      if (!wallet) {
        throw new Error(
          "Massa Wallet not detected. Please install the Massa wallet and configure it for the Buildnet network"
        );
      }

      const accounts = await wallet.accounts();
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in your Massa wallet");
      }

      const walletProvider = accounts[0];
      setUserAddress(walletProvider.address);
      setProvider({
        address: walletProvider.address,
        name: 'Massa Wallet',
      });
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setUserAddress('');
    setProvider(null);
    setError(null);
  }, []);

  // Initialize wallet connection on mount
  useEffect(() => {
    const initWallet = async () => {
      try {
        await connect();
      } catch (err) {
        console.error('Initial wallet connection failed:', err);
      }
    };

    initWallet();
  }, [connect]);

  return {
    isConnected,
    userAddress,
    provider,
    loading,
    error,
    connect,
    disconnect
  };
}
