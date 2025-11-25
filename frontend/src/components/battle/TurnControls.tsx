import { useState } from 'react';
import { BattlePlayer } from '@/hooks/useBattle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { STANCE_NAMES, SKILL_NAMES, SKILL_INFO } from '@/utils/constants';

interface TurnControlsProps {
  player: BattlePlayer;
  onExecuteTurn: (stance: number, useSkill: boolean, skillSlot: number) => Promise<void>;
  loading: boolean;
}

export function TurnControls({ player, onExecuteTurn, loading }: TurnControlsProps) {
  const [selectedStance, setSelectedStance] = useState(1); // Normal
  const [selectedSkillSlot, setSelectedSkillSlot] = useState<number>(0);

  const handleExecute = async () => {
    await onExecuteTurn(selectedStance, selectedSkillSlot > 0, selectedSkillSlot);
  };

  const skills = [
    { slot: 1, id: Number(player.skillSlot1) },
    { slot: 2, id: Number(player.skillSlot2) },
    { slot: 3, id: Number(player.skillSlot3) },
  ].filter((s) => s.id > 0);

  return (
    <Card glow className="animate-pulse-slow">
      <h3 className="text-2xl font-display font-bold text-ue-primary mb-4 text-center">
        ⚡ YOUR TURN ⚡
      </h3>

      {/* Stance Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-ue-text-secondary mb-3">
          BATTLE STANCE
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((stance) => (
            <button
              key={stance}
              onClick={() => setSelectedStance(stance)}
              className={`p-3 rounded-none font-display font-bold text-sm uppercase transition-all ${
                selectedStance === stance
                  ? 'bg-ue-primary text-ue-bg-dark shadow-neon'
                  : 'bg-ue-bg-dark text-ue-text-secondary border border-ue-border hover:border-ue-primary'
              }`}
            >
              {STANCE_NAMES[stance]}
            </button>
          ))}
        </div>
        <p className="text-xs text-ue-text-muted mt-2">
          {selectedStance === 0 && '🛡️ +50% Dodge, -25% Damage'}
          {selectedStance === 1 && '⚖️ Balanced stats'}
          {selectedStance === 2 && '⚔️ +50% Damage, -50% Dodge'}
        </p>
      </div>

      {/* Skill Selection */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-ue-text-secondary mb-3">
          USE SKILL (OPTIONAL)
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedSkillSlot(0)}
            className={`w-full p-3 rounded-none font-display font-bold text-sm transition-all ${
              selectedSkillSlot === 0
                ? 'bg-ue-primary text-ue-bg-dark'
                : 'bg-ue-bg-dark text-ue-text-secondary border border-ue-border hover:border-ue-primary'
            }`}
          >
            BASIC ATTACK (No Skill)
          </button>

          {skills.map((skill) => {
            const skillInfo = SKILL_INFO[skill.id];
            const cooldown = Number(player.skillCooldowns[skill.id - 1] || 0);
            const energy = Number(player.energy);
            const canUse = cooldown === 0 && energy >= skillInfo.cost;

            return (
              <button
                key={skill.slot}
                onClick={() => canUse && setSelectedSkillSlot(skill.slot)}
                disabled={!canUse}
                className={`w-full p-3 rounded-none text-left transition-all ${
                  selectedSkillSlot === skill.slot
                    ? 'bg-ue-accent text-white shadow-neon'
                    : canUse
                    ? 'bg-ue-bg-dark text-ue-text-primary border border-ue-border hover:border-ue-accent'
                    : 'bg-ue-bg-dark/50 text-ue-text-muted border border-ue-border opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-display font-bold text-sm">
                      [{skill.slot}] {skillInfo.name}
                    </div>
                    <div className="text-xs opacity-80">{skillInfo.desc}</div>
                  </div>
                  <div className="text-right text-xs">
                    {cooldown > 0 ? (
                      <span className="text-ue-error">CD: {cooldown}</span>
                    ) : energy < skillInfo.cost ? (
                      <span className="text-ue-warning">
                        Need {skillInfo.cost - energy} energy
                      </span>
                    ) : (
                      <span className="text-ue-success">✓ READY</span>
                    )}
                    <div className="text-ue-warning">⚡{skillInfo.cost}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execute Button */}
      <Button
        size="lg"
        onClick={handleExecute}
        loading={loading}
        className="w-full text-xl py-4 animate-glow"
      >
        {loading ? 'EXECUTING...' : '⚔️ EXECUTE TURN ⚔️'}
      </Button>

      <p className="text-center text-xs text-ue-text-muted mt-3">
        Energy regenerates +20 per turn
      </p>
    </Card>
  );
}
