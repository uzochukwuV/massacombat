/**
 * Battle Management Hook (FIXED - Binary Data Parsing)
 * Handles battle creation, turn execution, and battle state
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract } from './useContract';

export interface BattlePlayer {
  characterId: string;
  hp: bigint;
  maxHp: bigint;
  energy: bigint;
  damageMin: bigint;
  damageMax: bigint;
  dodge: bigint;
  crit: bigint;
  combo: bigint;
  skillSlot1: bigint;
  skillSlot2: bigint;
  skillSlot3: bigint;
  skillCooldowns: bigint[];
  statusEffects: bigint;
  poisonTurns: bigint;
  stunTurns: bigint;
  shieldTurns: bigint;
  rageTurns: bigint;
  burnTurns: bigint;
}

export interface Battle {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  currentTurn: bigint;
  state: bigint;
  winner: string;
  wildcard: bigint;
  wildcardDeadline: bigint;
  player1WildcardDecision: bigint;
  player2WildcardDecision: bigint;
  battleLog: string;
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
          Mas.fromString('0.5'),
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
   * Read battle state (FIXED - Binary parsing)
   */
  const readBattle = useCallback(
    async (battleId: string): Promise<Battle | null> => {
      try {
        const args = new Args().addString(battleId);
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_readBattle',
          args
        );

        // Parse binary data using Args
        const resultArgs = new Args(resultBytes);

        // Helper function to parse BattlePlayer
        const parseBattlePlayer = (args: Args): BattlePlayer => {
          const characterId = args.nextString().unwrap();
          const hp = args.nextU16().unwrap();
          const maxHp = args.nextU16().unwrap();
          const energy = args.nextU8().unwrap();
          const damageMin = args.nextU8().unwrap();
          const damageMax = args.nextU8().unwrap();
          const dodge = args.nextU8().unwrap();
          const crit = args.nextU8().unwrap();
          const combo = args.nextU8().unwrap();
          const skillSlot1 = args.nextU8().unwrap();
          const skillSlot2 = args.nextU8().unwrap();
          const skillSlot3 = args.nextU8().unwrap();

          // Parse skill cooldowns array (10 skills)
          const skillCooldowns: bigint[] = [];
          for (let i = 0; i < 10; i++) {
            skillCooldowns.push(args.nextU8().unwrap());
          }

          const statusEffects = args.nextU8().unwrap();
          const poisonTurns = args.nextU8().unwrap();
          const stunTurns = args.nextU8().unwrap();
          const shieldTurns = args.nextU8().unwrap();
          const rageTurns = args.nextU8().unwrap();
          const burnTurns = args.nextU8().unwrap();

          return {
            characterId,
            hp: BigInt(hp),
            maxHp: BigInt(maxHp),
            energy: BigInt(energy),
            damageMin: BigInt(damageMin),
            damageMax: BigInt(damageMax),
            dodge: BigInt(dodge),
            crit: BigInt(crit),
            combo: BigInt(combo),
            skillSlot1: BigInt(skillSlot1),
            skillSlot2: BigInt(skillSlot2),
            skillSlot3: BigInt(skillSlot3),
            skillCooldowns: skillCooldowns.map(c => BigInt(c)),
            statusEffects: BigInt(statusEffects),
            poisonTurns: BigInt(poisonTurns),
            stunTurns: BigInt(stunTurns),
            shieldTurns: BigInt(shieldTurns),
            rageTurns: BigInt(rageTurns),
            burnTurns: BigInt(burnTurns),
          };
        };

        // Parse Battle
        const id = resultArgs.nextString().unwrap();
        const player1 = parseBattlePlayer(resultArgs);
        const player2 = parseBattlePlayer(resultArgs);
        const currentTurn = resultArgs.nextU32().unwrap();
        const state = resultArgs.nextU8().unwrap();
        const winner = resultArgs.nextString().unwrap();
        const wildcard = resultArgs.nextU8().unwrap();
        const wildcardDeadline = resultArgs.nextU64().unwrap();
        const player1WildcardDecision = resultArgs.nextU8().unwrap();
        const player2WildcardDecision = resultArgs.nextU8().unwrap();
        const battleLog = resultArgs.nextString().unwrap();

        return {
          id,
          player1,
          player2,
          currentTurn: BigInt(currentTurn),
          state: BigInt(state),
          winner,
          wildcard: BigInt(wildcard),
          wildcardDeadline: BigInt(wildcardDeadline),
          player1WildcardDecision: BigInt(player1WildcardDecision),
          player2WildcardDecision: BigInt(player2WildcardDecision),
          battleLog,
        };
      } catch (err) {
        console.error('Failed to read battle:', err);
        return null;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Execute a battle turn
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
          BigInt(400_000_000)
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
   */
  const isBattleActive = useCallback(
    async (battleId: string): Promise<boolean> => {
      try {
        const args = new Args().addString(battleId);
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_isBattleActive',
          args
        );

        const resultArgs = new Args(resultBytes);
        return resultArgs.nextBool().unwrap();
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
  const getStateName = useCallback((state: bigint): string => {
    const states = ['Pending', 'Active', 'Wildcard', 'Completed'];
    return states[Number(state)] || 'Unknown';
  }, []);

  /**
   * Get stance name
   */
  const getStanceName = useCallback((stance: number): string => {
    const stances = ['Defensive', 'Normal', 'Aggressive'];
    return stances[stance] || 'Unknown';
  }, []);

  /**
   * Check if player has status effect (FIXED - bigint bitwise operations)
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
