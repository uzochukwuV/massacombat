import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CLASS_NAMES } from '@/utils/constants';

export function Dashboard() {
  const { currentCharacter } = useGame();
  const navigate = useNavigate();

  if (!currentCharacter) {
    navigate('/character-select');
    return null;
  }

  const winRate = currentCharacter.totalWins + currentCharacter.totalLosses > 0
    ? Math.round((currentCharacter.totalWins / (currentCharacter.totalWins + currentCharacter.totalLosses)) * 100)
    : 0;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-display font-bold text-glow mb-8">
          ⚔️ FIGHTER HUB
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Character Card */}
          <Card glow className="md:col-span-2">
            <div className="flex items-start gap-6">
              <div className="text-6xl">⚔️</div>
              <div className="flex-1">
                <h2 className="text-3xl font-display font-bold text-ue-primary mb-2">
                  {currentCharacter.name}
                </h2>
                <p className="text-ue-text-secondary mb-4">
                  {CLASS_NAMES[currentCharacter.characterClass]} • Level {currentCharacter.level}
                </p>

                {/* HP Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span>{currentCharacter.hp}/{currentCharacter.maxHp}</span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill-hp"
                      style={{ width: `${(currentCharacter.hp / currentCharacter.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* XP Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP</span>
                    <span>{Number(currentCharacter.xp)}/100</span>
                  </div>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill"
                      style={{ width: `${(Number(currentCharacter.xp) / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Card */}
          <Card>
            <h3 className="text-xl font-display font-bold text-ue-primary mb-4">
              Combat Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ue-text-secondary">Wins</span>
                <span className="text-ue-success font-bold">{currentCharacter.totalWins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ue-text-secondary">Losses</span>
                <span className="text-ue-error font-bold">{currentCharacter.totalLosses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ue-text-secondary">Win Rate</span>
                <span className="text-ue-primary font-bold">{winRate}%</span>
              </div>
              <div className="divider"></div>
              <div className="flex justify-between">
                <span className="text-ue-text-secondary">MMR</span>
                <span className="text-ue-warning font-bold">{currentCharacter.mmr}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '⚔️', label: 'Battle', path: '/battle', color: 'text-ue-error' },
            { icon: '🎽', label: 'Equipment', path: '/equipment', color: 'text-ue-warning' },
            { icon: '📚', label: 'Skills', path: '/skills', color: 'text-ue-primary' },
            { icon: '🏆', label: 'Tournament', path: '/tournament', color: 'text-ue-accent' },
            { icon: '📊', label: 'Leaderboard', path: '/leaderboard', color: 'text-ue-success' },
            { icon: '🎖️', label: 'Achievements', path: '/achievements', color: 'text-ue-secondary' },
          ].map((action) => (
            <Card
              key={action.path}
              onClick={() => navigate(action.path)}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="text-center py-6">
                <div className={`text-5xl mb-3 ${action.color}`}>{action.icon}</div>
                <h3 className="font-display font-bold text-lg">{action.label}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
