/**
 * Status Effects Component
 * Handles DOT effects, buffs, debuffs, and duration tracking
 */

import { generateEvent } from '@massalabs/massa-as-sdk';
import {
  BattlePlayer,
  STATUS_NONE,
  STATUS_POISON,
  STATUS_STUN,
  STATUS_SHIELD,
  STATUS_RAGE,
  STATUS_BURN,
} from './types';

// ============================================================================
// Status Effect Checking
// ============================================================================

/**
 * Check if player has a specific status effect
 */
export function hasStatus(player: BattlePlayer, status: u8): bool {
  return (player.statusEffects & status) != 0;
}

/**
 * Check if player is poisoned
 */
export function isPoisoned(player: BattlePlayer): bool {
  return hasStatus(player, STATUS_POISON);
}

/**
 * Check if player is stunned
 */
export function isStunned(player: BattlePlayer): bool {
  return hasStatus(player, STATUS_STUN);
}

/**
 * Check if player has shield
 */
export function hasShield(player: BattlePlayer): bool {
  return hasStatus(player, STATUS_SHIELD);
}

/**
 * Check if player has rage
 */
export function hasRage(player: BattlePlayer): bool {
  return hasStatus(player, STATUS_RAGE);
}

/**
 * Check if player is burning
 */
export function isBurning(player: BattlePlayer): bool {
  return hasStatus(player, STATUS_BURN);
}

// ============================================================================
// Status Effect Application
// ============================================================================

/**
 * Apply a status effect with duration
 */
export function applyStatus(
  player: BattlePlayer,
  status: u8,
  duration: u8,
  battleId: string
): void {
  player.statusEffects |= status;

  switch (status) {
    case STATUS_POISON:
      player.poisonTurns = duration;
      generateEvent(`STATUS_APPLIED:${battleId}:${player.characterId}:POISON:${duration.toString()}`);
      break;
    case STATUS_STUN:
      player.stunTurns = duration;
      generateEvent(`STATUS_APPLIED:${battleId}:${player.characterId}:STUN:${duration.toString()}`);
      break;
    case STATUS_SHIELD:
      player.shieldTurns = duration;
      generateEvent(`STATUS_APPLIED:${battleId}:${player.characterId}:SHIELD:${duration.toString()}`);
      break;
    case STATUS_RAGE:
      player.rageTurns = duration;
      generateEvent(`STATUS_APPLIED:${battleId}:${player.characterId}:RAGE:${duration.toString()}`);
      break;
    case STATUS_BURN:
      player.burnTurns = duration;
      generateEvent(`STATUS_APPLIED:${battleId}:${player.characterId}:BURN:${duration.toString()}`);
      break;
  }
}

/**
 * Remove a status effect
 */
export function removeStatus(
  player: BattlePlayer,
  status: u8,
  battleId: string
): void {
  player.statusEffects &= ~status;

  let statusName = '';
  switch (status) {
    case STATUS_POISON:
      player.poisonTurns = 0;
      statusName = 'POISON';
      break;
    case STATUS_STUN:
      player.stunTurns = 0;
      statusName = 'STUN';
      break;
    case STATUS_SHIELD:
      player.shieldTurns = 0;
      statusName = 'SHIELD';
      break;
    case STATUS_RAGE:
      player.rageTurns = 0;
      statusName = 'RAGE';
      break;
    case STATUS_BURN:
      player.burnTurns = 0;
      statusName = 'BURN';
      break;
  }

  if (statusName.length > 0) {
    generateEvent(`STATUS_REMOVED:${battleId}:${player.characterId}:${statusName}`);
  }
}

/**
 * Clear all status effects
 */
export function clearAllStatus(player: BattlePlayer): void {
  player.statusEffects = STATUS_NONE;
  player.poisonTurns = 0;
  player.stunTurns = 0;
  player.shieldTurns = 0;
  player.rageTurns = 0;
  player.burnTurns = 0;
}

// ============================================================================
// DOT (Damage Over Time) Processing
// ============================================================================

/**
 * Calculate and apply poison damage
 * Poison deals 5% of max HP per turn
 */
export function applyPoisonDamage(player: BattlePlayer, battleId: string): u16 {
  if (!isPoisoned(player)) return 0;

  const damage = u16(player.maxHp * 5 / 100);

  if (player.currentHp <= damage) {
    player.currentHp = 0;
  } else {
    player.currentHp -= damage;
  }

  generateEvent(
    `POISON_DAMAGE:${battleId}:${player.characterId}:${damage.toString()}`
  );

  return damage;
}

/**
 * Calculate and apply burn damage
 * Burn deals 8% of max HP per turn
 */
export function applyBurnDamage(player: BattlePlayer, battleId: string): u16 {
  if (!isBurning(player)) return 0;

  const damage = u16(player.maxHp * 8 / 100);

  if (player.currentHp <= damage) {
    player.currentHp = 0;
  } else {
    player.currentHp -= damage;
  }

  generateEvent(
    `BURN_DAMAGE:${battleId}:${player.characterId}:${damage.toString()}`
  );

  return damage;
}

