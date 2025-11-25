/**
 * Treasury and Admin Hook
 * Handles treasury balance, fee info, and admin operations
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract } from './useContract';

export interface FeeInfo {
  createCharacterFee: bigint;
  createEquipmentFee: bigint;
  learnSkillFee: bigint;
  equipSkillFee: bigint;
  createBattleFee: bigint;
  executeTurnFee: bigint;
  repairFee: bigint;
  createTournamentFee: bigint;
}

export function useTreasury(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get current treasury balance
   */
  const getTreasuryBalance = useCallback(async (): Promise<bigint> => {
    try {
      const result = await readContract(
        provider,
        contractAddress,
        'game_getTreasuryBalance',
        new Args()
      );

      const resultArgs = new Args(result.value);
      return resultArgs.nextU64();
    } catch (err) {
      console.error('Failed to get treasury balance:', err);
      return BigInt(0);
    }
  }, [contractAddress, provider]);

  /**
   * Get fee information
   */
  const getFeeInfo = useCallback(async (): Promise<string> => {
    try {
      const result = await readContract(
        provider,
        contractAddress,
        'game_getFeeInfo',
        new Args()
      );

      const resultArgs = new Args(result.value);
      return resultArgs.nextString();
    } catch (err) {
      console.error('Failed to get fee info:', err);
      return 'Fee info unavailable';
    }
  }, [contractAddress, provider]);

  /**
   * Get admin address
   */
  const getAdmin = useCallback(async (): Promise<string> => {
    try {
      const result = await readContract(
        provider,
        contractAddress,
        'game_getAdmin',
        new Args()
      );

      const resultArgs = new Args(result.value);
      return resultArgs.nextString();
    } catch (err) {
      console.error('Failed to get admin:', err);
      return '';
    }
  }, [contractAddress, provider]);

  /**
   * Check if contract is paused
   */
  const isPaused = useCallback(async (): Promise<boolean> => {
    try {
      const result = await readContract(
        provider,
        contractAddress,
        'game_isPaused',
        new Args()
      );

      const resultArgs = new Args(result.value);
      return resultArgs.nextBool();
    } catch (err) {
      console.error('Failed to check pause state:', err);
      return false;
    }
  }, [contractAddress, provider]);

  /**
   * Withdraw from treasury (admin only)
   * @param amount - Amount to withdraw in nanoMAS
   */
  const withdrawTreasury = useCallback(
    async (amount: bigint) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addU64(amount);

        const op = await callContract(
          provider,
          contractAddress,
          'game_withdrawTreasury',
          args,
          Mas.fromString('0.1'),
          BigInt(50_000_000)
        );

        console.log('Treasury withdrawal:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to withdraw from treasury';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Pause the contract (admin only)
   */
  const pauseContract = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected || !userAddress) {
        throw new Error('Wallet not connected');
      }

      const op = await callContract(
        provider,
        contractAddress,
        'game_pause',
        new Args(),
        Mas.fromString('0.1'),
        BigInt(50_000_000)
      );

      console.log('Contract paused:', op.id);
      return op;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause contract';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, contractAddress, provider, userAddress]);

  /**
   * Unpause the contract (admin only)
   */
  const unpauseContract = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected || !userAddress) {
        throw new Error('Wallet not connected');
      }

      const op = await callContract(
        provider,
        contractAddress,
        'game_unpause',
        new Args(),
        Mas.fromString('0.1'),
        BigInt(50_000_000)
      );

      console.log('Contract unpaused:', op.id);
      return op;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to unpause contract';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, contractAddress, provider, userAddress]);

  /**
   * Transfer admin role (admin only)
   * @param newAdmin - New admin address
   */
  const transferAdmin = useCallback(
    async (newAdmin: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(newAdmin);

        const op = await callContract(
          provider,
          contractAddress,
          'game_transferAdmin',
          args,
          Mas.fromString('0.1'),
          BigInt(50_000_000)
        );

        console.log('Admin transferred:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to transfer admin';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Format balance to MAS
   */
  const formatBalance = useCallback((nanoMas: bigint): string => {
    const mas = Number(nanoMas) / 1e9;
    return `${mas.toFixed(4)} MAS`;
  }, []);

  /**
   * Convert MAS to nanoMAS
   */
  const toNanoMas = useCallback((mas: number): bigint => {
    return BigInt(Math.floor(mas * 1e9));
  }, []);

  /**
   * Convert nanoMAS to MAS
   */
  const fromNanoMas = useCallback((nanoMas: bigint): number => {
    return Number(nanoMas) / 1e9;
  }, []);

  return {
    getTreasuryBalance,
    getFeeInfo,
    getAdmin,
    isPaused,
    withdrawTreasury,
    pauseContract,
    unpauseContract,
    transferAdmin,
    formatBalance,
    toNanoMas,
    fromNanoMas,
    loading,
    error,
    isConnected,
  };
}
