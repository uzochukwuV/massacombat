import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useBattle } from '@/hooks/useBattle';
import { useCharacter } from '@/hooks/useCharacter';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { TurnControls } from '@/components/battle/TurnControls';
import { BattleLog } from '@/components/battle/BattleLog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import type { Battle } from '@/hooks/useBattle';

export function BattleArena() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { isConnected, provider, contractAddress, userAddress, currentCharacter, showNotification } = useGame();

  const { readBattle, executeTurn, finalizeBattle, isBattleActive, loading: battleLoading } = useBattle(
    contractAddress,
    isConnected,
    provider,
    userAddress
  );

  const { readCharacter } = useCharacter(contractAddress, isConnected, provider, userAddress);

  const [battle, setBattle] = useState<Battle | null>(null);
  const [player1Character, setPlayer1Character] = useState<any>(null);
  const [player2Character, setPlayer2Character] = useState<any>(null);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load battle data
  const loadBattle = async () => {
    if (!battleId) return;

    try {
      setRefreshing(true);
      const battleData = await readBattle(battleId);

      if (!battleData) {
        showNotification({
          type: 'error',
          title: 'Battle Not Found',
          message: 'This battle does not exist',
        });
        navigate('/dashboard');
        return;
      }

      setBattle(battleData);

      // Load character data
      const char1 = await readCharacter(battleData.player1.characterId);
      const char2 = await readCharacter(battleData.player2.characterId);

      setPlayer1Character(char1);
      setPlayer2Character(char2);

      // Check if it's your turn
      if (currentCharacter) {
        const currentTurn = Number(battleData.currentTurn);
        const isPlayer1 = battleData.player1.characterId === currentCharacter.id;
        const isPlayer2 = battleData.player2.characterId === currentCharacter.id;

        // Turn alternates: even turns = player1, odd turns = player2
        const isPlayer1Turn = currentTurn % 2 === 0;
        setIsYourTurn((isPlayer1 && isPlayer1Turn) || (isPlayer2 && !isPlayer1Turn));
      }
    } catch (error) {
      console.error('Failed to load battle:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBattle();
  }, [battleId]);

  const handleExecuteTurn = async (stance: number, useSkill: boolean, skillSlot: number) => {
    if (!battle || !currentCharacter) return;

    try {
      await executeTurn(battle.id, currentCharacter.id, stance, useSkill, skillSlot);

      showNotification({
        type: 'success',
        title: 'Turn Executed!',
        message: 'Your turn has been executed successfully',
      });

      // Reload battle state
      setTimeout(() => loadBattle(), 2000);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Turn Failed',
        message: error instanceof Error ? error.message : 'Failed to execute turn',
      });
    }
  };

  const handleFinalizeBattle = async () => {
    if (!battle) return;

    try {
      await finalizeBattle(battle.id);

      showNotification({
        type: 'success',
        title: 'Battle Finalized!',
        message: `Winner: ${battle.winner}`,
      });

      navigate('/dashboard');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Finalization Failed',
        message: error instanceof Error ? error.message : 'Failed to finalize battle',
      });
    }
  };

  if (!isConnected || !currentCharacter) {
    navigate('/dashboard');
    return null;
  }

  if (!battle || !player1Character || !player2Character) {
    return <Loading message="Loading battle arena..." />;
  }

  const isCompleted = battle.state === BigInt(3); // BATTLE_STATE_COMPLETED
  const player1HP = Number(battle.player1.hp);
  const player2HP = Number(battle.player2.hp);

  return (
    <div className="min-h-screen py-4 px-2">
      <div className="container mx-auto max-w-7xl">
        {/* Battle Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-display font-bold text-glow mb-2">
            ⚔️ BATTLE ARENA ⚔️
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-ue-text-secondary">
            <span>Round {Number(battle.currentTurn) + 1}</span>
            <span>•</span>
            <span className={`badge ${isCompleted ? 'badge-error' : 'badge-success'}`}>
              {isCompleted ? 'COMPLETED' : 'ACTIVE'}
            </span>
            <span>•</span>
            <button
              onClick={loadBattle}
              disabled={refreshing}
              className="text-ue-primary hover:text-ue-primary-dark transition-colors"
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Main Battle Arena - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* LEFT PANEL - Player 1 */}
          <div className="lg:col-span-3">
            <PlayerStatus
              player={battle.player1}
              characterName={player1Character.name}
              characterClass={player1Character.characterClass}
              isYourTurn={isYourTurn && !isCompleted && battle.player1.characterId === currentCharacter.id}
            />
          </div>

          {/* CENTER - Battle Field */}
          <div className="lg:col-span-6 space-y-4">
            {/* Battle Visualization */}
            <Card className="relative overflow-hidden" glow>
              {/* Background Effect */}
              <div className="absolute inset-0 cyber-grid opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-radial from-ue-primary/10 via-transparent to-transparent animate-pulse-slow"></div>

              {/* VS Display */}
              <div className="relative z-10 py-8">
                <div className="flex items-center justify-between px-8">
                  {/* Player 1 Visual */}
                  <div className="text-center flex-1">
                    <div
                      className={`text-8xl mb-2 transition-transform ${
                        player1HP === 0 ? 'opacity-30 grayscale' : 'animate-float'
                      }`}
                    >
                      ⚔️
                    </div>
                    <div className="text-xl font-display font-bold text-ue-primary">
                      {player1Character.name}
                    </div>
                    <div className="text-sm text-ue-text-muted">
                      Combo: {Number(battle.player1.combo)}x
                    </div>
                  </div>

                  {/* VS Badge */}
                  <div className="flex-shrink-0 mx-8">
                    <div className="relative">
                      <div className="text-6xl font-display font-bold text-glow animate-pulse">
                        VS
                      </div>
                      {/* Turn Indicator */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="text-xs font-bold text-ue-warning">
                          TURN {Number(battle.currentTurn) + 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 Visual */}
                  <div className="text-center flex-1">
                    <div
                      className={`text-8xl mb-2 transition-transform ${
                        player2HP === 0 ? 'opacity-30 grayscale' : 'animate-float'
                      }`}
                      style={{ animationDelay: '1s' }}
                    >
                      🗡️
                    </div>
                    <div className="text-xl font-display font-bold text-ue-error">
                      {player2Character.name}
                    </div>
                    <div className="text-sm text-ue-text-muted">
                      Combo: {Number(battle.player2.combo)}x
                    </div>
                  </div>
                </div>

                {/* HP Comparison */}
                <div className="mt-8 px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill-hp"
                          style={{
                            width: `${(player1HP / Number(battle.player1.maxHp)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-ue-text-muted">VS</span>
                    <div className="flex-1">
                      <div className="stat-bar">
                        <div
                          className="stat-bar-fill-hp"
                          style={{
                            width: `${(player2HP / Number(battle.player2.maxHp)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner Announcement */}
              {isCompleted && (
                <div className="absolute inset-0 bg-ue-bg-overlay flex items-center justify-center z-20">
                  <div className="text-center animate-slide-up">
                    <div className="text-6xl mb-4">🏆</div>
                    <h2 className="text-5xl font-display font-bold text-glow mb-4">
                      WINNER!
                    </h2>
                    <p className="text-2xl text-ue-primary mb-6">
                      {battle.winner === battle.player1.characterId
                        ? player1Character.name
                        : player2Character.name}
                    </p>
                    <Button size="lg" onClick={handleFinalizeBattle} loading={battleLoading}>
                      FINALIZE BATTLE
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Turn Controls or Waiting */}
            {!isCompleted && (
              <>
                {isYourTurn ? (
                  <TurnControls
                    player={
                      battle.player1.characterId === currentCharacter.id
                        ? battle.player1
                        : battle.player2
                    }
                    onExecuteTurn={handleExecuteTurn}
                    loading={battleLoading}
                  />
                ) : (
                  <Card className="text-center py-8">
                    <div className="text-4xl mb-4 animate-pulse">⏳</div>
                    <p className="text-xl font-display font-bold text-ue-text-secondary">
                      Waiting for opponent's turn...
                    </p>
                    <p className="text-sm text-ue-text-muted mt-2">
                      Refresh to see updates
                    </p>
                  </Card>
                )}
              </>
            )}

            {/* Battle Log */}
            <BattleLog log={battle.battleLog} />
          </div>

          {/* RIGHT PANEL - Player 2 */}
          <div className="lg:col-span-3">
            <PlayerStatus
              player={battle.player2}
              characterName={player2Character.name}
              characterClass={player2Character.characterClass}
              isOpponent
              isYourTurn={isYourTurn && !isCompleted && battle.player2.characterId === currentCharacter.id}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Hub
          </Button>
          {isCompleted && (
            <Button onClick={handleFinalizeBattle} loading={battleLoading}>
              Finalize & Claim Rewards
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
