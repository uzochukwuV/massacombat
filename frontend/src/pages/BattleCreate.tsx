import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useBattle } from '@/hooks/useBattle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function BattleCreate() {
  const navigate = useNavigate();
  const { isConnected, provider, contractAddress, userAddress, currentCharacter, showNotification } = useGame();
  const { createBattle, loading } = useBattle(contractAddress, isConnected, provider, userAddress);

  const [opponentId, setOpponentId] = useState('');
  const [battleId, setBattleId] = useState('');

  const handleCreate = async () => {
    if (!currentCharacter || !battleId.trim() || !opponentId.trim()) {
      showNotification({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please fill in all fields',
      });
      return;
    }

    try {
      await createBattle(battleId, currentCharacter.id, opponentId);

      showNotification({
        type: 'success',
        title: 'Battle Created!',
        message: 'Your battle has been created',
      });

      navigate(`/battle/${battleId}`);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create battle',
      });
    }
  };

  if (!isConnected || !currentCharacter) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-display font-bold text-glow mb-8 text-center">
          ⚔️ CREATE BATTLE
        </h1>

        <Card glow>
          <div className="space-y-6">
            {/* Your Character */}
            <div>
              <label className="block text-sm font-bold text-ue-text-secondary mb-2">
                YOUR CHARACTER
              </label>
              <div className="p-4 bg-ue-bg-dark rounded">
                <p className="text-lg font-bold text-ue-primary">{currentCharacter.name}</p>
                <p className="text-sm text-ue-text-muted">
                  Level {currentCharacter.level} | HP: {currentCharacter.hp}/{currentCharacter.maxHp}
                </p>
              </div>
            </div>

            {/* Battle ID */}
            <div>
              <label className="block text-sm font-bold text-ue-text-secondary mb-2">
                BATTLE ID
              </label>
              <input
                type="text"
                value={battleId}
                onChange={(e) => setBattleId(e.target.value)}
                placeholder="Enter unique battle ID..."
                className="input-cyber"
              />
              <p className="text-xs text-ue-text-muted mt-1">
                E.g., battle_123, arena_pvp_001
              </p>
            </div>

            {/* Opponent Character ID */}
            <div>
              <label className="block text-sm font-bold text-ue-text-secondary mb-2">
                OPPONENT CHARACTER ID
              </label>
              <input
                type="text"
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
                placeholder="Enter opponent's character ID..."
                className="input-cyber"
              />
              <p className="text-xs text-ue-text-muted mt-1">
                Ask your opponent for their character ID
              </p>
            </div>

            {/* Fee Info */}
            <div className="p-4 bg-ue-primary/10 border border-ue-primary rounded">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ue-text-secondary">Battle Creation Fee:</span>
                <span className="text-ue-warning font-bold">0.5 MAS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ue-text-secondary">Turn Execution Fee:</span>
                <span className="text-ue-text-muted">0.2 MAS per turn</span>
              </div>
            </div>

            {/* Create Button */}
            <Button
              size="lg"
              onClick={handleCreate}
              loading={loading}
              disabled={!battleId.trim() || !opponentId.trim()}
              className="w-full"
            >
              CREATE BATTLE (0.5 MAS)
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 space-y-2">
          <h3 className="text-sm font-bold text-ue-text-secondary">TIPS:</h3>
          <ul className="text-sm text-ue-text-muted space-y-1">
            <li>• Make sure both characters have enough HP to battle</li>
            <li>• You'll need MAS for each turn execution (0.2 MAS per turn)</li>
            <li>• Turns alternate between players automatically</li>
            <li>• Energy regenerates +20 per turn</li>
            <li>• Battle ends when one fighter reaches 0 HP</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
