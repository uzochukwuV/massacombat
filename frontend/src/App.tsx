import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from '@/context/GameContext';
import { Header } from '@/components/layout/Header';
import { Landing } from '@/pages/Landing';
import { CharacterSelect } from '@/pages/CharacterSelect';
import { Dashboard } from '@/pages/Dashboard';
import '@/styles/globals.css';

// Placeholder pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-display font-bold text-glow mb-4">{title}</h1>
        <p className="text-ue-text-secondary">Coming Soon...</p>
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useGame();
  return isConnected ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ue-bg-dark text-ue-text-primary cyber-grid">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/character-select" element={
              <ProtectedRoute>
                <CharacterSelect />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/battle" element={
              <ProtectedRoute>
                <ComingSoon title="⚔️ Battle Arena" />
              </ProtectedRoute>
            } />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <ComingSoon title="🎽 Equipment" />
              </ProtectedRoute>
            } />
            <Route path="/skills" element={
              <ProtectedRoute>
                <ComingSoon title="📚 Skills" />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <ComingSoon title="🏆 Leaderboard" />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <ComingSoon title="🎖️ Achievements" />
              </ProtectedRoute>
            } />
            <Route path="/tournament" element={
              <ProtectedRoute>
                <ComingSoon title="🏆 Tournament" />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Notification System */}
        <Notification />
      </div>
    </BrowserRouter>
  );
}

function Notification() {
  const { notification, clearNotification } = useGame();

  if (!notification) return null;

  const colors = {
    success: 'border-ue-success bg-ue-success/10',
    error: 'border-ue-error bg-ue-error/10',
    warning: 'border-ue-warning bg-ue-warning/10',
    info: 'border-ue-primary bg-ue-primary/10',
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-up">
      <div className={`card-cyber p-4 min-w-[300px] ${colors[notification.type]}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✗'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="flex-1">
            <h4 className="font-display font-bold mb-1">{notification.title}</h4>
            <p className="text-sm text-ue-text-secondary">{notification.message}</p>
          </div>
          <button
            onClick={clearNotification}
            className="text-ue-text-muted hover:text-ue-text-primary"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppRoutes />
    </GameProvider>
  );
}
