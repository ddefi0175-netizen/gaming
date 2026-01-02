import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

// Base Weapon Class
export class Weapon {
    constructor(scene, player, config) {
        this.scene = scene;
        this.player = player;
        this.config = { ...config };

        this.damage = config.damage;
        this.cooldown = config.cooldown;
        this.lastFired = 0;
        this.level = 1;
    }

    update(time, delta) {
        if (time - this.lastFired >= this.cooldown) {
            this.fire(time);
            this.lastFired = time;
        }
    }

    fire(time) {
        // Override in subclass
    }

    upgrade() {
        this.level++;
        this.damage *= 1.2;
        this.cooldown *= 0.9;
    }

    getDamage() {
        return this.damage * (1 + (this.player.stats?.damage || 0));
    }
}

// Projectile Weapon - Fires toward nearest enemy
export class ProjectileWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.PROJECTILE);
        this.pierce = this.config.pierce;
        this.speed = this.config.speed;
    }

    fire(time) {
        const target = this.findNearestEnemy();
        if (!target) return;

        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            target.x, target.y
        );

        const projectile = new Projectile(
            this.scene,
            this.player.x,
            this.player.y,
            angle,
            this.getDamage(),
            this.speed,
            this.pierce
        );

        this.scene.projectiles.add(projectile);
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = Infinity;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    upgrade() {
        super.upgrade();
        this.pierce++;
    }
}

// Projectile Sprite
class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, damage, speed, pierce) {
        super(scene, x, y, 'projectile');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = damage;
        this.pierce = pierce;
        this.pierceCount = 0;
        this.hitEnemies = new Set();

        // Set velocity
        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Rotate to face direction
        this.setRotation(angle);

        // Destroy after 3 seconds
        scene.time.delayedCall(3000, () => {
            if (this.active) this.destroy();
        });
    }

    hitEnemy(enemy) {
        if (this.hitEnemies.has(enemy)) return false;

        this.hitEnemies.add(enemy);
        this.pierceCount++;

        if (this.pierceCount >= this.pierce) {
            this.destroy();
        }

        return true;
    }
}

// Area Weapon - Damages all enemies in radius
export class AreaWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.AREA);
        this.radius = this.config.radius;
    }

    fire(time) {
        // Create visual effect
        const effect = this.scene.add.sprite(this.player.x, this.player.y, 'area_effect');
        effect.setScale(this.radius / 50);
        effect.setAlpha(0.6);

        this.scene.tweens.add({
            targets: effect,
            scale: effect.scale * 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => effect.destroy()
        });

        // Damage enemies in radius
        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (dist <= this.radius) {
                const died = enemy.takeDamage(this.getDamage());
                if (died) {
                    this.player.killCount++;
                    this.player.damageDealt += this.getDamage();
                }
            }
        });
    }

    upgrade() {
        super.upgrade();
        this.radius *= 1.15;
    }
}

// Chain Weapon - Hits enemy then chains to nearby
export class ChainWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.CHAIN);
        this.chains = this.config.chains;
        this.range = this.config.range;
    }

    fire(time) {
        const target = this.findNearestEnemy();
        if (!target) return;

        this.chainToTarget(this.player, target, this.chains, new Set());
    }

    chainToTarget(source, target, chainsLeft, hitSet) {
        if (!target || !target.isAlive || chainsLeft <= 0 || hitSet.has(target)) return;

        hitSet.add(target);

        // Draw lightning effect
        const line = this.scene.add.graphics();
        line.lineStyle(3, 0xf1c40f, 1);
        line.lineBetween(source.x, source.y, target.x, target.y);

        this.scene.tweens.add({
            targets: line,
            alpha: 0,
            duration: 200,
            onComplete: () => line.destroy()
        });

        // Damage target
        const died = target.takeDamage(this.getDamage());
        if (died) {
            this.player.killCount++;
            this.player.damageDealt += this.getDamage();
        }

        // Find next target
        if (chainsLeft > 1) {
            const nextTarget = this.findNearestEnemyFrom(target, hitSet);
            if (nextTarget) {
                this.scene.time.delayedCall(50, () => {
                    this.chainToTarget(target, nextTarget, chainsLeft - 1, hitSet);
                });
            }
        }
    }

    findNearestEnemy() {
        return this.findNearestEnemyFrom(this.player, new Set());
    }

    findNearestEnemyFrom(source, exclude) {
        let nearest = null;
        let nearestDist = this.range;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive || exclude.has(enemy)) return;

            const dist = Phaser.Math.Distance.Between(
                source.x, source.y,
                enemy.x, enemy.y
            );

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    upgrade() {
        super.upgrade();
        this.chains++;
        this.range *= 1.1;
    }
}

// Orbital Weapon - Orbs that rotate around player
export class OrbitalWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.ORBIT);
        this.orbCount = this.config.orbs;
        this.orbitRadius = this.config.radius;
        this.orbs = [];
        this.angle = 0;
        this.rotationSpeed = 3;

        this.createOrbs();
    }

    createOrbs() {
        // Remove existing orbs
        this.orbs.forEach(orb => orb.destroy());
        this.orbs = [];

        // Create new orbs
        for (let i = 0; i < this.orbCount; i++) {
            const orb = this.scene.physics.add.sprite(this.player.x, this.player.y, 'orbital');
            orb.damage = this.getDamage();
            orb.hitEnemies = new Set();
            orb.hitCooldown = 500;
            orb.lastHitTime = {};
            this.orbs.push(orb);
            this.scene.orbitals.add(orb);
        }
    }

    update(time, delta) {
        // Rotate orbs around player
        this.angle += this.rotationSpeed * delta / 1000;

        this.orbs.forEach((orb, i) => {
            if (!orb.active) return;

            const orbAngle = this.angle + (Math.PI * 2 / this.orbCount) * i;
            orb.x = this.player.x + Math.cos(orbAngle) * this.orbitRadius;
            orb.y = this.player.y + Math.sin(orbAngle) * this.orbitRadius;
            orb.damage = this.getDamage();

            // Reset hit tracking periodically
            const currentTime = this.scene.time.now;
            Object.keys(orb.lastHitTime).forEach(enemyId => {
                if (currentTime - orb.lastHitTime[enemyId] > orb.hitCooldown) {
                    delete orb.lastHitTime[enemyId];
                }
            });
        });
    }

    fire(time) {
        // Orbital weapon doesn't "fire" - damage is dealt on collision
    }

    upgrade() {
        super.upgrade();
        this.orbCount++;
        this.orbitRadius += 10;
        this.createOrbs();
    }
}

// Weapon Factory
export function createWeapon(scene, player, type) {
    switch (type) {
        case 'PROJECTILE':
            return new ProjectileWeapon(scene, player);
        case 'AREA':
            return new AreaWeapon(scene, player);
        case 'CHAIN':
            return new ChainWeapon(scene, player);
        case 'ORBIT':
            return new OrbitalWeapon(scene, player);
        default:
            return new ProjectileWeapon(scene, player);
    }
}
