/**
 * Leaderboard and MMR Component
 * Handles MMR calculation, ranking, and statistics
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import {
  LeaderboardEntry,
  Character,
  BASE_MMR,
} from './types';
import {
  saveLeaderboardEntry,
  loadLeaderboardEntry,
  getLeaderboardCount,
  setLeaderboardCount,
  loadCharacter,
  saveCharacter,
} from './storage';
import { recordWin, recordLoss, updateCharacterMMR } from './character';

// ============================================================================
// MMR Configuration
// ============================================================================

// K-factor for MMR calculation (higher = more volatile)
const K_FACTOR: u64 = 32;
// Minimum MMR
const MIN_MMR: u64 = 100;
// Maximum MMR
const MAX_MMR: u64 = 5000;
// Maximum leaderboard size
const MAX_LEADERBOARD_SIZE: u32 = 100;

// ============================================================================
// MMR Calculation
// ============================================================================

/**
 * Calculate expected score based on MMR difference
 * Uses simplified ELO formula
 */
export function calculateExpectedScore(playerMMR: u64, opponentMMR: u64): u64 {
  // Simplified: expected = 1 / (1 + 10^((opponent - player) / 400))
  // We approximate this with integer math

  let diff: i64 = i64(opponentMMR) - i64(playerMMR);

  // Clamp difference to prevent overflow
  if (diff > 400) diff = 400;
  if (diff < -400) diff = -400;

  // Approximate expected score (0-100 scale)
  // At equal MMR: 50
  // At +400 diff: ~10
  // At -400 diff: ~90
  let expected: i64 = 50 - diff / 8;
  if (expected < 5) expected = 5;
  if (expected > 95) expected = 95;

  return u64(expected);
}

/**
 * Calculate MMR change after a match
 * @param won - Whether the player won
 * @param playerMMR - Player's current MMR
 * @param opponentMMR - Opponent's MMR
 * @returns New MMR value
 */
export function calculateNewMMR(
  won: bool,
  playerMMR: u64,
  opponentMMR: u64
): u64 {
  const expected = calculateExpectedScore(playerMMR, opponentMMR);
  const actual: u64 = won ? 100 : 0;

  let delta: i64;
  if (actual > expected) {
    delta = i64((K_FACTOR * (actual - expected)) / 100);
  } else {
    delta = -i64((K_FACTOR * (expected - actual)) / 100);
  }

  let newMMR: i64 = i64(playerMMR) + delta;

  // Clamp to valid range
  if (newMMR < i64(MIN_MMR)) newMMR = i64(MIN_MMR);
  if (newMMR > i64(MAX_MMR)) newMMR = i64(MAX_MMR);

  return u64(newMMR);
}

/**
 * Update MMR after a battle
 * @param winnerId - Winner's character ID
 * @param loserId - Loser's character ID
 * @param xpForWinner - XP to award winner
 */
export function updateBattleMMR(
  winnerId: string,
  loserId: string,
  xpForWinner: u64
): void {
  const winner = loadCharacter(winnerId);
  const loser = loadCharacter(loserId);

  if (winner == null || loser == null) return;

  const winnerOldMMR = winner.mmr;
  const loserOldMMR = loser.mmr;

  // Calculate new MMRs
  const winnerNewMMR = calculateNewMMR(true, winnerOldMMR, loserOldMMR);
  const loserNewMMR = calculateNewMMR(false, loserOldMMR, winnerOldMMR);

  // Update winner
  recordWin(winnerId, xpForWinner);
  updateCharacterMMR(winnerId, winnerNewMMR);

  // Update loser
  recordLoss(loserId);
  updateCharacterMMR(loserId, loserNewMMR);

  // Update leaderboard
  updateLeaderboardEntry(winner);
  updateLeaderboardEntry(loser);

  generateEvent(
    `MMR_UPDATE:${winnerId}:${winnerOldMMR.toString()}:${winnerNewMMR.toString()}`
  );
  generateEvent(
    `MMR_UPDATE:${loserId}:${loserOldMMR.toString()}:${loserNewMMR.toString()}`
  );
}

// ============================================================================
// Leaderboard Management
// ============================================================================

/**
 * Update or insert a character's leaderboard entry
 */
