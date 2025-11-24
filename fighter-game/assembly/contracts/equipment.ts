/**
 * Equipment NFT Component
 * Handles equipment creation, transfers, and equipping
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import {
  Equipment,
  Character,
  EQUIP_WEAPON,
  EQUIP_ARMOR,
  EQUIP_ACCESSORY,
  RARITY_COMMON,
  RARITY_RARE,
  RARITY_EPIC,
  RARITY_LEGENDARY,
} from './types';
import {
  saveEquipment,
  loadEquipment,
  equipmentExists,
  saveCharacter,
  loadCharacter,
  addEquipmentToOwner,
  removeEquipmentFromOwner,
  isAdmin,
} from './storage';

// ============================================================================
// Rarity Configuration
// ============================================================================

/**
 * Initialize equipment stats based on rarity
 */
export function initializeRarityStats(equipment: Equipment): void {
  switch (equipment.rarity) {
    case RARITY_COMMON:
      equipment.hpBonus = 10;
      equipment.damageMinBonus = 1;
      equipment.damageMaxBonus = 2;
      equipment.critBonus = 2;
      equipment.dodgeBonus = 1;
      equipment.durability = 100;
      equipment.maxDurability = 100;
      break;

    case RARITY_RARE:
      equipment.hpBonus = 25;
      equipment.damageMinBonus = 3;
      equipment.damageMaxBonus = 5;
      equipment.critBonus = 5;
      equipment.dodgeBonus = 3;
      equipment.durability = 200;
      equipment.maxDurability = 200;
      break;

    case RARITY_EPIC:
      equipment.hpBonus = 50;
      equipment.damageMinBonus = 5;
      equipment.damageMaxBonus = 10;
      equipment.critBonus = 10;
      equipment.dodgeBonus = 5;
      equipment.durability = 300;
      equipment.maxDurability = 300;
      break;

    case RARITY_LEGENDARY:
      equipment.hpBonus = 100;
      equipment.damageMinBonus = 10;
      equipment.damageMaxBonus = 20;
      equipment.critBonus = 15;
      equipment.dodgeBonus = 10;
      equipment.durability = 500;
      equipment.maxDurability = 500;
      break;

    default:
      // Default to common stats
      equipment.hpBonus = 10;
      equipment.damageMinBonus = 1;
      equipment.damageMaxBonus = 2;
      equipment.critBonus = 2;
      equipment.dodgeBonus = 1;
      equipment.durability = 100;
      equipment.maxDurability = 100;
  }

  // Adjust stats based on equipment type
  applyEquipmentTypeModifiers(equipment);
}

/**
 * Apply modifiers based on equipment slot type
 */
function applyEquipmentTypeModifiers(equipment: Equipment): void {
  switch (equipment.equipmentType) {
    case EQUIP_WEAPON:
      // Weapons focus on damage and crit
      equipment.damageMinBonus = u8(equipment.damageMinBonus * 2);
      equipment.damageMaxBonus = u8(equipment.damageMaxBonus * 2);
      equipment.critBonus = u8(equipment.critBonus * 150 / 100);
      equipment.hpBonus = 0; // Weapons don't give HP
      equipment.dodgeBonus = 0; // Weapons don't give dodge
      break;

    case EQUIP_ARMOR:
      // Armor focuses on HP and dodge
      equipment.hpBonus = u16(equipment.hpBonus * 2);
      equipment.dodgeBonus = u8(equipment.dodgeBonus * 150 / 100);
      equipment.damageMinBonus = 0;
      equipment.damageMaxBonus = 0;
      equipment.critBonus = 0;
      break;

    case EQUIP_ACCESSORY:
      // Accessories give balanced bonuses
      equipment.critBonus = u8(equipment.critBonus * 150 / 100);
      equipment.dodgeBonus = u8(equipment.dodgeBonus * 150 / 100);
      equipment.hpBonus = u16(equipment.hpBonus / 2);
      equipment.damageMinBonus = u8(equipment.damageMinBonus / 2);
      equipment.damageMaxBonus = u8(equipment.damageMaxBonus / 2);
      break;
  }
}

// ============================================================================
// Equipment Creation
// ============================================================================

