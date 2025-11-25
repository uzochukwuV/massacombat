import React, { useEffect, useState } from 'react';
import { useWallet, useCharacter, useEquipment, useAchievements } from '../hooks';

interface DashboardData {
  character: any;
  equipment: any[];
  achievements: any;
  loading: boolean;
  error: string | null;
}

export default function UserDashboard() {
  const { userAddress, isConnected } = useWallet();
  const contractAddress = 'AS122vTBDiHYL34BykXKWHWKP9ADnTLiQoKMbzEfGJUkwiCo6ZErY';
  const provider = null;

  const characterHooks = useCharacter(contractAddress, isConnected, provider, userAddress);
  const equipmentHooks = useEquipment(contractAddress, isConnected, provider, userAddress);
  const achievementHooks = useAchievements(contractAddress, isConnected, provider, userAddress);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    character: null,
    equipment: [],
    achievements: null,
    loading: true,
    error: null,
  });

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isConnected || !userAddress || hasLoadedOnce) return;

    const loadData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Load character data
        const characterId = `${userAddress}_main`;
        const character = await characterHooks.readCharacter(characterId);

        // Load equipment data
        const equipment = [];
        if (character) {
          if (character.weaponId) {
            const weapon = await equipmentHooks.readEquipment(character.weaponId);
            equipment.push(weapon);
          }
          if (character.armorId) {
            const armor = await equipmentHooks.readEquipment(character.armorId);
            equipment.push(armor);
          }
          if (character.accessoryId) {
            const accessory = await equipmentHooks.readEquipment(character.accessoryId);
            equipment.push(accessory);
          }
        }

        // Load achievements
        const achievements = await achievementHooks.getAchievements(userAddress);

        setDashboardData({
          character,
          equipment: equipment.filter(Boolean),
          achievements,
          loading: false,
          error: null,
        });

        setHasLoadedOnce(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setDashboardData(prev => ({
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
        <p className="text-ue-text text-xl">Please connect your wallet to view your dashboard</p>
      </div>
    );
  }

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ue-bg">
        <p className="text-ue-text text-xl">Loading dashboard...</p>
      </div>
    );
  }

  const character = dashboardData.character;
  const equipment = dashboardData.equipment;
  const achievements = dashboardData.achievements;

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col dark group/design-root"
      style={{
        background: `radial-gradient(circle at top right, rgba(245, 166, 35, 0.1), transparent 40%),
                     radial-gradient(circle at bottom left, rgba(0, 122, 255, 0.1), transparent 50%),
                     var(--ue-bg)`,
      }}
    >
      <style>{`
        :root {
          --ue-bg: #111111;
          --ue-panel: #1c1c1c;
          --ue-border: #333333;
          --ue-border-hover: #f5a623;
          --ue-text: #cccccc;
          --ue-text-darker: #7a7a7a;
          --ue-accent: #f5a623;
          --ue-accent-dark: #1A1A2E;
        }
        .clip-path-hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .clip-path-panel {
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .clip-path-button {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
        .clip-path-header {
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
        }
        .progress-bar {
          background: linear-gradient(90deg, rgba(245, 166, 35, 0.8), rgba(245, 166, 35, 0.4));
          border-radius: 4px;
          overflow: hidden;
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(51, 51, 51, 0.5);
        }
        .achievement-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(28, 28, 28, 0.8);
          border: 1px solid #333333;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .achievement-badge:hover {
          border-color: #f5a623;
          background: rgba(28, 28, 28, 0.95);
        }
      `}</style>

      <div className="layout-container flex h-full grow flex-row">
        {/* Sidebar */}
        <div className="flex h-auto min-h-screen w-64 flex-col border-r border-ue-border p-4 bg-ue-bg/50">
          <div className="flex flex-col gap-4">
            {character && (
              <div className="flex items-center gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover size-12 clip-path-hexagon"
                  style={{
                    backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}')`,
                  }}
                />
                <div className="flex flex-col">
                  <h1 className="text-white text-base font-bold leading-normal">{character.name}</h1>
                  <p className="text-ue-text-darker text-sm font-normal leading-normal">
                    Level {character.level} {characterHooks.getClassName(character.characterClass)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-6">
              <a className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-ue-panel clip-path-button text-ue-text-darker" href="#character">
                <span className="material-symbols-outlined">person</span>
                <p className="text-sm font-medium leading-normal">Character</p>
              </a>
              <a className="relative flex items-center gap-3 px-3 py-2 bg-ue-panel clip-path-button text-white" href="#dashboard">
                <div className="absolute left-0 top-0 h-full w-1 bg-ue-accent"></div>
                <span className="material-symbols-outlined text-ue-accent">dashboard</span>
                <p className="text-sm font-bold leading-normal">Dashboard</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-ue-panel clip-path-button text-ue-text-darker" href="#equipment">
                <span className="material-symbols-outlined">shield</span>
                <p className="text-sm font-medium leading-normal">Equipment</p>
              </a>
              <a className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-ue-panel clip-path-button text-ue-text-darker" href="#achievements">
                <span className="material-symbols-outlined">trophy</span>
                <p className="text-sm font-medium leading-normal">Achievements</p>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex w-full flex-col gap-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4 border-b-2 border-ue-border pb-4">
              <div className="flex flex-col gap-1">
                <p className="text-ue-text-darker text-sm font-bold uppercase tracking-widest">USER OVERVIEW</p>
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">DASHBOARD</h1>
              </div>
              {character && (
                <div className="flex items-center gap-2 text-ue-text">
                  <span className="material-symbols-outlined text-ue-accent">wallet</span>
                  <p className="text-sm">MMR: <span className="text-ue-accent font-bold">{Number(character.mmr)}</span></p>
                </div>
              )}
            </div>

            {/* Character Stats Section */}
            {character && (
              <div id="character" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Card */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="bg-ue-panel p-3 pl-4 clip-path-header">
                    <h2 className="text-white text-xl font-bold tracking-wider uppercase">Character Stats</h2>
                  </div>

                  {/* Basic Stats */}
                  <div className="bg-ue-panel p-6 clip-path-panel border border-ue-border">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Combat Stats */}
                      <div>
                        <h3 className="text-ue-accent font-bold uppercase text-sm mb-4">Combat Stats</h3>
                        <div className="stat-item">
                          <span className="text-ue-text-darker">HP</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 progress-bar">
                              <div
                                style={{
                                  width: `${(Number(character.hp) / Number(character.maxHp)) * 100}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #00FF00, #76FF03)',
                                }}
                              />
                            </div>
                            <span className="text-white font-bold text-sm">
                              {Number(character.hp)}/{Number(character.maxHp)}
                            </span>
                          </div>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Damage</span>
                          <span className="text-white font-bold">
                            {character.damageMin}-{character.damageMax}
                          </span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Crit Chance</span>
                          <span className="text-white font-bold">{character.critChance}%</span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Dodge Chance</span>
                          <span className="text-white font-bold">{character.dodgeChance}%</span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Defense</span>
                          <span className="text-white font-bold">{character.defense}</span>
                        </div>
                      </div>

                      {/* Battle Stats */}
                      <div>
                        <h3 className="text-ue-accent font-bold uppercase text-sm mb-4">Battle History</h3>
                        <div className="stat-item">
                          <span className="text-ue-text-darker">Total Wins</span>
                          <span className="text-green-400 font-bold">{character.totalWins}</span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Total Losses</span>
                          <span className="text-red-400 font-bold">{character.totalLosses}</span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Win Rate</span>
                          <span className="text-ue-accent font-bold">
                            {characterHooks.getWinRate(character)}%
                          </span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">Win Streak</span>
                          <span className="text-yellow-400 font-bold">{character.winStreak}</span>
                        </div>

                        <div className="stat-item">
                          <span className="text-ue-text-darker">XP Progress</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 progress-bar">
                              <div
                                style={{
                                  width: '45%',
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #00FFFF, #76FF03)',
                                }}
                              />
                            </div>
                            <span className="text-white font-bold text-sm">{Number(character.xp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Summary */}
                <div className="flex flex-col gap-4">
                  <div className="bg-ue-panel p-3 pl-4 clip-path-header">
                    <h2 className="text-white text-lg font-bold tracking-wider uppercase">Skills</h2>
                  </div>

                  <div className="bg-ue-panel p-4 clip-path-panel border border-ue-border space-y-3">
                    {character.skillSlot1 > 0 && (
                      <div className="border-l-4 border-ue-accent pl-3">
                        <p className="text-white text-sm font-bold">Slot 1</p>
                        <p className="text-ue-text-darker text-xs">Equipped</p>
                      </div>
                    )}
                    {character.skillSlot2 > 0 && (
                      <div className="border-l-4 border-ue-accent pl-3">
                        <p className="text-white text-sm font-bold">Slot 2</p>
                        <p className="text-ue-text-darker text-xs">Equipped</p>
                      </div>
                    )}
                    {character.skillSlot3 > 0 && (
                      <div className="border-l-4 border-ue-accent pl-3">
                        <p className="text-white text-sm font-bold">Slot 3</p>
                        <p className="text-ue-text-darker text-xs">Equipped</p>
                      </div>
                    )}
                    {character.skillSlot1 === 0 && character.skillSlot2 === 0 && character.skillSlot3 === 0 && (
                      <p className="text-ue-text-darker text-sm text-center py-4">No skills equipped</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {equipment.length > 0 && (
              <div id="equipment" className="flex flex-col gap-4">
                <div className="bg-ue-panel p-3 pl-4 clip-path-header">
                  <h2 className="text-white text-xl font-bold tracking-wider uppercase">Equipment</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="relative p-1 bg-gradient-to-br from-ue-border to-ue-panel clip-path-panel group">
                      <div className="bg-ue-panel clip-path-panel p-4 flex flex-col justify-between h-full border border-ue-border hover:border-ue-accent transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-ue-accent">shield</span>
                            <p className="text-white font-bold text-sm uppercase">
                              {equipmentHooks.getEquipmentTypeName(item.equipmentType)}
                            </p>
                          </div>
                          <p className="text-ue-text-darker text-xs mb-3">
                            Rarity: <span className="text-ue-accent font-bold">{equipmentHooks.getRarityName(item.rarity)}</span>
                          </p>
                        </div>

                        <div className="space-y-2 text-xs">
                          {item.hpBonus > 0 && (
                            <div className="flex justify-between text-ue-text-darker">
                              <span>HP Bonus</span>
                              <span className="text-green-400">+{item.hpBonus}</span>
                            </div>
                          )}
                          {item.damageMinBonus > 0 && (
                            <div className="flex justify-between text-ue-text-darker">
                              <span>Damage</span>
                              <span className="text-orange-400">+{item.damageMinBonus}-{item.damageMaxBonus}</span>
                            </div>
                          )}
                          {item.critBonus > 0 && (
                            <div className="flex justify-between text-ue-text-darker">
                              <span>Crit Bonus</span>
                              <span className="text-yellow-400">+{item.critBonus}%</span>
                            </div>
                          )}
                          {item.dodgeBonus > 0 && (
                            <div className="flex justify-between text-ue-text-darker">
                              <span>Dodge Bonus</span>
                              <span className="text-blue-400">+{item.dodgeBonus}%</span>
                            </div>
                          )}
                          <div className="flex justify-between text-ue-text-darker border-t border-ue-border pt-2 mt-2">
                            <span>Durability</span>
                            <span className="text-white">
                              {Number(item.durability)}/{Number(item.maxDurability)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {achievements && (
              <div id="achievements" className="flex flex-col gap-4">
                <div className="bg-ue-panel p-3 pl-4 clip-path-header">
                  <h2 className="text-white text-xl font-bold tracking-wider uppercase">
                    Achievements ({achievements.achievements?.length || 0}/10)
                  </h2>
                </div>

                <div className="bg-ue-panel p-6 clip-path-panel border border-ue-border">
                  <div className="mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-3 progress-bar overflow-hidden">
                          <div
                            style={{
                              width: `${achievementHooks.getCompletionPercentage(achievements.unlockedAchievements)}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, rgba(245, 166, 35, 0.8), rgba(245, 166, 35, 0.4))',
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-ue-accent font-bold">
                        {achievementHooks.getCompletionPercentage(achievements.unlockedAchievements)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {achievementHooks.getAllAchievements().map((achievement) => {
                      const isUnlocked = achievementHooks.hasAchievement(achievements.unlockedAchievements, achievement.id);
                      return (
                        <div
                          key={achievement.id}
                          className={`achievement-badge ${isUnlocked ? 'border-ue-accent' : 'opacity-50'}`}
                        >
                          <div className="text-4xl">{achievement.icon}</div>
                          <p className="text-white font-bold text-xs text-center line-clamp-2">{achievement.name}</p>
                          {!isUnlocked && <p className="text-ue-text-darker text-xs">Locked</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {!character && !dashboardData.error && (
              <div className="text-center py-12">
                <p className="text-ue-text text-lg">No character found. Create your first character to get started!</p>
              </div>
            )}

            {/* Error State */}
            {dashboardData.error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-400">
                <p>Error: {dashboardData.error}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
