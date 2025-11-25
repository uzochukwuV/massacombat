/**
 * Prediction Market System
 * Enables users to bet on scheduled matches with pool-based odds
 * Features autonomous execution using Massa's sendMessageAt
 */

import {
  Args,
  stringToBytes,
  bytesToString,
} from '@massalabs/as-types';

import {
  Context,
  generateEvent,
  Address,
  transferCoins,
} from '@massalabs/massa-as-sdk';

import {
  ScheduledMatch,
  PredictionMarket,
  Prediction,
  MATCH_STATE_SCHEDULED,
  MATCH_STATE_LOCKED,
  MATCH_STATE_EXECUTING,
  MATCH_STATE_COMPLETED,
  MATCH_STATE_CANCELLED,
  MIN_PREDICTION_AMOUNT,
  PREDICTION_LOCK_TIME,
  HOUSE_FEE_PERCENT,
  AUTO_LOCK_FEE,
  AUTO_EXECUTION_FEE,
  AUTO_RESOLUTION_FEE,
  AUTO_CLEANUP_FEE,
  BATTLE_STATE_COMPLETED,
} from './types';

import {
  saveScheduledMatch,
  loadScheduledMatch,
  matchExists,
  savePredictionMarket,
  loadPredictionMarket,
  savePrediction,
  loadPrediction,
  addUserPrediction,
  getUserPredictions,
  addMarketPrediction,
  getMarketPredictions,
  getAllMatches,
  loadCharacter,
  loadBattle,
  addToTreasury,
  isAdmin,
} from './storage';

import { createBattle } from './battle';

// ============================================================================
// Core Prediction Market Functions
// ============================================================================

/**
 * Schedule a match between two characters with autonomous execution
 */
export function scheduleMatch(
  matchId: string,
  character1Id: string,
  character2Id: string,
  scheduledTime: u64,
  description: string
): void {
  // Validation
  assert(!matchExists(matchId), 'Match ID already exists');

  const char1 = loadCharacter(character1Id);
  assert(char1 != null, 'Character 1 not found');

  const char2 = loadCharacter(character2Id);
  assert(char2 != null, 'Character 2 not found');

  const now = Context.timestamp();
  assert(scheduledTime > now, 'Match must be scheduled in future');
  assert(
    scheduledTime - now >= PREDICTION_LOCK_TIME,
    'Must schedule at least 5 minutes in advance'
  );

  // Note: Autonomous execution removed for Massa SDK v3 compatibility
  // Markets must be manually locked, executed, and resolved
  // Fee is optional for future autonomous implementation
  const transferred = Context.transferredCoins();
  const requiredFee: u64 = 100_000_000; // 0.1 MAS creation fee
  assert(transferred >= requiredFee, 'Insufficient fee for match creation');

  // Add fee to treasury
  addToTreasury(requiredFee);

  // Create scheduled match
  const match = new ScheduledMatch();
  match.matchId = matchId;
  match.character1Id = character1Id;
  match.character2Id = character2Id;
  match.scheduledTime = scheduledTime;
  match.lockTime = scheduledTime - PREDICTION_LOCK_TIME;
  match.state = MATCH_STATE_SCHEDULED;
  match.createdAt = now;
  match.creator = Context.caller().toString();
  match.description = description;

  // Create associated prediction market
  const marketId = 'market_' + matchId;
  match.marketId = marketId;

  const market = new PredictionMarket();
  market.marketId = marketId;
  market.matchId = matchId;
  market.isOpen = true;
  market.createdAt = now;
  market.houseFeePercent = HOUSE_FEE_PERCENT;

  // Save
  saveScheduledMatch(match);
  savePredictionMarket(market);

  generateEvent(
    `MATCH_SCHEDULED:${matchId}:${scheduledTime}:${character1Id}:${character2Id}:MANUAL`
  );
}

/**
 * Place a prediction on a scheduled match
 */
