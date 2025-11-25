/**
 * Fighter Game Smart Contract - Main Entry Point
 * PvP Fighting Game on Massa Blockchain
 *
 * This contract implements a turn-based combat game with:
 * - Character classes and progression
 * - Equipment NFT system
 * - Skill-based combat with energy management
 * - Status effects and combo system
 * - Tournament system
 * - MMR-based matchmaking and leaderboards
 * - Achievement tracking
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args, Serializable } from '@massalabs/as-types';

// Import types
import {
  Character,
  Equipment,
  Battle,
  Tournament,
  LeaderboardEntry,
  AchievementTracker,
} from './types';

// Import storage
import {
  setAdmin,
  getAdmin,
  isAdmin,
  setPaused,
  isPaused,
  setReentrancyLock,
  isReentrancyLocked,
  loadCharacter,
  loadEquipment,
  loadBattle,
  loadTournament,
} from './storage';

// Import components
import {
  createCharacter as _createCharacter,
  readCharacter,
  healCharacter as _healCharacter,
  upgradeCharacter as _upgradeCharacter,
  grantXP as _grantXP,
} from './character';

import {
  createEquipment as _createEquipment,
  adminMintEquipment as _adminMintEquipment,
  readEquipment,
  transferEquipment as _transferEquipment,
  equipItem as _equipItem,
  unequipItem as _unequipItem,
  repairEquipment as _repairEquipment,
} from './equipment';

import {
  learnSkill as _learnSkill,
  equipSkill as _equipSkill,
} from './skills';

import {
  createBattle as _createBattle,
  executeTurn as _executeTurn,
  decideWildcard as _decideWildcard,
  finalizeBattle as _finalizeBattle,
  timeoutWildcard as _timeoutWildcard,
  getBattle,
  isBattleActive,
} from './battle';

import {
  createTournament as _createTournament,
  registerForTournament as _registerForTournament,
  recordTournamentMatch as _recordTournamentMatch,
  advanceTournamentRound as _advanceTournamentRound,
  forceFinalizeTournament as _forceFinalizeTournament,
} from './tournament';

import {
  updateBattleMMR,
  getLeaderboard as _getLeaderboard,
  getCharacterRank,
  getWinRate,
  getMMRTier,
} from './leaderboard';

import {
  getPlayerAchievements,
  checkAllAchievements as _checkAllAchievements,
  getUnlockedAchievementsString,
  getCompletionPercentage,
} from './achievements';

import {
  collectBattleFee,
  collectCharacterCreationFee,
  collectSkillLearningFee,
  collectUpgradeFee,
  collectRepairFee,
  getTreasuryBalance,
  getContractBalance,
  withdrawFromTreasury as _withdrawFromTreasury,
  emergencyWithdraw as _emergencyWithdraw,
  getFeeInfo,
  BATTLE_FEE,
  CHARACTER_CREATION_FEE,
} from './treasury';

import {
  scheduleMatch as _scheduleMatch,
  placePrediction as _placePrediction,
  lockMarket as _lockMarket,
  executeScheduledMatch as _executeScheduledMatch,
  resolveMarket as _resolveMarket,
  claimWinnings as _claimWinnings,
  cancelMatch as _cancelMatch,
  autonomousLockMarket as _autonomousLockMarket,
  autonomousExecuteMatch as _autonomousExecuteMatch,
  autonomousResolveMarket as _autonomousResolveMarket,
  autonomousCleanup as _autonomousCleanup,
  readScheduledMatch,
  readPredictionMarket,
  readPrediction,
  readUserPredictions,
  readMarketPredictions,
  getMarketInfo,
  getUpcomingMatches,
} from './prediction';

// ============================================================================
// Modifiers (Security)
// ============================================================================

function requireNotPaused(): void {
  assert(!isPaused(), 'Contract is paused');
}

function requireAdmin(): void {
  assert(isAdmin(Context.caller().toString()), 'Admin only');
}

function requireNoReentrancy(): void {
  assert(!isReentrancyLocked(), 'Reentrancy detected');
  setReentrancyLock(true);
}

function releaseReentrancy(): void {
  setReentrancyLock(false);
}

// ============================================================================
// Contract Initialization
// ============================================================================

/**
 * Initialize the contract (called on deployment)
 * @param binaryArgs - Serialized Args containing admin address
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // Only allow initialization once
  assert(getAdmin() == '', 'Already initialized');

  const args = new Args(binaryArgs);
  const adminAddress = args.nextString().expect('Admin address required');

  setAdmin(adminAddress);
  setPaused(false);

  generateEvent(`CONTRACT_INITIALIZED:${adminAddress}`);
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Pause the contract
 */
