
import { getRandomInt, distance, createFloatingText } from './utils.js';
import {
    ENEMY_SPAWN_INTERVAL_INITIAL, MAX_ENEMIES_BASE, XP_TO_NEXT_LEVEL_BASE,
    MARKET_ROUND_INTERVAL, BOSS_ROUND_INTERVAL, ENEMY_MODIFIER_CHANCE_PER_ROUND_INCREMENT,
    beerActivities, processUpgrades, masterTechniques, 
    enemyTypes, 
    roundConditions,
    permanentMarketUpgrades, marketMasterTechniques, marketSeasonings, enemyAfixes,NORMAL_ROUND_DURATION_SECONDS,
     BOSS_DEFEATED_COOLDOWN_SECONDS
} from './config.js';
import { Enemy, ChampionEnemy, BossEnemy } from './enemy.js';

export class GameLogic {
    constructor(game) {
        this.game = game;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = ENEMY_SPAWN_INTERVAL_INITIAL;
        this.maxEnemies = MAX_ENEMIES_BASE;
        this.pendingBuff = null;
        this.pendingDebuff = null;
        this.currentMarketStock = [];
        this.isProcessingEndOfRound = false;
        this.enemyModifierChanceIncrement = ENEMY_MODIFIER_CHANCE_PER_ROUND_INCREMENT;
        this.bossDefeated = false;
        this.bossDefeatedTimer = 0;
    }

    recalculatePlayerStats() {
        if (!this.game.player || !this.game.playerWeapon) return;

        
        let tempDamageMultiplier = 1;
        let tempSpeedMultiplier = 1;
        let tempCritChanceAdditive = 0;
        

        
        this.game.activeConditions.forEach(condition => {
            if (condition.data.statModifiers) {
                condition.data.statModifiers.forEach(mod => {
                    switch (mod.target) {
                        case "playerWeapon.damage":
                            if (mod.multiplier) tempDamageMultiplier *= mod.multiplier;
                            
                            break;
                        case "player.speed":
                            if (mod.multiplier) tempSpeedMultiplier *= mod.multiplier;
                            break;
                        case "playerWeapon.critChance":
                            if (mod.additive) tempCritChanceAdditive += mod.additive;
                            
                            break;
                        
                    }
                });
            }
        });

        
        this.game.playerWeapon.temporaryDamageMultiplier = tempDamageMultiplier; 
        this.game.playerWeapon.currentDamage = Math.round(this.game.playerWeapon.baseDamage * tempDamageMultiplier);

        this.game.player.temporarySpeedMultiplier = tempSpeedMultiplier; 
        this.game.player.currentSpeed = this.game.player.baseSpeed * tempSpeedMultiplier;
        
        this.game.player.temporaryCritChanceAdditive = tempCritChanceAdditive; 
        this.game.playerWeapon.critChance = this.game.playerWeapon.baseCritChance + tempCritChanceAdditive;


        
        this.game.ui.updateHealthBarUI(); 
        
    }


    startNewRound() {
        this.isProcessingEndOfRound = false;
        this.game.ui.hideQuizModal();
        this.game.ui.hideMarketModal();
        this.game.ui.hideLevelUpModal(); 
        this.game.currentRound++;
        this.game.ui.updateRoundDisplay();
        this.game.roundTimer = 0;
        this.game.enemies = [];
        this.game.projectiles = [];
        this.game.xpOrbs = [];
        this.game.enemyProjectiles = [];
        this.bossDefeated = false;
        this.bossDefeatedTimer = 0;

        
        this.applyPendingConditions(); 
        

        this.game.ui.updatePlayerPowersDisplay();

        this.enemySpawnInterval = Math.max(15, ENEMY_SPAWN_INTERVAL_INITIAL - (this.game.currentRound * 3.5));
        this.maxEnemies = MAX_ENEMIES_BASE + Math.floor(this.game.currentRound * 1.8);

        this.game.ui.showNotification(`Iniciando Round ${this.game.currentRound}!`, 3000);

        const initialSpawns = Math.min(this.maxEnemies, 2 + Math.floor(this.game.currentRound * 0.4) );
        for (let i = 0; i < initialSpawns; i++) {
            this.spawnRegularEnemy();
        }

        if (this.isBossRound()) {
            this.spawnBoss(); 
        } else {
            
            if (this.game.audioManager.currentMusic === 'bossMusic' || !this.game.audioManager.currentMusic) {
                this.game.audioManager.playMusic('bgMusic');
            }
            
        }

        this.game.gamePaused = false;
    }


