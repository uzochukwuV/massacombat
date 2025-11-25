# User Dashboard Implementation Guide

## Overview

The User Dashboard is a comprehensive character profile page that displays:
- **Character Stats** - Level, HP, damage, critical chance, dodge, defense
- **Battle History** - Wins, losses, win rate, win streak
- **Equipment** - Weapon, armor, and accessories with stat bonuses
- **Achievements** - Progress tracking with unlocked badges
- **Skills** - Equipped skills in active slots

## Features

### 1. Character Statistics
- **Combat Stats**: HP (with visual bar), Damage range, Critical chance, Dodge chance, Defense
- **Battle History**: Total wins/losses, win rate percentage, win streak
- **Progression**: XP progress bar, MMR (Matchmaking Rating)
- **Class Display**: Character name and class type

### 2. Equipment Management
- Display equipped gear: Weapon, Armor, Accessory
- Show stat bonuses for each piece
- Display durability status
- Rarity tier with color coding:
  - Common: Gray
  - Rare: Blue
  - Epic: Purple
  - Legendary: Orange

### 3. Achievement System
- Visual progress bar (0-100%)
- 10 total achievements with icons
- Lock/unlock status display
- Hover effects for unlocked achievements
- Completion percentage

### 4. Skills
- Visual display of equipped skills
- Up to 3 skill slots
- Empty slot indicators

## File Structure

```
frontend/src/
├── pages/
│   ├── UserDashboard.tsx          # Main dashboard component
│   └── UserDashboardWrapper.tsx   # Wrapper with styles
├── styles/
│   └── dashboard.css              # Global styles and utilities
└── hooks/
    ├── useCharacter.ts            # Character data fetching
    ├── useEquipment.ts            # Equipment data fetching
    ├── useAchievements.ts         # Achievement data fetching
    └── useWallet.ts               # Wallet connection
```

## Component Structure

### UserDashboard.tsx
Main component that:
- Connects to wallet via `useWallet` hook
- Fetches character data via `useCharacter` hook
- Fetches equipment data via `useEquipment` hook
- Fetches achievement data via `useAchievements` hook
- Renders a complete dashboard with sidebar navigation

### Key Props & Data Flow
```
UserDashboard
├── wallet data (isConnected, userAddress)
├── character data (stats, class, level, etc.)
├── equipment data (weapon, armor, accessory)
└── achievement data (unlocked achievements, completion %)
```

## Usage

### Basic Integration
```typescript
import UserDashboard from './pages/UserDashboard';
import UserDashboardWrapper from './pages/UserDashboardWrapper';

// Option 1: Use wrapper (includes all styles)
<UserDashboardWrapper />

// Option 2: Use directly (requires external styles)
<UserDashboard />
```

### In React Router
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserDashboardWrapper from './pages/UserDashboardWrapper';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<UserDashboardWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Environment Variables
Create a `.env` file:
```env
REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
```

## Styling System

### Theme Colors
The dashboard uses a custom color scheme defined via CSS variables:

```css
--ue-bg: #111111           /* Main background */
--ue-panel: #1c1c1c        /* Panel background */
--ue-border: #333333       /* Border color */
--ue-border-hover: #f5a623 /* Hover border */
--ue-text: #cccccc         /* Primary text */
--ue-text-darker: #7a7a7a  /* Secondary text */
--ue-accent: #f5a623       /* Accent (orange) */
--ue-accent-dark: #1a1a2e  /* Dark accent */
```

### Clip Path Utilities
- `.clip-path-hexagon` - Hexagonal avatar shape
- `.clip-path-panel` - Beveled panel corners
- `.clip-path-button` - Beveled button corners
- `.clip-path-header` - Header with angled corner

### Custom Classes
- `.progress-bar` - Orange gradient progress bar
- `.stat-item` - Stat row with label and value
- `.achievement-badge` - Achievement icon container

## Data Loading Flow

```
1. Check if wallet is connected
   ├─ If not: Show connection prompt
   └─ If yes: Continue

2. Load character data
   ├─ Fetch character by ID (userAddress_main)
   └─ Update state

3. Load equipment data
   ├─ Fetch weapon (if equipped)
   ├─ Fetch armor (if equipped)
   └─ Fetch accessory (if equipped)

4. Load achievements
   ├─ Fetch achievement tracker
   └─ Parse bitmask to get unlocked achievements

5. Render dashboard with all data
```

## State Management

The component uses React local state with `useState`:

```typescript
interface DashboardData {
  character: Character | null
  equipment: Equipment[]
  achievements: AchievementTracker | null
  loading: boolean
  error: string | null
}
```

## Error Handling

The dashboard gracefully handles:
- ✅ Wallet not connected
- ✅ No character found
- ✅ Missing equipment
- ✅ Missing achievements
- ✅ Network errors
- ✅ Data parsing errors

## Performance Considerations

- Uses `useCallback` for all hook functions
- Fetches data only once on mount
- Includes proper dependency arrays
- Lazy loads equipment only if character exists

## Customization

### Change Color Scheme
Modify CSS variables in `dashboard.css`:
```css
:root {
  --ue-accent: #YOUR_COLOR;
}
```

### Adjust Layout
Use Tailwind classes to modify grid layout:
```typescript
{/* Change columns: lg:grid-cols-2 -> lg:grid-cols-4 */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
```

### Add New Sections
Follow the pattern:
```typescript
{someData && (
  <div id="section" className="flex flex-col gap-4">
    <div className="bg-ue-panel p-3 pl-4 clip-path-header">
      <h2 className="text-white text-xl font-bold">SECTION TITLE</h2>
    </div>
    {/* Content here */}
  </div>
)}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- Color contrast meets WCAG AA standards
- Keyboard navigation support
- Material Icons for visual indicators
- Focus states for interactive elements

## Future Enhancements

1. **Real-time Updates**
   - WebSocket connection for live battle stats
   - Achievement unlock notifications

2. **Equipment Comparison**
   - Compare items before equipping
   - Show stat differences

3. **Battle Simulator**
   - Preview match outcomes
   - Compare against other players

4. **Loadout Manager**
   - Save multiple equipment builds
   - Switch between setups

5. **Achievement Details**
   - Show progress toward locked achievements
   - Display unlock conditions

## Troubleshooting

### Dashboard shows "No character found"
- Create a character first via the character creation page
- Ensure contract address is set in `.env`

### Equipment not displaying
- Equipment must be equipped to the character in the contract
- Check that equipment IDs are stored correctly in character data

### Achievements not showing
- Ensure achievements have been unlocked via battle wins
- Check achievement contract storage

### Styles not applying
- Ensure Tailwind CSS CDN is loaded
- Check that CSS variables are defined in root scope
- Verify Material Icons font is loaded

## Support

For issues or questions:
1. Check the contract state using web3 tools
2. Verify hook connections in browser console
3. Check network requests in DevTools
4. Review smart contract logs for errors

---

**Version**: 1.0.0
**Last Updated**: 2024
**Compatible With**: React 18+, Tailwind CSS 3+