/**
 * Apply all DOT effects at turn start
 * Returns total DOT damage dealt
 */
export function applyDOTEffects(player: BattlePlayer, battleId: string): u16 {
  let totalDamage: u16 = 0;

  totalDamage += applyPoisonDamage(player, battleId);
  totalDamage += applyBurnDamage(player, battleId);

  return totalDamage;
}

// ============================================================================
// Duration Tick Processing
// ============================================================================

/**
 * Reduce all status effect durations by 1
 * Remove expired effects
 */
export function tickStatusDurations(
  player: BattlePlayer,
  battleId: string
): void {
  // Process poison
  if (player.poisonTurns > 0) {
    player.poisonTurns--;
    if (player.poisonTurns == 0) {
      removeStatus(player, STATUS_POISON, battleId);
    }
  }

  // Process stun
  if (player.stunTurns > 0) {
    player.stunTurns--;
    if (player.stunTurns == 0) {
      removeStatus(player, STATUS_STUN, battleId);
    }
  }

  // Process shield
  if (player.shieldTurns > 0) {
    player.shieldTurns--;
    if (player.shieldTurns == 0) {
      removeStatus(player, STATUS_SHIELD, battleId);
    }
  }

  // Process rage
  if (player.rageTurns > 0) {
    player.rageTurns--;
    if (player.rageTurns == 0) {
      removeStatus(player, STATUS_RAGE, battleId);
    }
  }

  // Process burn
  if (player.burnTurns > 0) {
    player.burnTurns--;
    if (player.burnTurns == 0) {
      removeStatus(player, STATUS_BURN, battleId);
    }
  }

  // Process dodge boost
  if (player.dodgeBoostTurns > 0) {
    player.dodgeBoostTurns--;
    if (player.dodgeBoostTurns == 0) {
      player.dodgeBoost = 0;
      generateEvent(`DODGE_BOOST_EXPIRED:${battleId}:${player.characterId}`);
    }
  }
}

// ============================================================================
// Combat Modifiers from Status
// ============================================================================

/**
 * Get damage multiplier from rage status
 * Returns 150 (1.5x) if rage active, 100 (1.0x) otherwise
 */
export function getRageDamageMultiplier(player: BattlePlayer): u8 {
  return hasRage(player) ? 150 : 100;
}

/**
 * Get damage reduction from shield status
 * Returns 70 (0.7x) if shield active, 100 (1.0x) otherwise
 */
export function getShieldDamageReduction(player: BattlePlayer): u8 {
  return hasShield(player) ? 70 : 100;
}

/**
 * Get total dodge chance including boost
 */
export function getTotalDodgeChance(player: BattlePlayer, baseDodge: u8): u8 {
  const total = baseDodge + player.dodgeBoost;
  return total > 100 ? 100 : total;
}

// ============================================================================
// Status Effect Info
// ============================================================================

/**
 * Get status effect name
 */
export function getStatusName(status: u8): string {
  switch (status) {
    case STATUS_POISON:
      return 'Poison';
    case STATUS_STUN:
      return 'Stun';
    case STATUS_SHIELD:
      return 'Shield';
    case STATUS_RAGE:
      return 'Rage';
    case STATUS_BURN:
      return 'Burn';
    default:
      return 'None';
  }
}

/**
 * Get remaining duration for a status
 */
export function getStatusDuration(player: BattlePlayer, status: u8): u8 {
  switch (status) {
    case STATUS_POISON:
      return player.poisonTurns;
    case STATUS_STUN:
      return player.stunTurns;
    case STATUS_SHIELD:
      return player.shieldTurns;
    case STATUS_RAGE:
      return player.rageTurns;
    case STATUS_BURN:
      return player.burnTurns;
    default:
      return 0;
  }
}

/**
 * Get all active status effects as a string
 */
export function getActiveStatusString(player: BattlePlayer): string {
  const statuses: string[] = [];

  if (isPoisoned(player)) {
    statuses.push(`Poison(${player.poisonTurns.toString()})`);
  }
  if (isStunned(player)) {
    statuses.push(`Stun(${player.stunTurns.toString()})`);
  }
  if (hasShield(player)) {
    statuses.push(`Shield(${player.shieldTurns.toString()})`);
  }
  if (hasRage(player)) {
    statuses.push(`Rage(${player.rageTurns.toString()})`);
  }
  if (isBurning(player)) {
    statuses.push(`Burn(${player.burnTurns.toString()})`);
  }
  if (player.dodgeBoostTurns > 0) {
    statuses.push(`DodgeBoost(${player.dodgeBoostTurns.toString()})`);
  }
  if (player.guaranteedCrit) {
    statuses.push('CritReady');
  }

  return statuses.length > 0 ? statuses.join(',') : 'None';
}
