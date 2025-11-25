/**
 * Core data types for the Fighter Game Smart Contract
 * Defines all serializable structures used across the game
 */

import {
  Args,
  Serializable,
  Result,
} from '@massalabs/as-types';

// ============================================================================
// Constants
// ============================================================================

// Character Classes
export const CLASS_WARRIOR: u8 = 0;
export const CLASS_ASSASSIN: u8 = 1;
export const CLASS_MAGE: u8 = 2;
export const CLASS_TANK: u8 = 3;
export const CLASS_TRICKSTER: u8 = 4;

// Equipment Types
export const EQUIP_WEAPON: u8 = 0;
export const EQUIP_ARMOR: u8 = 1;
export const EQUIP_ACCESSORY: u8 = 2;

// Equipment Rarity
export const RARITY_COMMON: u8 = 0;
export const RARITY_RARE: u8 = 1;
export const RARITY_EPIC: u8 = 2;
export const RARITY_LEGENDARY: u8 = 3;

// Battle States
export const BATTLE_STATE_PENDING: u8 = 0;
export const BATTLE_STATE_ACTIVE: u8 = 1;
export const BATTLE_STATE_WILDCARD: u8 = 2;
export const BATTLE_STATE_COMPLETED: u8 = 3;

// Status Effect Bitmasks
export const STATUS_NONE: u8 = 0;
export const STATUS_POISON: u8 = 1;      // bit 0
export const STATUS_STUN: u8 = 2;        // bit 1
export const STATUS_SHIELD: u8 = 4;      // bit 2
export const STATUS_RAGE: u8 = 8;        // bit 3
export const STATUS_BURN: u8 = 16;       // bit 4

// Skill IDs
export const SKILL_POWER_STRIKE: u8 = 1;
export const SKILL_HEAL: u8 = 2;
export const SKILL_POISON_STRIKE: u8 = 3;
export const SKILL_STUN_STRIKE: u8 = 4;
export const SKILL_SHIELD_WALL: u8 = 5;
export const SKILL_RAGE_MODE: u8 = 6;
export const SKILL_CRITICAL_EYE: u8 = 7;
export const SKILL_DODGE_MASTER: u8 = 8;
export const SKILL_BURN_AURA: u8 = 9;
export const SKILL_COMBO_BREAKER: u8 = 10;

// Stances
export const STANCE_NEUTRAL: u8 = 0;
export const STANCE_AGGRESSIVE: u8 = 1;
export const STANCE_DEFENSIVE: u8 = 2;

// Game Constants
export const MAX_LEVEL: u8 = 20;
export const MAX_ENERGY: u8 = 100;
export const ENERGY_REGEN: u8 = 20;
export const XP_PER_LEVEL: u64 = 100;
export const BASE_MMR: u64 = 1000;
export const WILDCARD_CHANCE: u8 = 10; // 10%
export const WILDCARD_DEADLINE: u64 = 10000; // 10 seconds in ms

// Tournament States
export const TOURNAMENT_REGISTRATION: u8 = 0;
export const TOURNAMENT_ACTIVE: u8 = 1;
export const TOURNAMENT_COMPLETED: u8 = 2;

// Achievement IDs
export const ACH_FIRST_WIN: u8 = 1;
export const ACH_10_WINS: u8 = 2;
export const ACH_50_WINS: u8 = 3;
export const ACH_100_WINS: u8 = 4;
export const ACH_TOURNAMENT_WIN: u8 = 5;
export const ACH_5_WIN_STREAK: u8 = 6;
export const ACH_COMBO_MASTER: u8 = 7;
export const ACH_SKILL_MASTER: u8 = 8;
export const ACH_LEGENDARY_EQUIP: u8 = 9;
export const ACH_MAX_LEVEL: u8 = 10;

// Scheduled Match States
export const MATCH_STATE_SCHEDULED: u8 = 0;   // Accepting predictions
export const MATCH_STATE_LOCKED: u8 = 1;      // Predictions closed, awaiting execution
export const MATCH_STATE_EXECUTING: u8 = 2;   // Match in progress
export const MATCH_STATE_COMPLETED: u8 = 3;   // Match finished, winnings distributed
export const MATCH_STATE_CANCELLED: u8 = 4;   // Match cancelled, refunds issued

// Prediction Market Config
export const MIN_PREDICTION_AMOUNT: u64 = 100_000_000;  // 0.1 MAS minimum bet
export const PREDICTION_LOCK_TIME: u64 = 300_000;       // 5 minutes in ms
export const HOUSE_FEE_PERCENT: u8 = 5;                 // 5% house edge

// Autonomous Execution Fees
export const AUTO_LOCK_FEE: u64 = 10_000_000;      // 0.01 MAS
export const AUTO_EXECUTION_FEE: u64 = 50_000_000;  // 0.05 MAS
export const AUTO_RESOLUTION_FEE: u64 = 100_000_000; // 0.1 MAS
export const AUTO_CLEANUP_FEE: u64 = 20_000_000;    // 0.02 MAS
export const TOTAL_AUTO_FEE: u64 = 180_000_000;     // 0.18 MAS total

