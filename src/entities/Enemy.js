import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'NORMAL', healthMultiplier = 1) {
        // Get config for this type
        const config = CONFIG.ENEMY.TYPES[type] || CONFIG.ENEMY.TYPES.NORMAL;
        const texture = config.texture || 'enemy_normal';

        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.enemyType = type;
        this.config = config;
        this.isBoss = type === 'BOSS';

        // Stats with difficulty scaling
        this.maxHealth = Math.floor(config.health * healthMultiplier);
        this.currentHealth = this.maxHealth;
        this.speed = config.speed;
        this.damage = config.damage;
        this.xpValue = Math.floor(config.xp * healthMultiplier);

        // Setup physics
        const radius = this.isBoss ? 24 : 12;
        this.body.setCircle(radius, this.isBoss ? 8 : 4, this.isBoss ? 8 : 4);

        // Boss/Elite visuals
        if (config.scale) {
            this.setScale(config.scale);
        }
        if (this.isBoss || type === 'ELITE') {
            this.createHealthBar();
        }

        // State
        this.isAlive = true;
        this.isSlowed = false;

        // Special enemy type setup
        this.setupSpecialBehavior();
    }

    setupSpecialBehavior() {
        // Ranged enemy
        if (this.type === 'RANGED') {
            this.lastShotTime = 0;
            this.projectileCooldown = this.config.projectileCooldown || 2000;
            this.projectileSpeed = this.config.projectileSpeed || 250;
            this.preferredDistance = this.config.preferredDistance || 200;
        }

        // Healer enemy
        if (this.type === 'HEALER') {
            this.lastHealTime = 0;
            this.healCooldown = this.config.healCooldown || 3000;
            this.healRadius = this.config.healRadius || 100;
            this.healAmount = this.config.healAmount || 5;
        }

        // Exploder enemy
        if (this.type === 'EXPLODER') {
            this.explosionRadius = this.config.explosionRadius || 60;
            this.explosionDamage = this.config.explosionDamage || 30;
        }

        // Splitter enemy
        if (this.type === 'SPLITTER') {
            this.splitCount = this.config.splitCount || 2;
        }

        // Set tint for special enemy types
        if (this.config.color && !this.isBoss) {
            this.setTint(this.config.color);
        }
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(0, 0, 60, 8, 0x333333);
        this.healthBarFill = this.scene.add.rectangle(0, 0, 60, 8, 0xe74c3c);
        this.healthBarBg.setOrigin(0.5);
        this.healthBarFill.setOrigin(0, 0.5);
    }

    update(player) {
        if (!this.isAlive || !player) return;

        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Ranged enemy behavior
        if (this.type === 'RANGED') {
            this.updateRangedBehavior(player, distToPlayer);
            return;
        }

        // Healer enemy behavior
        if (this.type === 'HEALER') {
            this.updateHealerBehavior(player);
        }

        // Move toward player (standard behavior)
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        // Update health bar position
        if (this.healthBarBg) {
            this.healthBarBg.setPosition(this.x, this.y - 40);
            this.healthBarFill.setPosition(this.x - 30, this.y - 40);
        }
    }

    updateRangedBehavior(player, distToPlayer) {
        const currentTime = this.scene.time.now;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        // Maintain preferred distance
        if (distToPlayer < this.preferredDistance - 50) {
            // Too close, move away
            this.setVelocity(
                Math.cos(angle + Math.PI) * this.speed,
                Math.sin(angle + Math.PI) * this.speed
            );
        } else if (distToPlayer > this.preferredDistance + 50) {
            // Too far, move closer
            this.setVelocity(
                Math.cos(angle) * this.speed * 0.7,
                Math.sin(angle) * this.speed * 0.7
            );
        } else {
            // In range, stop and shoot
            this.setVelocity(0, 0);
        }

        // Shoot projectile
        if (currentTime - this.lastShotTime >= this.projectileCooldown) {
            this.lastShotTime = currentTime;
            this.shootAtPlayer(player);
        }
    }

    shootAtPlayer(player) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        // Create enemy projectile
        const proj = this.scene.physics.add.sprite(this.x, this.y, 'enemy_projectile');
        proj.setVelocity(
            Math.cos(angle) * this.projectileSpeed,
            Math.sin(angle) * this.projectileSpeed
        );
        proj.damage = this.damage;
        proj.setTint(0xe74c3c);

        // Add to a group if exists, or handle collision manually
        if (!this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles = this.scene.physics.add.group();
            this.scene.physics.add.overlap(
                this.scene.player,
                this.scene.enemyProjectiles,
                (player, proj) => {
                    player.takeDamage(proj.damage);
                    proj.destroy();
                }
            );
        }
        this.scene.enemyProjectiles.add(proj);

        // Destroy after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            if (proj.active) proj.destroy();
        });
    }

    updateHealerBehavior(player) {
        const currentTime = this.scene.time.now;

        // Heal nearby enemies
        if (currentTime - this.lastHealTime >= this.healCooldown) {
            this.lastHealTime = currentTime;
            this.healNearbyEnemies();
        }
    }

    healNearbyEnemies() {
        // Visual effect
        const healCircle = this.scene.add.circle(this.x, this.y, this.healRadius, 0x27ae60, 0.3);
        this.scene.tweens.add({
            targets: healCircle,
            alpha: 0,
            duration: 500,
            onComplete: () => healCircle.destroy()
        });

        // Heal all enemies in radius
        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy === this || !enemy.isAlive) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist <= this.healRadius) {
                enemy.currentHealth = Math.min(enemy.maxHealth, enemy.currentHealth + this.healAmount);

                // Visual feedback
                const healText = this.scene.add.text(enemy.x, enemy.y - 20, `+${this.healAmount}`, {
                    fontSize: '12px',
                    color: '#27ae60'
                }).setOrigin(0.5);

                this.scene.tweens.add({
                    targets: healText,
                    y: healText.y - 20,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => healText.destroy()
                });
            }
        });
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
