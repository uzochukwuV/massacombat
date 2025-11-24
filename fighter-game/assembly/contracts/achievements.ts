/**
 * Achievement System Component
 * Handles achievement tracking and unlocking
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import {
  AchievementTracker,
  Character,
  ACH_FIRST_WIN,
  ACH_10_WINS,
  ACH_50_WINS,
  ACH_100_WINS,
  ACH_TOURNAMENT_WIN,
  ACH_5_WIN_STREAK,
  ACH_COMBO_MASTER,
  ACH_SKILL_MASTER,
  ACH_LEGENDARY_EQUIP,
  ACH_MAX_LEVEL,
  MAX_LEVEL,
  RARITY_LEGENDARY,
} from './types';
import {
  saveAchievements,
  loadAchievements,
  getOrCreateAchievements,
  loadCharacter,
  loadEquipment,
  getOwnerCharacters,
  getOwnerEquipment,
} from './storage';
import { getLearnedSkillCount } from './skills';

// ============================================================================
// Achievement Checking
// ============================================================================

/**
 * Check if an achievement is unlocked
 */
export function hasAchievement(tracker: AchievementTracker, achievementId: u8): bool {
  const bit: u16 = u16(1) << (achievementId - 1);
  return (tracker.unlockedAchievements & bit) != 0;
}

/**
 * Unlock an achievement
 */
function unlockAchievement(
  tracker: AchievementTracker,
  achievementId: u8
): bool {
  if (hasAchievement(tracker, achievementId)) {
    return false; // Already unlocked
  }

  const bit: u16 = u16(1) << (achievementId - 1);
  tracker.unlockedAchievements |= bit;

  // Add timestamp
  const timestamp = Context.timestamp().toString();
  if (tracker.timestamps.length > 0) {
    tracker.timestamps += ',';
  }
  tracker.timestamps += `${achievementId.toString()}:${timestamp}`;

  generateEvent(
    `ACHIEVEMENT_UNLOCKED:${tracker.ownerAddress}:${achievementId.toString()}:${getAchievementName(achievementId)}`
  );

  return true;
}

// ============================================================================
// Achievement Names
// ============================================================================

/**
 * Get achievement name
 */
export function getAchievementName(achievementId: u8): string {
  switch (achievementId) {
    case ACH_FIRST_WIN:
      return 'First Victory';
    case ACH_10_WINS:
      return 'Rising Champion';
    case ACH_50_WINS:
      return 'Veteran Fighter';
    case ACH_100_WINS:
      return 'Legendary Warrior';
    case ACH_TOURNAMENT_WIN:
      return 'Tournament Champion';
    case ACH_5_WIN_STREAK:
      return 'Unstoppable';
    case ACH_COMBO_MASTER:
      return 'Combo Master';
    case ACH_SKILL_MASTER:
      return 'Skill Master';
    case ACH_LEGENDARY_EQUIP:
      return 'Legendary Collector';
    case ACH_MAX_LEVEL:
      return 'Max Power';
    default:
      return 'Unknown';
  }
}

/**
 * Get achievement description
 */
export function getAchievementDescription(achievementId: u8): string {
  switch (achievementId) {
    case ACH_FIRST_WIN:
      return 'Win your first battle';
    case ACH_10_WINS:
      return 'Win 10 battles';
    case ACH_50_WINS:
      return 'Win 50 battles';
    case ACH_100_WINS:
      return 'Win 100 battles';
    case ACH_TOURNAMENT_WIN:
      return 'Win a tournament';
    case ACH_5_WIN_STREAK:
      return 'Achieve a 5-win streak';
    case ACH_COMBO_MASTER:
      return 'Land a 5+ hit combo in battle';
    case ACH_SKILL_MASTER:
      return 'Learn all 10 skills on one character';
    case ACH_LEGENDARY_EQUIP:
      return 'Obtain a legendary equipment piece';
    case ACH_MAX_LEVEL:
      return 'Reach maximum level (20)';
    default:
      return 'Unknown achievement';
  }
}

// ============================================================================
// Achievement Progress Checking
// ============================================================================

/**
 * Check and grant win-based achievements
 * @param ownerAddress - Player address
 * @param totalWins - Total wins across all characters
 * @param currentStreak - Current win streak
 */
export function checkWinAchievements(
  ownerAddress: string,
  totalWins: u32,
  currentStreak: u8
): void {
  const tracker = getOrCreateAchievements(ownerAddress);
  let updated = false;

  // First win
  if (totalWins >= 1) {
    updated = unlockAchievement(tracker, ACH_FIRST_WIN) || updated;
  }

  // 10 wins
  if (totalWins >= 10) {
    updated = unlockAchievement(tracker, ACH_10_WINS) || updated;
  }

  // 50 wins
  if (totalWins >= 50) {
    updated = unlockAchievement(tracker, ACH_50_WINS) || updated;
  }

  // 100 wins
  if (totalWins >= 100) {
    updated = unlockAchievement(tracker, ACH_100_WINS) || updated;
  }

  // 5 win streak
  if (currentStreak >= 5) {
    updated = unlockAchievement(tracker, ACH_5_WIN_STREAK) || updated;
  }

  if (updated) {
    saveAchievements(tracker);
  }
}

/**
 * Check and grant tournament win achievement
 */