/**
 * Create new equipment (admin only or through game rewards)
 * @param equipmentId - Unique equipment ID
 * @param owner - Owner address
 * @param equipmentType - Type (weapon, armor, accessory)
 * @param rarity - Rarity tier
 */
export function createEquipment(
  equipmentId: string,
  owner: string,
  equipmentType: u8,
  rarity: u8
): Equipment {
  // Validate equipment doesn't exist
  assert(!equipmentExists(equipmentId), 'Equipment ID already exists');

  // Validate type
  assert(equipmentType <= EQUIP_ACCESSORY, 'Invalid equipment type');

  // Validate rarity
  assert(rarity <= RARITY_LEGENDARY, 'Invalid rarity');

  const timestamp = Context.timestamp();

  // Create equipment
  const equipment = new Equipment(equipmentId, owner, equipmentType, rarity);
  equipment.createdAt = timestamp;

  // Initialize stats based on rarity and type
  initializeRarityStats(equipment);

  // Save to storage
  saveEquipment(equipment);

  // Add to owner's equipment list
  addEquipmentToOwner(owner, equipmentId);

  // Emit event
  generateEvent(
    `EQUIPMENT_CREATED:${equipmentId}:${owner}:${equipmentType.toString()}:${rarity.toString()}`
  );

  return equipment;
}

/**
 * Admin function to mint equipment for a player
 */
export function adminMintEquipment(
  equipmentId: string,
  toAddress: string,
  equipmentType: u8,
  rarity: u8
): Equipment {
  const caller = Context.caller().toString();
  assert(isAdmin(caller), 'Only admin can mint equipment');

  return createEquipment(equipmentId, toAddress, equipmentType, rarity);
}

// ============================================================================
// Equipment Reading
// ============================================================================

/**
 * Read equipment data
 */
export function readEquipment(id: string): Equipment {
  const equipment = loadEquipment(id);
  assert(equipment != null, 'Equipment not found');
  return equipment!;
}

/**
 * Check if caller owns the equipment
 */
export function isEquipmentOwner(equipmentId: string, address: string): bool {
  const equipment = loadEquipment(equipmentId);
  if (equipment == null) return false;
  return equipment!.owner == address;
}

/**
 * Assert caller owns the equipment
 */
export function assertEquipmentOwner(equipmentId: string): Equipment {
  const equipment = loadEquipment(equipmentId);
  assert(equipment != null, 'Equipment not found');
  assert(
    equipment!.owner == Context.caller().toString(),
    'Not equipment owner'
  );
  return equipment!;
}

// ============================================================================
// Equipment Transfer (NFT functionality)
// ============================================================================

/**
 * Transfer equipment to another address
 * @param equipmentId - Equipment ID
 * @param toAddr - Destination address
 */
export function transferEquipment(equipmentId: string, toAddr: string): void {
  const equipment = assertEquipmentOwner(equipmentId);

  // Cannot transfer equipped items
  assert(
    equipment.equippedTo.length == 0,
    'Cannot transfer equipped equipment'
  );

  const fromAddr = equipment.owner;

  // Update ownership
  removeEquipmentFromOwner(fromAddr, equipmentId);
  addEquipmentToOwner(toAddr, equipmentId);

  equipment.owner = toAddr;
  saveEquipment(equipment);

  // Emit transfer event
  generateEvent(
    `EQUIPMENT_TRANSFERRED:${equipmentId}:${fromAddr}:${toAddr}`
  );
}

// ============================================================================
// Equip/Unequip Operations
// ============================================================================

/**
 * Equip an item to a character
 * @param charId - Character ID
 * @param equipmentId - Equipment ID to equip
 */
