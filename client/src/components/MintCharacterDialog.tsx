import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CharacterClass, CLASS_NAMES, CLASS_DESCRIPTIONS } from '@/types/massa-character';
import { Plus, Heart, Sword, Target, Zap } from 'lucide-react';

interface MintCharacterDialogProps {
  onMint: (characterClass: CharacterClass) => void;
  isLoading?: boolean;
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

export function MintCharacterDialog({ onMint, isLoading }: MintCharacterDialogProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(CharacterClass.Warrior);
  const [open, setOpen] = useState(false);

  const handleMint = () => {
    onMint(selectedClass);
    setOpen(false);
  };

  // Base stats for display (these will be set by the smart contract)
  const getClassStats = (classType: CharacterClass) => {
    switch (classType) {
      case CharacterClass.Warrior: return { hp: 120, dmgMin: 12, dmgMax: 18, crit: 12, dodge: 5 };
      case CharacterClass.Assassin: return { hp: 80, dmgMin: 15, dmgMax: 25, crit: 25, dodge: 15 };
      case CharacterClass.Mage: return { hp: 90, dmgMin: 10, dmgMax: 22, crit: 15, dodge: 8 };
      case CharacterClass.Tank: return { hp: 180, dmgMin: 8, dmgMax: 12, crit: 5, dodge: 3 };
      case CharacterClass.Trickster: return { hp: 100, dmgMin: 10, dmgMax: 16, crit: 15, dodge: 12 };
      default: return { hp: 100, dmgMin: 10, dmgMax: 15, crit: 10, dodge: 5 };
    }
  };
  const stats = getClassStats(selectedClass);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="ue-button rounded-lg">
          <Plus className="w-5 h-5 inline-block mr-2" />
          Mint Warrior
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl bg-dark-800 border-neon-cyan/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black text-white tracking-wider">
            <span className="ue-glow-text">MINT NEW WARRIOR</span>
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Select your character class. Each class has unique combat stats and abilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup 
            value={selectedClass.toString()} 
            onValueChange={(value) => setSelectedClass(parseInt(value) as CharacterClass)}
          >
            <div className="grid gap-4">
              {Object.values(CharacterClass).filter(v => typeof v === 'number').map((classType) => {
                const classNum = classType as CharacterClass;
                const classStats = getClassStats(classNum);
                const isSelected = selectedClass === classNum;
                
                return (
                  <div key={classNum} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={classNum.toString()} 
                      id={`class-${classNum}`}
                      className="border-neon-cyan data-[state=checked]:bg-neon-cyan data-[state=checked]:text-dark-900"
                    />
                    <Label 
                      htmlFor={`class-${classNum}`}
                      className={`flex items-center gap-4 flex-1 cursor-pointer p-4 rounded-lg transition-all ${
                        isSelected 
                          ? `ue-card ${CLASS_COLORS[classNum]} scale-105` 
                          : 'ue-card opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={CLASS_ICONS[classNum]} 
                          alt={CLASS_NAMES[classNum]}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-neon-cyan/50"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg bg-neon-cyan/20 animate-glow-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-heading font-bold text-lg text-white tracking-wider uppercase">
                          {CLASS_NAMES[classNum]}
                        </div>
                        <div className="text-sm text-foreground/70 mb-2">{CLASS_DESCRIPTIONS[classNum]}</div>
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            <span className="text-foreground/60">{classStats.hp}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Sword className="w-3 h-3 text-orange-400" />
                            <span className="text-foreground/60">{classStats.dmgMin}-{classStats.dmgMax}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-yellow-400" />
                            <span className="text-foreground/60">{classStats.crit}%</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-blue-400" />
                            <span className="text-foreground/60">{classStats.dodge}%</span>
                          </span>
                        </div>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {/* Selected Class Preview */}
          <div className="ue-card p-5 bg-dark-700/50">
            <h3 className="font-heading font-bold text-white mb-4 tracking-wider uppercase">
              Selected: <span className="text-neon-cyan">{CLASS_NAMES[selectedClass]}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="ue-card p-3 bg-dark-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-foreground/60 uppercase tracking-wider">Health</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.hp}</div>
              </div>
              <div className="ue-card p-3 bg-dark-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sword className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-foreground/60 uppercase tracking-wider">Damage</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.dmgMin}-{stats.dmgMax}</div>
              </div>
              <div className="ue-card p-3 bg-dark-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-foreground/60 uppercase tracking-wider">Critical</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.crit}%</div>
              </div>
              <div className="ue-card p-3 bg-dark-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-foreground/60 uppercase tracking-wider">Dodge</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.dodge}%</div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleMint} 
            disabled={isLoading}
            className="ue-button w-full rounded-lg py-4 text-lg"
          >
            {isLoading ? 'MINTING...' : 'MINT WARRIOR'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
