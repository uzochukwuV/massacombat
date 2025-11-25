# Prediction Market Design for Fighter Game

## Executive Summary

This document outlines the design for adding a **prediction market system** to the Fighter Game smart contract, enabling users to place bets on scheduled matches with pool-based odds distribution.

---

## 1. Current Architecture Analysis

### Existing Components
```
✅ Battle System (battle.ts)
   - Instant battle creation
   - Turn-based execution
   - State management (ACTIVE, WILDCARD, COMPLETED)

✅ Treasury (treasury.ts)
   - Fee collection
   - Balance tracking
   - Admin withdrawals

✅ Character System (character.ts)
   - Character stats and management
   - Equipment and skills
   - Win/loss tracking

✅ Time Handling
   - Context.timestamp() for current time
   - Deadline-based mechanics (wildcard system)
```

### Integration Points
```
1. Battle System → Add scheduling capability
2. Treasury → Hold prediction pools
3. Character System → Match participants
4. Storage → New keys for markets/predictions
5. Events → Market state changes
```

---

## 2. Design Overview

### System Architecture

```
┌─────────────────────────────────────────────────┐
│         PREDICTION MARKET SYSTEM                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │   Schedule   │───▶│  Prediction  │          │
│  │    Match     │    │    Market    │          │
│  └──────────────┘    └──────────────┘          │
│         │                    │                  │
│         │                    │                  │
│         ▼                    ▼                  │
│  ┌──────────────┐    ┌──────────────┐          │
│  │   Execute    │───▶│  Distribute  │          │
│  │    Match     │    │   Winnings   │          │
│  └──────────────┘    └──────────────┘          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Key Phases

1. **Pre-Match**: Schedule match → Open market → Accept predictions
2. **Lock Period**: Close predictions 5 minutes before match
3. **Match Execution**: Execute scheduled battle
4. **Settlement**: Distribute winnings to correct predictors

---

## 3. Data Structures

### 3.1 ScheduledMatch

```typescript
@serializable
export class ScheduledMatch implements Serializable {
  matchId: string = '';
  character1Id: string = '';
  character2Id: string = '';

  // Timing
  scheduledTime: u64 = 0;     // Timestamp when match will occur
  createdAt: u64 = 0;
  lockTime: u64 = 0;          // When predictions close (5 min before)

  // State
  state: u8 = 0;              // SCHEDULED, LOCKED, EXECUTING, COMPLETED, CANCELLED

  // Result
  winnerId: string = '';       // Winner character ID (empty until completed)
  battleId: string = '';       // Associated battle ID once executed

  // Market Info
  marketId: string = '';       // Associated prediction market ID

  // Metadata
  creator: string = '';        // Who scheduled this match
  description: string = '';    // Match description/title

  serialize(): StaticArray<u8> {
    const args = new Args();
    args.add(this.matchId)
        .add(this.character1Id)
        .add(this.character2Id)
        .add(this.scheduledTime)
        .add(this.createdAt)
        .add(this.lockTime)
        .add(this.state)
        .add(this.winnerId)
        .add(this.battleId)
        .add(this.marketId)
        .add(this.creator)
        .add(this.description);
    return args.serialize();
  }

  deserialize(data: StaticArray<u8>): Result<void> {
    const args = new Args(data);
    this.matchId = args.nextString().unwrap();
    this.character1Id = args.nextString().unwrap();
    this.character2Id = args.nextString().unwrap();
    this.scheduledTime = args.nextU64().unwrap();
    this.createdAt = args.nextU64().unwrap();
    this.lockTime = args.nextU64().unwrap();
    this.state = args.nextU8().unwrap();
    this.winnerId = args.nextString().unwrap();
    this.battleId = args.nextString().unwrap();
    this.marketId = args.nextString().unwrap();
    this.creator = args.nextString().unwrap();
    this.description = args.nextString().unwrap();
    return new Result(null);
  }
}
```

### 3.2 PredictionMarket

```typescript
@serializable
export class PredictionMarket implements Serializable {
  marketId: string = '';
  matchId: string = '';        // Associated scheduled match

  // Pool Tracking
  totalPool: u64 = 0;          // Total MAS in pool
  char1Pool: u64 = 0;          // MAS bet on character 1
  char2Pool: u64 = 0;          // MAS bet on character 2

  // Prediction Counts
  char1PredictionCount: u32 = 0;
  char2PredictionCount: u32 = 0;

  // State
  isOpen: bool = true;         // Whether accepting predictions
  isResolved: bool = false;    // Whether winnings distributed