export function placePrediction(
  marketId: string,
  predictedWinnerId: string
): void {
  // Load market
  const market = loadPredictionMarket(marketId);
  assert(market != null, 'Market not found');
  assert(market!.isOpen, 'Market is closed');

  // Load associated match
  const match = loadScheduledMatch(market!.matchId);
  assert(match != null, 'Match not found');

  // Check if predictions are still open (before lock time)
  const now = Context.timestamp();
  assert(now < match!.lockTime, 'Predictions are locked');

  // Validate predicted winner is a participant
  assert(
    predictedWinnerId == match!.character1Id || predictedWinnerId == match!.character2Id,
    'Invalid predicted winner'
  );

  // Validate bet amount
  const amount = Context.transferredCoins();
  assert(amount >= MIN_PREDICTION_AMOUNT, 'Bet amount too low (min 0.1 MAS)');

  const predictor = Context.caller().toString();

  // Create prediction
  const predictionId = 'pred_' + marketId + '_' + predictor + '_' + now.toString();
  const prediction = new Prediction();
  prediction.predictionId = predictionId;
  prediction.marketId = marketId;
  prediction.predictor = predictor;
  prediction.predictedWinnerId = predictedWinnerId;
  prediction.amount = amount;
  prediction.timestamp = now;

  // Update market pools
  market!.totalPool += amount;
  if (predictedWinnerId == match!.character1Id) {
    market!.char1Pool += amount;
    market!.char1PredictionCount++;
  } else {
    market!.char2Pool += amount;
    market!.char2PredictionCount++;
  }

  // Save
  savePrediction(prediction);
  savePredictionMarket(market!);

  // Track user and market predictions
  addUserPrediction(predictor, predictionId);
  addMarketPrediction(marketId, predictionId);

  generateEvent(
    `PREDICTION_PLACED:${predictionId}:${predictor}:${predictedWinnerId}:${amount}`
  );
}

/**
 * Lock market when lock time reached (can be called by anyone or autonomously)
 */
export function lockMarket(marketId: string): void {
  const market = loadPredictionMarket(marketId);
  assert(market != null, 'Market not found');
  assert(market!.isOpen, 'Market already closed');

  const match = loadScheduledMatch(market!.matchId);
  assert(match != null, 'Match not found');

  const now = Context.timestamp();
  assert(now >= match!.lockTime, 'Lock time not reached yet');

  // Close market
  market!.isOpen = false;
  match!.state = MATCH_STATE_LOCKED;

  savePredictionMarket(market!);
  saveScheduledMatch(match!);

  generateEvent(`MARKET_LOCKED:${marketId}:${now}`);
}

/**
 * Execute a scheduled match (can be called by anyone or autonomously after scheduled time)
 */
export function executeScheduledMatch(matchId: string): void {
  const match = loadScheduledMatch(matchId);
  assert(match != null, 'Match not found');
  assert(match!.state == MATCH_STATE_LOCKED, 'Match not ready for execution');

  const now = Context.timestamp();
  assert(now >= match!.scheduledTime, 'Scheduled time not reached');

  // Update state
  match!.state = MATCH_STATE_EXECUTING;

  // Create battle
  const battleId = 'battle_' + matchId;
  match!.battleId = battleId;
  saveScheduledMatch(match!);

  // Create the battle (will be played through normal executeTurn calls)
  const battle = createBattle(battleId, match!.character1Id, match!.character2Id, now);

  generateEvent(`MATCH_EXECUTING:${matchId}:${battleId}:${now}`);
}

/**
 * Resolve prediction market after match completes
 * This should be called after the battle is finalized
 */
export function resolveMarket(marketId: string): void {
  const market = loadPredictionMarket(marketId);
  assert(market != null, 'Market not found');
  assert(!market!.isResolved, 'Market already resolved');

  const match = loadScheduledMatch(market!.matchId);
  assert(match != null, 'Match not found');

  // Verify battle exists and is complete
  const battle = loadBattle(match!.battleId);
  assert(battle != null, 'Battle not found');
  assert(battle!.state == BATTLE_STATE_COMPLETED, 'Battle not completed');

  // Get winner
  const winnerId = battle!.winnerId;
  market!.winnerId = winnerId;
  match!.winnerId = winnerId;
  match!.state = MATCH_STATE_COMPLETED;

  // Calculate house fee
  const totalPool = market!.totalPool;
  const houseFee = (totalPool * u64(HOUSE_FEE_PERCENT)) / 100;
  market!.houseFee = houseFee;

  // Calculate winnings pool (total - house fee)
  const winningsPool = totalPool - houseFee;

  // Determine winning pool
  const winningPool = winnerId == match!.character1Id
    ? market!.char1Pool
    : market!.char2Pool;

  // If no one bet on winner, house keeps all
  if (winningPool == 0) {
    addToTreasury(totalPool);
    market!.isResolved = true;
    savePredictionMarket(market!);
    saveScheduledMatch(match!);
    generateEvent(`MARKET_RESOLVED:${marketId}:NO_WINNERS:${totalPool}`);
    return;
  }

  // Calculate payouts for all predictions
  const predictionIds = getMarketPredictions(marketId);
  for (let i = 0; i < predictionIds.length; i++) {
    const pred = loadPrediction(predictionIds[i]);
    if (pred != null && pred!.predictedWinnerId == winnerId) {
      // Winner: calculate payout as (bet / winningPool) * winningsPool
      const share = (pred!.amount * winningsPool) / winningPool;
      pred!.payout = share;
      savePrediction(pred!);
    }
    // Losers keep payout = 0 (already default)
  }

  // Add house fee to treasury
  addToTreasury(houseFee);

  // Mark resolved
  market!.isResolved = true;
  savePredictionMarket(market!);
  saveScheduledMatch(match!);

  generateEvent(
    `MARKET_RESOLVED:${marketId}:${winnerId}:${winningsPool}:${houseFee}`
  );
}

