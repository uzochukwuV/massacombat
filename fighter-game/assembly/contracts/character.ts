/**
 * Character Management Component
 * Handles character creation, stats, leveling, and upgrades
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import {
  Character,
  CLASS_WARRIOR,
  CLASS_ASSASSIN,
  CLASS_MAGE,
  CLASS_TANK,
  CLASS_TRICKSTER,
  MAX_LEVEL,
  XP_PER_LEVEL,
  BASE_MMR,
} from './types';
import {
  saveCharacter,
  loadCharacter,
  characterExists,
  addCharacterToOwner,
} from './storage';

// ============================================================================
// Class Base Stats Configuration
// ============================================================================

/**
 * Initialize character stats based on class
 */
export function initializeClassStats(character: Character): void {
  switch (character.characterClass) {
    case CLASS_WARRIOR:
      // Balanced fighter with good HP and damage
      character.maxHp = 120;
      character.hp = 120;
      character.damageMin = 12;
      character.damageMax = 18;
      character.critChance = 12;
      character.dodgeChance = 5;
      character.defense = 8;
      break;

    case CLASS_ASSASSIN:
      // Glass cannon with high damage and crit
      character.maxHp = 80;
      character.hp = 80;
      character.damageMin = 15;
      character.damageMax = 25;
      character.critChance = 25;
      character.dodgeChance = 15;
      character.defense = 3;
      break;

    case CLASS_MAGE:
      // Moderate HP with balanced damage
      character.maxHp = 90;
      character.hp = 90;
      character.damageMin = 10;
      character.damageMax = 22;
      character.critChance = 15;
      character.dodgeChance = 8;
      character.defense = 4;
      break;

    case CLASS_TANK:
      // Very high HP, low damage
      character.maxHp = 180;
      character.hp = 180;
      character.damageMin = 8;
      character.damageMax = 12;
      character.critChance = 5;
      character.dodgeChance = 3;
      character.defense = 15;
      break;

    case CLASS_TRICKSTER:
      // Jack of all trades
      character.maxHp = 100;
      character.hp = 100;
      character.damageMin = 10;
      character.damageMax = 16;
      character.critChance = 15;
      character.dodgeChance = 12;
      character.defense = 6;
      break;

    default:
      // Default to warrior stats
      character.maxHp = 100;
      character.hp = 100;
      character.damageMin = 10;
      character.damageMax = 15;
      character.critChance = 10;
      character.dodgeChance = 5;
      character.defense = 5;
  }
}

// ============================================================================
// Character Creation
// ============================================================================

/**
 * Create a new character
 * @param id - Unique character ID
 * @param characterClass - Class type (0-4)
 * @param name - Character name
 */
export function createCharacter(
  id: string,
  characterClass: u8,
  name: string
): Character {
  // Validate class
  assert(characterClass <= CLASS_TRICKSTER, 'Invalid character class');

  // Check character doesn't already exist
  assert(!characterExists(id), 'Character ID already exists');

  // Validate name
  assert(name.length > 0 && name.length <= 32, 'Name must be 1-32 characters');

  const caller = Context.caller().toString();
  const timestamp = Context.timestamp();

  // Create character
  const character = new Character(id, caller, name, characterClass);
  character.level = 1;
  character.xp = 0;
  character.mmr = BASE_MMR;
  character.createdAt = timestamp;

  // Initialize class-specific stats
  initializeClassStats(character);

  // Save to storage
  saveCharacter(character);

  // Add to owner's character list
  addCharacterToOwner(caller, id);

  // Emit event
  generateEvent(
    `CHARACTER_CREATED:${id}:${caller}:${characterClass.toString()}:${name}`
  );

  return character;
}

// ============================================================================
// Character Reading
// ============================================================================

/**
 * Read character data
 * @param id - Character ID
 */
export function readCharacter(id: string): Character {
  const character = loadCharacter(id);
  assert(character != null, 'Character not found');
  return character!;
}

/**
 * Check if caller owns the character
 */
