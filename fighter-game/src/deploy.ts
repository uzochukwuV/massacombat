/**
 * FIGHTER GAME DEPLOYMENT SCRIPT
 * Deploys the Fighter Game smart contract to Massa blockchain
 *
 * Usage: npm run deploy
 *
 * Required environment variables:
 * - WALLET_SECRET_KEY: Your Massa wallet secret key
 */

import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import * as fs from 'fs';
import * as path from 'path';

function log(message: string): void {
  console.log(`  ${message}`);
}

function logSection(title: string): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}`);
}

function logSuccess(message: string): void {
  console.log(`  ✅ ${message}`);
}

function logError(message: string): void {
  console.error(`  ❌ ${message}`);
}

async function main(): Promise<void> {
  logSection('🚀 FIGHTER GAME - CONTRACT DEPLOYMENT');

  try {
    // Initialize account and provider
    const account = await Account.fromEnv();
    const provider = JsonRpcProvider.buildnet(account);

    log(`Deployer: ${account.address.toString()}`);
    log(`Network: Buildnet`);

    // Load compiled WASM
    const wasmPath = path.join(process.cwd(), 'build', 'main.wasm');

    if (!fs.existsSync(wasmPath)) {
      throw new Error('WASM file not found! Run: npm run build');
    }

    const wasmBytes = fs.readFileSync(wasmPath);
    log(`WASM Size: ${wasmBytes.length} bytes`);

    // Prepare constructor arguments
    const constructorArgs = new Args()
      .addString(account.address.toString()); // Admin address

    log(`Admin Address: ${account.address.toString()}`);

    logSection('📦 DEPLOYING CONTRACT...');

    // Deploy the contract
    const contract = await SmartContract.deploy(
      provider,
      wasmBytes,
      constructorArgs,
      {
        coins: Mas.fromString('5'), // Deploy with 5 MAS for storage
        maxGas: BigInt(3_000_000_000), // Max gas for deployment
      }
    );

    logSuccess(`Contract deployed!`);
    log(`Contract Address: ${contract.address}`);

    // Save deployment info
    const deploymentInfo = {
      contractAddress: contract.address,
      adminAddress: account.address.toString(),
      deployedAt: new Date().toISOString(),
      network: 'buildnet',
      wasmSize: wasmBytes.length,
    };

    const deploymentsDir = path.join(process.cwd(), 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, 'buildnet-latest.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    // Also save with timestamp
    const timestampPath = path.join(
      deploymentsDir,
      `buildnet-${Date.now()}.json`
    );
    fs.writeFileSync(timestampPath, JSON.stringify(deploymentInfo, null, 2));

    logSuccess(`Deployment info saved to: ${deploymentPath}`);

    // Verify deployment
    logSection('✅ VERIFYING DEPLOYMENT...');

    const isPausedResult = await contract.read('game_isPaused', new Args());
    const isPaused = new Args(isPausedResult.value).nextBool();
    log(`Contract Paused: ${isPaused}`);

    const adminResult = await contract.read('game_getAdmin', new Args());
    const admin = new Args(adminResult.value).nextString();
    log(`Admin: ${admin}`);

    const feeInfoResult = await contract.read('game_getFeeInfo', new Args());
    const feeInfo = new Args(feeInfoResult.value).nextString();
    log(`Fee Info: ${feeInfo}`);

    logSuccess('Deployment verified!');

    logSection('🎉 DEPLOYMENT COMPLETE');
    log(`Contract Address: ${contract.address}`);
    log(`\nYou can now run tests with: npm run test:battle`);

  } catch (error: any) {
    logError(`Deployment failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);
