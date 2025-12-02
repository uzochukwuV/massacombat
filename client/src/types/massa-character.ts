/**
 * Updated character types to match Massa smart contract
 */

// Character Classes (matching smart contract)
export enum CharacterClass {
  Warrior = 0,
  Assassin = 1,
  Mage = 2,
  Tank = 3,
  Trickster = 4
}

// Equipment Types
export enum EquipmentType {
  Weapon = 0,
  Armor = 1,
  Accessory = 2
}

// Equipment Rarity
export enum EquipmentRarity {
  Common = 0,
  Rare = 1,
  Epic = 2,
  Legendary = 3
}

// Battle States
export enum BattleState {
  Pending = 0,
  Active = 1,
  Wildcard = 2,
  Completed = 3
}

// Stances
export enum Stance {
  Neutral = 0,
  Aggressive = 1,
  Defensive = 2
}

// Status Effects (bitmasks)
export enum StatusEffect {
  None = 0,
  Poison = 1,
  Stun = 2,
  Shield = 4,
  Rage = 8,
  Burn = 16
}

// Skill IDs
export enum SkillId {
  PowerStrike = 1,
  Heal = 2,
  PoisonStrike = 3,
  StunStrike = 4,
  ShieldWall = 5,
  RageMode = 6,
  CriticalEye = 7,
  DodgeMaster = 8,
  BurnAura = 9,
  ComboBreaker = 10
}

// Character interface matching smart contract
export interface MassaCharacter {
  id: string;
  owner: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  xp: number;
  
  // Stats
  hp: number;
  maxHp: number;
  damageMin: number;
  damageMax: number;
  critChance: number;
  dodgeChance: number;
  defense: number;
  
  // Equipment slots
  weaponId: string;
  armorId: string;
  accessoryId: string;
  
  // Skills
  skillSlot1: number;
  skillSlot2: number;
  skillSlot3: number;
  learnedSkills: number; // Bitmask
  
  // Battle stats
  totalWins: number;
  totalLosses: number;
  mmr: number;
  winStreak: number;
  createdAt: number;
}

// Equipment interface
export interface Equipment {
  id: string;
  owner: string;
  equipmentType: EquipmentType;
  rarity: EquipmentRarity;
  
  // Stat bonuses
  hpBonus: number;
  damageMinBonus: number;
  damageMaxBonus: number;
  critBonus: number;
  dodgeBonus: number;
  
  // Durability
  durability: number;
  maxDurability: number;
  equippedTo: string;
  createdAt: number;
}

// Battle Player State
export interface BattlePlayer {
  characterId: string;
  currentHp: number;
  maxHp: number;
  energy: number;
  statusEffects: number; // Bitmask
  poisonTurns: number;
  stunTurns: number;
  shieldTurns: number;
  rageTurns: number;
  burnTurns: number;
  comboCount: number;
  guaranteedCrit: boolean;
  dodgeBoost: number;
  dodgeBoostTurns: number;
  
  // Cooldowns for skills 1-10
  cooldown1: number;
  cooldown2: number;
  cooldown3: number;
  cooldown4: number;
  cooldown5: number;
  cooldown6: number;
  cooldown7: number;
  cooldown8: number;
  cooldown9: number;
  cooldown10: number;
}

// Battle interface
export interface Battle {
  id: string;
  player1: BattlePlayer;
  player2: BattlePlayer;
  currentTurn: number; // 1 or 2
  turnNumber: number;
  state: BattleState;
  winnerId: string;
  startTimestamp: number;
  lastActionTimestamp: number;
  
  // Wildcard state
  wildcardActive: boolean;
  wildcardType: number;
  wildcardDeadline: number;
  player1WildcardDecision: number; // 255 = no decision, 0 = reject, 1 = accept
  player2WildcardDecision: number;
  
  randomSeed: number;
}

// Tournament interface
export interface Tournament {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentRound: number;
  state: number; // 0 = registration, 1 = active, 2 = completed
  
  participants: string; // Comma-separated character IDs
  bracket: string; // Comma-separated pairs for each round
  
  winnerId: string;
  runnerUpId: string;
  thirdPlaceId: string;
  
  createdAt: number;
  startedAt: number;
  endedAt: number;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  characterId: string;
  ownerAddress: string;
  mmr: number;
  wins: number;
  losses: number;
}

// Achievement Tracker
export interface AchievementTracker {
  ownerAddress: string;
  unlockedAchievements: number; // Bitmask
  timestamps: string; // Comma-separated timestamps
}

// Class names and descriptions
export const CLASS_NAMES: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: 'Warrior',
  [CharacterClass.Assassin]: 'Assassin',
  [CharacterClass.Mage]: 'Mage',
  [CharacterClass.Tank]: 'Tank',
  [CharacterClass.Trickster]: 'Trickster'
};

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: 'Balanced fighter with good HP and damage',
  [CharacterClass.Assassin]: 'Glass cannon with high damage and crit',
  [CharacterClass.Mage]: 'Moderate HP with balanced damage',
  [CharacterClass.Tank]: 'Very high HP, low damage',
  [CharacterClass.Trickster]: 'Jack of all trades'
};

// Equipment type names
export const EQUIPMENT_TYPE_NAMES: Record<EquipmentType, string> = {
  [EquipmentType.Weapon]: 'Weapon',
  [EquipmentType.Armor]: 'Armor',
  [EquipmentType.Accessory]: 'Accessory'
};

// Rarity names
export const RARITY_NAMES: Record<EquipmentRarity, string> = {
  [EquipmentRarity.Common]: 'Common',
  [EquipmentRarity.Rare]: 'Rare',
  [EquipmentRarity.Epic]: 'Epic',
  [EquipmentRarity.Legendary]: 'Legendary'
};

// Stance names
export const STANCE_NAMES: Record<Stance, string> = {
  [Stance.Neutral]: 'Neutral',
  [Stance.Aggressive]: 'Aggressive',
  [Stance.Defensive]: 'Defensive'
};

// Battle state names
export const BATTLE_STATE_NAMES: Record<BattleState, string> = {
  [BattleState.Pending]: 'Pending',
  [BattleState.Active]: 'Active',
  [BattleState.Wildcard]: 'Wildcard',
  [BattleState.Completed]: 'Completed'
};

// Skill names
export const SKILL_NAMES: Record<SkillId, string> = {
  [SkillId.PowerStrike]: 'Power Strike',
  [SkillId.Heal]: 'Heal',
  [SkillId.PoisonStrike]: 'Poison Strike',
  [SkillId.StunStrike]: 'Stun Strike',
  [SkillId.ShieldWall]: 'Shield Wall',
  [SkillId.RageMode]: 'Rage Mode',
  [SkillId.CriticalEye]: 'Critical Eye',
  [SkillId.DodgeMaster]: 'Dodge Master',
  [SkillId.BurnAura]: 'Burn Aura',
  [SkillId.ComboBreaker]: 'Combo Breaker'
};