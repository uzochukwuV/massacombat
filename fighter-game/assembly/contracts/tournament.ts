/**
 * Tournament System Component
 * Handles tournament creation, registration, brackets, and prize distribution
 */

import { Context, generateEvent, transferCoins, Address } from '@massalabs/massa-as-sdk';
import {
  Tournament,
  TOURNAMENT_REGISTRATION,
  TOURNAMENT_ACTIVE,
  TOURNAMENT_COMPLETED,
} from './types';
import {
  saveTournament,
  loadTournament,
  tournamentExists,
  loadCharacter,
  isAdmin,
  addToTreasury,
} from './storage';

// ============================================================================
// Tournament Creation
// ============================================================================

/**
 * Create a new tournament (admin only)
 * @param tournamentId - Unique tournament ID
 * @param name - Tournament name
 * @param entryFee - Entry fee in nanoMAS
 * @param maxParticipants - Maximum participants (must be power of 2: 4, 8, 16, 32)
 */
export function createTournament(
  tournamentId: string,
  name: string,
  entryFee: u64,
  maxParticipants: u8
): Tournament {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can create tournaments');

  // Validate tournament doesn't exist
  assert(!tournamentExists(tournamentId), 'Tournament ID already exists');

  // Validate max participants is power of 2
  assert(
    maxParticipants == 4 ||
      maxParticipants == 8 ||
      maxParticipants == 16 ||
      maxParticipants == 32,
    'Max participants must be 4, 8, 16, or 32'
  );

  const tournament = new Tournament(tournamentId);
  tournament.name = name;
  tournament.entryFee = entryFee;
  tournament.maxParticipants = maxParticipants;
  tournament.state = TOURNAMENT_REGISTRATION;
  tournament.createdAt = Context.timestamp();

  saveTournament(tournament);

  generateEvent(
    `TOURNAMENT_CREATED:${tournamentId}:${name}:${entryFee.toString()}:${maxParticipants.toString()}`
  );

  return tournament;
}

// ============================================================================
// Registration
// ============================================================================

/**
 * Register a character for a tournament
 * @param tournamentId - Tournament ID
 * @param characterId - Character to register
 */
export function registerForTournament(
  tournamentId: string,
  characterId: string
): void {
  const caller = Context.caller().toString();

  const tournament = loadTournament(tournamentId);
  assert(tournament != null, 'Tournament not found');
  assert(
    tournament!.state == TOURNAMENT_REGISTRATION,
    'Tournament not in registration phase'
  );

  // Verify character ownership
  const character = loadCharacter(characterId);
  assert(character != null, 'Character not found');
  assert(character!.owner == caller, 'Not character owner');

  // Check entry fee
  const transferredCoins = Context.transferredCoins();
  assert(
    transferredCoins >= tournament!.entryFee,
    'Insufficient entry fee'
  );

  // Check not already registered
  const participants = getParticipantsList(tournament!);
  for (let i = 0; i < participants.length; i++) {
    assert(participants[i] != characterId, 'Already registered');
  }

  // Check max participants
  assert(
    participants.length < i32(tournament!.maxParticipants),
    'Tournament full'
  );

  // Add to participants
  if (tournament!.participants.length > 0) {
    tournament!.participants += ',';
  }
  tournament!.participants += characterId;

  // Add to prize pool
  tournament!.prizePool += tournament!.entryFee;

  saveTournament(tournament!);

  generateEvent(
    `TOURNAMENT_REGISTERED:${tournamentId}:${characterId}:${tournament!.prizePool.toString()}`
  );

  // Auto-start if full
  if (participants.length + 1 == i32(tournament!.maxParticipants)) {
    startTournament(tournamentId);
  }
}

// ============================================================================
// Tournament Progression
// ============================================================================

/**
 * Start the tournament (generates initial bracket)
 */
export function startTournament(tournamentId: string): void {
  const tournament = loadTournament(tournamentId);
  assert(tournament != null, 'Tournament not found');
  assert(
    tournament!.state == TOURNAMENT_REGISTRATION,
    'Tournament not in registration phase'
  );

  const participants = getParticipantsList(tournament!);
  assert(
    participants.length == i32(tournament!.maxParticipants),
    'Tournament not full'
  );

  // Generate bracket (simple sequential pairing)
  // In production, could implement seeding based on MMR
  tournament!.bracket = tournament!.participants;
  tournament!.state = TOURNAMENT_ACTIVE;
  tournament!.currentRound = 1;
  tournament!.startedAt = Context.timestamp();

  saveTournament(tournament!);

  generateEvent(`TOURNAMENT_STARTED:${tournamentId}`);
}

/**
 * Record a match result and advance winner
 * @param tournamentId - Tournament ID
 * @param winnerId - Winner's character ID
 * @param loserId - Loser's character ID
 */