export function equipItem(charId: string, equipmentId: string): void {
  const caller = Context.caller().toString();

  // Verify ownership of both character and equipment
  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');
  assert(character!.owner == caller, 'Not character owner');

  const equipment = loadEquipment(equipmentId);
  assert(equipment != null, 'Equipment not found');
  assert(equipment!.owner == caller, 'Not equipment owner');

  // Ensure equipment is not already equipped
  assert(
    equipment!.equippedTo.length == 0,
    'Equipment already equipped to another character'
  );

  // Unequip existing item in the slot
  unequipSlot(character!, equipment!.equipmentType);

  // Equip the new item
  switch (equipment!.equipmentType) {
    case EQUIP_WEAPON:
      character!.weaponId = equipmentId;
      break;
    case EQUIP_ARMOR:
      character!.armorId = equipmentId;
      break;
    case EQUIP_ACCESSORY:
      character!.accessoryId = equipmentId;
      break;
  }

  equipment!.equippedTo = charId;

  // Save both
  saveCharacter(character!);
  saveEquipment(equipment!);

  generateEvent(
    `ITEM_EQUIPPED:${charId}:${equipmentId}:${equipment!.equipmentType.toString()}`
  );
}

/**
 * Unequip an item from a character
 * @param charId - Character ID
 * @param equipmentId - Equipment ID to unequip
 */
export function unequipItem(charId: string, equipmentId: string): void {
  const caller = Context.caller().toString();

  const character = loadCharacter(charId);
  assert(character != null, 'Character not found');
  assert(character!.owner == caller, 'Not character owner');

  const equipment = loadEquipment(equipmentId);
  assert(equipment != null, 'Equipment not found');
  assert(equipment!.equippedTo == charId, 'Equipment not equipped to this character');

  // Remove from character slot
  switch (equipment!.equipmentType) {
    case EQUIP_WEAPON:
      character!.weaponId = '';
      break;
    case EQUIP_ARMOR:
      character!.armorId = '';
      break;
    case EQUIP_ACCESSORY:
      character!.accessoryId = '';
      break;
  }

  equipment!.equippedTo = '';

  // Save both
  saveCharacter(character!);
  saveEquipment(equipment!);

  generateEvent(`ITEM_UNEQUIPPED:${charId}:${equipmentId}`);
}

/**
 * Helper to unequip current item in a slot
 */
function unequipSlot(character: Character, slotType: u8): void {
  let currentEquipId = '';

  switch (slotType) {
    case EQUIP_WEAPON:
      currentEquipId = character.weaponId;
      character.weaponId = '';
      break;
    case EQUIP_ARMOR:
      currentEquipId = character.armorId;
      character.armorId = '';
      break;
    case EQUIP_ACCESSORY:
      currentEquipId = character.accessoryId;
      character.accessoryId = '';
      break;
  }

  if (currentEquipId.length > 0) {
    const equipment = loadEquipment(currentEquipId);
    if (equipment != null) {
      equipment!.equippedTo = '';
      saveEquipment(equipment!);
    }
  }
}

// ============================================================================
// Durability Management
// ============================================================================

/**
 * Reduce equipment durability after battle
 * @param equipmentId - Equipment ID
 * @param amount - Durability loss
 */
export function reduceDurability(equipmentId: string, amount: u16): void {
  const equipment = loadEquipment(equipmentId);
  if (equipment == null) return;

  if (equipment!.durability <= amount) {
    equipment!.durability = 0;
    // Equipment is broken - could implement breaking mechanics here
    generateEvent(`EQUIPMENT_BROKEN:${equipmentId}`);
  } else {
    equipment!.durability -= amount;
  }

  saveEquipment(equipment!);
}

/**
 * Repair equipment (implement payment separately)
 * @param equipmentId - Equipment ID
 */
export function repairEquipment(equipmentId: string): void {
  const equipment = assertEquipmentOwner(equipmentId);

  equipment.durability = equipment.maxDurability;
  saveEquipment(equipment);

  generateEvent(`EQUIPMENT_REPAIRED:${equipmentId}`);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get equipment type name
 */
export function getEquipmentTypeName(typeId: u8): string {
  switch (typeId) {
    case EQUIP_WEAPON:
      return 'Weapon';
    case EQUIP_ARMOR:
      return 'Armor';
    case EQUIP_ACCESSORY:
      return 'Accessory';
    default:
      return 'Unknown';
  }
}

/**
 * Get rarity name
 */
export function getRarityName(rarity: u8): string {
  switch (rarity) {
    case RARITY_COMMON:
      return 'Common';
    case RARITY_RARE:
      return 'Rare';
    case RARITY_EPIC:
      return 'Epic';
    case RARITY_LEGENDARY:
      return 'Legendary';
    default:
      return 'Unknown';
  }
}
