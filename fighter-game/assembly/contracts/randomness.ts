/**
 * Randomness Engine for the Fighter Game Smart Contract
 * Provides pseudo-random number generation for game mechanics
 *
 * Note: This is a prototype implementation using XORshift.
 * Production should use Massa's VRF or oracle-based randomness.
 */

import { Context } from '@massalabs/massa-as-sdk';

// Global seed state for the current transaction
let _currentSeed: u64 = 0;

/**
 * Initialize or update the random seed using blockchain data
 */
export function initializeSeed(salt: u64): void {
  const timestamp = Context.timestamp();
  const caller = Context.caller().toString();

  // Create seed from multiple sources
  let seed: u64 = timestamp ^ salt;

  // Mix in caller address bytes
  for (let i = 0; i < caller.length; i++) {
    seed = seed ^ (u64(caller.charCodeAt(i)) << ((i % 8) * 8));
  }

  _currentSeed = seed;
}

/**
 * Get current seed value
 */
export function getCurrentSeed(): u64 {
  return _currentSeed;
}

/**
 * Set seed directly (for battle state restoration)
 */
export function setSeed(seed: u64): void {
  _currentSeed = seed;
}

/**
 * XORshift64 pseudo-random number generator
 * Fast and reasonably distributed for game purposes
 */
export function nextRandom(): u64 {
  let x = _currentSeed;
  x ^= x << 13;
  x ^= x >> 7;
  x ^= x << 17;
  _currentSeed = x;
  return x;
}

/**
 * Generate a random number in range [0, max)
 */
export function randomRange(max: u64): u64 {
  if (max == 0) return 0;
  return nextRandom() % max;
}

/**
 * Generate a random number in range [min, max] (inclusive)
 */
export function randomBetween(min: u64, max: u64): u64 {
  if (min >= max) return min;
  return min + randomRange(max - min + 1);
}

/**
 * Generate a random u8 in range [min, max] (inclusive)
 */
export function randomU8Between(min: u8, max: u8): u8 {
  if (min >= max) return min;
  return u8(min + randomRange(u64(max - min + 1)));
}

/**
 * Generate a random u16 in range [min, max] (inclusive)
 */
export function randomU16Between(min: u16, max: u16): u16 {
  if (min >= max) return min;
  return u16(min + randomRange(u64(max - min + 1)));
}

/**
 * Check if a percentage chance succeeds
 * @param chance - Percentage (0-100)
 * @returns true if the roll succeeds
 */
export function rollChance(chance: u8): bool {
  if (chance >= 100) return true;
  if (chance == 0) return false;
  return randomU8Between(1, 100) <= chance;
}

/**
 * Roll for critical hit
 * @param critChance - Crit chance percentage
 * @param guaranteed - If true, always returns true
 */
export function rollCritical(critChance: u8, guaranteed: bool): bool {
  if (guaranteed) return true;
  return rollChance(critChance);
}

/**
 * Roll for dodge
 * @param dodgeChance - Dodge chance percentage
 * @param boost - Additional dodge chance from skills
 */
export function rollDodge(dodgeChance: u8, boost: u8): bool {
  const total: i32 = i32(dodgeChance) + i32(boost);
  const totalChance: u8 = total > 100 ? 100 : u8(total);
  return rollChance(totalChance);
}

/**
 * Roll for wildcard event trigger
 * @param baseChance - Base wildcard trigger chance (default 10%)
 */
export function rollWildcard(baseChance: u8 = 10): bool {
  return rollChance(baseChance);
}

/**
 * Generate damage roll within range
 * @param minDamage - Minimum damage
 * @param maxDamage - Maximum damage
 */
export function rollDamage(minDamage: u16, maxDamage: u16): u16 {
  return randomU16Between(minDamage, maxDamage);
}

/**
 * Simple hash function for strings to u64
 * Used for creating deterministic seeds from IDs
 */
export function hashString(input: string): u64 {
  let hash: u64 = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ u64(input.charCodeAt(i));
  }
  return hash;
}

/**
 * Create a battle seed from battle ID and timestamp
 */
export function createBattleSeed(battleId: string, timestamp: u64): u64 {
  return hashString(battleId) ^ timestamp ^ (timestamp << 32);
}
