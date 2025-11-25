import React, { useEffect, useState } from 'react';
import { useWallet, useCharacter, useEquipment, useSkills } from '../hooks';

interface LoadoutData {
  character: any;
  equipment: any[];
  skills: any[];
  loading: boolean;
  error: string | null;
}

interface LoadoutDashboardProps {
  onNavigate: (page: string) => void;
}

export default function LoadoutDashboard({ onNavigate }: LoadoutDashboardProps) {
  const { userAddress, isConnected } = useWallet();
  const contractAddress = 'AS122vTBDiHYL34BykXKWHWKP9ADnTLiQoKMbzEfGJUkwiCo6ZErY';
  const provider = null;

  const characterHooks = useCharacter(contractAddress, isConnected, provider, userAddress);
  const equipmentHooks = useEquipment(contractAddress, isConnected, provider, userAddress);
  const skillsHooks = useSkills(contractAddress, isConnected, provider, userAddress);

  const [loadoutData, setLoadoutData] = useState<LoadoutData>({
    character: null,
    equipment: [],
    skills: [],
    loading: true,
    error: null,
  });

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'equipment' | 'skills' | 'stats'>('equipment');

  useEffect(() => {
    if (!isConnected || !userAddress || hasLoadedOnce) return;

    const loadData = async () => {
      try {
        setLoadoutData(prev => ({ ...prev, loading: true, error: null }));

        // Load character data
        const characterId = `${userAddress}_main`;
        const character = await characterHooks.readCharacter(characterId);

        if (!character) {
          throw new Error('No character found. Create a character first.');
        }

        // Load equipment
        const equipment = [];
        if (character.weaponId) {
          const weapon = await equipmentHooks.readEquipment(character.weaponId);
          if (weapon) equipment.push({ ...weapon, slot: 'weapon' });
        }
        if (character.armorId) {
          const armor = await equipmentHooks.readEquipment(character.armorId);
          if (armor) equipment.push({ ...armor, slot: 'armor' });
        }
        if (character.accessoryId) {
          const accessory = await equipmentHooks.readEquipment(character.accessoryId);
          if (accessory) equipment.push({ ...accessory, slot: 'accessory' });
        }

        // Load skills
        const learnedSkills = await skillsHooks.getLearnedSkills(characterId);
        const skills = learnedSkills || [];

        setLoadoutData({
          character,
          equipment: equipment.filter(Boolean),
          skills,
          loading: false,
          error: null,
        });

        setHasLoadedOnce(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load loadout data';
        setLoadoutData(prev => ({
          ...prev,
          loading: false,
          error: message,
        }));
        setHasLoadedOnce(true);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userAddress, hasLoadedOnce]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ue-bg">
        <p className="text-ue-text text-xl">Please connect your wallet</p>
      </div>
    );
  }

  if (loadoutData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ue-bg">
        <p className="text-ue-text text-xl">Loading loadout...</p>
      </div>
    );
  }

  if (loadoutData.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ue-bg gap-4">
        <p className="text-red-400 text-xl">{loadoutData.error}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2 bg-ue-accent hover:bg-ue-accent/80 text-ue-bg rounded font-bold transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const character = loadoutData.character;
  const equipment = loadoutData.equipment;

  return (
    <div className="min-h-screen bg-ue-bg text-ue-text">
      {/* Navigation Bar */}
      <nav className="bg-ue-panel border-b border-ue-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="text-ue-accent hover:text-ue-accent/80 font-bold text-lg transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{character?.name || 'Loadout'}</h1>
          <button
            onClick={() => onNavigate('battle')}
            className="px-6 py-2 bg-ue-accent hover:bg-ue-accent/80 text-ue-bg rounded font-bold transition-colors"
          >
            Ready to Battle →
          </button>
        </div>
      </nav>

      {/* Character Overview Card */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Character Info */}
          <div className="md:col-span-2 bg-ue-panel border border-ue-border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-ue-accent to-ue-accent/30 rounded-lg flex items-center justify-center text-3xl clip-path-hexagon">
                {character?.class === 0 ? '⚔️' : character?.class === 1 ? '🛡️' : '✨'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{character?.name}</h2>
                <p className="text-ue-text-darker">
                  {character?.class === 0 ? 'Warrior' : character?.class === 1 ? 'Knight' : 'Mage'}
                </p>
                <p className="text-ue-accent font-bold">Lvl {character?.level || 1}</p>
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-ue-text-darker text-sm mb-1">HP</p>
                <p className="text-2xl font-bold text-green-400">{character?.hp || 0}</p>
              </div>
              <div>
                <p className="text-ue-text-darker text-sm mb-1">ATK</p>
                <p className="text-2xl font-bold text-red-400">{character?.damageMin || 0}-{character?.damageMax || 0}</p>
              </div>
              <div>
                <p className="text-ue-text-darker text-sm mb-1">CRIT</p>
                <p className="text-2xl font-bold text-yellow-400">{character?.critChance || 0}%</p>
              </div>
              <div>
                <p className="text-ue-text-darker text-sm mb-1">DEF</p>
                <p className="text-2xl font-bold text-blue-400">{character?.defense || 0}</p>
              </div>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="bg-ue-panel border border-ue-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Battle Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-ue-text-darker">Wins</span>
                <span className="font-bold text-green-400">{character?.wins || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ue-text-darker">Losses</span>
                <span className="font-bold text-red-400">{character?.losses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ue-text-darker">Win Rate</span>
                <span className="font-bold text-ue-accent">
                  {character?.wins && character?.losses
                    ? ((character.wins / (character.wins + character.losses)) * 100).toFixed(1)
                    : '0'}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ue-text-darker">Streak</span>
                <span className="font-bold text-ue-accent">{character?.winStreak || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ue-text-darker">MMR</span>
                <span className="font-bold text-ue-accent">{character?.mmr || 1000}</span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-ue-panel border border-ue-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-ue-text-darker text-sm">EXP</span>
                  <span className="text-sm font-bold">{character?.exp || 0} / {character?.level * 100 || 100}</span>
                </div>
                <div className="w-full bg-ue-bg rounded h-2">
                  <div
                    className="bg-gradient-to-r from-ue-accent to-ue-accent/50 h-2 rounded"
                    style={{
                      width: `${
                        ((character?.exp || 0) / (character?.level * 100 || 100)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-ue-border">
          <button
            onClick={() => setSelectedTab('equipment')}
            className={`py-3 px-6 font-bold transition-colors border-b-2 ${
              selectedTab === 'equipment'
                ? 'border-ue-accent text-ue-accent'
                : 'border-transparent text-ue-text-darker hover:text-ue-text'
            }`}
          >
            ⚙️ Equipment
          </button>
          <button
            onClick={() => setSelectedTab('skills')}
            className={`py-3 px-6 font-bold transition-colors border-b-2 ${
              selectedTab === 'skills'
                ? 'border-ue-accent text-ue-accent'
                : 'border-transparent text-ue-text-darker hover:text-ue-text'
            }`}
          >
            🔥 Skills
          </button>
          <button
            onClick={() => setSelectedTab('stats')}
            className={`py-3 px-6 font-bold transition-colors border-b-2 ${
              selectedTab === 'stats'
                ? 'border-ue-accent text-ue-accent'
                : 'border-transparent text-ue-text-darker hover:text-ue-text'
            }`}
          >
            📊 Stats
          </button>
        </div>

        {/* Equipment Tab */}
        {selectedTab === 'equipment' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {['weapon', 'armor', 'accessory'].map((slotType) => {
              const item = equipment.find(e => e.slot === slotType);
              const slotLabel = slotType.charAt(0).toUpperCase() + slotType.slice(1);

              return (
                <div key={slotType} className="bg-ue-panel border border-ue-border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">{slotLabel}</h3>
                  {item ? (
                    <div>
                      <div className="bg-ue-bg rounded-lg p-4 mb-4">
                        <div className="text-4xl mb-2">
                          {slotType === 'weapon' ? '⚔️' : slotType === 'armor' ? '🛡️' : '💍'}
                        </div>
                        <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                        <p className={`text-sm font-bold mb-3 ${
                          item.rarity === 0 ? 'text-gray-400' :
                          item.rarity === 1 ? 'text-blue-400' :
                          item.rarity === 2 ? 'text-purple-400' :
                          'text-yellow-400'
                        }`}>
                          {['Common', 'Rare', 'Epic', 'Legendary'][item.rarity] || 'Unknown'}
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        {item.statBonus && (
                          <>
                            <p className="text-ue-text-darker">Bonuses:</p>
                            <p className="text-green-400">+{item.statBonus} HP</p>
                          </>
                        )}
                        {item.durability !== undefined && (
                          <p className="text-ue-text-darker">
                            Durability: {item.durability}%
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-ue-bg rounded-lg p-6 text-center">
                      <p className="text-ue-text-darker text-lg">Empty Slot</p>
                      <p className="text-ue-text-darker text-sm mt-2">
                        Equip an item to fill this slot
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Skills Tab */}
        {selectedTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loadoutData.skills.length > 0 ? (
              loadoutData.skills.map((skill, idx) => (
                <div key={idx} className="bg-ue-panel border border-ue-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg">{skill.name || `Skill ${idx + 1}`}</h4>
                    <span className="text-ue-accent text-sm bg-ue-bg px-2 py-1 rounded">Slot {idx + 1}</span>
                  </div>
                  <p className="text-ue-text-darker text-sm">
                    {skill.description || 'No description available'}
                  </p>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3 bg-ue-panel border border-ue-border rounded-lg p-12 text-center">
                <p className="text-ue-text-darker text-lg">No skills learned yet</p>
                <p className="text-ue-text-darker text-sm mt-2">
                  Learn skills to unlock strategic advantages in battle
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {selectedTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-ue-panel border border-ue-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Combat Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Damage (Min-Max)</span>
                  <span className="font-bold">{character?.damageMin || 0} - {character?.damageMax || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Critical Chance</span>
                  <span className="font-bold text-yellow-400">{character?.critChance || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Dodge Chance</span>
                  <span className="font-bold text-blue-400">{character?.dodgeChance || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Defense</span>
                  <span className="font-bold text-ue-accent">{character?.defense || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-ue-panel border border-ue-border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Progression</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Level</span>
                  <span className="font-bold">{character?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Total Experience</span>
                  <span className="font-bold">{character?.exp || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">MMR</span>
                  <span className="font-bold text-ue-accent">{character?.mmr || 1000}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ue-text-darker">Total Battles</span>
                  <span className="font-bold">{(character?.wins || 0) + (character?.losses || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
