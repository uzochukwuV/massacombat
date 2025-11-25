import React from 'react';
import { useWallet } from '../hooks';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { isConnected, connect, userAddress, loading, error } = useWallet();

  const handlePlayClick = () => {
    if (isConnected) {
      onNavigate('loadout');
    }
  };

  const handleConnectWallet = async () => {
    await connect();
  };

  return (
    <div className="min-h-screen bg-ue-bg text-ue-text overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ue-accent rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ue-accent rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 text-ue-accent">
              MASSA COMBAT
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-ue-accent to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-ue-text-darker">
              Battle, Collect, Conquer
            </p>
          </div>

          {/* Game Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="border border-ue-border rounded-lg p-6 hover:border-ue-accent transition-colors">
              <div className="text-3xl mb-3">⚔️</div>
              <h3 className="text-lg font-bold mb-2">Strategic Battles</h3>
              <p className="text-ue-text-darker text-sm">Engage in turn-based combat with tactical skill choices</p>
            </div>
            <div className="border border-ue-border rounded-lg p-6 hover:border-ue-accent transition-colors">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2">Unique Equipment</h3>
              <p className="text-ue-text-darker text-sm">Collect legendary gear and customize your loadout</p>
            </div>
            <div className="border border-ue-border rounded-lg p-6 hover:border-ue-accent transition-colors">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="text-lg font-bold mb-2">Climb the Ranks</h3>
              <p className="text-ue-text-darker text-sm">Compete for glory and earn MMR on the leaderboard</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className="w-full max-w-md">
          {!isConnected ? (
            <div className="border border-ue-border rounded-lg p-8 bg-ue-panel/50 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 text-center">Start Your Journey</h2>
              <p className="text-ue-text-darker text-center mb-6">
                Connect your Massa Wallet to begin playing
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className={`w-full py-3 px-6 rounded font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-ue-border text-ue-text-darker cursor-not-allowed'
                    : 'bg-ue-accent hover:bg-ue-accent/80 text-ue-bg'
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    Connect Wallet
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded text-red-300 text-sm">
                  {error}
                </div>
              )}

              <p className="text-ue-text-darker text-xs text-center mt-6">
                Make sure you have Massa Wallet installed and configured for Buildnet
              </p>
            </div>
          ) : (
            <div className="border-2 border-ue-accent rounded-lg p-8 bg-gradient-to-b from-ue-panel/50 to-ue-bg/50 backdrop-blur">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
                <p className="text-ue-text-darker text-sm break-all">
                  {userAddress}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePlayClick}
                  className="w-full py-4 px-6 bg-gradient-to-r from-ue-accent to-ue-accent/80 hover:from-ue-accent/90 hover:to-ue-accent/70 text-ue-bg font-bold rounded text-lg transition-all duration-300 transform hover:scale-105"
                >
                  PLAY NOW →
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-3 px-6 border-2 border-ue-accent text-ue-accent hover:bg-ue-accent/10 font-bold rounded transition-all duration-300"
                >
                  View Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-ue-text-darker text-sm">
          <p>Built on Massa Blockchain</p>
        </div>
      </div>
    </div>
  );
}
