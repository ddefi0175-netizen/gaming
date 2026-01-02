import Phaser from 'phaser';

export class VirtualJoystick {
    constructor(scene, x, y) {
        this.scene = scene;
        this.baseX = x;
        this.baseY = y;
        this.maxDistance = 50;

        // Joystick state
        this.isActive = false;
        this.force = 0;
        this.forceX = 0;
        this.forceY = 0;
        this.angle = 0;

        // Create joystick graphics
        this.base = scene.add.image(x, y, 'joystick_base')
            .setScrollFactor(0)
            .setDepth(100)
            .setAlpha(0.6);

        this.thumb = scene.add.image(x, y, 'joystick_thumb')
            .setScrollFactor(0)
            .setDepth(101)
            .setAlpha(0.8);

        // Initially hidden
        this.hide();

        // Setup touch input
        this.setupInput();
    }

    setupInput() {
        // Track the pointer that activated the joystick
        this.activePointer = null;

        this.scene.input.on('pointerdown', (pointer) => {
            // Only activate if touch is on left side of screen
            if (pointer.x < this.scene.cameras.main.width * 0.5) {
                this.activePointer = pointer;
                this.activate(pointer.x, pointer.y);
            }
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (this.isActive && pointer === this.activePointer) {
                this.updateThumb(pointer.x, pointer.y);
            }
        });

        this.scene.input.on('pointerup', (pointer) => {
            if (pointer === this.activePointer) {
                this.deactivate();
            }
        });
    }

    activate(x, y) {
        this.isActive = true;
        this.baseX = x;
        this.baseY = y;

        this.base.setPosition(x, y);
        this.thumb.setPosition(x, y);

        this.base.setAlpha(0.6);
        this.thumb.setAlpha(0.8);
    }

    deactivate() {
        this.isActive = false;
        this.activePointer = null;
        this.force = 0;
        this.forceX = 0;
        this.forceY = 0;

        this.hide();
    }

    hide() {
        this.base.setAlpha(0);
        this.thumb.setAlpha(0);
    }

    updateThumb(x, y) {
        // Calculate distance and angle from base
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        // Clamp to max distance
        const clampedDistance = Math.min(distance, this.maxDistance);

        // Calculate force (0-1)
        this.force = clampedDistance / this.maxDistance;
        this.forceX = Math.cos(this.angle) * this.force;
        this.forceY = Math.sin(this.angle) * this.force;

        // Update thumb position
        const thumbX = this.baseX + Math.cos(this.angle) * clampedDistance;
        const thumbY = this.baseY + Math.sin(this.angle) * clampedDistance;
        this.thumb.setPosition(thumbX, thumbY);
    }

    update() {
        // Called each frame if needed
    }

    destroy() {
        this.base.destroy();
        this.thumb.destroy();
    }
}