export function isCharacterOwner(characterId: string, address: string): bool {
  const character = loadCharacter(characterId);
  if (character == null) return false;
  return character!.owner == address;
}

/**
 * Assert caller owns the character
 */
export function assertCharacterOwner(characterId: string): Character {
  const character = loadCharacter(characterId);
  assert(character != null, 'Character not found');
  assert(
    character!.owner == Context.caller().toString(),
    'Not character owner'
  );
  return character!;
}

// ============================================================================
// XP and Leveling
// ============================================================================

/**
 * Calculate XP required for next level
 */
export function xpForLevel(level: u8): u64 {
  // XP requirement increases each level
  // Level 1->2: 100 XP
  // Level 2->3: 200 XP
  // etc.
  return u64(level) * XP_PER_LEVEL;
}

/**
 * Grant XP to a character and handle level ups
 * @param charId - Character ID
 * @param amount - XP amount to grant
 */
export function grantXP(charId: string, amount: u64): void {
  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');

  let char = character!;
  char.xp += amount;

  // Check for level ups
  while (char.level < MAX_LEVEL) {
    const xpNeeded = xpForLevel(char.level);
    if (char.xp >= xpNeeded) {
      char.xp -= xpNeeded;
      char.level += 1;

      // Apply level up bonuses
      applyLevelUpBonus(char);

      generateEvent(
        `LEVEL_UP:${charId}:${char.level.toString()}`
      );
    } else {
      break;
    }
  }

  // Cap XP at max level
  if (char.level >= MAX_LEVEL) {
    char.xp = 0;
  }

  saveCharacter(char);
}

/**
 * Apply stat bonuses on level up
 */
function applyLevelUpBonus(character: Character): void {
  // Increase max HP based on class
  switch (character.characterClass) {
    case CLASS_TANK:
      character.maxHp += 15;
      break;
    case CLASS_WARRIOR:
      character.maxHp += 10;
      break;
    case CLASS_TRICKSTER:
      character.maxHp += 8;
      break;
    case CLASS_MAGE:
      character.maxHp += 6;
      break;
    case CLASS_ASSASSIN:
      character.maxHp += 5;
      break;
    default:
      character.maxHp += 8;
  }

  // Heal to full on level up
  character.hp = character.maxHp;

  // Small damage increase every 3 levels
  if (character.level % 3 == 0) {
    character.damageMin += 1;
    character.damageMax += 2;
  }

  // Small crit increase every 5 levels
  if (character.level % 5 == 0) {
    if (character.critChance < 50) {
      character.critChance += 1;
    }
  }

  // Defense increase every 4 levels
  if (character.level % 4 == 0) {
    character.defense += 1;
  }
}

// ============================================================================
// Character Healing
// ============================================================================

/**
 * Heal character to full HP
 * @param charId - Character ID
 */
export function healCharacter(charId: string): void {
  const character = assertCharacterOwner(charId);
  character.hp = character.maxHp;
  saveCharacter(character);

  generateEvent(`CHARACTER_HEALED:${charId}`);
}

// ============================================================================
// Character Upgrades
// ============================================================================

// Upgrade types
const UPGRADE_HP: u8 = 0;
const UPGRADE_DAMAGE: u8 = 1;
const UPGRADE_CRIT: u8 = 2;
const UPGRADE_DODGE: u8 = 3;
const UPGRADE_DEFENSE: u8 = 4;

/**
 * Upgrade a character stat (costs coins - implement payment separately)
 * @param charId - Character ID
 * @param upgradeType - Type of upgrade (0-4)
 */
export function upgradeCharacter(charId: string, upgradeType: u8): void {
  const character = assertCharacterOwner(charId);

  switch (upgradeType) {
    case UPGRADE_HP:
      character.maxHp += 10;
      character.hp += 10;
      break;
    case UPGRADE_DAMAGE:
      character.damageMin += 1;
      character.damageMax += 2;
      break;
    case UPGRADE_CRIT:
      assert(character.critChance < 50, 'Crit chance at maximum');
      character.critChance += 2;
      break;
    case UPGRADE_DODGE:
      assert(character.dodgeChance < 40, 'Dodge chance at maximum');
      character.dodgeChance += 2;
      break;
    case UPGRADE_DEFENSE:
      character.defense += 2;
      break;
    default:
      assert(false, 'Invalid upgrade type');
  }

  saveCharacter(character);

  generateEvent(
    `CHARACTER_UPGRADED:${charId}:${upgradeType.toString()}`
  );
}

