/**
 * Tournament Management Hook
 * Handles tournament creation, registration, and match management
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract } from './useContract';

export interface Tournament {
  id: string;
  name: string;
  creator: string;
  entryFee: bigint;
  prizePool: bigint;
  maxParticipants: number;
  participants: string[];
  state: number;
  currentRound: number;
  bracket: string[];
  winner: string;
}

export function useTournament(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new tournament
   * @param tournamentId - Unique tournament ID
   * @param name - Tournament name
   * @param entryFee - Entry fee in nanoMAS
   * @param maxParticipants - Maximum participants (must be power of 2)
   */
  const createTournament = useCallback(
    async (
      tournamentId: string,
      name: string,
      entryFee: bigint,
      maxParticipants: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        // Validate max participants is power of 2
        if (
          maxParticipants < 2 ||
          (maxParticipants & (maxParticipants - 1)) !== 0
        ) {
          throw new Error('Max participants must be a power of 2 (2, 4, 8, 16, 32)');
        }

        const args = new Args()
          .addString(tournamentId)
          .addString(name)
          .addU64(entryFee)
          .addU8(maxParticipants);

        const op = await callContract(
          provider,
          contractAddress,
          'game_createTournament',
          args,
          Mas.fromString('1.0'), // Tournament creation fee
          BigInt(100_000_000)
        );

        console.log('Tournament created:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create tournament';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Register for a tournament
   * @param tournamentId - Tournament ID
   * @param characterId - Character ID
   */
  const registerTournament = useCallback(
    async (tournamentId: string, characterId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(tournamentId).addString(characterId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_registerTournament',
          args,
          Mas.fromString('0.5'), // Will include entry fee
          BigInt(100_000_000)
        );

        console.log('Registered for tournament:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to register for tournament';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Start a tournament (admin only)
   * @param tournamentId - Tournament ID
   */
  const startTournament = useCallback(
    async (tournamentId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(tournamentId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_startTournament',
          args,
          Mas.fromString('0.1'),
          BigInt(150_000_000)
        );

        console.log('Tournament started:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to start tournament';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Record a tournament match result
   * @param tournamentId - Tournament ID
   * @param matchIndex - Match index in current round
   * @param winnerId - Winner character ID
   */
  const recordTournamentMatch = useCallback(
    async (tournamentId: string, matchIndex: number, winnerId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args()
          .addString(tournamentId)
          .addU8(matchIndex)
          .addString(winnerId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_recordTournamentMatch',
          args,
          Mas.fromString('0.2'),
          BigInt(150_000_000)
        );

        console.log('Tournament match recorded:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to record tournament match';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Finalize a completed tournament
   * @param tournamentId - Tournament ID
   */
  const finalizeTournament = useCallback(
    async (tournamentId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected || !userAddress) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(tournamentId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_finalizeTournament',
          args,
          Mas.fromString('0.2'),
          BigInt(200_000_000)
        );

        console.log('Tournament finalized:', op.id);
        return op;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to finalize tournament';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider, userAddress]
  );

  /**
   * Read tournament state
   * @param tournamentId - Tournament ID
   */
  const readTournament = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      try {
        const args = new Args().addString(tournamentId);
        const result = await readContract(
          provider,
          contractAddress,
          'game_readTournament',
          args
        );

        const resultArgs = new Args(result.value);
        const tournamentData = resultArgs.nextString();

        if (!tournamentData || tournamentData === 'Tournament not found') {
          return null;
        }

        // Parse tournament data
        const tournament = JSON.parse(tournamentData) as Tournament;
        return tournament;
      } catch (err) {
        console.error('Failed to read tournament:', err);
        return null;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Get tournament state name
   */
  const getStateName = useCallback((state: number): string => {
    const states = ['Registration', 'Active', 'Finished', 'Cancelled'];
    return states[state] || 'Unknown';
  }, []);

  /**
   * Calculate prizes for tournament
   */
  const calculatePrizes = useCallback((prizePool: bigint) => {
    const winner = (prizePool * BigInt(50)) / BigInt(100); // 50%
    const runnerUp = (prizePool * BigInt(30)) / BigInt(100); // 30%
    const third = (prizePool * BigInt(20)) / BigInt(100); // 20%

    return {
      winner,
      runnerUp,
      third,
    };
  }, []);

  /**
   * Check if tournament is full
   */
  const isTournamentFull = useCallback((tournament: Tournament): boolean => {
    return tournament.participants.length >= tournament.maxParticipants;
  }, []);

  /**
   * Get current round name
   */
  const getRoundName = useCallback((round: number, maxParticipants: number): string => {
    const totalRounds = Math.log2(maxParticipants);
    if (round === totalRounds) return 'Finals';
    if (round === totalRounds - 1) return 'Semi-Finals';
    if (round === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${round + 1}`;
  }, []);

  return {
    createTournament,
    registerTournament,
    startTournament,
    recordTournamentMatch,
    finalizeTournament,
    readTournament,
    getStateName,
    calculatePrizes,
    isTournamentFull,
    getRoundName,
    loading,
    error,
    isConnected,
  };
}
