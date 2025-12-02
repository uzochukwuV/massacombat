/**
 * Contract interaction utilities for Massa blockchain
 */

import { Args } from '@massalabs/massa-web3';

// Contract configuration
export const CONTRACT_ADDRESS = 'AS122vTBDiHYL34BykXKWHWKP9ADnTLiQoKMbzEfGJUkwiCo6ZErY';

/**
 * Call a read-only function on the smart contract
 */
export async function readContract(
  provider: any,
  contractAddress: string,
  functionName: string,
  args: Args
): Promise<Uint8Array> {
  if (!provider) {
    throw new Error('Provider not available');
  }

  try {
    const result = await provider.readSC({
      targetAddress: contractAddress,
      targetFunction: functionName,
      parameter: args.serialize(),
      maxGas: 100000000n,
      at: null
    });

    return result.returnValue;
  } catch (error) {
    console.error(`Error reading contract function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Execute a transaction on the smart contract
 */
export async function callContract(
  provider: any,
  contractAddress: string,
  functionName: string,
  args: Args,
  coins: bigint = 0n
): Promise<{ id: string }> {
  if (!provider) {
    throw new Error('Provider not available');
  }

  try {
    const result = await provider.callSC({
      targetAddress: contractAddress,
      targetFunction: functionName,
      parameter: args.serialize(),
      maxGas: 100000000n,
      coins: coins,
      at: null
    });

    return result;
  } catch (error) {
    console.error(`Error calling contract function ${functionName}:`, error);
    throw error;
  }
}