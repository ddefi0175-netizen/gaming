import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, 100, '⚔️ SURVIVOR', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 150, 'Survive the Horde', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        }).setOrigin(0.5);

        // Load save data
        const saveData = JSON.parse(localStorage.getItem('survivorGame'));

        // Stats display
        this.add.text(width / 2, 200, `🏆 High Score: ${saveData.highScore} | 💰 Coins: ${saveData.coins}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Play button
        this.createButton(width / 2, 300, 'PLAY', () => {
            this.scene.start('GameScene');
        });

        // Meta/Upgrades button
        this.createButton(width / 2, 370, 'UPGRADES', () => {
            this.scene.start('MetaScene');
        });

        // Character info
        const selectedChar = saveData.selectedCharacter;
        this.add.text(width / 2, 460, `Selected: ${selectedChar.toUpperCase()}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#3498db'
        }).setOrigin(0.5);

        // Controls hint
        const controlsText = window.isMobile
            ? '📱 Use virtual joystick to move'
            : '⌨️ WASD or Arrow Keys to move';

        this.add.text(width / 2, height - 50, controlsText, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        }).setOrigin(0.5);

        // Version
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#34495e'
        }).setOrigin(1);
    }

    createButton(x, y, text, callback) {
        const button = this.add.image(x, y, 'button')
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setTexture('button_hover');
        });

        button.on('pointerout', () => {
            button.setTexture('button');
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1);
            callback();
        });

        return { button, text: buttonText };
    }
}
