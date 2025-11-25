/**
 * Character Management Hook
 * Handles character creation, reading, upgrades, and healing
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract, CLASS_NAMES } from './useContract';

export interface Character {
  id: string;
  owner: string;
  name: string;
  characterClass: number;
  level: number;
  xp: bigint;
  hp: number;
  maxHp: number;
  damageMin: number;
  damageMax: number;
  critChance: number;
  dodgeChance: number;
  defense: number;
  weaponId: string;
  armorId: string;
  accessoryId: string;
  skillSlot1: number;
  skillSlot2: number;
  skillSlot3: number;
  learnedSkills: number;
  totalWins: number;
  totalLosses: number;
  mmr: bigint;
  winStreak: number;
  createdAt: bigint;
}

export function useCharacter(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new character
   * @param id - Unique character ID
   * @param characterClass - Class (0-4): Warrior, Assassin, Mage, Tank, Trickster
   * @param name - Character name
   */
  const createCharacter = useCallback(
    async (id: string, characterClass: number, name: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(id)
          .addU8(characterClass)
          .addString(name);

        const op = await callContract(
          provider,
          contractAddress,
          'game_createCharacter',
          args,
          Mas.fromString('0.6'), // Character creation fee
          BigInt(100_000_000)
        );

        console.log('Character created:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Read character data
   * @param id - Character ID
   */
  const readCharacter = useCallback(
    async (id: string): Promise<Character | null> => {
      try {
        const args = new Args().addString(id);
        const result = await readContract(provider, contractAddress, 'game_readCharacter', args);

        if (!result || result.length === 0) {
          return null;
        }

        const charArgs = new Args(result);
        const character: Character = {
          id: charArgs.nextString().unwrap(),
          owner: charArgs.nextString().unwrap(),
          name: charArgs.nextString().unwrap(),
          characterClass: charArgs.nextU8().unwrap(),
          level: charArgs.nextU8().unwrap(),
          xp: charArgs.nextU64().unwrap(),
          hp: charArgs.nextU16().unwrap(),
          maxHp: charArgs.nextU16().unwrap(),
          damageMin: charArgs.nextU8().unwrap(),
          damageMax: charArgs.nextU8().unwrap(),
          critChance: charArgs.nextU8().unwrap(),
          dodgeChance: charArgs.nextU8().unwrap(),
          defense: charArgs.nextU8().unwrap(),
          weaponId: charArgs.nextString().unwrap(),
          armorId: charArgs.nextString().unwrap(),
          accessoryId: charArgs.nextString().unwrap(),
          skillSlot1: charArgs.nextU8().unwrap(),
          skillSlot2: charArgs.nextU8().unwrap(),
          skillSlot3: charArgs.nextU8().unwrap(),
          learnedSkills: charArgs.nextU16().unwrap(),
          totalWins: charArgs.nextU32().unwrap(),
          totalLosses: charArgs.nextU32().unwrap(),
          mmr: charArgs.nextU64().unwrap(),
          winStreak: charArgs.nextU8().unwrap(),
          createdAt: charArgs.nextU64().unwrap(),
        };

        return character;
      } catch (err) {
        console.error('Error reading character:', err);
        return null;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Heal character to full HP
   * @param charId - Character ID
   */
  const healCharacter = useCallback(
    async (charId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(charId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_healCharacter',
          args,
          Mas.fromString('0.1'),
          BigInt(50_000_000)
        );

        console.log('Character healed:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to heal character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Upgrade character stat
   * @param charId - Character ID
   * @param upgradeType - 0: HP, 1: Damage, 2: Crit, 3: Dodge, 4: Defense
   */
  const upgradeCharacter = useCallback(
    async (charId: string, upgradeType: number) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(charId).addU8(upgradeType);

        const op = await callContract(
          provider,
          contractAddress,
          'game_upgradeCharacter',
          args,
          Mas.fromString('0.4'), // Upgrade fee
          BigInt(100_000_000)
        );

        console.log('Character upgraded:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upgrade character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Get character's class name
   */
  const getClassName = useCallback((classId: number): string => {
    return CLASS_NAMES[classId] || 'Unknown';
  }, []);

  /**
   * Calculate win rate
   */
  const getWinRate = useCallback((character: Character): number => {
    const total = character.totalWins + character.totalLosses;
    if (total === 0) return 0;
    return Math.round((character.totalWins / total) * 100);
  }, []);

  return {
    createCharacter,
    readCharacter,
    healCharacter,
    upgradeCharacter,
    getClassName,
    getWinRate,
    loading,
    error,
    isConnected,
  };
}