// Storage Keys Prefixes
export const KEY_CHARACTER: string = 'char_';
export const KEY_EQUIPMENT: string = 'equip_';
export const KEY_BATTLE: string = 'battle_';
export const KEY_TOURNAMENT: string = 'tourn_';
export const KEY_LEADERBOARD: string = 'lead_';
export const KEY_ACHIEVEMENTS: string = 'ach_';
export const KEY_ADMIN: string = 'admin';
export const KEY_TREASURY: string = 'treasury';
export const KEY_PAUSED: string = 'paused';
export const KEY_REENTRANCY: string = 'reentrancy';

// ============================================================================
// Character Structure
// ============================================================================

@serializable
export class Character implements Serializable {
  id: string = '';
  owner: string = ''; // Address as string
  name: string = '';
  characterClass: u8 = 0;
  level: u8 = 1;
  xp: u64 = 0;

  // Base Stats
  hp: u16 = 100;
  maxHp: u16 = 100;
  damageMin: u8 = 10;
  damageMax: u8 = 15;
  critChance: u8 = 10;  // percentage
  dodgeChance: u8 = 5;  // percentage
  defense: u8 = 5;

  // Equipment Slots (equipment IDs, empty string = no equipment)
  weaponId: string = '';
  armorId: string = '';
  accessoryId: string = '';

  // Skills (equipped skill IDs in slots 1-3, 0 = empty)
  skillSlot1: u8 = 0;
  skillSlot2: u8 = 0;
  skillSlot3: u8 = 0;
  learnedSkills: u16 = 0; // Bitmask of learned skills

  // Stats
  totalWins: u32 = 0;
  totalLosses: u32 = 0;
  mmr: u64 = BASE_MMR;
  winStreak: u8 = 0;
  createdAt: u64 = 0;

  constructor(
    id: string = '',
    owner: string = '',
    name: string = '',
    characterClass: u8 = 0
  ) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.characterClass = characterClass;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.owner);
    args.add(this.name);
    args.add(this.characterClass);
    args.add(this.level);
    args.add(this.xp);
    args.add(this.hp);
    args.add(this.maxHp);
    args.add(this.damageMin);
    args.add(this.damageMax);
    args.add(this.critChance);
    args.add(this.dodgeChance);
    args.add(this.defense);
    args.add(this.weaponId);
    args.add(this.armorId);
    args.add(this.accessoryId);
    args.add(this.skillSlot1);
    args.add(this.skillSlot2);
    args.add(this.skillSlot3);
    args.add(this.learnedSkills);
    args.add(this.totalWins);
    args.add(this.totalLosses);
    args.add(this.mmr);
    args.add(this.winStreak);
    args.add(this.createdAt);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const idResult = args.nextString();
    if (idResult.isErr()) return new Result(0, 'Failed to deserialize id');
    this.id = idResult.unwrap();

    const ownerResult = args.nextString();
    if (ownerResult.isErr()) return new Result(0, 'Failed to deserialize owner');
    this.owner = ownerResult.unwrap();

    const nameResult = args.nextString();
    if (nameResult.isErr()) return new Result(0, 'Failed to deserialize name');
    this.name = nameResult.unwrap();

    const classResult = args.nextU8();
    if (classResult.isErr()) return new Result(0, 'Failed to deserialize class');
    this.characterClass = classResult.unwrap();

    const levelResult = args.nextU8();
    if (levelResult.isErr()) return new Result(0, 'Failed to deserialize level');
    this.level = levelResult.unwrap();

    const xpResult = args.nextU64();
    if (xpResult.isErr()) return new Result(0, 'Failed to deserialize xp');
    this.xp = xpResult.unwrap();

    const hpResult = args.nextU16();
    if (hpResult.isErr()) return new Result(0, 'Failed to deserialize hp');
    this.hp = hpResult.unwrap();

    const maxHpResult = args.nextU16();
    if (maxHpResult.isErr()) return new Result(0, 'Failed to deserialize maxHp');
    this.maxHp = maxHpResult.unwrap();

    const dmgMinResult = args.nextU8();
    if (dmgMinResult.isErr()) return new Result(0, 'Failed to deserialize damageMin');
    this.damageMin = dmgMinResult.unwrap();

    const dmgMaxResult = args.nextU8();
    if (dmgMaxResult.isErr()) return new Result(0, 'Failed to deserialize damageMax');
    this.damageMax = dmgMaxResult.unwrap();

    const critResult = args.nextU8();
    if (critResult.isErr()) return new Result(0, 'Failed to deserialize critChance');
    this.critChance = critResult.unwrap();

    const dodgeResult = args.nextU8();
    if (dodgeResult.isErr()) return new Result(0, 'Failed to deserialize dodgeChance');
    this.dodgeChance = dodgeResult.unwrap();

    const defResult = args.nextU8();
    if (defResult.isErr()) return new Result(0, 'Failed to deserialize defense');
    this.defense = defResult.unwrap();

    const weaponResult = args.nextString();
    if (weaponResult.isErr()) return new Result(0, 'Failed to deserialize weaponId');
    this.weaponId = weaponResult.unwrap();

    const armorResult = args.nextString();
    if (armorResult.isErr()) return new Result(0, 'Failed to deserialize armorId');
    this.armorId = armorResult.unwrap();

    const accResult = args.nextString();
    if (accResult.isErr()) return new Result(0, 'Failed to deserialize accessoryId');
    this.accessoryId = accResult.unwrap();

    const slot1Result = args.nextU8();
    if (slot1Result.isErr()) return new Result(0, 'Failed to deserialize skillSlot1');
    this.skillSlot1 = slot1Result.unwrap();

    const slot2Result = args.nextU8();
    if (slot2Result.isErr()) return new Result(0, 'Failed to deserialize skillSlot2');
    this.skillSlot2 = slot2Result.unwrap();

    const slot3Result = args.nextU8();
    if (slot3Result.isErr()) return new Result(0, 'Failed to deserialize skillSlot3');
    this.skillSlot3 = slot3Result.unwrap();

    const learnedResult = args.nextU16();
    if (learnedResult.isErr()) return new Result(0, 'Failed to deserialize learnedSkills');
    this.learnedSkills = learnedResult.unwrap();

    const winsResult = args.nextU32();
    if (winsResult.isErr()) return new Result(0, 'Failed to deserialize totalWins');
    this.totalWins = winsResult.unwrap();

    const lossesResult = args.nextU32();
    if (lossesResult.isErr()) return new Result(0, 'Failed to deserialize totalLosses');
    this.totalLosses = lossesResult.unwrap();

    const mmrResult = args.nextU64();
    if (mmrResult.isErr()) return new Result(0, 'Failed to deserialize mmr');
    this.mmr = mmrResult.unwrap();

    const streakResult = args.nextU8();
    if (streakResult.isErr()) return new Result(0, 'Failed to deserialize winStreak');
    this.winStreak = streakResult.unwrap();

    const createdResult = args.nextU64();
    if (createdResult.isErr()) return new Result(0, 'Failed to deserialize createdAt');
    this.createdAt = createdResult.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Equipment Structure