/**
 * Claim winnings from a prediction
 */
export function claimWinnings(predictionId: string): void {
  const prediction = loadPrediction(predictionId);
  assert(prediction != null, 'Prediction not found');

  const caller = Context.caller().toString();
  assert(prediction!.predictor == caller, 'Not your prediction');
  assert(!prediction!.claimed, 'Already claimed');
  assert(prediction!.payout > 0, 'No winnings to claim');

  // Verify market is resolved
  const market = loadPredictionMarket(prediction!.marketId);
  assert(market != null && market!.isResolved, 'Market not resolved');

  // Transfer winnings
  const payout = prediction!.payout;
  transferCoins(Context.caller(), payout);

  // Mark claimed
  prediction!.claimed = true;
  savePrediction(prediction!);

  generateEvent(`WINNINGS_CLAIMED:${predictionId}:${caller}:${payout}`);
}

/**
 * Cancel a scheduled match (admin or creator only, before execution)
 * Refunds all predictions
 */
export function cancelMatch(matchId: string): void {
  const match = loadScheduledMatch(matchId);
  assert(match != null, 'Match not found');

  const caller = Context.caller().toString();
  assert(
    isAdmin(caller) || caller == match!.creator,
    'Only admin or creator can cancel'
  );

  assert(
    match!.state == MATCH_STATE_SCHEDULED || match!.state == MATCH_STATE_LOCKED,
    'Match already executed'
  );

  // Update state
  match!.state = MATCH_STATE_CANCELLED;

  // Close market
  const market = loadPredictionMarket(match!.marketId);
  if (market != null) {
    market!.isOpen = false;
    savePredictionMarket(market!);
  }

  // Refund all predictions
  const predictionIds = getMarketPredictions(match!.marketId);
  for (let i = 0; i < predictionIds.length; i++) {
    const pred = loadPrediction(predictionIds[i]);
    if (pred != null && !pred!.claimed) {
      transferCoins(new Address(pred!.predictor), pred!.amount);
      pred!.claimed = true;
      pred!.payout = pred!.amount; // Refund amount
      savePrediction(pred!);
    }
  }

  saveScheduledMatch(match!);

  generateEvent(`MATCH_CANCELLED:${matchId}`);
}

// ============================================================================
// Autonomous Execution Functions (Disabled for Massa SDK v3)
// ============================================================================
// Note: Autonomous scheduling using sendMessageAt is not available in SDK v3
// The exported autonomous functions below can still be called manually
// ============================================================================

/**
 * Schedule autonomous market locking (DISABLED)
 * TODO: Implement using SDK v3 asyncCall when ready
 */
/*
function scheduleAutonomousLock(
  contractAddress: Address,
  marketId: string,
  lockTime: u64
): void {
  // DISABLED: sendMessageAt not available in SDK v3
}
*/

/**
 * Autonomously lock market (called by Massa protocol)
 */
export function autonomousLockMarket(marketId: string): void {
  const market = loadPredictionMarket(marketId);
  if (market == null || !market!.isOpen) {
    generateEvent(`AUTO_LOCK_SKIPPED:ALREADY_LOCKED:${marketId}`);
    return;
  }

  const match = loadScheduledMatch(market!.matchId);
  if (match == null) {
    generateEvent(`AUTO_LOCK_FAILED:MATCH_NOT_FOUND:${marketId}`);
    return;
  }

  // Lock the market
  market!.isOpen = false;
  match!.state = MATCH_STATE_LOCKED;

  savePredictionMarket(market!);
  saveScheduledMatch(match!);

  generateEvent(`AUTO_MARKET_LOCKED:${marketId}:${Context.timestamp()}`);
}

/**
 * Schedule autonomous match execution (DISABLED)
 */
