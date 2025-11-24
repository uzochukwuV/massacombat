/**
 * Battle Engine Component
 * Handles battle creation, turn execution, damage calculation, and finalization
 */

import { Context, generateEvent } from '@massalabs/massa-as-sdk';
import {
  Battle,
  BattlePlayer,
  Character,
  BATTLE_STATE_PENDING,
  BATTLE_STATE_ACTIVE,
  BATTLE_STATE_WILDCARD,
  BATTLE_STATE_COMPLETED,
  STANCE_NEUTRAL,
  STANCE_AGGRESSIVE,
  STANCE_DEFENSIVE,
  WILDCARD_CHANCE,
  WILDCARD_DEADLINE,
} from './types';
import {
  saveBattle,
  loadBattle,
  battleExists,
  loadCharacter,
} from './storage';
import { getEffectiveStats } from './character';
import {
  initializeSeed,
  setSeed,
  getCurrentSeed,
  createBattleSeed,
  rollDamage,
  rollCritical,
  rollDodge,
  rollWildcard,
  randomU8Between,
} from './randomness';
import {
  getSkillEnergyCost,
  getSkillCooldown,
  isValidSkill,
  isSkillOnCooldown,
  canUseSkill,
  spendEnergy,
  regenerateEnergy,
  reduceCooldowns,
  setPlayerCooldown,
  applySkillEffect,
  isOffensiveSkill,
  isSelfBuffSkill,
  getEquippedSkill,
  hasLearnedSkill,
} from './skills';
import {
  isStunned,
  hasRage,
  hasShield,
  applyDOTEffects,
  tickStatusDurations,
  getRageDamageMultiplier,
  getShieldDamageReduction,
  getTotalDodgeChance,
  clearAllStatus,
} from './status';

// ============================================================================
// Battle Creation
// ============================================================================

/**
 * Create a new battle between two characters
 * @param battleId - Unique battle ID
 * @param char1Id - Player 1's character ID
 * @param char2Id - Player 2's character ID
 * @param startTs - Battle start timestamp
 */
export function createBattle(
  battleId: string,
  char1Id: string,
  char2Id: string,
  startTs: u64
): Battle {
  // Validate battle doesn't exist
  assert(!battleExists(battleId), 'Battle ID already exists');

  // Load and validate characters
  const char1 = loadCharacter(char1Id);
  assert(char1 != null, 'Character 1 not found');

  const char2 = loadCharacter(char2Id);
  assert(char2 != null, 'Character 2 not found');

  // Get effective stats (with equipment bonuses)
  const effective1 = getEffectiveStats(char1!);
  const effective2 = getEffectiveStats(char2!);

  // Create battle
  const battle = new Battle(battleId);
  battle.state = BATTLE_STATE_ACTIVE;
  battle.startTimestamp = startTs;
  battle.lastActionTimestamp = startTs;
  battle.turnNumber = 1;
  battle.currentTurn = 1; // Player 1 starts

  // Initialize player states
  battle.player1 = new BattlePlayer(char1Id, effective1.maxHp, effective1.maxHp);
  battle.player2 = new BattlePlayer(char2Id, effective2.maxHp, effective2.maxHp);

  // Initialize random seed
  battle.randomSeed = createBattleSeed(battleId, startTs);

  saveBattle(battle);

  generateEvent(
    `BATTLE_CREATED:${battleId}:${char1Id}:${char2Id}:${startTs.toString()}`
  );

  return battle;
}

// ============================================================================
// Battle State Access
// ============================================================================

/**
 * Load battle and verify it exists
 */
export function getBattle(battleId: string): Battle {
  const battle = loadBattle(battleId);
  assert(battle != null, 'Battle not found');
  return battle!;
}

/**
 * Check if it's a player's turn
 */
export function isPlayerTurn(battle: Battle, characterId: string): bool {
  if (battle.currentTurn == 1) {
    return battle.player1.characterId == characterId;
  } else {
    return battle.player2.characterId == characterId;
  }
}

/**
 * Get the current attacker
 */
