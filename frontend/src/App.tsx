
import React, { useMemo, useRef, useState } from 'react';

import './styles/FighterGame.css';

import { useWallet } from './hooks/useWallet';
import {
  useCharacter,
  useEquipment,
  useSkills,
  useBattle,
  useTournament,
  useLeaderboard,
  useAchievements,
  useTreasury,
  type Character,
} from './hooks';
import { CLASS_NAMES } from './hooks/useContract';

type TabId =
  | 'dashboard'
  | 'battles'
  | 'characters'
  | 'equipment'
  | 'skills'
  | 'tournaments'
  | 'leaderboard'
  | 'achievements'
  | 'treasury';

type ActivityKind =
  | 'system'
  | 'character'
  | 'battle'
  | 'equipment'
  | 'skill'
  | 'tournament'
  | 'leaderboard'
  | 'achievement'
  | 'treasury';

interface ActivityItem {
  id: number;
  kind: ActivityKind;
  title: string;
  description?: string;
  timestamp: Date;
}

type CharacterHook = ReturnType<typeof useCharacter>;
type EquipmentHook = ReturnType<typeof useEquipment>;
type SkillsHook = ReturnType<typeof useSkills>;
type BattleHook = ReturnType<typeof useBattle>;
type TournamentHook = ReturnType<typeof useTournament>;
type LeaderboardHook = ReturnType<typeof useLeaderboard>;
type AchievementsHook = ReturnType<typeof useAchievements>;
type TreasuryHook = ReturnType<typeof useTreasury>;

function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getNetworkLabel(apiUrl: string | undefined): string {
  if (!apiUrl) {
    return 'Unknown';
  }
  const lower = apiUrl.toLowerCase();
  if (lower.includes('buildnet')) return 'Buildnet';
  if (lower.includes('testnet')) return 'Testnet';
  if (lower.includes('mainnet')) return 'Mainnet';
  return 'Custom';
}

