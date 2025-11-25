# Fighter Game - Complete User Flow

## 🎮 User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIGHTER GAME FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. ENTRY → Landing Page
   ├─ Connect Wallet (useWallet)
   ├─ View Game Intro
   └─ Enter Game Button

2. CHARACTER SETUP → Character Selection
   ├─ Check Existing Characters (useCharacter.readCharacter)
   ├─ If None: Create Character
   │   ├─ Choose Class (Warrior, Assassin, Mage, Tank, Trickster)
   │   ├─ Name Character
   │   └─ Mint Character (useCharacter.createCharacter)
   └─ If Exists: Select Active Character

3. MAIN HUB → Dashboard
   ├─ Character Overview Card
   │   ├─ Level, XP, HP
   │   ├─ Stats (DMG, Crit, Dodge, Defense)
   │   └─ Equipment Slots
   ├─ Quick Stats
   │   ├─ W/L Record
   │   ├─ MMR & Rank
   │   └─ Win Streak
   └─ Navigation Menu
       ├─ Battle
       ├─ Equipment
       ├─ Skills
       ├─ Tournament
       ├─ Leaderboard
       └─ Achievements

4. BATTLE FLOW → Battle Arena
   ├─ Pre-Battle: Create/Find Battle
   │   ├─ Select Opponent Character
   │   ├─ Create Battle (useBattle.createBattle)
   │   └─ Wait for Battle Start
   ├─ Active Battle: Turn-by-Turn Combat
   │   ├─ View Battle State (useBattle.readBattle)
   │   ├─ Choose Stance (Defensive/Normal/Aggressive)
   │   ├─ Select Skill (Optional)
   │   ├─ Execute Turn (useBattle.executeTurn)
   │   ├─ View Damage/Effects
   │   └─ Repeat Until Winner
   ├─ Wildcard Events (if triggered)
   │   ├─ Display Wildcard Description
   │   └─ Accept/Reject Decision (useBattle.decideWildcard)
   └─ Post-Battle: Results
       ├─ Winner Announcement
       ├─ XP Gained
       ├─ MMR Change
       ├─ Loot/Rewards
       └─ Return to Hub

5. EQUIPMENT SYSTEM → Inventory
   ├─ View Equipment (useEquipment.readEquipment)
   ├─ Filter by Type/Rarity
   ├─ Equip/Unequip Items (useEquipment.equipItem)
   ├─ Repair Equipment (useEquipment.repairEquipment)
   │   └─ Show Dynamic Repair Cost
   └─ Transfer Equipment (useEquipment.transferEquipment)

6. SKILLS SYSTEM → Skills Page
   ├─ View Available Skills (useSkills.getSkillInfo)
   ├─ Show Learned Skills (useSkills.hasLearnedSkill)
   ├─ Learn New Skills (useSkills.learnSkill)
   │   └─ Pay Learning Fee
   └─ Equip Skills to Slots (useSkills.equipSkill)
       └─ 3 Skill Slots per Character

7. TOURNAMENT → Tournament Hub
   ├─ View Active Tournaments (useTournament.readTournament)
   ├─ Register for Tournament (useTournament.registerTournament)
   │   └─ Pay Entry Fee
   ├─ View Bracket
   ├─ Match Progress
   └─ Prize Distribution (if winner)

8. LEADERBOARD → Rankings
   ├─ Top 100 Players (useLeaderboard.getLeaderboard)
   ├─ Search by Character
   ├─ View MMR Tiers
   ├─ Your Rank (useLeaderboard.getCharacterRank)
   └─ MMR Distribution Chart

9. ACHIEVEMENTS → Progress
   ├─ View All Achievements (useAchievements.getAllAchievements)
   ├─ Show Unlocked (useAchievements.getUnlockedAchievements)
   ├─ Show Locked (useAchievements.getLockedAchievements)
   ├─ Progress Tracking
   └─ Completion Percentage

10. SETTINGS/PROFILE
    ├─ View Treasury Balance (useTreasury.getTreasuryBalance)
    ├─ Character Stats
    ├─ Transaction History
    └─ Disconnect Wallet
