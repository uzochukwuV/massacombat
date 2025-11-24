/**
 * Skill System Component
 * Handles skill learning, equipping, energy management, and cooldowns
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import {
  Character,
  BattlePlayer,
  SKILL_POWER_STRIKE,
  SKILL_HEAL,
  SKILL_POISON_STRIKE,
  SKILL_STUN_STRIKE,
  SKILL_SHIELD_WALL,
  SKILL_RAGE_MODE,
  SKILL_CRITICAL_EYE,
  SKILL_DODGE_MASTER,
  SKILL_BURN_AURA,
  SKILL_COMBO_BREAKER,
  MAX_ENERGY,
  ENERGY_REGEN,
  STATUS_POISON,
  STATUS_STUN,
  STATUS_SHIELD,
  STATUS_RAGE,
  STATUS_BURN,
} from './types';
import { saveCharacter, loadCharacter } from './storage';

// ============================================================================
// Skill Configuration
// ============================================================================

/**
 * Get energy cost for a skill
 */
export function getSkillEnergyCost(skillId: u8): u8 {
  switch (skillId) {
    case SKILL_POWER_STRIKE:
      return 30;
    case SKILL_HEAL:
      return 40;
    case SKILL_POISON_STRIKE:
      return 25;
    case SKILL_STUN_STRIKE:
      return 50;
    case SKILL_SHIELD_WALL:
      return 30;
    case SKILL_RAGE_MODE:
      return 40;
    case SKILL_CRITICAL_EYE:
      return 60;
    case SKILL_DODGE_MASTER:
      return 50;
    case SKILL_BURN_AURA:
      return 35;
    case SKILL_COMBO_BREAKER:
      return 45;
    default:
      return 0;
  }
}

/**
 * Get cooldown (in turns) for a skill
 */
export function getSkillCooldown(skillId: u8): u8 {
  switch (skillId) {
    case SKILL_POWER_STRIKE:
      return 3;
    case SKILL_HEAL:
      return 4;
    case SKILL_POISON_STRIKE:
      return 2;
    case SKILL_STUN_STRIKE:
      return 5;
    case SKILL_SHIELD_WALL:
      return 3;
    case SKILL_RAGE_MODE:
      return 4;
    case SKILL_CRITICAL_EYE:
      return 6;
    case SKILL_DODGE_MASTER:
      return 5;
    case SKILL_BURN_AURA:
      return 3;
    case SKILL_COMBO_BREAKER:
      return 4;
    default:
      return 0;
  }
}

/**
 * Get damage multiplier for skill (100 = 1.0x, 150 = 1.5x)
 */
export function getSkillDamageMultiplier(skillId: u8): u8 {
  switch (skillId) {
    case SKILL_POWER_STRIKE:
      return 150; // 1.5x damage
    case SKILL_POISON_STRIKE:
      return 100; // Normal damage + poison
    case SKILL_STUN_STRIKE:
      return 80;  // Reduced damage + stun
    case SKILL_BURN_AURA:
      return 100; // Normal damage + burn
    case SKILL_COMBO_BREAKER:
      return 120; // 1.2x damage + reset combo
    default:
      return 100; // Skills without damage component
  }
}

/**
 * Get skill name
 */
export function getSkillName(skillId: u8): string {
  switch (skillId) {
    case SKILL_POWER_STRIKE:
      return 'Power Strike';
    case SKILL_HEAL:
      return 'Heal';
    case SKILL_POISON_STRIKE:
      return 'Poison Strike';
    case SKILL_STUN_STRIKE:
      return 'Stun Strike';
    case SKILL_SHIELD_WALL:
      return 'Shield Wall';
    case SKILL_RAGE_MODE:
      return 'Rage Mode';
    case SKILL_CRITICAL_EYE:
      return 'Critical Eye';
    case SKILL_DODGE_MASTER:
      return 'Dodge Master';
    case SKILL_BURN_AURA:
      return 'Burn Aura';
    case SKILL_COMBO_BREAKER:
      return 'Combo Breaker';
    default:
      return 'Unknown';
  }
}

/**
 * Check if skill is valid
 */
export function isValidSkill(skillId: u8): bool {
  return skillId >= SKILL_POWER_STRIKE && skillId <= SKILL_COMBO_BREAKER;
}

// ============================================================================
// Skill Learning
// ============================================================================

/**
 * Learn a skill for a character
 * @param characterId - Character ID
 * @param skillId - Skill ID to learn
 */
