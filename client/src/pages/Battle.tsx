import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { MassaCharacter, Battle as BattleType, CLASS_NAMES } from '@/types/massa-character';
import { Sword, Shield, Target, Users, Clock, Trophy } from 'lucide-react';

export default function Battle() {
  const { isConnected, userAddress, provider } = useWallet();
  const { readCharacter, createBattle, executeTurn, readBattle, loading } = useGame(isConnected, provider, userAddress || '');
  const [characters, setCharacters] = useState<MassaCharacter[]>([]);
  const [selectedChar, setSelectedChar] = useState<MassaCharacter | null>(null);
  const [opponentCharId, setOpponentCharId] = useState('');
  const [activeBattles, setActiveBattles] = useState<BattleType[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<BattleType | null>(null);

  // Load user characters
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

  // Load active battles
  useEffect(() => {
    const loadBattles = async () => {
      if (isConnected && userAddress) {
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
    loadBattles();
  }, [isConnected, userAddress, readBattle]);

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
      }
    } catch (err) {
      console.error('Turn execution failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Connect Wallet</h1>
          <p className="text-foreground/60">Please connect your wallet to access battles</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Battle */}
          <div className="ue-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Create Battle</h2>
            
            {/* Character Selection */}
            <div className="mb-4">
              <label className="text-sm text-foreground/60 mb-2 block">Your Character</label>
              <div className="space-y-2">
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
                        <p className="text-sm text-foreground/60">{CLASS_NAMES[char.characterClass]} Lv.{Number(char.level)}</p>
                      </div>
                      <Badge className="bg-neon-cyan/20 text-neon-cyan">
                        {Number(char.hp)}/{Number(char.maxHp)} HP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Input */}
            <div className="mb-4">
              <label className="text-sm text-foreground/60 mb-2 block">Opponent Character ID</label>
              <input
                type="text"
                value={opponentCharId}
                onChange={(e) => setOpponentCharId(e.target.value)}
                placeholder="Enter opponent's character ID"
                className="w-full p-3 bg-dark-700/50 border border-neon-cyan/30 rounded text-white placeholder-foreground/40"
              />
            </div>

            <Button 
              onClick={handleCreateBattle}
              disabled={loading || !selectedChar || !opponentCharId.trim()}
              className="w-full"
            >
              <Sword className="w-4 h-4 mr-2" />
              Create Battle (1.1 MAS)
            </Button>
          </div>

          {/* Active Battles */}
          <div className="ue-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Battles</h2>
            <div className="space-y-3">
              {activeBattles.length === 0 ? (
                <p className="text-foreground/60 text-center py-4">No active battles</p>
              ) : (
                activeBattles.map((battle) => (
                  <div
                    key={battle.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedBattle?.id === battle.id ? 'bg-neon-cyan/20' : 'bg-dark-700/50 hover:bg-dark-600/50'
                    }`}
                    onClick={() => setSelectedBattle(battle)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-bold text-sm">Battle #{battle.id.slice(-8)}</h3>
                      <Badge className={`${
                        battle.state === 1 ? 'bg-green-500/20 text-green-400' :
                        battle.state === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        battle.state === 3 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {battle.state === 1 ? 'Active' : battle.state === 2 ? 'Wildcard' : battle.state === 3 ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="text-xs text-foreground/60">
                      <p>Turn: {Number(battle.turnNumber)}</p>
                      <p>Current: Player {Number(battle.currentTurn)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Battle Actions */}
          {selectedBattle && (
            <div className="ue-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Battle Actions</h2>
              
              {selectedBattle.state === 1 && ( // Active battle
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg text-white">Turn {Number(selectedBattle.turnNumber)}</h3>
                    <p className="text-foreground/60">Player {Number(selectedBattle.currentTurn)}'s Turn</p>
                  </div>

                  {/* Battle Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-dark-700/50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-foreground/60">Player 1</span>
                      </div>
                      <div className="text-white">
                        <p className="text-sm">{selectedBattle.player1.characterId.slice(-8)}</p>
                        <p className="text-xs text-foreground/60">
                          {Number(selectedBattle.player1.currentHp)}/{Number(selectedBattle.player1.maxHp)} HP
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-dark-700/50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-foreground/60">Player 2</span>
                      </div>
                      <div className="text-white">
                        <p className="text-sm">{selectedBattle.player2.characterId.slice(-8)}</p>
                        <p className="text-xs text-foreground/60">
                          {Number(selectedBattle.player2.currentHp)}/{Number(selectedBattle.player2.maxHp)} HP
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <h4 className="text-white font-bold">Basic Attacks</h4>
                    
                    <Button 
                      onClick={() => handleExecuteTurn(0, false, 0)}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Neutral Attack
                    </Button>
                    
                    <Button 
                      onClick={() => handleExecuteTurn(1, false, 0)}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Sword className="w-4 h-4 mr-2" />
                      Aggressive Attack (+20% damage)
                    </Button>
                    
                    <Button 
                      onClick={() => handleExecuteTurn(2, false, 0)}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Defensive Attack (-20% damage, +defense)
                    </Button>

                    <h4 className="text-white font-bold mt-4">Skills</h4>
                    
                    {[1, 2, 3].map(slot => (
                      <Button 
                        key={slot}
                        onClick={() => handleExecuteTurn(0, true, slot)}
                        disabled={loading}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        Use Skill Slot {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedBattle.state === 3 && ( // Completed battle
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg text-white mb-2">Battle Completed!</h3>
                  <p className="text-foreground/60">Winner: {selectedBattle.winnerId}</p>
                </div>
              )}

              {selectedBattle.state === 2 && ( // Wildcard state
                <div className="text-center">
                  <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg text-white mb-2">Wildcard Event!</h3>
                  <p className="text-foreground/60">Waiting for player decisions...</p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}