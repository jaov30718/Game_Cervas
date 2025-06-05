
export class AudioManager {
    constructor() {
        this.musicTracks = {
            bgMusic: document.getElementById('bgMusic'),
            bossMusic: document.getElementById('bossMusic'),
            gameOverMusic: document.getElementById('gameOverMusic'),
        };
        this.sfxTracks = {
            
            playerShoot: ['sfxPlayerShoot_1', 'sfxPlayerShoot_2'],
            playerHit: ['sfxPlayerHit_1', 'sfxPlayerHit_2'],
            enemyHit: ['sfxEnemyHit_1', 'sfxEnemyHit_2'],
            enemyShoot: ['sfxEnemyShoot_1', 'sfxEnemyShoot_2'],
            bossHit: ['sfxBossHit_1', 'sfxBossHit_2'],
            bossShoot: ['sfxBossShoot_1', 'sfxBossShoot_2'],
            explosion: ['sfxExplosion_1', 'sfxExplosion_2'],

            
            playerHeal: 'sfxPlayerHeal',
            enemyDeath: 'sfxEnemyDeath',
            bossDeath: 'sfxBossDeath',
            bossAbility: 'sfxBossAbility',
            xpCollect: 'sfxXpCollect',
            levelUp: 'sfxLevelUp',
            quizCorrect: 'sfxQuizCorrect',
            quizIncorrect: 'sfxQuizIncorrect',
            marketPurchase: 'sfxMarketPurchase',
            buttonClick: 'sfxButtonClick',
            modalOpen: 'sfxModalOpen',
            modalClose: 'sfxModalClose',
        };

        this.currentMusic = null;
        this.globalMusicVolume = 0.1;
        this.globalSfxVolume = 0.5;
        this.isMuted = false;

        this._initializeAudioElements(); 
    }

    _initializeAudioElements() {
        Object.values(this.musicTracks).forEach(track => {
            if (track) track.volume = this.globalMusicVolume;
        });

        
        for (const key in this.sfxTracks) {
            const sfxEntry = this.sfxTracks[key];
            if (Array.isArray(sfxEntry)) { 
                sfxEntry.forEach(sfxId => {
                    const sfxElement = document.getElementById(sfxId);
                    if (sfxElement) sfxElement.volume = this.globalSfxVolume;
                });
            } else { 
                const sfxElement = document.getElementById(sfxEntry);
                if (sfxElement) sfxElement.volume = this.globalSfxVolume;
            }
        }
    }

    async playMusic(trackId, loop = true, specificVolume = null) {
        if (this.currentMusic && this.musicTracks[this.currentMusic] && this.musicTracks[this.currentMusic] !== this.musicTracks[trackId]) {
            await this.stopMusicTrack(this.currentMusic);
        }

        const track = this.musicTracks[trackId];
        if (track) {
            track.loop = loop;
            track.volume = specificVolume !== null ? specificVolume : this.globalMusicVolume;
            if (this.isMuted) track.volume = 0;

            try {
                if (track.paused || track.currentTime === 0 || track.ended) {
                    await track.play();
                }
                this.currentMusic = trackId;
            } catch (error) {
                console.warn(`Erro ao tocar música ${trackId}:`, error, "Interação do usuário pode ser necessária.");
            }
        } else {
            console.warn(`Trilha de música não encontrada: ${trackId}`);
        }
    }

    pauseCurrentMusic() {
        if (this.currentMusic && this.musicTracks[this.currentMusic]) {
            this.musicTracks[this.currentMusic].pause();
        }
    }

    async resumeCurrentMusic() {
        if (this.currentMusic && this.musicTracks[this.currentMusic] && this.musicTracks[this.currentMusic].paused) {
            try {
                this.musicTracks[this.currentMusic].volume = this.isMuted ? 0 : this.globalMusicVolume;
                await this.musicTracks[this.currentMusic].play();
            } catch (error) {
                console.warn(`Erro ao resumir música ${this.currentMusic}:`, error);
            }
        }
    }

    async stopMusicTrack(trackId) {
        const track = this.musicTracks[trackId];
        if (track) {
            track.pause(); 
            track.currentTime = 0;
        }
        if (this.currentMusic === trackId) {
            this.currentMusic = null;
        }
    }
    
    async stopCurrentMusic() {
        if (this.currentMusic) {
            await this.stopMusicTrack(this.currentMusic);
        }
    }

    async playSFX(sfxKey, specificVolume = null) {
        const sfxEntry = this.sfxTracks[sfxKey];
        if (!sfxEntry) {
            console.warn(`Chave SFX não encontrada no sfxTracks: ${sfxKey}`);
            return;
        }

        let sfxIdToPlay;
        if (Array.isArray(sfxEntry)) { 
            if (sfxEntry.length === 0) return;
            sfxIdToPlay = sfxEntry[Math.floor(Math.random() * sfxEntry.length)];
        } else { 
            sfxIdToPlay = sfxEntry;
        }

        const sfxElement = document.getElementById(sfxIdToPlay);
        if (sfxElement) {
            sfxElement.volume = specificVolume !== null ? specificVolume : this.globalSfxVolume;
            if (this.isMuted) sfxElement.volume = 0;
            sfxElement.currentTime = 0; 
            try {
                await sfxElement.play();
            } catch (error) {
                
                if (error.name !== 'AbortError') {
                    console.warn(`Erro ao tocar SFX ${sfxIdToPlay} (chave: ${sfxKey}):`, error);
                }
            }
        } else {
            console.warn(`Elemento de áudio SFX não encontrado para ID: ${sfxIdToPlay} (chave: ${sfxKey})`);
        }
    }

    setGlobalMusicVolume(volume) {
        this.globalMusicVolume = Math.max(0, Math.min(1, volume));
        if (!this.isMuted) {
            if (this.currentMusic && this.musicTracks[this.currentMusic]) {
                this.musicTracks[this.currentMusic].volume = this.globalMusicVolume;
            }
            Object.values(this.musicTracks).forEach(track => {
                if (track) track.volume = this.globalMusicVolume;
            });
        }
    }
    
    setGlobalSfxVolume(volume) {
        this.globalSfxVolume = Math.max(0, Math.min(1, volume));
         if (!this.isMuted) {
            for (const key in this.sfxTracks) {
                const sfxEntry = this.sfxTracks[key];
                if (Array.isArray(sfxEntry)) {
                    sfxEntry.forEach(sfxId => {
                        const sfxElement = document.getElementById(sfxId);
                        if (sfxElement) sfxElement.volume = this.globalSfxVolume;
                    });
                } else {
                    const sfxElement = document.getElementById(sfxEntry);
                    if (sfxElement) sfxElement.volume = this.globalSfxVolume;
                }
            }
        }
    }

    toggleMuteAll() {
        this.isMuted = !this.isMuted;
        const newMusicVolume = this.isMuted ? 0 : this.globalMusicVolume;
        const newSfxVolume = this.isMuted ? 0 : this.globalSfxVolume;

        Object.values(this.musicTracks).forEach(track => {
            if (track) track.volume = newMusicVolume;
        });
        
        for (const key in this.sfxTracks) {
            const sfxEntry = this.sfxTracks[key];
            if (Array.isArray(sfxEntry)) {
                sfxEntry.forEach(sfxId => {
                    const sfxElement = document.getElementById(sfxId);
                    if (sfxElement) sfxElement.volume = newSfxVolume;
                });
            } else {
                const sfxElement = document.getElementById(sfxEntry);
                if (sfxElement) sfxElement.volume = newSfxVolume;
            }
        }
        return this.isMuted;
    }
}