// ============================================================================

@serializable
export class Equipment implements Serializable {
  id: string = '';
  owner: string = '';
  equipmentType: u8 = 0;
  rarity: u8 = 0;

  // Stat Bonuses
  hpBonus: u16 = 0;
  damageMinBonus: u8 = 0;
  damageMaxBonus: u8 = 0;
  critBonus: u8 = 0;
  dodgeBonus: u8 = 0;

  durability: u16 = 100;
  maxDurability: u16 = 100;
  equippedTo: string = ''; // Character ID if equipped
  createdAt: u64 = 0;

  constructor(
    id: string = '',
    owner: string = '',
    equipmentType: u8 = 0,
    rarity: u8 = 0
  ) {
    this.id = id;
    this.owner = owner;
    this.equipmentType = equipmentType;
    this.rarity = rarity;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.owner);
    args.add(this.equipmentType);
    args.add(this.rarity);
    args.add(this.hpBonus);
    args.add(this.damageMinBonus);
    args.add(this.damageMaxBonus);
    args.add(this.critBonus);
    args.add(this.dodgeBonus);
    args.add(this.durability);
    args.add(this.maxDurability);
    args.add(this.equippedTo);
    args.add(this.createdAt);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const idRes = args.nextString();
    if (idRes.isErr()) return new Result(0, 'Failed to deserialize id');
    this.id = idRes.unwrap();

    const ownerRes = args.nextString();
    if (ownerRes.isErr()) return new Result(0, 'Failed to deserialize owner');
    this.owner = ownerRes.unwrap();

    const typeRes = args.nextU8();
    if (typeRes.isErr()) return new Result(0, 'Failed to deserialize type');
    this.equipmentType = typeRes.unwrap();

    const rarityRes = args.nextU8();
    if (rarityRes.isErr()) return new Result(0, 'Failed to deserialize rarity');
    this.rarity = rarityRes.unwrap();

    const hpRes = args.nextU16();
    if (hpRes.isErr()) return new Result(0, 'Failed to deserialize hpBonus');
    this.hpBonus = hpRes.unwrap();

    const dmgMinRes = args.nextU8();
    if (dmgMinRes.isErr()) return new Result(0, 'Failed to deserialize damageMinBonus');
    this.damageMinBonus = dmgMinRes.unwrap();

    const dmgMaxRes = args.nextU8();
    if (dmgMaxRes.isErr()) return new Result(0, 'Failed to deserialize damageMaxBonus');
    this.damageMaxBonus = dmgMaxRes.unwrap();

    const critRes = args.nextU8();
    if (critRes.isErr()) return new Result(0, 'Failed to deserialize critBonus');
    this.critBonus = critRes.unwrap();

    const dodgeRes = args.nextU8();
    if (dodgeRes.isErr()) return new Result(0, 'Failed to deserialize dodgeBonus');
    this.dodgeBonus = dodgeRes.unwrap();

