import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';
import { MassaCharacter, Battle as BattleType, CLASS_NAMES, SKILL_NAMES } from '@/types/massa-character';
import { Sword, Shield, Target, Users, Clock, Trophy, Zap, Heart, Flame, Eye, Wind } from 'lucide-react';

const WILDCARD_TYPES = {
  1: { name: 'Health Swap', icon: Heart, desc: 'Swap HP with opponent' },
  2: { name: 'Energy Boost', icon: Zap, desc: '+30/60 energy to both players' },
  3: { name: 'Healing Wave', icon: Heart, desc: '+20/40 HP to both players' },
  4: { name: 'Status Clear', icon: Shield, desc: 'Remove all status effects' },
  5: { name: 'Chaos Damage', icon: Flame, desc: '15/30 damage to both players' }
};

const SKILL_ICONS = {
  1: Sword, 2: Heart, 3: Flame, 4: Clock, 5: Shield,
  6: Flame, 7: Eye, 8: Wind, 9: Flame, 10: Target
};

export default function BattleArena() {
  const { isConnected, userAddress, provider } = useWallet();
  const { readCharacter, createBattle, executeTurn, readBattle, loading } = useGame(isConnected, provider, userAddress || '');
  const [characters, setCharacters] = useState<MassaCharacter[]>([]);
  const [selectedChar, setSelectedChar] = useState<MassaCharacter | null>(null);
  const [opponentCharId, setOpponentCharId] = useState('');
  const [activeBattles, setActiveBattles] = useState<BattleType[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<BattleType | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Load characters and battles
  useEffect(() => {
    const loadData = async () => {
      if (isConnected && userAddress) {
        // Load characters
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

        // Load battles
        const storedBattles = localStorage.getItem(`battles_${userAddress}`);
        if (storedBattles) {
          const battleIds = JSON.parse(storedBattles);
          const loadedBattles = [];
          for (const battleId of battleIds) {
            try {
              const battle = await readBattle(battleId);
              if (battle) loadedBattles.push(battle);
            } catch (err) {
              console.error('Failed to load battle:', battleId);
            }
          }
          setActiveBattles(loadedBattles);
        }
      }
    };
    loadData();
  }, [isConnected, userAddress, readCharacter, readBattle]);

  const handleCreateBattle = async () => {
    if (!selectedChar || !opponentCharId.trim()) return;
    
    try {
      const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await createBattle(battleId, selectedChar.id, opponentCharId.trim());
      
      // Store battle ID
      const storedBattles = localStorage.getItem(`battles_${userAddress}`) || '[]';
      const battleIds = JSON.parse(storedBattles);
      battleIds.push(battleId);
      localStorage.setItem(`battles_${userAddress}`, JSON.stringify(battleIds));
      
      // Refresh battles
      const battle = await readBattle(battleId);
      if (battle) {
        setActiveBattles(prev => [...prev, battle]);
        setSelectedBattle(battle);
        setBattleLog([`Battle created: ${selectedChar.name} vs ${opponentCharId}`]);
      }
      
      setOpponentCharId('');
    } catch (err) {
      console.error('Battle creation failed:', err);
    }
  };

  const handleExecuteTurn = async (stance: number, useSkill: boolean, skillSlot: number) => {
    if (!selectedBattle || !selectedChar) return;
    
    try {
      await executeTurn(selectedBattle.id, selectedChar.id, stance, useSkill, skillSlot);
      
      // Refresh battle state
      const updatedBattle = await readBattle(selectedBattle.id);
      if (updatedBattle) {
        setSelectedBattle(updatedBattle);
        setActiveBattles(prev => prev.map(b => b.id === updatedBattle.id ? updatedBattle : b));
        
        // Add to battle log
        const action = useSkill ? `Used ${SKILL_NAMES[skillSlot] || `Skill ${skillSlot}`}` : 
                     stance === 1 ? 'Aggressive Attack' : stance === 2 ? 'Defensive Attack' : 'Neutral Attack';
        setBattleLog(prev => [...prev, `Turn ${updatedBattle.turnNumber}: ${action}`]);
      }
    } catch (err) {
      console.error('Turn execution failed:', err);
    }
  };

  const getSkillInfo = (char: MassaCharacter, slot: number) => {
    const skillId = slot === 1 ? char.skillSlot1 : slot === 2 ? char.skillSlot2 : char.skillSlot3;
    return {
      id: skillId,
      name: SKILL_NAMES[skillId] || `Skill ${skillId}`,
      icon: SKILL_ICONS[skillId] || Target
    };
  };

  const isMyTurn = (battle: BattleType) => {
    if (!selectedChar) return false;
    return (battle.currentTurn === 1 && battle.player1.characterId === selectedChar.id) ||
           (battle.currentTurn === 2 && battle.player2.characterId === selectedChar.id);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Connect Wallet</h1>
            <p className="text-foreground/60">Please connect your wallet to access the Battle Arena</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-heading font-black text-white mb-8">BATTLE ARENA</h1>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Create Battle */}
            <Card className="bg-dark-800 border-neon-cyan/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sword className="w-5 h-5" />
                  Create Battle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Character Selection */}
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Your Character</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {characters.map((char) => (
                      <div
                        key={char.id}
                        className={`p-2 rounded cursor-pointer transition-colors text-xs ${
                          selectedChar?.id === char.id ? 'bg-neon-cyan/20' : 'bg-dark-700/50 hover:bg-dark-600/50'
                        }`}
                        onClick={() => setSelectedChar(char)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-bold">{char.name}</p>
                            <p className="text-foreground/60">{CLASS_NAMES[char.characterClass]} Lv.{Number(char.level)}</p>
                          </div>
                          <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                            {Number(char.hp)}/{Number(char.maxHp)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opponent Input */}
                <div>
                  <label className="text-sm text-foreground/60 mb-2 block">Opponent Character ID</label>
                  <input
                    type="text"
                    value={opponentCharId}
                    onChange={(e) => setOpponentCharId(e.target.value)}
                    placeholder="Enter opponent's character ID"
                    className="w-full p-2 bg-dark-700/50 border border-neon-cyan/30 rounded text-white text-sm placeholder-foreground/40"
                  />
                </div>

                <Button 
                  onClick={handleCreateBattle}
                  disabled={loading || !selectedChar || !opponentCharId.trim()}
                  className="w-full"
                  size="sm"
                >
                  Create Battle (1.1 MAS)
                </Button>
              </CardContent>
            </Card>

            {/* Active Battles */}
            <Card className="bg-dark-800 border-neon-cyan/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Battles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeBattles.length === 0 ? (
                    <p className="text-foreground/60 text-center py-4 text-sm">No active battles</p>
                  ) : (
                    activeBattles.map((battle) => (
                      <div
                        key={battle.id}
                        className={`p-2 rounded cursor-pointer transition-colors text-xs ${
                          selectedBattle?.id === battle.id ? 'bg-neon-cyan/20' : 'bg-dark-700/50 hover:bg-dark-600/50'
                        }`}
                        onClick={() => setSelectedBattle(battle)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-white font-bold">#{battle.id.slice(-6)}</p>
                          <Badge className={`text-xs ${
                            battle.state === 1 ? 'bg-green-500/20 text-green-400' :
                            battle.state === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                            battle.state === 3 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {battle.state === 1 ? 'Active' : battle.state === 2 ? 'Wildcard' : battle.state === 3 ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="text-foreground/60">
                          <p>Turn: {Number(battle.turnNumber)} | Player {Number(battle.currentTurn)}</p>
                          {isMyTurn(battle) && <p className="text-neon-cyan">Your Turn!</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Battle View */}
            {selectedBattle && (
              <Card className="xl:col-span-2 bg-dark-800 border-neon-cyan/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Battle #{selectedBattle.id.slice(-6)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Battle Status */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-dark-700/50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-foreground/60">Player 1</span>
                      </div>
                      <p className="text-white text-sm">{selectedBattle.player1.characterId.slice(-8)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={(Number(selectedBattle.player1.currentHp) / Number(selectedBattle.player1.maxHp)) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-foreground/60">
                          {Number(selectedBattle.player1.currentHp)}/{Number(selectedBattle.player1.maxHp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-foreground/60">Energy: {selectedBattle.player1.energy}/100</span>
                      </div>
                    </div>
                    
                    <div className="bg-dark-700/50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-foreground/60">Player 2</span>
                      </div>
                      <p className="text-white text-sm">{selectedBattle.player2.characterId.slice(-8)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={(Number(selectedBattle.player2.currentHp) / Number(selectedBattle.player2.maxHp)) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-foreground/60">
                          {Number(selectedBattle.player2.currentHp)}/{Number(selectedBattle.player2.maxHp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-foreground/60">Energy: {selectedBattle.player2.energy}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Battle Actions */}
                  {selectedBattle.state === 1 && isMyTurn(selectedBattle) && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold">Your Turn - Choose Action</h4>
                      
                      {/* Basic Attacks */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          onClick={() => handleExecuteTurn(0, false, 0)}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Neutral
                        </Button>
                        <Button 
                          onClick={() => handleExecuteTurn(1, false, 0)}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <Sword className="w-3 h-3 mr-1" />
                          Aggressive
                        </Button>
                        <Button 
                          onClick={() => handleExecuteTurn(2, false, 0)}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Defensive
                        </Button>
                      </div>

                      {/* Skills */}
                      {selectedChar && (
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map(slot => {
                            const skill = getSkillInfo(selectedChar, slot);
                            const SkillIcon = skill.icon;
                            return (
                              <Button 
                                key={slot}
                                onClick={() => handleExecuteTurn(0, true, slot)}
                                disabled={loading || skill.id === 0}
                                size="sm"
                                variant="outline"
                              >
                                <SkillIcon className="w-3 h-3 mr-1" />
                                {skill.name}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wildcard Event */}
                  {selectedBattle.state === 2 && selectedBattle.wildcardActive && (
                    <div className="text-center p-4 bg-yellow-500/10 rounded border border-yellow-500/30">
                      <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-lg text-white mb-2">Wildcard Event!</h3>
                      {WILDCARD_TYPES[selectedBattle.wildcardType] && (
                        <div>
                          <p className="text-yellow-400 font-bold">{WILDCARD_TYPES[selectedBattle.wildcardType].name}</p>
                          <p className="text-sm text-foreground/60">{WILDCARD_TYPES[selectedBattle.wildcardType].desc}</p>
                        </div>
                      )}
                      <p className="text-xs text-foreground/60 mt-2">Waiting for player decisions...</p>
                    </div>
                  )}

                  {/* Battle Completed */}
                  {selectedBattle.state === 3 && (
                    <div className="text-center p-4 bg-green-500/10 rounded border border-green-500/30">
                      <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-lg text-white mb-2">Battle Completed!</h3>
                      <p className="text-green-400">Winner: {selectedBattle.winnerId}</p>
                    </div>
                  )}

                  {/* Battle Log */}
                  <div className="mt-4">
                    <h4 className="text-white font-bold mb-2">Battle Log</h4>
                    <div className="bg-dark-700/30 p-2 rounded max-h-32 overflow-y-auto">
                      {battleLog.length === 0 ? (
                        <p className="text-foreground/60 text-xs">No actions yet...</p>
                      ) : (
                        battleLog.map((log, index) => (
                          <p key={index} className="text-xs text-foreground/80">{log}</p>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}