export function getCurrentAttacker(battle: Battle): BattlePlayer {
  return battle.currentTurn == 1 ? battle.player1 : battle.player2;
}

/**
 * Get the current defender
 */
export function getCurrentDefender(battle: Battle): BattlePlayer {
  return battle.currentTurn == 1 ? battle.player2 : battle.player1;
}

// ============================================================================
// Damage Calculation
// ============================================================================

/**
 * Calculate damage for an attack
 * Follows the damage formula from design doc
 */
export function calculateDamage(
  attacker: BattlePlayer,
  defender: BattlePlayer,
  attackerChar: Character,
  defenderChar: Character,
  skillId: u8,
  isCrit: bool
): u16 {
  // 1. Base Damage = Random(DamageMin + EquipBonus, DamageMax + EquipBonus)
  const baseDamage = rollDamage(
    u16(attackerChar.damageMin),
    u16(attackerChar.damageMax)
  );

  // 2. Level Bonus = (Level - 1) * 2
  const levelBonus: u16 = u16((attackerChar.level - 1) * 2);

  // 3. Status Multiplier = 1.5 if Rage active, else 1.0
  const rageMultiplier = getRageDamageMultiplier(attacker);

  // 4. Calculate total base with multipliers
  let totalBase: u32 = u32(baseDamage + levelBonus);
  totalBase = (totalBase * u32(rageMultiplier)) / 100;

  // 5. Critical = Total Base * 2 if crit occurs
  if (isCrit) {
    totalBase = totalBase * 2;
  }

  // 6. Combo Bonus = *1.2 if combo >= 3
  if (attacker.comboCount >= 3) {
    totalBase = (totalBase * 120) / 100;
  }

  // 7. Defense Reduction
  let afterDefense: i32 = i32(totalBase) - i32(defenderChar.defense);
  if (afterDefense < 0) afterDefense = 0;

  // 8. Shield Reduction (0.7x if shield active)
  const shieldReduction = getShieldDamageReduction(defender);
  let finalDamage: u32 = (u32(afterDefense) * u32(shieldReduction)) / 100;

  return u16(finalDamage);
}

// ============================================================================
// Turn Execution
// ============================================================================

/**
 * Execute a turn in battle
 * @param battleId - Battle ID
 * @param attackerCharId - Character taking the action
 * @param stance - Combat stance (0=neutral, 1=aggressive, 2=defensive)
 * @param useSpecial - Whether to use a skill
 * @param skillSlot - Which skill slot to use (1-3)
 */
