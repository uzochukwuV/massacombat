import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { useCharacter } from '@/hooks/useCharacter';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { CLASS_NAMES, CLASS_DESCRIPTIONS, CLASS_STATS } from '@/utils/constants';

export function CharacterSelect() {
  const { isConnected, userAddress, provider, contractAddress, setCurrentCharacter, showNotification } = useGame();
  const { createCharacter, readCharacter, loading } = useCharacter(contractAddress, isConnected, provider, userAddress);
  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState(0);
  const [characterName, setCharacterName] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkExisting() {
      if (!isConnected || !userAddress) return;

      try {
        // Try to read existing character
        const charId = `${userAddress}_main`;
        const existing = await readCharacter(charId);

        if (existing) {
          setCurrentCharacter(existing);
          navigate('/dashboard');
        }
      } catch (error) {
        console.log('No existing character');
      } finally {
        setChecking(false);
      }
    }

    checkExisting();
  }, [isConnected, userAddress]);

  const handleCreate = async () => {
    if (!characterName.trim()) {
      showNotification({ type: 'error', title: 'Error', message: 'Please enter a character name' });
      return;
    }

    try {
      const charId = `${userAddress}_main`;
      await createCharacter(charId, selectedClass, characterName);

      showNotification({
        type: 'success',
        title: 'Character Created!',
        message: `${characterName} the ${CLASS_NAMES[selectedClass]} is ready for battle!`
      });

      // Fetch the created character
      const newChar = await readCharacter(charId);
      if (newChar) {
        setCurrentCharacter(newChar);
        navigate('/dashboard');
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create character'
      });
    }
  };

  if (!isConnected) {
    navigate('/');
    return null;
  }

  if (checking) {
    return <Loading message="Checking for existing character..." />;
  }

  const classColors = ['#FF6B35', '#9D4EDD', '#00D9FF', '#06FFA5', '#FFB800'];
  const stats = CLASS_STATS[selectedClass];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-glow mb-4">
            CREATE YOUR FIGHTER
          </h1>
          <p className="text-ue-text-secondary">Choose your class and enter the arena</p>
        </div>

        {/* Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {CLASS_NAMES.map((className, index) => (
            <Card
              key={index}
              onClick={() => setSelectedClass(index)}
              className={`cursor-pointer transition-all duration-300 ${
                selectedClass === index
                  ? 'border-2 scale-105 shadow-neon'
                  : 'opacity-70 hover:opacity-100'
              }`}
              glow={selectedClass === index}
            >
              <div className="text-center">
                <div
                  className="text-4xl mb-2"
                  style={{ color: classColors[index] }}
                >
                  {['⚔️', '🗡️', '🔮', '🛡️', '🎭'][index]}
                </div>
                <h3 className="font-display font-bold mb-1">{className}</h3>
                <p className="text-xs text-ue-text-muted">{CLASS_DESCRIPTIONS[index].split('.')[0]}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Class Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card glow>
            <h3 className="text-2xl font-display font-bold text-ue-primary mb-4">
              {CLASS_NAMES[selectedClass]} Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'HP', value: stats.hp },
                { label: 'Damage', value: `${stats.dmgMin}-${stats.dmgMax}` },
                { label: 'Crit Chance', value: `${stats.crit}%` },
                { label: 'Dodge Chance', value: `${stats.dodge}%` },
                { label: 'Defense', value: stats.defense },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span className="text-ue-text-secondary">{stat.label}</span>
                  <span className="font-bold text-ue-primary">{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-ue-bg-dark/50 rounded">
              <p className="text-sm text-ue-text-muted">{CLASS_DESCRIPTIONS[selectedClass]}</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-2xl font-display font-bold text-ue-primary mb-4">
              Name Your Fighter
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-ue-text-secondary mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter name..."
                  className="input-cyber"
                  maxLength={20}
                />
              </div>

              <div className="p-4 bg-ue-bg-dark/50 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ue-text-muted">Creation Fee:</span>
                  <span className="text-ue-warning">0.5 MAS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ue-text-muted">Starting Level:</span>
                  <span className="text-ue-primary">1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ue-text-muted">Starting MMR:</span>
                  <span className="text-ue-primary">1000</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleCreate}
                loading={loading}
                disabled={!characterName.trim()}
                className="w-full"
              >
                CREATE CHARACTER (0.5 MAS)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
