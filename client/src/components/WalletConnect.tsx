import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const { isConnected, userAddress, loading, error, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && userAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-neon-cyan">
          {formatAddress(userAddress)}
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={loading}
      className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {loading ? 'Connecting...' : 'Connect Massa Wallet'}
    </Button>
  );
}