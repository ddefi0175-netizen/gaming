// Sound Manager for the Survivor game
// Uses Web Audio API to generate procedural sound effects

export class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.4;
        this.muted = false;
        this.sounds = {};
        this.currentMusic = null;

        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;

            // Create sound effects
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    createSounds() {
        // Pre-generate sound buffers for common sounds
        this.sounds = {
            shoot: () => this.playShoot(),
            hit: () => this.playHit(),
            enemyDeath: () => this.playEnemyDeath(),
            playerHurt: () => this.playPlayerHurt(),
            levelUp: () => this.playLevelUp(),
            pickup: () => this.playPickup(),
            select: () => this.playSelect(),
            hover: () => this.playHover(),
            bossDeath: () => this.playBossDeath(),
            bossWarning: () => this.playBossWarning(),
            achievement: () => this.playAchievement()
        };
    }

    play(soundName) {
        if (this.muted || !this.audioContext) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Player shooting sound - quick zap
    playShoot() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // Hit sound - impact
    playHit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.08);
    }

    // Enemy death - pop
    playEnemyDeath() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    // Player hurt - low thud
    playPlayerHurt() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    // Level up - ascending arpeggio
    playLevelUp() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.audioContext.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }

    // Pickup sound - coin-like
    playPickup() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(1760, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    // UI select sound
    playSelect() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(this.sfxVolume * 0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // UI hover sound
    playHover() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(this.sfxVolume * 0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    // Boss death - big explosion
    playBossDeath() {
        // Multiple layered sounds
        for (let i = 0; i < 5; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sawtooth';
            const startFreq = 200 + Math.random() * 100;
            osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime + i * 0.05);
            osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + i * 0.05 + 0.3);

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.05 + 0.3);

            osc.start(this.audioContext.currentTime + i * 0.05);
            osc.stop(this.audioContext.currentTime + i * 0.05 + 0.3);
        }
    }

    // Boss warning - alarm
    playBossWarning() {
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'square';
            osc.frequency.value = 440;

            const startTime = this.audioContext.currentTime + i * 0.3;
            gain.gain.setValueAtTime(this.sfxVolume * 0.3, startTime);
            gain.gain.setValueAtTime(0, startTime + 0.15);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        }
    }

    // Achievement unlocked
    playAchievement() {
        const notes = [523, 659, 784, 880, 1047]; // C5 major scale

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, startTime + 0.15);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // Background music using oscillators
    startMusic() {
        if (this.muted || !this.audioContext || this.currentMusic) return;

        this.currentMusic = {
            oscillators: [],
            gains: [],
            playing: true
        };

        // Create a simple looping ambient track
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.currentMusic?.playing) return;

        const bassNotes = [65.41, 73.42, 82.41, 98]; // C2, D2, E2, G2
        const now = this.audioContext.currentTime;

        // Bass line
        bassNotes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.value = 200;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.5;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.3, startTime + 0.1);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.2, startTime + 0.3);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.5);

            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });

        // Schedule next loop
        setTimeout(() => this.playMusicLoop(), 2000);
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.playing = false;
            this.currentMusic = null;
        }
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        }
        return this.muted;
    }

    // Resume audio context (call on user interaction)
    resume() {
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Global sound manager instance
let soundManagerInstance = null;

export function getSoundManager(scene) {
    if (!soundManagerInstance) {
        soundManagerInstance = new SoundManager(scene);
    }
    return soundManagerInstance;
}