export function game_pause(_: StaticArray<u8>): void {
  requireAdmin();
  setPaused(true);
  generateEvent('CONTRACT_PAUSED');
}

/**
 * Unpause the contract
 */
export function game_unpause(_: StaticArray<u8>): void {
  requireAdmin();
  setPaused(false);
  generateEvent('CONTRACT_UNPAUSED');
}

/**
 * Transfer admin role
 */
export function game_transferAdmin(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  const args = new Args(binaryArgs);
  const newAdmin = args.nextString().expect('New admin address required');
  setAdmin(newAdmin);
  generateEvent(`ADMIN_TRANSFERRED:${newAdmin}`);
}

// ============================================================================
// Character Functions
// ============================================================================

/**
 * Create a new character
 * @param binaryArgs - Serialized: id (string), classId (u8), name (string)
 */
export function game_createCharacter(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  requireNotPaused();
  requireNoReentrancy();

  // Collect creation fee
  collectCharacterCreationFee();

  const args = new Args(binaryArgs);
  const id = args.nextString().expect('Character ID required');
  const classId = args.nextU8().expect('Class ID required');
  const name = args.nextString().expect('Name required');

  const character = _createCharacter(id, classId, name);

  releaseReentrancy();
  return character.serialize();
}

/**
 * Read character data
 * @param binaryArgs - Serialized: id (string)
 */
export function game_readCharacter(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const id = args.nextString().expect('Character ID required');
  return readCharacter(id).serialize();
}

/**
 * Heal character to full HP
 * @param binaryArgs - Serialized: charId (string)
 */
export function game_healCharacter(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const charId = args.nextString().expect('Character ID required');
  _healCharacter(charId);
}

/**
 * Upgrade character stat
 * @param binaryArgs - Serialized: charId (string), upgradeType (u8)
 */
export function game_upgradeCharacter(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  collectUpgradeFee();

  const args = new Args(binaryArgs);
  const charId = args.nextString().expect('Character ID required');
  const upgradeType = args.nextU8().expect('Upgrade type required');

  _upgradeCharacter(charId, upgradeType);

  releaseReentrancy();
}

/**
 * Admin grant XP to character
 */
export function game_grantXP(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  const args = new Args(binaryArgs);
  const charId = args.nextString().expect('Character ID required');
  const amount = args.nextU64().expect('Amount required');
  _grantXP(charId, amount);
}

// ============================================================================
// Equipment Functions
// ============================================================================

/**
 * Admin mint equipment
 */
export function game_createEquipment(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  requireAdmin();
  const args = new Args(binaryArgs);
  const equipmentId = args.nextString().expect('Equipment ID required');
  const owner = args.nextString().expect('Owner address required');
  const equipType = args.nextU8().expect('Equipment type required');
  const rarity = args.nextU8().expect('Rarity required');

  const equipment = _adminMintEquipment(equipmentId, owner, equipType, rarity);
  return equipment.serialize();
}

/**
 * Read equipment data
 */
export function game_readEquipment(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const id = args.nextString().expect('Equipment ID required');
  return readEquipment(id).serialize();
}

/**
 * Transfer equipment to another address
 */
export function game_transferEquipment(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const equipmentId = args.nextString().expect('Equipment ID required');
  const toAddr = args.nextString().expect('Destination address required');
  _transferEquipment(equipmentId, toAddr);
}

