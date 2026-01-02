import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';
import { getSoundManager } from '../utils/SoundManager.js';

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
        this.soundManager = getSoundManager(scene);
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

    playFireSound() {
        this.soundManager?.play('shoot');
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

        this.playFireSound();

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

// NEW WEAPON: Laser - Continuous beam to nearest enemy
export class LaserWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.LASER);
        this.range = this.config.range;
        this.width = this.config.width;
        this.laserGraphics = null;
        this.hitCooldown = {};
    }

    update(time, delta) {
        // Laser fires continuously
        this.fire(time);
    }

    fire(time) {
        const target = this.findNearestEnemy();

        // Clear old laser
        if (this.laserGraphics) {
            this.laserGraphics.destroy();
        }

        if (!target) return;

        // Draw laser beam
        this.laserGraphics = this.scene.add.graphics();
        this.laserGraphics.lineStyle(this.width, this.config.color, 0.8);
        this.laserGraphics.lineBetween(
            this.player.x, this.player.y,
            target.x, target.y
        );

        // Deal damage
        const currentTime = this.scene.time.now;
        const enemyId = target.id || target.x + target.y;

        if (!this.hitCooldown[enemyId] || currentTime - this.hitCooldown[enemyId] > this.cooldown) {
            this.hitCooldown[enemyId] = currentTime;
            const died = target.takeDamage(this.getDamage());
            if (died) {
                this.player.killCount++;
                this.player.damageDealt += this.getDamage();
            }
        }

        // Fade out laser
        this.scene.tweens.add({
            targets: this.laserGraphics,
            alpha: 0,
            duration: 50,
            onComplete: () => {
                if (this.laserGraphics) {
                    this.laserGraphics.destroy();
                    this.laserGraphics = null;
                }
            }
        });
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = this.range;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });

        return nearest;
    }

    upgrade() {
        super.upgrade();
        this.range += 30;
        this.width += 1;
    }
}

// NEW WEAPON: Boomerang - Returns to player, pierces all enemies
export class BoomerangWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.BOOMERANG);
        this.speed = this.config.speed;
        this.returnSpeed = this.config.returnSpeed;
        this.boomerangs = [];
    }

    fire(time) {
        const target = this.findNearestEnemy();
        const targetAngle = target
            ? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y)
            : Math.random() * Math.PI * 2;

        this.playFireSound();

        const boom = new Boomerang(
            this.scene,
            this.player.x,
            this.player.y,
            targetAngle,
            this.getDamage(),
            this.speed,
            this.returnSpeed,
            this.player
        );

        this.scene.projectiles.add(boom);
        this.boomerangs.push(boom);
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = 400;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });

        return nearest;
    }
}

// Boomerang projectile
class Boomerang extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, damage, speed, returnSpeed, player) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = damage;
        this.speed = speed;
        this.returnSpeed = returnSpeed;
        this.player = player;
        this.angle = angle;
        this.returning = false;
        this.maxDistance = 250;
        this.startX = x;
        this.startY = y;
        this.hitEnemies = new Set();

        this.setTint(0x9b59b6);
        this.setScale(1.5);

        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        const distFromStart = Phaser.Math.Distance.Between(
            this.startX, this.startY,
            this.x, this.y
        );

        // Start returning after max distance
        if (!this.returning && distFromStart > this.maxDistance) {
            this.returning = true;
            this.hitEnemies.clear(); // Can hit same enemies on return
        }

        if (this.returning) {
            // Move toward player
            const angleToPlayer = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.player.x, this.player.y
            );

            this.setVelocity(
                Math.cos(angleToPlayer) * this.returnSpeed,
                Math.sin(angleToPlayer) * this.returnSpeed
            );

            // Destroy when reaching player
            const distToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.player.x, this.player.y
            );

            if (distToPlayer < 30) {
                this.destroy();
            }
        }

        // Rotate sprite
        this.rotation += 0.3;
    }

    hitEnemy(enemy) {
        if (this.hitEnemies.has(enemy)) return false;
        this.hitEnemies.add(enemy);
        return true;
    }
}

