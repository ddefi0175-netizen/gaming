import Phaser from 'phaser';

export class XPOrb extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, value) {
        super(scene, x, y, 'xp_orb');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.xpValue = value;
        this.pickupRadius = 50;
        this.magnetRadius = 150;
        this.magnetSpeed = 300;
        this.collected = false;

        // Small random scatter on spawn
        const scatterX = Phaser.Math.Between(-20, 20);
        const scatterY = Phaser.Math.Between(-20, 20);

        this.scene.tweens.add({
            targets: this,
            x: this.x + scatterX,
            y: this.y + scatterY,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Scale based on value
        const scale = Math.min(0.8 + value / 20, 1.5);
        this.setScale(scale);
    }

    update(player) {
        if (this.collected || !player) return;

        const dist = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );

        // Auto-pickup when close
        if (dist < this.pickupRadius) {
            this.collect(player);
            return;
        }

        // Magnet effect - move toward player when in range
        if (dist < this.magnetRadius) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const speed = this.magnetSpeed * (1 - dist / this.magnetRadius);

            this.x += Math.cos(angle) * speed * 0.016;
            this.y += Math.sin(angle) * speed * 0.016;
        }
    }

    collect(player) {
        if (this.collected) return;

        this.collected = true;

        // Add XP to player
        player.addXP(this.xpValue);

        // Collection effect
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            y: this.y - 20,
            duration: 150,
            onComplete: () => this.destroy()
        });
    }
}

export class HealthPickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, healAmount = 20) {
        super(scene, x, y, 'health_pickup');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.healAmount = healAmount;
        this.collected = false;

        // Floating animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect(player) {
        if (this.collected) return;
        if (player.currentHealth >= player.maxHealth) return; // Don't collect if full health

        this.collected = true;
        player.heal(this.healAmount);

        // Collection effect
        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            duration: 200,
            onComplete: () => this.destroy()
        });
    }
}
