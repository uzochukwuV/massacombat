/**
 * Tournament Management Hook (FIXED - Binary Data Parsing)
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
  maxParticipants: bigint;
  participants: string;  // Comma-separated character IDs
  state: bigint;
  currentRound: bigint;
  bracket: string;  // Comma-separated bracket data
  winner: string;
  runnerUpId: string;
  thirdPlaceId: string;
  createdAt: bigint;
  startedAt: bigint;
  endedAt: bigint;
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
          Mas.fromString('1.0'),
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
          Mas.fromString('0.5'),
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
   * Read tournament state (FIXED - Binary parsing)
   */
  const readTournament = useCallback(
    async (tournamentId: string): Promise<Tournament | null> => {
      try {
        const args = new Args().addString(tournamentId);
        const resultBytes = await readContract(
          provider,
          contractAddress,
          'game_readTournament',
          args
        );

        // Parse binary data using Args
        const resultArgs = new Args(resultBytes);

        const id = resultArgs.nextString().unwrap();
        const name = resultArgs.nextString().unwrap();
        const creator = resultArgs.nextString().unwrap();
        const entryFee = resultArgs.nextU64().unwrap();
        const prizePool = resultArgs.nextU64().unwrap();
        const maxParticipants = resultArgs.nextU8().unwrap();
        const participants = resultArgs.nextString().unwrap();  // Comma-separated
        const state = resultArgs.nextU8().unwrap();
        const currentRound = resultArgs.nextU8().unwrap();
        const bracket = resultArgs.nextString().unwrap();  // Comma-separated
        const winner = resultArgs.nextString().unwrap();
        const runnerUpId = resultArgs.nextString().unwrap();
        const thirdPlaceId = resultArgs.nextString().unwrap();
        const createdAt = resultArgs.nextU64().unwrap();
        const startedAt = resultArgs.nextU64().unwrap();
        const endedAt = resultArgs.nextU64().unwrap();

        return {
          id,
          name,
          creator,
          entryFee: BigInt(entryFee),
          prizePool: BigInt(prizePool),
          maxParticipants: BigInt(maxParticipants),
          participants,
          state: BigInt(state),
          currentRound: BigInt(currentRound),
          bracket,
          winner,
          runnerUpId,
          thirdPlaceId,
          createdAt: BigInt(createdAt),
          startedAt: BigInt(startedAt),
          endedAt: BigInt(endedAt),
        };
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
  const getStateName = useCallback((state: bigint): string => {
    const states = ['Registration', 'Active', 'Completed', 'Cancelled'];
    return states[Number(state)] || 'Unknown';
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
    const participantCount = tournament.participants
      ? tournament.participants.split(',').filter(p => p.length > 0).length
      : 0;
    return participantCount >= Number(tournament.maxParticipants);
  }, []);

  /**
   * Get current round name
   */
  const getRoundName = useCallback((round: bigint, maxParticipants: bigint): string => {
    const totalRounds = Math.log2(Number(maxParticipants));
    const roundNum = Number(round);
    if (roundNum === totalRounds) return 'Finals';
    if (roundNum === totalRounds - 1) return 'Semi-Finals';
    if (roundNum === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNum + 1}`;
  }, []);

  /**
   * Get participants array
   */
  const getParticipantsArray = useCallback((tournament: Tournament): string[] => {
    return tournament.participants
      ? tournament.participants.split(',').filter(p => p.length > 0)
      : [];
  }, []);

  /**
   * Get bracket array
   */
  const getBracketArray = useCallback((tournament: Tournament): string[] => {
    return tournament.bracket
      ? tournament.bracket.split(',').filter(b => b.length > 0)
      : [];
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
    getParticipantsArray,
    getBracketArray,
    loading,
    error,
    isConnected,
  };
}