```

---

## 📱 Page Structure

### 1. Landing Page (`/`)
```
┌─────────────────────────────────┐
│   FIGHTER GAME LOGO             │
│                                 │
│   ⚔️  ENTER THE ARENA  ⚔️       │
│                                 │
│   [CONNECT WALLET]              │
│                                 │
│   Features:                     │
│   - Turn-based PvP Combat       │
│   - 5 Character Classes         │
│   - NFT Equipment System        │
│   - Tournaments & Rankings      │
└─────────────────────────────────┘
```

### 2. Character Select (`/character`)
```
┌─────────────────────────────────┐
│   SELECT YOUR FIGHTER           │
├─────────────────────────────────┤
│  [Warrior] [Assassin] [Mage]    │
│  [Tank]    [Trickster]          │
│                                 │
│  Selected: Warrior              │
│  ├─ HP: 120                     │
│  ├─ Damage: 12-18               │
│  └─ Stats: High HP, Balanced    │
│                                 │
│  Name: [_____________]          │
│                                 │
│  [CREATE CHARACTER] (0.5 MAS)   │
└─────────────────────────────────┘
```

### 3. Dashboard (`/dashboard`)
```
┌─────────────────────────────────┐
│  ⚔️ FIGHTER HUB                  │
├─────────────────────────────────┤
│ [Character Card]                │
│  Warrior "Blade"                │
│  Level 5 | 450/500 XP           │
│  HP: 120/120 | Energy: 100      │
│  Wins: 12 | Losses: 3           │
│  MMR: 1250 (Silver)             │
├─────────────────────────────────┤
│ Quick Actions:                  │
│  [⚔️ BATTLE] [🎽 EQUIPMENT]      │
│  [📚 SKILLS] [🏆 TOURNAMENT]     │
│  [📊 LEADERBOARD] [🎖️ ACHIEVEMENTS]│
└─────────────────────────────────┘
```

### 4. Battle Arena (`/battle/:battleId`)
```
┌─────────────────────────────────┐
│  BATTLE ARENA - Turn 5          │
├──────────────┬──────────────────┤
│  YOU         │  OPPONENT        │
│  Warrior     │  Assassin        │
│  HP: 85/120  │  HP: 60/100      │
│  Energy: 40  │  Energy: 60      │
│  Combo: 2    │  Combo: 0        │
│  🔥🛡️ Buffs   │  💀 Poisoned     │
├──────────────┴──────────────────┤
│  Your Turn:                     │
│  Stance: ○ Def ● Norm ○ Agg    │
│  Skills: [Power Strike] [Heal]  │
│           [Stun Strike]         │
│                                 │
│  [EXECUTE TURN]                 │
├─────────────────────────────────┤
│  Battle Log:                    │
│  > You dealt 25 damage!         │
│  > Opponent dodged!             │
│  > Critical hit! 48 damage!     │
└─────────────────────────────────┘
```

### 5. Equipment (`/equipment`)
```
┌─────────────────────────────────┐
│  INVENTORY                      │
├─────────────────────────────────┤
│ Filters: [All] [Weapon] [Armor] │
│          [Accessory]            │
│ Rarity:  [All] [Epic+] [Leg]    │
├─────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐  │
│ │ ⚔️    │ │ 🛡️    │ │ 💍    │  │
│ │ Blade │ │ Armor │ │ Ring  │  │
│ │ EPIC  │ │ RARE  │ │ LEG   │  │
│ │ +25DMG│ │ +30HP │ │+15CRT │  │
│ │🔧50/100│ │🔧80/100│ │🔧95/100│  │
│ │[EQUIP]│ │[REPAIR]│ │EQUIPPED│  │
│ └───────┘ └───────┘ └───────┘  │
└─────────────────────────────────┘
```

### 6. Skills (`/skills`)
```
┌─────────────────────────────────┐
│  SKILL TREE                     │
├─────────────────────────────────┤
│ Equipped Skills (3/3):          │
│  [1] Power Strike | Cost: 30E   │
│  [2] Heal         | Cost: 40E   │
│  [3] Stun Strike  | Cost: 50E   │
├─────────────────────────────────┤
│ Available Skills:               │
│  ┌────────────────────┐         │
│  │ ⚡ RAGE MODE        │ ✓ LEARNED│
│  │ Cost: 60 Energy    │         │
│  │ Cooldown: 5 turns  │         │
│  │ +50% Damage, 3 turns│        │
│  │ [EQUIP TO SLOT]    │         │
│  └────────────────────┘         │
│  ┌────────────────────┐         │
│  │ 🔥 BURN AURA       │ ✗ LOCKED│
│  │ Learn: 0.2 MAS     │         │
│  │ [LEARN SKILL]      │         │
│  └────────────────────┘         │
└─────────────────────────────────┘
```

### 7. Leaderboard (`/leaderboard`)
```
┌─────────────────────────────────┐
│  🏆 GLOBAL RANKINGS              │
├──────┬────────┬─────┬──────────┤
│ Rank │ Fighter│ MMR │   W/L    │
├──────┼────────┼─────┼──────────┤
│  1st │ Dragon │2450 │ 156/12   │
│  2nd │ Shadow │2380 │ 143/18   │
│  3rd │ Blade  │2310 │ 128/15   │
│  ... │  ...   │ ... │   ...    │
│ 47th │ *YOU*  │1250 │  12/3    │
├──────┴────────┴─────┴──────────┤
│ Your Stats:                     │
│  MMR: 1250 (Silver Tier)        │
│  Win Rate: 80%                  │
│  Best Streak: 8                 │
└─────────────────────────────────┘
```

### 8. Achievements (`/achievements`)
```
┌─────────────────────────────────┐
│  🎖️ ACHIEVEMENTS (6/10)         │
│  Progress: ████████░░ 60%       │
├─────────────────────────────────┤
│  ✓ First Blood                  │
│    Won your first battle        │
│                                 │
│  ✓ Champion                     │
│    Win 100 battles              │
│                                 │
│  ✗ Legendary Collector          │
│    Own a Legendary equipment    │
│    Progress: 0/1                │
│                                 │
│  ✗ Tournament Victor            │
│    Win a tournament             │
│    Progress: 0/1                │
└─────────────────────────────────┘
```

### 9. Tournament (`/tournament`)
```
┌─────────────────────────────────┐
│  🏆 WEEKLY TOURNAMENT            │
│  Prize Pool: 100 MAS            │
│  Participants: 14/16            │
│  Status: Registration Open      │
├─────────────────────────────────┤
│  Entry Fee: 5 MAS               │
│  [REGISTER CHARACTER]           │
├─────────────────────────────────┤
│  Tournament Bracket:            │
│  ┌─────────┐                    │
│  │ Fighter1│───┐                │
│  │ Fighter2│───┤                │
│  │  Winner │───┤                │
│  │ Fighter3│───┘ ───┐           │
│  │ Fighter4│─────────┤           │
│  │   ...   │         └─ CHAMPION│
└─────────────────────────────────┘
```

---

## 🎨 Unreal Engine Design System

### Color Palette
```css
--ue-bg-dark: #0A0E27
--ue-bg-card: #13182E
--ue-bg-hover: #1A2038

