import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterCard } from '@/components/CharacterCard';
import { MintCharacterDialog } from '@/components/MintCharacterDialog';
import { CreateBattleDialog } from '@/components/CreateBattleDialog';
import { StanceSelector } from '@/components/StanceSelector';
import { useWallet } from '@/hooks/useWallet';
import { useGame } from '@/hooks/useGame';
import { MassaCharacter, CharacterClass, CLASS_NAMES } from '@/types/massa-character';
import { Stance } from '@/types/battle';
import { Swords, Trophy, Users, Zap, Shield, Sparkles } from 'lucide-react';

export default function Index() {
  const { isConnected, userAddress, provider } = useWallet();
  const { createCharacter, readCharacter, createBattle, executeTurn, loading, error } = useGame(isConnected, provider, userAddress || '');
  
  // Show loading/error states
  useEffect(() => {
    if (error) {
      console.error('Game error:', error);
    }
  }, [error]);
  const [selectedCharacter, setSelectedCharacter] = useState<MassaCharacter | null>(null);
  const [characters, setCharacters] = useState<MassaCharacter[]>([]);
  const [battles, setBattles] = useState<{id: string, char1: string, char2: string}[]>([]);

  // Load user's characters when wallet connects
  useEffect(() => {
    const loadUserCharacters = async () => {
      if (isConnected && userAddress && provider) {
        console.log('Loading characters for:', userAddress);
        // For demo, try to read a character that was created
        const storedCharIds = localStorage.getItem(`characters_${userAddress}`);
        if (storedCharIds) {
          const charIds = JSON.parse(storedCharIds);
          const loadedChars = [];
          for (const charId of charIds) {
            try {
              const char = await readCharacter(charId);
              if (char) loadedChars.push(char);
            } catch (err) {
              console.error('Failed to load character:', charId, err);
            }
          }
          setCharacters(loadedChars);
        }
      }
    };
    loadUserCharacters();
  }, [isConnected, userAddress, provider, readCharacter]);

  const handleMintCharacter = async (characterClass: CharacterClass) => {
    console.log('handleMintCharacter called with:', characterClass);
    console.log('Wallet state:', { isConnected, userAddress, provider });
    
    if (!isConnected || !userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!provider) {
      alert('Wallet provider not available');
      return;
    }
    
    try {
      const characterId = `char_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const name = `${CLASS_NAMES[characterClass]}_${Date.now().toString().slice(-4)}`;
      
      console.log('Creating character:', { characterId, characterClass, name, provider });
      const txHash = await createCharacter(characterId, characterClass, name);
      
      if (txHash) {
        console.log('Character creation transaction:', txHash);
        alert(`Character creation submitted! Transaction: ${txHash}`);
        
        // Add to local state immediately for UI feedback
        const newCharacter: MassaCharacter = {
          id: characterId,
          owner: userAddress,
          name,
          characterClass,
          level: 1,
          xp: 0,
          hp: characterClass === CharacterClass.Warrior ? 120 : characterClass === CharacterClass.Tank ? 180 : characterClass === CharacterClass.Assassin ? 80 : characterClass === CharacterClass.Mage ? 90 : 100,
          maxHp: characterClass === CharacterClass.Warrior ? 120 : characterClass === CharacterClass.Tank ? 180 : characterClass === CharacterClass.Assassin ? 80 : characterClass === CharacterClass.Mage ? 90 : 100,
          damageMin: characterClass === CharacterClass.Warrior ? 12 : characterClass === CharacterClass.Assassin ? 15 : characterClass === CharacterClass.Mage ? 10 : characterClass === CharacterClass.Tank ? 8 : 10,
          damageMax: characterClass === CharacterClass.Warrior ? 18 : characterClass === CharacterClass.Assassin ? 25 : characterClass === CharacterClass.Mage ? 22 : characterClass === CharacterClass.Tank ? 12 : 16,
          critChance: characterClass === CharacterClass.Warrior ? 12 : characterClass === CharacterClass.Assassin ? 25 : characterClass === CharacterClass.Mage ? 15 : characterClass === CharacterClass.Tank ? 5 : 15,
          dodgeChance: characterClass === CharacterClass.Warrior ? 5 : characterClass === CharacterClass.Assassin ? 15 : characterClass === CharacterClass.Mage ? 8 : characterClass === CharacterClass.Tank ? 3 : 12,
          defense: characterClass === CharacterClass.Warrior ? 8 : characterClass === CharacterClass.Assassin ? 3 : characterClass === CharacterClass.Mage ? 4 : characterClass === CharacterClass.Tank ? 15 : 6,
          weaponId: '',
          armorId: '',
          accessoryId: '',
          skillSlot1: 0,
          skillSlot2: 0,
          skillSlot3: 0,
          learnedSkills: 0,
          totalWins: 0,
          totalLosses: 0,
          mmr: 1000,
          winStreak: 0,
          createdAt: Date.now()
        };
        
        setCharacters(prev => [...prev, newCharacter]);
        
        // Store character ID for later loading
        const storedCharIds = localStorage.getItem(`characters_${userAddress}`) || '[]';
        const charIds = JSON.parse(storedCharIds);
        charIds.push(characterId);
        localStorage.setItem(`characters_${userAddress}`, JSON.stringify(charIds));
      }
    } catch (err: any) {
      console.error('Failed to create character:', err);
      alert(`Failed to create character: ${err.message}`);
    }
  };

  const handleCreateBattle = async (rounds: number, wager: string) => {
    if (!selectedCharacter || !isConnected) {
      alert('Please select a character and connect wallet');
      return;
    }
    
    try {
      const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // For demo, create battle with same character (in real app, user would select opponent)
      console.log('Creating battle:', { battleId, char1: selectedCharacter.id, char2: selectedCharacter.id });
      const txHash = await createBattle(battleId, selectedCharacter.id, selectedCharacter.id);
      
      if (txHash) {
        console.log('Battle creation transaction:', txHash);
        alert(`Battle created! Transaction: ${txHash}`);
        
        // Add battle to local state
        setBattles(prev => [...prev, {
          id: battleId,
          char1: selectedCharacter.id,
          char2: selectedCharacter.id
        }]);
      }
    } catch (err: any) {
      console.error('Failed to create battle:', err);
      alert(`Failed to create battle: ${err.message}`);
    }
  };

  const handleCommitStance = async (stance: Stance) => {
    if (!selectedCharacter || !isConnected) {
      alert('Please select a character and connect wallet');
      return;
    }
    
    try {
      // For demo purposes, we'll need a battle ID - in real app this would come from active battle
      const battleId = 'demo_battle'; // This should be from actual battle state
      
      console.log('Executing turn:', { battleId, character: selectedCharacter.id, stance });
      const txHash = await executeTurn(battleId, selectedCharacter.id, stance, false, 0);
      
      if (txHash) {
        console.log('Turn execution transaction:', txHash);
        alert(`Turn executed! Transaction: ${txHash}`);
      }
    } catch (err: any) {
      console.error('Failed to execute turn:', err);
      alert(`Failed to execute turn: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 ue-container">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 ue-grid-bg opacity-20 pointer-events-none" />
      
      <Navbar />
      


      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <div className="ue-card px-6 py-2 inline-block">
                <p className="text-neon-cyan text-sm tracking-widest uppercase font-bold">
                  Powered by Massa Blockchain
                </p>
              </div>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-heading font-black text-white leading-tight tracking-wider">
              <span className="ue-glow-text">EPIC</span> ON-CHAIN
              <br />
              <span className="text-neon-purple">BATTLES</span>
            </h2>
            
            <p className="text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
              Mint NFT warriors, engage in strategic turn-based combat with verifiable randomness, 
              and dominate the arena on Massa blockchain.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap pt-4">
              <MintCharacterDialog onMint={handleMintCharacter} isLoading={loading} />
              <CreateBattleDialog onCreateBattle={handleCreateBattle} />
            </div>

            {/* Stats Display */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
              <div className="ue-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-cyan">5</div>
                <div className="text-sm text-foreground/60 uppercase tracking-wider">Classes</div>
              </div>
              <div className="ue-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-purple">100%</div>
                <div className="text-sm text-foreground/60 uppercase tracking-wider">On-Chain</div>
              </div>
              <div className="ue-card p-4 text-center">
                <div className="text-3xl font-bold text-neon-cyan">∞</div>
                <div className="text-sm text-foreground/60 uppercase tracking-wider">Battles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="characters" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-dark-800 border border-neon-cyan/30 p-1">
              <TabsTrigger 
                value="characters" 
                className="gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:shadow-neon-cyan"
              >
                <Users className="w-4 h-4" />
                Characters
              </TabsTrigger>
              <TabsTrigger 
                value="battles" 
                className="gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:shadow-neon-cyan"
              >
                <Swords className="w-4 h-4" />
                Battles
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan data-[state=active]:shadow-neon-cyan"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            {/* Characters Tab */}
            <TabsContent value="characters" className="space-y-6">
              <div className="ue-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white tracking-wider">YOUR WARRIORS</h3>
                    <p className="text-foreground/60 text-sm mt-1">Manage your NFT battle characters</p>
                  </div>
                  <Shield className="w-8 h-8 text-neon-cyan/50" />
                </div>
                
                {console.log('Characters array:', characters) || characters.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="ue-hologram mb-6">
                      <Users className="w-16 h-16 text-neon-cyan/30 mx-auto" />
                    </div>
                    <p className="text-foreground/60 mb-6 text-lg">No warriors detected in your arsenal</p>
                    <MintCharacterDialog onMint={handleMintCharacter} isLoading={loading} />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {characters.map((character) => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onClick={() => setSelectedCharacter(character)}
                        selected={selectedCharacter?.id === character.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Battles Tab */}
            <TabsContent value="battles" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Active Battles */}
                <div className="ue-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-neon-cyan" />
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white tracking-wider">ACTIVE BATTLES</h3>
                      <p className="text-foreground/60 text-sm">Your ongoing combat encounters</p>
                    </div>
                  </div>
                  <div className="text-center py-12">
                    <div className="ue-hologram mb-4">
                      <Swords className="w-12 h-12 text-neon-cyan/30 mx-auto" />
                    </div>
                    <p className="text-foreground/60">No active battles</p>
                  </div>
                </div>

                {/* Battle Offers */}
                <div className="ue-card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-neon-purple" />
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white tracking-wider">OPEN CHALLENGES</h3>
                      <p className="text-foreground/60 text-sm">Available battle offers</p>
                    </div>
                  </div>
                  {battles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="ue-hologram mb-4">
                        <Trophy className="w-12 h-12 text-neon-purple/30 mx-auto" />
                      </div>
                      <p className="text-foreground/60">No open challenges</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {battles.map((battle) => (
                        <div key={battle.id} className="ue-card p-4 bg-dark-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold">{battle.id}</h4>
                              <p className="text-sm text-foreground/60">Battle Challenge</p>
                            </div>
                            <Button size="sm" className="bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                              Join Battle
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stance Selection Demo */}
              {selectedCharacter && (
                <div className="max-w-md mx-auto">
                  <StanceSelector onCommit={handleCommitStance} />
                </div>
              )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <div className="ue-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-neon-cyan" />
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white tracking-wider">TOP WARRIORS</h3>
                    <p className="text-foreground/60 text-sm">Ranked by MMR rating</p>
                  </div>
                </div>
                <div className="text-center py-16">
                  <div className="ue-hologram mb-6">
                    <Trophy className="w-16 h-16 text-neon-cyan/30 mx-auto" />
                  </div>
                  <p className="text-foreground/60 text-lg">Leaderboard initializing...</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/50 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-black text-white tracking-wider mb-3">
              <span className="ue-glow-text">GAME FEATURES</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mx-auto" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded border border-neon-cyan/30">
                  <Users className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">5 UNIQUE CLASSES</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Choose from Warrior, Assassin, Mage, Tank, or Trickster - each with unique stats and special abilities
                  </p>
                </div>
              </div>
            </div>

            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-purple/10 rounded border border-neon-purple/30">
                  <Swords className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">STRATEGIC COMBAT</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Rock-paper-scissors stance system with combos, critical hits, and special abilities
                  </p>
                </div>
              </div>
            </div>

            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded border border-neon-cyan/30">
                  <Sparkles className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">VERIFIABLE RANDOMNESS</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    On-chain randomness ensures all outcomes are transparent and provably fair
                  </p>
                </div>
              </div>
            </div>

            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-purple/10 rounded border border-neon-purple/30">
                  <Zap className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">ECONOMIC WAGERING</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Stake MAS tokens in battles with flexible wagering options
                  </p>
                </div>
              </div>
            </div>

            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded border border-neon-cyan/30">
                  <Trophy className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">CHARACTER PROGRESSION</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Earn XP, level up your characters, and climb the MMR rankings
                  </p>
                </div>
              </div>
            </div>

            <div className="ue-card p-6 group hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-purple/10 rounded border border-neon-purple/30">
                  <Shield className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold text-white mb-2 tracking-wider">MASSA BLOCKCHAIN</h4>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Built on Massa's innovative blockchain with autonomous smart contracts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-neon-cyan/30 bg-dark-800/80 backdrop-blur-md py-8 mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-foreground/60 text-sm">
            <p className="tracking-wider">© {new Date().getFullYear()} BATTLECHAIN V2. ALL RIGHTS RESERVED.</p>
            <p className="mt-2 text-neon-cyan/50">Fully on-chain NFT battle game powered by Massa blockchain</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
