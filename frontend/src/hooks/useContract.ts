/**
 * Contract Utilities
 * Generic contract interaction helpers
 */

import { Args, Mas, OperationStatus } from '@massalabs/massa-web3';

/**
 * Generic contract call wrapper
 * Executes a write operation on the contract
 */
export async function callContract(
  provider: any,
  contractAddress: string,
  functionName: string,
  args: Args,
  coins: bigint = Mas.fromString('0.1'),
  maxGas: bigint = BigInt(300_000_000)
) {
  if (!provider) {
    throw new Error('Wallet not connected');
  }

  try {
    const operation = await provider.callSC({
      target: contractAddress,
      func: functionName,
      parameter: args.serialize(),
      coins,
      maxGas,
    });

    await operation.waitFinalExecution();
    const status = await operation.waitSpeculativeExecution();

    if (status !== OperationStatus.SpeculativeSuccess) {
      throw new Error(`Transaction failed with status: ${status}`);
    }

    return operation;
  } catch (error) {
    console.error(`Contract call failed: ${functionName}`, error);
    throw error;
  }
}

/**
 * Generic contract read wrapper
 * Executes a read-only operation on the contract
 */
export async function readContract(
  provider: any,
  contractAddress: string,
  functionName: string,
  args: Args
) {
  if (!provider) {
    throw new Error('Wallet not connected');
  }

  try {
    const result = await provider.readSC({
      target: contractAddress,
      func: functionName,
      parameter: args.serialize(),
      maxGas: BigInt(1_000_000_000),
      coins: Mas.fromString('0.1'),
    });

    console.log(`Contract read result (${functionName}):`, result);
    return result.value;
  } catch (error) {
    console.error(`Contract read failed: ${functionName}`, error);
    throw error;
  }
}

/**
 * Parse events from operation
 */
export function parseEvents(events: any[]): Map<string, string[]> {
  const eventMap = new Map<string, string[]>();

  for (const event of events) {
    const parts = event.data.split(':');
    const eventType = parts[0];

    if (!eventMap.has(eventType)) {
      eventMap.set(eventType, []);
    }
    eventMap.get(eventType)!.push(event.data);
  }

  return eventMap;
}

/**
 * Character class names
 */
export const CLASS_NAMES = ['Warrior', 'Assassin', 'Mage', 'Tank', 'Trickster'];

/**
 * Equipment type names
 */
export const EQUIPMENT_TYPES = ['Weapon', 'Armor', 'Accessory'];

/**
 * Rarity names
 */
export const RARITY_NAMES = ['Common', 'Rare', 'Epic', 'Legendary'];

/**
 * Skill names
 */
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

/**
 * Achievement names
 */
export const ACHIEVEMENT_NAMES = [
  '',
  'First Victory',
  'Rising Champion',
  'Veteran Fighter',
  'Legendary Warrior',
  'Tournament Champion',
  'Unstoppable',
  'Combo Master',
  'Skill Master',
  'Legendary Collector',
  'Max Power',
];
