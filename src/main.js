import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { MetaScene } from './scenes/MetaScene.js';
import { CONFIG } from './config/GameConfig.js';

// Detect if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const config = {
    type: Phaser.AUTO,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        activePointers: 3,
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        UIScene,
        UpgradeScene,
        GameOverScene,
        MetaScene
    ]
};

// Store mobile detection globally
window.isMobile = isMobile;

const game = new Phaser.Game(config);

export default game;
