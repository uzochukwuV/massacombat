/**
 * Treasury Management Component
 * Handles fee collection, balance tracking, and withdrawals
 */

import { Context, generateEvent, transferCoins, Address, balance } from '@massalabs/massa-as-sdk';
import {
  getTreasury,
  setTreasury,
  addToTreasury,
  isAdmin,
} from './storage';

// ============================================================================
// Fee Configuration
// ============================================================================

// Battle fee (in nanoMAS)
export const BATTLE_FEE: u64 = 1_000_000_000; // 1 MAS

// Character creation fee
export const CHARACTER_CREATION_FEE: u64 = 500_000_000; // 0.5 MAS

// Equipment repair fee multiplier (based on rarity)
export const REPAIR_FEE_BASE: u64 = 100_000_000; // 0.1 MAS

// Skill learning fee
export const SKILL_LEARNING_FEE: u64 = 200_000_000; // 0.2 MAS

// Character upgrade fee
export const UPGRADE_FEE: u64 = 300_000_000; // 0.3 MAS

// Treasury fee percentage from tournaments (percentage)
export const TOURNAMENT_FEE_PERCENT: u8 = 5;

// ============================================================================
// Fee Collection
// ============================================================================

/**
 * Collect battle fee
 */
export function collectBattleFee(): void {
  const transferred = Context.transferredCoins();
  assert(transferred >= BATTLE_FEE, 'Insufficient battle fee');

  addToTreasury(BATTLE_FEE);

  // Refund excess
  const excess = transferred - BATTLE_FEE;
  if (excess > 0) {
    transferCoins(Context.caller(), excess);
  }

  generateEvent(`BATTLE_FEE_COLLECTED:${BATTLE_FEE.toString()}`);
}

/**
 * Collect character creation fee
 */
export function collectCharacterCreationFee(): void {
  const transferred = Context.transferredCoins();
  assert(transferred >= CHARACTER_CREATION_FEE, 'Insufficient creation fee');

  addToTreasury(CHARACTER_CREATION_FEE);

  // Refund excess
  const excess = transferred - CHARACTER_CREATION_FEE;
  if (excess > 0) {
    transferCoins(Context.caller(), excess);
  }

  generateEvent(`CREATION_FEE_COLLECTED:${CHARACTER_CREATION_FEE.toString()}`);
}

/**
 * Collect skill learning fee
 */
export function collectSkillLearningFee(): void {
  const transferred = Context.transferredCoins();
  assert(transferred >= SKILL_LEARNING_FEE, 'Insufficient skill learning fee');

  addToTreasury(SKILL_LEARNING_FEE);

  // Refund excess
  const excess = transferred - SKILL_LEARNING_FEE;
  if (excess > 0) {
    transferCoins(Context.caller(), excess);
  }

  generateEvent(`SKILL_FEE_COLLECTED:${SKILL_LEARNING_FEE.toString()}`);
}

/**
 * Collect upgrade fee
 */
export function collectUpgradeFee(): void {
  const transferred = Context.transferredCoins();
  assert(transferred >= UPGRADE_FEE, 'Insufficient upgrade fee');

  addToTreasury(UPGRADE_FEE);

  // Refund excess
  const excess = transferred - UPGRADE_FEE;
  if (excess > 0) {
    transferCoins(Context.caller(), excess);
  }

  generateEvent(`UPGRADE_FEE_COLLECTED:${UPGRADE_FEE.toString()}`);
}

/**
 * Calculate repair fee based on equipment rarity
 * @param rarity - Equipment rarity (0-3)
 */
export function calculateRepairFee(rarity: u8): u64 {
  // Common: 0.1 MAS, Rare: 0.2 MAS, Epic: 0.4 MAS, Legendary: 0.8 MAS
  return REPAIR_FEE_BASE * u64(1 << rarity);
}

/**
 * Collect repair fee
 * @param rarity - Equipment rarity
 */
export function collectRepairFee(rarity: u8): void {
  const fee = calculateRepairFee(rarity);
  const transferred = Context.transferredCoins();
  assert(transferred >= fee, 'Insufficient repair fee');

  addToTreasury(fee);

  // Refund excess
  const excess = transferred - fee;
  if (excess > 0) {
    transferCoins(Context.caller(), excess);
  }

  generateEvent(`REPAIR_FEE_COLLECTED:${fee.toString()}`);
}

/**
 * Calculate tournament fee from prize pool
 * @param prizePool - Total prize pool
 */
export function calculateTournamentFee(prizePool: u64): u64 {
  return (prizePool * u64(TOURNAMENT_FEE_PERCENT)) / 100;
}

/**
 * Collect tournament fee
 * @param prizePool - Total prize pool
 */
export function collectTournamentFee(prizePool: u64): void {
  const fee = calculateTournamentFee(prizePool);
  addToTreasury(fee);

  generateEvent(`TOURNAMENT_FEE_COLLECTED:${fee.toString()}`);
}

// ============================================================================
// Treasury Query
// ============================================================================

/**
 * Get current treasury balance
 */
export function getTreasuryBalance(): u64 {
  return getTreasury();
}

/**
 * Get contract's actual coin balance
 */
export function getContractBalance(): u64 {
  return balance();
}

// ============================================================================
// Admin Withdrawals
// ============================================================================

/**
 * Withdraw from treasury (admin only)
 * @param amount - Amount to withdraw
 * @param toAddress - Destination address
 */
export function withdrawFromTreasury(amount: u64, toAddress: string): void {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can withdraw');

  const currentBalance = getTreasury();
  assert(amount <= currentBalance, 'Insufficient treasury balance');

  // Update treasury
  setTreasury(currentBalance - amount);

  // Transfer coins
  transferCoins(new Address(toAddress), amount);

  generateEvent(
    `TREASURY_WITHDRAWAL:${amount.toString()}:${toAddress}:${caller}`
  );
}

/**
 * Emergency withdraw all funds (admin only)
 */
export function emergencyWithdraw(toAddress: string): void {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can emergency withdraw');

  const contractBal = balance();
  if (contractBal > 0) {
    transferCoins(new Address(toAddress), contractBal);
    setTreasury(0);

    generateEvent(
      `EMERGENCY_WITHDRAWAL:${contractBal.toString()}:${toAddress}:${caller}`
    );
  }
}

// ============================================================================
// Fee Info
// ============================================================================

/**
 * Get all fee information as formatted string
 */
export function getFeeInfo(): string {
  return `Battle: ${BATTLE_FEE.toString()} nanoMAS, ` +
    `Character Creation: ${CHARACTER_CREATION_FEE.toString()} nanoMAS, ` +
    `Skill Learning: ${SKILL_LEARNING_FEE.toString()} nanoMAS, ` +
    `Upgrade: ${UPGRADE_FEE.toString()} nanoMAS, ` +
    `Repair Base: ${REPAIR_FEE_BASE.toString()} nanoMAS, ` +
    `Tournament Fee: ${TOURNAMENT_FEE_PERCENT.toString()}%`;
}