    const durRes = args.nextU16();
    if (durRes.isErr()) return new Result(0, 'Failed to deserialize durability');
    this.durability = durRes.unwrap();

    const maxDurRes = args.nextU16();
    if (maxDurRes.isErr()) return new Result(0, 'Failed to deserialize maxDurability');
    this.maxDurability = maxDurRes.unwrap();

    const equippedRes = args.nextString();
    if (equippedRes.isErr()) return new Result(0, 'Failed to deserialize equippedTo');
    this.equippedTo = equippedRes.unwrap();

    const createdRes = args.nextU64();
    if (createdRes.isErr()) return new Result(0, 'Failed to deserialize createdAt');
    this.createdAt = createdRes.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Battle Player State
// ============================================================================

@serializable
export class BattlePlayer implements Serializable {
  characterId: string = '';
  currentHp: u16 = 0;
  maxHp: u16 = 0;
  energy: u8 = MAX_ENERGY;
  statusEffects: u8 = STATUS_NONE;
  poisonTurns: u8 = 0;
  stunTurns: u8 = 0;
  shieldTurns: u8 = 0;
  rageTurns: u8 = 0;
  burnTurns: u8 = 0;
  comboCount: u8 = 0;
  guaranteedCrit: bool = false;
  dodgeBoost: u8 = 0;
  dodgeBoostTurns: u8 = 0;

  // Cooldowns (per skill, stored as turns remaining)
  cooldown1: u8 = 0;
  cooldown2: u8 = 0;
  cooldown3: u8 = 0;
  cooldown4: u8 = 0;
  cooldown5: u8 = 0;
  cooldown6: u8 = 0;
  cooldown7: u8 = 0;
  cooldown8: u8 = 0;
  cooldown9: u8 = 0;
  cooldown10: u8 = 0;

  constructor(characterId: string = '', hp: u16 = 0, maxHp: u16 = 0) {
    this.characterId = characterId;
    this.currentHp = hp;
    this.maxHp = maxHp;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.characterId);
    args.add(this.currentHp);
    args.add(this.maxHp);
    args.add(this.energy);
    args.add(this.statusEffects);
    args.add(this.poisonTurns);
    args.add(this.stunTurns);
    args.add(this.shieldTurns);
    args.add(this.rageTurns);
    args.add(this.burnTurns);
    args.add(this.comboCount);
    args.add(this.guaranteedCrit);
    args.add(this.dodgeBoost);
    args.add(this.dodgeBoostTurns);
    args.add(this.cooldown1);
    args.add(this.cooldown2);
    args.add(this.cooldown3);
    args.add(this.cooldown4);
    args.add(this.cooldown5);
    args.add(this.cooldown6);
    args.add(this.cooldown7);
    args.add(this.cooldown8);
    args.add(this.cooldown9);
    args.add(this.cooldown10);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const charRes = args.nextString();
    if (charRes.isErr()) return new Result(0, 'Failed');
    this.characterId = charRes.unwrap();

    const hpRes = args.nextU16();
    if (hpRes.isErr()) return new Result(0, 'Failed');
    this.currentHp = hpRes.unwrap();

    const maxHpRes = args.nextU16();
    if (maxHpRes.isErr()) return new Result(0, 'Failed');
    this.maxHp = maxHpRes.unwrap();

    const energyRes = args.nextU8();
    if (energyRes.isErr()) return new Result(0, 'Failed');
    this.energy = energyRes.unwrap();

    const statusRes = args.nextU8();
    if (statusRes.isErr()) return new Result(0, 'Failed');
    this.statusEffects = statusRes.unwrap();

    const poisonRes = args.nextU8();
    if (poisonRes.isErr()) return new Result(0, 'Failed');
    this.poisonTurns = poisonRes.unwrap();

    const stunRes = args.nextU8();
    if (stunRes.isErr()) return new Result(0, 'Failed');
    this.stunTurns = stunRes.unwrap();

    const shieldRes = args.nextU8();
    if (shieldRes.isErr()) return new Result(0, 'Failed');
    this.shieldTurns = shieldRes.unwrap();

    const rageRes = args.nextU8();
    if (rageRes.isErr()) return new Result(0, 'Failed');
    this.rageTurns = rageRes.unwrap();

    const burnRes = args.nextU8();
    if (burnRes.isErr()) return new Result(0, 'Failed');
    this.burnTurns = burnRes.unwrap();

    const comboRes = args.nextU8();
    if (comboRes.isErr()) return new Result(0, 'Failed');
    this.comboCount = comboRes.unwrap();

    const critRes = args.nextBool();
    if (critRes.isErr()) return new Result(0, 'Failed');
    this.guaranteedCrit = critRes.unwrap();

    const dodgeBoostRes = args.nextU8();
    if (dodgeBoostRes.isErr()) return new Result(0, 'Failed');
    this.dodgeBoost = dodgeBoostRes.unwrap();