  // House Edge
  houseFeePercent: u8 = 5;     // 5% house edge
  houseFee: u64 = 0;           // Actual fee collected

  // Result
  winnerId: string = '';       // Winning character ID

  createdAt: u64 = 0;

  serialize(): StaticArray<u8> { /* ... */ }
  deserialize(data: StaticArray<u8>): Result<void> { /* ... */ }
}
```

### 3.3 Prediction

```typescript
@serializable
export class Prediction implements Serializable {
  predictionId: string = '';
  marketId: string = '';
  predictor: string = '';      // Address who made prediction

  predictedWinnerId: string = '';  // Character they bet on
  amount: u64 = 0;             // Amount bet in nanoMAS

  // Payout
  payout: u64 = 0;             // Amount won (0 if lost)
  claimed: bool = false;       // Whether winnings claimed

  timestamp: u64 = 0;

  serialize(): StaticArray<u8> { /* ... */ }
  deserialize(data: StaticArray<u8>): Result<void> { /* ... */ }
}
```

### 3.4 State Constants

```typescript
// Scheduled Match States
export const MATCH_STATE_SCHEDULED: u8 = 0;   // Accepting predictions
export const MATCH_STATE_LOCKED: u8 = 1;      // Predictions closed, awaiting execution
export const MATCH_STATE_EXECUTING: u8 = 2;   // Match in progress
export const MATCH_STATE_COMPLETED: u8 = 3;   // Match finished, winnings distributed
export const MATCH_STATE_CANCELLED: u8 = 4;   // Match cancelled, refunds issued

// Prediction Market Config
export const MIN_PREDICTION_AMOUNT: u64 = 100_000_000;  // 0.1 MAS minimum bet
export const PREDICTION_LOCK_TIME: u64 = 300_000;       // 5 minutes in ms
export const HOUSE_FEE_PERCENT: u8 = 5;                 // 5% house edge
```

---

## 4. Core Functions

### 4.1 Match Scheduling

```typescript
/**
 * Schedule a match between two characters
 * @param matchId - Unique match identifier
 * @param character1Id - First character
 * @param character2Id - Second character
 * @param scheduledTime - When match will execute (timestamp)
 * @param description - Match description
 */
export function scheduleMatch(
  matchId: string,
  character1Id: string,
  character2Id: string,
  scheduledTime: u64,
  description: string
): ScheduledMatch {
  // Validation
  assert(!matchExists(matchId), 'Match ID already exists');
  assert(loadCharacter(character1Id) != null, 'Character 1 not found');
  assert(loadCharacter(character2Id) != null, 'Character 2 not found');

  const now = Context.timestamp();
  assert(scheduledTime > now, 'Match must be scheduled in future');
  assert(scheduledTime - now >= PREDICTION_LOCK_TIME,
         'Must schedule at least 5 minutes in advance');

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
  const marketId = `market_${matchId}`;
  match.marketId = marketId;

  const market = new PredictionMarket();
  market.marketId = marketId;
  market.matchId = matchId;
  market.isOpen = true;
  market.createdAt = now;

  // Save
  saveScheduledMatch(match);
  savePredictionMarket(market);

  generateEvent(`MATCH_SCHEDULED:${matchId}:${scheduledTime}:${character1Id}:${character2Id}`);

  return match;
}
```

### 4.2 Place Prediction

```typescript
/**
 * Place a prediction on a scheduled match
 * @param marketId - Market ID
 * @param predictedWinnerId - Character predicted to win
 */
export function placePrediction(
  marketId: string,
  predictedWinnerId: string
): void {
  // Load market
  const market = loadPredictionMarket(marketId);
  assert(market != null, 'Market not found');

  // Validate market is open
  assert(market!.isOpen, 'Market is closed');

  // Load associated match
  const match = loadScheduledMatch(market!.matchId);
  assert(match != null, 'Match not found');

  // Check if predictions are still open (before lock time)
  const now = Context.timestamp();
  assert(now < match!.lockTime, 'Predictions are locked');

  // Validate predicted winner is a participant
  assert(
    predictedWinnerId == match!.character1Id ||
    predictedWinnerId == match!.character2Id,
    'Invalid predicted winner'
  );

  // Validate bet amount
  const amount = Context.transferredCoins();
  assert(amount >= MIN_PREDICTION_AMOUNT, 'Bet amount too low');

  const predictor = Context.caller().toString();

  // Create prediction
  const predictionId = `pred_${marketId}_${predictor}_${now}`;
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

  // Track user predictions
  addUserPrediction(predictor, predictionId);

  generateEvent(
    `PREDICTION_PLACED:${predictionId}:${predictor}:${predictedWinnerId}:${amount}`
  );
}
```

### 4.3 Lock Market

```typescript
/**
 * Lock market when lock time reached (can be called by anyone)
 * @param marketId - Market to lock
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

  generateEvent(`MARKET_LOCKED:${marketId}`);
}
```

### 4.4 Execute Scheduled Match

```typescript
/**
 * Execute a scheduled match (can be called by anyone after scheduled time)
 * @param matchId - Match to execute
 */
