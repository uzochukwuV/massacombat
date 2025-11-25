import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

export function Landing() {
  const { isConnected, connect, loading } = useGame();
 
  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 animate-pulse-slow"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="text-8xl mb-4">⚔️</div>
          <h1 className="text-7xl font-display font-bold text-glow mb-4">
            FIGHTER GAME
          </h1>
          <p className="text-xl text-ue-text-secondary font-display tracking-wider">
            BLOCKCHAIN PVP COMBAT ON MASSA
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
          {[
            { icon: '⚔️', title: 'Turn-Based Combat', desc: 'Strategic PvP battles' },
            { icon: '🎮', title: '5 Character Classes', desc: 'Each with unique abilities' },
            { icon: '💎', title: 'NFT Equipment', desc: 'Collect & upgrade gear' },
            { icon: '🏆', title: 'Tournaments & Rankings', desc: 'Compete for glory' },
          ].map((feature, i) => (
            <div
              key={i}
              className="card-cyber p-6 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <h3 className="text-lg font-display font-bold text-ue-primary mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-ue-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            onClick={connect}
            loading={loading}
            className="text-xl px-12 py-6"
          >
            {loading ? 'CONNECTING...' : 'CONNECT WALLET & ENTER'}
          </Button>
          <p className="text-sm text-ue-text-muted">
            Requires Massa Wallet Extension
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 flex justify-center gap-8">
          {[
            { label: 'Active Players', value: '1,234' },
            { label: 'Battles Fought', value: '12,456' },
            { label: 'Total Prize Pool', value: '5,678 MAS' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-display font-bold text-ue-primary">
                {stat.value}
              </div>
              <div className="text-xs text-ue-text-muted uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
