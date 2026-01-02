import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'NORMAL', healthMultiplier = 1) {
        const textureMap = {
            'NORMAL': 'enemy_normal',
            'FAST': 'enemy_fast',
            'TANK': 'enemy_tank',
            'BOSS': 'enemy_boss'
        };

        super(scene, x, y, textureMap[type] || 'enemy_normal');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Get config for this type
        this.enemyType = type;
        this.config = CONFIG.ENEMY.TYPES[type] || CONFIG.ENEMY.TYPES.NORMAL;
        this.isBoss = type === 'BOSS';

        // Stats with difficulty scaling
        this.maxHealth = Math.floor(this.config.health * healthMultiplier);
        this.currentHealth = this.maxHealth;
        this.speed = this.config.speed;
        this.damage = this.config.damage;
        this.xpValue = Math.floor(this.config.xp * healthMultiplier);

        // Setup physics
        const radius = this.isBoss ? 24 : 12;
        this.body.setCircle(radius, this.isBoss ? 8 : 4, this.isBoss ? 8 : 4);

        // Boss visuals
        if (this.isBoss) {
            this.setScale(this.config.scale || 2);
            this.createHealthBar();
        }

        // State
        this.isAlive = true;
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(0, 0, 60, 8, 0x333333);
        this.healthBarFill = this.scene.add.rectangle(0, 0, 60, 8, 0xe74c3c);
        this.healthBarBg.setOrigin(0.5);
        this.healthBarFill.setOrigin(0, 0.5);
    }

    update(player) {
        if (!this.isAlive || !player) return;

        // Move toward player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        // Update boss health bar position
        if (this.isBoss && this.healthBarBg) {
            this.healthBarBg.setPosition(this.x, this.y - 40);
            this.healthBarFill.setPosition(this.x - 30, this.y - 40);
        }
    }

    takeDamage(amount) {
        if (!this.isAlive) return false;

        this.currentHealth -= amount;

        // Visual feedback
        this.setTint(0xffffff);
        this.scene.time.delayedCall(50, () => {
            if (this.active) this.clearTint();
        });

        // Knockback (less for bosses)
        const player = this.scene.player;
        if (player) {
            const knockback = this.isBoss ? 50 : 200;
            const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
            this.setVelocity(
                Math.cos(angle) * knockback,
                Math.sin(angle) * knockback
            );
        }

        // Update boss health bar
        if (this.isBoss && this.healthBarFill) {
            const percent = Math.max(0, this.currentHealth / this.maxHealth);
            this.healthBarFill.setScale(percent, 1);
        }

        if (this.currentHealth <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    die() {
        if (!this.isAlive) return;

        this.isAlive = false;

        // Spawn XP orbs (multiple for bosses)
        if (this.isBoss) {
            // Spawn many XP orbs in a circle
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 / 10) * i;
                const ox = this.x + Math.cos(angle) * 30;
                const oy = this.y + Math.sin(angle) * 30;
                this.scene.spawnXP(ox, oy, Math.floor(this.xpValue / 10));
            }
            // Also spawn a health pickup
            this.scene.spawnHealthPickup(this.x, this.y);

            // Clean up health bar
            this.healthBarBg?.destroy();
            this.healthBarFill?.destroy();
        } else {
            this.scene.spawnXP(this.x, this.y, this.xpValue);
        }

        // Death effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: this.isBoss ? 3 : 1.5,
            duration: this.isBoss ? 500 : 150,
            onComplete: () => {
                this.destroy();
            }
        });

        // Emit death event
        this.scene.events.emit('enemyKilled', this.enemyType);
    }
}

// Enemy Spawner Class - Optimized for 5-15 minute runs
export class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnTimer = 0;
        this.spawnRate = CONFIG.ENEMY.SPAWN_RATE;
        this.spawnDistance = CONFIG.ENEMY.SPAWN_DISTANCE;
        this.waveNumber = 0;
        this.bossesSpawned = [];
        this.currentPhase = 'EARLY';
    }

    getCurrentPhase() {
        const timeSeconds = (this.scene.player?.survivalTime || 0) / 1000;
        const phases = CONFIG.ENEMY.DIFFICULTY_PHASES;

        for (const [phaseName, phase] of Object.entries(phases)) {
            if (timeSeconds < phase.end) {
                return { name: phaseName, ...phase };
            }
        }
        return { name: 'HELL', ...phases.HELL };
    }

    update(time, delta) {
        this.spawnTimer += delta;

        // Get current difficulty phase
        const phase = this.getCurrentPhase();
        this.currentPhase = phase.name;

        // Check for boss spawns
        this.checkBossSpawn();

        // Cap total enemies for performance
        const currentEnemies = this.scene.enemies.getChildren().length;
        if (currentEnemies >= CONFIG.ENEMY.MAX_ENEMIES) return;

        // Spawn enemies based on phase
        const adjustedSpawnRate = this.spawnRate / phase.spawnMultiplier;
        if (this.spawnTimer >= adjustedSpawnRate) {
            this.spawnTimer = 0;
            this.spawnWave(phase);
        }
    }

    checkBossSpawn() {
        const timeMinutes = (this.scene.player?.survivalTime || 0) / 60000;
        const bossMinutes = CONFIG.ENEMY.BOSS_SPAWN_MINUTES;

        bossMinutes.forEach(minute => {
            if (timeMinutes >= minute && !this.bossesSpawned.includes(minute)) {
                this.bossesSpawned.push(minute);
                this.spawnBoss();
            }
        });
    }

    spawnBoss() {
        const player = this.scene.player;
        if (!player) return;

        // Spawn boss at edge of screen
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const x = player.x + Math.cos(angle) * this.spawnDistance;
        const y = player.y + Math.sin(angle) * this.spawnDistance;

        const phase = this.getCurrentPhase();
        const boss = new Enemy(this.scene, x, y, 'BOSS', phase.healthMultiplier);
        this.scene.enemies.add(boss);

        // Boss spawn announcement
        this.scene.events.emit('bossSpawned');
    }

    spawnWave(phase) {
        const player = this.scene.player;
        if (!player) return;

        this.waveNumber++;

        // Calculate how many enemies to spawn
        const baseCount = Math.min(1 + Math.floor(this.waveNumber / 5), 6);
        const count = Math.floor(baseCount * phase.spawnMultiplier);

        for (let i = 0; i < count; i++) {
            this.spawnEnemy(player, phase.healthMultiplier);
        }
    }

    spawnEnemy(player, healthMultiplier = 1) {
        // Spawn at random position around player
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = this.spawnDistance + Phaser.Math.Between(-50, 50);

        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;

        // Determine enemy type based on time survived
        const type = this.getRandomEnemyType();

        const enemy = new Enemy(this.scene, x, y, type, healthMultiplier);
        this.scene.enemies.add(enemy);
    }

    getRandomEnemyType() {
        const roll = Math.random();
        const time = this.scene.player?.survivalTime || 0;

        // Unlock tank enemies after 30 seconds
        const tankChance = time > 30000 ? 0.15 : 0;
        // Fast enemies become more common over time
        const fastChance = Math.min(0.1 + time / 120000, 0.35);

        if (roll < tankChance) return 'TANK';
        if (roll < tankChance + fastChance) return 'FAST';
        return 'NORMAL';
    }

    reset() {
        this.spawnTimer = 0;
        this.waveNumber = 0;
        this.bossesSpawned = [];
        this.currentPhase = 'EARLY';
    }
}
