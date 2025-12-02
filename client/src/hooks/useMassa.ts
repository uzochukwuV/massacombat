/**
 * React hooks for Massa wallet integration
 */

import { useState, useEffect, useCallback } from 'react';
import { massaClient } from '../lib/massa-client';

export interface UseMassaReturn {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useMassa(): UseMassaReturn {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = () => {
      const connected = massaClient.isConnected();
      setIsConnected(connected);
      if (connected) {
        setAccount(massaClient.getAccount());
      }
    };

    checkConnection();

    // Listen for wallet events if available
    if (typeof window !== 'undefined' && window.massaWallet) {
      // Add event listeners for wallet state changes
      // This depends on the specific Massa wallet implementation
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const connectedAccount = await massaClient.connect();
      if (connectedAccount) {
        setAccount(connectedAccount);
        setIsConnected(true);
      } else {
        setError('Failed to connect to wallet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await massaClient.disconnect();
      setAccount(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  return {
    account,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}

// Hook for contract interactions with loading states
export function useContractCall<T>(
  contractFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await contractFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Contract call failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  };
}

// Hook for contract writes with transaction handling
export function useContractWrite<T extends any[]>(
  contractFunction: (...args: T) => Promise<string>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const write = useCallback(async (...args: T) => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const hash = await contractFunction(...args);
      setTxHash(hash);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractFunction]);

  return {
    write,
    loading,
    error,
    txHash,
    reset: () => {
      setError(null);
      setTxHash(null);
    }
  };
}