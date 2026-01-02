// Pixel art sprite generator for the Survivor game
// Generates all game sprites programmatically with better visuals

export class SpriteGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    generateAll() {
        this.generatePlayer();
        this.generateEnemies();
        this.generateWeapons();
        this.generatePickups();
        this.generateUI();
        this.generateEffects();
    }

    // Player sprite - animated character
    generatePlayer() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Main body
        graphics.fillStyle(0x4a90d9, 1); // Blue body
        graphics.fillRoundedRect(8, 12, 16, 16, 3);

        // Head
        graphics.fillStyle(0xffdbac, 1); // Skin tone
        graphics.fillCircle(16, 8, 6);

        // Eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(14, 7, 1.5);
        graphics.fillCircle(18, 7, 1.5);

        // Cape
        graphics.fillStyle(0xc0392b, 1); // Red cape
        graphics.fillTriangle(8, 14, 4, 28, 12, 28);
        graphics.fillTriangle(24, 14, 28, 28, 20, 28);

        // Legs
        graphics.fillStyle(0x2c3e50, 1); // Dark pants
        graphics.fillRect(10, 28, 5, 4);
        graphics.fillRect(17, 28, 5, 4);

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        // Player hurt sprite (flashing red)
        const hurtGraphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
        hurtGraphics.fillStyle(0xff6b6b, 1);
        hurtGraphics.fillRoundedRect(8, 12, 16, 16, 3);
        hurtGraphics.fillStyle(0xffaaaa, 1);
        hurtGraphics.fillCircle(16, 8, 6);
        hurtGraphics.fillStyle(0xc0392b, 1);
        hurtGraphics.fillTriangle(8, 14, 4, 28, 12, 28);
        hurtGraphics.fillTriangle(24, 14, 28, 28, 20, 28);
        hurtGraphics.fillStyle(0x8b0000, 1);
        hurtGraphics.fillRect(10, 28, 5, 4);
        hurtGraphics.fillRect(17, 28, 5, 4);
        hurtGraphics.generateTexture('player_hurt', 32, 32);
        hurtGraphics.destroy();
    }

    // Enemy sprites - various types
    generateEnemies() {
        // Basic enemy - green slime
        this.generateSlime('enemy_basic', 0x27ae60, 0x1e8449);

        // Fast enemy - purple bat
        this.generateBat('enemy_fast', 0x9b59b6, 0x8e44ad);

        // Tanky enemy - brown golem
        this.generateGolem('enemy_tanky', 0x8b4513, 0x654321);

        // Ranged enemy - dark mage
        this.generateMage('enemy_ranged', 0x2c3e50, 0x1a252f);

        // Boss enemy - large demon
        this.generateBoss('enemy_boss', 0xe74c3c, 0xc0392b);
    }

    generateSlime(key, color1, color2) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Body
        g.fillStyle(color1, 1);
        g.fillEllipse(16, 20, 24, 16);

        // Highlight
        g.fillStyle(color2, 1);
        g.fillEllipse(16, 22, 20, 12);

        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillCircle(12, 18, 4);
        g.fillCircle(20, 18, 4);
        g.fillStyle(0x000000, 1);
        g.fillCircle(13, 18, 2);
        g.fillCircle(21, 18, 2);

        // Shine
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(10, 14, 3);

        g.generateTexture(key, 32, 32);
        g.destroy();
    }

    generateBat(key, color1, color2) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Wings
        g.fillStyle(color1, 1);
        g.fillTriangle(2, 16, 12, 8, 12, 24);
        g.fillTriangle(30, 16, 20, 8, 20, 24);

        // Body
        g.fillStyle(color2, 1);
        g.fillEllipse(16, 16, 12, 14);

        // Ears
        g.fillStyle(color1, 1);
        g.fillTriangle(11, 6, 14, 12, 8, 12);
        g.fillTriangle(21, 6, 18, 12, 24, 12);

        // Eyes
        g.fillStyle(0xff0000, 1);
        g.fillCircle(13, 14, 2);
        g.fillCircle(19, 14, 2);

        g.generateTexture(key, 32, 32);
        g.destroy();
    }

    generateGolem(key, color1, color2) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Body
        g.fillStyle(color1, 1);
        g.fillRoundedRect(6, 8, 20, 20, 4);

        // Head
        g.fillStyle(color2, 1);
        g.fillRoundedRect(8, 2, 16, 12, 3);

        // Eyes
        g.fillStyle(0xf1c40f, 1);
        g.fillCircle(12, 7, 3);
        g.fillCircle(20, 7, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(12, 7, 1.5);
        g.fillCircle(20, 7, 1.5);

        // Arms
        g.fillStyle(color1, 1);
        g.fillRoundedRect(2, 12, 6, 12, 2);
        g.fillRoundedRect(24, 12, 6, 12, 2);

        // Cracks
        g.lineStyle(1, 0x000000, 0.5);
        g.lineBetween(10, 14, 14, 20);
        g.lineBetween(18, 12, 22, 18);

        g.generateTexture(key, 32, 32);
        g.destroy();
    }

    generateMage(key, color1, color2) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });

        // Robe
        g.fillStyle(color1, 1);
        g.fillTriangle(16, 8, 6, 30, 26, 30);

        // Hood
        g.fillStyle(color2, 1);
        g.fillCircle(16, 10, 8);

        // Face shadow
        g.fillStyle(0x000000, 0.7);
        g.fillCircle(16, 11, 5);

        // Glowing eyes
        g.fillStyle(0xe74c3c, 1);
        g.fillCircle(14, 10, 2);
        g.fillCircle(18, 10, 2);

        // Staff
        g.fillStyle(0x8b4513, 1);
        g.fillRect(24, 6, 3, 24);
        g.fillStyle(0x9b59b6, 1);
        g.fillCircle(25.5, 6, 4);

        g.generateTexture(key, 32, 32);
        g.destroy();
    }

    generateBoss(key, color1, color2) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const size = 64;

        // Body
        g.fillStyle(color1, 1);
        g.fillRoundedRect(12, 20, 40, 36, 6);

        // Head
        g.fillStyle(color2, 1);
        g.fillCircle(32, 16, 14);

        // Horns
        g.fillStyle(0x2c3e50, 1);
        g.fillTriangle(18, 8, 22, 20, 14, 20);
        g.fillTriangle(46, 8, 42, 20, 50, 20);

        // Eyes
        g.fillStyle(0xf1c40f, 1);
        g.fillCircle(26, 14, 4);
        g.fillCircle(38, 14, 4);
        g.fillStyle(0x000000, 1);
        g.fillCircle(26, 14, 2);
        g.fillCircle(38, 14, 2);

        // Mouth
        g.fillStyle(0x000000, 1);
        g.fillRect(26, 22, 12, 4);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(28, 22, 30, 26, 26, 26);
        g.fillTriangle(36, 22, 38, 26, 34, 26);

        // Arms
        g.fillStyle(color1, 1);
        g.fillRoundedRect(4, 24, 10, 20, 3);
        g.fillRoundedRect(50, 24, 10, 20, 3);

        // Claws
        g.fillStyle(0x2c3e50, 1);
        g.fillTriangle(6, 44, 8, 50, 4, 50);
        g.fillTriangle(10, 44, 12, 50, 8, 50);
        g.fillTriangle(54, 44, 56, 50, 52, 50);
        g.fillTriangle(58, 44, 60, 50, 56, 50);

        g.generateTexture(key, size, size);
        g.destroy();
    }

    // Weapon projectiles and effects
    generateWeapons() {
        // Energy projectile
        const proj = this.scene.make.graphics({ x: 0, y: 0, add: false });
        proj.fillStyle(0x3498db, 1);
        proj.fillCircle(8, 8, 6);
        proj.fillStyle(0x5dade2, 1);
        proj.fillCircle(8, 8, 4);
        proj.fillStyle(0xffffff, 1);
        proj.fillCircle(7, 6, 2);
        proj.generateTexture('projectile', 16, 16);
        proj.destroy();

        // Fire projectile
        const fire = this.scene.make.graphics({ x: 0, y: 0, add: false });
        fire.fillStyle(0xe74c3c, 1);
        fire.fillCircle(8, 8, 7);
        fire.fillStyle(0xf39c12, 1);
        fire.fillCircle(8, 8, 5);
        fire.fillStyle(0xf1c40f, 1);
        fire.fillCircle(8, 8, 3);
        fire.generateTexture('projectile_fire', 16, 16);
        fire.destroy();

        // Area attack wave
        const area = this.scene.make.graphics({ x: 0, y: 0, add: false });
        area.lineStyle(3, 0xf39c12, 1);
        area.strokeCircle(32, 32, 28);
        area.lineStyle(2, 0xf1c40f, 0.7);
        area.strokeCircle(32, 32, 20);
        area.generateTexture('area_attack', 64, 64);
        area.destroy();

        // Chain lightning
        const chain = this.scene.make.graphics({ x: 0, y: 0, add: false });
        chain.fillStyle(0x9b59b6, 1);
        chain.fillCircle(8, 8, 6);
        chain.fillStyle(0xbb8fce, 1);
        chain.fillCircle(8, 8, 4);
        chain.lineStyle(2, 0xe8daef, 1);
        chain.lineBetween(4, 4, 12, 12);
        chain.lineBetween(12, 4, 4, 12);
        chain.generateTexture('chain_projectile', 16, 16);
        chain.destroy();

        // Orbital shield
        const orbital = this.scene.make.graphics({ x: 0, y: 0, add: false });
        orbital.fillStyle(0x1abc9c, 1);
        orbital.fillCircle(12, 12, 10);
        orbital.fillStyle(0x48c9b0, 1);
        orbital.fillCircle(12, 12, 7);
        orbital.fillStyle(0xa3e4d7, 1);
        orbital.fillCircle(10, 9, 3);
        orbital.generateTexture('orbital', 24, 24);
        orbital.destroy();

        // Enemy projectile
        const enemyProj = this.scene.make.graphics({ x: 0, y: 0, add: false });
        enemyProj.fillStyle(0xe74c3c, 1);
        enemyProj.fillCircle(6, 6, 5);
        enemyProj.fillStyle(0xf5b7b1, 1);
        enemyProj.fillCircle(5, 4, 2);
        enemyProj.generateTexture('enemy_projectile', 12, 12);
        enemyProj.destroy();
    }

    // Pickups (XP, health, coins)
    generatePickups() {
        // XP gem - green
        const xpSmall = this.scene.make.graphics({ x: 0, y: 0, add: false });
        xpSmall.fillStyle(0x2ecc71, 1);
        xpSmall.fillTriangle(8, 2, 2, 14, 14, 14);
        xpSmall.fillStyle(0x58d68d, 1);
        xpSmall.fillTriangle(8, 4, 4, 12, 12, 12);
        xpSmall.generateTexture('xp_small', 16, 16);
        xpSmall.destroy();

        // XP gem - blue (medium)
        const xpMed = this.scene.make.graphics({ x: 0, y: 0, add: false });
        xpMed.fillStyle(0x3498db, 1);
        xpMed.fillTriangle(10, 2, 2, 18, 18, 18);
        xpMed.fillStyle(0x5dade2, 1);
        xpMed.fillTriangle(10, 5, 5, 15, 15, 15);
        xpMed.generateTexture('xp_medium', 20, 20);
        xpMed.destroy();

        // XP gem - purple (large)
        const xpLarge = this.scene.make.graphics({ x: 0, y: 0, add: false });
        xpLarge.fillStyle(0x9b59b6, 1);
        xpLarge.fillTriangle(12, 2, 2, 22, 22, 22);
        xpLarge.fillStyle(0xbb8fce, 1);
        xpLarge.fillTriangle(12, 6, 6, 18, 18, 18);
        xpLarge.fillStyle(0xffffff, 0.5);
        xpLarge.fillTriangle(10, 8, 8, 12, 12, 12);
        xpLarge.generateTexture('xp_large', 24, 24);
        xpLarge.destroy();

        // Health pickup - red heart
        const health = this.scene.make.graphics({ x: 0, y: 0, add: false });
        health.fillStyle(0xe74c3c, 1);
        health.fillCircle(8, 10, 6);
        health.fillCircle(16, 10, 6);
        health.fillTriangle(3, 12, 21, 12, 12, 24);
        health.fillStyle(0xf5b7b1, 1);
        health.fillCircle(7, 8, 2);
        health.generateTexture('health', 24, 24);
        health.destroy();

        // Coin pickup
        const coin = this.scene.make.graphics({ x: 0, y: 0, add: false });
        coin.fillStyle(0xf1c40f, 1);
        coin.fillCircle(10, 10, 9);
        coin.fillStyle(0xf4d03f, 1);
        coin.fillCircle(10, 10, 7);
        coin.fillStyle(0xf7dc6f, 1);
        coin.fillCircle(8, 8, 3);
        coin.fillStyle(0xd4ac0d, 1);
        coin.lineStyle(1, 0xd4ac0d, 1);
        coin.lineBetween(8, 6, 12, 14);
        coin.lineBetween(8, 14, 12, 6);
        coin.generateTexture('coin', 20, 20);
        coin.destroy();

        // Magnet pickup
        const magnet = this.scene.make.graphics({ x: 0, y: 0, add: false });
        magnet.fillStyle(0xe74c3c, 1);
        magnet.fillRoundedRect(4, 4, 6, 16, 2);
        magnet.fillStyle(0x3498db, 1);
        magnet.fillRoundedRect(14, 4, 6, 16, 2);
        magnet.fillStyle(0x95a5a6, 1);
        magnet.fillRoundedRect(6, 2, 12, 6, 2);
        magnet.generateTexture('magnet', 24, 24);
        magnet.destroy();
    }

    // UI elements
    generateUI() {
        // Health bar background
        const healthBg = this.scene.make.graphics({ x: 0, y: 0, add: false });
        healthBg.fillStyle(0x2c3e50, 1);
        healthBg.fillRoundedRect(0, 0, 200, 20, 4);
        healthBg.generateTexture('health_bar_bg', 200, 20);
        healthBg.destroy();

        // Health bar fill
        const healthFill = this.scene.make.graphics({ x: 0, y: 0, add: false });
        healthFill.fillStyle(0xe74c3c, 1);
        healthFill.fillRoundedRect(0, 0, 196, 16, 3);
        healthFill.generateTexture('health_bar_fill', 196, 16);
        healthFill.destroy();

        // XP bar background
        const xpBg = this.scene.make.graphics({ x: 0, y: 0, add: false });
        xpBg.fillStyle(0x2c3e50, 1);
        xpBg.fillRoundedRect(0, 0, 300, 12, 3);
        xpBg.generateTexture('xp_bar_bg', 300, 12);
        xpBg.destroy();

        // XP bar fill
        const xpFill = this.scene.make.graphics({ x: 0, y: 0, add: false });
        xpFill.fillStyle(0x2ecc71, 1);
        xpFill.fillRoundedRect(0, 0, 296, 8, 2);
        xpFill.generateTexture('xp_bar_fill', 296, 8);
        xpFill.destroy();

        // Button
        const button = this.scene.make.graphics({ x: 0, y: 0, add: false });
        button.fillStyle(0x3498db, 1);
        button.fillRoundedRect(0, 0, 200, 50, 8);
        button.fillStyle(0x5dade2, 1);
        button.fillRoundedRect(4, 4, 192, 20, 6);
        button.generateTexture('button', 200, 50);
        button.destroy();

        // Button hover
        const buttonHover = this.scene.make.graphics({ x: 0, y: 0, add: false });
        buttonHover.fillStyle(0x2980b9, 1);
        buttonHover.fillRoundedRect(0, 0, 200, 50, 8);
        buttonHover.fillStyle(0x3498db, 1);
        buttonHover.fillRoundedRect(4, 4, 192, 20, 6);
        buttonHover.generateTexture('button_hover', 200, 50);
        buttonHover.destroy();

        // Upgrade card
        const card = this.scene.make.graphics({ x: 0, y: 0, add: false });
        card.fillStyle(0x34495e, 1);
        card.fillRoundedRect(0, 0, 150, 200, 10);
        card.lineStyle(3, 0xf1c40f, 1);
        card.strokeRoundedRect(2, 2, 146, 196, 10);
        card.generateTexture('upgrade_card', 150, 200);
        card.destroy();

        // Joystick base
        const joyBase = this.scene.make.graphics({ x: 0, y: 0, add: false });
        joyBase.fillStyle(0x000000, 0.3);
        joyBase.fillCircle(60, 60, 60);
        joyBase.lineStyle(3, 0xffffff, 0.5);
        joyBase.strokeCircle(60, 60, 58);
        joyBase.generateTexture('joystick_base', 120, 120);
        joyBase.destroy();

        // Joystick thumb
        const joyThumb = this.scene.make.graphics({ x: 0, y: 0, add: false });
        joyThumb.fillStyle(0xffffff, 0.7);
        joyThumb.fillCircle(30, 30, 28);
        joyThumb.fillStyle(0xffffff, 0.9);
        joyThumb.fillCircle(30, 30, 20);
        joyThumb.generateTexture('joystick_thumb', 60, 60);
        joyThumb.destroy();
    }

    // Particle and effect textures
    generateEffects() {
        // Hit particle
        const hit = this.scene.make.graphics({ x: 0, y: 0, add: false });
        hit.fillStyle(0xffffff, 1);
        hit.fillCircle(4, 4, 4);
        hit.generateTexture('particle_hit', 8, 8);
        hit.destroy();

        // Death particle
        const death = this.scene.make.graphics({ x: 0, y: 0, add: false });
        death.fillStyle(0x9b59b6, 1);
        death.fillStar(8, 8, 5, 8, 4);
        death.generateTexture('particle_death', 16, 16);
        death.destroy();

        // Level up particle
        const levelUp = this.scene.make.graphics({ x: 0, y: 0, add: false });
        levelUp.fillStyle(0xf1c40f, 1);
        levelUp.fillStar(8, 8, 5, 8, 4);
        levelUp.generateTexture('particle_levelup', 16, 16);
        levelUp.destroy();

        // Damage number background
        const dmgBg = this.scene.make.graphics({ x: 0, y: 0, add: false });
        dmgBg.fillStyle(0x000000, 0.5);
        dmgBg.fillRoundedRect(0, 0, 40, 20, 4);
        dmgBg.generateTexture('damage_bg', 40, 20);
        dmgBg.destroy();

        // Shadow
        const shadow = this.scene.make.graphics({ x: 0, y: 0, add: false });
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillEllipse(16, 8, 24, 8);
        shadow.generateTexture('shadow', 32, 16);
        shadow.destroy();

        // Ground tile
        const ground = this.scene.make.graphics({ x: 0, y: 0, add: false });
        ground.fillStyle(0x2d5016, 1);
        ground.fillRect(0, 0, 64, 64);
        ground.fillStyle(0x3d6b1c, 1);
        // Add some grass patches
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 60 + 2;
            const y = Math.random() * 60 + 2;
            ground.fillCircle(x, y, 3 + Math.random() * 3);
        }
        ground.generateTexture('ground', 64, 64);
        ground.destroy();
    }
}
