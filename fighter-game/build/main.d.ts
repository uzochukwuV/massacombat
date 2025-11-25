/** Exported memory */
export declare const memory: WebAssembly.Memory;
// Exported runtime interface
export declare function __new(size: number, id: number): number;
export declare function __pin(ptr: number): number;
export declare function __unpin(ptr: number): void;
export declare function __collect(): void;
export declare const __rtti_base: number;
/**
 * assembly/contracts/main/constructor
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function constructor(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_pause
 * @param _ `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_pause(_: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_unpause
 * @param _ `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_unpause(_: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_transferAdmin
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_transferAdmin(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_createCharacter
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_createCharacter(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readCharacter
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readCharacter(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_healCharacter
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_healCharacter(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_upgradeCharacter
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_upgradeCharacter(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_grantXP
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_grantXP(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_createEquipment
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_createEquipment(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readEquipment
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readEquipment(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_transferEquipment
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_transferEquipment(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_equipItem
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_equipItem(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_unequipItem
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_unequipItem(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_repairEquipment
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_repairEquipment(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_learnSkill
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_learnSkill(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_equipSkill
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_equipSkill(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_createBattle
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_createBattle(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_executeTurn
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_executeTurn(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_decideWildcard
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_decideWildcard(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_finalizeBattle
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_finalizeBattle(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_timeoutWildcard
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_timeoutWildcard(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_readBattle
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readBattle(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_processBattleResults
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_processBattleResults(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_createTournament
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_createTournament(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_registerForTournament
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_registerForTournament(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_recordTournamentMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_recordTournamentMatch(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_advanceTournamentRound
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_advanceTournamentRound(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_readTournament
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readTournament(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getLeaderboard
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getLeaderboard(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getCharacterRank
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getCharacterRank(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getMMRTier
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getMMRTier(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getAchievements
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getAchievements(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_checkAllAchievements
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_checkAllAchievements(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_getTreasuryBalance
 * @param _ `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getTreasuryBalance(_: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_withdrawFromTreasury
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_withdrawFromTreasury(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_emergencyWithdraw
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_emergencyWithdraw(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_getFeeInfo
 * @param _ `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getFeeInfo(_: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_isPaused
 * @param _ `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_isPaused(_: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getAdmin
 * @param _ `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getAdmin(_: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_isBattleActive
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_isBattleActive(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_scheduleMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_scheduleMatch(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_placePrediction
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_placePrediction(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_lockMarket
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_lockMarket(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_executeScheduledMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_executeScheduledMatch(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_resolveMarket
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_resolveMarket(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_claimWinnings
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_claimWinnings(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_cancelMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_cancelMatch(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_autonomousLockMarket
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_autonomousLockMarket(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_autonomousExecuteMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_autonomousExecuteMatch(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_autonomousResolveMarket
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_autonomousResolveMarket(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_autonomousCleanup
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_autonomousCleanup(binaryArgs: ArrayLike<number>): void;
/**
 * assembly/contracts/main/game_readScheduledMatch
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readScheduledMatch(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readPredictionMarket
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readPredictionMarket(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readPrediction
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readPrediction(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readUserPredictions
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readUserPredictions(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_readMarketPredictions
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_readMarketPredictions(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getMarketInfo
 * @param binaryArgs `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getMarketInfo(binaryArgs: ArrayLike<number>): ArrayLike<number>;
/**
 * assembly/contracts/main/game_getUpcomingMatches
 * @param _ `~lib/staticarray/StaticArray<u8>`
 * @returns `~lib/staticarray/StaticArray<u8>`
 */
export declare function game_getUpcomingMatches(_: ArrayLike<number>): ArrayLike<number>;
