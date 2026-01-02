import Phaser from 'phaser';
import { SpriteGenerator } from '../utils/SpriteGenerator.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Generate all game graphics using the sprite generator
        this.createGameGraphics();
    }

    createGameGraphics() {
        // Use the enhanced sprite generator for better visuals
        const spriteGen = new SpriteGenerator(this);
        spriteGen.generateAll();

        // Generate any additional legacy sprites needed for compatibility
        this.createLegacySprites();
    }

    createLegacySprites() {
        // Enemy sprites with old names for backward compatibility
        const enemyColors = [0xe74c3c, 0xf39c12, 0x8e44ad];
        const enemyNames = ['enemy_normal', 'enemy_fast', 'enemy_tank'];
        const enemySizes = [12, 10, 18];

        enemyNames.forEach((name, i) => {
            if (!this.textures.exists(name)) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(enemyColors[i], 1);
                g.fillCircle(16, 16, enemySizes[i]);
                g.generateTexture(name, 32, 32);
                g.destroy();
            }
        });

        // XP orb (if not generated)
        if (!this.textures.exists('xp_orb')) {
            const xpGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            xpGraphics.fillStyle(0x2ecc71, 1);
            xpGraphics.fillCircle(6, 6, 5);
            xpGraphics.fillStyle(0x27ae60, 1);
            xpGraphics.fillCircle(6, 6, 3);
            xpGraphics.generateTexture('xp_orb', 12, 12);
            xpGraphics.destroy();
        }

        // Health pickup
        if (!this.textures.exists('health_pickup')) {
            const healthGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            healthGraphics.fillStyle(0xe74c3c, 1);
            healthGraphics.fillRect(4, 8, 8, 16);
            healthGraphics.fillRect(0, 12, 16, 8);
            healthGraphics.generateTexture('health_pickup', 16, 24);
            healthGraphics.destroy();
        }

        // Area effect
        if (!this.textures.exists('area_effect')) {
            const areaGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            areaGraphics.fillStyle(0xe74c3c, 0.5);
            areaGraphics.fillCircle(50, 50, 50);
            areaGraphics.generateTexture('area_effect', 100, 100);
            areaGraphics.destroy();
        }

        // Chain lightning
        if (!this.textures.exists('chain_lightning')) {
            const chainGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            chainGraphics.lineStyle(3, 0xf1c40f, 1);
            chainGraphics.lineBetween(0, 4, 60, 4);
            chainGraphics.generateTexture('chain_lightning', 60, 8);
            chainGraphics.destroy();
        }

        // Background tile
        if (!this.textures.exists('bg_tile')) {
            const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
            bgGraphics.fillStyle(0x1a1a2e, 1);
            bgGraphics.fillRect(0, 0, 64, 64);
            bgGraphics.lineStyle(1, 0x16213e, 1);
            bgGraphics.strokeRect(0, 0, 64, 64);
            bgGraphics.generateTexture('bg_tile', 64, 64);
            bgGraphics.destroy();
        }
    }

    create() {
        // Initialize save data if needed
        this.initializeSaveData();

        // Go to menu
        this.scene.start('MenuScene');
    }

    initializeSaveData() {
        const existingSave = localStorage.getItem('survivorGame');

        if (!existingSave) {
            // Determine starting coins based on platform
            const isSteam = import.meta.env?.VITE_PLATFORM === 'steam';
            const startingCoins = isSteam ? 500 : 0; // Steam buyers get bonus coins

            const defaultSave = {
                // Platform info
                platform: import.meta.env?.VITE_PLATFORM || 'web',
                version: '1.0.0',

                // Currency & progress
                coins: startingCoins,
                highScore: 0,
                longestSurvival: 0, // in seconds

                // Unlocks
                unlockedCharacters: ['warrior'],
                selectedCharacter: 'warrior',
                permanentUpgrades: {},
                unlockedAchievements: [],

                // Monetization (mobile only)
                adsRemoved: isSteam, // Steam = no ads
                purchasedPacks: [],

                // Lifetime stats
                totalRuns: 0,
                totalKills: 0,
                totalBossKills: 0,
                totalPlayTime: 0,
                totalCoinsEarned: startingCoins,
                totalLevelsGained: 0,

                // Session tracking
                firstPlayDate: new Date().toISOString(),
                lastPlayDate: new Date().toISOString()
            };
            localStorage.setItem('survivorGame', JSON.stringify(defaultSave));
        } else {
            // Migrate old saves if needed
            const save = JSON.parse(existingSave);
            let needsUpdate = false;

            // Add new fields that might be missing
            if (save.longestSurvival === undefined) {
                save.longestSurvival = save.highScore || 0;
                needsUpdate = true;
            }
            if (save.totalBossKills === undefined) {
                save.totalBossKills = 0;
                needsUpdate = true;
            }
            if (save.unlockedAchievements === undefined) {
                save.unlockedAchievements = [];
                needsUpdate = true;
            }

            if (needsUpdate) {
                localStorage.setItem('survivorGame', JSON.stringify(save));
            }
        }
    }
}
