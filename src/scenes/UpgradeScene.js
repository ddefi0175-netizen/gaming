import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';
import { createWeapon } from '../entities/Weapon.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Darken background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Title
        this.add.text(width / 2, 60, '⬆️ LEVEL UP!', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 100, 'Choose an upgrade:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Generate upgrade options
        const upgrades = this.generateUpgradeOptions();

        // Create upgrade cards
        const cardWidth = 180;
        const cardSpacing = 20;
        const totalWidth = upgrades.length * cardWidth + (upgrades.length - 1) * cardSpacing;
        const startX = (width - totalWidth) / 2 + cardWidth / 2;

        upgrades.forEach((upgrade, index) => {
            this.createUpgradeCard(
                startX + index * (cardWidth + cardSpacing),
                height / 2 + 20,
                upgrade
            );
        });
    }

    generateUpgradeOptions() {
        const options = [];
        const allUpgrades = [];

        // Add stat upgrades
        Object.entries(CONFIG.UPGRADES).forEach(([key, upgrade]) => {
            allUpgrades.push({ ...upgrade, key });
        });

        // Add new weapon options if player has less than 4 weapons
        if (this.player.weapons.length < 4) {
            const ownedWeapons = this.player.weapons.map(w => w.constructor.name);

            Object.entries(CONFIG.WEAPONS).forEach(([key, weapon]) => {
                // Check if player already has this weapon type
                const weaponClass = key.charAt(0) + key.slice(1).toLowerCase() + 'Weapon';
                if (!ownedWeapons.some(w => w.includes(key.charAt(0)))) {
                    allUpgrades.push({
                        name: `New: ${weapon.name}`,
                        type: 'newWeapon',
                        weaponType: key,
                        value: weapon
                    });
                }
            });
        }

        // Add weapon upgrade option
        if (this.player.weapons.length > 0) {
            allUpgrades.push({
                name: 'Upgrade Weapon',
                type: 'weaponUpgrade',
                value: null
            });
        }

        // Shuffle and pick 3
        const shuffled = Phaser.Utils.Array.Shuffle([...allUpgrades]);
        return shuffled.slice(0, 3);
    }

    createUpgradeCard(x, y, upgrade) {
        const card = this.add.container(x, y);

        // Card background
        const bg = this.add.image(0, 0, 'upgrade_card')
            .setInteractive({ useHandCursor: true });

        // Icon based on type
        const iconMap = {
            'damage': '⚔️',
            'cooldown': '⚡',
            'pierce': '🔱',
            'area': '💫',
            'maxHealth': '❤️',
            'regen': '💚',
            'moveSpeed': '👟',
            'xpBoost': '✨',
            'newWeapon': '🆕',
            'weaponUpgrade': '⬆️'
        };

        const icon = this.add.text(0, -60, iconMap[upgrade.type] || '🎁', {
            fontSize: '48px'
        }).setOrigin(0.5);

        // Upgrade name
        const nameText = this.add.text(0, 10, upgrade.name, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 160 }
        }).setOrigin(0.5);

        // Description
        let description = this.getUpgradeDescription(upgrade);
        const descText = this.add.text(0, 50, description, {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#95a5a6',
            align: 'center',
            wordWrap: { width: 160 }
        }).setOrigin(0.5);

        card.add([bg, icon, nameText, descText]);

        // Interactions
        bg.on('pointerover', () => {
            card.setScale(1.05);
            bg.setTint(0x3498db);
        });

        bg.on('pointerout', () => {
            card.setScale(1);
            bg.clearTint();
        });

        bg.on('pointerdown', () => {
            this.selectUpgrade(upgrade);
        });

        return card;
    }

    getUpgradeDescription(upgrade) {
        switch (upgrade.type) {
            case 'damage':
                return 'Increase all damage dealt';
            case 'cooldown':
                return 'Attack more frequently';
            case 'pierce':
                return 'Projectiles hit more enemies';
            case 'area':
                return 'Larger attack radius';
            case 'maxHealth':
                return 'Increase maximum HP';
            case 'regen':
                return 'Slowly recover health';
            case 'moveSpeed':
                return 'Move faster';
            case 'xpBoost':
                return 'Gain more experience';
            case 'newWeapon':
                return `Add ${upgrade.value.name} to your arsenal`;
            case 'weaponUpgrade':
                return 'Enhance your current weapon';
            default:
                return '';
        }
    }

    selectUpgrade(upgrade) {
        const gameScene = this.scene.get('GameScene');

        switch (upgrade.type) {
            case 'newWeapon':
                const newWeapon = createWeapon(gameScene, this.player, upgrade.weaponType);
                this.player.weapons.push(newWeapon);
                break;

            case 'weaponUpgrade':
                // Upgrade a random weapon
                const randomWeapon = Phaser.Utils.Array.GetRandom(this.player.weapons);
                if (randomWeapon) randomWeapon.upgrade();
                break;

            default:
                this.player.applyUpgrade(upgrade);
                break;
        }

        // Close upgrade screen and resume game
        this.scene.stop();
        gameScene.resumeFromUpgrade();
    }
}
