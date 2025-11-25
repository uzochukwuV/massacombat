# Fighter Game - Frontend

A blockchain-based PvP fighting game built on Massa blockchain with Unreal Engine-inspired design.

## 🎮 Features

- **Turn-Based Combat**: Strategic PvP battles with skill-based gameplay
- **5 Character Classes**: Warrior, Assassin, Mage, Tank, Trickster
- **NFT Equipment System**: Collect, equip, and trade gear
- **Skills & Progression**: Learn skills, level up, earn XP
- **Tournaments**: Compete in brackets for prizes
- **Leaderboard & Rankings**: MMR-based competitive system
- **Achievements**: Track progress and unlock rewards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Massa Wallet browser extension
- Access to Massa buildnet

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

Update the contract address in `src/utils/constants.ts`:

```typescript
export const CONTRACT_ADDRESS = 'AS12YOUR_CONTRACT_ADDRESS_HERE';
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Header, Sidebar, Footer
│   │   ├── ui/            # Button, Card, Loading, etc.
│   │   ├── character/     # Character-specific components
│   │   ├── battle/        # Battle-specific components
│   │   └── equipment/     # Equipment-specific components
│   ├── pages/             # Route pages
│   │   ├── Landing.tsx
│   │   ├── CharacterSelect.tsx
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── hooks/             # React hooks for contract interaction
│   │   ├── useWallet.ts
│   │   ├── useCharacter.ts
│   │   ├── useBattle.ts
│   │   └── ...
│   ├── context/           # Global state management
│   │   └── GameContext.tsx
│   ├── utils/             # Constants and utilities
│   │   └── constants.ts
│   ├── styles/            # Global styles
│   │   └── globals.css
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config (Unreal Engine theme)
├── vite.config.ts         # Vite config
└── README.md              # This file
```

## 🎨 Design System

The frontend uses an **Unreal Engine-inspired design system** with:

- **Dark Theme**: Deep space blacks (#0A0E27)
- **Neon Accents**: Cyan (#00D9FF), Purple (#7B2CBF), Magenta (#FF006E)
- **Cyber Elements**: Clipped corners, holographic effects, glow animations
- **Typography**: Rajdhani & Orbitron fonts for that futuristic feel
- **Components**: Custom cyber-styled buttons, cards, and inputs

### Color Palette

```css
--ue-bg-dark: #0A0E27      /* Main background */
--ue-primary: #00D9FF      /* Cyan glow */
--ue-secondary: #7B2CBF    /* Purple */
--ue-accent: #FF006E       /* Magenta */
--ue-success: #06FFA5      /* Green */
--ue-warning: #FFB800      /* Yellow */
--ue-error: #FF0844        /* Red */
```

## 🔧 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Massa Web3** - Blockchain interaction
- **Framer Motion** - Animations

## 📖 User Flow

1. **Landing Page** → Connect Massa wallet
2. **Character Select** → Create or select fighter
3. **Dashboard** → View stats, navigate to features
4. **Battle** → Create battles, execute turns
5. **Equipment** → Manage gear, repair, equip
6. **Skills** → Learn and equip skills
7. **Leaderboard** → View rankings
8. **Achievements** → Track progress
9. **Tournament** → Join competitions

## 🎯 Key Components

### GameContext

Global state management for:
- Wallet connection
- Current character
- UI state (loading, notifications)

### Hooks

All contract interactions are handled through custom hooks:
- `useWallet` - Wallet connection
- `useCharacter` - Character CRUD
- `useBattle` - Battle management
- `useEquipment` - Equipment management
- `useSkills` - Skill system
- `useTournament` - Tournament system
- `useLeaderboard` - Rankings
- `useAchievements` - Achievement tracking

### Pages

- **Landing**: Entry point with wallet connection
- **Character Select**: Class selection and character creation
- **Dashboard**: Main hub with character overview
- **Battle Arena**: Turn-based combat interface *(Coming Soon)*
- **Equipment**: Inventory management *(Coming Soon)*
- **Skills**: Skill tree and management *(Coming Soon)*
- **Leaderboard**: Rankings and MMR *(Coming Soon)*
- **Achievements**: Progress tracking *(Coming Soon)*
- **Tournament**: Tournament system *(Coming Soon)*

## 🔐 Contract Integration

The frontend integrates with the Fighter Game smart contract using binary data parsing:

```typescript
// All hooks use proper binary deserialization
const battle = await readBattle('battle_1');
// Returns properly typed Battle object with bigint values

const character = await readCharacter('char_1');
// Returns Character with all stats

await executeTurn(battleId, charId, stance, useSkill, skillSlot);
// Executes turn with proper Args serialization
```

## 🚧 Development Status

### ✅ Completed
- Project structure and configuration
- Unreal Engine design system
- Global state management (GameContext)
- Core UI components (Button, Card, Loading)
- Layout components (Header)
- Landing page
- Character selection page
- Dashboard page
- Full hooks integration

### 🔄 In Progress
- Battle Arena page (turn-based combat UI)
- Equipment management page
- Skills page
- Leaderboard page
- Achievements page
- Tournament page

### 📋 Planned
- Real-time battle updates
- Equipment marketplace
- Tournament brackets visualization
- Achievement animations
- Mobile responsiveness improvements

## 📝 Notes

- The contract address must be updated in `src/utils/constants.ts` after deployment
- Requires Massa Wallet extension to be installed
- Currently configured for Massa buildnet
- All fees are in MAS (Massa native token)

## 🤝 Contributing

The frontend is designed to be easily extendable. To add a new page:

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Header.tsx`
4. Use hooks from `src/hooks/` for contract interaction

## 📄 License

MIT License - see LICENSE file for details

---

Built with ⚔️ for the Massa blockchain
