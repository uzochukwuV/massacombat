/**
 * Battle Management Hook
 * Handles battle creation, turn execution, and battle state
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract } from './useContract';

export interface BattlePlayer {
  characterId: string;
  currentHp: bigint;
  maxHp: bigint;
  energy: bigint;
  statusEffects: bigint;
  poisonTurns: bigint;
  stunTurns: bigint;
  shieldTurns: bigint;
  rageTurns: bigint;
  burnTurns: bigint;
  comboCount: bigint;
  guaranteedCrit: boolean;
  dodgeBoost: bigint;
  dodgeBoostTurns: bigint;
  cooldown1: bigint;
  cooldown2: bigint;
  cooldown3: bigint;
  cooldown4: bigint;
  cooldown5: bigint;
  cooldown6: bigint;
  cooldown7: bigint;
  cooldown8: bigint;
  cooldown9: bigint;
  cooldown10: bigint;
}

export interface Battle {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  currentTurn: bigint;
  turnNumber: bigint;
  state: bigint;
  winnerId: string;
  startTimestamp: bigint;
  lastActionTimestamp: bigint;
  wildcardActive: boolean;
  wildcardType: bigint;
  wildcardDeadline: bigint;
  player1WildcardDecision: bigint;
  player2WildcardDecision: bigint;
  randomSeed: bigint;
}

export interface BattleResult {
  battleId: string;
  winner: string;
  turns: number;
  finalState: string;
}

export function useBattle(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new battle
   * @param battleId - Unique battle ID
   * @param character1Id - First character ID
   * @param character2Id - Second character ID
   */
  const createBattle = useCallback(
    async (battleId: string, character1Id: string, character2Id: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(battleId)
          .addString(character1Id)
          .addString(character2Id);

        const op = await callContract(
          provider,
          contractAddress,
          'game_createBattle',
          args,
          Mas.fromString('0.5'), // Battle creation fee
          BigInt(200_000_000)
        );

        console.log('Battle created:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create battle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Read battle state
   * @param battleId - Battle ID
   */
  const readBattle = useCallback(
    async (battleId: string): Promise<Battle | null> => {
      try {
        const args = new Args().addString(battleId);
        const result = await readContract(
          provider,
          contractAddress,
          'game_readBattle',
          args
        );

        if (!result || !result.value || result.value.length === 0) {
          return null;
        }

        const battleArgs = new Args(result.value);

        // Parse battle data (binary format from contract)
        const battle: Battle = {
          id: battleArgs.nextString(),
          player1: {
            characterId: battleArgs.nextString(),
            currentHp: battleArgs.nextU16(),
            maxHp: battleArgs.nextU16(),
            energy: battleArgs.nextU8(),
            statusEffects: battleArgs.nextU8(),
            poisonTurns: battleArgs.nextU8(),
            stunTurns: battleArgs.nextU8(),
            shieldTurns: battleArgs.nextU8(),
            rageTurns: battleArgs.nextU8(),
            burnTurns: battleArgs.nextU8(),
            comboCount: battleArgs.nextU8(),
            guaranteedCrit: battleArgs.nextBool(),
            dodgeBoost: battleArgs.nextU8(),
            dodgeBoostTurns: battleArgs.nextU8(),
            cooldown1: battleArgs.nextU8(),
            cooldown2: battleArgs.nextU8(),
            cooldown3: battleArgs.nextU8(),
            cooldown4: battleArgs.nextU8(),
            cooldown5: battleArgs.nextU8(),
            cooldown6: battleArgs.nextU8(),
            cooldown7: battleArgs.nextU8(),
            cooldown8: battleArgs.nextU8(),
            cooldown9: battleArgs.nextU8(),
            cooldown10: battleArgs.nextU8(),
          },
          player2: {
            characterId: battleArgs.nextString(),
            currentHp: battleArgs.nextU16(),
            maxHp: battleArgs.nextU16(),
            energy: battleArgs.nextU8(),
            statusEffects: battleArgs.nextU8(),
            poisonTurns: battleArgs.nextU8(),
            stunTurns: battleArgs.nextU8(),
            shieldTurns: battleArgs.nextU8(),
            rageTurns: battleArgs.nextU8(),
            burnTurns: battleArgs.nextU8(),
            comboCount: battleArgs.nextU8(),
            guaranteedCrit: battleArgs.nextBool(),
            dodgeBoost: battleArgs.nextU8(),
            dodgeBoostTurns: battleArgs.nextU8(),
            cooldown1: battleArgs.nextU8(),
            cooldown2: battleArgs.nextU8(),
            cooldown3: battleArgs.nextU8(),
            cooldown4: battleArgs.nextU8(),
            cooldown5: battleArgs.nextU8(),
            cooldown6: battleArgs.nextU8(),
            cooldown7: battleArgs.nextU8(),
            cooldown8: battleArgs.nextU8(),
            cooldown9: battleArgs.nextU8(),
            cooldown10: battleArgs.nextU8(),
          },
          currentTurn: battleArgs.nextU8(),
          turnNumber: battleArgs.nextU32(),
          state: battleArgs.nextU8(),
          winnerId: battleArgs.nextString(),
          startTimestamp: battleArgs.nextU64(),
          lastActionTimestamp: battleArgs.nextU64(),
          wildcardActive: battleArgs.nextBool(),
          wildcardType: battleArgs.nextU8(),
          wildcardDeadline: battleArgs.nextU64(),
          player1WildcardDecision: battleArgs.nextU8(),
          player2WildcardDecision: battleArgs.nextU8(),
          randomSeed: battleArgs.nextU64(),
        };

        return battle;
      } catch (err) {
        console.error('Failed to read battle:', err);
        return null;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Execute a battle turn
   * @param battleId - Battle ID
   * @param attackerCharId - Attacking character ID
   * @param stance - Stance (0=Defensive, 1=Normal, 2=Aggressive)
   * @param useSpecial - Whether to use a special skill
   * @param skillSlot - Skill slot to use (1-3, 0 if not using skill)
   */
  const executeTurn = useCallback(
    async (
      battleId: string,
      attackerCharId: string,
      stance: number,
      useSpecial: boolean,
      skillSlot: number
    ) => {
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

        const op = await callContract(
          provider,
          contractAddress,
          'game_executeTurn',
          args,
          Mas.fromString('0.2'),
          BigInt(400_000_000) // Higher gas for complex turn logic
        );

        console.log('Turn executed:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to execute turn';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Make a wildcard decision
   * @param battleId - Battle ID
   * @param accept - Accept (true) or reject (false) wildcard
   * @param playerCharId - Player's character ID
   */
  const decideWildcard = useCallback(
    async (battleId: string, accept: boolean, playerCharId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(battleId)
          .addBool(accept)
          .addString(playerCharId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_decideWildcard',
          args,
          Mas.fromString('0.1'),
          BigInt(100_000_000)
        );

        console.log('Wildcard decided:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to decide wildcard';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Finalize a completed battle
   * @param battleId - Battle ID
   */
  const finalizeBattle = useCallback(
    async (battleId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(battleId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_finalizeBattle',
          args,
          Mas.fromString('0.1'),
          BigInt(150_000_000)
        );

        console.log('Battle finalized:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to finalize battle';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Check if battle is active
   * @param battleId - Battle ID
   */
  const isBattleActive = useCallback(
    async (battleId: string): Promise<boolean> => {
      try {
        const args = new Args().addString(battleId);
        const result = await readContract(
          provider,
          contractAddress,
          'game_isBattleActive',
          args
        );

        const resultArgs = new Args(result.value);
        return resultArgs.nextBool();
      } catch (err) {
        console.error('Failed to check battle active:', err);
        return false;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Get battle state name
   */
  const getStateName = useCallback((state: number): string => {
    const states = ['Active', 'Wildcard', 'Finished', 'Cancelled'];
    return states[state] || 'Unknown';
  }, []);

  /**
   * Get stance name
   */
  const getStanceName = useCallback((stance: number): string => {
    const stances = ['Defensive', 'Normal', 'Aggressive'];
    return stances[stance] || 'Unknown';
  }, []);

  /**
   * Check if player has status effect
   */
  const hasStatus = useCallback((player: BattlePlayer, statusBit: number): boolean => {
    return (player.statusEffects & BigInt(1 << statusBit)) !== BigInt(0);
  }, []);

  /**
   * Get active status effects
   */
  const getActiveStatuses = useCallback((player: BattlePlayer): string[] => {
    const statuses: string[] = [];
    if (hasStatus(player, 0)) statuses.push('Poisoned');
    if (hasStatus(player, 1)) statuses.push('Stunned');
    if (hasStatus(player, 2)) statuses.push('Shielded');
    if (hasStatus(player, 3)) statuses.push('Enraged');
    if (hasStatus(player, 4)) statuses.push('Burning');
    return statuses;
  }, [hasStatus]);

  return {
    createBattle,
    readBattle,
    executeTurn,
    decideWildcard,
    finalizeBattle,
    isBattleActive,
    getStateName,
    getStanceName,
    hasStatus,
    getActiveStatuses,
    loading,
    error,
    isConnected,
  };
}
