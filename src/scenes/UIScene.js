import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Get reference to game scene
        this.gameScene = this.scene.get('GameScene');

        // Health bar
        this.createHealthBar(20, 20);

        // XP bar
        this.createXPBar(20, 50);

        // Level display
        this.levelText = this.add.text(20, 75, 'Level: 1', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });

        // Timer
        this.timerText = this.add.text(width / 2, 15, '00:00', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        // Phase indicator (below timer)
        this.phaseText = this.add.text(width / 2, 42, 'EARLY', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#3498db'
        }).setOrigin(0.5, 0);

        // Kill counter
        this.killText = this.add.text(width - 20, 20, '💀 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        }).setOrigin(1, 0);

        // Enemy count
        this.enemyCountText = this.add.text(width - 20, 45, '👾 0', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        }).setOrigin(1, 0);

        // Weapon icons (top right)
        this.weaponIcons = this.add.container(width - 20, 70);

        // Setup event listeners
        this.setupEventListeners();

        // Initial UI update
        this.updateUI();
    }

    createHealthBar(x, y) {
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(x, y, 200, 20);

        this.healthBar = this.add.graphics();
        this.updateHealthBar(100, 100);

        this.healthText = this.add.text(x + 100, y + 10, '100/100', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    createXPBar(x, y) {
        this.xpBarBg = this.add.graphics();
        this.xpBarBg.fillStyle(0x333333, 1);
        this.xpBarBg.fillRect(x, y, 200, 15);

        this.xpBar = this.add.graphics();
        this.updateXPBar(0, 20);

        this.xpText = this.add.text(x + 100, y + 7, '0/20', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    setupEventListeners() {
        // Listen to game scene events
        this.gameScene.events.on('playerDamaged', (current, max) => {
            this.updateHealthBar(current, max);
        });

        this.gameScene.events.on('xpChanged', (xp, xpNeeded, level) => {
            this.updateXPBar(xp, xpNeeded);
            this.levelText.setText(`Level: ${level}`);
        });

        this.gameScene.events.on('updateTime', (time) => {
            this.updateTimer(time);
        });

        this.gameScene.events.on('enemyKilled', () => {
            this.updateKillCount();
        });
    }

    updateHealthBar(current, max) {
        this.healthBar.clear();

        const percentage = current / max;
        const color = percentage > 0.5 ? 0x2ecc71 : percentage > 0.25 ? 0xf39c12 : 0xe74c3c;

        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(20, 20, 200 * percentage, 20);

        this.healthText?.setText(`${Math.ceil(current)}/${max}`);
    }

    updateXPBar(xp, xpNeeded) {
        this.xpBar.clear();

        const percentage = Math.min(xp / xpNeeded, 1);

        this.xpBar.fillStyle(0x3498db, 1);
        this.xpBar.fillRect(20, 50, 200 * percentage, 15);

        this.xpText?.setText(`${xp}/${xpNeeded}`);
    }

    updateTimer(timeMs) {
        const seconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        this.timerText.setText(
            `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );

        // Update phase indicator
        this.updatePhaseIndicator(seconds);

        // Update enemy count
        this.updateEnemyCount();
    }

    updatePhaseIndicator(seconds) {
        const phaseColors = {
            'EARLY': '#3498db',
            'MID': '#2ecc71',
            'LATE': '#f39c12',
            'ENDGAME': '#e74c3c',
            'HELL': '#9b59b6'
        };

        let phase = 'EARLY';
        if (seconds >= 900) phase = 'HELL';
        else if (seconds >= 600) phase = 'ENDGAME';
        else if (seconds >= 300) phase = 'LATE';
        else if (seconds >= 60) phase = 'MID';

        this.phaseText.setText(phase);
        this.phaseText.setColor(phaseColors[phase]);
    }

    updateEnemyCount() {
        const count = this.gameScene.enemies?.getChildren().length || 0;
        this.enemyCountText.setText(`👾 ${count}`);
    }

    updateKillCount() {
        const kills = this.gameScene.player?.killCount || 0;
        this.killText.setText(`💀 ${kills}`);
    }

    updateUI() {
        const player = this.gameScene.player;
        if (!player) return;

        this.updateHealthBar(player.currentHealth, player.maxHealth);
        this.updateXPBar(player.xp, player.xpToNextLevel);
        this.levelText.setText(`Level: ${player.level}`);
        this.updateKillCount();
    }

    update() {
        // Continuous UI updates if needed
    }
}
