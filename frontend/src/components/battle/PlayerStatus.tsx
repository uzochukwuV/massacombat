import { BattlePlayer } from '@/hooks/useBattle';
import { CLASS_NAMES, STATUS_NAMES } from '@/utils/constants';
import { Card } from '@/components/ui/Card';

interface PlayerStatusProps {
  player: BattlePlayer;
  characterName: string;
  characterClass: number;
  isOpponent?: boolean;
  isYourTurn?: boolean;
}

export function PlayerStatus({
  player,
  characterName,
  characterClass,
  isOpponent,
  isYourTurn,
}: PlayerStatusProps) {
  const hpPercent = (Number(player.hp) / Number(player.maxHp)) * 100;
  const energyPercent = (Number(player.energy) / 100) * 100;

  // Get active status effects
  const statuses: string[] = [];
  for (let i = 0; i < 5; i++) {
    if ((player.statusEffects & BigInt(1 << i)) !== BigInt(0)) {
      statuses.push(STATUS_NAMES[i]);
    }
  }

  const statusIcons: { [key: string]: string } = {
    Poisoned: '☠️',
    Stunned: '💫',
    Shielded: '🛡️',
    Enraged: '🔥',
    Burning: '🔥',
  };

  return (
    <div
      className={`relative ${isOpponent ? 'ml-auto' : ''} ${
        isYourTurn ? 'ring-2 ring-ue-primary animate-pulse-slow' : ''
      }`}
    >
      {/* Turn Indicator */}
      {isYourTurn && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-ue-primary text-ue-bg-dark px-4 py-1 font-display font-bold text-xs uppercase animate-pulse">
            YOUR TURN
          </div>
        </div>
      )}

      <Card
        className={`${
          isOpponent ? 'bg-gradient-to-br from-ue-error/10 to-ue-bg-card' : 'bg-gradient-to-br from-ue-primary/10 to-ue-bg-card'
        }`}
      >
        {/* Character Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-5xl">{isOpponent ? '🗡️' : '⚔️'}</div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-ue-primary">
              {characterName}
            </h3>
            <p className="text-xs text-ue-text-muted">
              {CLASS_NAMES[characterClass]} • Combo: {Number(player.combo)}x
            </p>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ue-text-secondary font-bold">HP</span>
            <span className="text-ue-error font-mono">
              {Number(player.hp)}/{Number(player.maxHp)}
            </span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill-hp"
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ue-text-secondary font-bold">ENERGY</span>
            <span className="text-ue-warning font-mono">{Number(player.energy)}/100</span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-bar-fill-energy"
              style={{ width: `${energyPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-ue-text-muted">DMG</span>
            <span className="text-ue-primary font-bold">
              {Number(player.damageMin)}-{Number(player.damageMax)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ue-text-muted">Crit</span>
            <span className="text-ue-warning font-bold">{Number(player.crit)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ue-text-muted">Dodge</span>
            <span className="text-ue-success font-bold">{Number(player.dodge)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ue-text-muted">Combo</span>
            <span className="text-ue-accent font-bold">{Number(player.combo)}x</span>
          </div>
        </div>

        {/* Status Effects */}
        {statuses.length > 0 && (
          <div className="border-t border-ue-border pt-3">
            <p className="text-xs text-ue-text-muted font-bold mb-2">STATUS EFFECTS</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <div
                  key={status}
                  className="badge badge-warning text-xs px-2 py-1"
                >
                  {statusIcons[status]} {status}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipped Skills */}
        <div className="border-t border-ue-border pt-3 mt-3">
          <p className="text-xs text-ue-text-muted font-bold mb-2">EQUIPPED SKILLS</p>
          <div className="space-y-1">
            {[player.skillSlot1, player.skillSlot2, player.skillSlot3].map((skillId, idx) => {
              if (Number(skillId) === 0) return null;
              const cooldown = Number(player.skillCooldowns[Number(skillId) - 1] || 0);
              return (
                <div
                  key={idx}
                  className={`text-xs flex justify-between items-center px-2 py-1 rounded ${
                    cooldown > 0
                      ? 'bg-ue-bg-dark/50 text-ue-text-muted'
                      : 'bg-ue-primary/10 text-ue-primary'
                  }`}
                >
                  <span>Slot {idx + 1}</span>
                  {cooldown > 0 ? (
                    <span className="text-ue-error">CD: {cooldown}</span>
                  ) : (
                    <span className="text-ue-success">●READY</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