--ue-primary: #00D9FF (Cyan Glow)
--ue-secondary: #7B2CBF (Purple)
--ue-accent: #FF006E (Magenta)

--ue-success: #06FFA5
--ue-warning: #FFB800
--ue-error: #FF0844

--ue-text-primary: #E8F1FF
--ue-text-secondary: #8B9DC3
--ue-text-muted: #4A5568

--ue-border: #2D3748
--ue-glow: rgba(0, 217, 255, 0.5)
```

### Typography
```css
Font Family: 'Rajdhani', 'Orbitron' (sci-fi)
Headings: Bold, Uppercase, Letter-spacing
Body: Medium weight
```

### Effects
```css
- Neon glow on hover
- Metallic gradients
- Animated borders
- Particle effects
- Holographic overlays
- Glass morphism cards
```

---

## 🔄 State Management

### GameContext
```typescript
interface GameState {
  wallet: {
    isConnected: boolean;
    address: string;
    provider: any;
  };
  character: {
    current: Character | null;
    list: Character[];
  };
  battle: {
    active: Battle | null;
    history: Battle[];
  };
  ui: {
    loading: boolean;
    notification: Notification | null;
  };
}
```

---

## 📦 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── character/
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterStats.tsx
│   │   └── ClassSelector.tsx
│   ├── battle/
│   │   ├── BattleArena.tsx
│   │   ├── TurnControls.tsx
│   │   ├── PlayerStatus.tsx
│   │   └── BattleLog.tsx
│   ├── equipment/
│   │   ├── EquipmentGrid.tsx
│   │   ├── EquipmentCard.tsx
│   │   └── EquipmentSlots.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   └── ...
├── pages/
│   ├── Landing.tsx
│   ├── CharacterSelect.tsx
│   ├── Dashboard.tsx
│   ├── BattleArena.tsx
│   ├── Equipment.tsx
│   ├── Skills.tsx
│   ├── Leaderboard.tsx
│   ├── Achievements.tsx
│   └── Tournament.tsx
├── context/
│   └── GameContext.tsx
├── hooks/
│   └── (already created)
├── styles/
│   └── globals.css
└── App.tsx
```

---

## ✅ Implementation Checklist

- [ ] Setup project (package.json, dependencies)
- [ ] Configure Tailwind with Unreal theme
- [ ] Create GameContext
- [ ] Build UI components (Button, Card, Modal)
- [ ] Build Layout (Header, Sidebar)
- [ ] Build Landing page
- [ ] Build Character Select page
- [ ] Build Dashboard page
- [ ] Build Battle Arena page (most complex)
- [ ] Build Equipment page
- [ ] Build Skills page
- [ ] Build Leaderboard page
- [ ] Build Achievements page
- [ ] Build Tournament page
- [ ] Setup React Router
- [ ] Test full flow end-to-end
- [ ] Polish animations and effects
