import { WalletConnect } from '@/components/WalletConnect';
import { Swords } from 'lucide-react';

export function Navbar() {
  return (
    <header className="relative border-b border-neon-cyan/30 bg-dark-800/80 backdrop-blur-md z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-purple/5" />
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Swords className="w-10 h-10 text-neon-cyan animate-glow-pulse" />
                <div className="absolute inset-0 blur-xl bg-neon-cyan/50 animate-glow-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-black text-white ue-glow-text tracking-wider">
                  BATTLECHAIN V2
                </h1>
                <p className="text-sm text-neon-cyan/70 tracking-widest uppercase">
                  On-Chain Combat Arena
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-white hover:text-neon-cyan transition-colors">
                Home
              </a>
              <a href="/characters" className="text-white hover:text-neon-cyan transition-colors">
                Characters
              </a>
              <a href="/battle" className="text-white hover:text-neon-cyan transition-colors">
                Battle
              </a>
              <a href="/arena" className="text-white hover:text-neon-cyan transition-colors">
                Arena
              </a>
            </nav>
          </div>
          <div className="relative">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}