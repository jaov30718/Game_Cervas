
import { getRandomInt, distance, createFloatingText, hexToRgb, applyColorTint, lightenColor, darkenColor } from './utils.js';
import { XP_ORB_VALUE_BASE, enemyAfixes, ENEMY_MAX_SPEED_MULTIPLIER, MAX_ENEMY_MODIFIERS, BOSS_ROUND_INTERVAL, enemyTypes as configEnemyTypes } from './config.js'; 
import { EnemyProjectile } from './projectile.js';
 

export class Enemy {
    constructor(x, y, size, color, speed, health, xpValue, damage, game, name = "Contaminante", baseColorHex = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size;
        this.originalColor = color;
        this.baseColorHex = baseColorHex || color;
        this.color = color;
        this.baseSpeed = speed;
        this.currentSpeed = speed;
        this.maxHealth = health;
        this.health = health;
        this.xpValue = xpValue;
        this.damage = damage;
        this.name = name;
        this.originalName = name;
        this.id = Math.random();

        this.isChampion = false;
        this.isBoss = false;
        this.baseEnemyData = null; 

        this.isShooter = false;
        this.attackCooldown = 0;
        this.attackCooldownBase = 120;
        this.shootRange = 200;
        this.projectileDamage = 5;
        this.projectileSpeed = 3;
        this.projectileColor = '#FF6347';
        this.projectileSize = 5;
        this.projectileLifeTime = 240;
        this.projectilePiercing = 0; 
        this.projectilesPerShot = 1; 
        this.spreadAngle = Math.PI / 36; 

        this.afixes = [];
        this.shield = 0;
        this.hasShieldEffect = false;
        this.damageReduction = 0; 
        
    }

