import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { CONTRACT_ADDRESS } from '@/utils/constants';

interface Character {
  id: string;
  name: string;
  characterClass: number;
  level: number;
  xp: bigint;
  hp: number;
  maxHp: number;
  totalWins: number;
  totalLosses: number;
  mmr: number;
}

interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface GameContextType {
  // Wallet
  isConnected: boolean;
  userAddress: string;
  provider: any;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Character
  currentCharacter: Character | null;
  setCurrentCharacter: (char: Character | null) => void;

  // UI State
  loading: boolean;
  setLoading: (loading: boolean) => void;
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  clearNotification: () => void;

  // Contract Address
  contractAddress: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((notif: Notification) => {
    setNotification(notif);
    // Auto-clear after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value: GameContextType = {
    isConnected: wallet.isConnected,
    userAddress: wallet.userAddress,
    provider: wallet.provider,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    currentCharacter,
    setCurrentCharacter,
    loading,
    setLoading,
    notification,
    showNotification,
    clearNotification,
    contractAddress: CONTRACT_ADDRESS,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