    updateRound() {
        if (this.game.gameOver || this.game.gamePaused || this.isProcessingEndOfRound) return; 

        this.game.roundTimer++;
        this.game.totalGameTime++;

        if (this.game.roundTimer % 60 === 0) {
            this.game.ui.updateTimerDisplay();
        }

        this.enemySpawnTimer--;
        if (this.enemySpawnTimer <= 0 && this.game.enemies.length < this.maxEnemies && !this.isBossActive() && !this.bossDefeated) {
            const spawnChance = Math.random();
            if (this.game.currentRound > 2 && spawnChance < (0.12 + (this.game.currentRound * 0.03))) { 
                this.spawnChampionEnemy();
            } else {
                this.spawnRegularEnemy();
            }
            this.enemySpawnTimer = Math.floor(this.enemySpawnInterval * (this.game.enemySpawnModifier || 1));
        }

        if (this.isBossRound()) {
            if (this.isBossActive()) {
                if (!this.game.enemies.some(e => e.isBoss && e.health > 0)) { 
                    this.game.audioManager.stopCurrentMusic(); 
                    this.game.audioManager.playMusic('bgMusic'); 
                    this.endRound();
                }
            }else if (this.bossDefeated) {
                
                this.bossDefeatedTimer++;
                if (this.bossDefeatedTimer >= BOSS_DEFEATED_COOLDOWN_SECONDS * 60) { 
                    this.endRound();
                }
            }else if (!this.isBossActive() && !this.game.enemies.some(e => e.isBoss)) {
                
                
                
                
                
                
                
                if (this.game.roundTimer > (NORMAL_ROUND_DURATION_SECONDS + 60) * 60) { 
                    console.warn("Boss round, no active boss and bossDefeated not set. Forcing endRound due to time.");
                    this.endRound();
                }
            }
        } else {
            if (this.game.roundTimer >= NORMAL_ROUND_DURATION_SECONDS * 60) { 
                this.endRound();
            }
        }
    }

    setBossAsDefeated() {
        if (this.isBossRound() && !this.bossDefeated) {
            this.bossDefeated = true;
            this.bossDefeatedTimer = 0; 
            this.game.audioManager.stopCurrentMusic(); 
            this.game.audioManager.playMusic('bgMusic'); 
            this.game.ui.showNotification("Chefe derrotado! Round terminando em breve...", (BOSS_DEFEATED_COOLDOWN_SECONDS -1) * 1000);

            
            
            
            
        }
    }


    async endRound() {
        if (this.isProcessingEndOfRound) return;
        this.isProcessingEndOfRound = true;
        this.game.gamePaused = true;
        this.game.ui.showNotification(`Round ${this.game.currentRound} Concluído! Coletando XP...`, 2000);

        for (let i = this.game.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.game.xpOrbs[i];
            this.gainXP(orb.value, false); 
            this.game.xpOrbs.splice(i, 1);
        }
        this.game.ui.updateXPBarUI();

        await this.handleEndOfRoundLevelUps(); 

        this.revertExpiredConditions(); 
        

        this.game.ui.updatePlayerPowersDisplay();

        if (this.isMarketRound() && !this.isBossRound()) {
            this.game.ui.showMarketModal(this.getMarketItems(true)); 
        } else {
            const randomActivity = beerActivities[getRandomInt(0, beerActivities.length - 1)];
            this.game.ui.showQuizModal(randomActivity);
        }
    }

    async handleEndOfRoundLevelUps() {
        return new Promise(async (resolve) => {
            while (this.game.currentXP >= this.game.xpToNextLevel) {
                this.game.level++;
                this.game.currentXP -= this.game.xpToNextLevel;
                if (this.game.currentXP < 0) this.game.currentXP = 0;
                this.game.xpToNextLevel = Math.floor(XP_TO_NEXT_LEVEL_BASE * Math.pow(1.55, this.game.level - 1));

                this.game.audioManager.playSFX('levelUp');
                
                this.game.ui.updateLevelDisplay();
                this.game.ui.updateXPBarUI();
                if (this.game.player) this.game.player.heal(this.game.player.maxHealth * 0.25);
                
                this.game.ui.showNotification(`Nível ${this.game.level} alcançado! Escolha uma melhoria.`, 3000);
                this.game.ui.showLevelUpModal();

                await new Promise(upgradeResolve => {
                    const originalSelectUpgrade = this.selectUpgrade;
                    this.selectUpgrade = (upgradeData) => {
                        originalSelectUpgrade.call(this, upgradeData, true); 
                        this.selectUpgrade = originalSelectUpgrade; 
                        upgradeResolve();
                    };
                });
            }
            resolve();
        });
    }


