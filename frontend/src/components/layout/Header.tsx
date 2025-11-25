import { Link, useLocation } from 'react-router-dom';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { isConnected, userAddress, currentCharacter, disconnect } = useGame();
  const location = useLocation();

  const navLinks = [
    { path: '/dashboard', label: '⚔️ Hub' },
    { path: '/battle', label: '🎮 Battle' },
    { path: '/equipment', label: '🎽 Equipment' },
    { path: '/skills', label: '📚 Skills' },
    { path: '/leaderboard', label: '🏆 Leaderboard' },
    { path: '/achievements', label: '🎖️ Achievements' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-ue-primary/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="text-3xl">⚔️</div>
            <div>
              <h1 className="text-2xl font-display font-bold text-glow">FIGHTER GAME</h1>
              <p className="text-xs text-ue-text-muted">Massa Blockchain</p>
            </div>
          </Link>

          {/* Navigation */}
          {isConnected && currentCharacter && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 font-display text-sm uppercase tracking-wide transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-ue-primary border-b-2 border-ue-primary'
                      : 'text-ue-text-secondary hover:text-ue-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User Info */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                {currentCharacter && (
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-ue-primary">
                      {currentCharacter.name}
                    </span>
                    <span className="text-xs text-ue-text-muted">
                      Lvl {currentCharacter.level} | MMR {currentCharacter.mmr}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-ue-bg-card border border-ue-primary clip-corner-sm">
                  <div className="w-2 h-2 bg-ue-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-ue-text-secondary font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
                <Button size="sm" variant="secondary" onClick={disconnect}>
                  Disconnect
                </Button>
              </>
            ) : (
              <div className="text-sm text-ue-text-muted">Connect wallet to play</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