    const dodgeTurnsRes = args.nextU8();
    if (dodgeTurnsRes.isErr()) return new Result(0, 'Failed');
    this.dodgeBoostTurns = dodgeTurnsRes.unwrap();

    const cd1 = args.nextU8();
    if (cd1.isErr()) return new Result(0, 'Failed');
    this.cooldown1 = cd1.unwrap();

    const cd2 = args.nextU8();
    if (cd2.isErr()) return new Result(0, 'Failed');
    this.cooldown2 = cd2.unwrap();

    const cd3 = args.nextU8();
    if (cd3.isErr()) return new Result(0, 'Failed');
    this.cooldown3 = cd3.unwrap();

    const cd4 = args.nextU8();
    if (cd4.isErr()) return new Result(0, 'Failed');
    this.cooldown4 = cd4.unwrap();

    const cd5 = args.nextU8();
    if (cd5.isErr()) return new Result(0, 'Failed');
    this.cooldown5 = cd5.unwrap();

    const cd6 = args.nextU8();
    if (cd6.isErr()) return new Result(0, 'Failed');
    this.cooldown6 = cd6.unwrap();

    const cd7 = args.nextU8();
    if (cd7.isErr()) return new Result(0, 'Failed');
    this.cooldown7 = cd7.unwrap();

    const cd8 = args.nextU8();
    if (cd8.isErr()) return new Result(0, 'Failed');
    this.cooldown8 = cd8.unwrap();

    const cd9 = args.nextU8();
    if (cd9.isErr()) return new Result(0, 'Failed');
    this.cooldown9 = cd9.unwrap();

    const cd10 = args.nextU8();
    if (cd10.isErr()) return new Result(0, 'Failed');
    this.cooldown10 = cd10.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Battle Structure
// ============================================================================

@serializable
export class Battle implements Serializable {
  id: string = '';
  player1: BattlePlayer = new BattlePlayer();
  player2: BattlePlayer = new BattlePlayer();
  currentTurn: u8 = 1; // 1 or 2
  turnNumber: u32 = 0;
  state: u8 = BATTLE_STATE_PENDING;
  winnerId: string = '';
  startTimestamp: u64 = 0;
  lastActionTimestamp: u64 = 0;

  // Wildcard state
  wildcardActive: bool = false;
  wildcardType: u8 = 0;
  wildcardDeadline: u64 = 0;
  player1WildcardDecision: u8 = 255; // 255 = no decision, 0 = reject, 1 = accept
  player2WildcardDecision: u8 = 255;

  // Random seed
  randomSeed: u64 = 0;

  constructor(id: string = '') {
    this.id = id;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.player1);
    args.add(this.player2);
    args.add(this.currentTurn);
    args.add(this.turnNumber);
    args.add(this.state);
    args.add(this.winnerId);
    args.add(this.startTimestamp);
    args.add(this.lastActionTimestamp);
    args.add(this.wildcardActive);
    args.add(this.wildcardType);
    args.add(this.wildcardDeadline);
    args.add(this.player1WildcardDecision);
    args.add(this.player2WildcardDecision);
    args.add(this.randomSeed);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const idRes = args.nextString();
    if (idRes.isErr()) return new Result(0, 'Failed');
    this.id = idRes.unwrap();

    const p1Res = args.nextSerializable<BattlePlayer>();
    if (p1Res.isErr()) return new Result(0, 'Failed');
    this.player1 = p1Res.unwrap();

    const p2Res = args.nextSerializable<BattlePlayer>();
    if (p2Res.isErr()) return new Result(0, 'Failed');
    this.player2 = p2Res.unwrap();

    const turnRes = args.nextU8();
    if (turnRes.isErr()) return new Result(0, 'Failed');
    this.currentTurn = turnRes.unwrap();

    const turnNumRes = args.nextU32();
    if (turnNumRes.isErr()) return new Result(0, 'Failed');
    this.turnNumber = turnNumRes.unwrap();

    const stateRes = args.nextU8();
    if (stateRes.isErr()) return new Result(0, 'Failed');
    this.state = stateRes.unwrap();

    const winnerRes = args.nextString();
    if (winnerRes.isErr()) return new Result(0, 'Failed');
    this.winnerId = winnerRes.unwrap();

    const startRes = args.nextU64();
    if (startRes.isErr()) return new Result(0, 'Failed');
    this.startTimestamp = startRes.unwrap();

    const lastRes = args.nextU64();
    if (lastRes.isErr()) return new Result(0, 'Failed');
    this.lastActionTimestamp = lastRes.unwrap();

    const wcActiveRes = args.nextBool();
    if (wcActiveRes.isErr()) return new Result(0, 'Failed');
    this.wildcardActive = wcActiveRes.unwrap();

    const wcTypeRes = args.nextU8();
    if (wcTypeRes.isErr()) return new Result(0, 'Failed');
    this.wildcardType = wcTypeRes.unwrap();

    const wcDeadRes = args.nextU64();
    if (wcDeadRes.isErr()) return new Result(0, 'Failed');
    this.wildcardDeadline = wcDeadRes.unwrap();

