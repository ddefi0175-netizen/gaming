import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Load character data
        this.saveData = JSON.parse(localStorage.getItem('survivorGame'));
        this.characterId = this.saveData.selectedCharacter;
        this.characterData = CONFIG.META.CHARACTERS.find(c => c.id === this.characterId);

        // Base stats
        this.baseMaxHealth = CONFIG.PLAYER.MAX_HEALTH;
        this.baseSpeed = CONFIG.PLAYER.SPEED;

        // Apply permanent upgrades
        this.applyPermanentUpgrades();

        // Current stats
        this.currentHealth = this.maxHealth;
        this.isInvincible = false;
        this.invincibilityTime = CONFIG.PLAYER.INVINCIBILITY_TIME;

        // XP system
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = CONFIG.XP.BASE_TO_LEVEL;
        this.xpBoost = this.stats.xpBoost || 0;

        // Regen
        this.regenAmount = this.stats.regen || 0;
        this.regenTimer = 0;

        // Setup physics
        this.setCollideWorldBounds(false);
        this.body.setCircle(14, 2, 2);

        // Weapons array
        this.weapons = [];

        // Stats tracking
        this.killCount = 0;
        this.damageDealt = 0;
        this.survivalTime = 0;
    }

    applyPermanentUpgrades() {
        this.stats = {
            maxHealth: 0,
            damage: 0,
            moveSpeed: 0,
            xpBoost: 0,
            regen: 0
        };

        // Apply character bonus
        if (this.characterData && this.characterData.bonus) {
            Object.entries(this.characterData.bonus).forEach(([stat, value]) => {
                if (this.stats[stat] !== undefined) {
                    this.stats[stat] += value;
                }
            });
        }

        // Apply permanent upgrades
        const upgrades = this.saveData.permanentUpgrades || {};
        Object.entries(upgrades).forEach(([upgradeId, level]) => {
            const upgradeConfig = CONFIG.META.PERMANENT_UPGRADES.find(u => u.id === upgradeId);
            if (upgradeConfig && upgradeConfig.bonus) {
                Object.entries(upgradeConfig.bonus).forEach(([stat, value]) => {
                    if (this.stats[stat] !== undefined) {
                        this.stats[stat] += value * level;
                    }
                });
            }
        });

        // Calculate final stats
        this.maxHealth = this.baseMaxHealth + this.stats.maxHealth;
        this.speed = this.baseSpeed * (1 + this.stats.moveSpeed);
    }

    update(time, delta) {
        // Handle regen
        if (this.regenAmount > 0) {
            this.regenTimer += delta;
            if (this.regenTimer >= 1000) {
                this.heal(this.regenAmount);
                this.regenTimer = 0;
            }
        }

        // Update survival time
        this.survivalTime += delta;
    }

    handleMovement(cursors, joystick) {
        let velocityX = 0;
        let velocityY = 0;

        // Keyboard input
        if (cursors) {
            if (cursors.left.isDown || cursors.A?.isDown) velocityX = -1;
            if (cursors.right.isDown || cursors.D?.isDown) velocityX = 1;
            if (cursors.up.isDown || cursors.W?.isDown) velocityY = -1;
            if (cursors.down.isDown || cursors.S?.isDown) velocityY = 1;
        }

        // Joystick input (overrides keyboard)
        if (joystick && joystick.force > 0) {
            velocityX = joystick.forceX;
            velocityY = joystick.forceY;
        }

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX /= magnitude;
            velocityY /= magnitude;
        }

        this.setVelocity(velocityX * this.speed, velocityY * this.speed);
    }

    takeDamage(amount) {
        if (this.isInvincible) return false;

        this.currentHealth -= amount;
        this.isInvincible = true;

        // Visual feedback
        this.setTint(0xff0000);
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.setAlpha(1);
                this.clearTint();
            }
        });

        // Invincibility timer
        this.scene.time.delayedCall(this.invincibilityTime, () => {
            this.isInvincible = false;
        });

        // Emit damage event
        this.scene.events.emit('playerDamaged', this.currentHealth, this.maxHealth);

        // Check death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.die();
            return true;
        }

        return false;
    }

    heal(amount) {
        this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
        this.scene.events.emit('playerDamaged', this.currentHealth, this.maxHealth);
    }

    addXP(amount) {
        const boostedXP = Math.floor(amount * (1 + this.xpBoost));
        this.xp += boostedXP;

        // Check level up
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
            return true;
        }

        this.scene.events.emit('xpChanged', this.xp, this.xpToNextLevel, this.level);
        return false;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(CONFIG.XP.BASE_TO_LEVEL * Math.pow(CONFIG.XP.LEVEL_MULTIPLIER, this.level - 1));

        // Emit events
        this.scene.events.emit('xpChanged', this.xp, this.xpToNextLevel, this.level);
        this.scene.events.emit('levelUp', this.level);
    }

    applyUpgrade(upgrade) {
        switch (upgrade.type) {
            case 'damage':
                this.stats.damage += upgrade.value;
                break;
            case 'cooldown':
                // Apply to all weapons
                this.weapons.forEach(w => w.cooldown *= (1 - upgrade.value));
                break;
            case 'pierce':
                this.weapons.forEach(w => {
                    if (w.pierce !== undefined) w.pierce += upgrade.value;
                });
                break;
            case 'area':
                this.weapons.forEach(w => {
                    if (w.radius !== undefined) w.radius *= (1 + upgrade.value);
                });
                break;
            case 'maxHealth':
                this.maxHealth += upgrade.value;
                this.currentHealth += upgrade.value;
                break;
            case 'regen':
                this.regenAmount += upgrade.value;
                break;
            case 'moveSpeed':
                this.speed *= (1 + upgrade.value);
                break;
            case 'xpBoost':
                this.xpBoost += upgrade.value;
                break;
        }

        this.scene.events.emit('playerDamaged', this.currentHealth, this.maxHealth);
    }

    die() {
        this.scene.events.emit('playerDied', {
            survivalTime: this.survivalTime,
            killCount: this.killCount,
            level: this.level,
            damageDealt: this.damageDealt
        });
    }

    getStats() {
        return {
            survivalTime: this.survivalTime,
            killCount: this.killCount,
            level: this.level,
            damageDealt: this.damageDealt
        };
    }
}