export function updateLeaderboardEntry(character: Character): void {
  // Reload to get latest stats
  const freshChar = loadCharacter(character.id);
  if (freshChar == null) return;

  const entry = new LeaderboardEntry(
    freshChar.id,
    freshChar.owner,
    freshChar.mmr
  );
  entry.wins = freshChar.totalWins;
  entry.losses = freshChar.totalLosses;

  // Find position in leaderboard
  let count = getLeaderboardCount();
  let insertPosition: u32 = count;

  // Find where this entry should go (sorted by MMR descending)
  for (let i: u32 = 0; i < count; i++) {
    const existing = loadLeaderboardEntry(i);
    if (existing == null) continue;

    // If this is the same character, remember to remove old entry
    if (existing.characterId == entry.characterId) {
      // Shift all entries after this one up
      for (let j: u32 = i; j < count - 1; j++) {
        const next = loadLeaderboardEntry(j + 1);
        if (next != null) {
          saveLeaderboardEntry(j, next);
        }
      }
      count--;
      setLeaderboardCount(count);
    }

    // Find insert position
    if (insertPosition == count && entry.mmr > existing.mmr) {
      insertPosition = i;
    }
  }

  // Insert the new entry
  if (insertPosition < MAX_LEADERBOARD_SIZE) {
    // Shift entries down to make room
    let shiftEnd = count < MAX_LEADERBOARD_SIZE ? count : MAX_LEADERBOARD_SIZE - 1;
    for (let i = shiftEnd; i > insertPosition; i--) {
      const prev = loadLeaderboardEntry(i - 1);
      if (prev != null) {
        saveLeaderboardEntry(i, prev);
      }
    }

    // Insert new entry
    saveLeaderboardEntry(insertPosition, entry);

    // Update count
    if (count < MAX_LEADERBOARD_SIZE) {
      setLeaderboardCount(count + 1);
    }
  }
}

/**
 * Get leaderboard entries
 * @param topN - Number of entries to return
 * @returns Array of leaderboard entries
 */
export function getLeaderboard(topN: u32): LeaderboardEntry[] {
  const count = getLeaderboardCount();
  const limit = topN < count ? topN : count;
  const results: LeaderboardEntry[] = [];

  for (let i: u32 = 0; i < limit; i++) {
    const entry = loadLeaderboardEntry(i);
    if (entry != null) {
      results.push(entry);
    }
  }

  return results;
}

/**
 * Get a character's rank on the leaderboard
 * @param characterId - Character to find
 * @returns Rank (1-indexed), or 0 if not found
 */
export function getCharacterRank(characterId: string): u32 {
  const count = getLeaderboardCount();

  for (let i: u32 = 0; i < count; i++) {
    const entry = loadLeaderboardEntry(i);
    if (entry != null && entry.characterId == characterId) {
      return i + 1; // 1-indexed rank
    }
  }

  return 0; // Not on leaderboard
}

/**
 * Get character's leaderboard entry
 */
export function getCharacterLeaderboardEntry(
  characterId: string
): LeaderboardEntry | null {
  const count = getLeaderboardCount();

  for (let i: u32 = 0; i < count; i++) {
    const entry = loadLeaderboardEntry(i);
    if (entry != null && entry!.characterId == characterId) {
      return entry;
    }
  }

  return null;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Calculate win rate for a character
 */
export function getWinRate(characterId: string): u8 {
  const character = loadCharacter(characterId);
  if (character == null) return 0;

  const total = character!.totalWins + character!.totalLosses;
  if (total == 0) return 0;

  return u8((u64(character!.totalWins) * 100) / u64(total));
}

/**
 * Get MMR tier name
 */
export function getMMRTier(mmr: u64): string {
  if (mmr >= 3000) return 'Grandmaster';
  if (mmr >= 2500) return 'Master';
  if (mmr >= 2000) return 'Diamond';
  if (mmr >= 1500) return 'Platinum';
  if (mmr >= 1200) return 'Gold';
  if (mmr >= 1000) return 'Silver';
  if (mmr >= 800) return 'Bronze';
  return 'Iron';
}

/**
 * Rebuild leaderboard from all characters (admin function)
 * Note: This is expensive and should only be used for maintenance
 */
export function rebuildLeaderboard(characterIds: string[]): void {
  // Clear existing leaderboard
  setLeaderboardCount(0);

  // Re-add all characters
  for (let i = 0; i < characterIds.length; i++) {
    const character = loadCharacter(characterIds[i]);
    if (character != null) {
      updateLeaderboardEntry(character!);
    }
  }

  generateEvent(`LEADERBOARD_REBUILT:${characterIds.length.toString()}`);
}