export function executeTurn(
  battleId: string,
  attackerCharId: string,
  stance: u8,
  useSpecial: bool,
  skillSlot: u8
): void {
  const battle = getBattle(battleId);

  // Validate battle state
  assert(battle.state == BATTLE_STATE_ACTIVE, 'Battle not active');
  assert(isPlayerTurn(battle, attackerCharId), 'Not your turn');

  // Restore random seed
  setSeed(battle.randomSeed);

  // Get attacker and defender
  const isPlayer1 = battle.currentTurn == 1;
  const attacker = isPlayer1 ? battle.player1 : battle.player2;
  const defender = isPlayer1 ? battle.player2 : battle.player1;

  // Load character data
  const attackerChar = loadCharacter(attacker.characterId);
  const defenderChar = loadCharacter(defender.characterId);
  assert(attackerChar != null && defenderChar != null, 'Character data error');

  const effectiveAttacker = getEffectiveStats(attackerChar!);
  const effectiveDefender = getEffectiveStats(defenderChar!);

  // Apply DOT effects at turn start
  const dotDamage = applyDOTEffects(attacker, battleId);

  // Check if attacker died from DOT
  if (attacker.currentHp == 0) {
    finalizeBattleWithWinner(battle, defender.characterId);
    return;
  }

  // Check stun - skip turn if stunned
  if (isStunned(attacker)) {
    generateEvent(`TURN_SKIPPED:${battleId}:${attackerCharId}:STUNNED`);
    tickStatusDurations(attacker, battleId);
    reduceCooldowns(attacker);
    switchTurn(battle);
    saveBattle(battle);
    return;
  }

  // Regenerate energy
  regenerateEnergy(attacker);

  let skillId: u8 = 0;
  let damageDealt: u16 = 0;
  let dodged: bool = false;
  let isCrit: bool = false;

  // Handle skill usage
  if (useSpecial && skillSlot >= 1 && skillSlot <= 3) {
    skillId = getEquippedSkill(attackerChar!, skillSlot);

    if (skillId > 0 && isValidSkill(skillId)) {
      // Check if skill is on cooldown
      if (isSkillOnCooldown(attacker, skillId)) {
        generateEvent(`SKILL_ON_COOLDOWN:${battleId}:${skillId.toString()}`);
        skillId = 0; // Fall back to basic attack
      } else if (!canUseSkill(attacker, skillId)) {
        generateEvent(`INSUFFICIENT_ENERGY:${battleId}:${skillId.toString()}`);
        skillId = 0; // Fall back to basic attack
      } else {
        // Use the skill
        spendEnergy(attacker, getSkillEnergyCost(skillId));
        setPlayerCooldown(attacker, skillId, getSkillCooldown(skillId));

        generateEvent(
          `SKILL_USED:${battleId}:${attackerCharId}:${skillId.toString()}`
        );
      }
    } else {
      skillId = 0;
    }
  }

  // Calculate and apply damage
  if (skillId == 0 || isOffensiveSkill(skillId)) {
    // Check for dodge
    const totalDodge = getTotalDodgeChance(defender, effectiveDefender.dodgeChance);
    dodged = rollDodge(totalDodge, 0);

    if (dodged) {
      generateEvent(`ATTACK_DODGED:${battleId}:${defender.characterId}`);
      attacker.comboCount = 0; // Reset combo on miss
    } else {
      // Check for critical hit
      isCrit = rollCritical(effectiveAttacker.critChance, attacker.guaranteedCrit);
      attacker.guaranteedCrit = false; // Consume guaranteed crit

      // Calculate base damage
      let baseDamage = calculateDamage(
        attacker,
        defender,
        effectiveAttacker,
        effectiveDefender,
        skillId,
        isCrit
      );

      // Apply skill effects
      if (skillId > 0) {
        damageDealt = applySkillEffect(skillId, attacker, defender, baseDamage);
      } else {
        damageDealt = baseDamage;
      }

      // Apply stance modifiers
      damageDealt = applyStanceModifier(damageDealt, stance);

      // Apply damage
      if (defender.currentHp <= damageDealt) {
        defender.currentHp = 0;
      } else {
        defender.currentHp -= damageDealt;
      }

      // Increment combo
      attacker.comboCount++;

      generateEvent(
        `DAMAGE_DEALT:${battleId}:${attackerCharId}:${defender.characterId}:${damageDealt.toString()}:${isCrit ? '1' : '0'}:${attacker.comboCount.toString()}`
      );
    }
  } else if (isSelfBuffSkill(skillId)) {
    // Self-buff skills don't deal damage
    applySkillEffect(skillId, attacker, defender, 0);
  }

  // Check for wildcard trigger (10% chance)
  if (rollWildcard(WILDCARD_CHANCE)) {
    triggerWildcard(battle);
    return; // Pause for wildcard decisions
  }

  // Check win condition
  if (defender.currentHp == 0) {
    finalizeBattleWithWinner(battle, attacker.characterId);
    return;
  }

  // End of turn processing
  tickStatusDurations(attacker, battleId);
  reduceCooldowns(attacker);

  // Switch turns
  switchTurn(battle);

  // Update battle state
  battle.lastActionTimestamp = Context.timestamp();
  battle.randomSeed = getCurrentSeed();

  saveBattle(battle);

  generateEvent(
    `TURN_COMPLETE:${battleId}:${battle.turnNumber.toString()}:${battle.currentTurn.toString()}`
  );
}

/**
 * Apply stance damage modifier
 */
