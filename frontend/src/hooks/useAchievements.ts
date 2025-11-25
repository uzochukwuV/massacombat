/**
<<<<<<< HEAD
 * Achievements Hook (FIXED - Binary Data Parsing)
=======
 * Achievements Hook
>>>>>>> main
 * Handles achievement tracking and querying
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract } from './useContract';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface AchievementTracker {
  ownerAddress: string;
  unlockedAchievements: number; // Bitmask
  achievements: Achievement[];
}

const ACHIEVEMENT_DATA: Achievement[] = [
  {
    id: 0,
    name: 'First Blood',
    description: 'Win your first battle',
    icon: '⚔️',
  },
  {
    id: 1,
    name: 'Champion',
    description: 'Win 100 battles',
    icon: '🏆',
  },
  {
    id: 2,
    name: 'Legendary Collector',
    description: 'Own a Legendary equipment',
    icon: '💎',
  },
  {
    id: 3,
    name: 'Tournament Victor',
    description: 'Win a tournament',
    icon: '👑',
  },
  {
    id: 4,
    name: 'Master of Skills',
    description: 'Learn all 10 skills',
    icon: '📚',
  },
  {
    id: 5,
    name: 'Max Level',
    description: 'Reach level 50',
    icon: '⭐',
  },
  {
    id: 6,
    name: 'Combo King',
    description: 'Achieve 5 combo streak',
    icon: '🔥',
  },
  {
    id: 7,
    name: 'Perfect Victory',
    description: 'Win without taking damage',
    icon: '✨',
  },
  {
    id: 8,
    name: 'Comeback King',
    description: 'Win with less than 10% HP',
    icon: '💪',
  },
  {
    id: 9,
    name: 'Unstoppable',
    description: 'Win 10 battles in a row',
    icon: '🚀',
  },
];

export function useAchievements(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
<<<<<<< HEAD
   * Check if achievement is unlocked
=======
   * Get achievements for an address
   * @param address - Owner address
   */
  const getAchievements = useCallback(
    async (address: string): Promise<AchievementTracker | null> => {
      setLoading(true);
      setError(null);

      try {
        const args = new Args().addString(address);
        const result = await readContract(
          provider,
          contractAddress,
          'game_getAchievements',
          args
        );

        if (!result || !result.value || result.value.length === 0) {
          return null;
        }

        const resultArgs = new Args(result.value);

        // Parse achievement data (binary format from contract)
        const tracker: AchievementTracker = {
          ownerAddress: resultArgs.nextString(),
          unlockedAchievements: Number(resultArgs.nextU16()),
          achievements: [],
        };

        // Get unlocked achievements from bitmask
        tracker.achievements = getUnlockedAchievements(tracker.unlockedAchievements);

        return tracker;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get achievements';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [ loading]
  );

  /**
   * Check if achievement is unlocked
   * @param achievements - Achievement bitmask
   * @param achievementId - Achievement ID (0-9)
>>>>>>> main
   */
  const hasAchievement = useCallback(
    (achievements: number, achievementId: number): boolean => {
      const bit = 1 << achievementId;
      return (achievements & bit) !== 0;
    },
    []
  );

  /**
   * Get all unlocked achievements
<<<<<<< HEAD
=======
   * @param achievements - Achievement bitmask
>>>>>>> main
   */
  const getUnlockedAchievements = useCallback(
    (achievements: number): Achievement[] => {
      const unlocked: Achievement[] = [];
      for (let i = 0; i < 10; i++) {
        if (hasAchievement(achievements, i)) {
          unlocked.push(ACHIEVEMENT_DATA[i]);
        }
      }
      return unlocked;
    },
    [hasAchievement]
  );

  /**
<<<<<<< HEAD
   * Get achievements for an address (FIXED - Binary parsing)
   */
  const getAchievements = useCallback(
    async (address: string): Promise<AchievementTracker | null> => {
      setLoading(true);
      setError(null);

      try {
        const args = new Args().addString(address);
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_getAchievements',
          args
        );

        // Parse binary data using Args
        const resultArgs = new Args(resultBytes);

        const ownerAddress = resultArgs.nextString().unwrap();
        const unlockedAchievements = Number(resultArgs.nextU16().unwrap());

        // Use helper to extract unlocked achievements from bitmask
        const achievements = getUnlockedAchievements(unlockedAchievements);

        return {
          ownerAddress,
          unlockedAchievements,
          achievements,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get achievements';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, provider, getUnlockedAchievements]
  );

  /**
   * Get all locked achievements
=======
   * Get all locked achievements
   * @param achievements - Achievement bitmask
>>>>>>> main
   */
  const getLockedAchievements = useCallback(
    (achievements: number): Achievement[] => {
      const locked: Achievement[] = [];
      for (let i = 0; i < 10; i++) {
        if (!hasAchievement(achievements, i)) {
          locked.push(ACHIEVEMENT_DATA[i]);
        }
      }
      return locked;
    },
    [hasAchievement]
  );

  /**
   * Get achievement by ID
   */
  const getAchievementById = useCallback((id: number): Achievement | null => {
    return ACHIEVEMENT_DATA[id] || null;
  }, []);

  /**
   * Get all achievements
   */
  const getAllAchievements = useCallback((): Achievement[] => {
    return ACHIEVEMENT_DATA;
  }, []);

  /**
   * Calculate achievement completion percentage
   */
  const getCompletionPercentage = useCallback(
    (achievements: number): number => {
      const unlocked = getUnlockedAchievements(achievements).length;
      return Math.round((unlocked / ACHIEVEMENT_DATA.length) * 100);
    },
    [getUnlockedAchievements]
  );

  /**
   * Get next achievement to unlock
   */
  const getNextAchievement = useCallback(
    (achievements: number): Achievement | null => {
      const locked = getLockedAchievements(achievements);
      return locked.length > 0 ? locked[0] : null;
    },
    [getLockedAchievements]
  );

  /**
   * Check achievements for all owned characters (admin/update function)
<<<<<<< HEAD
=======
   * @param ownerAddress - Owner address
>>>>>>> main
   */
  const checkAchievements = useCallback(
    async (ownerAddress: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(ownerAddress);

        const op = await callContract(
          provider,
          contractAddress,
          'game_checkAchievements',
          args,
          Mas.fromString('0.2'),
          BigInt(150_000_000)
        );

        console.log('Achievements checked:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to check achievements';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  return {
    getAchievements,
    hasAchievement,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementById,
    getAllAchievements,
    getCompletionPercentage,
    getNextAchievement,
    checkAchievements,
    loading,
    error,
    isConnected,
  };
}