    getDifficultyMultiplier() {
        const earlyRoundBoost = Math.min(this.game.currentRound, 10) * 0.15;
        const lateRoundScaling = Math.max(0, this.game.currentRound - 10) * 0.08;
        return 1 + earlyRoundBoost + lateRoundScaling;
    }

    isBossRound() {
        return this.game.currentRound % BOSS_ROUND_INTERVAL === 0 && this.game.currentRound > 0;
    }

    isMarketRound() {
        return this.game.currentRound % MARKET_ROUND_INTERVAL === 0 && this.game.currentRound > 0;
    }

    isBossActive() {
        return this.game.enemies.some(e => e.isBoss);
    }

    getSpawnPosition() {
        let x, y;
        const edge = getRandomInt(0, 3);
        const size = 30;
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;

        if (edge === 0) { x = Math.random() * canvasWidth; y = -size; }
        else if (edge === 1) { x = canvasWidth + size; y = Math.random() * canvasHeight; }
        else if (edge === 2) { x = Math.random() * canvasWidth; y = canvasHeight + size; }
        else { x = -size; y = Math.random() * canvasHeight; }
        return { x, y };
    }

    spawnRegularEnemy() {
        if (this.game.enemies.length >= this.maxEnemies) return;
        const typeData = enemyTypes.regular[getRandomInt(0, enemyTypes.regular.length - 1)];
        const { x, y } = this.getSpawnPosition();
        const difficulty = this.getDifficultyMultiplier();
        const round = this.game.currentRound;

        const health = Math.ceil(typeData.healthBase * difficulty * (1 + (round -1) * 0.08));
        const damage = Math.ceil(typeData.damageBase * difficulty * (1 + (round -1) * 0.06));

        const enemy = new Enemy(
            x, y,
            getRandomInt(typeData.sizeMin, typeData.sizeMax),
            typeData.color,
            typeData.speedBase, 
            health,
            Math.ceil(typeData.xpBase * (1 + (round - 1) * 0.1)), 
            damage,
            this.game,
            typeData.name,
            typeData.baseColorHex
        );

        enemy.isShooter = typeData.isShooter || false;
        if (enemy.isShooter) {
            enemy.shootRange = typeData.shootRange || 200;
            enemy.projectileDamage = Math.ceil((typeData.projectileDamage || 5) * difficulty * (1 + (round-1)*0.06));
            enemy.attackCooldownBase = Math.max(30, (typeData.attackCooldownBase || 120) * (1 - (round-1)*0.015)); 
            enemy.projectileSpeed = (typeData.projectileSpeed || 3) * (1 + (round-1)*0.02);
            enemy.projectileColor = typeData.projectileColor || '#FF6347';
            enemy.projectileSize = typeData.projectileSize || 5;
            enemy.projectileLifeTime = typeData.projectileLifeTime || 240;
        }
        enemy.applyAfixes(round); 
        this.game.enemies.push(enemy);
    }

    spawnChampionEnemy() {
        if (this.game.enemies.length >= this.maxEnemies || this.isBossActive()) return;
        
        const eligibleBaseTypes = enemyTypes.regular;
        if(eligibleBaseTypes.length === 0) return;
        const baseTypeData = eligibleBaseTypes[getRandomInt(0, eligibleBaseTypes.length - 1)];

        const eligibleChampionTypes = enemyTypes.champion.filter(ct => ct.baseName === baseTypeData.name || !ct.baseName);
         if(eligibleChampionTypes.length === 0) { 
            this.spawnRegularEnemy(); 
            console.warn(`Nenhum tipo de campeão para ${baseTypeData.name}, spawnando regular com afixos extras.`);
            return;
         }
        const championTypeData = eligibleChampionTypes[getRandomInt(0, eligibleChampionTypes.length - 1)];
        
        const { x, y } = this.getSpawnPosition();

        const champion = new ChampionEnemy(x, y, baseTypeData, championTypeData, this.game);
        this.game.enemies.push(champion);
    }
    