export function checkTournamentWinAchievement(ownerAddress: string): void {
  const tracker = getOrCreateAchievements(ownerAddress);
  if (unlockAchievement(tracker, ACH_TOURNAMENT_WIN)) {
    saveAchievements(tracker);
  }
}

/**
 * Check and grant combo master achievement
 * @param ownerAddress - Player address
 * @param comboCount - Combo achieved in battle
 */
export function checkComboAchievement(ownerAddress: string, comboCount: u8): void {
  if (comboCount >= 5) {
    const tracker = getOrCreateAchievements(ownerAddress);
    if (unlockAchievement(tracker, ACH_COMBO_MASTER)) {
      saveAchievements(tracker);
    }
  }
}

/**
 * Check and grant skill master achievement
 * @param ownerAddress - Player address
 * @param character - Character that learned skills
 */
export function checkSkillMasterAchievement(
  ownerAddress: string,
  character: Character
): void {
  if (getLearnedSkillCount(character) >= 10) {
    const tracker = getOrCreateAchievements(ownerAddress);
    if (unlockAchievement(tracker, ACH_SKILL_MASTER)) {
      saveAchievements(tracker);
    }
  }
}

/**
 * Check and grant legendary equipment achievement
 * @param ownerAddress - Player address
 * @param rarity - Equipment rarity obtained
 */
export function checkLegendaryEquipAchievement(
  ownerAddress: string,
  rarity: u8
): void {
  if (rarity == RARITY_LEGENDARY) {
    const tracker = getOrCreateAchievements(ownerAddress);
    if (unlockAchievement(tracker, ACH_LEGENDARY_EQUIP)) {
      saveAchievements(tracker);
    }
  }
}

/**
 * Check and grant max level achievement
 * @param ownerAddress - Player address
 * @param level - Character level
 */
export function checkMaxLevelAchievement(ownerAddress: string, level: u8): void {
  if (level >= MAX_LEVEL) {
    const tracker = getOrCreateAchievements(ownerAddress);
    if (unlockAchievement(tracker, ACH_MAX_LEVEL)) {
      saveAchievements(tracker);
    }
  }
}

// ============================================================================
// Achievement Queries
// ============================================================================

/**
 * Get total achievements unlocked
 */
export function getUnlockedCount(tracker: AchievementTracker): u8 {
  let count: u8 = 0;
  for (let i: u8 = 1; i <= 10; i++) {
    if (hasAchievement(tracker, i)) {
      count++;
    }
  }
  return count;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(tracker: AchievementTracker): u8 {
  return u8((u32(getUnlockedCount(tracker)) * 100) / 10);
}

/**
 * Get all unlocked achievements as string
 */
export function getUnlockedAchievementsString(tracker: AchievementTracker): string {
  const achievements: string[] = [];
  for (let i: u8 = 1; i <= 10; i++) {
    if (hasAchievement(tracker, i)) {
      achievements.push(getAchievementName(i));
    }
  }
  return achievements.length > 0 ? achievements.join(',') : 'None';
}

/**
 * Get player achievements
 */
export function getPlayerAchievements(ownerAddress: string): AchievementTracker {
  return getOrCreateAchievements(ownerAddress);
}

// ============================================================================
// Batch Achievement Check
// ============================================================================

/**
 * Check all achievements for a player (comprehensive check)
 */
export function checkAllAchievements(ownerAddress: string): void {
  const tracker = getOrCreateAchievements(ownerAddress);
  let updated = false;

  // Get all characters for this owner
  const characterIds = getOwnerCharacters(ownerAddress);
  let totalWins: u32 = 0;
  let maxStreak: u8 = 0;
  let hasMaxLevel = false;
  let hasSkillMaster = false;

  for (let i = 0; i < characterIds.length; i++) {
    const character = loadCharacter(characterIds[i]);
    if (character != null) {
      totalWins += character.totalWins;
      if (character.winStreak > maxStreak) {
        maxStreak = character.winStreak;
      }
      if (character.level >= MAX_LEVEL) {
        hasMaxLevel = true;
      }
      if (getLearnedSkillCount(character) >= 10) {
        hasSkillMaster = true;
      }
    }
  }

  // Check win achievements
  if (totalWins >= 1) updated = unlockAchievement(tracker, ACH_FIRST_WIN) || updated;
  if (totalWins >= 10) updated = unlockAchievement(tracker, ACH_10_WINS) || updated;
  if (totalWins >= 50) updated = unlockAchievement(tracker, ACH_50_WINS) || updated;
  if (totalWins >= 100) updated = unlockAchievement(tracker, ACH_100_WINS) || updated;
  if (maxStreak >= 5) updated = unlockAchievement(tracker, ACH_5_WIN_STREAK) || updated;
  if (hasMaxLevel) updated = unlockAchievement(tracker, ACH_MAX_LEVEL) || updated;
  if (hasSkillMaster) updated = unlockAchievement(tracker, ACH_SKILL_MASTER) || updated;

  // Check equipment achievements
  const equipmentIds = getOwnerEquipment(ownerAddress);
  for (let i = 0; i < equipmentIds.length; i++) {
    const equipment = loadEquipment(equipmentIds[i]);
    if (equipment != null && equipment.rarity == RARITY_LEGENDARY) {
      updated = unlockAchievement(tracker, ACH_LEGENDARY_EQUIP) || updated;
      break;
    }
  }

  if (updated) {
    saveAchievements(tracker);
  }
}
