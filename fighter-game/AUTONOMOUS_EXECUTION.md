# Autonomous Execution for Prediction Markets

## Overview

Massa blockchain supports **Autonomous Smart Contracts (ASC)** that can execute automatically at specified times or conditions without requiring external transactions. This is perfect for prediction market automation.

---

## 1. Massa Autonomous Operations

### What Can Be Automated

```typescript
1. Market Locking (when lock time reached)
2. Match Execution (when scheduled time reached)
3. Market Resolution (when battle completes)
4. Stale Market Cleanup (cancel abandoned matches)
```

### How Massa ASC Works

```
┌────────────────────────────────────────┐
│   Schedule Autonomous Operation        │
│   ├─ Target function                   │
│   ├─ Execution time/condition          │
│   ├─ Gas allocation                    │
│   └─ Execution fee                     │
└────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   Massa Protocol                       │
│   ├─ Monitors scheduled operations     │
│   ├─ Executes at specified time        │
│   └─ No external trigger needed        │
└────────────────────────────────────────┘
```

---

## 2. Implementation with Massa SDK

### 2.1 Import Required Functions

```typescript
import {
  Context,
  generateEvent,
  sendMessage,
  sendMessageAt,  // Schedule future execution
} from '@massalabs/massa-as-sdk';
```

### 2.2 Schedule Match with Auto-Execution

```typescript
/**
 * Schedule a match with autonomous execution
 */
export function scheduleMatch(
  matchId: string,
  character1Id: string,
  character2Id: string,
  scheduledTime: u64,
  description: string
): ScheduledMatch {
  // ... validation (same as before) ...

  const now = Context.timestamp();
  const lockTime = scheduledTime - PREDICTION_LOCK_TIME;

  // Create match and market (same as before)
  const match = new ScheduledMatch();
  // ... setup match ...

  const market = new PredictionMarket();
  // ... setup market ...

  // Save state
  saveScheduledMatch(match);
  savePredictionMarket(market);

  // ========================================
  // AUTONOMOUS EXECUTION SCHEDULING
  // ========================================

  const contractAddress = Context.callee();

  // 1. Schedule automatic market locking
  scheduleAutonomousLock(
    contractAddress,
    marketId,
    lockTime
  );

  // 2. Schedule automatic match execution
  scheduleAutonomousExecution(
    contractAddress,
    matchId,
    scheduledTime
  );

  // 3. Schedule automatic cleanup (24h after scheduled time)
  scheduleAutonomousCleanup(
    contractAddress,
    matchId,
    scheduledTime + 86_400_000  // +24 hours
  );

  generateEvent(`MATCH_SCHEDULED:${matchId}:AUTO_EXECUTION_ENABLED`);

  return match;
}
```

### 2.3 Autonomous Lock Function

```typescript
/**
 * Schedule autonomous market locking
 */
function scheduleAutonomousLock(
  contractAddress: Address,
  marketId: string,
  lockTime: u64
): void {
  // Prepare function call arguments
  const args = new Args().addString(marketId);
  const callData = args.serialize();

  // Calculate execution cost
  const gasAllocation = 50_000_000;  // 50M gas for lock operation
  const executionFee = 10_000_000;   // 0.01 MAS execution fee

  // Schedule the call using sendMessageAt
  // This will automatically call game_autonomousLockMarket at lockTime
  sendMessageAt(
    contractAddress,
    'game_autonomousLockMarket',  // Function to call
    lockTime,                     // When to execute
    0,                            // No coins to transfer
    gasAllocation,
    executionFee,
    callData
  );

  generateEvent(`AUTO_LOCK_SCHEDULED:${marketId}:${lockTime}`);
}

/**
 * Autonomously lock market (called by Massa protocol)
 */
export function game_autonomousLockMarket(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().unwrap();

  const market = loadPredictionMarket(marketId);
  if (market == null || !market!.isOpen) return;  // Already locked

  const match = loadScheduledMatch(market!.matchId);
  if (match == null) return;

  // Lock the market
  market!.isOpen = false;
  match!.state = MATCH_STATE_LOCKED;

  savePredictionMarket(market!);
  saveScheduledMatch(match!);

  generateEvent(`AUTO_MARKET_LOCKED:${marketId}:${Context.timestamp()}`);
}
```

### 2.4 Autonomous Match Execution

