// Game Configuration
export const CONFIG = {
    // Platform Detection
    // Set via build flags: VITE_PLATFORM=steam or VITE_PLATFORM=mobile
    PLATFORM: import.meta.env?.VITE_PLATFORM || 'web', // 'steam', 'mobile', 'web'

    // Platform-specific settings
    IS_STEAM: import.meta.env?.VITE_PLATFORM === 'steam',
    IS_MOBILE_APP: import.meta.env?.VITE_PLATFORM === 'mobile',

    // Screen
    WIDTH: 800,
    HEIGHT: 600,

    // Game Balance - Optimized for 5-15 minute runs
    RUN_TARGET_TIME: {
        MIN: 5 * 60 * 1000,   // 5 minutes - beginner run
        AVERAGE: 10 * 60 * 1000, // 10 minutes - average run
        MAX: 15 * 60 * 1000,  // 15 minutes - skilled player
    },

    // Player
    PLAYER: {
        SPEED: 200,
        MAX_HEALTH: 100,
        INVINCIBILITY_TIME: 500, // ms after taking damage
    },

    // Enemies - Balanced for 5-15 min runs
    ENEMY: {
        SPAWN_RATE: 2000, // ms between spawns (gets faster over time)
        SPAWN_DISTANCE: 400, // pixels from player
        MAX_ENEMIES: 150, // Cap to prevent lag

        // Difficulty milestones (in seconds)
        DIFFICULTY_PHASES: {
            EARLY: { end: 60, spawnMultiplier: 1, healthMultiplier: 1 },      // 0-1 min
            MID: { end: 300, spawnMultiplier: 1.5, healthMultiplier: 1.3 },    // 1-5 min
            LATE: { end: 600, spawnMultiplier: 2.5, healthMultiplier: 1.8 },   // 5-10 min
            ENDGAME: { end: 900, spawnMultiplier: 4, healthMultiplier: 2.5 },  // 10-15 min
            HELL: { end: Infinity, spawnMultiplier: 6, healthMultiplier: 3 }   // 15+ min (very hard)
        },

        TYPES: {
            NORMAL: {
                health: 20,
                speed: 80,
                damage: 10,
                xp: 5,
                color: 0xe74c3c
            },
            FAST: {
                health: 10,
                speed: 150,
                damage: 5,
                xp: 3,
                color: 0xf39c12
            },
            TANK: {
                health: 80,
                speed: 40,
                damage: 25,
                xp: 15,
                color: 0x8e44ad
            },
            BOSS: {
                health: 500,
                speed: 30,
                damage: 40,
                xp: 100,
                color: 0x9b59b6,
                scale: 2.5
            }
        },

        // Boss spawns at minute milestones
        BOSS_SPAWN_MINUTES: [3, 7, 12]
    },

    // XP & Leveling
    XP: {
        BASE_TO_LEVEL: 20,
        LEVEL_MULTIPLIER: 1.3, // Each level needs 30% more XP
    },

    // Weapons
    WEAPONS: {
        PROJECTILE: {
            name: 'Energy Bolt',
            damage: 15,
            cooldown: 1000,
            speed: 400,
            pierce: 1,
            color: 0x3498db
        },
        AREA: {
            name: 'Nova Blast',
            damage: 25,
            cooldown: 3000,
            radius: 100,
            color: 0xe74c3c
        },
        CHAIN: {
            name: 'Chain Lightning',
            damage: 10,
            cooldown: 2000,
            chains: 3,
            range: 150,
            color: 0xf1c40f
        },
        ORBIT: {
            name: 'Orbital Shield',
            damage: 8,
            cooldown: 100,
            orbs: 2,
            radius: 80,
            color: 0x2ecc71
        },
        // New weapons
        LASER: {
            name: 'Laser Beam',
            damage: 5,
            cooldown: 50,
            range: 300,
            width: 4,
            color: 0xff00ff
        },
        BOOMERANG: {
            name: 'Boomerang',
            damage: 12,
            cooldown: 1500,
            speed: 300,
            returnSpeed: 400,
            pierce: 999,
            color: 0x9b59b6
        },
        EXPLOSIVE: {
            name: 'Explosive Shot',
            damage: 30,
            cooldown: 2500,
            speed: 200,
            explosionRadius: 80,
            color: 0xff6600
        },
        FREEZE: {
            name: 'Frost Nova',
            damage: 8,
            cooldown: 4000,
            radius: 120,
            slowDuration: 2000,
            slowAmount: 0.5,
            color: 0x00ffff
        }
    },

    // Upgrades offered on level up
    UPGRADES: {
        // Weapon upgrades
        DAMAGE_UP: { name: 'Damage +20%', type: 'damage', value: 0.2 },
        SPEED_UP: { name: 'Attack Speed +15%', type: 'cooldown', value: 0.15 },
        PIERCE_UP: { name: 'Pierce +1', type: 'pierce', value: 1 },
        AREA_UP: { name: 'Area +25%', type: 'area', value: 0.25 },

        // Player upgrades
        HEALTH_UP: { name: 'Max Health +20', type: 'maxHealth', value: 20 },
        REGEN: { name: 'Regen +1 HP/s', type: 'regen', value: 1 },
        MOVE_SPEED: { name: 'Move Speed +10%', type: 'moveSpeed', value: 0.1 },
        XP_BOOST: { name: 'XP Gain +15%', type: 'xpBoost', value: 0.15 },
    },

    // Meta Progression (persistent)
    META: {
        CHARACTERS: [
            { id: 'warrior', name: 'Warrior', startWeapon: 'PROJECTILE', bonus: { maxHealth: 20 }, cost: 0 },
            { id: 'mage', name: 'Mage', startWeapon: 'AREA', bonus: { damage: 0.1 }, cost: 500 },
            { id: 'rogue', name: 'Rogue', startWeapon: 'CHAIN', bonus: { moveSpeed: 0.15 }, cost: 500 },
            { id: 'paladin', name: 'Paladin', startWeapon: 'ORBIT', bonus: { maxHealth: 10, regen: 1 }, cost: 1000 },
        ],
        PERMANENT_UPGRADES: [
            { id: 'health1', name: 'Vitality I', bonus: { maxHealth: 10 }, cost: 100, maxLevel: 5 },
            { id: 'damage1', name: 'Power I', bonus: { damage: 0.05 }, cost: 150, maxLevel: 5 },
            { id: 'speed1', name: 'Swiftness I', bonus: { moveSpeed: 0.05 }, cost: 100, maxLevel: 5 },
            { id: 'xp1', name: 'Wisdom I', bonus: { xpBoost: 0.1 }, cost: 200, maxLevel: 5 },
            { id: 'regen1', name: 'Recovery I', bonus: { regen: 0.5 }, cost: 150, maxLevel: 5 },
            { id: 'armor1', name: 'Armor I', bonus: { armor: 2 }, cost: 175, maxLevel: 5 },
        ],

        // Achievements unlock bonuses
        ACHIEVEMENTS: [
            { id: 'first_run', name: 'First Steps', description: 'Complete your first run', reward: 100 },
            { id: 'survive_5', name: 'Survivor', description: 'Survive 5 minutes', reward: 200 },
            { id: 'survive_10', name: 'Veteran', description: 'Survive 10 minutes', reward: 500 },
            { id: 'survive_15', name: 'Legend', description: 'Survive 15 minutes', reward: 1000 },
            { id: 'kill_100', name: 'Hunter', description: 'Kill 100 enemies in one run', reward: 150 },
            { id: 'kill_500', name: 'Slayer', description: 'Kill 500 enemies in one run', reward: 400 },
            { id: 'level_10', name: 'Powered Up', description: 'Reach level 10', reward: 200 },
            { id: 'level_20', name: 'Unstoppable', description: 'Reach level 20', reward: 500 },
            { id: 'boss_kill', name: 'Boss Slayer', description: 'Defeat a boss', reward: 300 },
            { id: 'all_weapons', name: 'Arsenal', description: 'Have 4 weapons at once', reward: 400 },
        ]
    },

    // Monetization - Platform dependent
    MONETIZATION: {
        // Mobile (Free to play)
        MOBILE: {
            hasAds: true,
            rewardedAds: {
                doubleCoins: true,
                freeRevive: true,
                bonusUpgrade: true
            },
            iap: {
                removeAds: { price: 2.99, id: 'remove_ads' },
                starterPack: { price: 4.99, id: 'starter_pack', coins: 1000, character: 'mage' },
                coinPacks: [
                    { price: 0.99, coins: 500, id: 'coins_small' },
                    { price: 2.99, coins: 2000, id: 'coins_medium' },
                    { price: 4.99, coins: 5000, id: 'coins_large' },
                ]
            }
        },

        // Steam/PC (Paid game - no ads, no IAP)
        STEAM: {
            hasAds: false,
            price: 4.99, // USD
            // All content unlockable through gameplay only
            bonusStartingCoins: 500, // Thank you for purchasing!
        }
    }
};
