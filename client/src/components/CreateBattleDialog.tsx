import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUND_OPTIONS, RoundOption } from '@/types/battle';
import { Swords, Zap, Trophy } from 'lucide-react';

interface CreateBattleDialogProps {
  onCreateBattle: (rounds: RoundOption, wager: string) => void;
  isLoading?: boolean;
}

export function CreateBattleDialog({ onCreateBattle, isLoading }: CreateBattleDialogProps) {
  const [rounds, setRounds] = useState<RoundOption>(3);
  const [wager, setWager] = useState('0.01');
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    onCreateBattle(rounds, wager);
    setOpen(false);
  };

  const minStakeMultiplier = rounds === 3 ? 1 : rounds === 5 ? 1.5 : 2;
  const totalPot = parseFloat(wager) * 2;
  const protocolFee = totalPot * 0.02;
  const winnerReceives = totalPot * 0.98;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="ue-button rounded-lg">
          <Swords className="w-5 h-5 inline-block mr-2" />
          Create Battle
        </button>
      </DialogTrigger>
      
      <DialogContent className="bg-dark-800 border-neon-cyan/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black text-white tracking-wider">
            <span className="ue-glow-text">CREATE BATTLE</span>
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Configure your battle parameters and stake amount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Round Selection */}
          <div className="space-y-3">
            <Label htmlFor="rounds" className="text-white font-heading tracking-wider uppercase text-sm">
              Number of Rounds
            </Label>
            <Select value={rounds.toString()} onValueChange={(v) => setRounds(parseInt(v) as RoundOption)}>
              <SelectTrigger 
                id="rounds" 
                className="ue-input h-12 text-white font-bold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-neon-cyan/30">
                {ROUND_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option} 
                    value={option.toString()}
                    className="text-white hover:bg-neon-cyan/20 cursor-pointer"
                  >
                    <span className="font-bold">{option} Rounds</span>
                    <span className="text-neon-cyan ml-2">
                      {option === 3 ? '(Quick)' : option === 5 ? '(Standard)' : '(Epic)'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-foreground/60 flex items-center gap-2">
              <Zap className="w-3 h-3 text-neon-cyan" />
              Minimum stake multiplier: <span className="text-neon-cyan font-bold">{minStakeMultiplier}x</span>
            </p>
          </div>

          {/* Wager Amount */}
          <div className="space-y-3">
            <Label htmlFor="wager" className="text-white font-heading tracking-wider uppercase text-sm">
              Wager Amount (ETH)
            </Label>
            <Input
              id="wager"
              type="number"
              step="0.001"
              min="0"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              placeholder="0.01"
              className="ue-input h-12 text-white font-bold text-lg"
            />
            <p className="text-xs text-foreground/60 flex items-center gap-2">
              <Trophy className="w-3 h-3 text-neon-purple" />
              Winner takes all minus 2% protocol fee
            </p>
          </div>

          {/* Battle Info */}
          <div className="ue-card p-5 bg-dark-700/50 space-y-3">
            <h3 className="font-heading font-bold text-white tracking-wider uppercase text-sm flex items-center gap-2">
              <Swords className="w-4 h-4 text-neon-cyan" />
              Battle Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-dark-800/50">
                <span className="text-foreground/60 text-sm uppercase tracking-wider">Total Rounds</span>
                <span className="font-bold text-white text-lg">{rounds}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-dark-800/50">
                <span className="text-foreground/60 text-sm uppercase tracking-wider">Your Stake</span>
                <span className="font-bold text-neon-cyan text-lg">{wager} ETH</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-dark-800/50">
                <span className="text-foreground/60 text-sm uppercase tracking-wider">Total Pot</span>
                <span className="font-bold text-white text-lg">{totalPot.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-dark-800/50">
                <span className="text-foreground/60 text-sm uppercase tracking-wider">Protocol Fee (2%)</span>
                <span className="font-bold text-red-400 text-lg">{protocolFee.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-neon-cyan/10 border border-neon-cyan/30 mt-3">
                <span className="text-neon-cyan text-sm uppercase tracking-wider font-bold">Winner Receives</span>
                <span className="font-black text-neon-cyan text-xl">{winnerReceives.toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreate} 
            disabled={isLoading || parseFloat(wager) <= 0}
            className="ue-button w-full rounded-lg py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'CREATING...' : 'CREATE BATTLE OFFER'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
