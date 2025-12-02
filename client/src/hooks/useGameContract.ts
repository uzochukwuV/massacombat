/**
 * Fighter Game Contract Hook
 * Manages all game contract interactions
 */

import { useState, useCallback } from 'react';
import { Args } from '@massalabs/massa-web3';
import { callContract, readContract, CONTRACT_ADDRESS } from '../lib/massa-client';
import { 
  MassaCharacter, 
  Equipment, 
  Battle, 
  CharacterClass,
  Stance 
} from '../types/massa-character';

export function useGameContract(
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Character Functions
  // ============================================================================

  const createCharacter = useCallback(
    async (id: string, characterClass: CharacterClass, name: string): Promise<string | null> => {
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
          CONTRACT_ADDRESS, 
          'game_createCharacter', 
          args,
          100000000n // CHARACTER_CREATION_FEE
        );

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  const readCharacter = useCallback(
    async (id: string): Promise<MassaCharacter | null> => {
      try {
        const args = new Args().addString(id);
        const result = await readContract(provider, CONTRACT_ADDRESS, 'game_readCharacter', args);
        
        if (result && result.length > 0) {
          // Parse character data from result
          const resultArgs = new Args(result);
          return {
            id: resultArgs.nextString(),
            owner: resultArgs.nextString(),
            name: resultArgs.nextString(),
            characterClass: resultArgs.nextU8(),
            level: resultArgs.nextU8(),
            xp: resultArgs.nextU64(),
            hp: resultArgs.nextU16(),
            maxHp: resultArgs.nextU16(),
            damageMin: resultArgs.nextU8(),
            damageMax: resultArgs.nextU8(),
            critChance: resultArgs.nextU8(),
            dodgeChance: resultArgs.nextU8(),
            defense: resultArgs.nextU8(),
            weaponId: resultArgs.nextString(),
            armorId: resultArgs.nextString(),
            accessoryId: resultArgs.nextString(),
            skillSlot1: resultArgs.nextU8(),
            skillSlot2: resultArgs.nextU8(),
            skillSlot3: resultArgs.nextU8(),
            learnedSkills: resultArgs.nextU16(),
            totalWins: resultArgs.nextU32(),
            totalLosses: resultArgs.nextU32(),
            mmr: resultArgs.nextU64(),
            winStreak: resultArgs.nextU8(),
            createdAt: resultArgs.nextU64()
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

  const healCharacter = useCallback(
    async (charId: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(charId);
        const op = await callContract(provider, CONTRACT_ADDRESS, 'game_healCharacter', args);

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to heal character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  const upgradeCharacter = useCallback(
    async (charId: string, upgradeType: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(charId)
          .addU8(upgradeType);

        const op = await callContract(
          provider, 
          CONTRACT_ADDRESS, 
          'game_upgradeCharacter', 
          args,
          50000000n // upgrade fee
        );

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upgrade character';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  // ============================================================================
  // Equipment Functions
  // ============================================================================

  const equipItem = useCallback(
    async (charId: string, equipmentId: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(charId)
          .addString(equipmentId);

        const op = await callContract(provider, CONTRACT_ADDRESS, 'game_equipItem', args);

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to equip item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  const unequipItem = useCallback(
    async (charId: string, equipmentId: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(charId)
          .addString(equipmentId);

        const op = await callContract(provider, CONTRACT_ADDRESS, 'game_unequipItem', args);

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unequip item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  // ============================================================================
  // Battle Functions
  // ============================================================================

  const createBattle = useCallback(
    async (battleId: string, char1Id: string, char2Id: string): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(battleId)
          .addString(char1Id)
          .addString(char2Id);

        const op = await callContract(
          provider, 
          CONTRACT_ADDRESS, 
          'game_createBattle', 
          args,
          50000000n // battle fee
        );

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create battle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

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
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(battleId)
          .addString(attackerCharId)
          .addU8(stance)
          .addBool(useSpecial)
          .addU8(skillSlot);

        const op = await callContract(provider, CONTRACT_ADDRESS, 'game_executeTurn', args);

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to execute turn';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  const readBattle = useCallback(
    async (id: string): Promise<Battle | null> => {
      try {
        const args = new Args().addString(id);
        const result = await readContract(provider, CONTRACT_ADDRESS, 'game_readBattle', args);
        
        if (result && result.length > 0) {
          // Parse battle data - this is a simplified version
          // You'll need to implement full deserialization based on the contract's serialization
          return {
            id,
            player1: {
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

  // ============================================================================
  // Skill Functions
  // ============================================================================

  const learnSkill = useCallback(
    async (characterId: string, skillId: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(characterId)
          .addU8(skillId);

        const op = await callContract(
          provider, 
          CONTRACT_ADDRESS, 
          'game_learnSkill', 
          args,
          25000000n // skill learning fee
        );

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to learn skill';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  const equipSkill = useCallback(
    async (characterId: string, skillId: number, slot: number): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(characterId)
          .addU8(skillId)
          .addU8(slot);

        const op = await callContract(provider, CONTRACT_ADDRESS, 'game_equipSkill', args);

        return op.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to equip skill';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, userAddress, provider]
  );

  return {
    // Character functions
    createCharacter,
    readCharacter,
    healCharacter,
    upgradeCharacter,

    // Equipment functions
    equipItem,
    unequipItem,

    // Battle functions
    createBattle,
    executeTurn,
    readBattle,

    // Skill functions
    learnSkill,
    equipSkill,

    // State
    loading,
    error,
    isConnected,
  };
}