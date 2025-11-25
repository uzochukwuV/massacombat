/**
 * Equipment Management Hook
 * Handles equipment creation, reading, equipping, and transfers
 */

import { useState, useCallback } from 'react';
import { Args, Mas } from '@massalabs/massa-web3';
import { callContract, readContract, EQUIPMENT_TYPES, RARITY_NAMES } from './useContract';

export interface Equipment {
  id: string;
  owner: string;
  equipmentType: number;
  rarity: number;
  hpBonus: number;
  damageMinBonus: number;
  damageMaxBonus: number;
  critBonus: number;
  dodgeBonus: number;
  durability: number;
  maxDurability: number;
  equippedTo: string;
  createdAt: bigint;
}

export function useEquipment(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Read equipment data
   * @param id - Equipment ID
   */
  const readEquipment = useCallback(
    async (id: string): Promise<Equipment | null> => {
      try {
        const args = new Args().addString(id);
        const result = await readContract(provider, contractAddress, 'game_readEquipment', args);

        if (!result || result.length === 0) {
          return null;
        }

        const equipArgs = new Args(result);
        const equipment: Equipment = {
          id: equipArgs.nextString().unwrap(),
          owner: equipArgs.nextString().unwrap(),
          equipmentType: equipArgs.nextU8().unwrap(),
          rarity: equipArgs.nextU8().unwrap(),
          hpBonus: equipArgs.nextU16().unwrap(),
          damageMinBonus: equipArgs.nextU8().unwrap(),
          damageMaxBonus: equipArgs.nextU8().unwrap(),
          critBonus: equipArgs.nextU8().unwrap(),
          dodgeBonus: equipArgs.nextU8().unwrap(),
          durability: equipArgs.nextU16().unwrap(),
          maxDurability: equipArgs.nextU16().unwrap(),
          equippedTo: equipArgs.nextString().unwrap(),
          createdAt: equipArgs.nextU64().unwrap(),
        };

        return equipment;
      } catch (err) {
        console.error('Error reading equipment:', err);
        return null;
      }
    },
    [contractAddress, provider]
  );

  /**
   * Equip item to character
   * @param charId - Character ID
   * @param equipmentId - Equipment ID to equip
   */
  const equipItem = useCallback(
    async (charId: string, equipmentId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(charId).addString(equipmentId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_equipItem',
          args,
          Mas.fromString('0.1'),
          BigInt(100_000_000)
        );

        console.log('Item equipped:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to equip item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Unequip item from character
   * @param charId - Character ID
   * @param equipmentId - Equipment ID to unequip
   */
  const unequipItem = useCallback(
    async (charId: string, equipmentId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(charId).addString(equipmentId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_unequipItem',
          args,
          Mas.fromString('0.1'),
          BigInt(100_000_000)
        );

        console.log('Item unequipped:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unequip item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Transfer equipment to another address
   * @param equipmentId - Equipment ID
   * @param toAddr - Destination address
   */
  const transferEquipment = useCallback(
    async (equipmentId: string, toAddr: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(equipmentId).addString(toAddr);

        const op = await callContract(
          provider,
          contractAddress,
          'game_transferEquipment',
          args,
          Mas.fromString('0.1'),
          BigInt(100_000_000)
        );

        console.log('Equipment transferred:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to transfer equipment';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Repair equipment
   * @param equipmentId - Equipment ID
   */
  const repairEquipment = useCallback(
    async (equipmentId: string) => {
      setLoading(true);
      setError(null);

      try {
        if (!isConnected) {
          throw new Error('Wallet not connected');
        }

        const args = new Args().addString(equipmentId);

        const op = await callContract(
          provider,
          contractAddress,
          'game_repairEquipment',
          args,
          Mas.fromString('0.2'), // Repair fee varies by rarity
          BigInt(100_000_000)
        );

        console.log('Equipment repaired:', op.id);
        return op;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to repair equipment';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contractAddress, provider]
  );

  /**
   * Get equipment type name
   */
  const getEquipmentTypeName = useCallback((typeId: number): string => {
    return EQUIPMENT_TYPES[typeId] || 'Unknown';
  }, []);

  /**
   * Get rarity name
   */
  const getRarityName = useCallback((rarity: number): string => {
    return RARITY_NAMES[rarity] || 'Unknown';
  }, []);

  /**
   * Get rarity color
   */
  const getRarityColor = useCallback((rarity: number): string => {
    switch (rarity) {
      case 0:
        return '#9CA3AF'; // Gray - Common
      case 1:
        return '#3B82F6'; // Blue - Rare
      case 2:
        return '#A855F7'; // Purple - Epic
      case 3:
        return '#F59E0B'; // Orange - Legendary
      default:
        return '#6B7280';
    }
  }, []);

  return {
    readEquipment,
    equipItem,
    unequipItem,
    transferEquipment,
    repairEquipment,
    getEquipmentTypeName,
    getRarityName,
    getRarityColor,
    loading,
    error,
    isConnected,
  };
}
