/**
 * Skills Management Hook
 * Handles skill learning and equipping
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, SKILL_NAMES } from './useContract';

export interface SkillInfo {
  id: number;
  name: string;
  energyCost: number;
  cooldown: number;
  description: string;
}

const SKILL_DATA: Record<number, SkillInfo> = {
  1: { id: 1, name: 'Power Strike', energyCost: 30, cooldown: 3, description: '150% damage' },
  2: { id: 2, name: 'Heal', energyCost: 40, cooldown: 4, description: 'Restore 30% HP' },
  3: { id: 3, name: 'Poison Strike', energyCost: 25, cooldown: 2, description: '5% HP/turn for 3 turns' },
  4: { id: 4, name: 'Stun Strike', energyCost: 50, cooldown: 5, description: 'Skip 1 turn' },
  5: { id: 5, name: 'Shield Wall', energyCost: 30, cooldown: 3, description: '30% damage reduction for 2 turns' },
  6: { id: 6, name: 'Rage Mode', energyCost: 40, cooldown: 4, description: '50% damage increase for 2 turns' },
  7: { id: 7, name: 'Critical Eye', energyCost: 60, cooldown: 6, description: 'Guarantee next crit' },
  8: { id: 8, name: 'Dodge Master', energyCost: 50, cooldown: 5, description: '+50% dodge for 2 turns' },
  9: { id: 9, name: 'Burn Aura', energyCost: 35, cooldown: 3, description: '8% HP/turn for 3 turns' },
  10: { id: 10, name: 'Combo Breaker', energyCost: 45, cooldown: 4, description: 'Reset enemy combo + 120% damage' },
};

export function useSkills(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Learn a skill
   * @param characterId - Character ID
   * @param skillId - Skill ID (1-10)
   */
  const learnSkill = useCallback(
    async (characterId: string, skillId: number) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(characterId).addU8(skillId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_learnSkill',
          args,
          Mas.fromString('0.3'), // Skill learning fee
          BigInt(100_000_000)
        );

        console.log('Skill learned:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to learn skill';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Equip a skill to a slot
   * @param characterId - Character ID
   * @param skillId - Skill ID (0 = empty, 1-10 = skills)
   * @param slot - Slot number (1-3)
   */
  const equipSkill = useCallback(
    async (characterId: string, skillId: number, slot: number) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(characterId).addU8(skillId).addU8(slot);

        const op = await callContract(
          provider,
          contractAddress,
          'game_equipSkill',
          args,
          Mas.fromString('0.1'),
          BigInt(50_000_000)
        );

        console.log('Skill equipped:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to equip skill';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Get skill name
   */
  const getSkillName = useCallback((skillId: number): string => {
    return SKILL_NAMES[skillId] || 'Empty';
  }, []);

  /**
   * Get skill info
   */
  const getSkillInfo = useCallback((skillId: number): SkillInfo | null => {
    return SKILL_DATA[skillId] || null;
  }, []);

  /**
   * Check if a skill is learned (from bitmask)
   */
  const hasLearnedSkill = useCallback((learnedSkills: number, skillId: number): boolean => {
    const skillBit = 1 << (skillId - 1);
    return (learnedSkills & skillBit) !== 0;
  }, []);

  /**
   * Get all learned skills
   */
  const getLearnedSkills = useCallback((learnedSkills: number): number[] => {
    const learned: number[] = [];
    for (let i = 1; i <= 10; i++) {
      if (hasLearnedSkill(learnedSkills, i)) {
        learned.push(i);
      }
    }
    return learned;
  }, [hasLearnedSkill]);

  /**
   * Get all available skills
   */
  const getAllSkills = useCallback((): SkillInfo[] => {
    return Object.values(SKILL_DATA);
  }, []);

  return {
    learnSkill,
    equipSkill,
    getSkillName,
    getSkillInfo,
    hasLearnedSkill,
    getLearnedSkills,
    getAllSkills,
    loading,
    error,
    isConnected,
  };
}
