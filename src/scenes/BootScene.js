import Phaser from 'phaser';

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

        // Progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x3498db, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Generate all game graphics
        this.createGameGraphics();
    }

    createGameGraphics() {
        // Player sprite
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0x3498db, 1);
        playerGraphics.fillCircle(16, 16, 14);
        playerGraphics.fillStyle(0x2980b9, 1);
        playerGraphics.fillCircle(16, 16, 10);
        playerGraphics.generateTexture('player', 32, 32);

        // Enemy sprites
        const enemyColors = [0xe74c3c, 0xf39c12, 0x8e44ad];
        const enemyNames = ['enemy_normal', 'enemy_fast', 'enemy_tank'];
        const enemySizes = [12, 10, 18];

        enemyNames.forEach((name, i) => {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(enemyColors[i], 1);
            g.fillCircle(16, 16, enemySizes[i]);
            g.generateTexture(name, 32, 32);
        });

        // Boss sprite
        const bossGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bossGraphics.fillStyle(0x9b59b6, 1);
        bossGraphics.fillCircle(24, 24, 22);
        bossGraphics.fillStyle(0x8e44ad, 1);
        bossGraphics.fillCircle(24, 24, 16);
        bossGraphics.fillStyle(0xe74c3c, 1);
        bossGraphics.fillCircle(24, 24, 8);
        bossGraphics.generateTexture('enemy_boss', 48, 48);

        // Projectile
        const projGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        projGraphics.fillStyle(0x3498db, 1);
        projGraphics.fillCircle(6, 6, 5);
        projGraphics.generateTexture('projectile', 12, 12);

        // XP orb
        const xpGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        xpGraphics.fillStyle(0x2ecc71, 1);
        xpGraphics.fillCircle(6, 6, 5);
        xpGraphics.fillStyle(0x27ae60, 1);
        xpGraphics.fillCircle(6, 6, 3);
        xpGraphics.generateTexture('xp_orb', 12, 12);

        // Health pickup
        const healthGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        healthGraphics.fillStyle(0xe74c3c, 1);
        healthGraphics.fillRect(4, 8, 8, 16);
        healthGraphics.fillRect(0, 12, 16, 8);
        healthGraphics.generateTexture('health_pickup', 16, 24);

        // Area effect
        const areaGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        areaGraphics.fillStyle(0xe74c3c, 0.5);
        areaGraphics.fillCircle(50, 50, 50);
        areaGraphics.generateTexture('area_effect', 100, 100);

        // Chain lightning
        const chainGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        chainGraphics.lineStyle(3, 0xf1c40f, 1);
        chainGraphics.lineBetween(0, 4, 60, 4);
        chainGraphics.generateTexture('chain_lightning', 60, 8);

        // Orbital orb
        const orbGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        orbGraphics.fillStyle(0x2ecc71, 1);
        orbGraphics.fillCircle(8, 8, 8);
        orbGraphics.generateTexture('orbital', 16, 16);

        // Virtual joystick base
        const joystickBase = this.make.graphics({ x: 0, y: 0, add: false });
        joystickBase.fillStyle(0xffffff, 0.3);
        joystickBase.fillCircle(60, 60, 60);
        joystickBase.generateTexture('joystick_base', 120, 120);

        // Virtual joystick thumb
        const joystickThumb = this.make.graphics({ x: 0, y: 0, add: false });
        joystickThumb.fillStyle(0xffffff, 0.5);
        joystickThumb.fillCircle(25, 25, 25);
        joystickThumb.generateTexture('joystick_thumb', 50, 50);

        // Button
        const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        buttonGraphics.fillStyle(0x3498db, 1);
        buttonGraphics.fillRoundedRect(0, 0, 200, 50, 10);
        buttonGraphics.generateTexture('button', 200, 50);

        // Button hover
        const buttonHover = this.make.graphics({ x: 0, y: 0, add: false });
        buttonHover.fillStyle(0x2980b9, 1);
        buttonHover.fillRoundedRect(0, 0, 200, 50, 10);
        buttonHover.generateTexture('button_hover', 200, 50);

        // Upgrade card
        const cardGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        cardGraphics.fillStyle(0x2c3e50, 1);
        cardGraphics.fillRoundedRect(0, 0, 180, 220, 15);
        cardGraphics.lineStyle(3, 0x3498db, 1);
        cardGraphics.strokeRoundedRect(0, 0, 180, 220, 15);
        cardGraphics.generateTexture('upgrade_card', 180, 220);

        // Background tile
        const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bgGraphics.fillStyle(0x1a1a2e, 1);
        bgGraphics.fillRect(0, 0, 64, 64);
        bgGraphics.lineStyle(1, 0x16213e, 1);
        bgGraphics.strokeRect(0, 0, 64, 64);
        bgGraphics.generateTexture('bg_tile', 64, 64);
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