```typescript
/**
 * Schedule autonomous match execution
 */
function scheduleAutonomousExecution(
  contractAddress: Address,
  matchId: string,
  scheduledTime: u64
): void {
  const args = new Args().addString(matchId);
  const callData = args.serialize();

  const gasAllocation = 200_000_000;  // 200M gas for battle creation
  const executionFee = 50_000_000;    // 0.05 MAS execution fee

  sendMessageAt(
    contractAddress,
    'game_autonomousExecuteMatch',
    scheduledTime,
    0,
    gasAllocation,
    executionFee,
    callData
  );

  generateEvent(`AUTO_EXECUTION_SCHEDULED:${matchId}:${scheduledTime}`);
}

/**
 * Autonomously execute scheduled match
 */
export function game_autonomousExecuteMatch(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const matchId = args.nextString().unwrap();

  const match = loadScheduledMatch(matchId);
  if (match == null || match!.state != MATCH_STATE_LOCKED) return;

  // Update state
  match!.state = MATCH_STATE_EXECUTING;

  // Create battle
  const battleId = `battle_${matchId}`;
  const battle = createBattle(
    battleId,
    match!.character1Id,
    match!.character2Id,
    Context.timestamp()
  );

  match!.battleId = battleId;
  saveScheduledMatch(match!);

  generateEvent(`AUTO_MATCH_STARTED:${matchId}:${battleId}`);

  // Note: Battle still needs to be played via turns
  // BUT we can schedule autonomous turn execution if desired (see below)
}
```

### 2.5 Autonomous Battle Completion (Advanced)

```typescript
/**
 * Extend finalizeBattle to auto-resolve market
 */
export function game_finalizeBattle(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const battleId = args.nextString().unwrap();

  // ... existing finalization logic ...

  // Check if this is a scheduled match
  const matchId = battleId.replace('battle_', '');
  const match = loadScheduledMatch(matchId);

  if (match != null && match!.state == MATCH_STATE_EXECUTING) {
    // Schedule autonomous market resolution
    const contractAddress = Context.callee();
    scheduleAutonomousResolution(
      contractAddress,
      match!.marketId,
      Context.timestamp() + 60_000  // Resolve 1 minute after battle ends
    );
  }
}

/**
 * Schedule autonomous market resolution
 */
function scheduleAutonomousResolution(
  contractAddress: Address,
  marketId: string,
  resolutionTime: u64
): void {
  const args = new Args().addString(marketId);
  const callData = args.serialize();

  const gasAllocation = 300_000_000;  // 300M gas for resolution + payouts
  const executionFee = 100_000_000;   // 0.1 MAS execution fee

  sendMessageAt(
    contractAddress,
    'game_autonomousResolveMarket',
    resolutionTime,
    0,
    gasAllocation,
    executionFee,
    callData
  );

  generateEvent(`AUTO_RESOLUTION_SCHEDULED:${marketId}:${resolutionTime}`);
}

/**
 * Autonomously resolve market and calculate payouts
 */
export function game_autonomousResolveMarket(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().unwrap();

  const market = loadPredictionMarket(marketId);
  if (market == null || market!.isResolved) return;

  const match = loadScheduledMatch(market!.matchId);
  if (match == null) return;

  // Verify battle is complete
  const battle = loadBattle(match!.battleId);
  if (battle == null || battle!.state != BATTLE_STATE_COMPLETED) return;

  // Get winner
  const winnerId = battle!.winner;
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

        // OPTIONAL: Auto-transfer winnings (instead of requiring claim)
        if (AUTO_TRANSFER_WINNINGS) {
          transferCoins(new Address(pred!.predictor), share);
          pred!.claimed = true;
          savePrediction(pred!);
        }
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
```

### 2.6 Autonomous Cleanup (Stale Matches)

```typescript
/**
 * Schedule autonomous cleanup for abandoned matches
 */
function scheduleAutonomousCleanup(
  contractAddress: Address,
  matchId: string,
  cleanupTime: u64
): void {
  const args = new Args().addString(matchId);
  const callData = args.serialize();

  const gasAllocation = 100_000_000;
  const executionFee = 20_000_000;

  sendMessageAt(
    contractAddress,
    'game_autonomousCleanup',
    cleanupTime,
    0,
    gasAllocation,
    executionFee,
    callData
  );
}

/**
 * Clean up stale/abandoned matches
 * If match hasn't completed 24h after scheduled time, cancel and refund
 */
export function game_autonomousCleanup(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const matchId = args.nextString().unwrap();

  const match = loadScheduledMatch(matchId);
  if (match == null) return;

  // If match is already completed, no cleanup needed
  if (match!.state == MATCH_STATE_COMPLETED ||
      match!.state == MATCH_STATE_CANCELLED) {
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
```

---

## 3. Automated Battle Execution (Optional)

For fully autonomous matches, you can also automate turn execution:

