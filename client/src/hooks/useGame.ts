/**
 * Fighter Game Contract Hook
 * Manages game interactions (characters, battles, equipment)
 */

import { useState, useCallback } from 'react';
import { Args, SmartContract } from '@massalabs/massa-web3';
import { CONTRACT_ADDRESS, readContract, callContract } from '../lib/massa-client';
import { MassaCharacter, Battle, Equipment, CharacterClass, Stance } from '../types/massa-character';

export function useGame(
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new character
   */
  const createCharacter = useCallback(
    async (id: string, characterClass: CharacterClass, name: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(id).addU8(characterClass).addString(name);
        const op = await contract.call('game_createCharacter', args, { coins: 600000000n, maxGas: 100000000n });

        console.log('Character created successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create character';
        setError(message);
        console.error('Create character error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Read character data
   */
  const readCharacter = useCallback(
    async (id: string): Promise<MassaCharacter | null> => {
      try {
        if (!id) return null;

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(id);
        const result = await contract.read('game_readCharacter', args);

        if (result && result.value) {
          const charArgs = new Args(result.value);
          return {
            id: charArgs.nextString(),
            owner: charArgs.nextString(),
            name: charArgs.nextString(),
            characterClass: charArgs.nextU8(),
            level: charArgs.nextU8(),
            xp: charArgs.nextU64(),
            hp: charArgs.nextU16(),
            maxHp: charArgs.nextU16(),
            damageMin: charArgs.nextU8(),
            damageMax: charArgs.nextU8(),
            critChance: charArgs.nextU8(),
            dodgeChance: charArgs.nextU8(),
            defense: charArgs.nextU8(),
            weaponId: charArgs.nextString(),
            armorId: charArgs.nextString(),
            accessoryId: charArgs.nextString(),
            skillSlot1: charArgs.nextU8(),
            skillSlot2: charArgs.nextU8(),
            skillSlot3: charArgs.nextU8(),
            learnedSkills: charArgs.nextU16(),
            totalWins: charArgs.nextU32(),
            totalLosses: charArgs.nextU32(),
            mmr: charArgs.nextU64(),
            winStreak: charArgs.nextU8(),
            createdAt: charArgs.nextU64()
          };
        }

        return null;
      } catch (err) {
        console.error('Error reading character:', err);
        return null;
      }
    },
    [provider]
  );



  /**
   * Create a battle
   */
  const createBattle = useCallback(
    async (battleId: string, char1Id: string, char2Id: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(battleId).addString(char1Id).addString(char2Id);
        const op = await contract.call('game_createBattle', args, { coins: 1100000000n, maxGas: 150000000n });

        console.log('Battle created successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create battle';
        setError(message);
        console.error('Create battle error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Execute a turn in battle
   */
  const executeTurn = useCallback(
    async (
      battleId: string,
      attackerCharId: string,
      stance: Stance,
      useSpecial: boolean,
      skillSlot: number
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const args = new Args()
          .addString(battleId)
          .addString(attackerCharId)
          .addU8(stance)
          .addBool(useSpecial)
          .addU8(skillSlot);

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const op = await contract.call('game_executeTurn', args, { maxGas: 200000000n });

        console.log('Turn executed successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to execute turn';
        setError(message);
        console.error('Execute turn error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Read battle data
   */
  const readBattle = useCallback(
    async (id: string): Promise<Battle | null> => {
      try {
        if (!id) return null;

        const args = new Args().addString(id);
        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const result = await contract.read('game_readBattle', args);

        if (result && result.value) {
          // Parse battle data - simplified version
          console.log(result);
          const battleArgs = new Args(result.value);
          
          return {
            id: battleArgs.nextString(),
            player1: {
              characterId: battleArgs.nextString(),
              currentHp: battleArgs.nextU16(),
              maxHp: battleArgs.nextU16(),
              energy: battleArgs.nextU8(),
              statusEffects: battleArgs.nextU8(),
              poisonTurns: 0,
              stunTurns: 0,
              shieldTurns: 0,
              rageTurns: 0,
              burnTurns: 0,
              comboCount: 0,
              guaranteedCrit: false,
              dodgeBoost: 0,
              dodgeBoostTurns: 0,
              cooldown1: 0,
              cooldown2: 0,
              cooldown3: 0,
              cooldown4: 0,
              cooldown5: 0,
              cooldown6: 0,
              cooldown7: 0,
              cooldown8: 0,
              cooldown9: 0,
              cooldown10: 0
            },
            player2: {
              characterId: '',
              currentHp: 0,
              maxHp: 0,
              energy: 100,
              statusEffects: 0,
              poisonTurns: 0,
              stunTurns: 0,
              shieldTurns: 0,
              rageTurns: 0,
              burnTurns: 0,
              comboCount: 0,
              guaranteedCrit: false,
              dodgeBoost: 0,
              dodgeBoostTurns: 0,
              cooldown1: 0,
              cooldown2: 0,
              cooldown3: 0,
              cooldown4: 0,
              cooldown5: 0,
              cooldown6: 0,
              cooldown7: 0,
              cooldown8: 0,
              cooldown9: 0,
              cooldown10: 0
            },
            currentTurn: 1,
            turnNumber: 0,
            state: 0,
            winnerId: '',
            startTimestamp: 0,
            lastActionTimestamp: 0,
            wildcardActive: false,
            wildcardType: 0,
            wildcardDeadline: 0,
            player1WildcardDecision: 255,
            player2WildcardDecision: 255,
            randomSeed: 0
          };
        }

        return null;
      } catch (err) {
        console.error('Error reading battle:', err);
        return null;
      }
    },
    [provider]
  );

  /**
   * Heal character
   */
  const healCharacter = useCallback(
    async (charId: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(charId);
        const op = await contract.call('game_healCharacter', args, { maxGas: 100000000n });

        console.log('Character healed successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to heal character';
        setError(message);
        console.error('Heal character error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Upgrade character stat
   */
  const upgradeCharacter = useCallback(
    async (charId: string, upgradeType: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(charId).addU8(upgradeType);
        const op = await contract.call('game_upgradeCharacter', args, { coins: 50000000n, maxGas: 100000000n });

        console.log('Character upgraded successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upgrade character';
        setError(message);
        console.error('Upgrade character error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Learn a skill
   */
  const learnSkill = useCallback(
    async (characterId: string, skillId: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected. Please connect your wallet first.');
        }

        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const args = new Args().addString(characterId).addU8(skillId);
        const op = await contract.call('game_learnSkill', args, { coins: 300000000n, maxGas: 100000000n });

        console.log('Skill learned successfully:', op);
        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to learn skill';
        setError(message);
        console.error('Learn skill error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  /**
   * Get leaderboard
   */
  const getLeaderboard = useCallback(
    async (topN: number): Promise<any[]> => {
      try {
        const args = new Args().addU32(topN);
        const contract = new SmartContract(provider, CONTRACT_ADDRESS);
        const result = await contract.read('game_getLeaderboard', args);

        if (result && result.value) {
          // Parse leaderboard data
          return [];
        }

        return [];
      } catch (err) {
        console.error('Error getting leaderboard:', err);
        return [];
      }
    },
    [provider]
  );

  return {
    // Character functions
    createCharacter,
    readCharacter,
    healCharacter,
    upgradeCharacter,

    // Battle functions
    createBattle,
    executeTurn,
    readBattle,

    // Skill functions
    learnSkill,

    // Leaderboard
    getLeaderboard,

    // State
    loading,
    error,
    isConnected,
  };
}