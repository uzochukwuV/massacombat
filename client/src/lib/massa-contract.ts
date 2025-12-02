/**
 * Massa smart contract interaction layer
 */

import { Args } from '@massalabs/as-types';

// Contract configuration
export const CONTRACT_ADDRESS = 'AS122vTBDiHYL34BykXKWHWKP9ADnTLiQoKMbzEfGJUkwiCo6ZErY';

// Fee constants (in nanoMAS)
export const FEES = {
  CHARACTER_CREATION: 100000000, // 0.1 MAS
  BATTLE_FEE: 50000000,          // 0.05 MAS
  SKILL_LEARNING: 25000000,      // 0.025 MAS
  UPGRADE_FEE: 50000000,         // 0.05 MAS
  REPAIR_FEE: 25000000,          // 0.025 MAS
  GAS_LIMIT: 100000000           // Gas limit for transactions
};

export interface ContractCallParams {
  targetAddress: string;
  functionName: string;
  parameter: number[];
  coins?: number;
  fee?: number;
}

export class MassaContract {
  private provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }

  /**
   * Create Args helper for function parameters
   */
  createArgs(): Args {
    return new Args();
  }

  /**
   * Call a read-only function on the smart contract
   */
  async readContract(functionName: string, args?: Args): Promise<any> {
    const parameter = args ? Array.from(args.serialize()) : [];
    
    const params: ContractCallParams = {
      targetAddress: CONTRACT_ADDRESS,
      functionName,
      parameter,
      fee: 0, // Read calls don't require fees
      coins: 0
    };

    try {
      const result = await this.provider.callSC(params);
      return result;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a transaction on the smart contract
   */
  async writeContract(
    functionName: string, 
    args?: Args,
    coins: number = 0,
    fee: number = FEES.GAS_LIMIT
  ): Promise<any> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const parameter = args ? Array.from(args.serialize()) : [];
    
    const params: ContractCallParams = {
      targetAddress: CONTRACT_ADDRESS,
      functionName,
      parameter,
      coins,
      fee
    };

    try {
      const result = await this.provider.callSC(params);
      return result;
    } catch (error) {
      console.error(`Error executing ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Helper to add string parameter to Args
   */
  addStringToArgs(args: Args, value: string): Args {
    args.add(value);
    return args;
  }

  /**
   * Helper to add number parameter to Args
   */
  addNumberToArgs(args: Args, value: number): Args {
    args.add(value);
    return args;
  }

  /**
   * Helper to add boolean parameter to Args
   */
  addBooleanToArgs(args: Args, value: boolean): Args {
    args.add(value);
    return args;
  }
}

/**
 * Parse contract result data
 * This is a helper function to handle the response format from Massa contracts
 */
export function parseContractResult(result: any): any {
  // The exact parsing logic depends on how the Massa wallet returns data
  // This might need adjustment based on the actual response format
  if (result && result.result) {
    return result.result;
  }
  return result;
}

/**
 * Generate a unique ID for battles, characters, etc.
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}_${random}`;
}

/**
 * Convert MAS to nanoMAS
 */
export function masToNanoMas(mas: number): number {
  return Math.floor(mas * 1000000000);
}

/**
 * Convert nanoMAS to MAS
 */
export function nanoMasToMas(nanoMas: number): number {
  return nanoMas / 1000000000;
}