```typescript
/**
 * Create an AI-controlled autonomous battle
 */
function createAutonomousBattle(
  battleId: string,
  char1Id: string,
  char2Id: string
): void {
  const battle = createBattle(battleId, char1Id, char2Id, Context.timestamp());

  // Schedule autonomous turns every 10 seconds
  scheduleAutonomousTurn(battleId, 0, Context.timestamp() + 10_000);
}

/**
 * Execute turn autonomously with random strategy
 */
export function game_autonomousTurn(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const battleId = args.nextString().unwrap();
  const turnNumber = args.nextU32().unwrap();

  const battle = loadBattle(battleId);
  if (battle == null || !isBattleActive(battleId)) return;

  // Determine current attacker (alternates each turn)
  const attackerCharId = turnNumber % 2 == 0
    ? battle!.player1.characterId
    : battle!.player2.characterId;

  // Simple AI: Choose random stance and skill
  const stance = randomU8Between(0, 2);  // 0-2
  const useSkill = randomU8Between(0, 1) == 1;  // 50% chance
  const skillSlot = useSkill ? randomU8Between(1, 3) : 0;

  // Execute turn
  executeTurn(battleId, attackerCharId, stance, useSkill, skillSlot);

  // If battle still active, schedule next turn
  if (isBattleActive(battleId)) {
    scheduleAutonomousTurn(
      battleId,
      turnNumber + 1,
      Context.timestamp() + 10_000  // Next turn in 10 seconds
    );
  } else {
    // Battle finished, will trigger autonomous resolution
    generateEvent(`AUTO_BATTLE_COMPLETED:${battleId}`);
  }
}

function scheduleAutonomousTurn(
  battleId: string,
  turnNumber: u32,
  executionTime: u64
): void {
  const args = new Args()
    .addString(battleId)
    .addU32(turnNumber);

  sendMessageAt(
    Context.callee(),
    'game_autonomousTurn',
    executionTime,
    0,
    400_000_000,  // High gas for turn execution
    50_000_000,
    args.serialize()
  );
}
```

---

## 4. Execution Fee Management

### Fee Structure

```typescript
// Autonomous execution fees (paid upfront by match creator)
export const AUTO_LOCK_FEE: u64 = 10_000_000;      // 0.01 MAS
export const AUTO_EXECUTION_FEE: u64 = 50_000_000;  // 0.05 MAS
export const AUTO_RESOLUTION_FEE: u64 = 100_000_000; // 0.1 MAS
export const AUTO_CLEANUP_FEE: u64 = 20_000_000;    // 0.02 MAS

export const TOTAL_AUTO_FEE: u64 =
  AUTO_LOCK_FEE +
  AUTO_EXECUTION_FEE +
  AUTO_RESOLUTION_FEE +
  AUTO_CLEANUP_FEE;  // 0.18 MAS total
```

### Collect Fees Upfront

```typescript
export function scheduleMatch(...): ScheduledMatch {
  // Collect autonomous execution fees upfront
  const transferred = Context.transferredCoins();
  const requiredFee = SCHEDULE_MATCH_FEE + TOTAL_AUTO_FEE;
  assert(transferred >= requiredFee, 'Insufficient fee for autonomous execution');

  // ... create match ...

  // The sendMessageAt calls will deduct from these prepaid fees
  scheduleAutonomousLock(...);     // Deducts AUTO_LOCK_FEE
  scheduleAutonomousExecution(...); // Deducts AUTO_EXECUTION_FEE
  // etc.
}
```

---

## 5. Event-Driven Resolution

### Listen for Battle Completion

```typescript
/**
 * Better approach: In finalizeBattle, directly trigger resolution
 */
export function game_finalizeBattle(binaryArgs: StaticArray<u8>): void {
  // ... existing finalization ...

  // Check if this battle is part of a scheduled match
  const matchId = extractMatchIdFromBattle(battleId);
  const match = loadScheduledMatch(matchId);

  if (match != null && match!.state == MATCH_STATE_EXECUTING) {
    // Immediately resolve market (no need to schedule)
    const marketId = match!.marketId;
    resolveMarketInternal(marketId, battleId);

    generateEvent(`MATCH_AUTO_RESOLVED:${matchId}:${marketId}`);
  }
}

/**
 * Internal resolution function (can be called directly)
 */
function resolveMarketInternal(marketId: string, battleId: string): void {
  const market = loadPredictionMarket(marketId);
  if (market == null || market!.isResolved) return;

  const battle = loadBattle(battleId);
  if (battle == null || battle!.state != BATTLE_STATE_COMPLETED) return;

  // ... resolution logic (same as autonomous version) ...
}
```

---

## 6. Complete Autonomous Flow

