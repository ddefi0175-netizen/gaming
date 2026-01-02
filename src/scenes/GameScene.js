import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy, EnemySpawner } from '../entities/Enemy.js';
import { createWeapon } from '../entities/Weapon.js';
import { XPOrb, HealthPickup } from '../entities/Pickups.js';
import { VirtualJoystick } from '../ui/VirtualJoystick.js';
import { CONFIG } from '../config/GameConfig.js';
import { getSoundManager } from '../utils/SoundManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize sound manager
        this.soundManager = getSoundManager(this);
        this.soundManager.resume();
        this.soundManager.startMusic();

        // Reset game state
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;

        // Create tiled background
        this.createBackground();

        // Create physics groups
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.orbitals = this.physics.add.group();
        this.xpOrbs = this.physics.add.group();
        this.healthPickups = this.physics.add.group();

        // Create player at center
        this.player = new Player(this, 0, 0);

        // Setup camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Create initial weapon based on character
        const saveData = JSON.parse(localStorage.getItem('survivorGame'));
        const character = CONFIG.META.CHARACTERS.find(c => c.id === saveData.selectedCharacter);
        const startWeapon = createWeapon(this, this.player, character?.startWeapon || 'PROJECTILE');
        this.player.weapons.push(startWeapon);

        // Enemy spawner
        this.enemySpawner = new EnemySpawner(this);

        // Setup input
        this.setupInput();

        // Setup collisions
        this.setupCollisions();

        // Start UI scene
        this.scene.launch('UIScene');

        // Event listeners
        this.setupEventListeners();

        // Start game timer
        this.gameStartTime = this.time.now;
    }

    createBackground() {
        // Create a large tiled background
        const tileSize = 64;
        const tilesX = 50;
        const tilesY = 50;

        for (let x = -tilesX / 2; x < tilesX / 2; x++) {
            for (let y = -tilesY / 2; y < tilesY / 2; y++) {
                this.add.image(x * tileSize, y * tileSize, 'bg_tile');
            }
        }
    }

    setupInput() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Extend cursors with WASD
        this.cursors.W = this.wasd.W;
        this.cursors.A = this.wasd.A;
        this.cursors.S = this.wasd.S;
        this.cursors.D = this.wasd.D;

        // Virtual joystick for mobile
        if (window.isMobile) {
            this.joystick = new VirtualJoystick(
                this,
                this.cameras.main.width * 0.15,
                this.cameras.main.height * 0.75
            );
        }

        // Pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
    }

    setupCollisions() {
        // Player vs Enemies
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Projectiles vs Enemies
        this.physics.add.overlap(
            this.projectiles,
            this.enemies,
            this.handleProjectileEnemyCollision,
            null,
            this
        );

        // Orbitals vs Enemies
        this.physics.add.overlap(
            this.orbitals,
            this.enemies,
            this.handleOrbitalEnemyCollision,
            null,
            this
        );

        // Player vs XP Orbs
        this.physics.add.overlap(
            this.player,
            this.xpOrbs,
            this.handleXPCollection,
            null,
            this
        );

        // Player vs Health Pickups
        this.physics.add.overlap(
            this.player,
            this.healthPickups,
            this.handleHealthCollection,
            null,
            this
        );
    }

    setupEventListeners() {
        // Level up event
        this.events.on('levelUp', (level) => {
            this.soundManager?.play('levelUp');
            this.showUpgradeScreen();
        });

        // Player death event
        this.events.on('playerDied', (stats) => {
            this.soundManager?.stopMusic();
            this.handleGameOver(stats);
        });

        // Boss spawned event
        this.events.on('bossSpawned', () => {
            this.showBossWarning();
        });

        // Enemy killed event - track boss kills
        this.events.on('enemyKilled', (type) => {
            if (type === 'BOSS') {
                this.player.bossKills = (this.player.bossKills || 0) + 1;
            }
        });

        // Clean up on shutdown
        this.events.on('shutdown', () => {
            this.events.off('levelUp');
            this.events.off('playerDied');
            this.events.off('bossSpawned');
            this.events.off('enemyKilled');
        });
    }

    showBossWarning() {
        const { width, height } = this.cameras.main;

        // Play warning sound
        this.soundManager?.play('bossWarning');

        const warning = this.add.text(width / 2, height / 2, '⚠️ BOSS INCOMING! ⚠️', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.tweens.add({
            targets: warning,
            alpha: 0,
            scale: 1.5,
            duration: 2000,
            onComplete: () => warning.destroy()
        });
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        // Update game time
        this.gameTime += delta;

        // Player movement
        this.player.handleMovement(this.cursors, this.joystick);
        this.player.update(time, delta);

        // Update weapons
        this.player.weapons.forEach(weapon => weapon.update(time, delta));

        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        // Update XP orbs
        this.xpOrbs.getChildren().forEach(orb => {
            orb.update(this.player);
        });

        // Enemy spawning
        this.enemySpawner.update(time, delta);

        // Update UI
        this.events.emit('updateTime', this.gameTime);
    }

    // Collision handlers
    handlePlayerEnemyCollision(player, enemy) {
        if (!enemy.isAlive) return;

        const died = player.takeDamage(enemy.damage);

        // Play hurt sound
        this.soundManager?.play('playerHurt');

        // Push enemy away
        const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        enemy.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200
        );
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        if (!enemy.isAlive) return;
        if (!projectile.hitEnemy(enemy)) return;

        // Play hit sound
        this.soundManager?.play('hit');

        const died = enemy.takeDamage(projectile.damage);
        if (died) {
            this.player.killCount++;
            this.player.damageDealt += projectile.damage;

            // Play death sound based on enemy type
            if (enemy.type === 'BOSS') {
                this.soundManager?.play('bossDeath');
            } else {
                this.soundManager?.play('enemyDeath');
            }
        }
    }

    handleOrbitalEnemyCollision(orbital, enemy) {
        if (!enemy.isAlive) return;

        // Check cooldown for this enemy
        const enemyId = enemy.body?.gameObject?.id || Math.random();
        const currentTime = this.time.now;

        if (orbital.lastHitTime[enemyId] &&
            currentTime - orbital.lastHitTime[enemyId] < orbital.hitCooldown) {
            return;
        }

        orbital.lastHitTime[enemyId] = currentTime;

        // Play hit sound
        this.soundManager?.play('hit');

        const died = enemy.takeDamage(orbital.damage);
        if (died) {
            this.player.killCount++;
            this.player.damageDealt += orbital.damage;

            // Play death sound
            if (enemy.type === 'BOSS') {
                this.soundManager?.play('bossDeath');
            } else {
                this.soundManager?.play('enemyDeath');
            }
        }
    }

    handleXPCollection(player, xpOrb) {
        this.soundManager?.play('pickup');
        xpOrb.collect(player);
    }

    handleHealthCollection(player, healthPickup) {
        this.soundManager?.play('pickup');
        healthPickup.collect(player);
    }

    // Spawn methods
    spawnXP(x, y, value) {
        const xp = new XPOrb(this, x, y, value);
        this.xpOrbs.add(xp);
    }

    spawnHealthPickup(x, y) {
        const health = new HealthPickup(this, x, y, 20);
        this.healthPickups.add(health);
    }

    // Game state
    showUpgradeScreen() {
        this.isPaused = true;
        this.physics.pause();
        this.scene.launch('UpgradeScene', { player: this.player });
    }

    resumeFromUpgrade() {
        this.isPaused = false;
        this.physics.resume();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
        } else {
            this.physics.resume();
        }
    }

    handleGameOver(stats) {
        this.isGameOver = true;
        this.physics.pause();

        // Add boss kills to stats
        stats.bossKills = this.player.bossKills || 0;

        // Calculate coins earned (bonus for bosses and survival milestones)
        let coinsEarned = Math.floor(
            stats.survivalTime / 1000 +
            stats.killCount * 2 +
            stats.level * 10 +
            stats.bossKills * 50  // Bonus for boss kills
        );

        // Bonus multiplier for reaching milestones
        const survivalMinutes = stats.survivalTime / 60000;
        if (survivalMinutes >= 15) coinsEarned *= 2;
        else if (survivalMinutes >= 10) coinsEarned *= 1.5;
        else if (survivalMinutes >= 5) coinsEarned *= 1.2;

        coinsEarned = Math.floor(coinsEarned);

        // Update save data
        const saveData = JSON.parse(localStorage.getItem('survivorGame'));
        saveData.coins += coinsEarned;
        saveData.totalRuns++;
        saveData.totalKills += stats.killCount;
        saveData.totalBossKills = (saveData.totalBossKills || 0) + stats.bossKills;
        saveData.totalPlayTime += stats.survivalTime;
        saveData.totalLevelsGained = (saveData.totalLevelsGained || 0) + stats.level;
        saveData.totalCoinsEarned = (saveData.totalCoinsEarned || 0) + coinsEarned;
        saveData.lastPlayDate = new Date().toISOString();

        // Update high score (survival time in seconds)
        const survivalSeconds = Math.floor(stats.survivalTime / 1000);
        if (survivalSeconds > (saveData.longestSurvival || 0)) {
            saveData.longestSurvival = survivalSeconds;
        }
        if (survivalSeconds > saveData.highScore) {
            saveData.highScore = survivalSeconds;
        }

        // Check achievements
        const newAchievements = this.checkAchievements(stats, saveData);

        // Award achievement coins
        newAchievements.forEach(achievement => {
            saveData.coins += achievement.reward;
            saveData.totalCoinsEarned += achievement.reward;
        });

        localStorage.setItem('survivorGame', JSON.stringify(saveData));

        // Stop UI scene and show game over
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', {
            stats: stats,
            coinsEarned: coinsEarned,
            newAchievements: newAchievements
        });
    }

    checkAchievements(stats, saveData) {
        const achievements = CONFIG.META.ACHIEVEMENTS;
        const unlocked = saveData.unlockedAchievements || [];
        const newUnlocks = [];

        const survivalSeconds = Math.floor(stats.survivalTime / 1000);

        achievements.forEach(achievement => {
            if (unlocked.includes(achievement.id)) return;

            let earned = false;

            switch (achievement.id) {
                case 'first_run':
                    earned = saveData.totalRuns === 0; // This is the first run
                    break;
                case 'survive_5':
                    earned = survivalSeconds >= 300;
                    break;
                case 'survive_10':
                    earned = survivalSeconds >= 600;
                    break;
                case 'survive_15':
                    earned = survivalSeconds >= 900;
                    break;
                case 'kill_100':
                    earned = stats.killCount >= 100;
                    break;
                case 'kill_500':
                    earned = stats.killCount >= 500;
                    break;
                case 'level_10':
                    earned = stats.level >= 10;
                    break;
                case 'level_20':
                    earned = stats.level >= 20;
                    break;
                case 'boss_kill':
                    earned = stats.bossKills >= 1;
                    break;
                case 'all_weapons':
                    earned = this.player.weapons.length >= 4;
                    break;
            }

            if (earned) {
                unlocked.push(achievement.id);
                newUnlocks.push(achievement);
            }
        });

        saveData.unlockedAchievements = unlocked;
        return newUnlocks;
    }
}