/**
 * Equip item to character
 */
export function game_equipItem(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const charId = args.nextString().expect('Character ID required');
  const equipmentId = args.nextString().expect('Equipment ID required');
  _equipItem(charId, equipmentId);
}

/**
 * Unequip item from character
 */
export function game_unequipItem(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const charId = args.nextString().expect('Character ID required');
  const equipmentId = args.nextString().expect('Equipment ID required');
  _unequipItem(charId, equipmentId);
}

/**
 * Repair equipment
 */
export function game_repairEquipment(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const equipmentId = args.nextString().expect('Equipment ID required');

  // Get equipment to determine rarity
  const equipment = readEquipment(equipmentId);
  collectRepairFee(equipment.rarity);

  _repairEquipment(equipmentId);

  releaseReentrancy();
}

// ============================================================================
// Skill Functions
// ============================================================================

/**
 * Learn a skill
 */
export function game_learnSkill(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  collectSkillLearningFee();

  const args = new Args(binaryArgs);
  const characterId = args.nextString().expect('Character ID required');
  const skillId = args.nextU8().expect('Skill ID required');

  _learnSkill(characterId, skillId);

  releaseReentrancy();
}

/**
 * Equip a skill to slot
 */
export function game_equipSkill(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const characterId = args.nextString().expect('Character ID required');
  const skillId = args.nextU8().expect('Skill ID required');
  const slot = args.nextU8().expect('Slot required');
  _equipSkill(characterId, skillId, slot);
}

// ============================================================================
// Battle Functions
// ============================================================================

/**
 * Create a new battle
 */
export function game_createBattle(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  requireNotPaused();
  requireNoReentrancy();

  collectBattleFee();

  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  const char1Id = args.nextString().expect('Character 1 ID required');
  const char2Id = args.nextString().expect('Character 2 ID required');
  const startTs = Context.timestamp();

  const battle = _createBattle(battleId, char1Id, char2Id, startTs);

  releaseReentrancy();
  return battle.serialize();
}

/**
 * Execute a turn in battle
 */
export function game_executeTurn(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  const attackerCharId = args.nextString().expect('Attacker ID required');
  const stance = args.nextU8().expect('Stance required');
  const useSpecial = args.nextBool().expect('Use special required');
  const skillSlot = args.nextU8().expect('Skill slot required');

  _executeTurn(battleId, attackerCharId, stance, useSpecial, skillSlot);

  releaseReentrancy();
}

/**
 * Submit wildcard decision
 */
export function game_decideWildcard(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  const accept = args.nextBool().expect('Decision required');
  const playerCharId = args.nextString().expect('Player character ID required');
  _decideWildcard(battleId, accept, playerCharId);
}

/**
 * Finalize battle (for timeout)
 */
export function game_finalizeBattle(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  _finalizeBattle(battleId);
}

/**
 * Timeout wildcard decision
 */
export function game_timeoutWildcard(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  _timeoutWildcard(battleId);
}

/**
 * Read battle data
 */
export function game_readBattle(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const id = args.nextString().expect('Battle ID required');
  return getBattle(id).serialize();
}

/**
 * Process battle results (updates MMR and achievements)
 */
export function game_processBattleResults(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');
  const xpForWinner = args.nextU64().expect('XP amount required');

  const battle = getBattle(battleId);
  assert(battle.winnerId.length > 0, 'Battle not completed');

  const loserId = battle.player1.characterId == battle.winnerId
    ? battle.player2.characterId
    : battle.player1.characterId;

  updateBattleMMR(battle.winnerId, loserId, xpForWinner);
}

// ============================================================================
// Tournament Functions
// ============================================================================

/**
 * Create tournament (admin)
 */
export function game_createTournament(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  requireAdmin();
  const args = new Args(binaryArgs);
  const tournamentId = args.nextString().expect('Tournament ID required');
  const name = args.nextString().expect('Name required');
  const entryFee = args.nextU64().expect('Entry fee required');
  const maxParticipants = args.nextU8().expect('Max participants required');

  const tournament = _createTournament(tournamentId, name, entryFee, maxParticipants);
  return tournament.serialize();
}