export function learnSkill(characterId: string, skillId: u8): void {
  assert(isValidSkill(skillId), 'Invalid skill ID');

  const character = loadCharacter(characterId);
  assert(character != null, 'Character not found');
  assert(
    character!.owner == Context.caller().toString(),
    'Not character owner'
  );

  // Check if already learned (bitmask check)
  const skillBit: u16 = u16(1) << (skillId - 1);
  assert(
    (character!.learnedSkills & skillBit) == 0,
    'Skill already learned'
  );

  // Learn the skill
  character!.learnedSkills |= skillBit;
  saveCharacter(character!);

  generateEvent(`SKILL_LEARNED:${characterId}:${skillId.toString()}`);
}

/**
 * Check if character has learned a skill
 */
export function hasLearnedSkill(character: Character, skillId: u8): bool {
  if (!isValidSkill(skillId)) return false;
  const skillBit: u16 = u16(1) << (skillId - 1);
  return (character.learnedSkills & skillBit) != 0;
}

/**
 * Get count of learned skills
 */
export function getLearnedSkillCount(character: Character): u8 {
  let count: u8 = 0;
  for (let i: u8 = 1; i <= 10; i++) {
    if (hasLearnedSkill(character, i)) {
      count++;
    }
  }
  return count;
}

// ============================================================================
// Skill Equipping
// ============================================================================

/**
 * Equip a learned skill to a slot
 * @param characterId - Character ID
 * @param skillId - Skill ID to equip
 * @param slot - Slot number (1, 2, or 3)
 */
export function equipSkill(characterId: string, skillId: u8, slot: u8): void {
  assert(slot >= 1 && slot <= 3, 'Invalid skill slot (1-3)');
  assert(skillId == 0 || isValidSkill(skillId), 'Invalid skill ID');

  const character = loadCharacter(characterId);
  assert(character != null, 'Character not found');
  assert(
    character!.owner == Context.caller().toString(),
    'Not character owner'
  );

  // If equipping a skill (not removing), check if learned
  if (skillId != 0) {
    assert(hasLearnedSkill(character!, skillId), 'Skill not learned');
  }

  // Equip to slot
  switch (slot) {
    case 1:
      character!.skillSlot1 = skillId;
      break;
    case 2:
      character!.skillSlot2 = skillId;
      break;
    case 3:
      character!.skillSlot3 = skillId;
      break;
  }

  saveCharacter(character!);

  generateEvent(
    `SKILL_EQUIPPED:${characterId}:${skillId.toString()}:${slot.toString()}`
  );
}

/**
 * Get skill ID in a character's slot
 */
export function getEquippedSkill(character: Character, slot: u8): u8 {
  switch (slot) {
    case 1:
      return character.skillSlot1;
    case 2:
      return character.skillSlot2;
    case 3:
      return character.skillSlot3;
    default:
      return 0;
  }
}

// ============================================================================
// Energy Management
// ============================================================================

/**
 * Regenerate energy at turn start
 */
export function regenerateEnergy(player: BattlePlayer): void {
  const newEnergy = player.energy + ENERGY_REGEN;
  player.energy = newEnergy > MAX_ENERGY ? MAX_ENERGY : newEnergy;
}

/**
 * Spend energy for skill use
 */
export function spendEnergy(player: BattlePlayer, amount: u8): bool {
  if (player.energy < amount) {
    return false;
  }
  player.energy -= amount;
  return true;
}

/**
 * Check if player has enough energy for a skill
 */
export function canUseSkill(player: BattlePlayer, skillId: u8): bool {
  return player.energy >= getSkillEnergyCost(skillId);
}

// ============================================================================
// Cooldown Management
// ============================================================================

/**
 * Get current cooldown for a skill
 */
export function getPlayerCooldown(player: BattlePlayer, skillId: u8): u8 {
  switch (skillId) {
    case 1:
      return player.cooldown1;
    case 2:
      return player.cooldown2;
    case 3:
      return player.cooldown3;
    case 4:
      return player.cooldown4;
    case 5:
      return player.cooldown5;
    case 6:
      return player.cooldown6;
    case 7:
      return player.cooldown7;
    case 8:
      return player.cooldown8;
    case 9:
      return player.cooldown9;
    case 10:
      return player.cooldown10;
    default:
      return 0;
  }
}

/**
 * Set cooldown for a skill
 */
export function setPlayerCooldown(
  player: BattlePlayer,
  skillId: u8,
  cooldown: u8
): void {
  switch (skillId) {
    case 1:
      player.cooldown1 = cooldown;
      break;
    case 2:
      player.cooldown2 = cooldown;
      break;
    case 3:
      player.cooldown3 = cooldown;
      break;
    case 4:
      player.cooldown4 = cooldown;
      break;
    case 5:
      player.cooldown5 = cooldown;
      break;
    case 6:
      player.cooldown6 = cooldown;
      break;
    case 7:
      player.cooldown7 = cooldown;
      break;
    case 8:
      player.cooldown8 = cooldown;
      break;
    case 9:
      player.cooldown9 = cooldown;
      break;
    case 10:
      player.cooldown10 = cooldown;
      break;
  }
}