// NEW WEAPON: Explosive Shot - Explodes on impact
export class ExplosiveWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.EXPLOSIVE);
        this.speed = this.config.speed;
        this.explosionRadius = this.config.explosionRadius;
    }

    fire(time) {
        const target = this.findNearestEnemy();
        if (!target) return;

        this.playFireSound();

        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            target.x, target.y
        );

        const rocket = new ExplosiveProjectile(
            this.scene,
            this.player.x,
            this.player.y,
            angle,
            this.getDamage(),
            this.speed,
            this.explosionRadius,
            this.player
        );

        this.scene.projectiles.add(rocket);
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = 500;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });

        return nearest;
    }

    upgrade() {
        super.upgrade();
        this.explosionRadius += 15;
    }
}

// Explosive projectile
class ExplosiveProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, angle, damage, speed, explosionRadius, player) {
        super(scene, x, y, 'projectile');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = damage;
        this.explosionRadius = explosionRadius;
        this.player = player;
        this.hasExploded = false;

        this.setTint(0xff6600);
        this.setScale(1.2);

        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Auto-destroy after distance
        scene.time.delayedCall(2000, () => {
            if (this.active && !this.hasExploded) {
                this.explode();
            }
        });
    }

    hitEnemy(enemy) {
        if (this.hasExploded) return false;
        this.explode();
        return false; // Explosion handles damage
    }

    explode() {
        if (this.hasExploded) return;
        this.hasExploded = true;

        // Visual explosion
        const explosion = this.scene.add.circle(this.x, this.y, this.explosionRadius, 0xff6600, 0.5);
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => explosion.destroy()
        });

        // Damage all enemies in radius
        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;

            const dist = Phaser.Math.Distance.Between(
                this.x, this.y,
                enemy.x, enemy.y
            );

            if (dist <= this.explosionRadius) {
                const died = enemy.takeDamage(this.damage);
                if (died) {
                    this.player.killCount++;
                    this.player.damageDealt += this.damage;
                }
            }
        });

        this.destroy();
    }
}

// NEW WEAPON: Freeze Nova - Slows enemies in area
export class FreezeWeapon extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONFIG.WEAPONS.FREEZE);
        this.radius = this.config.radius;
        this.slowDuration = this.config.slowDuration;
        this.slowAmount = this.config.slowAmount;
    }

    fire(time) {
        this.playFireSound();

        // Visual effect
        const nova = this.scene.add.circle(this.player.x, this.player.y, 10, 0x00ffff, 0.6);

        this.scene.tweens.add({
            targets: nova,
            scaleX: this.radius / 10,
            scaleY: this.radius / 10,
            alpha: 0,
            duration: 500,
            onComplete: () => nova.destroy()
        });

        // Damage and slow enemies in radius
        this.scene.enemies.getChildren().forEach(enemy => {
            if (!enemy.isAlive) return;

            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (dist <= this.radius) {
                // Deal damage
                const died = enemy.takeDamage(this.getDamage());
                if (died) {
                    this.player.killCount++;
                    this.player.damageDealt += this.getDamage();
                } else {
                    // Apply slow effect
                    this.applySlowEffect(enemy);
                }
            }
        });
    }

    applySlowEffect(enemy) {
        if (enemy.isSlowed) return;

        enemy.isSlowed = true;
        const originalSpeed = enemy.speed;
        enemy.speed *= this.slowAmount;
        enemy.setTint(0x00ffff);

        // Remove slow after duration
        this.scene.time.delayedCall(this.slowDuration, () => {
            if (enemy.active) {
                enemy.speed = originalSpeed;
                enemy.isSlowed = false;
                enemy.clearTint();
            }
        });
    }

    upgrade() {
        super.upgrade();
        this.radius += 20;
        this.slowDuration += 500;
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
        case 'LASER':
            return new LaserWeapon(scene, player);
        case 'BOOMERANG':
            return new BoomerangWeapon(scene, player);
        case 'EXPLOSIVE':
            return new ExplosiveWeapon(scene, player);
        case 'FREEZE':
            return new FreezeWeapon(scene, player);
        default:
            return new ProjectileWeapon(scene, player);
    }
}