/**
 * Register for tournament
 */
export function game_registerForTournament(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const tournamentId = args.nextString().expect('Tournament ID required');
  const characterId = args.nextString().expect('Character ID required');

  _registerForTournament(tournamentId, characterId);

  releaseReentrancy();
}

/**
 * Record tournament match result (admin)
 */
export function game_recordTournamentMatch(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  const args = new Args(binaryArgs);
  const tournamentId = args.nextString().expect('Tournament ID required');
  const winnerId = args.nextString().expect('Winner ID required');
  const loserId = args.nextString().expect('Loser ID required');
  _recordTournamentMatch(tournamentId, winnerId, loserId);
}

/**
 * Advance tournament round (admin)
 */
export function game_advanceTournamentRound(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  const args = new Args(binaryArgs);
  const tournamentId = args.nextString().expect('Tournament ID required');
  _advanceTournamentRound(tournamentId);
}

/**
 * Read tournament data
 */
export function game_readTournament(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const id = args.nextString().expect('Tournament ID required');
  const tournament = loadTournament(id);
  assert(tournament != null, 'Tournament not found');
  return tournament!.serialize();
}

// ============================================================================
// Leaderboard Functions
// ============================================================================

/**
 * Get leaderboard
 */
export function game_getLeaderboard(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const topN = args.nextU32().expect('Top N required');

  const entries = _getLeaderboard(topN);
  const result = new Args();
  result.add(u32(entries.length));
  for (let i = 0; i < entries.length; i++) {
    result.add(entries[i]);
  }
  return result.serialize();
}

/**
 * Get character rank
 */
export function game_getCharacterRank(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const characterId = args.nextString().expect('Character ID required');

  const rank = getCharacterRank(characterId);
  const result = new Args();
  result.add(rank);
  return result.serialize();
}

/**
 * Get character MMR tier
 */
export function game_getMMRTier(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const characterId = args.nextString().expect('Character ID required');

  const character = loadCharacter(characterId);
  assert(character != null, 'Character not found');

  const tier = getMMRTier(character!.mmr);
  const result = new Args();
  result.add(tier);
  return result.serialize();
}

// ============================================================================
// Achievement Functions
// ============================================================================

/**
 * Get player achievements
 */
export function game_getAchievements(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const ownerAddress = args.nextString().expect('Owner address required');
  return getPlayerAchievements(ownerAddress).serialize();
}

/**
 * Check all achievements for player
 */
export function game_checkAllAchievements(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const ownerAddress = args.nextString().expect('Owner address required');
  _checkAllAchievements(ownerAddress);
}

// ============================================================================
// Treasury Functions
// ============================================================================

/**
 * Get treasury balance
 */
export function game_getTreasuryBalance(_: StaticArray<u8>): StaticArray<u8> {
  const result = new Args();
  result.add(getTreasuryBalance());
  return result.serialize();
}

/**
 * Withdraw from treasury (admin)
 */
export function game_withdrawFromTreasury(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const amount = args.nextU64().expect('Amount required');
  const toAddress = args.nextString().expect('Destination address required');

  _withdrawFromTreasury(amount, toAddress);

  releaseReentrancy();
}

/**
 * Emergency withdraw (admin)
 */
export function game_emergencyWithdraw(binaryArgs: StaticArray<u8>): void {
  requireAdmin();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const toAddress = args.nextString().expect('Destination address required');

  _emergencyWithdraw(toAddress);

  releaseReentrancy();
}

/**
 * Get fee information
 */