    spawnSplinterMinions(sourceEnemy, count) {
        let baseNameToFind;
        if (sourceEnemy.isChampion && sourceEnemy.baseEnemyData && sourceEnemy.baseEnemyData.name) {
            
            baseNameToFind = sourceEnemy.baseEnemyData.name;
        } else {
            
            
            baseNameToFind = sourceEnemy.originalName;
            
            
            
            let tempType = enemyTypes.regular.find(rt => rt.name === baseNameToFind);
            if (!tempType) { 
                 const basicTypesRegex = new RegExp(`(${enemyTypes.regular.map(rt => rt.name).join('|')})`);
                 const match = sourceEnemy.originalName.match(basicTypesRegex);
                 if (match && match[1]) {
                     baseNameToFind = match[1];
                 }
            }
        }

        const baseMinionType = enemyTypes.regular.find(rt => rt.name === baseNameToFind);

        if (!baseMinionType) {
            console.warn(`Tipo de minion base '${baseNameToFind}' não encontrado para splinter de '${sourceEnemy.name}'. Usando fallback para o primeiro tipo regular.`);
            
            const fallbackType = enemyTypes.regular[0];
            if (!fallbackType) {
                console.error("Nenhum tipo de inimigo regular definido para fallback em spawnSplinterMinions.");
                return;
            }
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = sourceEnemy.size / 2 + 5 + Math.random() * 10;
                const x = sourceEnemy.x + Math.cos(angle) * radius;
                const y = sourceEnemy.y + Math.sin(angle) * radius;
                const difficulty = this.getDifficultyMultiplier() * 0.3; 
    
                const splinter = new Enemy(
                    x, y,
                    Math.max(8, fallbackType.sizeMin * 0.7), 
                    fallbackType.color,
                    fallbackType.speedBase * 1.1,
                    Math.max(1, Math.ceil(fallbackType.healthBase * difficulty * 0.4)),
                    Math.ceil(fallbackType.xpBase * 0.15),
                    Math.max(1, Math.ceil(fallbackType.damageBase * difficulty * 0.4)),
                    this.game,
                    `Mini Fragmento de ${fallbackType.name}`,
                    fallbackType.baseColorHex
                );
                this.game.enemies.push(splinter);
            }
            return; 
        }

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = sourceEnemy.size / 2 + 5 + Math.random() * 10;
            const x = sourceEnemy.x + Math.cos(angle) * radius;
            const y = sourceEnemy.y + Math.sin(angle) * radius;
            const difficulty = this.getDifficultyMultiplier() * 0.4; 