function applyStanceModifier(damage: u16, stance: u8): u16 {
  switch (stance) {
    case STANCE_AGGRESSIVE:
      // +20% damage
      return u16((u32(damage) * 120) / 100);
    case STANCE_DEFENSIVE:
      // -20% damage (but would receive -20% too)
      return u16((u32(damage) * 80) / 100);
    default:
      return damage;
  }
}

/**
 * Switch to the other player's turn
 */
function switchTurn(battle: Battle): void {
  battle.currentTurn = battle.currentTurn == 1 ? 2 : 1;
  battle.turnNumber++;
}

// ============================================================================
// Wildcard System
// ============================================================================

/**
 * Trigger a wildcard event
 */
function triggerWildcard(battle: Battle): void {
  battle.state = BATTLE_STATE_WILDCARD;
  battle.wildcardActive = true;
  battle.wildcardType = randomU8Between(1, 5); // 5 types of wildcards
  battle.wildcardDeadline = Context.timestamp() + WILDCARD_DEADLINE;
  battle.player1WildcardDecision = 255;
  battle.player2WildcardDecision = 255;

  saveBattle(battle);

  generateEvent(
    `WILDCARD_TRIGGERED:${battle.id}:${battle.wildcardType.toString()}:${battle.wildcardDeadline.toString()}`
  );
}

/**
 * Submit wildcard decision
 * @param battleId - Battle ID
 * @param accept - Accept or reject the wildcard
 * @param playerCharId - Character making the decision
 */
export function decideWildcard(
  battleId: string,
  accept: bool,
  playerCharId: string
): void {
  const battle = getBattle(battleId);

  assert(battle.state == BATTLE_STATE_WILDCARD, 'No wildcard active');

  const decision: u8 = accept ? 1 : 0;

  if (battle.player1.characterId == playerCharId) {
    assert(battle.player1WildcardDecision == 255, 'Already decided');
    battle.player1WildcardDecision = decision;
  } else if (battle.player2.characterId == playerCharId) {
    assert(battle.player2WildcardDecision == 255, 'Already decided');
    battle.player2WildcardDecision = decision;
  } else {
    assert(false, 'Not a participant');
  }

  generateEvent(
    `WILDCARD_DECISION:${battleId}:${playerCharId}:${accept ? 'ACCEPT' : 'REJECT'}`
  );

  // Check if both players have decided
  if (
    battle.player1WildcardDecision != 255 &&
    battle.player2WildcardDecision != 255
  ) {
    resolveWildcard(battle);
  } else {
    saveBattle(battle);
  }
}

/**
 * Resolve wildcard based on both players' decisions
 */
function resolveWildcard(battle: Battle): void {
  const p1Accept = battle.player1WildcardDecision == 1;
  const p2Accept = battle.player2WildcardDecision == 1;

  // Wildcard effect based on decisions
  // Both accept: Strong effect
  // One accepts: Mild effect
  // Both reject: No effect

  if (p1Accept && p2Accept) {
    applyWildcardEffect(battle, true);
  } else if (p1Accept || p2Accept) {
    applyWildcardEffect(battle, false);
  }
  // Both reject = no effect

  // Reset wildcard state and resume battle
  battle.wildcardActive = false;
  battle.state = BATTLE_STATE_ACTIVE;
  battle.player1WildcardDecision = 255;
  battle.player2WildcardDecision = 255;

  saveBattle(battle);

  generateEvent(`WILDCARD_RESOLVED:${battle.id}`);
}

/**
 * Apply wildcard effect
 */
