export enum Stance {
  None = 0,
  Aggressive = 1,
  Defensive = 2,
  Counter = 3
}

export enum BattleStatus {
  None = 0,
  Committed = 1,
  Revealed = 2,
  Completed = 3
}

export interface Battle {
  battleId: number;
  char1TokenId: number;
  char2TokenId: number;
  player1: string;
  player2: string;
  totalRounds: number;
  currentRound: number;
  status: BattleStatus;
  vrfRequestId: number;
  winner: number; // 0 = none, 1 = player1, 2 = player2, 3 = tie
}

export interface RoundState {
  char1HP: number;
  char2HP: number;
  char1Stance: Stance;
  char2Stance: Stance;
  char1Commit: string;
  char2Commit: string;
  char1Committed: boolean;
  char2Committed: boolean;
  char1Revealed: boolean;
  char2Revealed: boolean;
  char1Combo: number;
  char2Combo: number;
  char1AbilityUsed: boolean;
  char2AbilityUsed: boolean;
  char1DoT: number;
  char2DoT: number;
  char1DotTurns: number;
  char2DotTurns: number;
}

export const STANCE_NAMES: Record<Stance, string> = {
  [Stance.None]: 'None',
  [Stance.Aggressive]: 'Aggressive',
  [Stance.Defensive]: 'Defensive',
  [Stance.Counter]: 'Counter'
};

export const STANCE_DESCRIPTIONS: Record<Stance, string> = {
  [Stance.None]: 'No stance selected',
  [Stance.Aggressive]: 'Beats Defensive (+50% damage)',
  [Stance.Defensive]: 'Beats Counter (+50% damage)',
  [Stance.Counter]: 'Beats Aggressive (+50% damage)'
};

export const ROUND_OPTIONS = [3, 5, 8] as const;
export type RoundOption = typeof ROUND_OPTIONS[number];
