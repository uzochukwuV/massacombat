import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Characters from './pages/Characters';
import Battle from './pages/Battle';
import BattleArena from './pages/BattleArena';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/arena" element={<BattleArena />} />
      </Routes>
    </Router>
  );
}

export default App;