    applyAfixes(round) {
        const availableAfixes = Object.values(enemyAfixes);
        let currentTierAllowed = 1;
        if (round > 5) currentTierAllowed = 2;
        if (round > 10) currentTierAllowed = 3;
        if (this.isChampion && round > 3) currentTierAllowed = Math.max(currentTierAllowed, 2);
        if (this.isChampion && round > 7) currentTierAllowed = Math.max(currentTierAllowed, 3);

        let modifierCount = 0;
        let baseChance = Math.min(0.6, (this.isChampion ? 0.15 : 0.05) + (round * this.game.gameLogic.enemyModifierChanceIncrement));

        this.originalName = this.name; 

        let afixPrefix = "";
        for (let i = 0; i < MAX_ENEMY_MODIFIERS; i++) {
            if (this.afixes.length >= MAX_ENEMY_MODIFIERS) break;
            if (Math.random() < baseChance / (modifierCount + 1.5)) {
                const possible = availableAfixes.filter(afx => afx.tier <= currentTierAllowed && !this.afixes.some(a => a.name === afx.name));
                if (possible.length > 0) {
                    const afixData = possible[getRandomInt(0, possible.length - 1)];
                    this.afixes.push(afixData);
                    if (afixData.apply) afixData.apply(this);
                    if (afixData.colorTint) this.color = applyColorTint(this.baseColorHex, afixData.colorTint);
                    afixPrefix += afixData.name + ", ";
                    modifierCount++;
                }
            }
        }
        if (afixPrefix) {
            this.name = `${afixPrefix.slice(0, -2)} ${this.originalName}`;
        }
    }


    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size / 1.5);
        ctx.lineTo(this.x - this.size / 2, this.y + this.size / 3);
        ctx.lineTo(this.x + this.size / 2, this.y + this.size / 3);
        ctx.closePath();
        ctx.fill();

        if (this.isShooter) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.hasShieldEffect && this.shield > 0) {
            ctx.strokeStyle = 'rgba(100, 180, 255, 0.7)';
            ctx.lineWidth = 2 + (this.shield / (this.maxHealth * 0.3)) * 3; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    keepInBounds() { 
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;
        const margin = this.size * 1.5; 

        
        if (this.x < -margin * 2) this.x = -this.size / 2;
        else if (this.x > canvasWidth + margin * 2) this.x = canvasWidth + this.size / 2;

        if (this.y < -margin * 2) this.y = -this.size / 2;
        else if (this.y > canvasHeight + margin * 2) this.y = canvasHeight + this.size / 2;

        
        
        this.x = Math.max(-this.size * 2, Math.min(canvasWidth + this.size * 2, this.x));
        this.y = Math.max(-this.size * 2, Math.min(canvasHeight + this.size * 2, this.y));
    }

    update() {
    
        if (!this.game.player || this.health <= 0) return;

        this.afixes.forEach(afix => {
            if (afix.updateEffect) afix.updateEffect(this, this.game);
        });

        const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
        const distToPlayer = distance(this.x, this.y, this.game.player.x, this.game.player.y);

        let targetSpeed = this.baseSpeed * Math.min(ENEMY_MAX_SPEED_MULTIPLIER, 1 + (this.game.currentRound - 1) * 0.025);

        
        const canvasWidth = this.game.canvas.width;
        const canvasHeight = this.game.canvas.height;
        
        const shootingVisibilityBuffer = this.size * 3; 
        const canBeSeenToShoot = 
            this.x > -shootingVisibilityBuffer && 
            this.x < canvasWidth + shootingVisibilityBuffer &&
            this.y > -shootingVisibilityBuffer && 
            this.y < canvasHeight + shootingVisibilityBuffer;

        if (this.isShooter && canBeSeenToShoot) { 
            if (distToPlayer <= this.shootRange) {
                targetSpeed *= 0.15; 
                if (this.attackCooldown <= 0) {
                    this.shoot(angleToPlayer);
                    
                    
                    
                    
                    
                    if (!(this.isChampion && this.championData && this.championData.name === "Vigia Fúngico" && this.isChargingShot)) {
                         this.attackCooldown = Math.max(20, this.attackCooldownBase * (1 - (this.game.currentRound - 1) * 0.02));
                    }
                }
            }
        }
        this.currentSpeed = targetSpeed;

        const isOffScreenX = this.x < 0 || this.x > canvasWidth;
        const isOffScreenY = this.y < 0 || this.y > canvasHeight;

        if (isOffScreenX || isOffScreenY) {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const targetX = (distToPlayer > Math.min(canvasWidth, canvasHeight) * 0.6 && (isOffScreenX || isOffScreenY)) ? centerX : this.game.player.x;
            const targetY = (distToPlayer > Math.min(canvasWidth, canvasHeight) * 0.6 && (isOffScreenX || isOffScreenY)) ? centerY : this.game.player.y;
            const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
            
            this.x += Math.cos(angleToTarget) * this.currentSpeed;
            this.y += Math.sin(angleToTarget) * this.currentSpeed;
        } else {
            if (!this.isShooter || distToPlayer > this.size * 1.2 || distToPlayer > this.shootRange * 0.8 || (this.isChampion && this.isChargingShot)) { 
                 this.x += Math.cos(angleToPlayer) * this.currentSpeed;
                 this.y += Math.sin(angleToPlayer) * this.currentSpeed;
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        this.keepInBounds();
    }

    
    shoot(angle) { 
        if (!this.game.player) return;

        if (this.isBoss) {
            this.game.audioManager.playSFX('bossShoot');
        } else {
            this.game.audioManager.playSFX('enemyShoot');
        }

        const numProjectiles = this.projectilesPerShot || 1; 
        const spread = this.spreadAngle || Math.PI / 36;   

        for (let i = 0; i < numProjectiles; i++) {
            let angleOffset = 0;
            if (numProjectiles > 1) {
                angleOffset = (i - (numProjectiles - 1) / 2) * spread;
            }
            
            const proj = new EnemyProjectile(
                this.x, this.y,
                this.projectileSize, this.projectileColor,
                this.projectileSpeed * (1 + (this.game.currentRound - 1) * 0.015),
                angle + angleOffset, 
                Math.ceil(this.projectileDamage * this.game.gameLogic.getDifficultyMultiplier()),
                this.game, 
                this.projectileLifeTime,
                this.projectilePiercing
                
                
            );
            this.game.enemyProjectiles.push(proj);
        }
    }

    takeDamage(amount, projectile = null, damageSourceType = null) {
        let actualAmount = amount;
        this.afixes.forEach(afix => {
            if (afix.takeDamageEffect) actualAmount = afix.takeDamageEffect(this, actualAmount, projectile);
        });

        if (actualAmount <= 0 && amount > 0) { 
            
            if (this.shield <= 0 && this.hasShieldEffect) this.hasShieldEffect = false; 
            return false; 
        }
        if (this.shield <= 0 && this.hasShieldEffect) this.hasShieldEffect = false;

        if (this.isBoss) {
            this.game.audioManager.playSFX('bossHit');
        } else {
            this.game.audioManager.playSFX('enemyHit');
        }


        this.health -= actualAmount;
        createFloatingText(`-${Math.round(actualAmount)}`, this.x, this.y, '#f1c40f', 12, this.game);

        if (this.health <= 0) {
            this.health = 0; 
            this.afixes.forEach(afix => {
                if (afix.onDeath) afix.onDeath(this, this.game.gameLogic);
            });

            if (this.isBoss) {
                this.game.audioManager.playSFX('bossDeath');
            } else {
                this.game.audioManager.playSFX('enemyDeath');
            }

            const xpOrbValue = Math.ceil(this.xpValue * (this.game.xpGainMultiplier || 1) * (1 + (this.game.currentRound - 1) * 0.06));
            this.game.xpOrbs.push({
                x: this.x, y: this.y, size: 5 + Math.log(xpOrbValue + 1), color: 'yellow', value: xpOrbValue,
                collectionSpeed: 4,
                draw: function (ctx) { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); },
                update: function (player, gameRef) {
                    if (!player) return;
                    const d = distance(this.x, this.y, player.x, player.y);
                    if (d < player.xpCollectionRadius) { const a = Math.atan2(player.y - this.y, player.x - this.x); this.x += Math.cos(a) * this.collectionSpeed; this.y += Math.sin(a) * this.collectionSpeed; }
                }
            });

            let qualityPointsEarned = 0;
            if (this.isBoss) qualityPointsEarned = (75 + this.afixes.length * 15) + (this.game.bonusQualityPointsPerElite || 0);
            else if (this.isChampion) qualityPointsEarned = (20 + this.afixes.length * 7) + (this.game.bonusQualityPointsPerElite || 0);
            else qualityPointsEarned = Math.ceil(this.xpValue / 4 + this.afixes.length * 2);
            
            
            if (this.game.player && this.game.player.nutmegEffectChance && Math.random() < this.game.player.nutmegEffectChance && !this.isBoss && !this.isChampion) {
                qualityPointsEarned += 1;
                createFloatingText(`+1 PQ (Noz)!`, this.x, this.y + 25, '#D2B48C', 12, this.game);
            }


            this.game.player.qualityPoints = (this.game.player.qualityPoints || 0) + qualityPointsEarned;
            if (qualityPointsEarned > 0) {
                createFloatingText(`+${qualityPointsEarned} PQ`, this.x, this.y + 15, '#DAA520', 14, this.game);
            }
            this.game.ui.updateAll(); 
            
            return true; 
        }
        return false; 
    }
    handleDamageDealtToPlayer(damageDealt) {
        this.afixes.forEach(afix => {
            if (afix.onDamageDealtToPlayer) {
                afix.onDamageDealtToPlayer(this, damageDealt);
            }
        });
    }

    applySlow(duration, factor) {
        if (this.isSlowed) return; 

        this.isSlowed = true;
        const originalSpeed = this.currentSpeed; 
        this.currentSpeed *= factor;

        
        
        

        setTimeout(() => {
            this.currentSpeed = originalSpeed; 
            this.isSlowed = false;
            
        }, duration * (1000/60)); 
    }
}

export class ChampionEnemy extends Enemy {
    constructor(x, y, baseEnemyData, championData, game) {
        
        const difficulty = game.gameLogic.getDifficultyMultiplier();
        const round = game.currentRound;
        const championName = championData.name || `Campeão ${baseEnemyData.name}`;
        const size = getRandomInt(baseEnemyData.sizeMin, baseEnemyData.sizeMax) * (championData.sizeMultiplier || 1.35);
        let speed = baseEnemyData.speedBase * (championData.speedMultiplier || 1.15);
        let health = baseEnemyData.healthBase * difficulty * (championData.healthMultiplier || 3.0) * (1 + (round - 1) * 0.075);
        let xpValue = baseEnemyData.xpBase * (championData.xpMultiplier || 4.5) * (1 + (round - 1) * 0.055);
        let damage = baseEnemyData.damageBase * difficulty * (championData.damageMultiplier || 1.7);

        
        super(x, y, size, championData.color || baseEnemyData.color, speed, health, xpValue, damage, game, championName, championData.baseColorHex || baseEnemyData.baseColorHex);
        
        
        this.isChampion = true;
        this.battleCry = championData.cry || "IMPARÁVEL!";
        this.championBaseName = championName; 
        this.baseEnemyData = baseEnemyData; 
        this.championData = championData;   

        
        this.isShooter = championData.isShooter !== undefined ? championData.isShooter : baseEnemyData.isShooter;
        if (this.isShooter) {
            this.shootRange = (championData.shootRange || baseEnemyData.shootRange || 200) * (1 + (round - 1) * 0.01);
            this.projectileDamage = Math.ceil((championData.projectileDamage || baseEnemyData.projectileDamage || 5) * difficulty * 1.15);
            this.attackCooldownBase = Math.max(25, (championData.attackCooldownBase || baseEnemyData.attackCooldownBase || 120) * 0.85);
            this.projectileSpeed = (championData.projectileSpeed || baseEnemyData.projectileSpeed || 3) * 1.15;
            this.projectileColor = championData.projectileColor || baseEnemyData.projectileColor || '#FF4500';
            this.projectileSize = (championData.projectileSize || baseEnemyData.projectileSize || 6);
            this.projectileLifeTime = (championData.projectileLifeTime || baseEnemyData.projectileLifeTime || 240);
            this.projectilePiercing = championData.projectilePiercing || baseEnemyData.projectilePiercing || 0;
            
            
            this.projectilesPerShot = championData.projectilesPerShotChampion || this.projectilesPerShot; 
            this.spreadAngle = championData.spreadAngleChampion || this.spreadAngle; 
        }

        
        this.lastSplinterHealth = this.maxHealth; 
        this.isChargingShot = false; 
        this.chargeShotTimer = 0; 

        this.applyAfixes(round);

        createFloatingText(this.battleCry, this.x, this.y - this.size - 10, this.color, 18, this.game);
    }
    update() {
        
        
        
        
        

        
        
        

        
        

        
        if (this.championData.name === "Vigia Fúngico" && this.championData.hasChargedShot) {
            if (this.isChargingShot) {
                this.chargeShotTimer++;
                this.currentSpeed = this.baseSpeed * 0.1; 
                if (this.chargeShotTimer >= this.championData.chargeShotDuration) {
                    
                    
                    const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
                    this.shoot(angleToPlayer); 
                    
                }
                
                
                
            }
            
        }
        
        
        
        super.update();


        
        if (this.championData.name === "Aglomerado Pútrido" && this.championData.canSplinterOnDamage) {
            const healthLostSinceLastSplinter = this.lastSplinterHealth - this.health;
            const splinterThresholdAbsolute = this.maxHealth * this.championData.splinterThresholdPercent;
            if (healthLostSinceLastSplinter >= splinterThresholdAbsolute && this.health > 0) {
                this.game.gameLogic.spawnMinionsAround(this, this.championData.splinterType, this.championData.splinterCount);
                this.lastSplinterHealth = this.health;
                createFloatingText("FRAGMENTOS!", this.x, this.y - this.size, this.color, 16, this.game);
            }
        }
    }
    
    shoot(angle) { 
        if (this.championData.name === "Vigia Fúngico" && this.championData.hasChargedShot) {
            if (this.isChargingShot && this.chargeShotTimer >= this.championData.chargeShotDuration) {
                
                const proj = new EnemyProjectile(
                    this.x, this.y,
                    this.projectileSize * 1.5, 
                    this.projectileColor,
                    this.projectileSpeed * 1.2, 
                    angle, 
                    Math.ceil(this.projectileDamage * 1.8 * this.game.gameLogic.getDifficultyMultiplier()),
                    this.game, 
                    this.projectileLifeTime,
                    this.projectilePiercing + 1 
                );
                this.game.enemyProjectiles.push(proj);
                this.game.audioManager.playSFX('enemyShoot'); 

                this.isChargingShot = false;
                this.chargeShotTimer = 0;
                this.attackCooldown = this.attackCooldownBase; 
                this.currentSpeed = this.baseSpeed; 
                return; 
            } else if (!this.isChargingShot && this.attackCooldown <=0) { 
                this.isChargingShot = true;
                this.chargeShotTimer = 0;
                
                
                
                this.attackCooldown = this.championData.chargeShotDuration + 30; 
                createFloatingText("CARREGANDO...", this.x, this.y - this.size, this.projectileColor, 16, this.game);
                return; 
            }
            
            
            
            if(this.attackCooldown > 0 && !this.isChargingShot) return;
        }

        
        
        super.shoot(angle);
    }


    draw(ctx) {
        
        
                          

        ctx.fillStyle = this.color;
        ctx.strokeStyle = lightenColor(this.baseColorHex, 30); 
        ctx.lineWidth = 2;

        if (this.name === "Aglomerado Pútrido") {
            const coreRadius = this.size / 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            const numParts = 5 + Math.floor(this.health / this.maxHealth * 3); 
            for (let i = 0; i < numParts; i++) {
                const angle = (i / numParts) * Math.PI * 2 + this.game.gameTime * 0.02 * (i % 2 === 0 ? 1 : -1);
                const distFromCenter = coreRadius * (0.6 + Math.random() * 0.3);
                const partRadius = this.size * (0.1 + Math.random() * 0.1);
                
                const px = this.x + Math.cos(angle) * distFromCenter;
                const py = this.y + Math.sin(angle) * distFromCenter;
                
                
                const componentType = configEnemyTypes.regular[i % configEnemyTypes.regular.length];
                ctx.fillStyle = componentType.color;
                ctx.strokeStyle = lightenColor(componentType.baseColorHex, 20);

                ctx.beginPath();
                ctx.arc(px, py, partRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        } else if (this.name === "Ceifador Bacterial") {
            const bodyWidth = this.size * 0.8;
            const bodyHeight = this.size;
            
            
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            
            const numClaws = 2; 
            for (let i = 0; i < numClaws; i++) {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                const baseAngle = (i === 0 ? -1 : 1) * (Math.PI / 3); 
                const animAngle = Math.sin(this.game.gameTime * 0.07 + i * Math.PI) * 0.3; 
                ctx.rotate(baseAngle + animAngle);

                const clawLength = this.size * 0.7;
                const clawWidth = this.size * 0.25;
                
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, clawLength * 0.6);
                ctx.lineWidth = clawWidth * 0.7;
                ctx.strokeStyle = this.color; 
                ctx.stroke();
                
                
                ctx.fillStyle = lightenColor(this.baseColorHex, -30); 
                ctx.beginPath();
                ctx.moveTo(0, clawLength * 0.5);
                ctx.lineTo(-clawWidth / 2, clawLength);
                ctx.lineTo(clawWidth / 2, clawLength);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            }

        } else if (this.name === "Vigia Fúngico") {
            const stalkHeight = this.size * 0.8;
            const headRadius = this.size / 2.5;

            
            ctx.fillStyle = darkenColor(this.baseColorHex, 20);
            ctx.beginPath();
            ctx.rect(this.x - headRadius * 0.3, this.y, headRadius * 0.6, stalkHeight);
            ctx.fill();
            ctx.stroke(); 

            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, headRadius, 0, Math.PI * 2); 
            ctx.fill();
            ctx.stroke();

            
            const pupilRadius = headRadius * 0.4;
            const maxPupilOffset = headRadius * 0.3;
            const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
            const pupilX = this.x + Math.cos(angleToPlayer) * maxPupilOffset;
            const pupilY = this.y + Math.sin(angleToPlayer) * maxPupilOffset;
            
            ctx.fillStyle = "black";
            if (this.isChargingShot) {
                
                const chargeProgress = this.chargeShotTimer / this.championData.chargeShotDuration;
                const pulseSize = pupilRadius * (1 + Math.sin(chargeProgress * Math.PI * 4) * 0.2); 
                ctx.fillStyle = `rgba(255, ${100 * (1-chargeProgress)}, 0, 1)`; 
                ctx.beginPath();
                ctx.arc(pupilX, pupilY, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2);
                ctx.fill();
            }


        } else {
            
            super.draw(ctx);
        }

        
        ctx.fillStyle = '#f0f0f0';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const afixPart = this.name.replace(this.championBaseName, "").trim().replace(/,$/, "");
        ctx.fillText(this.championBaseName.trim(), this.x, this.y - this.size - 15);
        if (afixPart) {
            ctx.font = 'italic 10px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(afixPart, this.x, this.y - this.size - 5);
        }
        ctx.textAlign = 'start';
    }
}



export class BossEnemy extends Enemy {
    constructor(x, y, bossConfig, game) {
        const initialPhase = bossConfig.phases[0];
        const difficulty = game.gameLogic.getDifficultyMultiplier();
        
        let totalBossHealth = (bossConfig.totalHealthBase || 500) * difficulty * (1 + (game.currentRound / BOSS_ROUND_INTERVAL - 1) * 0.35); 

        super(x, y, initialPhase.size, initialPhase.color, initialPhase.speed, totalBossHealth, 0, initialPhase.collisionDamage, game, bossConfig.name, bossConfig.baseColorHex);
        this.isBoss = true;
        this.bossConfig = bossConfig;
        this.currentPhaseIndex = -1; 
        this.totalMaxHealth = totalBossHealth; 
        this.health = this.totalMaxHealth;    
        this.abilityCooldowns = {};
        this.activeAbilities = [];
        this.bossBaseName = bossConfig.name;

        this.changePhase(0); 

        this.game.ui.showNotification(`CHEFE: ${this.name} APARECEU! "${this.bossConfig.entryCry}"`, 6000);
        createFloatingText(this.bossConfig.entryCry, this.x, this.y - this.size - 20, this.color, 22, this.game);
    }

    changePhase(phaseIndex) {
        if (phaseIndex >= this.bossConfig.phases.length || phaseIndex === this.currentPhaseIndex) return;

        this.currentPhaseIndex = phaseIndex;
        const phaseData = this.bossConfig.phases[phaseIndex];

        this.name = `${this.bossBaseName}${phaseData.nameSuffix || ""}`;
        this.size = phaseData.size;
        this.color = phaseData.color;
        this.baseSpeed = phaseData.speed * (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL - 1) * 0.05);
        this.currentSpeed = this.baseSpeed;

        const difficulty = this.game.gameLogic.getDifficultyMultiplier();
        const bossRoundMultiplier = (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL - 1) * 0.1);

        this.damage = Math.ceil(phaseData.collisionDamage * difficulty * (phaseData.damageMultiplier || 1) * bossRoundMultiplier);
        this.xpValue += phaseData.xp; 

        this.isShooter = phaseData.isShooter || false;
        if (this.isShooter) {
            this.shootRange = phaseData.shootRange;
            this.projectileDamage = Math.ceil(phaseData.projectileDamage * difficulty * (phaseData.damageMultiplier || 1) * bossRoundMultiplier);
            this.attackCooldownBase = Math.max(20, phaseData.attackCooldownBase * (1 - (this.game.currentRound / BOSS_ROUND_INTERVAL - 1) * 0.05));
            this.projectileSpeed = phaseData.projectileSpeed * (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL - 1) * 0.05);
            this.projectileColor = phaseData.projectileColor;
            this.projectileSize = phaseData.projectileSize;
            this.projectileLifeTime = phaseData.projectileLifeTime;
        }

        this.activeAbilities = JSON.parse(JSON.stringify(phaseData.abilities || [])); 
        this.abilityCooldowns = {}; 

        createFloatingText(`Fase: ${phaseData.nameSuffix || "Inicial"}!`, this.x, this.y - this.size - 10, this.color, 20, this.game);
        this.game.ui.showNotification(`${this.name} entrou em uma nova fase!`, 3000);
    }

    update() {
        if (!this.game.player || this.health <= 0) return;

        const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
        const distToPlayer = distance(this.x, this.y, this.game.player.x, this.game.player.y);
        
        let effectiveSpeed = this.currentSpeed;
        let isCharging = this.abilityCooldowns["Investida Destrutiva"] > (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.cooldown || 400) - (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.duration || 90) ||
                         this.abilityCooldowns["Investida Selvagem"] > (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.cooldown || 500) - (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.duration || 60) ||
                         this.abilityCooldowns["Investida Corrompida"] > (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.cooldown || 450) - (this.bossConfig.phases[this.currentPhaseIndex]?.abilities?.find(a => a.type === "charge_attack")?.duration || 75);


        if (!isCharging && this.isShooter && distToPlayer <= this.shootRange * 0.9) { 
            effectiveSpeed *= 0.3; 
        }
        
        this.x += Math.cos(angleToPlayer) * effectiveSpeed;
        this.y += Math.sin(angleToPlayer) * effectiveSpeed;

        if (this.isShooter && this.attackCooldown <= 0 && !isCharging) {
            const isUsingShootingAbility = Object.entries(this.abilityCooldowns).some(([key, cd]) => {
                const ability = this.activeAbilities.find(ab => (ab.name || ab.type) === key);
                return cd > 0 && ability && (ability.type.includes("shoot") || ability.type.includes("volley"));
            });

            if(!isUsingShootingAbility){
                this.shoot(angleToPlayer); 
                this.attackCooldown = this.attackCooldownBase;
            }
        }
        if(this.attackCooldown > 0) this.attackCooldown--;

        
        const currentHealthPercentage = this.health / this.totalMaxHealth;
        const nextPhaseIndex = this.currentPhaseIndex + 1;
        if (nextPhaseIndex < this.bossConfig.phases.length) {
            
            if (currentHealthPercentage <= this.bossConfig.phases[this.currentPhaseIndex].healthPercentThreshold) {
                this.changePhase(nextPhaseIndex);
            }
        }

        
        this.activeAbilities.forEach(ability => {
            const cooldownKey = ability.name || ability.type; 
            if (!this.abilityCooldowns[cooldownKey] || this.abilityCooldowns[cooldownKey] <= 0) {
                if (Math.random() < (ability.chance || 0.01)) { 
                    this.useAbility(ability);
                    this.abilityCooldowns[cooldownKey] = ability.cooldown || 300; 
                }
            } else {
                this.abilityCooldowns[cooldownKey]--; 
            }
        });
        this.keepInBounds();
    }

    useAbility(ability) {
        if (!this.game.player) return;
        createFloatingText(`${ability.name || ability.type.toUpperCase()}!`, this.x, this.y - this.size, this.color, 18, this.game);
        this.game.audioManager.playSFX('bossAbility');
        const difficulty = this.game.gameLogic.getDifficultyMultiplier();
        const phaseDamageMultiplier = (this.bossConfig.phases[this.currentPhaseIndex].damageMultiplier || 1) * (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL -1) * 0.1);
        const bossRoundSpeedMultiplier = (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL -1) * 0.05);

        switch (ability.type) {
            case "spawn_minions":
                if (ability.isChampionMinion) {
                    this.game.gameLogic.spawnSpecificChampionAround(this, ability.minionType, ability.count);
                } else {
                    this.game.gameLogic.spawnMinionsAround(this, ability.minionType, ability.count);
                }
                break;
            case "charge_attack":
                const originalSpeed = this.currentSpeed;
                this.currentSpeed = this.baseSpeed * (ability.speedMultiplier || 3) * bossRoundSpeedMultiplier; 
                createFloatingText("INVESTIDA!", this.x, this.y - this.size - 15, '#FFD700', 20, this.game);
                
                
                
                
                
                setTimeout(() => { 
                    
                    
                    if (this.currentSpeed > this.baseSpeed * bossRoundSpeedMultiplier * 1.5) { 
                       this.currentSpeed = this.baseSpeed * bossRoundSpeedMultiplier;
                    }
                }, (ability.duration || 90) * (1000 / 60)); 
                break;
            case "area_pulse_damage":
                const pulseRadius = ability.radius;
                if (distance(this.x, this.y, this.game.player.x, this.game.player.y) < pulseRadius + this.game.player.size / 2) {
                    const pulseDamage = Math.ceil(ability.damage * difficulty * phaseDamageMultiplier);
                    this.game.player.takeDamage(pulseDamage);
                    if (ability.onHitPlayerEffect && typeof ability.onHitPlayerEffect === 'function') {
                        ability.onHitPlayerEffect(this.game.player, this.game);
                    }
                }
                this.game.gameLogic.createVisualPulse(this.x, this.y, pulseRadius, ability.pulseColor || this.color + "55", 30);
                break;
            case "shoot_volley":
            case "shoot_volley_pattern": 
                const baseAngleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
                let projectilesToShoot = [];

                if (ability.pattern === "spiral") {
                    const numProjectiles = ability.numProjectiles || 20;
                    let angleIncrement = (Math.PI * 2) / numProjectiles;
                    if (ability.spiralDirection === "random" && Math.random() < 0.5) angleIncrement *= -1;
                    
                    
                    for (let i = 0; i < numProjectiles; i++) {
                        const angle = (this.game.gameTime * 0.05 * (ability.spiralSpeed || 1)) + (i * angleIncrement); 
                        projectilesToShoot.push({ angle });
                    }
                } else if (ability.pattern === "radial_barrage") {
                    const numProjectiles = ability.numProjectiles || 36;
                    const angleIncrement = (Math.PI * 2) / numProjectiles;
                    for (let i = 0; i < numProjectiles; i++) {
                        projectilesToShoot.push({ angle: i * angleIncrement });
                    }
                } else if (ability.pattern === "burst_explosive") { 
                    const volleyCount = ability.numProjectiles || ability.count || 5;
                    const spreadAngle = ability.spread || Math.PI / 8;
                    for (let i = 0; i < volleyCount; i++) {
                        const angleOffset = (volleyCount > 1) ? (i - (volleyCount - 1) / 2) * (spreadAngle / Math.max(1, volleyCount - 1)) : 0;
                        projectilesToShoot.push({ angle: baseAngleToPlayer + angleOffset });
                    }
                } else { 
                    const volleyCount = ability.count || 1;
                    const spreadAngle = ability.spread || 0;
                    for (let i = 0; i < volleyCount; i++) {
                        const angleOffset = (volleyCount > 1) ? (i - (volleyCount - 1) / 2) * (spreadAngle / Math.max(1, volleyCount - 1)) : 0;
                        projectilesToShoot.push({ angle: baseAngleToPlayer + angleOffset });
                    }
                }

                projectilesToShoot.forEach(pInfo => {
                    const proj = new EnemyProjectile(
                        this.x, this.y,
                        ability.projectileSize || this.projectileSize || 8,
                        ability.projectileColor || this.projectileColor || '#800080',
                        (ability.projectileSpeed || this.projectileSpeed || 3) * bossRoundSpeedMultiplier,
                        pInfo.angle,
                        Math.ceil((ability.projectileDamage || this.projectileDamage || 10) * difficulty * phaseDamageMultiplier),
                        this.game,
                        ability.projectileLifeTime || this.projectileLifeTime || 240,
                        ability.projectilePiercing || 0, 
                        ability.projectileExplosionRadius || 0, 
                        Math.ceil((ability.projectileExplosionDamage || 0) * difficulty * phaseDamageMultiplier) 
                    );
                    this.game.enemyProjectiles.push(proj);
                });
                break;
        }
    }

    takeDamage(amount, projectile = null, damageSourceType = null) {
        if (this.health <= 0) return true; 

        this.game.audioManager.playSFX('bossHit');
        this.health -= amount;
        createFloatingText(`-${Math.round(amount)}`, this.x, this.y, '#ff6347', 14, this.game);

        if (this.health <= 0) {
            this.health = 0;
            createFloatingText(this.bossConfig.deathCry || "DERROTADO!", this.x, this.y - this.size, this.color, 28, this.game);
            this.game.ui.showNotification(`CHEFE ${this.name} DERROTADO!`, 5000);
            this.game.audioManager.playSFX('bossDeath');
            
            
            this.game.gameLogic.setBossAsDefeated();
            

            const totalXpFromBoss = this.bossConfig.phases.reduce((sum, phase) => sum + (phase.xp || 0), 0);
            this.game.gameLogic.gainXP(totalXpFromBoss * (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL -1) * 0.2));
            
            const qualityPointsFromBoss = (100 + this.bossConfig.phases.length * 25) * (1 + (this.game.currentRound / BOSS_ROUND_INTERVAL -1) * 0.15) + (this.game.bonusQualityPointsPerElite || 0);
            this.game.player.qualityPoints = (this.game.player.qualityPoints || 0) + Math.ceil(qualityPointsFromBoss);
            createFloatingText(`+${Math.ceil(qualityPointsFromBoss)} PQ`, this.x, this.y + 15, '#DAA520', 18, this.game);
            this.game.ui.updateAll();

            return true; 
        }
        return false; 
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2); 
        ctx.fill();

        
        const eyeRadius = this.size / 10;
        const eyeOffsetX = this.size / 5;
        const eyeOffsetY = -this.size / 6; 
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x - eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black"; 
        ctx.beginPath();
        ctx.arc(this.x - eyeOffsetX, this.y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX, this.y + eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fill();

        
        ctx.fillStyle = '#f0f0f0'; 
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), this.x, this.y - this.size/2 - 25); 
        
        
        const barWidth = Math.min(200, this.game.canvas.width * 0.4); 
        const barHeight = 18;
        const barX = this.x - barWidth / 2;
        const barY = this.y + this.size / 2 + 15; 

        ctx.fillStyle = '#333'; 
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        
        const currentPhaseColorHex = this.bossConfig.phases[this.currentPhaseIndex].color || "#FF0000";
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        const phaseColorRgb = hexToRgb(currentPhaseColorHex);
        if (phaseColorRgb) {
            gradient.addColorStop(0, `rgb(${phaseColorRgb.r}, ${phaseColorRgb.g}, ${phaseColorRgb.b})`);
            gradient.addColorStop(1, `rgb(${Math.max(0,phaseColorRgb.r-50)}, ${Math.max(0,phaseColorRgb.g-50)}, ${Math.max(0,phaseColorRgb.b-50)})`);
        } else { 
            gradient.addColorStop(0, currentPhaseColorHex);
            gradient.addColorStop(1, currentPhaseColorHex); 
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * (this.health / this.totalMaxHealth), barHeight);

        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        
        let accumulatedHealthForThreshold = this.totalMaxHealth;
        for(let i = 0; i < this.bossConfig.phases.length -1; i++){ 
            const phase = this.bossConfig.phases[i];
            
            const thresholdValueAbsolute = this.totalMaxHealth * phase.healthPercentThreshold;
             
            if(thresholdValueAbsolute < accumulatedHealthForThreshold ){ 
                 const thresholdX = barX + barWidth * phase.healthPercentThreshold;
                 
                 ctx.fillStyle = i < this.currentPhaseIndex ? 'rgba(80, 80, 80, 0.7)' : 'rgba(220, 220, 220, 0.7)'; 
                 ctx.fillRect(thresholdX -1.5, barY, 3, barHeight);
                 
            }
        }
        ctx.textAlign = 'start'; 
    }
}