    const p1DecRes = args.nextU8();
    if (p1DecRes.isErr()) return new Result(0, 'Failed');
    this.player1WildcardDecision = p1DecRes.unwrap();

    const p2DecRes = args.nextU8();
    if (p2DecRes.isErr()) return new Result(0, 'Failed');
    this.player2WildcardDecision = p2DecRes.unwrap();

    const seedRes = args.nextU64();
    if (seedRes.isErr()) return new Result(0, 'Failed');
    this.randomSeed = seedRes.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Tournament Structure
// ============================================================================

@serializable
export class Tournament implements Serializable {
  id: string = '';
  name: string = '';
  entryFee: u64 = 0;
  prizePool: u64 = 0;
  maxParticipants: u8 = 8;
  currentRound: u8 = 0;
  state: u8 = TOURNAMENT_REGISTRATION;

  // Participants stored as comma-separated character IDs
  participants: string = '';
  // Bracket stored as comma-separated pairs for each round
  bracket: string = '';

  winnerId: string = '';
  runnerUpId: string = '';
  thirdPlaceId: string = '';

  createdAt: u64 = 0;
  startedAt: u64 = 0;
  endedAt: u64 = 0;

  constructor(id: string = '') {
    this.id = id;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.id);
    args.add(this.name);
    args.add(this.entryFee);
    args.add(this.prizePool);
    args.add(this.maxParticipants);
    args.add(this.currentRound);
    args.add(this.state);
    args.add(this.participants);
    args.add(this.bracket);
    args.add(this.winnerId);
    args.add(this.runnerUpId);
    args.add(this.thirdPlaceId);
    args.add(this.createdAt);
    args.add(this.startedAt);
    args.add(this.endedAt);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const idRes = args.nextString();
    if (idRes.isErr()) return new Result(0, 'Failed');
    this.id = idRes.unwrap();

    const nameRes = args.nextString();
    if (nameRes.isErr()) return new Result(0, 'Failed');
    this.name = nameRes.unwrap();

    const feeRes = args.nextU64();
    if (feeRes.isErr()) return new Result(0, 'Failed');
    this.entryFee = feeRes.unwrap();

    const prizeRes = args.nextU64();
    if (prizeRes.isErr()) return new Result(0, 'Failed');
    this.prizePool = prizeRes.unwrap();

    const maxRes = args.nextU8();
    if (maxRes.isErr()) return new Result(0, 'Failed');
    this.maxParticipants = maxRes.unwrap();

    const roundRes = args.nextU8();
    if (roundRes.isErr()) return new Result(0, 'Failed');
    this.currentRound = roundRes.unwrap();

    const stateRes = args.nextU8();
    if (stateRes.isErr()) return new Result(0, 'Failed');
    this.state = stateRes.unwrap();

    const partRes = args.nextString();
    if (partRes.isErr()) return new Result(0, 'Failed');
    this.participants = partRes.unwrap();

    const bracketRes = args.nextString();
    if (bracketRes.isErr()) return new Result(0, 'Failed');
    this.bracket = bracketRes.unwrap();

    const winRes = args.nextString();
    if (winRes.isErr()) return new Result(0, 'Failed');
    this.winnerId = winRes.unwrap();

    const runnerRes = args.nextString();
    if (runnerRes.isErr()) return new Result(0, 'Failed');
    this.runnerUpId = runnerRes.unwrap();

    const thirdRes = args.nextString();
    if (thirdRes.isErr()) return new Result(0, 'Failed');
    this.thirdPlaceId = thirdRes.unwrap();

    const createdRes = args.nextU64();
    if (createdRes.isErr()) return new Result(0, 'Failed');
    this.createdAt = createdRes.unwrap();

    const startedRes = args.nextU64();
    if (startedRes.isErr()) return new Result(0, 'Failed');
    this.startedAt = startedRes.unwrap();

    const endedRes = args.nextU64();
    if (endedRes.isErr()) return new Result(0, 'Failed');
    this.endedAt = endedRes.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Leaderboard Entry
// ============================================================================

@serializable
export class LeaderboardEntry implements Serializable {
  characterId: string = '';
  ownerAddress: string = '';
  mmr: u64 = 0;
  wins: u32 = 0;
  losses: u32 = 0;

  constructor(characterId: string = '', ownerAddress: string = '', mmr: u64 = 0) {
    this.characterId = characterId;
    this.ownerAddress = ownerAddress;
    this.mmr = mmr;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.characterId);
    args.add(this.ownerAddress);
    args.add(this.mmr);
    args.add(this.wins);
    args.add(this.losses);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const charRes = args.nextString();
    if (charRes.isErr()) return new Result(0, 'Failed');
    this.characterId = charRes.unwrap();

    const ownerRes = args.nextString();
    if (ownerRes.isErr()) return new Result(0, 'Failed');
    this.ownerAddress = ownerRes.unwrap();

    const mmrRes = args.nextU64();
    if (mmrRes.isErr()) return new Result(0, 'Failed');
    this.mmr = mmrRes.unwrap();

