/**
 * Leaderboard and Ranking Hook (FIXED - Binary Data Parsing)
 * Handles MMR, rankings, and leaderboard queries
 */

import { useState, useCallback } from 'react';
import { Args } from '@massalabs/massa-web3';
import { readContract } from './useContract';

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  ownerAddress: string;
  mmr: number;
  wins: number;
  losses: number;
}

export function useLeaderboard(contractAddress: string, provider: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get top N leaderboard entries (FIXED - Binary parsing)
   */
  const getLeaderboard = useCallback(
    async (count: number = 10): Promise<LeaderboardEntry[]> => {
      setLoading(true);
      setError(null);

      try {
        const args = new Args().addU32(Math.min(count, 100));
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_getLeaderboard',
          args
        );

        // Parse binary data using Args
        const resultArgs = new Args(resultBytes);

        // First, read the count of entries returned
        const entryCount = resultArgs.nextU32().unwrap();

        const entries: LeaderboardEntry[] = [];

        // Parse each LeaderboardEntry
        for (let i = 0; i < entryCount; i++) {
          const characterId = resultArgs.nextString().unwrap();
          const ownerAddress = resultArgs.nextString().unwrap();
          const mmr = resultArgs.nextU64().unwrap();
          const wins = resultArgs.nextU32().unwrap();
          const losses = resultArgs.nextU32().unwrap();

          entries.push({
            rank: i + 1, // Rank is position in array (1-indexed)
            characterId,
            ownerAddress,
            mmr: Number(mmr),
            wins: Number(wins),
            losses: Number(losses),
          });
        }

        return entries;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get leaderboard';
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, provider]
  );

  /**
   * Get character rank by character ID
   */
  const getCharacterRank = useCallback(
    async (characterId: string): Promise<number> => {
      try {
        const args = new Args().addString(characterId);
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_getCharacterRank',
          args
        );

        const resultArgs = new Args(resultBytes);
        return Number(resultArgs.nextU32().unwrap());
      } catch (err) {
        console.error('Failed to get character rank:', err);
        return 0;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Get MMR tier name
   */
  const getMmrTier = useCallback((mmr: number): string => {
    if (mmr >= 2400) return 'Grand Master';
    if (mmr >= 2200) return 'Master';
    if (mmr >= 2000) return 'Diamond';
    if (mmr >= 1800) return 'Platinum';
    if (mmr >= 1600) return 'Gold';
    if (mmr >= 1400) return 'Silver';
    return 'Bronze';
  }, []);

  /**
   * Get MMR tier color
   */
  const getMmrTierColor = useCallback((mmr: number): string => {
    if (mmr >= 2400) return '#FF6B35'; // Grand Master - Orange
    if (mmr >= 2200) return '#E63946'; // Master - Red
    if (mmr >= 2000) return '#B5179E'; // Diamond - Purple
    if (mmr >= 1800) return '#4CC9F0'; // Platinum - Cyan
    if (mmr >= 1600) return '#FFD700'; // Gold - Gold
    if (mmr >= 1400) return '#C0C0C0'; // Silver - Silver
    return '#CD7F32'; // Bronze - Bronze
  }, []);

  /**
   * Calculate win rate
   */
  const calculateWinRate = useCallback((wins: number, losses: number): number => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  }, []);

  /**
   * Get expected win probability (MMR-based)
   */
  const getExpectedWinProbability = useCallback(
    (playerMmr: number, opponentMmr: number): number => {
      const mmrDiff = opponentMmr - playerMmr;
      const probability = 1 / (1 + Math.pow(10, mmrDiff / 400));
      return Math.round(probability * 100);
    },
    []
  );

  /**
   * Calculate MMR change for a match
   */
  const calculateMmrChange = useCallback(
    (playerMmr: number, opponentMmr: number, won: boolean): number => {
      const K = 32; // K-factor
      const mmrDiff = opponentMmr - playerMmr;
      const expectedScore = 1 / (1 + Math.pow(10, mmrDiff / 400));
      const actualScore = won ? 1 : 0;
      return Math.round(K * (actualScore - expectedScore));
    },
    []
  );

  /**
   * Format MMR with tier badge
   */
  const formatMmrWithTier = useCallback(
    (mmr: number): string => {
      const tier = getMmrTier(mmr);
      return `${mmr} MMR (${tier})`;
    },
    [getMmrTier]
  );

  /**
   * Get leaderboard position suffix (1st, 2nd, 3rd, etc.)
   */
  const getRankSuffix = useCallback((rank: number): string => {
    if (rank === 0) return 'Unranked';
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return `${rank}st`;
    if (j === 2 && k !== 12) return `${rank}nd`;
    if (j === 3 && k !== 13) return `${rank}rd`;
    return `${rank}th`;
  }, []);

  return {
    getLeaderboard,
    getCharacterRank,
    getMmrTier,
    getMmrTierColor,
    calculateWinRate,
    getExpectedWinProbability,
    calculateMmrChange,
    formatMmrWithTier,
    getRankSuffix,
    loading,
    error,
  };
}
