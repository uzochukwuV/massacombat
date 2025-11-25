// Contract Address (Replace with your deployed contract)
export const CONTRACT_ADDRESS = 'AS12YOUR_CONTRACT_ADDRESS_HERE';

// Character Classes
export const CLASSES = {
  WARRIOR: 0,
  ASSASSIN: 1,
  MAGE: 2,
  TANK: 3,
  TRICKSTER: 4,
} as const;

export const CLASS_NAMES = ['Warrior', 'Assassin', 'Mage', 'Tank', 'Trickster'];

export const CLASS_DESCRIPTIONS = {
  [CLASSES.WARRIOR]: 'High HP and balanced stats. Great for beginners.',
  [CLASSES.ASSASSIN]: 'High damage and crit. Low HP. High risk, high reward.',
  [CLASSES.MAGE]: 'Magical damage with high crit. Moderate HP.',
  [CLASSES.TANK]: 'Massive HP and defense. Low damage but hard to kill.',
  [CLASSES.TRICKSTER]: 'High dodge and unpredictable. Master of evasion.',
};

export const CLASS_STATS = {
  [CLASSES.WARRIOR]: { hp: 120, dmgMin: 12, dmgMax: 18, crit: 10, dodge: 5, defense: 8 },
  [CLASSES.ASSASSIN]: { hp: 90, dmgMin: 15, dmgMax: 22, crit: 25, dodge: 15, defense: 3 },
  [CLASSES.MAGE]: { hp: 100, dmgMin: 10, dmgMax: 20, crit: 20, dodge: 8, defense: 5 },
  [CLASSES.TANK]: { hp: 150, dmgMin: 8, dmgMax: 14, crit: 5, dodge: 3, defense: 15 },
  [CLASSES.TRICKSTER]: { hp: 110, dmgMin: 10, dmgMax: 16, crit: 12, dodge: 25, defense: 6 },
};

// Equipment
export const EQUIPMENT_TYPES = {
  WEAPON: 0,
  ARMOR: 1,
  ACCESSORY: 2,
} as const;

export const RARITY = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
} as const;

export const RARITY_NAMES = ['Common', 'Rare', 'Epic', 'Legendary'];

export const RARITY_COLORS = {
  [RARITY.COMMON]: '#9CA3AF',
  [RARITY.RARE]: '#3B82F6',
  [RARITY.EPIC]: '#A855F7',
  [RARITY.LEGENDARY]: '#F59E0B',
};

// Skills
export const SKILLS = {
  POWER_STRIKE: 1,
  HEAL: 2,
  POISON_STRIKE: 3,
  STUN_STRIKE: 4,
  SHIELD_WALL: 5,
  RAGE_MODE: 6,
  CRITICAL_EYE: 7,
  DODGE_MASTER: 8,
  BURN_AURA: 9,
  COMBO_BREAKER: 10,
} as const;

export const SKILL_NAMES = [
  '',
  'Power Strike',
  'Heal',
  'Poison Strike',
  'Stun Strike',
  'Shield Wall',
  'Rage Mode',
  'Critical Eye',
  'Dodge Master',
  'Burn Aura',
  'Combo Breaker',
];

export const SKILL_INFO = [
  {},
  { name: 'Power Strike', cost: 30, cooldown: 2, desc: '+50% damage for this turn' },
  { name: 'Heal', cost: 40, cooldown: 4, desc: 'Restore 30% of max HP' },
  { name: 'Poison Strike', cost: 35, cooldown: 3, desc: 'Deal damage + poison for 3 turns' },
  { name: 'Stun Strike', cost: 50, cooldown: 5, desc: 'Damage + stun for 1 turn' },
  { name: 'Shield Wall', cost: 45, cooldown: 4, desc: 'Shield for 2 turns (-50% damage)' },
  { name: 'Rage Mode', cost: 60, cooldown: 5, desc: '+50% damage for 3 turns' },
  { name: 'Critical Eye', cost: 25, cooldown: 3, desc: '+50% crit chance this turn' },
  { name: 'Dodge Master', cost: 30, cooldown: 3, desc: '+30% dodge for 2 turns' },
  { name: 'Burn Aura', cost: 55, cooldown: 5, desc: 'Burn enemy for 5% per turn (4 turns)' },
  { name: 'Combo Breaker', cost: 40, cooldown: 4, desc: 'Reset enemy combo + damage' },
];

// Battle
export const STANCES = {
  DEFENSIVE: 0,
  NORMAL: 1,
  AGGRESSIVE: 2,
} as const;

export const STANCE_NAMES = ['Defensive', 'Normal', 'Aggressive'];

export const BATTLE_STATES = {
  PENDING: 0,
  ACTIVE: 1,
  WILDCARD: 2,
  COMPLETED: 3,
} as const;

// Status Effects
export const STATUS = {
  POISONED: 0,
  STUNNED: 1,
  SHIELDED: 2,
  ENRAGED: 3,
  BURNING: 4,
} as const;

export const STATUS_NAMES = ['Poisoned', 'Stunned', 'Shielded', 'Enraged', 'Burning'];

// MMR Tiers
export const MMR_TIERS = [
  { name: 'Bronze', min: 0, max: 1399, color: '#CD7F32' },
  { name: 'Silver', min: 1400, max: 1599, color: '#C0C0C0' },
  { name: 'Gold', min: 1600, max: 1799, color: '#FFD700' },
  { name: 'Platinum', min: 1800, max: 1999, color: '#4CC9F0' },
  { name: 'Diamond', min: 2000, max: 2199, color: '#B5179E' },
  { name: 'Master', min: 2200, max: 2399, color: '#E63946' },
  { name: 'Grand Master', min: 2400, max: 9999, color: '#FF6B35' },
];

// Fees
export const FEES = {
  CREATE_CHARACTER: '0.5',
  CREATE_BATTLE: '0.5',
  EXECUTE_TURN: '0.2',
  LEARN_SKILL: '0.2',
  EQUIP_SKILL: '0.1',
  REPAIR_COMMON: '0.1',
  REPAIR_RARE: '0.2',
  REPAIR_EPIC: '0.4',
  REPAIR_LEGENDARY: '0.8',
};