```
TIME: 0:00 - User schedules match for 1:00
├─ Create match + market
├─ Schedule autonomous lock for 0:55
├─ Schedule autonomous execution for 1:00
└─ Schedule autonomous cleanup for 25:00 (1d + 1h)

TIME: 0:00 - 0:55 - Users place predictions
├─ Predictions added to pools
└─ Odds update dynamically

TIME: 0:55 - Massa protocol autonomously locks market
├─ game_autonomousLockMarket() executes
├─ market.isOpen = false
└─ No more predictions accepted

TIME: 1:00 - Massa protocol autonomously executes match
├─ game_autonomousExecuteMatch() executes
├─ Creates battle
└─ Options:
    ├─ A) Wait for manual turns (traditional)
    └─ B) Schedule autonomous turns (AI battle)

TIME: 1:00 - 1:15 - Battle plays out
├─ Either manual turns or autonomous turns
└─ Eventually battle completes

TIME: 1:15 - Battle finalized
├─ game_finalizeBattle() called
├─ Detects scheduled match
├─ IMMEDIATELY resolves market (no scheduling needed)
├─ Calculates all payouts
└─ Winners can claim (or auto-transfer if enabled)

TIME: 25:00 - Cleanup executes (only if needed)
├─ If match never completed, cleanup runs
├─ Cancel match
└─ Refund all predictions
```

---

## 7. Configuration Options

```typescript
// Feature flags for autonomous behavior
export const AUTO_LOCK_ENABLED: bool = true;
export const AUTO_EXECUTE_ENABLED: bool = true;
export const AUTO_RESOLVE_ENABLED: bool = true;
export const AUTO_CLEANUP_ENABLED: bool = true;
export const AUTO_TRANSFER_WINNINGS: bool = false;  // If true, no claim needed
export const AUTO_BATTLE_TURNS: bool = false;       // If true, AI plays battle
```

---

## 8. Gas Budgeting

```typescript
/**
 * Estimate gas costs for autonomous operations
 */
function estimateAutonomousGas(): u64 {
  // Lock: ~50M gas
  // Execution: ~200M gas
  // Resolution (100 predictions): ~300M gas
  // Cleanup: ~100M gas
  // Total: ~650M gas

  // At current Massa gas prices (~0.1 nanoMAS per gas):
  // 650M * 0.1 = 65 MAS worth of computation
  // But execution fees are much lower (~0.18 MAS total)
  // Massa subsidizes autonomous execution
}
```

---

## 9. Error Handling

```typescript
/**
 * Autonomous functions should be idempotent and fail gracefully
 */
export function game_autonomousLockMarket(binaryArgs: StaticArray<u8>): void {
  try {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().unwrap();

    const market = loadPredictionMarket(marketId);
    if (market == null) {
      generateEvent(`AUTO_LOCK_FAILED:MARKET_NOT_FOUND:${marketId}`);
      return;  // Fail gracefully, don't revert
    }

    if (!market!.isOpen) {
      generateEvent(`AUTO_LOCK_SKIPPED:ALREADY_LOCKED:${marketId}`);
      return;  // Already locked, no-op
    }

    // ... proceed with locking ...
  } catch (error) {
    generateEvent(`AUTO_LOCK_ERROR:${error.message}`);
    // Don't revert - autonomous calls should be robust
  }
}
```

---

## 10. Benefits of Autonomous Execution

✅ **No Manual Intervention**: Markets resolve automatically
✅ **Better UX**: Users don't need to trigger resolution
✅ **Guaranteed Execution**: Protocol ensures scheduled actions run
✅ **Lower Costs**: No need for external bots/keepers
✅ **Trustless**: No reliance on off-chain automation
✅ **Predictable**: Exact execution times guaranteed
✅ **Atomic**: Resolution happens immediately after battle
✅ **Scalable**: Handles unlimited concurrent markets

---

## 11. Implementation Checklist

```typescript
Phase 1: Basic Autonomous Support
□ Add sendMessageAt imports
□ Implement game_autonomousLockMarket
□ Implement game_autonomousExecuteMatch
□ Implement game_autonomousResolveMarket
□ Implement game_autonomousCleanup
□ Test with single match

Phase 2: Fee Management
□ Calculate autonomous execution fees
□ Collect fees upfront in scheduleMatch
□ Track fee allocation per operation
□ Test fee refunds for cancellations

Phase 3: Advanced Features
□ Implement autonomous battle turns (AI)
□ Add auto-transfer winnings option
□ Add emergency pause for autonomous ops
□ Comprehensive testing with 100+ concurrent markets

Phase 4: Monitoring
□ Event logging for all autonomous ops
□ Gas usage tracking
□ Failure rate monitoring
□ Performance optimization
```

---

## Conclusion

Massa's autonomous smart contract capabilities are **perfect** for prediction markets. By leveraging `sendMessageAt`, we can create a fully automated prediction market system where:

1. **Markets lock automatically** when the lock time is reached
2. **Matches execute automatically** at the scheduled time
3. **Markets resolve automatically** when battles complete
4. **Cleanup happens automatically** for abandoned matches

This creates a **seamless, trustless** experience where users simply:
- Schedule match → Place predictions → Wait → Claim winnings

**No manual intervention required** for any market operations! 🚀
