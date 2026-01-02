import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

export class MetaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MetaScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Load save data
        this.saveData = JSON.parse(localStorage.getItem('survivorGame'));

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 1);

        // Title
        this.add.text(width / 2, 30, '🏪 UPGRADES SHOP', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Coins display
        this.coinsText = this.add.text(width / 2, 70, `💰 ${this.saveData.coins}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Tab buttons
        this.currentTab = 'characters';
        this.createTabs(width);

        // Content container
        this.contentContainer = this.add.container(0, 130);
        this.showCharacters();

        // Back button
        this.createButton(width / 2, height - 40, 'BACK TO MENU', () => {
            this.scene.start('MenuScene');
        });
    }

    createTabs(width) {
        const tabs = ['Characters', 'Upgrades', 'Stats'];
        const tabWidth = 120;
        const startX = width / 2 - (tabs.length * tabWidth) / 2 + tabWidth / 2;

        tabs.forEach((tab, i) => {
            const x = startX + i * tabWidth;
            const btn = this.add.rectangle(x, 105, tabWidth - 10, 35,
                this.currentTab === tab.toLowerCase() ? 0x3498db : 0x2c3e50, 1)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, 105, tab, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0.5);

            btn.on('pointerup', () => {
                this.currentTab = tab.toLowerCase();
                this.refreshContent();
            });
        });
    }

    refreshContent() {
        this.contentContainer.removeAll(true);

        switch (this.currentTab) {
            case 'characters':
                this.showCharacters();
                break;
            case 'upgrades':
                this.showUpgrades();
                break;
            case 'stats':
                this.showStats();
                break;
        }

        // Recreate scene to refresh tabs
        this.scene.restart();
    }

    showCharacters() {
        const characters = CONFIG.META.CHARACTERS;
        const cardWidth = 160;
        const cardHeight = 200;
        const startX = (this.cameras.main.width - characters.length * (cardWidth + 15)) / 2 + cardWidth / 2;

        characters.forEach((char, i) => {
            const x = startX + i * (cardWidth + 15);
            const y = 120;

            const isUnlocked = this.saveData.unlockedCharacters.includes(char.id);
            const isSelected = this.saveData.selectedCharacter === char.id;

            // Card background
            const cardColor = isSelected ? 0x3498db : isUnlocked ? 0x2c3e50 : 0x1a1a2e;
            const card = this.add.rectangle(x, y, cardWidth, cardHeight, cardColor, 1)
                .setStrokeStyle(2, isSelected ? 0xf1c40f : 0x34495e);

            // Character icon
            const iconMap = {
                'warrior': '⚔️',
                'mage': '🔮',
                'rogue': '🗡️',
                'paladin': '🛡️'
            };

            this.add.text(x, y - 60, iconMap[char.id] || '👤', {
                fontSize: '48px'
            }).setOrigin(0.5);

            // Name
            this.add.text(x, y, char.name, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Bonus text
            const bonusText = Object.entries(char.bonus || {})
                .map(([k, v]) => `+${typeof v === 'number' && v < 1 ? Math.round(v * 100) + '%' : v} ${k}`)
                .join('\n');

            this.add.text(x, y + 35, bonusText || 'No bonus', {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#95a5a6',
                align: 'center'
            }).setOrigin(0.5);

            // Action button
            if (!isUnlocked) {
                const btn = this.add.rectangle(x, y + 75, 100, 30, 0xe74c3c, 1)
                    .setInteractive({ useHandCursor: true });

                this.add.text(x, y + 75, `🔒 ${char.cost}`, {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: '#ffffff'
                }).setOrigin(0.5);

                btn.on('pointerup', () => this.purchaseCharacter(char));
            } else if (!isSelected) {
                const btn = this.add.rectangle(x, y + 75, 100, 30, 0x27ae60, 1)
                    .setInteractive({ useHandCursor: true });

                this.add.text(x, y + 75, 'SELECT', {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: '#ffffff'
                }).setOrigin(0.5);

                btn.on('pointerup', () => this.selectCharacter(char));
            } else {
                this.add.text(x, y + 75, '✓ SELECTED', {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: '#f1c40f'
                }).setOrigin(0.5);
            }

            this.contentContainer.add([card]);
        });
    }

    showUpgrades() {
        const upgrades = CONFIG.META.PERMANENT_UPGRADES;
        const startY = 20;
        const lineHeight = 60;

        upgrades.forEach((upgrade, i) => {
            const y = startY + i * lineHeight;
            const currentLevel = this.saveData.permanentUpgrades[upgrade.id] || 0;
            const isMaxed = currentLevel >= upgrade.maxLevel;
            const cost = Math.floor(upgrade.cost * Math.pow(1.5, currentLevel));

            // Background
            this.add.rectangle(this.cameras.main.width / 2, y + 130, 500, 50, 0x2c3e50, 1);

            // Name and level
            this.add.text(100, y + 130, `${upgrade.name}`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            // Level indicators
            for (let l = 0; l < upgrade.maxLevel; l++) {
                const color = l < currentLevel ? 0xf1c40f : 0x7f8c8d;
                this.add.rectangle(320 + l * 20, y + 130, 15, 15, color, 1);
            }

            // Bonus text
            const bonusText = Object.entries(upgrade.bonus)
                .map(([k, v]) => `+${typeof v === 'number' && v < 1 ? Math.round(v * 100) + '%' : v} ${k}`)
                .join(', ');

            this.add.text(100, y + 145, bonusText, {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#95a5a6'
            }).setOrigin(0, 0.5);

            // Buy button
            if (!isMaxed) {
                const btn = this.add.rectangle(this.cameras.main.width - 100, y + 130, 80, 35,
                    this.saveData.coins >= cost ? 0x27ae60 : 0x7f8c8d, 1)
                    .setInteractive({ useHandCursor: true });

                this.add.text(this.cameras.main.width - 100, y + 130, `💰 ${cost}`, {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: '#ffffff'
                }).setOrigin(0.5);

                if (this.saveData.coins >= cost) {
                    btn.on('pointerup', () => this.purchaseUpgrade(upgrade, cost));
                }
            } else {
                this.add.text(this.cameras.main.width - 100, y + 130, 'MAX', {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#f1c40f'
                }).setOrigin(0.5);
            }
        });
    }

    showStats() {
        const stats = [
            { label: 'Total Runs', value: this.saveData.totalRuns },
            { label: 'Total Kills', value: this.saveData.totalKills },
            { label: 'Total Play Time', value: this.formatTime(this.saveData.totalPlayTime) },
            { label: 'High Score', value: `${this.saveData.highScore}s` },
            { label: 'Total Coins Earned', value: this.saveData.coins },
            { label: 'Characters Unlocked', value: `${this.saveData.unlockedCharacters.length}/${CONFIG.META.CHARACTERS.length}` }
        ];

        stats.forEach((stat, i) => {
            const y = 150 + i * 40;

            this.add.text(200, y, stat.label, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#95a5a6'
            }).setOrigin(0, 0.5);

            this.add.text(this.cameras.main.width - 200, y, String(stat.value), {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
        });
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m ${seconds % 60}s`;
    }

    purchaseCharacter(character) {
        if (this.saveData.coins < character.cost) {
            this.showMessage('Not enough coins!');
            return;
        }

        this.saveData.coins -= character.cost;
        this.saveData.unlockedCharacters.push(character.id);
        this.saveThenRefresh();
    }

    selectCharacter(character) {
        this.saveData.selectedCharacter = character.id;
        this.saveThenRefresh();
    }

    purchaseUpgrade(upgrade, cost) {
        if (this.saveData.coins < cost) {
            this.showMessage('Not enough coins!');
            return;
        }

        this.saveData.coins -= cost;
        this.saveData.permanentUpgrades[upgrade.id] =
            (this.saveData.permanentUpgrades[upgrade.id] || 0) + 1;
        this.saveThenRefresh();
    }

    saveThenRefresh() {
        localStorage.setItem('survivorGame', JSON.stringify(this.saveData));
        this.scene.restart();
    }

    showMessage(text) {
        const msg = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: msg.y - 50,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button')
            .setInteractive({ useHandCursor: true });

        this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setTexture('button_hover'));
        button.on('pointerout', () => button.setTexture('button'));
        button.on('pointerup', callback);

        return button;
    }
}