/*
function scheduleAutonomousExecution(
  contractAddress: Address,
  matchId: string,
  scheduledTime: u64
): void {
  // DISABLED: sendMessageAt not available in SDK v3
}
*/

/**
 * Autonomously execute scheduled match
 */
export function autonomousExecuteMatch(matchId: string): void {
  const match = loadScheduledMatch(matchId);
  if (match == null || match!.state != MATCH_STATE_LOCKED) {
    generateEvent(`AUTO_EXECUTION_SKIPPED:NOT_READY:${matchId}`);
    return;
  }

  // Update state
  match!.state = MATCH_STATE_EXECUTING;

  // Create battle
  const battleId = 'battle_' + matchId;
  const battle = createBattle(
    battleId,
    match!.character1Id,
    match!.character2Id,
    Context.timestamp()
  );

  match!.battleId = battleId;
  saveScheduledMatch(match!);

  generateEvent(`AUTO_MATCH_STARTED:${matchId}:${battleId}`);
}

/**
 * Schedule autonomous market resolution (DISABLED)
 */
/*
export function scheduleAutonomousResolution(
  contractAddress: Address,
  marketId: string,
  resolutionTime: u64
): void {
  // DISABLED: sendMessageAt not available in SDK v3
}
*/

/**
 * Autonomously resolve market and calculate payouts
 */
export function autonomousResolveMarket(marketId: string): void {
  const market = loadPredictionMarket(marketId);
  if (market == null || market!.isResolved) {
    generateEvent(`AUTO_RESOLVE_SKIPPED:ALREADY_RESOLVED:${marketId}`);
    return;
  }

  const match = loadScheduledMatch(market!.matchId);
  if (match == null) {
    generateEvent(`AUTO_RESOLVE_FAILED:MATCH_NOT_FOUND:${marketId}`);
    return;
  }

  // Verify battle is complete
  const battle = loadBattle(match!.battleId);
  if (battle == null || battle!.state != BATTLE_STATE_COMPLETED) {
    generateEvent(`AUTO_RESOLVE_SKIPPED:BATTLE_NOT_COMPLETE:${marketId}`);
    return;
  }

  // Get winner
  const winnerId = battle!.winnerId;
  market!.winnerId = winnerId;
  match!.winnerId = winnerId;
  match!.state = MATCH_STATE_COMPLETED;

  // Calculate house fee
  const totalPool = market!.totalPool;
  const houseFee = (totalPool * u64(HOUSE_FEE_PERCENT)) / 100;
  market!.houseFee = houseFee;

  const winningsPool = totalPool - houseFee;

  // Determine winning pool
  const winningPool = winnerId == match!.character1Id
    ? market!.char1Pool
    : market!.char2Pool;

  // Calculate payouts for all predictions
  if (winningPool > 0) {
    const predictionIds = getMarketPredictions(marketId);

    for (let i = 0; i < predictionIds.length; i++) {
      const pred = loadPrediction(predictionIds[i]);
      if (pred != null && pred!.predictedWinnerId == winnerId) {
        // Calculate share
        const share = (pred!.amount * winningsPool) / winningPool;
        pred!.payout = share;
        savePrediction(pred!);
      }
    }
  }

  // Add house fee to treasury
  addToTreasury(houseFee);

  // Mark resolved
  market!.isResolved = true;
  savePredictionMarket(market!);
  saveScheduledMatch(match!);

  generateEvent(
    `AUTO_MARKET_RESOLVED:${marketId}:${winnerId}:${winningsPool}:${houseFee}`
  );
}

/**
 * Schedule autonomous cleanup for abandoned matches (DISABLED)
 */
/*
function scheduleAutonomousCleanup(
  contractAddress: Address,
  matchId: string,
  cleanupTime: u64
): void {
  // DISABLED: sendMessageAt not available in SDK v3
}
*/

/**
 * Clean up stale/abandoned matches
 * If match hasn't completed 24h after scheduled time, cancel and refund
 */