export function recordTournamentMatch(
  tournamentId: string,
  winnerId: string,
  loserId: string
): void {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can record tournament matches');

  const tournament = loadTournament(tournamentId);
  assert(tournament != null, 'Tournament not found');
  assert(tournament!.state == TOURNAMENT_ACTIVE, 'Tournament not active');

  // Get current round participants
  const bracketParts = tournament!.bracket.split('|');
  const currentRoundIndex = i32(tournament!.currentRound - 1);
  assert(
    currentRoundIndex < bracketParts.length,
    'Invalid round'
  );

  const currentRound = bracketParts[currentRoundIndex].split(',');

  // Verify both participants are in current round
  let winnerInRound = false;
  let loserInRound = false;
  for (let i = 0; i < currentRound.length; i++) {
    if (currentRound[i] == winnerId) winnerInRound = true;
    if (currentRound[i] == loserId) loserInRound = true;
  }
  assert(winnerInRound && loserInRound, 'Participants not in current round');

  // Build next round
  const nextRound: string[] = [];
  for (let i = 0; i < currentRound.length; i++) {
    if (currentRound[i] != loserId) {
      nextRound.push(currentRound[i]);
    }
  }

  // Check if this completes the current round's matches
  const expectedNextRoundSize = currentRound.length / 2;

  if (nextRound.length == expectedNextRoundSize) {
    // All matches in current round complete
    if (nextRound.length == 1) {
      // Tournament complete
      finalizeTournament(tournament!, winnerId, loserId);
      return;
    } else if (nextRound.length == 2) {
      // Semi-finals complete, track third place
      // The other loser from semis gets 3rd place
      tournament!.thirdPlaceId = loserId;
    }

    // Add next round to bracket
    tournament!.bracket += '|' + nextRound.join(',');
    tournament!.currentRound++;
  } else {
    // Update current round in bracket
    bracketParts[currentRoundIndex] = nextRound.join(',');
    tournament!.bracket = bracketParts.join('|');
  }

  saveTournament(tournament!);

  generateEvent(
    `TOURNAMENT_MATCH:${tournamentId}:${winnerId}:${loserId}:${tournament!.currentRound.toString()}`
  );
}

/**
 * Advance to next round (admin function)
 */
export function advanceTournamentRound(tournamentId: string): void {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can advance tournament');

  const tournament = loadTournament(tournamentId);
  assert(tournament != null, 'Tournament not found');
  assert(tournament!.state == TOURNAMENT_ACTIVE, 'Tournament not active');

  tournament!.currentRound++;
  saveTournament(tournament!);

  generateEvent(
    `TOURNAMENT_ROUND_ADVANCED:${tournamentId}:${tournament!.currentRound.toString()}`
  );
}

// ============================================================================
// Tournament Finalization
// ============================================================================

/**
 * Finalize tournament and distribute prizes
 */
function finalizeTournament(
  tournament: Tournament,
  winnerId: string,
  runnerUpId: string
): void {
  tournament.state = TOURNAMENT_COMPLETED;
  tournament.winnerId = winnerId;
  tournament.runnerUpId = runnerUpId;
  tournament.endedAt = Context.timestamp();

  // Calculate prize distribution
  // 50% to winner, 30% to runner-up, 20% to third place
  // If no third place participant, treasury keeps it
  const winnerPrize = tournament.prizePool * 50 / 100;
  const runnerUpPrize = tournament.prizePool * 30 / 100;
  const thirdPlacePrize = tournament.prizePool * 20 / 100;

  // Get winner addresses
  const winnerChar = loadCharacter(winnerId);
  const runnerUpChar = loadCharacter(runnerUpId);

  if (winnerChar != null) {
    transferCoins(new Address(winnerChar!.owner), winnerPrize);
  }

  if (runnerUpChar != null) {
    transferCoins(new Address(runnerUpChar!.owner), runnerUpPrize);
  }

  if (tournament.thirdPlaceId.length > 0) {
    const thirdChar = loadCharacter(tournament.thirdPlaceId);
    if (thirdChar != null) {
      transferCoins(new Address(thirdChar!.owner), thirdPlacePrize);
    }
  } else {
    // No third place, add to treasury
    addToTreasury(thirdPlacePrize);
  }

  saveTournament(tournament);

  generateEvent(
    `TOURNAMENT_COMPLETED:${tournament.id}:${winnerId}:${runnerUpId}:${tournament.thirdPlaceId}:${winnerPrize.toString()}`
  );
}

/**
 * Force finalize tournament (admin only, for emergencies)
 */
export function forceFinalizeTournament(
  tournamentId: string,
  winnerId: string,
  runnerUpId: string,
  thirdPlaceId: string
): void {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can force finalize');

  const tournament = loadTournament(tournamentId);
  assert(tournament != null, 'Tournament not found');

  tournament!.thirdPlaceId = thirdPlaceId;
  finalizeTournament(tournament!, winnerId, runnerUpId);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get participants as array
 */
export function getParticipantsList(tournament: Tournament): string[] {
  if (tournament.participants.length == 0) {
    return [];
  }
  return tournament.participants.split(',');
}

/**
 * Get current round participants
 */
export function getCurrentRoundParticipants(tournament: Tournament): string[] {
  if (tournament.bracket.length == 0) {
    return [];
  }

  const rounds = tournament.bracket.split('|');
  const currentRoundIndex = i32(tournament.currentRound - 1);

  if (currentRoundIndex >= rounds.length) {
    return [];
  }

  return rounds[currentRoundIndex].split(',');
}

/**
 * Check if character is registered in tournament
 */
export function isRegistered(tournamentId: string, characterId: string): bool {
  const tournament = loadTournament(tournamentId);
  if (tournament == null) return false;

  const participants = getParticipantsList(tournament!);
  for (let i = 0; i < participants.length; i++) {
    if (participants[i] == characterId) return true;
  }
  return false;
}

/**
 * Get tournament state name
 */
export function getTournamentStateName(state: u8): string {
  switch (state) {
    case TOURNAMENT_REGISTRATION:
      return 'Registration';
    case TOURNAMENT_ACTIVE:
      return 'Active';
    case TOURNAMENT_COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
}
