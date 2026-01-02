import Phaser from 'phaser';
import { CONFIG } from '../config/GameConfig.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.stats = data.stats;
        this.coinsEarned = data.coinsEarned;
        this.newAchievements = data.newAchievements || [];
    }

    create() {
        const { width, height } = this.cameras.main;
        const saveData = JSON.parse(localStorage.getItem('survivorGame'));

        // Check if ads should be shown (mobile only, not removed)
        this.showAds = !CONFIG.IS_STEAM && !saveData.adsRemoved;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 1);

        // Title - different for different survival times
        const survivalSeconds = Math.floor(this.stats.survivalTime / 1000);
        let title = '💀 GAME OVER';
        let titleColor = '#e74c3c';

        if (survivalSeconds >= 900) { // 15+ minutes
            title = '🏆 LEGENDARY RUN!';
            titleColor = '#f1c40f';
        } else if (survivalSeconds >= 600) { // 10+ minutes
            title = '⭐ GREAT RUN!';
            titleColor = '#3498db';
        } else if (survivalSeconds >= 300) { // 5+ minutes
            title = '👍 GOOD RUN!';
            titleColor = '#2ecc71';
        }

        this.add.text(width / 2, 60, title, {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: titleColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats container
        const statsY = 120;
        const lineHeight = 30;

        // Survival time
        const minutes = Math.floor(survivalSeconds / 60);
        const seconds = survivalSeconds % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.add.text(width / 2, statsY, `⏱️ Survived: ${timeStr}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Kills
        this.add.text(width / 2, statsY + lineHeight, `💀 Enemies Killed: ${this.stats.killCount}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Level reached
        this.add.text(width / 2, statsY + lineHeight * 2, `⭐ Level Reached: ${this.stats.level}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Boss kills if any
        if (this.stats.bossKills > 0) {
            this.add.text(width / 2, statsY + lineHeight * 3, `👑 Bosses Defeated: ${this.stats.bossKills}`, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#9b59b6'
            }).setOrigin(0.5);
        }

        // Coins earned
        this.add.text(width / 2, statsY + lineHeight * 4.5, `💰 Coins Earned: ${this.coinsEarned}`, {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Show new achievements if any
        if (this.newAchievements.length > 0) {
            this.showAchievementUnlocks(width / 2, statsY + lineHeight * 6);
        }

        // Double coins button (ad reward) - only on mobile without ad removal
        const buttonY = this.newAchievements.length > 0 ? statsY + lineHeight * 8 : statsY + lineHeight * 6;

        if (this.showAds) {
            this.createAdButton(width / 2, buttonY, '📺 Watch Ad - Double Coins!', () => {
                this.watchAdForDoubleCoins();
            });
        }

        // Play again button
        this.createButton(width / 2, height - 130, 'PLAY AGAIN', () => {
            this.scene.start('GameScene');
        });

        // Menu button
        this.createButton(width / 2, height - 60, 'MAIN MENU', () => {
            this.scene.start('MenuScene');
        });
    }

    showAchievementUnlocks(x, y) {
        this.add.text(x, y, '🏅 NEW ACHIEVEMENTS!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.newAchievements.forEach((achievement, i) => {
            this.add.text(x, y + 25 + i * 20, `${achievement.name} (+${achievement.reward} coins)`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#2ecc71'
            }).setOrigin(0.5);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button')
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setTexture('button_hover'));
        button.on('pointerout', () => button.setTexture('button'));
        button.on('pointerdown', () => button.setScale(0.95));
        button.on('pointerup', () => {
            button.setScale(1);
            callback();
        });

        return { button, text: buttonText };
    }

    createAdButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 280, 45, 0x27ae60, 1)
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setFillStyle(0x2ecc71));
        button.on('pointerout', () => button.setFillStyle(0x27ae60));
        button.on('pointerdown', () => button.setScale(0.95));
        button.on('pointerup', () => {
            button.setScale(1);
            callback();
        });

        // Store reference for disabling later
        this.adButton = { button, text: buttonText };

        return { button, text: buttonText };
    }

    watchAdForDoubleCoins() {
        // In a real app, this would trigger an ad SDK
        // For demo, we simulate watching an ad

        // Disable button
        this.adButton.button.disableInteractive();
        this.adButton.button.setFillStyle(0x7f8c8d);
        this.adButton.text.setText('Ad Complete! ✓');

        // Double the coins
        const saveData = JSON.parse(localStorage.getItem('survivorGame'));
        saveData.coins += this.coinsEarned; // Add another round of coins
        localStorage.setItem('survivorGame', JSON.stringify(saveData));

        // Show feedback
        this.add.text(this.cameras.main.width / 2, 380, `+${this.coinsEarned} bonus coins!`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