/**
 * Check if skill is on cooldown
 */
export function isSkillOnCooldown(player: BattlePlayer, skillId: u8): bool {
  return getPlayerCooldown(player, skillId) > 0;
}

/**
 * Reduce all cooldowns by 1 at turn end
 */
export function reduceCooldowns(player: BattlePlayer): void {
  if (player.cooldown1 > 0) player.cooldown1--;
  if (player.cooldown2 > 0) player.cooldown2--;
  if (player.cooldown3 > 0) player.cooldown3--;
  if (player.cooldown4 > 0) player.cooldown4--;
  if (player.cooldown5 > 0) player.cooldown5--;
  if (player.cooldown6 > 0) player.cooldown6--;
  if (player.cooldown7 > 0) player.cooldown7--;
  if (player.cooldown8 > 0) player.cooldown8--;
  if (player.cooldown9 > 0) player.cooldown9--;
  if (player.cooldown10 > 0) player.cooldown10--;
}

// ============================================================================
// Skill Effect Application
// ============================================================================

/**
 * Apply skill effect to attacker or defender
 * Returns any additional damage from the skill
 */
export function applySkillEffect(
  skillId: u8,
  attacker: BattlePlayer,
  defender: BattlePlayer,
  baseDamage: u16
): u16 {
  let finalDamage = baseDamage;
  const multiplier = getSkillDamageMultiplier(skillId);

  switch (skillId) {
    case SKILL_POWER_STRIKE:
      // 150% damage
      finalDamage = u16((u32(baseDamage) * u32(multiplier)) / 100);
      break;

    case SKILL_HEAL:
      // Restore 30% max HP
      const healAmount = u16(attacker.maxHp * 30 / 100);
      attacker.currentHp = attacker.currentHp + healAmount > attacker.maxHp
        ? attacker.maxHp
        : attacker.currentHp + healAmount;
      finalDamage = 0; // Heal doesn't deal damage
      break;

    case SKILL_POISON_STRIKE:
      // Apply poison (5% HP/turn for 3 turns)
      defender.statusEffects |= STATUS_POISON;
      defender.poisonTurns = 3;
      break;

    case SKILL_STUN_STRIKE:
      // Apply stun (skip 1 turn)
      defender.statusEffects |= STATUS_STUN;
      defender.stunTurns = 1;
      finalDamage = u16((u32(baseDamage) * 80) / 100); // 80% damage
      break;

    case SKILL_SHIELD_WALL:
      // Apply shield (30% damage reduction for 2 turns)
      attacker.statusEffects |= STATUS_SHIELD;
      attacker.shieldTurns = 2;
      finalDamage = 0; // Shield doesn't deal damage
      break;

    case SKILL_RAGE_MODE:
      // Apply rage (50% damage increase for 2 turns)
      attacker.statusEffects |= STATUS_RAGE;
      attacker.rageTurns = 2;
      finalDamage = 0; // Rage activation doesn't deal damage
      break;

    case SKILL_CRITICAL_EYE:
      // Guarantee next hit is critical
      attacker.guaranteedCrit = true;
      finalDamage = 0;
      break;

    case SKILL_DODGE_MASTER:
      // +50% dodge for 2 turns
      attacker.dodgeBoost = 50;
      attacker.dodgeBoostTurns = 2;
      finalDamage = 0;
      break;

    case SKILL_BURN_AURA:
      // Apply burn (8% HP/turn for 3 turns)
      defender.statusEffects |= STATUS_BURN;
      defender.burnTurns = 3;
      break;

    case SKILL_COMBO_BREAKER:
      // Reset enemy combo + 120% damage
      defender.comboCount = 0;
      finalDamage = u16((u32(baseDamage) * 120) / 100);
      break;
  }

  return finalDamage;
}

/**
 * Check if a skill is an offensive skill (deals damage)
 */
export function isOffensiveSkill(skillId: u8): bool {
  switch (skillId) {
    case SKILL_POWER_STRIKE:
    case SKILL_POISON_STRIKE:
    case SKILL_STUN_STRIKE:
    case SKILL_BURN_AURA:
    case SKILL_COMBO_BREAKER:
      return true;
    default:
      return false;
  }
}

/**
 * Check if skill is a self-buff
 */
export function isSelfBuffSkill(skillId: u8): bool {
  switch (skillId) {
    case SKILL_HEAL:
    case SKILL_SHIELD_WALL:
    case SKILL_RAGE_MODE:
    case SKILL_CRITICAL_EYE:
    case SKILL_DODGE_MASTER:
      return true;
    default:
      return false;
  }
}