export function game_getFeeInfo(_: StaticArray<u8>): StaticArray<u8> {
  const result = new Args();
  result.add(getFeeInfo());
  return result.serialize();
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Check if contract is paused
 */
export function game_isPaused(_: StaticArray<u8>): StaticArray<u8> {
  const result = new Args();
  result.add(isPaused());
  return result.serialize();
}

/**
 * Get admin address
 */
export function game_getAdmin(_: StaticArray<u8>): StaticArray<u8> {
  const result = new Args();
  result.add(getAdmin());
  return result.serialize();
}

/**
 * Check if battle is active
 */
export function game_isBattleActive(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const battleId = args.nextString().expect('Battle ID required');

  const result = new Args();
  result.add(isBattleActive(battleId));
  return result.serialize();
}

// ============================================================================
// Prediction Market Functions
// ============================================================================

/**
 * Schedule a match with autonomous execution
 */
export function game_scheduleMatch(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');
  const character1Id = args.nextString().expect('Character 1 ID required');
  const character2Id = args.nextString().expect('Character 2 ID required');
  const scheduledTime = args.nextU64().expect('Scheduled time required');
  const description = args.nextString().expect('Description required');

  _scheduleMatch(matchId, character1Id, character2Id, scheduledTime, description);

  releaseReentrancy();
}

/**
 * Place a prediction on a scheduled match
 */
export function game_placePrediction(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');
  const predictedWinnerId = args.nextString().expect('Predicted winner required');

  _placePrediction(marketId, predictedWinnerId);

  releaseReentrancy();
}

/**
 * Lock market (can be called by anyone)
 */
export function game_lockMarket(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();

  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  _lockMarket(marketId);
}

/**
 * Execute scheduled match
 */
export function game_executeScheduledMatch(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();

  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');

  _executeScheduledMatch(matchId);
}

/**
 * Resolve prediction market
 */
export function game_resolveMarket(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();

  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  _resolveMarket(marketId);
}

/**
 * Claim winnings from a prediction
 */
export function game_claimWinnings(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const predictionId = args.nextString().expect('Prediction ID required');

  _claimWinnings(predictionId);

  releaseReentrancy();
}

/**
 * Cancel a scheduled match
 */
export function game_cancelMatch(binaryArgs: StaticArray<u8>): void {
  requireNotPaused();
  requireNoReentrancy();

  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');

  _cancelMatch(matchId);

  releaseReentrancy();
}

// ============================================================================
// Autonomous Execution Functions (called by Massa protocol)
// ============================================================================

/**
 * Autonomously lock market
 */
export function game_autonomousLockMarket(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  _autonomousLockMarket(marketId);
}

/**
 * Autonomously execute match
 */
export function game_autonomousExecuteMatch(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');

  _autonomousExecuteMatch(matchId);
}

/**
 * Autonomously resolve market
 */
export function game_autonomousResolveMarket(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  _autonomousResolveMarket(marketId);
}

/**
 * Autonomous cleanup for abandoned matches
 */
export function game_autonomousCleanup(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');

  _autonomousCleanup(matchId);
}

// ============================================================================
// Prediction Market Query Functions
// ============================================================================

/**
 * Read scheduled match
 */
export function game_readScheduledMatch(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const matchId = args.nextString().expect('Match ID required');

  return readScheduledMatch(matchId);
}

/**
 * Read prediction market
 */
export function game_readPredictionMarket(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  return readPredictionMarket(marketId);
}

/**
 * Read prediction
 */
export function game_readPrediction(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const predictionId = args.nextString().expect('Prediction ID required');

  return readPrediction(predictionId);
}

/**
 * Get user predictions
 */
export function game_readUserPredictions(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const userAddress = args.nextString().expect('User address required');

  const result = new Args();
  result.add(readUserPredictions(userAddress));
  return result.serialize();
}

/**
 * Get market predictions
 */
export function game_readMarketPredictions(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  const result = new Args();
  result.add(readMarketPredictions(marketId));
  return result.serialize();
}

/**
 * Get market info with odds
 */
export function game_getMarketInfo(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect('Market ID required');

  const result = new Args();
  result.add(getMarketInfo(marketId));
  return result.serialize();
}

/**
 * Get upcoming matches
 */
export function game_getUpcomingMatches(_: StaticArray<u8>): StaticArray<u8> {
  const result = new Args();
  result.add(getUpcomingMatches());
  return result.serialize();
}
