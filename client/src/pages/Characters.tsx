import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';
import { MassaCharacter, CharacterClass, CLASS_NAMES, SKILL_NAMES } from '@/types/massa-character';
import { Heart, Sword, Shield, Target, Zap, Plus, ArrowUp } from 'lucide-react';

export default function Characters() {
  const { isConnected, userAddress, provider } = useWallet();
  const { readCharacter, healCharacter, upgradeCharacter, learnSkill, loading } = useGame(isConnected, provider, userAddress || '');
  const [characters, setCharacters] = useState<MassaCharacter[]>([]);
  const [selectedChar, setSelectedChar] = useState<MassaCharacter | null>(null);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      if (isConnected && userAddress) {
        const storedCharIds = localStorage.getItem(`characters_${userAddress}`);
        if (storedCharIds) {
          const charIds = JSON.parse(storedCharIds);
          const loadedChars = [];
          for (const charId of charIds) {
            try {
              const char = await readCharacter(charId);
              if (char) loadedChars.push(char);
            } catch (err) {
              console.error('Failed to load character:', charId);
            }
          }
          setCharacters(loadedChars);
          if (loadedChars.length > 0) setSelectedChar(loadedChars[0]);
        }
      }
    };
    loadCharacters();
  }, [isConnected, userAddress, readCharacter]);

  const handleHeal = async () => {
    if (!selectedChar) return;
    try {
      await healCharacter(selectedChar.id);
      // Refresh character data
      const updated = await readCharacter(selectedChar.id);
      if (updated) {
        setSelectedChar(updated);
        setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (err) {
      console.error('Heal failed:', err);
    }
  };

  const handleUpgrade = async (upgradeType: number) => {
    if (!selectedChar) return;
    try {
      await upgradeCharacter(selectedChar.id, upgradeType);
      // Refresh character data
      const updated = await readCharacter(selectedChar.id);
      if (updated) {
        setSelectedChar(updated);
        setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    }
  };

  const handleLearnSkill = async (skillId: number) => {
    if (!selectedChar) return;
    try {
      await learnSkill(selectedChar.id, skillId);
      // Refresh character data
      const updated = await readCharacter(selectedChar.id);
      if (updated) {
        setSelectedChar(updated);
        setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (err) {
      console.error('Learn skill failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Connect Wallet</h1>
          <p className="text-foreground/60">Please connect your wallet to manage characters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-heading font-black text-white mb-8">CHARACTER MANAGEMENT</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character List */}
          <div className="ue-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Characters</h2>
            <div className="space-y-3">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedChar?.id === char.id ? 'bg-neon-cyan/20' : 'bg-dark-700/50 hover:bg-dark-600/50'
                  }`}
                  onClick={() => setSelectedChar(char)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-bold">{char.name}</h3>
                      <p className="text-sm text-foreground/60">{CLASS_NAMES[char.characterClass]} Lv.{char.level}</p>
                    </div>
                    <Badge className="bg-neon-cyan/20 text-neon-cyan">
                      {char.hp}/{char.maxHp} HP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Character Details */}
          {selectedChar && (
            <>
              <div className="ue-card p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedChar.name}</h2>
                    <p className="text-neon-cyan">{CLASS_NAMES[selectedChar.characterClass]} Level {selectedChar.level}</p>
                  </div>
                  <Button onClick={handleHeal} disabled={loading || Number(selectedChar.hp) === Number(selectedChar.maxHp)}>
                    <Heart className="w-4 h-4 mr-2" />
                    Heal
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dark-700/50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-foreground/60">Health</span>
                    </div>
                    <div className="text-lg font-bold text-white">{Number(selectedChar.hp)}/{Number(selectedChar.maxHp)}</div>
                    <Progress value={(Number(selectedChar.hp) / Number(selectedChar.maxHp)) * 100} className="mt-2" />
                  </div>
                  
                  <div className="bg-dark-700/50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-foreground/60">Damage</span>
                    </div>
                    <div className="text-lg font-bold text-white">{Number(selectedChar.damageMin)}-{Number(selectedChar.damageMax)}</div>
                  </div>

                  <div className="bg-dark-700/50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-foreground/60">Critical</span>
                    </div>
                    <div className="text-lg font-bold text-white">{Number(selectedChar.critChance)}%</div>
                  </div>

                  <div className="bg-dark-700/50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-foreground/60">Dodge</span>
                    </div>
                    <div className="text-lg font-bold text-white">{Number(selectedChar.dodgeChance)}%</div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-foreground/60 mb-2">
                    <span>Experience</span>
                    <span>{Number(selectedChar.xp)} / {Number(selectedChar.level) * 100} XP</span>
                  </div>
                  <Progress value={(Number(selectedChar.xp) / (Number(selectedChar.level) * 100)) * 100} />
                </div>

                {/* Battle Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-neon-cyan">{Number(selectedChar.totalWins)}</div>
                    <div className="text-xs text-foreground/60">WINS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{Number(selectedChar.totalLosses)}</div>
                    <div className="text-xs text-foreground/60">LOSSES</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neon-purple">{Number(selectedChar.mmr)}</div>
                    <div className="text-xs text-foreground/60">MMR</div>
                  </div>
                </div>
              </div>

              {/* Upgrades & Skills */}
              <div className="space-y-6">
                {/* Upgrades */}
                <Card className="bg-dark-800 border-neon-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white">Upgrades</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => handleUpgrade(0)} 
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade HP (+10)
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade(1)} 
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade Damage (+1-2)
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade(2)} 
                      disabled={loading || Number(selectedChar.critChance) >= 50}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade Crit (+2%)
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade(3)} 
                      disabled={loading || Number(selectedChar.dodgeChance) >= 40}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade Dodge (+2%)
                    </Button>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="bg-dark-800 border-neon-cyan/30">
                  <CardHeader>
                    <CardTitle className="text-white">Learn Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map(skillId => {
                      const hasSkill = (Number(selectedChar.learnedSkills) & (1 << (skillId - 1))) !== 0;
                      return (
                        <Button
                          key={skillId}
                          onClick={() => handleLearnSkill(skillId)}
                          disabled={loading || hasSkill}
                          className="w-full justify-start"
                          variant={hasSkill ? "default" : "outline"}
                        >
                          {hasSkill ? "✓" : <Plus className="w-4 h-4 mr-2" />}
                          {SKILL_NAMES[skillId] || `Skill ${skillId}`}
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}