export function autonomousCleanup(matchId: string): void {
  const match = loadScheduledMatch(matchId);
  if (match == null) {
    generateEvent(`AUTO_CLEANUP_SKIPPED:MATCH_NOT_FOUND:${matchId}`);
    return;
  }

  // If match is already completed or cancelled, no cleanup needed
  if (
    match!.state == MATCH_STATE_COMPLETED ||
    match!.state == MATCH_STATE_CANCELLED
  ) {
    generateEvent(`AUTO_CLEANUP_SKIPPED:ALREADY_COMPLETE:${matchId}`);
    return;
  }

  // Cancel the match and refund all predictions
  match!.state = MATCH_STATE_CANCELLED;

  const market = loadPredictionMarket(match!.marketId);
  if (market != null) {
    market!.isOpen = false;
    savePredictionMarket(market!);

    // Refund all predictions
    const predictionIds = getMarketPredictions(match!.marketId);
    for (let i = 0; i < predictionIds.length; i++) {
      const pred = loadPrediction(predictionIds[i]);
      if (pred != null && !pred!.claimed) {
        transferCoins(new Address(pred!.predictor), pred!.amount);
        pred!.claimed = true;
        pred!.payout = pred!.amount;
        savePrediction(pred!);
      }
    }
  }

  saveScheduledMatch(match!);

  generateEvent(`AUTO_CLEANUP:${matchId}:REFUNDED`);
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Read scheduled match data
 */
export function readScheduledMatch(matchId: string): StaticArray<u8> {
  const match = loadScheduledMatch(matchId);
  if (match == null) {
    return new StaticArray<u8>(0);
  }
  return match.serialize();
}

/**
 * Read prediction market data
 */
export function readPredictionMarket(marketId: string): StaticArray<u8> {
  const market = loadPredictionMarket(marketId);
  if (market == null) {
    return new StaticArray<u8>(0);
  }
  return market.serialize();
}

/**
 * Read prediction data
 */
export function readPrediction(predictionId: string): StaticArray<u8> {
  const pred = loadPrediction(predictionId);
  if (pred == null) {
    return new StaticArray<u8>(0);
  }
  return pred.serialize();
}

/**
 * Get all user predictions
 */
export function readUserPredictions(userAddress: string): string {
  const predIds = getUserPredictions(userAddress);
  return predIds.join(',');
}

/**
 * Get all predictions for a market
 */
export function readMarketPredictions(marketId: string): string {
  const predIds = getMarketPredictions(marketId);
  return predIds.join(',');
}

/**
 * Get market info with current odds
 */
export function getMarketInfo(marketId: string): string {
  const market = loadPredictionMarket(marketId);
  if (market == null) return '';

  const match = loadScheduledMatch(market!.matchId);
  if (match == null) return '';

  // Calculate implied odds (winnings / bet)
  const char1Odds = calculateOdds(market!.char1Pool, market!.totalPool);
  const char2Odds = calculateOdds(market!.char2Pool, market!.totalPool);

  // Return JSON-like string
  return (
    '{' +
    '"marketId":"' + market!.marketId + '",' +
    '"matchId":"' + market!.matchId + '",' +
    '"totalPool":' + market!.totalPool.toString() + ',' +
    '"char1Pool":' + market!.char1Pool.toString() + ',' +
    '"char2Pool":' + market!.char2Pool.toString() + ',' +
    '"char1Odds":' + char1Odds.toString() + ',' +
    '"char2Odds":' + char2Odds.toString() + ',' +
    '"isOpen":' + (market!.isOpen ? 'true' : 'false') + ',' +
    '"isResolved":' + (market!.isResolved ? 'true' : 'false') + ',' +
    '"winner":"' + market!.winnerId + '",' +
    '"character1":"' + match!.character1Id + '",' +
    '"character2":"' + match!.character2Id + '",' +
    '"scheduledTime":' + match!.scheduledTime.toString() + ',' +
    '"lockTime":' + match!.lockTime.toString() +
    '}'
  );
}

/**
 * Calculate current odds for a choice
 */
function calculateOdds(poolAmount: u64, totalPool: u64): f64 {
  if (totalPool == 0) return 1.0;
  if (poolAmount == 0) return 999.0; // Very high odds if no one bet on this side

  const winningsPool = totalPool - (totalPool * u64(HOUSE_FEE_PERCENT)) / 100;
  return f64(winningsPool) / f64(poolAmount);
}

/**
 * Get upcoming matches (returns comma-separated match IDs)
 */
export function getUpcomingMatches(): string {
  const allMatches = getAllMatches();
  const upcomingIds: string[] = [];
  const now = Context.timestamp();

  for (let i = 0; i < allMatches.length; i++) {
    const match = loadScheduledMatch(allMatches[i]);
    if (
      match != null &&
      (match!.state == MATCH_STATE_SCHEDULED || match!.state == MATCH_STATE_LOCKED) &&
      match!.scheduledTime > now
    ) {
      upcomingIds.push(match!.matchId);
    }
  }

  return upcomingIds.join(',');
}