            const splinter = new Enemy(
                x, y,
                Math.max(8, baseMinionType.sizeMin * 0.8), 
                baseMinionType.color, 
                baseMinionType.speedBase * 1.1, 
                Math.max(1, Math.ceil(baseMinionType.healthBase * difficulty * 0.5)),
                Math.ceil(baseMinionType.xpBase * 0.2),
                Math.max(1, Math.ceil(baseMinionType.damageBase * difficulty * 0.5)),
                this.game,
                `Fragmento de ${baseMinionType.name}`,
                baseMinionType.baseColorHex
            );
            splinter.isShooter = baseMinionType.isShooter && Math.random() < 0.2; 
            if(splinter.isShooter){
                splinter.projectileDamage = Math.max(1, Math.ceil((baseMinionType.projectileDamage || 5) * difficulty * 0.3));
                splinter.attackCooldownBase = (baseMinionType.attackCooldownBase || 120) * 1.5;
            }
            this.game.enemies.push(splinter);
        }
    }
    spawnSpecificChampionAround(sourceBoss, championNameToSpawn, count) {
        const championVariantData = enemyTypes.champion.find(ct => ct.name === championNameToSpawn);

        if (!championVariantData) {
            console.warn(`Dados da variante campeã para '${championNameToSpawn}' não encontrados. Tentando fallback.`);
            this.spawnMinionsAround(sourceBoss, enemyTypes.regular[0].name, count); 
            return;
        }

        const championBaseData = enemyTypes.regular.find(rt => rt.name === championVariantData.baseName);

        if (!championBaseData) {
            console.warn(`Dados base para o campeão '${championNameToSpawn}' (base: ${championVariantData.baseName}) não encontrados. Spawning regular minion instead.`);
            this.spawnMinionsAround(sourceBoss, enemyTypes.regular[0].name, count); 
            return;
        }

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = sourceBoss.size + 20 + Math.random() * 30;
            const x = sourceBoss.x + Math.cos(angle) * radius;
            const y = sourceBoss.y + Math.sin(angle) * radius;

            const minionBaseStats = {
                ...championBaseData,
                healthBase: championBaseData.healthBase * 0.6, 
                damageBase: championBaseData.damageBase * 0.6,
                xpBase: championBaseData.xpBase * 0.3,
            };
            
            const minionChampionVariantStats = {
                ...championVariantData,
                healthMultiplier: (championVariantData.healthMultiplier || 2.5) * 0.7,
                damageMultiplier: (championVariantData.damageMultiplier || 1.5) * 0.7,
                xpMultiplier: (championVariantData.xpMultiplier || 3) * 0.5,
            };

            const championMinion = new ChampionEnemy(x, y,
                minionBaseStats,
                minionChampionVariantStats,
                this.game
            );
            this.game.enemies.push(championMinion);
        }
    }


    spawnBoss() {
        this.game.enemies = this.game.enemies.filter(e => e.isBoss && e.health > 0); 
        if (this.isBossActive()) return;

        if (enemyTypes.boss.length === 0) {
            console.warn("Tentativa de spawnar chefe, mas nenhum tipo de chefe definido.");
            this.bossDefeated = true; 
            return;
        }
        const bossIndex = Math.floor(((this.game.currentRound / BOSS_ROUND_INTERVAL) -1) % enemyTypes.boss.length);
        const bossConfig = enemyTypes.boss[bossIndex >= 0 ? bossIndex : 0]; 
        
        const { x, y } = this.getSpawnPosition();
        const boss = new BossEnemy(x, y, bossConfig, this.game);
        this.game.enemies.push(boss);
        this.game.audioManager.stopCurrentMusic(); 
        this.game.audioManager.playMusic('bossMusic'); 
    }

    spawnMinionsAround(sourceEnemy, minionTypeName, count) { 
        
        const baseMinionType = enemyTypes.regular.find(rt => rt.name === minionTypeName);
        if (!baseMinionType) {
            console.warn("Tipo de minion não encontrado para spawn em spawnMinionsAround:", minionTypeName, ". Usando o primeiro regular como fallback.");
            
            const fallbackType = enemyTypes.regular[0];
            if (!fallbackType) {
                console.error("Nenhum tipo de inimigo regular definido para fallback em spawnMinionsAround.");
                return;
            }
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = sourceEnemy.size + 15 + Math.random() * 25;
                const x = sourceEnemy.x + Math.cos(angle) * radius;
                const y = sourceEnemy.y + Math.sin(angle) * radius;
                const difficulty = this.getDifficultyMultiplier() * 0.6; 

                const minion = new Enemy(
                    x, y,
                    getRandomInt(fallbackType.sizeMin, fallbackType.sizeMax) * 0.7,
                    fallbackType.color,
                    fallbackType.speedBase * 1.2,
                    Math.max(1, Math.ceil(fallbackType.healthBase * difficulty * (this.game.enemyHealthMultiplier || 1))),
                    Math.ceil(fallbackType.xpBase * 0.4),
                    Math.max(1, Math.ceil(fallbackType.damageBase * difficulty * (fallbackType.isShooter ? 0.6 : 0.9))),
                    this.game,
                    `Mini ${fallbackType.name}`,
                    fallbackType.baseColorHex
                );
                minion.isShooter = fallbackType.isShooter || false;
                if (minion.isShooter) {
                    minion.shootRange = (fallbackType.shootRange || 200) * 0.8;
                    minion.projectileDamage = Math.max(1, Math.ceil((fallbackType.projectileDamage || 5) * difficulty * 0.7));
                    minion.attackCooldownBase = (fallbackType.attackCooldownBase || 120) * 1.1;
                }
                this.game.enemies.push(minion);
            }
            return;
        }
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = sourceEnemy.size + 15 + Math.random() * 25; 
            const x = sourceEnemy.x + Math.cos(angle) * radius;
            const y = sourceEnemy.y + Math.sin(angle) * radius;
            const difficulty = this.getDifficultyMultiplier() * 0.6; 

            const minion = new Enemy(
                x, y,
                getRandomInt(baseMinionType.sizeMin, baseMinionType.sizeMax) * 0.7,
                baseMinionType.color,
                baseMinionType.speedBase * 1.2,
                Math.max(1, Math.ceil(baseMinionType.healthBase * difficulty * (this.game.enemyHealthMultiplier || 1))),
                Math.ceil(baseMinionType.xpBase * 0.4),
                Math.max(1, Math.ceil(baseMinionType.damageBase * difficulty * (baseMinionType.isShooter ? 0.6 : 0.9))),
                this.game,
                `Mini ${baseMinionType.name}`, 
                baseMinionType.baseColorHex
            );
            minion.isShooter = baseMinionType.isShooter || false;
            if (minion.isShooter) {
                minion.shootRange = (baseMinionType.shootRange || 200) * 0.8;
                minion.projectileDamage = Math.max(1, Math.ceil((baseMinionType.projectileDamage || 5) * difficulty * 0.7));
                minion.attackCooldownBase = (baseMinionType.attackCooldownBase || 120) * 1.1;
            }
            this.game.enemies.push(minion);
        }
    }

    gainXP(amount, showFloatingText = true) { 
        const finalAmount = Math.ceil(amount * (this.game.xpGainMultiplier || 1));
        this.game.currentXP += finalAmount;
         if (finalAmount > 0 && showFloatingText) { 
            this.game.audioManager.playSFX('xpCollect');
        }
        if (showFloatingText) {
            createFloatingText(`+${finalAmount} XP`, this.game.player.x, this.game.player.y - this.game.player.size, '#3498db', 16, this.game);
        }
        if (!this.isProcessingEndOfRound && this.game.currentXP >= this.game.xpToNextLevel) {
            this.levelUpDuringPlay();
        }
        this.game.ui.updateXPBarUI();
    }

    levelUpDuringPlay() { 
        this.game.level++;
        this.game.currentXP -= this.game.xpToNextLevel;
        if (this.game.currentXP < 0) this.game.currentXP = 0;
        this.game.xpToNextLevel = Math.floor(XP_TO_NEXT_LEVEL_BASE * Math.pow(1.55, this.game.level - 1));

        this.game.audioManager.playSFX('levelUp');
        
        this.game.ui.updateLevelDisplay();
        this.game.ui.updateXPBarUI();
        if (this.game.player) this.game.player.heal(this.game.player.maxHealth * 0.25);
        
        this.game.gamePaused = true; 
        this.game.ui.showLevelUpModal();
    }


     selectUpgrade(upgradeData, isEndOfRoundLevelUp = false) {
        if (upgradeData && typeof upgradeData.apply === 'function') {
            if (upgradeData.isMasterTechnique) {
                if (!this.game.playerMasterTechniques.some(pt => pt.id === upgradeData.id)) {
                    this.game.playerMasterTechniques.push(upgradeData);
                    
                    upgradeData.apply(this.game.player, this.game.playerWeapon); 
                }
            } else {
                
                upgradeData.apply(this.game);
            }
            this.recalculatePlayerStats(); 
        }
        this.game.ui.hideLevelUpModal();
        this.game.ui.updatePlayerPowersDisplay();

        this.game.audioManager.playSFX('modalClose');

        if (!isEndOfRoundLevelUp) { 
            const pauseModalVisible = this.game.ui.pauseModal && this.game.ui.pauseModal.style.display === 'block';
            if (!pauseModalVisible) {
                this.game.gamePaused = false;
            }
        }
    }

    answerQuiz(chosenCategoryKey, correctAnswerCategoryKey, chosenButton) {
        const isCorrect = chosenCategoryKey === correctAnswerCategoryKey;
        this.game.ui.updateQuizFeedback(isCorrect, correctAnswerCategoryKey, chosenButton);

        if (isCorrect) {
            this.game.audioManager.playSFX('quizCorrect');
            const buffKeys = Object.keys(roundConditions).filter(k => roundConditions[k].type === 'buff');
            if (buffKeys.length > 0) {
                const randomBuffKey = buffKeys[getRandomInt(0, buffKeys.length - 1)];
                this.pendingBuff = roundConditions[randomBuffKey];
            }
        } else {
            this.game.audioManager.playSFX('quizIncorrect');
            const debuffKeys = Object.keys(roundConditions).filter(k => roundConditions[k].type === 'debuff');
            if (debuffKeys.length > 0) {
                const randomDebuffKey = debuffKeys[getRandomInt(0, debuffKeys.length - 1)];
                this.pendingDebuff = roundConditions[randomDebuffKey];
            }
        }
    }

    proceedFromQuiz() {
        this.game.audioManager.playSFX('modalClose');
        this.startNewRound(); 
    }

    applyPendingConditions() {
        let statsNeedRecalculation = false;
        if (this.pendingBuff) {
            
            this.game.activeConditions.push({ data: this.pendingBuff, startRound: this.game.currentRound, durationRounds: 1 });
            this.game.ui.showNotification(`BUFF ATIVO: ${this.pendingBuff.name}!`, 3500);
            this.pendingBuff = null;
            statsNeedRecalculation = true;
        }
        if (this.pendingDebuff) {
            
            this.game.activeConditions.push({ data: this.pendingDebuff, startRound: this.game.currentRound, durationRounds: 1 });
            this.game.ui.showNotification(`DEBUFF ATIVO: ${this.pendingDebuff.name}!`, 3500);
            this.pendingDebuff = null;
            statsNeedRecalculation = true;
        }
        if (statsNeedRecalculation) {
            this.recalculatePlayerStats();
        }
    }
    revertExpiredConditions() {
        let statsNeedRecalculation = false;
        for (let i = this.game.activeConditions.length - 1; i >= 0; i--) {
            const cond = this.game.activeConditions[i];
            if (this.game.currentRound >= cond.startRound + cond.durationRounds) {
                
                
                
                if (cond.data.id === "CONTAMINACAO_LEVE" && typeof cond.data.revert === 'function') {
                     cond.data.revert(this.game); 
                }
                this.game.ui.showNotification(`${cond.data.name} terminou.`, 2500);
                this.game.activeConditions.splice(i, 1);
                statsNeedRecalculation = true;
            }
        }
        if (statsNeedRecalculation) {
            this.recalculatePlayerStats();
        }
    }

    getMarketItems(forceRestock = false) {
        if (forceRestock || this.currentMarketStock.length === 0) {
            this.currentMarketStock = [];
            const allPossibleItems = [
                ...permanentMarketUpgrades,
                ...marketMasterTechniques,
                ...marketSeasonings
            ];

            const itemsNotYetPurchased = allPossibleItems.filter(item =>
                !this.game.purchasedMarketItemIds.includes(item.id) &&
                (item.type !== 'technique' || !this.game.playerMasterTechniques.some(pt => pt.id === item.id.replace("market_tech_", "")))
            );

            const shuffled = [...itemsNotYetPurchased].sort(() => 0.5 - Math.random());

            const numItemsToDisplay = 4;
            for (let i = 0; i < Math.min(shuffled.length, numItemsToDisplay); i++) {
                this.currentMarketStock.push(shuffled[i]);
            }
        }
        return this.currentMarketStock;
    }

    purchaseMarketItem(item) {
        if (!item || (this.game.player.qualityPoints || 0) < item.cost || this.game.purchasedMarketItemIds.includes(item.id)) {
            return false;
        }

        this.game.player.qualityPoints -= item.cost;
        this.game.purchasedMarketItemIds.push(item.id);

        if (item.type === 'technique') {
            const originalTechnique = masterTechniques.find(t => t.id === item.id.replace("market_tech_", ""));
            if (originalTechnique) {
                if (!this.game.playerMasterTechniques.some(pt => pt.id === originalTechnique.id)) {
                    this.game.playerMasterTechniques.push(originalTechnique);
                    originalTechnique.apply(this.game.player, this.game.playerWeapon);
                }
            }
        } else { 
            item.apply(this.game);
        }
        
        this.recalculatePlayerStats(); 

        this.game.audioManager.playSFX('marketPurchase')

        this.game.ui.showNotification(`${item.name} adquirido!`, 2500);
        this.game.ui.updatePlayerPowersDisplay();
        this.game.ui.updateAll();
        return true;
    }


    closeMarket() {
        this.game.audioManager.playSFX('modalClose');
        this.currentMarketStock = [];
        this.startNewRound(); 
    }

    triggerGameOver() {
        this.game.gameOver = true;
        this.game.gamePaused = true;
        if (this.game.animationFrameId) {
            cancelAnimationFrame(this.game.animationFrameId);
            this.game.animationFrameId = null;
        }
        this.game.audioManager.stopCurrentMusic(); 
        this.game.audioManager.playMusic('gameOverMusic', false); 
        this.game.ui.showGameOverModal();
    }

    createExplosion(x, y, radius, sourceObject, isEnemyExplosion = false) {
        const explosionColorBase = isEnemyExplosion ? { r: 255, g: 100, b: 0 } : { r: 255, g: 165, b: 0 };
        const duration = 30;
        let finalExplosionDamage = 0; 

        console.log("[CreateExplosion] Called. Radius:", radius, "IsEnemy:", isEnemyExplosion, "Source:", sourceObject);

        if (!isEnemyExplosion && sourceObject instanceof this.game.PlayerProjectile) {
            const proj = sourceObject;
            console.log("[CreateExplosion] Player Projectile. WeaponDmgAtShot:", proj.weaponDamageAtShotTime, "TechBaseDmg:", proj.techniqueExplosionBaseDamage);
            
            
            finalExplosionDamage = proj.weaponDamageAtShotTime + proj.techniqueExplosionBaseDamage;
            
            
            const playerDamageMultiplier = this.game.player.damageOutputMultiplier || 1;
            console.log("[CreateExplosion] PlayerDamageMultiplier:", playerDamageMultiplier);
            finalExplosionDamage *= playerDamageMultiplier;
            
        } else if (isEnemyExplosion && sourceObject instanceof this.game.EnemyProjectile) {
            const proj = sourceObject;
            finalExplosionDamage = proj.explosionDamage; 
        } else if (isEnemyExplosion && sourceObject instanceof Enemy && sourceObject.explosionDamageOnDeath) {
             finalExplosionDamage = sourceObject.explosionDamageOnDeath;
        } else {
            console.warn("[CreateExplosion] Called with unexpected sourceObject or no clear damage path. Attempting fallback.", sourceObject);
            if (typeof sourceObject === 'number') {
                finalExplosionDamage = sourceObject;
            } else if (sourceObject && typeof sourceObject.damage === 'number') {
                finalExplosionDamage = sourceObject.damage;
            } else if (sourceObject && typeof sourceObject.weaponDamageAtShotTime === 'number') { 
                finalExplosionDamage = sourceObject.weaponDamageAtShotTime + (sourceObject.techniqueExplosionBaseDamage || 0);
            }
        }
        
        finalExplosionDamage = Math.round(finalExplosionDamage);
        console.log("[CreateExplosion] Final Calculated Explosion Damage:", finalExplosionDamage);

        if (finalExplosionDamage <= 0 && radius <= 0) {
            console.log("[CreateExplosion] Aborted: No damage and no radius.");
            return; 
        }
        if (radius <=0 && finalExplosionDamage > 0) {
            console.warn("[CreateExplosion] Explosion has damage but no radius. Will not hit area targets.");
            
        }


        
        this.game.floatingTexts.push({
            type: 'explosion_effect', 
            x: x,
            y: y,
            maxRadius: radius,
            currentRadius: 0,
            life: duration,
            duration: duration,
            colorBase: explosionColorBase,
            opacity: 1,
            update: function() {
                this.life--;
                this.currentRadius = this.maxRadius * (1 - Math.pow(this.life / this.duration, 2)); 
                this.opacity = Math.max(0, (this.life / this.duration)); 
            },
            draw: function(ctx) {
                if (this.opacity <= 0) return;

                const numCircles = 3; 
                for (let i = 0; i < numCircles; i++) {
                    const rFraction = (i + 1) / numCircles;
                    const currentCircleRadius = this.currentRadius * rFraction * (1 + (1-this.opacity)*0.3) ; 
                    const varyingOpacity = this.opacity * (1 - (i * 0.2)); 

                    const gVal = Math.max(0, this.colorBase.g - (1 - this.opacity) * (this.colorBase.g - 50)); 
                    const bVal = Math.max(0, this.colorBase.b - (1 - this.opacity) * this.colorBase.b);

                    ctx.beginPath();
                    ctx.arc(this.x, this.y, currentCircleRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.colorBase.r}, ${Math.floor(gVal)}, ${Math.floor(bVal)}, ${varyingOpacity * 0.5})`; 
                    ctx.fill();
                }
                if (this.life > this.duration * 0.7) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.maxRadius * 0.3 * (this.life / this.duration), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 150, ${this.opacity * 0.8})`; 
                    ctx.fill();
                }
            }
        });
        
        
        if (finalExplosionDamage > 0 && radius > 0) { 
            if (isEnemyExplosion) {
                if (distance(x, y, this.game.player.x, this.game.player.y) < radius + this.game.player.size / 2) {
                    console.log("[CreateExplosion] Enemy explosion hitting player for", finalExplosionDamage);
                    this.game.player.takeDamage(finalExplosionDamage);
                    createFloatingText(`-${finalExplosionDamage}💥`, this.game.player.x, this.game.player.y - 10, '#FF6347', 16, this.game);
                }
            } else { 
                let enemiesHitByExplosion = 0;
                this.game.enemies.forEach(enemy => {
                    if (enemy.health <= 0) return;
                    
                    
                    if (distance(x, y, enemy.x, enemy.y) < radius + enemy.size / 2) { 
                        console.log("[CreateExplosion] Player explosion hitting enemy", enemy.name, "for", finalExplosionDamage);
                        enemy.takeDamage(finalExplosionDamage, null, 'EXPLOSION'); 
                        enemiesHitByExplosion++;
                    }
                });
                if (enemiesHitByExplosion > 0) {
                    console.log("[CreateExplosion] Player explosion hit", enemiesHitByExplosion, "enemies.");
                } else {
                    console.log("[CreateExplosion] Player explosion hit NO enemies in range.");
                }
            }
        } else if (finalExplosionDamage > 0 && radius <= 0) {
             console.log("[CreateExplosion] Explosion has damage but no radius, no area damage applied.");
        }
    
        this.game.audioManager.playSFX('explosion');
    }
    createVisualPulse(x, y, radius, color, durationFrames) {
        this.game.floatingTexts.push({
            x, y, radius, color, maxRadius: radius, currentRadius: 0,
            opacity: 1, life: durationFrames, duration: durationFrames,
            update: function() {
                this.life--;
                this.currentRadius = this.maxRadius * (1 - (this.life / this.duration)); 
                this.opacity = Math.max(0, (this.life / this.duration) * 0.7); 
            },
            draw: function(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
                ctx.strokeStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${this.opacity})`); 
                ctx.lineWidth = 3 + (1 - this.opacity) * 5; 
                ctx.stroke();
            }
        });
    }
}