// ============================================================================
// Battle Stats Updates
// ============================================================================

/**
 * Record a win for the character
 * @param charId - Character ID
 * @param xpGained - XP earned from the win
 */
export function recordWin(charId: string, xpGained: u64): void {
  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');

  character!.totalWins += 1;
  character!.winStreak += 1;

  saveCharacter(character!);

  // Grant XP separately to handle leveling
  if (xpGained > 0) {
    grantXP(charId, xpGained);
  }
}

/**
 * Record a loss for the character
 * @param charId - Character ID
 */
export function recordLoss(charId: string): void {
  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');

  character!.totalLosses += 1;
  character!.winStreak = 0;

  saveCharacter(character!);
}

/**
 * Update character MMR
 * @param charId - Character ID
 * @param newMMR - New MMR value
 */
export function updateCharacterMMR(charId: string, newMMR: u64): void {
  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');

  character!.mmr = newMMR;
  saveCharacter(character!);
}

// ============================================================================
// Character Stats with Equipment
// ============================================================================

import { loadEquipment } from './storage';

/**
 * Get effective stats including equipment bonuses
 */
export function getEffectiveStats(character: Character): Character {
  // Clone base stats
  let effectiveHp = character.maxHp;
  let effectiveDmgMin = character.damageMin;
  let effectiveDmgMax = character.damageMax;
  let effectiveCrit = character.critChance;
  let effectiveDodge = character.dodgeChance;

  // Add weapon bonuses
  if (character.weaponId.length > 0) {
    const weapon = loadEquipment(character.weaponId);
    if (weapon != null) {
      effectiveDmgMin += weapon.damageMinBonus;
      effectiveDmgMax += weapon.damageMaxBonus;
      effectiveCrit += weapon.critBonus;
    }
  }

  // Add armor bonuses
  if (character.armorId.length > 0) {
    const armor = loadEquipment(character.armorId);
    if (armor != null) {
      effectiveHp += armor.hpBonus;
      effectiveDodge += armor.dodgeBonus;
    }
  }

  // Add accessory bonuses
  if (character.accessoryId.length > 0) {
    const accessory = loadEquipment(character.accessoryId);
    if (accessory != null) {
      effectiveCrit += accessory.critBonus;
      effectiveDodge += accessory.dodgeBonus;
    }
  }

  // Create a new character with effective stats
  const effective = new Character();
  effective.id = character.id;
  effective.owner = character.owner;
  effective.name = character.name;
  effective.characterClass = character.characterClass;
  effective.level = character.level;
  effective.maxHp = effectiveHp;
  effective.hp = character.hp;
  effective.damageMin = effectiveDmgMin;
  effective.damageMax = effectiveDmgMax;
  effective.critChance = effectiveCrit > 100 ? 100 : effectiveCrit;
  effective.dodgeChance = effectiveDodge > 100 ? 100 : effectiveDodge;
  effective.defense = character.defense;
  effective.skillSlot1 = character.skillSlot1;
  effective.skillSlot2 = character.skillSlot2;
  effective.skillSlot3 = character.skillSlot3;
  effective.learnedSkills = character.learnedSkills;

  return effective;
}

/**
 * Get character's class name as string
 */
export function getClassName(classId: u8): string {
  switch (classId) {
    case CLASS_WARRIOR:
      return 'Warrior';
    case CLASS_ASSASSIN:
      return 'Assassin';
    case CLASS_MAGE:
      return 'Mage';
    case CLASS_TANK:
      return 'Tank';
    case CLASS_TRICKSTER:
      return 'Trickster';
    default:
      return 'Unknown';
  }
}