function renderTabButton(
  id: TabId,
  label: string,
  activeTab: TabId,
  setActiveTab: (tab: TabId) => void,
) {
  const isActive = activeTab === id;
  return (
    <button
      key={id}
      type="button"
      className={`fg-nav-tab${isActive ? ' fg-nav-tab-active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );
}

export default function App() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  const {
    isConnected,
    userAddress,
    provider,
    loading: walletLoading,
    error: walletError,
    connect,
    disconnect,
  } = useWallet();

  const effectiveContractAddress = contractAddress ?? '';

  const characterHook = useCharacter(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const equipmentHook = useEquipment(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const skillsHook = useSkills(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const battleHook = useBattle(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const tournamentHook = useTournament(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const leaderboardHook = useLeaderboard(effectiveContractAddress, provider);
  const achievementsHook = useAchievements(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );
  const treasuryHook = useTreasury(
    effectiveContractAddress,
    isConnected,
    provider,
    userAddress,
  );

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [knownCharacters, setKnownCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const activityIdRef = useRef(0);

  const mainCharacter = useMemo(
    () => knownCharacters.find((c) => c.id === selectedCharacterId) ?? null,
    [knownCharacters, selectedCharacterId],
  );

  function handleCharacterLoaded(character: Character) {
    setKnownCharacters((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === character.id);
      if (existingIndex !== -1) {
        const copy = [...prev];
        copy[existingIndex] = character;
        return copy;
      }
      return [...prev, character];
    });
    setSelectedCharacterId((current) => current ?? character.id);
  }

  function handleCharacterSelected(characterId: string) {
    setSelectedCharacterId(characterId);
  }

  function pushActivity(kind: ActivityKind, title: string, description?: string) {
    setActivityItems((prev) => {
      const id = activityIdRef.current;
      activityIdRef.current = id + 1;

      const item: ActivityItem = {
        id,
        kind,
        title,
        description,
        timestamp: new Date(),
      };

      return [item, ...prev].slice(0, 50);
    });
  }

  const contractConfigured = Boolean(contractAddress);

  return (
    <div className="fg-app">
      <header className="fg-header">
        <div className="fg-logo">
          <div className="fg-logo-mark">FG</div>
          <div className="fg-logo-text">
            <div className="fg-logo-title">Fighter Game</div>
            <div className="fg-logo-subtitle">On-chain PvP arena on Massa</div>
          </div>
        </div>

        <nav className="fg-nav">
          {renderTabButton('dashboard', 'Dashboard', activeTab, setActiveTab)}
          {renderTabButton('battles', 'Battles', activeTab, setActiveTab)}
          {renderTabButton('characters', 'Characters', activeTab, setActiveTab)}
          {renderTabButton('equipment', 'Equipment', activeTab, setActiveTab)}
          {renderTabButton('skills', 'Skills', activeTab, setActiveTab)}
          {renderTabButton('tournaments', 'Tournaments', activeTab, setActiveTab)}
          {renderTabButton('leaderboard', 'Leaderboard', activeTab, setActiveTab)}
          {renderTabButton('achievements', 'Achievements', activeTab, setActiveTab)}
          {renderTabButton('treasury', 'Treasury', activeTab, setActiveTab)}
        </nav>

        <div className="fg-header-right">
          <div className="fg-network-pill">
            <span className="fg-network-dot" />
            <span className="fg-network-label">{getNetworkLabel(apiUrl)}</span>
          </div>

          <div className="fg-wallet">
            {walletLoading ? (
              <span className="fg-wallet-status">Connecting...</span>
            ) : isConnected ? (
              <>
                <span className="fg-wallet-address">{formatAddress(userAddress)}</span>
                <button
                  type="button"
                  className="fg-button fg-button-ghost"
                  onClick={disconnect}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                className="fg-button"
                onClick={connect}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="fg-main-layout">
        <main className="fg-main-content">
          {!contractConfigured && (
            <div className="fg-banner fg-banner-warning">
              <strong>Contract address not configured.</strong>{' '}
              Set VITE_CONTRACT_ADDRESS in your .env file to interact with the game
              contract.
            </div>
          )}
          {walletError && (
            <div className="fg-banner fg-banner-error">
              {walletError}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              isConnected={isConnected}
              userAddress={userAddress}
              mainCharacter={mainCharacter}
              knownCharacters={knownCharacters}
              characterHook={characterHook}
              leaderboardHook={leaderboardHook}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'characters' && (
            <CharactersView
              isConnected={isConnected}
              contractConfigured={contractConfigured}
              knownCharacters={knownCharacters}
              selectedCharacterId={selectedCharacterId}
              onCharacterLoaded={handleCharacterLoaded}
              onCharacterSelected={handleCharacterSelected}
              characterHook={characterHook}
              pushActivity={pushActivity}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentView
              isConnected={isConnected}
              contractConfigured={contractConfigured}
              knownCharacters={knownCharacters}
              characterHook={characterHook}
              equipmentHook={equipmentHook}
              onCharacterUpdated={handleCharacterLoaded}
              pushActivity={pushActivity}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsView
              isConnected={isConnected}
              contractConfigured={contractConfigured}
              knownCharacters={knownCharacters}
              characterHook={characterHook}
              skillsHook={skillsHook}
              onCharacterUpdated={handleCharacterLoaded}
              pushActivity={pushActivity}
            />
          )}

          {activeTab === 'battles' && (
            <BattleView
              isConnected={isConnected}
              contractConfigured={contractConfigured}
              knownCharacters={knownCharacters}
              battleHook={battleHook}
              mainCharacter={mainCharacter}
              pushActivity={pushActivity}
            />
          )}

          {activeTab === 'tournaments' && (
            <TournamentsView
              isConnected={isConnected}
              contractConfigured={contractConfigured}
              knownCharacters={knownCharacters}
              tournamentHook={tournamentHook}
              pushActivity={pushActivity}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              leaderboardHook={leaderboardHook}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsView
              isConnected={isConnected}
              userAddress={userAddress}
              achievementsHook={achievementsHook}
            />
          )}

          {activeTab === 'treasury' && (
            <TreasuryView
              isConnected={isConnected}
              userAddress={userAddress}
              treasuryHook={treasuryHook}
            />
          )}
        </main>

        <aside className="fg-activity-panel">
          <ActivityPanel items={activityItems} />
        </aside>
      </div>
    </div>
  );
}

interface DashboardViewProps {
  isConnected: boolean;
  userAddress: string;
  mainCharacter: Character | null;
  knownCharacters: Character[];
  characterHook: CharacterHook;
  leaderboardHook: LeaderboardHook;
  onNavigate: (tab: TabId) => void;
}

function DashboardView({
  isConnected,
  userAddress,
  mainCharacter,
  knownCharacters,
  characterHook,
  leaderboardHook,
  onNavigate,
}: DashboardViewProps) {
  const { getClassName, getWinRate } = characterHook;
  const { getMmrTierColor, formatMmrWithTier } = leaderboardHook;

  const totalCharacters = knownCharacters.length;
  const hasCharacter = Boolean(mainCharacter);

  const mainWinRate = mainCharacter ? getWinRate(mainCharacter) : 0;
  const mainMmrNumber = mainCharacter ? Number(mainCharacter.mmr) : 0;
  const mainMmrLabel = hasCharacter ? formatMmrWithTier(mainMmrNumber) : 'Unranked';
  const mainMmrColor = getMmrTierColor(mainMmrNumber);

  return (
    <div className="fg-dashboard">
      <section className="fg-card fg-card-wide">
        <div className="fg-card-header">
          <h1 className="fg-page-title">Arena Overview</h1>
          <p className="fg-page-subtitle">
            Manage your fighters, equip legendary gear, and climb the on-chain leaderboard.
          </p>
        </div>

        <div className="fg-quick-actions">
          <button
            type="button"
            className="fg-button"
            onClick={() => onNavigate('characters')}
          >
            Create Character
          </button>
          <button
            type="button"
            className="fg-button fg-button-outline"
            onClick={() => onNavigate('battles')}
          >
            Start Battle
          </button>
          <button
            type="button"
            className="fg-button fg-button-outline"
            onClick={() => onNavigate('tournaments')}
          >
            Join Tournament
          </button>
        </div>
      </section>

      <div className="fg-grid fg-grid-dashboard">
        <section className="fg-card">
          <h2 className="fg-section-title">Player Profile</h2>
          {!isConnected ? (
            <p className="fg-muted">
              Connect your Massa wallet to begin creating fighters and battling on-chain.
            </p>
          ) : (
            <>
              <div className="fg-profile-row">
                <span className="fg-label">Address</span>
                <span className="fg-value-mono">{formatAddress(userAddress)}</span>
              </div>
              <div className="fg-profile-row">
                <span className="fg-label">Fighters Known</span>
                <span className="fg-value-strong">{totalCharacters}</span>
              </div>
              {hasCharacter && mainCharacter && (
                <>
                  <div className="fg-profile-row">
                    <span className="fg-label">Main Fighter</span>
                    <span className="fg-value-strong">
                      {mainCharacter.name}{' '}
                      <span className="fg-tag">
                        {getClassName(mainCharacter.characterClass)}
                      </span>
                    </span>
                  </div>
                  <div className="fg-profile-row">
                    <span className="fg-label">Level</span>
                    <span className="fg-value">{mainCharacter.level}</span>
                  </div>
                  <div className="fg-profile-row">
                    <span className="fg-label">MMR</span>
                    <span className="fg-value" style={{ color: mainMmrColor }}>
                      {mainMmrLabel}
                    </span>
                  </div>
                  <div className="fg-profile-row">
                    <span className="fg-label">Win Rate</span>
                    <span className="fg-value">{mainWinRate}%</span>
                  </div>
                </>
              )}
              {!hasCharacter && (
                <p className="fg-muted">
                  No fighters loaded yet. Create a character in the Characters tab to begin.
                </p>
              )}
            </>
          )}
        </section>

        <section className="fg-card">
          <h2 className="fg-section-title">Game Systems</h2>
          <ul className="fg-bullet-list">
            <li>On-chain turn-based battles with randomness and status effects</li>
            <li>Equipment NFTs with rarity tiers and durability</li>
            <li>Skill system with energy, cooldowns, and combos</li>
            <li>Tournaments with prize pools and MMR-based leaderboards</li>
          </ul>
        </section>

        <section className="fg-card">
          <h2 className="fg-section-title">Next Steps</h2>
          <ol className="fg-steps-list">
            <li>Create a fighter with your preferred class.</li>
            <li>Learn and equip skills to define your playstyle.</li>
            <li>Mint or equip gear to boost stats.</li>
            <li>Challenge other fighters in Battles or join a Tournament.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

interface CharactersViewProps {
  isConnected: boolean;
  contractConfigured: boolean;
  knownCharacters: Character[];
  selectedCharacterId: string | null;
  onCharacterLoaded: (character: Character) => void;
  onCharacterSelected: (id: string) => void;
  characterHook: CharacterHook;
  pushActivity: (kind: ActivityKind, title: string, description?: string) => void;
}

function CharactersView({
  isConnected,
  contractConfigured,
  knownCharacters,
  selectedCharacterId,
  onCharacterLoaded,
  onCharacterSelected,
  characterHook,
  pushActivity,
}: CharactersViewProps) {
  const {
    createCharacter,
    readCharacter,
    getClassName,
    getWinRate,
    loading,
    error,
  } = characterHook;

  const [createId, setCreateId] = useState('');
  const [createName, setCreateName] = useState('');
  const [createClassId, setCreateClassId] = useState(0);
  const [loadId, setLoadId] = useState('');

  const selectedCharacter =
    knownCharacters.find((c) => c.id === selectedCharacterId) ?? null;

  async function handleCreateCharacter(event: React.FormEvent) {
    event.preventDefault();
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    if (!isConnected) {
      pushActivity('system', 'Wallet not connected', 'Connect your wallet to create a character.');
      return;
    }
    if (!createId.trim() || !createName.trim()) {
      pushActivity('character', 'Missing fields', 'Please provide both ID and name.');
      return;
    }

    try {
      await createCharacter(createId.trim(), createClassId, createName.trim());
      const created = await readCharacter(createId.trim());
      if (created) {
        onCharacterLoaded(created);
        pushActivity(
          'character',
          'Character created',
          `${created.name} (${getClassName(created.characterClass)})`,
        );
        setCreateName('');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create character';
      pushActivity('character', 'Character creation failed', message);
    }
  }

  async function handleLoadCharacter(event: React.FormEvent) {
    event.preventDefault();
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    if (!loadId.trim()) {
      return;
    }
    try {
      const character = await readCharacter(loadId.trim());
      if (character) {
        onCharacterLoaded(character);
        onCharacterSelected(character.id);
        pushActivity(
          'character',
          'Character loaded',
          `${character.name} (${getClassName(character.characterClass)})`,
        );
      } else {
        pushActivity('character', 'Character not found', loadId.trim());
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load character';
      pushActivity('character', 'Character load failed', message);
    }
  }

  return (
    <div className="fg-characters">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Characters</h1>
        <p className="fg-page-subtitle">
          Create and manage your fighters. Each class has unique base stats and growth.
        </p>

        <div className="fg-character-forms">
          <form className="fg-form fg-form-inline" onSubmit={handleCreateCharacter}>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="create-id">
                Character ID
              </label>
              <input
                id="create-id"
                className="fg-input"
                value={createId}
                onChange={(e) => setCreateId(e.target.value)}
                placeholder="e.g. fighter-001"
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="create-name">
                Name
              </label>
              <input
                id="create-name"
                className="fg-input"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Fighter name"
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="create-class">
                Class
              </label>
              <select
                id="create-class"
                className="fg-input"
                value={createClassId}
                onChange={(e) => setCreateClassId(Number(e.target.value))}
              >
                {CLASS_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="fg-button"
              disabled={loading}
            >
              Create
            </button>
          </form>

          <form className="fg-form fg-form-inline" onSubmit={handleLoadCharacter}>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="load-id">
                Load by ID
              </label>
              <input
                id="load-id"
                className="fg-input"
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
                placeholder="Existing character ID"
              />
            </div>
            <button
              type="submit"
              className="fg-button fg-button-outline"
              disabled={loading}
            >
              Load
            </button>
          </form>

          {error && (
            <div className="fg-banner fg-banner-error fg-banner-small">
              {error}
            </div>
          )}
        </div>
      </section>

      <div className="fg-grid fg-grid-two">
        <section className="fg-card">
          <h2 className="fg-section-title">Your Fighters</h2>
          {knownCharacters.length === 0 ? (
            <p className="fg-muted">
              No characters loaded yet. Create a fighter or load an existing one by ID.
            </p>
          ) : (
            <div className="fg-character-list">
              {knownCharacters.map((character) => {
                const isActive = character.id === selectedCharacterId;
                const winRate = getWinRate(character);
                return (
                  <button
                    key={character.id}
                    type="button"
                    className={`fg-character-card${
                      isActive ? ' fg-character-card-active' : ''
                    }`}
                    onClick={() => onCharacterSelected(character.id)}
                  >
                    <div className="fg-character-card-header">
                      <div className="fg-character-name">{character.name}</div>
                      <span className="fg-tag">{getClassName(character.characterClass)}</span>
                    </div>
                    <div className="fg-character-meta">
                      <span>Level {character.level}</span>
                      <span>{Number(character.mmr)} MMR</span>
                      <span>{winRate}% WR</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="fg-card">
          <h2 className="fg-section-title">Details</h2>
          {!selectedCharacter ? (
            <p className="fg-muted">
              Select a fighter on the left to view detailed stats.
            </p>
          ) : (
            <div className="fg-character-detail">
              <h3 className="fg-character-detail-name">
                {selectedCharacter.name}{' '}
                <span className="fg-tag">
                  {getClassName(selectedCharacter.characterClass)}
                </span>
              </h3>

              <div className="fg-stat-grid">
                <div className="fg-stat-row">
                  <span className="fg-label">Level</span>
                  <span className="fg-value">{selectedCharacter.level}</span>
                </div>
                <div className="fg-stat-row">
                  <span className="fg-label">HP</span>
                  <span className="fg-value">
                    {selectedCharacter.hp}/{selectedCharacter.maxHp}
                  </span>
                </div>
                <div className="fg-stat-row">
                  <span className="fg-label">Damage</span>
                  <span className="fg-value">
                    {selectedCharacter.damageMin}-{selectedCharacter.damageMax}
                  </span>
                </div>
                <div className="fg-stat-row">
                  <span className="fg-label">Crit</span>
                  <span className="fg-value">{selectedCharacter.critChance}%</span>
                </div>
                <div className="fg-stat-row">
                  <span className="fg-label">Dodge</span>
                  <span className="fg-value">{selectedCharacter.dodgeChance}%</span>
                </div>
                <div className="fg-stat-row">
                  <span className="fg-label">Defense</span>
                  <span className="fg-value">{selectedCharacter.defense}</span>
                </div>
              </div>

              <div className="fg-character-slots">
                <div>
                  <div className="fg-label">Weapon</div>
                  <div className="fg-slot">
                    {selectedCharacter.weaponId || <span className="fg-muted">None equipped</span>}
                  </div>
                </div>
                <div>
                  <div className="fg-label">Armor</div>
                  <div className="fg-slot">
                    {selectedCharacter.armorId || <span className="fg-muted">None equipped</span>}
                  </div>
                </div>
                <div>
                  <div className="fg-label">Accessory</div>
                  <div className="fg-slot">
                    {selectedCharacter.accessoryId || <span className="fg-muted">None equipped</span>}
                  </div>
                </div>
              </div>

              <div className="fg-character-skills">
                <div>
                  <div className="fg-label">Skill Slot 1</div>
                  <div className="fg-slot">
                    {selectedCharacter.skillSlot1 || <span className="fg-muted">Empty</span>}
                  </div>
                </div>
                <div>
                  <div className="fg-label">Skill Slot 2</div>
                  <div className="fg-slot">
                    {selectedCharacter.skillSlot2 || <span className="fg-muted">Empty</span>}
                  </div>
                </div>
                <div>
                  <div className="fg-label">Skill Slot 3</div>
                  <div className="fg-slot">
                    {selectedCharacter.skillSlot3 || <span className="fg-muted">Empty</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface EquipmentViewProps {
  isConnected: boolean;
  contractConfigured: boolean;
  knownCharacters: Character[];
  characterHook: CharacterHook;
  equipmentHook: EquipmentHook;
  onCharacterUpdated: (character: Character) => void;
  pushActivity: (kind: ActivityKind, title: string, description?: string) => void;
}

interface LocalEquipment {
  id: string;
  summary: string;
}

function EquipmentView({
  isConnected,
  contractConfigured,
  knownCharacters,
  characterHook,
  equipmentHook,
  onCharacterUpdated,
  pushActivity,
}: EquipmentViewProps) {
  const { readCharacter } = characterHook;
  const {
    readEquipment,
    equipItem,
    unequipItem,
    transferEquipment,
    repairEquipment,
    getEquipmentTypeName,
    getRarityName,
    loading,
    error,
  } = equipmentHook;

  const [equipmentId, setEquipmentId] = useState('');
  const [loadedEquipment, setLoadedEquipment] = useState<LocalEquipment[]>([]);
  const [selectedCharId, setSelectedCharId] = useState('');

  async function handleLoadEquipment(event: React.FormEvent) {
    event.preventDefault();
    if (!equipmentId.trim()) return;
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    try {
      const equipment = await readEquipment(equipmentId.trim());
      if (!equipment) {
        pushActivity('equipment', 'Equipment not found', equipmentId.trim());
        return;
      }
      const summary = `${getEquipmentTypeName(
        equipment.equipmentType,
      )} · ${getRarityName(equipment.rarity)}`;
      setLoadedEquipment((prev) => {
        const exists = prev.find((e) => e.id === equipment.id);
        if (exists) return prev;
        return [...prev, { id: equipment.id, summary }];
      });
      pushActivity('equipment', 'Equipment loaded', equipment.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load equipment';
      pushActivity('equipment', 'Equipment load failed', message);
    }
  }

  async function handleEquip(id: string) {
    if (!isConnected || !selectedCharId) {
      pushActivity('equipment', 'Select character', 'Choose a character to equip this item to.');
      return;
    }
    try {
      await equipItem(selectedCharId, id);
      const updated = await readCharacter(selectedCharId);
      if (updated) {
        onCharacterUpdated(updated);
      }
      pushActivity('equipment', 'Item equipped', `${id} → ${selectedCharId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to equip item';
      pushActivity('equipment', 'Equip failed', message);
    }
  }

  async function handleUnequip(id: string) {
    if (!isConnected || !selectedCharId) {
      pushActivity('equipment', 'Select character', 'Choose a character to unequip from.');
      return;
    }
    try {
      await unequipItem(selectedCharId, id);
      const updated = await readCharacter(selectedCharId);
      if (updated) {
        onCharacterUpdated(updated);
      }
      pushActivity('equipment', 'Item unequipped', `${id} ← ${selectedCharId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to unequip item';
      pushActivity('equipment', 'Unequip failed', message);
    }
  }

  async function handleRepair(id: string) {
    try {
      await repairEquipment(id);
      pushActivity('equipment', 'Equipment repaired', id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to repair equipment';
      pushActivity('equipment', 'Repair failed', message);
    }
  }

  async function handleTransfer(id: string) {
    const to = window.prompt('Enter destination address for transfer:');
    if (!to) return;
    try {
      await transferEquipment(id, to);
      pushActivity('equipment', 'Equipment transferred', `${id} → ${formatAddress(to)}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to transfer equipment';
      pushActivity('equipment', 'Transfer failed', message);
    }
  }

  return (
    <div className="fg-equipment">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Equipment</h1>
        <p className="fg-page-subtitle">
          Load equipment by ID, then equip it to your fighters or manage transfers and repairs.
        </p>

        <form className="fg-form fg-form-inline" onSubmit={handleLoadEquipment}>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="equip-id">
              Equipment ID
            </label>
            <input
              id="equip-id"
              className="fg-input"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              placeholder="e.g. sword-epic-001"
            />
          </div>
          <button
            type="submit"
            className="fg-button"
            disabled={loading}
          >
            Load
          </button>
        </form>

        {error && (
          <div className="fg-banner fg-banner-error fg-banner-small">
            {error}
          </div>
        )}

        <div className="fg-form">
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="equip-char">
              Equip / Unequip Character
            </label>
            <select
              id="equip-char"
              className="fg-input"
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
            >
              <option value="">Select character</option>
              {knownCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name} ({character.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="fg-card fg-card-wide">
        <h2 className="fg-section-title">Loaded Equipment</h2>
        {loadedEquipment.length === 0 ? (
          <p className="fg-muted">
            No equipment loaded yet. Enter an equipment ID and click Load to view it here.
          </p>
        ) : (
          <div className="fg-equipment-grid">
            {loadedEquipment.map((item) => (
              <div key={item.id} className="fg-equipment-card">
                <div className="fg-equipment-header">
                  <div className="fg-equipment-id">{item.id}</div>
                  <div className="fg-equipment-summary">{item.summary}</div>
                </div>
                <div className="fg-equipment-actions">
                  <button
                    type="button"
                    className="fg-chip-button"
                    onClick={() => handleEquip(item.id)}
                  >
                    Equip
                  </button>
                  <button
                    type="button"
                    className="fg-chip-button"
                    onClick={() => handleUnequip(item.id)}
                  >
                    Unequip
                  </button>
                  <button
                    type="button"
                    className="fg-chip-button"
                    onClick={() => handleRepair(item.id)}
                  >
                    Repair
                  </button>
                  <button
                    type="button"
                    className="fg-chip-button"
                    onClick={() => handleTransfer(item.id)}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="fg-caption">
          Rarity colors and full stat bonuses can be fetched via the contract and displayed here.
          The helper functions getEquipmentTypeName, getRarityName, and getRarityColor are already
          wired for that purpose.
        </p>
      </section>
    </div>
  );
}

interface SkillsViewProps {
  isConnected: boolean;
  contractConfigured: boolean;
  knownCharacters: Character[];
  characterHook: CharacterHook;
  skillsHook: SkillsHook;
  onCharacterUpdated: (character: Character) => void;
  pushActivity: (kind: ActivityKind, title: string, description?: string) => void;
}

function SkillsView({
  isConnected,
  contractConfigured,
  knownCharacters,
  characterHook,
  skillsHook,
  onCharacterUpdated,
  pushActivity,
}: SkillsViewProps) {
  const { readCharacter } = characterHook;
  const {
    getAllSkills,
    learnSkill,
    equipSkill,
    hasLearnedSkill,
    getSkillInfo,
    loading,
    error,
  } = skillsHook;

  const [selectedCharId, setSelectedCharId] = useState('');
  const [selectedSkillSlot, setSelectedSkillSlot] = useState(1);

  const selectedCharacter =
    knownCharacters.find((c) => c.id === selectedCharId) ?? null;

  async function handleLearnSkill(skillId: number) {
    if (!isConnected) {
      pushActivity('skill', 'Wallet not connected', 'Connect your wallet to learn skills.');
      return;
    }
    if (!selectedCharId) {
      pushActivity('skill', 'Select character', 'Choose a character to learn this skill.');
      return;
    }
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    try {
      await learnSkill(selectedCharId, skillId);
      const updated = await readCharacter(selectedCharId);
      if (updated) {
        onCharacterUpdated(updated);
      }
      const info = getSkillInfo(skillId);
      pushActivity(
        'skill',
        'Skill learned',
        info ? `${info.name} on ${selectedCharId}` : `Skill ${skillId}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to learn skill';
      pushActivity('skill', 'Skill learning failed', message);
    }
  }

  async function handleEquipSkill(skillId: number) {
    if (!isConnected) {
      pushActivity('skill', 'Wallet not connected', 'Connect your wallet to equip skills.');
      return;
    }
    if (!selectedCharId) {
      pushActivity('skill', 'Select character', 'Choose a character to equip this skill.');
      return;
    }
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    try {
      await equipSkill(selectedCharId, skillId, selectedSkillSlot);
      const updated = await readCharacter(selectedCharId);
      if (updated) {
        onCharacterUpdated(updated);
      }
      const info = getSkillInfo(skillId);
      pushActivity(
        'skill',
        'Skill equipped',
        info ? `${info.name} → slot ${selectedSkillSlot}` : `Skill ${skillId}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to equip skill';
      pushActivity('skill', 'Skill equip failed', message);
    }
  }

  const skills = getAllSkills();

  return (
    <div className="fg-skills">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Skills</h1>
        <p className="fg-page-subtitle">
          Learn and equip skills to define each fighter&apos;s combat style. Energy and cooldowns
          are enforced on-chain during battles.
        </p>

        <div className="fg-form fg-form-inline">
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="skills-char">
              Character
            </label>
            <select
              id="skills-char"
              className="fg-input"
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
            >
              <option value="">Select character</option>
              {knownCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name} ({character.id})
                </option>
              ))}
            </select>
          </div>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="skills-slot">
              Equip Slot
            </label>
            <select
              id="skills-slot"
              className="fg-input"
              value={selectedSkillSlot}
              onChange={(e) => setSelectedSkillSlot(Number(e.target.value))}
            >
              <option value={1}>Slot 1</option>
              <option value={2}>Slot 2</option>
              <option value={3}>Slot 3</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="fg-banner fg-banner-error fg-banner-small">
            {error}
          </div>
        )}
      </section>

      <section className="fg-card fg-card-wide">
        <h2 className="fg-section-title">Skill Library</h2>
        <div className="fg-skill-grid">
          {skills.map((skill) => {
            const learned =
              selectedCharacter != null &&
              hasLearnedSkill(selectedCharacter.learnedSkills, skill.id);
            return (
              <div key={skill.id} className="fg-skill-card">
                <div className="fg-skill-header">
                  <div className="fg-skill-name">{skill.name}</div>
                  <div className="fg-skill-meta">
                    <span>{skill.energyCost} energy</span>
                    <span>{skill.cooldown} turn CD</span>
                  </div>
                </div>
                <p className="fg-skill-description">{skill.description}</p>
                <div className="fg-skill-actions">
                  <button
                    type="button"
                    className="fg-chip-button"
                    disabled={loading || learned || !selectedCharId}
                    onClick={() => handleLearnSkill(skill.id)}
                  >
                    {learned ? 'Learned' : 'Learn'}
                  </button>
                  <button
                    type="button"
                    className="fg-chip-button"
                    disabled={loading || !selectedCharId}
                    onClick={() => handleEquipSkill(skill.id)}
                  >
                    Equip to slot {selectedSkillSlot}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface BattleViewProps {
  isConnected: boolean;
  contractConfigured: boolean;
  knownCharacters: Character[];
  battleHook: BattleHook;
  mainCharacter: Character | null;
  pushActivity: (kind: ActivityKind, title: string, description?: string) => void;
}

function BattleView({
  isConnected,
  contractConfigured,
  knownCharacters,
  battleHook,
  mainCharacter,
  pushActivity,
}: BattleViewProps) {
  const { createBattle, executeTurn, loading, error } = battleHook;

  const [battleId, setBattleId] = useState('');
  const [char1Id, setChar1Id] = useState(mainCharacter ? mainCharacter.id : '');
  const [char2Id, setChar2Id] = useState('');
  const [stance, setStance] = useState(1);
  const [useSpecial, setUseSpecial] = useState(false);
  const [skillSlot, setSkillSlot] = useState(1);

  async function handleCreateBattle(event: React.FormEvent) {
    event.preventDefault();
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    if (!isConnected) {
      pushActivity('battle', 'Wallet not connected', 'Connect your wallet to create battles.');
      return;
    }
    if (!battleId.trim() || !char1Id.trim() || !char2Id.trim()) {
      pushActivity('battle', 'Missing fields', 'Provide battle ID and both character IDs.');
      return;
    }
    try {
      await createBattle(battleId.trim(), char1Id.trim(), char2Id.trim());
      pushActivity(
        'battle',
        'Battle created',
        `${battleId.trim()}: ${char1Id.trim()} vs ${char2Id.trim()}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create battle';
      pushActivity('battle', 'Battle creation failed', message);
    }
  }

  async function handleExecuteTurn(event: React.FormEvent) {
    event.preventDefault();
    if (!isConnected) {
      pushActivity('battle', 'Wallet not connected', 'Connect your wallet to execute turns.');
      return;
    }
    if (!battleId.trim() || !char1Id.trim()) {
      pushActivity('battle', 'Missing fields', 'Provide battle ID and attacker character ID.');
      return;
    }
    try {
      await executeTurn(
        battleId.trim(),
        char1Id.trim(),
        stance,
        useSpecial,
        useSpecial ? skillSlot : 0,
      );
      pushActivity(
        'battle',
        'Turn executed',
        `Battle ${battleId.trim()}, attacker ${char1Id.trim()}, stance ${stance}, special ${
          useSpecial ? `slot ${skillSlot}` : 'none'
        }`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to execute turn';
      pushActivity('battle', 'Turn execution failed', message);
    }
  }

  return (
    <div className="fg-battles">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Battles</h1>
        <p className="fg-page-subtitle">
          Create and drive on-chain battles between your fighters. Detailed combat logs are emitted
          as blockchain events and can be visualized by extending this UI.
        </p>

        <form className="fg-form" onSubmit={handleCreateBattle}>
          <div className="fg-form-row">
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="battle-id">
                Battle ID
              </label>
              <input
                id="battle-id"
                className="fg-input"
                value={battleId}
                onChange={(e) => setBattleId(e.target.value)}
                placeholder="e.g. battle-001"
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="battle-char1">
                Character 1 (attacker)
              </label>
              <input
                id="battle-char1"
                className="fg-input"
                value={char1Id}
                onChange={(e) => setChar1Id(e.target.value)}
                placeholder="Character ID"
                list="battle-char-options"
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="battle-char2">
                Character 2
              </label>
              <input
                id="battle-char2"
                className="fg-input"
                value={char2Id}
                onChange={(e) => setChar2Id(e.target.value)}
                placeholder="Character ID"
                list="battle-char-options"
              />
            </div>
          </div>
          <datalist id="battle-char-options">
            {knownCharacters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </datalist>

          <button
            type="submit"
            className="fg-button"
            disabled={loading}
          >
            Create Battle
          </button>
        </form>

        <form className="fg-form fg-form-inline" onSubmit={handleExecuteTurn}>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="stance">
              Stance
            </label>
            <select
              id="stance"
              className="fg-input"
              value={stance}
              onChange={(e) => setStance(Number(e.target.value))}
            >
              <option value={0}>Defensive</option>
              <option value={1}>Neutral</option>
              <option value={2}>Aggressive</option>
            </select>
          </div>
          <div className="fg-form-group fg-form-group-inline">
            <label className="fg-checkbox">
              <input
                type="checkbox"
                checked={useSpecial}
                onChange={(e) => setUseSpecial(e.target.checked)}
              />
              Use special skill
            </label>
          </div>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="skill-slot">
              Skill slot
            </label>
            <select
              id="skill-slot"
              className="fg-input"
              value={skillSlot}
              onChange={(e) => setSkillSlot(Number(e.target.value))}
              disabled={!useSpecial}
            >
              <option value={1}>Slot 1</option>
              <option value={2}>Slot 2</option>
              <option value={3}>Slot 3</option>
            </select>
          </div>
          <button
            type="submit"
            className="fg-button fg-button-outline"
            disabled={loading}
          >
            Execute Turn
          </button>
        </form>

        {error && (
          <div className="fg-banner fg-banner-error fg-banner-small">
            {error}
          </div>
        )}

        <p className="fg-caption">
          Battle HP bars, energy, and status effect icons can be wired to the on-chain battle state
          (game_readBattle) when a JSON or structured view endpoint is available. For now, this
          panel focuses on sending battle actions to the contract.
        </p>
      </section>
    </div>
  );
}

interface TournamentsViewProps {
  isConnected: boolean;
  contractConfigured: boolean;
  knownCharacters: Character[];
  tournamentHook: TournamentHook;
  pushActivity: (kind: ActivityKind, title: string, description?: string) => void;
}

function TournamentsView({
  isConnected,
  contractConfigured,
  knownCharacters,
  tournamentHook,
  pushActivity,
}: TournamentsViewProps) {
  const {
    createTournament,
    registerTournament,
    getStateName,
    loading,
    error,
  } = tournamentHook;

  const [tournamentId, setTournamentId] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [entryFeeMas, setEntryFeeMas] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [registerCharId, setRegisterCharId] = useState('');

  async function handleCreateTournament(event: React.FormEvent) {
    event.preventDefault();
    if (!contractConfigured) {
      pushActivity(
        'system',
        'Contract not configured',
        'Set VITE_CONTRACT_ADDRESS in your .env file.',
      );
      return;
    }
    if (!isConnected) {
      pushActivity(
        'tournament',
        'Wallet not connected',
        'Connect your wallet to create tournaments.',
      );
      return;
    }
    if (!tournamentId.trim() || !tournamentName.trim()) {
      pushActivity(
        'tournament',
        'Missing fields',
        'Provide tournament ID and name.',
      );
      return;
    }

    try {
      const feeNanoMas = BigInt(entryFeeMas) * BigInt(1_000_000_000);
      await createTournament(
        tournamentId.trim(),
        tournamentName.trim(),
        feeNanoMas,
        maxParticipants,
      );
      pushActivity(
        'tournament',
        'Tournament created',
        `${tournamentName.trim()} (${maxParticipants} participants, ${entryFeeMas} MAS entry)`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create tournament';
      pushActivity('tournament', 'Tournament creation failed', message);
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (!tournamentId.trim() || !registerCharId.trim()) {
      return;
    }
    if (!isConnected) {
      pushActivity(
        'tournament',
        'Wallet not connected',
        'Connect your wallet to register for tournaments.',
      );
      return;
    }
    try {
      await registerTournament(tournamentId.trim(), registerCharId.trim());
      pushActivity(
        'tournament',
        'Registered for tournament',
        `${registerCharId.trim()} → ${tournamentId.trim()}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to register for tournament';
      pushActivity('tournament', 'Registration failed', message);
    }
  }

  const registrationStateName = getStateName(0);

  return (
    <div className="fg-tournaments">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Tournaments</h1>
        <p className="fg-page-subtitle">
          Create and register for single-elimination tournaments. Prize pools and bracket
          progression are handled on-chain.
        </p>

        <form className="fg-form" onSubmit={handleCreateTournament}>
          <div className="fg-form-row">
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="tourn-id">
                Tournament ID
              </label>
              <input
                id="tourn-id"
                className="fg-input"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                placeholder="e.g. arena-4"
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="tourn-name">
                Name
              </label>
              <input
                id="tourn-name"
                className="fg-input"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Arena Clash"
              />
            </div>
          </div>
          <div className="fg-form-row">
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="tourn-fee">
                Entry fee (MAS)
              </label>
              <input
                id="tourn-fee"
                type="number"
                min={0}
                className="fg-input"
                value={entryFeeMas}
                onChange={(e) => setEntryFeeMas(Number(e.target.value))}
              />
            </div>
            <div className="fg-form-group">
              <label className="fg-label" htmlFor="tourn-max">
                Participants
              </label>
              <select
                id="tourn-max"
                className="fg-input"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="fg-button"
            disabled={loading}
          >
            Create Tournament
          </button>
        </form>

        {error && (
          <div className="fg-banner fg-banner-error fg-banner-small">
            {error}
          </div>
        )}
      </section>

      <section className="fg-card fg-card-wide">
        <h2 className="fg-section-title">Register Fighter</h2>
        <p className="fg-caption">
          Current state label helper: <strong>{registrationStateName}</strong>. Bracket visualization
          can be wired when a read endpoint for tournament brackets is available.
        </p>
        <form className="fg-form fg-form-inline" onSubmit={handleRegister}>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="tourn-id-small">
              Tournament ID
            </label>
            <input
              id="tourn-id-small"
              className="fg-input"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              placeholder="Tournament ID"
            />
          </div>
          <div className="fg-form-group">
            <label className="fg-label" htmlFor="tourn-char">
              Character
            </label>
            <select
              id="tourn-char"
              className="fg-input"
              value={registerCharId}
              onChange={(e) => setRegisterCharId(e.target.value)}
            >
              <option value="">Select character</option>
              {knownCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name} ({character.id})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="fg-button fg-button-outline"
            disabled={loading}
          >
            Register
          </button>
        </form>
      </section>
    </div>
  );
}

interface LeaderboardViewProps {
  leaderboardHook: LeaderboardHook;
}

function LeaderboardView({ leaderboardHook }: LeaderboardViewProps) {
  const { getMmrTier, getMmrTierColor } = leaderboardHook;

  const sampleMmrValues = [800, 1200, 1600, 2000, 2500, 3000];

  return (
    <div className="fg-leaderboard">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Leaderboard</h1>
        <p className="fg-page-subtitle">
          The on-chain leaderboard ranks fighters by MMR. This view can be wired to{' '}
          <code>game_getLeaderboard</code> to display live rankings.
        </p>

        <table className="fg-table">
          <thead>
            <tr>
              <th>MMR</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {sampleMmrValues.map((mmr) => {
              const tier = getMmrTier(mmr);
              const color = getMmrTierColor(mmr);
              return (
                <tr key={mmr}>
                  <td>{mmr}</td>
                  <td style={{ color }}>{tier}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="fg-caption">
          To enable live data, call <code>leaderboardHook.getLeaderboard</code> and map returned
          entries into this table. The helper functions for tiers and colors are already available.
        </p>
      </section>
    </div>
  );
}

interface AchievementsViewProps {
  isConnected: boolean;
  userAddress: string;
  achievementsHook: AchievementsHook;
}

function AchievementsView({
  isConnected,
  userAddress,
  achievementsHook,
}: AchievementsViewProps) {
  const { getAllAchievements } = achievementsHook;

  const achievements = getAllAchievements();

  return (
    <div className="fg-achievements">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Achievements</h1>
        <p className="fg-page-subtitle">
          Achievements celebrate milestones like first win, win streaks, and legendary gear. The
          contract tracks them via a bitmask per player.
        </p>

        {!isConnected ? (
          <p className="fg-muted">
            Connect your wallet to view which achievements you have unlocked.
          </p>
        ) : (
          <p className="fg-muted">
            Connected as <span className="fg-value-mono">{formatAddress(userAddress)}</span>. The
            bitmask from <code>game_getAchievements</code> can be used with these definitions to
            mark achievements as unlocked.
          </p>
        )}
      </section>

      <section className="fg-card fg-card-wide">
        <h2 className="fg-section-title">Achievement Catalog</h2>
        <div className="fg-achievement-grid">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="fg-achievement-card">
              <div className="fg-achievement-icon">{achievement.icon}</div>
              <div className="fg-achievement-text">
                <div className="fg-achievement-name">{achievement.name}</div>
                <div className="fg-achievement-desc">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface TreasuryViewProps {
  isConnected: boolean;
  userAddress: string;
  treasuryHook: TreasuryHook;
}

function TreasuryView({
  isConnected,
  userAddress,
  treasuryHook,
}: TreasuryViewProps) {
  const { formatBalance, toNanoMas } = treasuryHook;

  const sampleTreasury = formatBalance(toNanoMas(123.4567));

  return (
    <div className="fg-treasury">
      <section className="fg-card fg-card-wide">
        <h1 className="fg-page-title">Treasury</h1>
        <p className="fg-page-subtitle">
          Battle and tournament fees accumulate in the on-chain treasury. Admins can withdraw or
          pause the contract via dedicated functions.
        </p>

        <div className="fg-grid fg-grid-two">
          <div>
            <div className="fg-label">Sample formatted balance</div>
            <div className="fg-value">{sampleTreasury}</div>
          </div>
          <div>
            <div className="fg-label">Connected as</div>
            <div className="fg-value-mono">
              {isConnected ? formatAddress(userAddress) : 'Not connected'}
            </div>
          </div>
        </div>

        <p className="fg-caption">
          To display live data, wire this view to <code>treasuryHook.getTreasuryBalance</code> and{' '}
          <code>treasuryHook.getFeeInfo</code>, then map recent events into a transaction table.
        </p>
      </section>
    </div>
  );
}

interface ActivityPanelProps {
  items: ActivityItem[];
}

function ActivityPanel({ items }: ActivityPanelProps) {
  return (
    <div className="fg-activity">
      <div className="fg-activity-header">
        <h2 className="fg-section-title">Activity</h2>
        <span className="fg-activity-count">{items.length}</span>
      </div>
      <div className="fg-activity-list">
        {items.length === 0 ? (
          <p className="fg-muted">
            Contract events, battle actions, and tournament updates will appear here as you play.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="fg-activity-item">
              <div className="fg-activity-top">
                <span className={`fg-activity-badge fg-activity-${item.kind}`}>
                  {item.kind}
                </span>
                <span className="fg-activity-time">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="fg-activity-title">{item.title}</div>
              {item.description && (
                <div className="fg-activity-description">{item.description}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
