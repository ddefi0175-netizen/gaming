# ⚔️ Survivor Game

A Vampire Survivors-style roguelike game built with Phaser 3. Survive endless waves of enemies, collect XP, level up, and unlock powerful upgrades!

## 🎮 Features

### Core Gameplay

- **Auto-attacking weapons** - Your character attacks automatically
- **Multiple weapon types**:
  - 🔵 **Energy Bolt** - Projectile that pierces enemies
  - 🔴 **Nova Blast** - Area damage around player
  - ⚡ **Chain Lightning** - Chains between enemies
  - 🟢 **Orbital Shield** - Rotating protective orbs

### Enemy System

- **Normal Enemies** - Balanced stats
- **Fast Enemies** - Quick but weak
- **Tank Enemies** - Slow but tough (unlocks after 30s)
- Difficulty increases over time

### Progression

- **XP & Leveling** - Kill enemies → Collect XP → Level up → Choose upgrades
- **Upgrade choices** - Pick 1 of 3 random upgrades each level
- **Meta progression** - Unlock characters and permanent upgrades between runs

### Characters

| Character | Starting Weapon | Bonus |
|-----------|-----------------|-------|
| ⚔️ Warrior | Energy Bolt | +20 Health |
| 🔮 Mage | Nova Blast | +10% Damage |
| 🗡️ Rogue | Chain Lightning | +15% Speed |
| 🛡️ Paladin | Orbital Shield | +10 Health, +1 Regen |

### Controls

- **PC**: WASD or Arrow Keys to move
- **Mobile**: Virtual joystick (touch left side of screen)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── main.js                 # Game entry point
├── config/
│   └── GameConfig.js       # All game configuration
├── entities/
│   ├── Player.js           # Player class
│   ├── Enemy.js            # Enemy & spawner classes
│   ├── Weapon.js           # All weapon types
│   └── Pickups.js          # XP orbs & health
├── scenes/
│   ├── BootScene.js        # Asset loading
│   ├── MenuScene.js        # Main menu
│   ├── GameScene.js        # Main gameplay
│   ├── UIScene.js          # HUD overlay
│   ├── UpgradeScene.js     # Level-up selection
│   ├── GameOverScene.js    # End screen
│   └── MetaScene.js        # Shop/upgrades
└── ui/
    └── VirtualJoystick.js  # Mobile controls
```

## 💰 Monetization

### 📱 Mobile (Free-to-Play)

- ✅ **Optional rewarded ads** - Watch ad to double end-game coins
- ✅ **Remove ads purchase** - One-time purchase ($2.99)
- ✅ **Optional coin packs** - For players who want to speed up unlocks
- ❌ No forced ads
- ❌ No pay-to-win mechanics

### 💻 PC/Steam (Paid Game)

- One-time purchase ($4.99)
- No ads whatsoever
- All content unlockable through gameplay
- Bonus starting coins as thank you

## 🔁 Game Loop

The core gameplay loop is designed for 5-15 minute sessions:

1. **Start Run** → Choose character
2. **Survive** → Kill enemies, collect XP
3. **Level Up** → Choose 1 of 3 upgrades
4. **Face Bosses** → At 3, 7, and 12 minutes
5. **Die** → Earn coins based on performance
6. **Unlock** → Buy characters/permanent upgrades
7. **Repeat** → Start again, stronger!

## 📊 Difficulty Phases

| Phase | Time | Spawn Rate | Enemy Health |
|-------|------|------------|--------------|
| EARLY | 0-1 min | 1x | 1x |
| MID | 1-5 min | 1.5x | 1.3x |
| LATE | 5-10 min | 2.5x | 1.8x |
| ENDGAME | 10-15 min | 4x | 2.5x |
| HELL | 15+ min | 6x | 3x |

## 🏆 Achievements

Earn bonus coins by completing achievements:

- First Steps, Survivor, Veteran, Legend (survival milestones)
- Hunter, Slayer (kill milestones)  
- Powered Up, Unstoppable (level milestones)
- Boss Slayer, Arsenal (special objectives)

## 🎯 Game Balance

### XP Formula

```
XP needed = BASE_XP × (1.3 ^ level)
```

### Difficulty Scaling

```
Enemy spawn rate increases based on phase
Tank enemies unlock after 30 seconds
Bosses spawn at 3, 7, and 12 minutes
Fast enemy chance increases over time
```

## 🔧 Configuration

All game values can be tweaked in [src/config/GameConfig.js](src/config/GameConfig.js):

- Player stats
- Enemy types and stats
- Weapon damage/cooldowns
- XP requirements
- Upgrade values
- Character bonuses

## 📱 Platform Deployment

### Web (Default)

```bash
npm run build
# Upload /dist folder to any static host
```

### Steam/PC (Paid, No Ads)

```bash
npm run build:steam
# Package /dist-steam with Electron or NW.js
```

### Mobile (Free-to-Play with Ads)

```bash
npm run build:mobile
# Wrap /dist-mobile with Capacitor or Cordova
```

For native mobile apps, wrap with:

- **Capacitor** (recommended)
- **Cordova**

## 🛠️ Tech Stack

- **Phaser 3** - Game framework
- **Vite** - Build tool
- **Vanilla JavaScript** - No framework dependencies

## 📄 License

MIT License
