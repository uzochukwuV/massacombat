export enum CharacterClass {
  Warrior = 0,
  Assassin = 1,
  Mage = 2,
  Tank = 3,
  Trickster = 4
}

export interface CharacterStats {
  baseHP: number;
  baseDamageMin: number;
  baseDamageMax: number;
  critChance: number;
  dodgeChance: number;
  level: number;
  experience: number;
  mmr: number;
  class: CharacterClass;
}

export interface Character {
  tokenId: number;
  owner: string;
  stats: CharacterStats;
  traitBundle?: number;
}

export const CLASS_NAMES: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: 'Warrior',
  [CharacterClass.Assassin]: 'Assassin',
  [CharacterClass.Mage]: 'Mage',
  [CharacterClass.Tank]: 'Tank',
  [CharacterClass.Trickster]: 'Trickster'
};

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: 'Balanced fighter with triple damage special ability',
  [CharacterClass.Assassin]: 'High damage dealer with critical strike expertise',
  [CharacterClass.Mage]: 'Damage over time specialist with burning spells',
  [CharacterClass.Tank]: 'Defensive powerhouse with reflection shield',
  [CharacterClass.Trickster]: 'Agile combatant with frequent special attacks'
};

export const CLASS_BASE_STATS: Record<CharacterClass, Omit<CharacterStats, 'level' | 'experience' | 'mmr' | 'class'>> = {
  [CharacterClass.Warrior]: {
    baseHP: 120,
    baseDamageMin: 8,
    baseDamageMax: 15,
    critChance: 15,
    dodgeChance: 10
  },
  [CharacterClass.Assassin]: {
    baseHP: 90,
    baseDamageMin: 12,
    baseDamageMax: 20,
    critChance: 35,
    dodgeChance: 15
  },
  [CharacterClass.Mage]: {
    baseHP: 80,
    baseDamageMin: 10,
    baseDamageMax: 18,
    critChance: 20,
    dodgeChance: 8
  },
  [CharacterClass.Tank]: {
    baseHP: 150,
    baseDamageMin: 6,
    baseDamageMax: 12,
    critChance: 10,
    dodgeChance: 5
  },
  [CharacterClass.Trickster]: {
    baseHP: 100,
    baseDamageMin: 8,
    baseDamageMax: 16,
    critChance: 25,
    dodgeChance: 20
  }
};
