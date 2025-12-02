import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MassaCharacter, CLASS_NAMES, CharacterClass } from '@/types/massa-character';
import { Sword, Shield, Heart, Zap, Target } from 'lucide-react';

interface CharacterCardProps {
  character: MassaCharacter;
  onClick?: () => void;
  selected?: boolean;
}

const CLASS_ICONS: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: '/warrior-icon.jpg',
  [CharacterClass.Assassin]: '/assassin-icon.jpg',
  [CharacterClass.Mage]: '/mage-icon.jpg',
  [CharacterClass.Tank]: '/tank-icon.jpg',
  [CharacterClass.Trickster]: '/trickster-icon.jpg'
};

const CLASS_COLORS: Record<CharacterClass, string> = {
  [CharacterClass.Warrior]: 'class-warrior',
  [CharacterClass.Assassin]: 'class-assassin',
  [CharacterClass.Mage]: 'class-mage',
  [CharacterClass.Tank]: 'class-tank',
  [CharacterClass.Trickster]: 'class-trickster'
};

export function CharacterCard({ character, onClick, selected }: CharacterCardProps) {
  const className = CLASS_NAMES[character.characterClass];
  const classColor = CLASS_COLORS[character.characterClass];
  const classIcon = CLASS_ICONS[character.characterClass];
  
  const xpForNextLevel = 100 * Math.pow(Number(character.level) + 1, 2);
  const xpProgress = (Number(character.xp) / xpForNextLevel) * 100;

  return (
    <div 
      className={`ue-card cursor-pointer transition-all duration-300 ${classColor} ${
        selected ? 'ring-2 ring-neon-cyan scale-105' : ''
      } hover:scale-105`}
      onClick={onClick}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={classIcon} 
                alt={className}
                className="w-14 h-14 rounded-lg object-cover border-2 border-neon-cyan/50"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-transparent" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white tracking-wider">
                {character.name}
              </h3>
              <p className="text-sm text-neon-cyan uppercase tracking-widest">{className}</p>
            </div>
          </div>
          <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 font-bold px-3 py-1">
            LVL {character.level}
          </Badge>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="ue-card p-3 bg-dark-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-foreground/60 uppercase tracking-wider">Health</span>
            </div>
            <div className="text-lg font-bold text-white">{character.maxHp}</div>
          </div>
          
          <div className="ue-card p-3 bg-dark-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Sword className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-foreground/60 uppercase tracking-wider">Damage</span>
            </div>
            <div className="text-lg font-bold text-white">{character.damageMin}-{character.damageMax}</div>
          </div>
          
          <div className="ue-card p-3 bg-dark-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-foreground/60 uppercase tracking-wider">Critical</span>
            </div>
            <div className="text-lg font-bold text-white">{character.critChance}%</div>
          </div>
          
          <div className="ue-card p-3 bg-dark-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-foreground/60 uppercase tracking-wider">Dodge</span>
            </div>
            <div className="text-lg font-bold text-white">{character.dodgeChance}%</div>
          </div>
        </div>

        {/* MMR */}
        <div className="ue-card p-3 bg-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-purple" />
              <span className="text-xs text-foreground/60 uppercase tracking-wider">MMR Rating</span>
            </div>
            <span className="text-lg font-bold text-neon-purple">{String(character.mmr)}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60 uppercase tracking-wider">
            <span>Experience</span>
            <span>{String(character.xp)} / {xpForNextLevel}</span>
          </div>
          <div className="ue-stat-bar">
            <div 
              className="ue-stat-bar-fill" 
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
