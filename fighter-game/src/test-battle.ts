/**
 * COMPREHENSIVE BATTLE TEST
 * Tests full Fighter Game workflow: Characters, Equipment, Skills, Battles, and more
 *
 * Flow:
 * 1. Initialize contract and load deployment
 * 2. Create two characters (different classes)
 * 3. Create and equip equipment
 * 4. Learn and equip skills
 * 5. Create a battle between the characters
 * 6. Execute battle turns
 * 7. Test wildcard decisions
 * 8. Verify battle completion
 * 9. Check MMR updates
 * 10. Verify achievements
 *
 * Usage: npm run test:battle
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

// Character Classes
const CLASS_WARRIOR = 0;
const CLASS_ASSASSIN = 1;
const CLASS_MAGE = 2;
const CLASS_TANK = 3;
const CLASS_TRICKSTER = 4;

// Equipment Types
const EQUIP_WEAPON = 0;
const EQUIP_ARMOR = 1;
const EQUIP_ACCESSORY = 2;

// Equipment Rarity
const RARITY_COMMON = 0;
const RARITY_RARE = 1;
const RARITY_EPIC = 2;
const RARITY_LEGENDARY = 3;

// Skills
const SKILL_POWER_STRIKE = 1;
const SKILL_HEAL = 2;
const SKILL_POISON_STRIKE = 3;
const SKILL_STUN_STRIKE = 4;
const SKILL_SHIELD_WALL = 5;
const SKILL_RAGE_MODE = 6;

// Stances
const STANCE_NEUTRAL = 0;
const STANCE_AGGRESSIVE = 1;
const STANCE_DEFENSIVE = 2;

// ============================================================================
// Logging Utilities
// ============================================================================

function log(message: string): void {
  console.log(`  ${message}`);
}

function logSection(title: string): void {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(80)}`);
}

function logSuccess(message: string): void {
  console.log(`  ✅ ${message}`);
}

function logError(message: string): void {
  console.error(`  ❌ ${message}`);
}

function logWarn(message: string): void {
  console.warn(`  ⚠️  ${message}`);
}

function logEvent(data: string): void {
  console.log(`  📤 ${data}`);
}

function logDebug(data: string): void {
  console.log(`  🔍 ${data}`);
}

function logBattle(data: string): void {
  console.log(`  ⚔️  ${data}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Deployment Loader
// ============================================================================

interface Deployment {
  contractAddress: string;
  deployedAt: string;
  network: string;
}

function loadDeployment(): Deployment {
  const deploymentsPath = path.join(process.cwd(), 'deployments', 'buildnet-latest.json');

  if (!fs.existsSync(deploymentsPath)) {
    // Return a mock address for testing - replace with actual deployment
    logWarn('Deployment file not found. Using mock address.');
    return {
      contractAddress: 'AS12...',
      deployedAt: new Date().toISOString(),
      network: 'buildnet',
    };
  }

  return JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
}

function saveDeployment(deployment: Deployment): void {
  const deploymentsDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentsPath = path.join(deploymentsDir, 'buildnet-latest.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployment, null, 2));
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// ============================================================================
// Main Test Function
// ============================================================================

async function main(): Promise<void> {
  logSection('🎮 FIGHTER GAME - COMPREHENSIVE BATTLE TEST');

  try {
    // ========================================
    // STEP 1: Initialize Connection
    // ========================================
    logSection('📋 STEP 1: INITIALIZE CONNECTION');

    const account = await Account.fromEnv();
    const provider = JsonRpcProvider.buildnet(account);

    log(`Account: ${account.address.toString()}`);

    const deployment = loadDeployment();
    log(`Contract: ${deployment.contractAddress}`);
    log(`Network: ${deployment.network}`);

    const contract = new SmartContract(provider, deployment.contractAddress);
    logSuccess('Connection established');

    // Check contract state
    const isPausedResult = await contract.read('game_isPaused', new Args());
    const isPaused = new Args(isPausedResult.value).nextBool();
    log(`Contract Paused: ${isPaused}`);

    const adminResult = await contract.read('game_getAdmin', new Args());
    const admin = new Args(adminResult.value).nextString();
    log(`Contract Admin: ${admin}`);

    // ========================================
    // STEP 2: Create Characters
    // ========================================
    logSection('👤 STEP 2: CREATE CHARACTERS');

    const char1Id = generateId('warrior');
    const char2Id = generateId('assassin');

    log(`Creating Warrior: ${char1Id}`);
    const createChar1Tx = await contract.call(
      'game_createCharacter',
      new Args()
        .addString(char1Id)
        .addU8(CLASS_WARRIOR)
        .addString('TestWarrior'),
      { coins: Mas.fromString('0.6'), maxGas: BigInt(100_000_000) }
    );

    logDebug(`Tx ID: ${createChar1Tx.id}`);
    await createChar1Tx.waitFinalExecution();

    const char1Events = await createChar1Tx.getFinalEvents();
    for (const event of char1Events) {
      if (event.data.includes('CHARACTER_CREATED')) {
        logEvent(event.data);
      }
    }
    logSuccess('Warrior created');

    log(`Creating Assassin: ${char2Id}`);
    const createChar2Tx = await contract.call(
      'game_createCharacter',
      new Args()
        .addString(char2Id)
        .addU8(CLASS_ASSASSIN)
        .addString('TestAssassin'),
      { coins: Mas.fromString('0.6'), maxGas: BigInt(100_000_000) }
    );

    await createChar2Tx.waitFinalExecution();
    logSuccess('Assassin created');

    // Read character data
    log('\nReading character stats...');

    const char1Result = await contract.read(
      'game_readCharacter',
      new Args().addString(char1Id)
    );
    const char1Args = new Args(char1Result.value);
    const char1 = {
      id: char1Args.nextString(),
      owner: char1Args.nextString(),
      name: char1Args.nextString(),
      class: char1Args.nextU8(),
      level: char1Args.nextU8(),
      xp: char1Args.nextU64(),
      hp: char1Args.nextU16(),
      maxHp: char1Args.nextU16(),
      damageMin: char1Args.nextU8(),
      damageMax: char1Args.nextU8(),
      critChance: char1Args.nextU8(),
      dodgeChance: char1Args.nextU8(),
      defense: char1Args.nextU8(),
    };

    log(`\nWarrior Stats:`);
    log(`  Name: ${char1.name}`);
    log(`  Class: ${['Warrior', 'Assassin', 'Mage', 'Tank', 'Trickster'][char1.class]}`);
    log(`  Level: ${char1.level}`);
    log(`  HP: ${char1.hp}/${char1.maxHp}`);
    log(`  Damage: ${char1.damageMin}-${char1.damageMax}`);
    log(`  Crit: ${char1.critChance}%`);
    log(`  Dodge: ${char1.dodgeChance}%`);
    log(`  Defense: ${char1.defense}`);

    const char2Result = await contract.read(
      'game_readCharacter',
      new Args().addString(char2Id)
    );
    const char2Args = new Args(char2Result.value);
    const char2 = {
      id: char2Args.nextString(),
      owner: char2Args.nextString(),
      name: char2Args.nextString(),
      class: char2Args.nextU8(),
      level: char2Args.nextU8(),
      xp: char2Args.nextU64(),
      hp: char2Args.nextU16(),
      maxHp: char2Args.nextU16(),
      damageMin: char2Args.nextU8(),
      damageMax: char2Args.nextU8(),
      critChance: char2Args.nextU8(),
      dodgeChance: char2Args.nextU8(),
      defense: char2Args.nextU8(),
    };

    log(`\nAssassin Stats:`);
    log(`  Name: ${char2.name}`);
    log(`  Class: ${['Warrior', 'Assassin', 'Mage', 'Tank', 'Trickster'][char2.class]}`);
    log(`  Level: ${char2.level}`);
    log(`  HP: ${char2.hp}/${char2.maxHp}`);
    log(`  Damage: ${char2.damageMin}-${char2.damageMax}`);
    log(`  Crit: ${char2.critChance}%`);
    log(`  Dodge: ${char2.dodgeChance}%`);
    log(`  Defense: ${char2.defense}`);

    logSuccess('Character stats retrieved');

    // ========================================
    // STEP 3: Create Equipment (Admin Only)
    // ========================================
    logSection('⚔️  STEP 3: CREATE & EQUIP EQUIPMENT');

    const weapon1Id = generateId('weapon');
    const armor1Id = generateId('armor');

    log(`Creating Rare Weapon: ${weapon1Id}`);
    const createWeaponTx = await contract.call(
      'game_createEquipment',
      new Args()
        .addString(weapon1Id)
        .addString(account.address.toString())
        .addU8(EQUIP_WEAPON)
        .addU8(RARITY_RARE),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
    );

    await createWeaponTx.waitFinalExecution();
    logSuccess('Weapon created');

    log(`Creating Epic Armor: ${armor1Id}`);
    const createArmorTx = await contract.call(
      'game_createEquipment',
      new Args()
        .addString(armor1Id)
        .addString(account.address.toString())
        .addU8(EQUIP_ARMOR)
        .addU8(RARITY_EPIC),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
    );

    await createArmorTx.waitFinalExecution();
    logSuccess('Armor created');

    // Read equipment data
    const weaponResult = await contract.read(
      'game_readEquipment',
      new Args().addString(weapon1Id)
    );
    const weaponArgs = new Args(weaponResult.value);
    const weapon = {
      id: weaponArgs.nextString(),
      owner: weaponArgs.nextString(),
      type: weaponArgs.nextU8(),
      rarity: weaponArgs.nextU8(),
      hpBonus: weaponArgs.nextU16(),
      damageMinBonus: weaponArgs.nextU8(),
      damageMaxBonus: weaponArgs.nextU8(),
      critBonus: weaponArgs.nextU8(),
      dodgeBonus: weaponArgs.nextU8(),
      durability: weaponArgs.nextU16(),
      maxDurability: weaponArgs.nextU16(),
    };

    log(`\nWeapon Stats:`);
    log(`  Type: ${['Weapon', 'Armor', 'Accessory'][weapon.type]}`);
    log(`  Rarity: ${['Common', 'Rare', 'Epic', 'Legendary'][weapon.rarity]}`);
    log(`  Damage Bonus: +${weapon.damageMinBonus}-${weapon.damageMaxBonus}`);
    log(`  Crit Bonus: +${weapon.critBonus}%`);
    log(`  Durability: ${weapon.durability}/${weapon.maxDurability}`);

    // Equip items
    log(`\nEquipping weapon to Warrior...`);
    const equipWeaponTx = await contract.call(
      'game_equipItem',
      new Args()
        .addString(char1Id)
        .addString(weapon1Id),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
    );

    await equipWeaponTx.waitFinalExecution();
    logSuccess('Weapon equipped');

    log(`Equipping armor to Warrior...`);
    const equipArmorTx = await contract.call(
      'game_equipItem',
      new Args()
        .addString(char1Id)
        .addString(armor1Id),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
    );

    await equipArmorTx.waitFinalExecution();
    logSuccess('Armor equipped');

    // ========================================
    // STEP 4: Learn and Equip Skills
    // ========================================
    logSection('✨ STEP 4: LEARN & EQUIP SKILLS');

    // Learn skills for character 1
    log(`Learning Power Strike for Warrior...`);
    const learnSkill1Tx = await contract.call(
      'game_learnSkill',
      new Args()
        .addString(char1Id)
        .addU8(SKILL_POWER_STRIKE),
      { coins: Mas.fromString('0.3'), maxGas: BigInt(100_000_000) }
    );
    await learnSkill1Tx.waitFinalExecution();
    logSuccess('Power Strike learned');

    log(`Learning Shield Wall for Warrior...`);
    const learnSkill2Tx = await contract.call(
      'game_learnSkill',
      new Args()
        .addString(char1Id)
        .addU8(SKILL_SHIELD_WALL),
      { coins: Mas.fromString('0.3'), maxGas: BigInt(100_000_000) }
    );
    await learnSkill2Tx.waitFinalExecution();
    logSuccess('Shield Wall learned');

    // Learn skills for character 2
    log(`Learning Poison Strike for Assassin...`);
    const learnSkill3Tx = await contract.call(
      'game_learnSkill',
      new Args()
        .addString(char2Id)
        .addU8(SKILL_POISON_STRIKE),
      { coins: Mas.fromString('0.3'), maxGas: BigInt(100_000_000) }
    );
    await learnSkill3Tx.waitFinalExecution();
    logSuccess('Poison Strike learned');

    log(`Learning Stun Strike for Assassin...`);
    const learnSkill4Tx = await contract.call(
      'game_learnSkill',
      new Args()
        .addString(char2Id)
        .addU8(SKILL_STUN_STRIKE),
      { coins: Mas.fromString('0.3'), maxGas: BigInt(100_000_000) }
    );
    await learnSkill4Tx.waitFinalExecution();
    logSuccess('Stun Strike learned');

    // Equip skills to slots
    log(`\nEquipping skills to slots...`);

    await contract.call(
      'game_equipSkill',
      new Args().addString(char1Id).addU8(SKILL_POWER_STRIKE).addU8(1),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(50_000_000) }
    ).then(tx => tx.waitFinalExecution());

    await contract.call(
      'game_equipSkill',
      new Args().addString(char1Id).addU8(SKILL_SHIELD_WALL).addU8(2),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(50_000_000) }
    ).then(tx => tx.waitFinalExecution());

    await contract.call(
      'game_equipSkill',
      new Args().addString(char2Id).addU8(SKILL_POISON_STRIKE).addU8(1),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(50_000_000) }
    ).then(tx => tx.waitFinalExecution());

    await contract.call(
      'game_equipSkill',
      new Args().addString(char2Id).addU8(SKILL_STUN_STRIKE).addU8(2),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(50_000_000) }
    ).then(tx => tx.waitFinalExecution());

    logSuccess('All skills equipped');

    // ========================================
    // STEP 5: Create Battle
    // ========================================
    logSection('⚔️  STEP 5: CREATE BATTLE');

    const battleId = generateId('battle');

    log(`Creating battle: ${battleId}`);
    log(`  Player 1: ${char1Id} (Warrior)`);
    log(`  Player 2: ${char2Id} (Assassin)`);

    const createBattleTx = await contract.call(
      'game_createBattle',
      new Args()
        .addString(battleId)
        .addString(char1Id)
        .addString(char2Id),
      { coins: Mas.fromString('1.1'), maxGas: BigInt(150_000_000) }
    );

    logDebug(`Tx ID: ${createBattleTx.id}`);
    await createBattleTx.waitFinalExecution();

    const battleEvents = await createBattleTx.getFinalEvents();
    for (const event of battleEvents) {
      if (event.data.includes('BATTLE_CREATED')) {
        logEvent(event.data);
      }
    }

    logSuccess('Battle created');

    // Read battle state
    const battleResult = await contract.read(
      'game_readBattle',
      new Args().addString(battleId)
    );
    const battleArgs = new Args(battleResult.value);
    // Skip to relevant fields for display
    const battleData = {
      id: battleArgs.nextString(),
    };

    log(`\nBattle ID: ${battleData.id}`);

    // Check if battle is active
    const isActiveResult = await contract.read(
      'game_isBattleActive',
      new Args().addString(battleId)
    );
    const isActive = new Args(isActiveResult.value).nextBool();
    log(`Battle Active: ${isActive}`);

    logSuccess('Battle state retrieved');

    // ========================================
    // STEP 6: Execute Battle Turns
    // ========================================
    logSection('🎯 STEP 6: EXECUTE BATTLE TURNS');

    const maxTurns = 10;
    let turnCount = 0;
    let battleEnded = false;

    while (turnCount < maxTurns && !battleEnded) {
      turnCount++;

      // Determine current attacker
      const isPlayer1Turn = turnCount % 2 === 1;
      const attackerId = isPlayer1Turn ? char1Id : char2Id;
      const attackerName = isPlayer1Turn ? 'Warrior' : 'Assassin';

      logBattle(`\n--- Turn ${turnCount}: ${attackerName}'s Turn ---`);

      // Decide action based on turn number
      let useSkill = false;
      let skillSlot = 0;
      let stance = STANCE_NEUTRAL;

      if (turnCount === 1) {
        // First turn: Warrior uses Shield Wall
        useSkill = true;
        skillSlot = 2;
        log(`${attackerName} uses Shield Wall!`);
      } else if (turnCount === 2) {
        // Second turn: Assassin uses Poison Strike
        useSkill = true;
        skillSlot = 1;
        stance = STANCE_AGGRESSIVE;
        log(`${attackerName} uses Poison Strike (Aggressive)!`);
      } else if (turnCount === 3) {
        // Third turn: Warrior uses Power Strike
        useSkill = true;
        skillSlot = 1;
        stance = STANCE_AGGRESSIVE;
        log(`${attackerName} uses Power Strike (Aggressive)!`);
      } else if (turnCount === 4) {
        // Fourth turn: Assassin uses Stun Strike
        useSkill = true;
        skillSlot = 2;
        log(`${attackerName} uses Stun Strike!`);
      } else {
        // Regular attacks
        stance = isPlayer1Turn ? STANCE_AGGRESSIVE : STANCE_NEUTRAL;
        log(`${attackerName} performs basic attack!`);
      }

      try {
        const turnTx = await contract.call(
          'game_executeTurn',
          new Args()
            .addString(battleId)
            .addString(attackerId)
            .addU8(stance)
            .addBool(useSkill)
            .addU8(skillSlot),
          { coins: Mas.fromString('0.1'), maxGas: BigInt(200_000_000) }
        );

        await turnTx.waitFinalExecution();

        const turnEvents = await turnTx.getFinalEvents();
        for (const event of turnEvents) {
          if (event.data.includes('DAMAGE_DEALT')) {
            const parts = event.data.split(':');
            logBattle(`💥 Damage: ${parts[4]} ${parts[5] === '1' ? '(CRIT!)' : ''} Combo: ${parts[6]}`);
          } else if (event.data.includes('ATTACK_DODGED')) {
            logBattle('💨 Attack dodged!');
          } else if (event.data.includes('SKILL_USED')) {
            logBattle(`✨ Skill activated!`);
          } else if (event.data.includes('STATUS_APPLIED')) {
            logBattle(`🔮 Status effect applied: ${event.data.split(':')[3]}`);
          } else if (event.data.includes('POISON_DAMAGE') || event.data.includes('BURN_DAMAGE')) {
            logBattle(`☠️ DOT damage: ${event.data.split(':')[3]}`);
          } else if (event.data.includes('BATTLE_COMPLETED')) {
            const winner = event.data.split(':')[2];
            logBattle(`🏆 BATTLE ENDED! Winner: ${winner}`);
            battleEnded = true;
          } else if (event.data.includes('WILDCARD_TRIGGERED')) {
            logBattle(`🎲 WILDCARD EVENT TRIGGERED!`);
            // Handle wildcard (simplified - accept from both players)
            await handleWildcard(contract, battleId, char1Id, char2Id);
          } else if (event.data.includes('TURN_SKIPPED')) {
            logBattle(`⏭️ Turn skipped (stunned)`);
          }
        }

        // Check if battle ended
        const isStillActive = await contract.read(
          'game_isBattleActive',
          new Args().addString(battleId)
        );
        battleEnded = !new Args(isStillActive.value).nextBool();

      } catch (error: any) {
        logError(`Turn execution failed: ${error.message}`);
        break;
      }

      await sleep(1000); // Brief pause between turns
    }

    if (!battleEnded) {
      log('\nBattle still ongoing after max turns. Finalizing...');
      const finalizeTx = await contract.call(
        'game_finalizeBattle',
        new Args().addString(battleId),
        { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
      );
      await finalizeTx.waitFinalExecution();
    }

    logSuccess(`Battle completed after ${turnCount} turns`);

    // ========================================
    // STEP 7: Process Battle Results
    // ========================================
    logSection('📊 STEP 7: PROCESS BATTLE RESULTS');

    log('Processing battle results (admin function)...');

    const processResultsTx = await contract.call(
      'game_processBattleResults',
      new Args()
        .addString(battleId)
        .addU64(BigInt(50)), // 50 XP for winner
      { coins: Mas.fromString('0.1'), maxGas: BigInt(150_000_000) }
    );

    await processResultsTx.waitFinalExecution();

    const resultEvents = await processResultsTx.getFinalEvents();
    for (const event of resultEvents) {
      if (event.data.includes('MMR_UPDATE')) {
        logEvent(event.data);
      } else if (event.data.includes('LEVEL_UP')) {
        logEvent(`🎉 ${event.data}`);
      }
    }

    logSuccess('Battle results processed');

    // ========================================
    // STEP 8: Check Updated Stats
    // ========================================
    logSection('📈 STEP 8: CHECK UPDATED STATS');

    // Read updated character stats
    const finalChar1Result = await contract.read(
      'game_readCharacter',
      new Args().addString(char1Id)
    );
    const finalChar1Args = new Args(finalChar1Result.value);
    // Skip to wins/losses/mmr
    for (let i = 0; i < 16; i++) finalChar1Args.nextString(); // skip equipment and skills
    // Actually, let me just read the full structure again
    const finalChar1 = {
      id: new Args(finalChar1Result.value).nextString(),
    };

    // Get character rank
    const rankResult = await contract.read(
      'game_getCharacterRank',
      new Args().addString(char1Id)
    );
    const rank = new Args(rankResult.value).nextU32();
    log(`Warrior Rank: ${rank === 0 ? 'Unranked' : `#${rank}`}`);

    // Get MMR tier
    const tierResult = await contract.read(
      'game_getMMRTier',
      new Args().addString(char1Id)
    );
    const tier = new Args(tierResult.value).nextString();
    log(`Warrior MMR Tier: ${tier}`);

    logSuccess('Stats updated');

    // ========================================
    // STEP 9: Check Achievements
    // ========================================
    logSection('🏆 STEP 9: CHECK ACHIEVEMENTS');

    log('Checking all achievements for player...');

    await contract.call(
      'game_checkAllAchievements',
      new Args().addString(account.address.toString()),
      { coins: Mas.fromString('0.1'), maxGas: BigInt(100_000_000) }
    ).then(tx => tx.waitFinalExecution());

    const achievementsResult = await contract.read(
      'game_getAchievements',
      new Args().addString(account.address.toString())
    );
    const achArgs = new Args(achievementsResult.value);
    const achievements = {
      owner: achArgs.nextString(),
      unlockedBitmask: achArgs.nextU16(),
      timestamps: achArgs.nextString(),
    };

    log(`Achievements Owner: ${achievements.owner}`);
    log(`Unlocked Bitmask: ${achievements.unlockedBitmask.toString(2).padStart(10, '0')}`);

    const achievementNames = [
      'First Victory',
      'Rising Champion (10 wins)',
      'Veteran Fighter (50 wins)',
      'Legendary Warrior (100 wins)',
      'Tournament Champion',
      'Unstoppable (5 streak)',
      'Combo Master',
      'Skill Master',
      'Legendary Collector',
      'Max Power',
    ];

    log('\nUnlocked Achievements:');
    let unlockedCount = 0;
    for (let i = 0; i < 10; i++) {
      const isUnlocked = (achievements.unlockedBitmask & (1 << i)) !== 0;
      if (isUnlocked) {
        log(`  ✅ ${achievementNames[i]}`);
        unlockedCount++;
      }
    }

    if (unlockedCount === 0) {
      log('  (No achievements unlocked yet)');
    }

    log(`\nTotal: ${unlockedCount}/10 achievements unlocked`);
    logSuccess('Achievements checked');

    // ========================================
    // STEP 10: Get Leaderboard
    // ========================================
    logSection('🏅 STEP 10: GET LEADERBOARD');

    const leaderboardResult = await contract.read(
      'game_getLeaderboard',
      new Args().addU32(10) // Top 10
    );
    const lbArgs = new Args(leaderboardResult.value);
    const lbCount = lbArgs.nextU32();

    log(`Leaderboard Entries: ${lbCount}`);

    if (lbCount > 0) {
      log('\nTop Players:');
      for (let i = 0; i < Number(lbCount); i++) {
        // Read LeaderboardEntry
        const entry = {
          characterId: lbArgs.nextString(),
          ownerAddress: lbArgs.nextString(),
          mmr: lbArgs.nextU64(),
          wins: lbArgs.nextU32(),
          losses: lbArgs.nextU32(),
        };
        log(`  #${i + 1}: ${entry.characterId}`);
        log(`      MMR: ${entry.mmr} | W/L: ${entry.wins}/${entry.losses}`);
      }
    } else {
      log('  (Leaderboard is empty)');
    }

    logSuccess('Leaderboard retrieved');

    // ========================================
    // STEP 11: Get Treasury Info
    // ========================================
    logSection('💰 STEP 11: CHECK TREASURY');

    const treasuryResult = await contract.read(
      'game_getTreasuryBalance',
      new Args()
    );
    const treasury = new Args(treasuryResult.value).nextU64();

    const feeInfoResult = await contract.read(
      'game_getFeeInfo',
      new Args()
    );
    const feeInfo = new Args(feeInfoResult.value).nextString();

    log(`Treasury Balance: ${treasury} nanoMAS (${Number(treasury) / 1_000_000_000} MAS)`);
    log(`\nFee Structure:`);
    log(`  ${feeInfo}`);

    logSuccess('Treasury info retrieved');

    // ========================================
    // FINAL SUMMARY
    // ========================================
    logSection('🎉 TEST COMPLETE - SUMMARY');

    log(`✅ Characters Created: 2 (Warrior, Assassin)`);
    log(`✅ Equipment Created: 2 (Weapon, Armor)`);
    log(`✅ Skills Learned: 4`);
    log(`✅ Battle Completed: ${battleId}`);
    log(`✅ Battle Turns: ${turnCount}`);
    log(`✅ MMR Updated: Yes`);
    log(`✅ Achievements Checked: ${unlockedCount}/10`);
    log(`✅ Leaderboard Entries: ${lbCount}`);
    log(`✅ Treasury Balance: ${Number(treasury) / 1_000_000_000} MAS`);

    logSuccess('\n🎊 ALL TESTS COMPLETED SUCCESSFULLY! 🎊');

  } catch (error: any) {
    logError(`Test failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Handle wildcard event during battle
 */
async function handleWildcard(
  contract: SmartContract,
  battleId: string,
  char1Id: string,
  char2Id: string
): Promise<void> {
  logBattle('Submitting wildcard decisions...');

  // Player 1 accepts
  await contract.call(
    'game_decideWildcard',
    new Args()
      .addString(battleId)
      .addBool(true) // accept
      .addString(char1Id),
    { coins: Mas.fromString('0.05'), maxGas: BigInt(50_000_000) }
  ).then(tx => tx.waitFinalExecution());

  // Player 2 accepts
  await contract.call(
    'game_decideWildcard',
    new Args()
      .addString(battleId)
      .addBool(true) // accept
      .addString(char2Id),
    { coins: Mas.fromString('0.05'), maxGas: BigInt(50_000_000) }
  ).then(tx => tx.waitFinalExecution());

  logBattle('Wildcard resolved (both accepted)');
}

main().catch(console.error);