function applyWildcardEffect(battle: Battle, strong: bool): void {
  const multiplier = strong ? 2 : 1;

  switch (battle.wildcardType) {
    case 1: // Health swap
      if (strong) {
        const temp = battle.player1.currentHp;
        battle.player1.currentHp = battle.player2.currentHp;
        battle.player2.currentHp = temp;
      }
      break;

    case 2: // Energy boost
      const boost = u8(30 * multiplier);
      battle.player1.energy = battle.player1.energy + boost > 100 ? 100 : battle.player1.energy + boost;
      battle.player2.energy = battle.player2.energy + boost > 100 ? 100 : battle.player2.energy + boost;
      break;

    case 3: // Heal both
      const heal = u16(20 * multiplier);
      battle.player1.currentHp = battle.player1.currentHp + heal > battle.player1.maxHp
        ? battle.player1.maxHp
        : battle.player1.currentHp + heal;
      battle.player2.currentHp = battle.player2.currentHp + heal > battle.player2.maxHp
        ? battle.player2.maxHp
        : battle.player2.currentHp + heal;
      break;

    case 4: // Clear all status effects
      clearAllStatus(battle.player1);
      clearAllStatus(battle.player2);
      break;

    case 5: // Damage both
      const dmg = u16(15 * multiplier);
      battle.player1.currentHp = battle.player1.currentHp > dmg ? battle.player1.currentHp - dmg : 0;
      battle.player2.currentHp = battle.player2.currentHp > dmg ? battle.player2.currentHp - dmg : 0;
      break;
  }

  generateEvent(
    `WILDCARD_EFFECT:${battle.id}:${battle.wildcardType.toString()}:${strong ? 'STRONG' : 'MILD'}`
  );
}

// ============================================================================
// Battle Finalization
// ============================================================================

/**
 * Finalize battle with a winner
 */
export function finalizeBattleWithWinner(battle: Battle, winnerId: string): void {
  battle.state = BATTLE_STATE_COMPLETED;
  battle.winnerId = winnerId;

  saveBattle(battle);

  const loserId = battle.player1.characterId == winnerId
    ? battle.player2.characterId
    : battle.player1.characterId;

  generateEvent(
    `BATTLE_COMPLETED:${battle.id}:${winnerId}:${loserId}:${battle.turnNumber.toString()}`
  );
}

/**
 * Finalize battle (for timeout or other reasons)
 */
export function finalizeBattle(battleId: string): void {
  const battle = getBattle(battleId);

  assert(
    battle.state == BATTLE_STATE_ACTIVE || battle.state == BATTLE_STATE_WILDCARD,
    'Battle already completed'
  );

  // Determine winner based on remaining HP
  if (battle.player1.currentHp > battle.player2.currentHp) {
    finalizeBattleWithWinner(battle, battle.player1.characterId);
  } else if (battle.player2.currentHp > battle.player1.currentHp) {
    finalizeBattleWithWinner(battle, battle.player2.characterId);
  } else {
    // Draw - player 1 wins by default (first mover disadvantage compensation)
    finalizeBattleWithWinner(battle, battle.player1.characterId);
  }
}

/**
 * Force timeout on wildcard decision
 */
export function timeoutWildcard(battleId: string): void {
  const battle = getBattle(battleId);

  assert(battle.state == BATTLE_STATE_WILDCARD, 'No wildcard active');
  assert(
    Context.timestamp() > battle.wildcardDeadline,
    'Deadline not reached'
  );

  // Players who didn't decide are treated as rejecting
  if (battle.player1WildcardDecision == 255) {
    battle.player1WildcardDecision = 0;
  }
  if (battle.player2WildcardDecision == 255) {
    battle.player2WildcardDecision = 0;
  }

  resolveWildcard(battle);
}

// ============================================================================
// Battle Query Functions
// ============================================================================

/**
 * Get battle state as string
 */
export function getBattleStateName(state: u8): string {
  switch (state) {
    case BATTLE_STATE_PENDING:
      return 'Pending';
    case BATTLE_STATE_ACTIVE:
      return 'Active';
    case BATTLE_STATE_WILDCARD:
      return 'Wildcard';
    case BATTLE_STATE_COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
}

/**
 * Check if battle is still active
 */
export function isBattleActive(battleId: string): bool {
  const battle = loadBattle(battleId);
  if (battle == null) return false;
  return battle!.state == BATTLE_STATE_ACTIVE || battle!.state == BATTLE_STATE_WILDCARD;
}
