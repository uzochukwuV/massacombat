import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';

interface BattleLogProps {
  log: string;
}

export function BattleLog({ log }: BattleLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when log updates
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const entries = log
    .split('\n')
    .filter((line) => line.trim())
    .reverse()
    .slice(0, 20) // Show last 20 entries
    .reverse();

  return (
    <Card className="bg-ue-bg-dark/90">
      <h3 className="text-lg font-display font-bold text-ue-primary mb-3 flex items-center gap-2">
        <span>📜</span> BATTLE LOG
      </h3>
      <div
        ref={logRef}
        className="h-40 overflow-y-auto space-y-1 pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#00D9FF #13182E',
        }}
      >
        {entries.length === 0 ? (
          <p className="text-sm text-ue-text-muted italic">
            Battle log will appear here...
          </p>
        ) : (
          entries.map((entry, idx) => {
            // Parse entry for styling
            let color = 'text-ue-text-secondary';
            let icon = '•';

            if (entry.includes('damage') || entry.includes('hit')) {
              color = 'text-ue-error';
              icon = '⚔️';
            } else if (entry.includes('heal') || entry.includes('restore')) {
              color = 'text-ue-success';
              icon = '💚';
            } else if (entry.includes('dodge') || entry.includes('miss')) {
              color = 'text-ue-warning';
              icon = '💨';
            } else if (entry.includes('critical') || entry.includes('crit')) {
              color = 'text-ue-accent';
              icon = '💥';
            } else if (entry.includes('skill') || entry.includes('used')) {
              color = 'text-ue-primary';
              icon = '✨';
            } else if (entry.includes('Turn')) {
              color = 'text-ue-warning font-bold';
              icon = '🔄';
            }

            return (
              <div
                key={idx}
                className={`text-sm ${color} flex gap-2 animate-slide-up`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className="flex-shrink-0">{icon}</span>
                <span className="flex-1">{entry}</span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