export function executeScheduledMatch(matchId: string): void {
  const match = loadScheduledMatch(matchId);
  assert(match != null, 'Match not found');
  assert(match!.state == MATCH_STATE_LOCKED, 'Match not ready for execution');

  const now = Context.timestamp();
  assert(now >= match!.scheduledTime, 'Scheduled time not reached');

  // Update state
  match!.state = MATCH_STATE_EXECUTING;
  saveScheduledMatch(match!);

  // Create and execute battle
  const battleId = `battle_${matchId}`;
  const battle = createBattle(
    battleId,
    match!.character1Id,
    match!.character2Id,
    now
  );

  match!.battleId = battleId;
  saveScheduledMatch(match!);

  generateEvent(`MATCH_EXECUTING:${matchId}:${battleId}`);

  // Note: Battle will be played through normal executeTurn calls
  // When finalized, we'll call resolveMarket
}
```

### 4.5 Resolve Market

```typescript
/**
 * Resolve prediction market after match completes
 * @param marketId - Market to resolve
 */
export function resolveMarket(marketId: string): void {
  const market = loadPredictionMarket(marketId);
  assert(market != null, 'Market not found');
  assert(!market!.isResolved, 'Market already resolved');

  const match = loadScheduledMatch(market!.matchId);
  assert(match != null, 'Match not found');

  // Verify battle is complete
  const battle = loadBattle(match!.battleId);
  assert(battle != null, 'Battle not found');
  assert(battle!.state == BATTLE_STATE_COMPLETED, 'Battle not completed');

  // Get winner
  const winnerId = battle!.winner;
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
    generateEvent(`MARKET_RESOLVED:${marketId}:NO_WINNERS`);
    return;
  }

  // Calculate payout ratio: winningsPool / winningPool
  // Each winning prediction gets: (bet / winningPool) * winningsPool

  // Update all predictions with payouts
  const predictionIds = getMarketPredictions(marketId);
  for (let i = 0; i < predictionIds.length; i++) {
    const pred = loadPrediction(predictionIds[i]);
    if (pred != null && pred!.predictedWinnerId == winnerId) {
      // Winner: calculate payout
      const share = (pred!.amount * winningsPool) / winningPool;
      pred!.payout = share;
      savePrediction(pred!);
    }
    // Losers get payout = 0 (already default)
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
```

### 4.6 Claim Winnings

```typescript
/**
 * Claim winnings from a prediction
 * @param predictionId - Prediction to claim
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
```

### 4.7 Cancel Match

```typescript
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
      pred!.claimed = true;  // Mark as claimed to prevent double refund
      pred!.payout = pred!.amount;  // Refund amount
      savePrediction(pred!);
    }
  }

  saveScheduledMatch(match!);

  generateEvent(`MATCH_CANCELLED:${matchId}`);
}
```

---

## 5. Storage Schema

```typescript
// Storage Keys
export const KEY_SCHEDULED_MATCH: string = 'smatch_';
export const KEY_PREDICTION_MARKET: string = 'pmarket_';
export const KEY_PREDICTION: string = 'pred_';
export const KEY_USER_PREDICTIONS: string = 'upreds_';   // address -> prediction IDs
export const KEY_MARKET_PREDICTIONS: string = 'mpreds_'; // market -> prediction IDs

// Storage Functions
function saveScheduledMatch(match: ScheduledMatch): void {
  setBytes(KEY_SCHEDULED_MATCH + match.matchId, match.serialize());
}

function loadScheduledMatch(matchId: string): ScheduledMatch | null {
  const data = getBytes(KEY_SCHEDULED_MATCH + matchId);
  if (data.length == 0) return null;
  const match = new ScheduledMatch();
  match.deserialize(data);
  return match;
}

// Similar for PredictionMarket, Prediction, etc.
```

---

## 6. Query Functions

```typescript
/**
 * Get upcoming scheduled matches
 */
export function getUpcomingMatches(count: u32): string {
  // Returns JSON array of upcoming matches
}

/**
 * Get market info with current odds
 */
export function getMarketInfo(marketId: string): string {
  const market = loadPredictionMarket(marketId);
  if (market == null) return '';

  const match = loadScheduledMatch(market!.matchId);

  // Calculate implied odds
  const char1Odds = calculateOdds(market!.char1Pool, market!.totalPool);
  const char2Odds = calculateOdds(market!.char2Pool, market!.totalPool);

  // Return JSON with market info, odds, pools, etc.
}

/**
 * Get user's predictions
 */
export function getUserPredictions(address: string): string {
  // Returns JSON array of user's predictions
}

/**
 * Calculate current odds for a choice
 */
function calculateOdds(poolAmount: u64, totalPool: u64): f64 {
  if (totalPool == 0) return 1.0;
  const winningsPool = totalPool - (totalPool * u64(HOUSE_FEE_PERCENT)) / 100;
  return f64(winningsPool) / f64(poolAmount);
}
```

---

## 7. Events

```typescript
// Match Events
MATCH_SCHEDULED:{matchId}:{time}:{char1}:{char2}
MARKET_LOCKED:{marketId}
MATCH_EXECUTING:{matchId}:{battleId}
MATCH_CANCELLED:{matchId}

// Prediction Events
PREDICTION_PLACED:{predId}:{predictor}:{winnerId}:{amount}
MARKET_RESOLVED:{marketId}:{winnerId}:{winnings}:{houseFee}
WINNINGS_CLAIMED:{predId}:{predictor}:{amount}
```

---

## 8. React Hook Integration

```typescript
// usePredictionMarket.ts
export function usePredictionMarket(
  contractAddress: string,
  isConnected: boolean,
  provider: any,
  userAddress: string
) {
  const scheduleMatch = useCallback(async (
    matchId: string,
    char1Id: string,
    char2Id: string,
    scheduledTime: Date,
    description: string
  ) => {
    const args = new Args()
      .addString(matchId)
      .addString(char1Id)
      .addString(char2Id)
      .addU64(BigInt(scheduledTime.getTime()))
      .addString(description);

    return await callContract(
      provider,
      contractAddress,
      'game_scheduleMatch',
      args,
      Mas.fromString('0.5')
    );
  }, []);

  const placePrediction = useCallback(async (
    marketId: string,
    predictedWinnerId: string,
    betAmount: bigint
  ) => {
    const args = new Args()
      .addString(marketId)
      .addString(predictedWinnerId);

    return await callContract(
      provider,
      contractAddress,
      'game_placePrediction',
      args,
      betAmount  // Bet amount sent as coins
    );
  }, []);

  const claimWinnings = useCallback(async (predictionId: string) => {
    const args = new Args().addString(predictionId);
    return await callContract(
      provider,
      contractAddress,
      'game_claimWinnings',
      args,
      Mas.fromString('0.1')
    );
  }, []);

  const getMarketInfo = useCallback(async (marketId: string) => {
    const args = new Args().addString(marketId);
    const result = await readContract(
      provider,
      contractAddress,
      'game_getMarketInfo',
      args
    );
    return JSON.parse(new Args(result.value).nextString());
  }, []);

  return {
    scheduleMatch,
    placePrediction,
    claimWinnings,
    getMarketInfo,
    loading,
    error
  };
}
```

---

## 9. Example User Flow

```
1. ADMIN/USER: Schedule match 1 hour in future
   ├─ Characters: Warrior#123 vs Assassin#456
   ├─ Time: 2025-11-25 15:00:00
   └─ Market opens immediately

2. USERS: Place predictions (0:00 - 0:55)
   ├─ Alice bets 10 MAS on Warrior#123
   ├─ Bob bets 15 MAS on Assassin#456
   ├─ Charlie bets 5 MAS on Warrior#123
   └─ Total Pool: 30 MAS
       - Warrior pool: 15 MAS (2 bettors)
       - Assassin pool: 15 MAS (1 bettor)

3. SYSTEM: Market locks (0:55)
   └─ No more predictions accepted

4. ANYONE: Execute match (1:00)
   ├─ Creates battle
   └─ Players execute turns until completion

5. SYSTEM: Resolve market (after battle)
   ├─ Winner: Warrior#123
   ├─ House fee: 1.5 MAS (5%)
   ├─ Winnings pool: 28.5 MAS
   ├─ Payouts:
   │   - Alice: (10/15) * 28.5 = 19 MAS (9 MAS profit)
   │   - Charlie: (5/15) * 28.5 = 9.5 MAS (4.5 MAS profit)
   │   - Bob: 0 MAS (lost 15 MAS)
   └─ Treasury receives: 1.5 MAS

6. WINNERS: Claim winnings
   ├─ Alice claims 19 MAS
   └─ Charlie claims 9.5 MAS
```

---

## 10. Security Considerations

### Reentrancy Protection
```typescript
// Use existing reentrancy lock from main.ts
function placePrediction(...) {
  checkNotReentrant();
  setReentrancyLock(true);

  // ... logic ...

  setReentrancyLock(false);
}
```

### Timestamp Manipulation
- **Risk**: Miners could manipulate timestamps slightly
- **Mitigation**: Use reasonable lock times (5 min buffer is safe)
- **Not critical**: Small timestamp shifts won't significantly impact fairness

### Front-Running
- **Risk**: Users see profitable bets and copy them
- **Mitigation**: Inherent to public blockchain; odds adjust dynamically
- **Note**: Last-second bets prevented by lock time

### Match Fixing
- **Risk**: Match participants could manipulate outcome
- **Mitigation**:
  - Monitor suspicious betting patterns
  - Implement stake requirements for participants
  - Optional: Restrict participants from betting on own matches

### Pool Drainage
- **Risk**: Edge cases in payout calculation could drain contract
- **Mitigation**:
  - Careful math with overflow checks
  - Track total payouts vs total pool
  - Emergency pause function

---

## 11. Implementation Phases

### Phase 1: Core Infrastructure
```
✓ Add ScheduledMatch, PredictionMarket, Prediction types
✓ Add storage functions
✓ Add constants and state enums
```

### Phase 2: Match Scheduling
```
✓ scheduleMatch()
✓ cancelMatch()
✓ lockMarket()
✓ executeScheduledMatch()
```

### Phase 3: Prediction System
```
✓ placePrediction()
✓ resolveMarket()
✓ claimWinnings()
```

### Phase 4: Query & UI
```
✓ getUpcomingMatches()
✓ getMarketInfo()
✓ getUserPredictions()
✓ React hooks
```

### Phase 5: Advanced Features
```
□ Multi-outcome predictions (winner + rounds)
□ Live betting (during match)
□ Prediction pools with AMM curves
□ Prediction NFTs (tradeable positions)
```

---

## 12. Gas Optimization

```typescript
// Batch operations where possible
function batchClaimWinnings(predictionIds: string[]): void {
  for (let i = 0; i < predictionIds.length; i++) {
    // Claim each prediction
  }
}

// Use u32 for counts instead of u64 where appropriate
// Minimize storage writes by batching updates
// Use bitmasks for flags where possible
```

---

## 13. Testing Strategy

```typescript
// test-predictions.ts
async function testPredictionFlow() {
  // 1. Schedule match
  await scheduleMatch(...);

  // 2. Place predictions from multiple accounts
  await placePrediction(alice, char1, 10);
  await placePrediction(bob, char2, 15);

  // 3. Wait for lock time
  await sleep(lockTime);

  // 4. Execute match
  await executeScheduledMatch(...);

  // 5. Play battle to completion
  await playBattleToCompletion(...);

  // 6. Resolve market
  await resolveMarket(...);

  // 7. Claim winnings
  await claimWinnings(alice);

  // 8. Verify payouts
  assertBalances(...);
}
```

---

## 14. Metrics & Analytics

Track these metrics for market health:

```typescript
interface MarketMetrics {
  totalVolumeAllTime: u64;      // Total MAS bet
  totalMatchesScheduled: u32;
  totalMatchesCompleted: u32;
  totalPredictionsPlaced: u32;
  totalUniqueBettors: u32;
  averagePoolSize: u64;
  houseFeeCollected: u64;
}
```

---

## 15. Future Enhancements

1. **Dynamic House Edge**: Adjust based on pool size
2. **Prediction Bundles**: Bet on multiple matches as parlay
3. **Live Markets**: Odds update during battle based on HP/state
4. **Social Features**: Leaderboard for best predictors
5. **Prediction Reputation**: Track user prediction accuracy
6. **Market Maker**: Automated liquidity for unpopular matches
7. **Cross-Chain Bridge**: Enable predictions from other chains

---

## Conclusion

This prediction market system adds a compelling economic layer to the Fighter Game, enabling:

✅ **User Engagement**: Spectators become economically invested
✅ **Revenue**: House edge generates sustainable treasury income
✅ **Fairness**: Pool-based odds ensure transparent, manipulation-resistant pricing
✅ **Scalability**: Stateless design supports unlimited concurrent markets
✅ **Composability**: Integrates cleanly with existing battle system

**Next Steps**: Review design → Implement Phase 1 → Test → Deploy to buildnet