    const winsRes = args.nextU32();
    if (winsRes.isErr()) return new Result(0, 'Failed');
    this.wins = winsRes.unwrap();

    const lossesRes = args.nextU32();
    if (lossesRes.isErr()) return new Result(0, 'Failed');
    this.losses = lossesRes.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Achievement Tracker
// ============================================================================

@serializable
export class AchievementTracker implements Serializable {
  ownerAddress: string = '';
  unlockedAchievements: u16 = 0; // Bitmask
  timestamps: string = ''; // Comma-separated timestamps for each achievement

  constructor(ownerAddress: string = '') {
    this.ownerAddress = ownerAddress;
  }

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.ownerAddress);
    args.add(this.unlockedAchievements);
    args.add(this.timestamps);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const ownerRes = args.nextString();
    if (ownerRes.isErr()) return new Result(0, 'Failed');
    this.ownerAddress = ownerRes.unwrap();

    const achRes = args.nextU16();
    if (achRes.isErr()) return new Result(0, 'Failed');
    this.unlockedAchievements = achRes.unwrap();

    const tsRes = args.nextString();
    if (tsRes.isErr()) return new Result(0, 'Failed');
    this.timestamps = tsRes.unwrap();

    return new Result(args.offset);
  }
}

// ============================================================================
// Prediction Market System
// ============================================================================

/**
 * Scheduled Match for prediction markets
 */
@serializable
export class ScheduledMatch implements Serializable {
  matchId: string = '';
  character1Id: string = '';
  character2Id: string = '';

  // Timing
  scheduledTime: u64 = 0;     // Timestamp when match will occur
  createdAt: u64 = 0;
  lockTime: u64 = 0;          // When predictions close (5 min before)

  // State
  state: u8 = 0;              // MATCH_STATE_*

  // Result
  winnerId: string = '';       // Winner character ID (empty until completed)
  battleId: string = '';       // Associated battle ID once executed

  // Market Info
  marketId: string = '';       // Associated prediction market ID

  // Metadata
  creator: string = '';        // Who scheduled this match
  description: string = '';    // Match description/title

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.matchId);
    args.add(this.character1Id);
    args.add(this.character2Id);
    args.add(this.scheduledTime);
    args.add(this.createdAt);
    args.add(this.lockTime);
    args.add(this.state);
    args.add(this.winnerId);
    args.add(this.battleId);
    args.add(this.marketId);
    args.add(this.creator);
    args.add(this.description);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const matchIdRes = args.nextString();
    if (matchIdRes.isErr()) return new Result(0, 'Failed');
    this.matchId = matchIdRes.unwrap();

    const char1Res = args.nextString();
    if (char1Res.isErr()) return new Result(0, 'Failed');
    this.character1Id = char1Res.unwrap();

    const char2Res = args.nextString();
    if (char2Res.isErr()) return new Result(0, 'Failed');
    this.character2Id = char2Res.unwrap();

    const schedTimeRes = args.nextU64();
    if (schedTimeRes.isErr()) return new Result(0, 'Failed');
    this.scheduledTime = schedTimeRes.unwrap();

    const createdRes = args.nextU64();
    if (createdRes.isErr()) return new Result(0, 'Failed');
    this.createdAt = createdRes.unwrap();

    const lockRes = args.nextU64();
    if (lockRes.isErr()) return new Result(0, 'Failed');
    this.lockTime = lockRes.unwrap();

    const stateRes = args.nextU8();
    if (stateRes.isErr()) return new Result(0, 'Failed');
    this.state = stateRes.unwrap();

    const winnerRes = args.nextString();
    if (winnerRes.isErr()) return new Result(0, 'Failed');
    this.winnerId = winnerRes.unwrap();

    const battleRes = args.nextString();
    if (battleRes.isErr()) return new Result(0, 'Failed');
    this.battleId = battleRes.unwrap();

    const marketRes = args.nextString();
    if (marketRes.isErr()) return new Result(0, 'Failed');
    this.marketId = marketRes.unwrap();

    const creatorRes = args.nextString();
    if (creatorRes.isErr()) return new Result(0, 'Failed');
    this.creator = creatorRes.unwrap();

    const descRes = args.nextString();
    if (descRes.isErr()) return new Result(0, 'Failed');
    this.description = descRes.unwrap();

    return new Result(args.offset);
  }
}

/**
 * Prediction Market
 */
@serializable
export class PredictionMarket implements Serializable {
  marketId: string = '';
  matchId: string = '';        // Associated scheduled match

  // Pool Tracking
  totalPool: u64 = 0;          // Total MAS in pool
  char1Pool: u64 = 0;          // MAS bet on character 1
  char2Pool: u64 = 0;          // MAS bet on character 2

  // Prediction Counts
  char1PredictionCount: u32 = 0;
  char2PredictionCount: u32 = 0;

  // State
  isOpen: bool = true;         // Whether accepting predictions
  isResolved: bool = false;    // Whether winnings distributed

