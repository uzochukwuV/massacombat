import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Stance, STANCE_NAMES, STANCE_DESCRIPTIONS } from '@/types/battle';
import { Sword, Shield, Zap } from 'lucide-react';

interface StanceSelectorProps {
  onCommit: (stance: Stance) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const STANCE_ICONS = {
  [Stance.Aggressive]: Sword,
  [Stance.Defensive]: Shield,
  [Stance.Counter]: Zap
};

const STANCE_COLORS = {
  [Stance.Aggressive]: 'text-red-400',
  [Stance.Defensive]: 'text-blue-400',
  [Stance.Counter]: 'text-purple-400'
};

const STANCE_GLOW = {
  [Stance.Aggressive]: 'shadow-neon-pink',
  [Stance.Defensive]: 'shadow-neon-blue',
  [Stance.Counter]: 'shadow-neon-purple'
};

export function StanceSelector({ onCommit, isLoading, disabled }: StanceSelectorProps) {
  const [selectedStance, setSelectedStance] = useState<Stance>(Stance.Aggressive);

  const handleCommit = () => {
    onCommit(selectedStance);
  };

  const availableStances = [Stance.Aggressive, Stance.Defensive, Stance.Counter];

  return (
    <div className="ue-card p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-heading font-black text-white tracking-wider mb-2">
          <span className="ue-glow-text">CHOOSE YOUR STANCE</span>
        </h3>
        <p className="text-foreground/70 text-sm">
          Select your combat stance for this turn. Your choice is hidden until both players commit.
        </p>
      </div>
      
      <div className="space-y-6">
        <RadioGroup 
          value={selectedStance.toString()} 
          onValueChange={(v) => setSelectedStance(parseInt(v) as Stance)}
          disabled={disabled}
        >
          <div className="grid gap-4">
            {availableStances.map((stance) => {
              const Icon = STANCE_ICONS[stance];
              const color = STANCE_COLORS[stance];
              const glow = STANCE_GLOW[stance];
              const isSelected = selectedStance === stance;
              
              return (
                <div key={stance} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={stance.toString()} 
                    id={`stance-${stance}`}
                    className="border-neon-cyan data-[state=checked]:bg-neon-cyan data-[state=checked]:text-dark-900"
                  />
                  <Label 
                    htmlFor={`stance-${stance}`}
                    className={`flex items-center gap-4 flex-1 cursor-pointer p-4 rounded-lg transition-all ${
                      isSelected 
                        ? `ue-card ${glow} scale-105` 
                        : 'ue-card opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`p-3 rounded-lg bg-dark-700/50 border border-current ${color}`}>
                      <Icon className={`w-8 h-8 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-heading font-bold text-lg text-white tracking-wider uppercase">
                        {STANCE_NAMES[stance]}
                      </div>
                      <div className="text-sm text-foreground/70">{STANCE_DESCRIPTIONS[stance]}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <div className="ue-card p-4 bg-dark-700/50 space-y-3">
          <p className="font-heading font-bold text-white tracking-wider uppercase text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-cyan" />
            Combat System
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 rounded bg-dark-800/50">
              <Sword className="w-4 h-4 text-red-400" />
              <span className="text-foreground/80">
                <span className="text-red-400 font-bold">Aggressive</span> beats <span className="text-blue-400 font-bold">Defensive</span>
                <span className="text-neon-cyan ml-2">(+50% damage)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-dark-800/50">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-foreground/80">
                <span className="text-blue-400 font-bold">Defensive</span> beats <span className="text-purple-400 font-bold">Counter</span>
                <span className="text-neon-cyan ml-2">(+50% damage)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-dark-800/50">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-foreground/80">
                <span className="text-purple-400 font-bold">Counter</span> beats <span className="text-red-400 font-bold">Aggressive</span>
                <span className="text-neon-cyan ml-2">(+50% damage)</span>
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleCommit} 
          disabled={isLoading || disabled}
          className="ue-button w-full rounded-lg py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'COMMITTING...' : 'COMMIT STANCE'}
        </button>
      </div>
    </div>
  );
}