  // House Edge
  houseFeePercent: u8 = 5;     // 5% house edge
  houseFee: u64 = 0;           // Actual fee collected

  // Result
  winnerId: string = '';       // Winning character ID

  createdAt: u64 = 0;

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.marketId);
    args.add(this.matchId);
    args.add(this.totalPool);
    args.add(this.char1Pool);
    args.add(this.char2Pool);
    args.add(this.char1PredictionCount);
    args.add(this.char2PredictionCount);
    args.add(this.isOpen);
    args.add(this.isResolved);
    args.add(this.houseFeePercent);
    args.add(this.houseFee);
    args.add(this.winnerId);
    args.add(this.createdAt);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const marketIdRes = args.nextString();
    if (marketIdRes.isErr()) return new Result(0, 'Failed');
    this.marketId = marketIdRes.unwrap();

    const matchIdRes = args.nextString();
    if (matchIdRes.isErr()) return new Result(0, 'Failed');
    this.matchId = matchIdRes.unwrap();

    const totalRes = args.nextU64();
    if (totalRes.isErr()) return new Result(0, 'Failed');
    this.totalPool = totalRes.unwrap();

    const char1PoolRes = args.nextU64();
    if (char1PoolRes.isErr()) return new Result(0, 'Failed');
    this.char1Pool = char1PoolRes.unwrap();

    const char2PoolRes = args.nextU64();
    if (char2PoolRes.isErr()) return new Result(0, 'Failed');
    this.char2Pool = char2PoolRes.unwrap();

    const char1CountRes = args.nextU32();
    if (char1CountRes.isErr()) return new Result(0, 'Failed');
    this.char1PredictionCount = char1CountRes.unwrap();

    const char2CountRes = args.nextU32();
    if (char2CountRes.isErr()) return new Result(0, 'Failed');
    this.char2PredictionCount = char2CountRes.unwrap();

    const openRes = args.nextBool();
    if (openRes.isErr()) return new Result(0, 'Failed');
    this.isOpen = openRes.unwrap();

    const resolvedRes = args.nextBool();
    if (resolvedRes.isErr()) return new Result(0, 'Failed');
    this.isResolved = resolvedRes.unwrap();

    const feePercentRes = args.nextU8();
    if (feePercentRes.isErr()) return new Result(0, 'Failed');
    this.houseFeePercent = feePercentRes.unwrap();

    const houseFeeRes = args.nextU64();
    if (houseFeeRes.isErr()) return new Result(0, 'Failed');
    this.houseFee = houseFeeRes.unwrap();

    const winnerRes = args.nextString();
    if (winnerRes.isErr()) return new Result(0, 'Failed');
    this.winnerId = winnerRes.unwrap();

    const createdRes = args.nextU64();
    if (createdRes.isErr()) return new Result(0, 'Failed');
    this.createdAt = createdRes.unwrap();

    return new Result(args.offset);
  }
}

/**
 * Individual Prediction
 */
@serializable
export class Prediction implements Serializable {
  predictionId: string = '';
  marketId: string = '';
  predictor: string = '';      // Address who made prediction

  predictedWinnerId: string = '';  // Character they bet on
  amount: u64 = 0;             // Amount bet in nanoMAS

  // Payout
  payout: u64 = 0;             // Amount won (0 if lost)
  claimed: bool = false;       // Whether winnings claimed

  timestamp: u64 = 0;

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.predictionId);
    args.add(this.marketId);
    args.add(this.predictor);
    args.add(this.predictedWinnerId);
    args.add(this.amount);
    args.add(this.payout);
    args.add(this.claimed);
    args.add(this.timestamp);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32 = 0): Result<i32> {
    const args = new Args(data, offset);

    const predIdRes = args.nextString();
    if (predIdRes.isErr()) return new Result(0, 'Failed');
    this.predictionId = predIdRes.unwrap();

    const marketIdRes = args.nextString();
    if (marketIdRes.isErr()) return new Result(0, 'Failed');
    this.marketId = marketIdRes.unwrap();

    const predictorRes = args.nextString();
    if (predictorRes.isErr()) return new Result(0, 'Failed');
    this.predictor = predictorRes.unwrap();

    const winnerIdRes = args.nextString();
    if (winnerIdRes.isErr()) return new Result(0, 'Failed');
    this.predictedWinnerId = winnerIdRes.unwrap();

    const amountRes = args.nextU64();
    if (amountRes.isErr()) return new Result(0, 'Failed');
    this.amount = amountRes.unwrap();

    const payoutRes = args.nextU64();
    if (payoutRes.isErr()) return new Result(0, 'Failed');
    this.payout = payoutRes.unwrap();

    const claimedRes = args.nextBool();
    if (claimedRes.isErr()) return new Result(0, 'Failed');
    this.claimed = claimedRes.unwrap();

    const timestampRes = args.nextU64();
    if (timestampRes.isErr()) return new Result(0, 'Failed');
    this.timestamp = timestampRes.unwrap();

    return new Result(args.offset);
  }
}
