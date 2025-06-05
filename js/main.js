
import { Player } from './player.js';
import { Projectile, EnemyProjectile } from './projectile.js'; 

import { UI } from './ui.js';
import { GameLogic } from './gameLogic.js';
import * as utils from './utils.js'; 
import {
     PLAYER_BASE_SPEED, PLAYER_BASE_HEALTH, XP_TO_NEXT_LEVEL_BASE,
} from './config.js';
import { AudioManager } from './audioManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.utils = utils;
        this.isMobile = utils.isMobileDevice(); 
        console.log("Is Mobile Device:", this.isMobile);

        this.audioManager = new AudioManager();
        this.ui = new UI(this);
        this.gameLogic = new GameLogic(this);
        this.PlayerProjectile = Projectile;
        this.EnemyProjectile = EnemyProjectile;

        this.player = null;
        this.playerWeapon = {};
        this.projectiles = [];
        this.enemies = [];
        this.xpOrbs = [];
        this.floatingTexts = [];
        this.enemyProjectiles = [];

        this.gameTime = 0;
        this.totalGameTime = 0;
        this.roundTimer = 0;
        this.currentRound = 0;
        this.level = 1;
        this.currentXP = 0;
        this.xpToNextLevel = XP_TO_NEXT_LEVEL_BASE;

        this.gamePaused = false;
        this.gameOver = false;
        this.animationFrameId = null;
        this.keys = {}; 

        
        this.touchControls = {
            left: false, right: false, up: false, down: false,
            activeTouchId: null,
            
            dpadCenterX: 0, dpadCenterY: 0, 
            dpadRadius: 0,
            
            
            dpadVisualCenterX: 0, dpadVisualCenterY: 0,
            dpadRestCenterX: 0, dpadRestCenterY: 0, 
            thumbstickX: 0, thumbstickY: 0, 
            isThumbstickActive: false
        };

        this.activeConditions = [];
        this.playerMasterTechniques = [];
        this.enemyHealthMultiplier = 1;

        this.purchasedMarketItemIds = [];
        this.xpGainMultiplier = 1;
        this.enemySpawnModifier = 1;
        this.bonusQualityPointsPerElite = 0;
        this.isLandscape = false;

        this.resizeCanvas(); 
        this.init();
        if (this.isMobile) {
            this.setupTouchControls();
        }
        
        requestAnimationFrame(() => this.resizeCanvas());
    }
    repositionEntitiesAfterResize() { 
        if (!this.canvas) return;

        
        if (this.player) {
            this.player.x = Math.max(this.player.size / 2, Math.min(this.canvas.width - this.player.size / 2, this.player.x));
            this.player.y = Math.max(this.player.size / 2, Math.min(this.canvas.height - this.player.size / 2, this.player.y));
        }

        
        this.enemies.forEach(enemy => {
            
            const margin = enemy.size * 2; 
            if (enemy.x < -margin) enemy.x = -margin + 1;
            if (enemy.x > this.canvas.width + margin) enemy.x = this.canvas.width + margin - 1;
            if (enemy.y < -margin) enemy.y = -margin + 1;
            if (enemy.y > this.canvas.height + margin) enemy.y = this.canvas.height + margin - 1;

            
            
            enemy.x = Math.max(-enemy.size, Math.min(this.canvas.width + enemy.size, enemy.x));
            enemy.y = Math.max(-enemy.size, Math.min(this.canvas.height + enemy.size, enemy.y));
        });

        
        this.projectiles = this.projectiles.filter(p => 
            p.x > -100 && p.x < this.canvas.width + 100 && p.y > -100 && p.y < this.canvas.height + 100
        );
        this.enemyProjectiles = this.enemyProjectiles.filter(ep => 
            ep.x > -ep.size * 2 && ep.x < this.canvas.width + ep.size * 2 && ep.y > -ep.size * 2 && ep.y < this.canvas.height + ep.size * 2
        );

        
        this.xpOrbs.forEach(orb => {
            orb.x = Math.max(orb.size, Math.min(this.canvas.width - orb.size, orb.x));
            orb.y = Math.max(orb.size, Math.min(this.canvas.height - orb.size, orb.y));
        });
    }

    resizeCanvas() {
        
        this.isMobile = utils.isMobileDevice(); 
        this.isLandscape = window.innerWidth > window.innerHeight;
        if (this.isMobile) { 
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
        if (this.isLandscape && this.isMobile) {
            document.body.classList.add('landscape-mode');
        } else {
            document.body.classList.remove('landscape-mode');
        }
        


        const topUIEl = document.getElementById('gameUIContainer');
        const bottomPowersEl = document.getElementById('playerPowersContainer');

        const topUIHeight = topUIEl ? topUIEl.getBoundingClientRect().height : (this.isMobile ? 50 : 70);
        document.documentElement.style.setProperty('--top-ui-height', `${topUIHeight}px`);

        let bottomPowersHeight = 0;
        if (bottomPowersEl) {
            if (this.isMobile && this.isLandscape) {
                bottomPowersEl.style.display = 'none';
                bottomPowersHeight = 0;
            } else {
                bottomPowersEl.style.display = 'flex';
                bottomPowersHeight = bottomPowersEl.getBoundingClientRect().height;
            }
        }
        bottomPowersHeight = bottomPowersHeight || (this.isMobile && !this.isLandscape ? 40 : (this.isMobile && this.isLandscape ? 0 : 50));


        const bodyEl = document.body;
        bodyEl.style.paddingTop = `${topUIHeight}px`;
        bodyEl.style.paddingBottom = `${bottomPowersHeight}px`;
        bodyEl.offsetHeight;

        const verticalBuffer = this.isMobile ? 5 : 10;
        const horizontalBuffer = this.isMobile ? 5 : 10;

        const availableHeight = window.innerHeight - topUIHeight - bottomPowersHeight - verticalBuffer;
        const availableWidth = window.innerWidth - horizontalBuffer;

        let newWidth = availableWidth;
        let newHeight = newWidth * (9 / 16);

        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = newHeight * (16 / 9);
        }
        if (newWidth > availableWidth) {
            newWidth = availableWidth;
            newHeight = newWidth * (9/16);
        }

        this.canvas.width = Math.max(this.isMobile ? 280 : 320, newWidth);
        this.canvas.height = Math.max(this.isMobile ? 157 : 180, newHeight);

        this.canvas.style.marginTop = '0';
        this.canvas.style.marginLeft = 'auto';
        this.canvas.style.marginRight = 'auto';

        this.repositionEntitiesAfterResize();

        if (this.isMobile) {
            this.touchControls.dpadRadius = Math.min(this.canvas.width, this.canvas.height) * 0.15;
            
            
            this.touchControls.dpadRestCenterX = this.canvas.width - (this.touchControls.dpadRadius * 1.3);
            
            this.touchControls.dpadRestCenterY = this.canvas.height - this.touchControls.dpadRadius * 1.3; 

            if (!this.touchControls.isThumbstickActive) {
                this.touchControls.dpadVisualCenterX = this.touchControls.dpadRestCenterX;
                this.touchControls.dpadVisualCenterY = this.touchControls.dpadRestCenterY;
            } else {
                this.touchControls.dpadVisualCenterX = this.touchControls.dpadCenterX;
                this.touchControls.dpadVisualCenterY = this.touchControls.dpadCenterY;
            }
        }
    }
    init() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this);
        this.player.qualityPoints = 0; 
        
        this.player.temporarySpeedMultiplier = 1;
        this.player.temporaryCritChanceAdditive = 0; 

        this.playerWeapon = {
            name: "Sanitizador Manual",
            fireRate: this.isMobile ? 35 : 30, 
            projectileSpeed: 5,
            baseDamage: 10,
            currentDamage: 10, 
            temporaryDamageMultiplier: 1,
            projectileSize: 5,
            projectileColor: '#00AACC', 
            projectilesPerShot: 1,
            spreadAngle: Math.PI / 18,
            fireCooldown: 0,
            piercing: 0,
            isHoming: false,
            homingStrength: 0.03,
            maxRicochets: 0,
            
            
            canExplode: false,      
            explosionRadius: 0,     
            
            
            baseCritChance: 0.05, 
            critChance: 0.05,     
            critMultiplier: 1.5,
            lastAngle: 0,
            projectileLifeTime: 180 
        };


        this.purchasedMarketItemIds = [];
        this.xpGainMultiplier = 1;
        this.enemySpawnModifier = 1;
        this.bonusQualityPointsPerElite = 0;
        if (this.player) this.player.activeSeasonings = [];


        this.projectiles = [];
        this.enemies = [];
        this.xpOrbs = [];
        this.floatingTexts = [];
        this.enemyProjectiles = []; 
        this.activeConditions = [];
        this.playerMasterTechniques = [];
        this.enemyHealthMultiplier = 1;


        this.gameTime = 0;
        this.totalGameTime = 0;
        this.roundTimer = 0;
        this.currentRound = 0; 
        this.level = 1;
        this.currentXP = 0;
        this.xpToNextLevel = XP_TO_NEXT_LEVEL_BASE;

        this.gameOver = false;
        this.gamePaused = true; 

        this.ui.updateAll();
        this.ui.hideGameOverModal();
        this.ui.hideLevelUpModal();
        this.ui.hideQuizModal();
        this.ui.hideMarketModal();
        this.ui.togglePauseModal(false);
        document.getElementById('eventNotificationDisplay').classList.remove('visible');
        if(this.isMobile) document.body.classList.add('is-mobile');

        this.gameLogic.recalculatePlayerStats(); 
        this.gameLogic.startNewRound(); 

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.gameLoop();
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }

    update() {
        if (this.gameOver || this.gamePaused) return;

        this.gameTime++;
        this.gameLogic.updateRound();

        let moveX = 0;
        let moveY = 0;
        
        
        if (this.keys['arrowleft'] || this.keys['a'] || (this.isMobile && this.touchControls.left)) moveX -= 1;
        if (this.keys['arrowright'] || this.keys['d'] || (this.isMobile && this.touchControls.right)) moveX += 1;
        if (this.keys['arrowup'] || this.keys['w'] || (this.isMobile && this.touchControls.up)) moveY -= 1;
        if (this.keys['arrowdown'] || this.keys['s'] || (this.isMobile && this.touchControls.down)) moveY += 1;
        
        this.player.move(moveX, moveY);
        this.player.updateWeapon();
        this.player.update();

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();
            const outOfBoundsX = p.x < -100 || p.x > this.canvas.width + 100;
            const outOfBoundsY = p.y < -100 || p.y > this.canvas.height + 100;

            if (outOfBoundsX || outOfBoundsY || p.life <= 0) {
                
                if (p.explosionRadius > 0 && (p.weaponDamageAtShotTime > 0 || p.techniqueExplosionBaseDamage > 0) && p.life <= 0) {
                    
                    this.gameLogic.createExplosion(p.x, p.y, p.explosionRadius, p, false); 
                }
                
                this.projectiles.splice(i, 1);
                continue; 
            }
        }

        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const ep = this.enemyProjectiles[i];
            ep.update();

            const projectileBuffer = ep.size * 2; 
            const outOfBoundsX = ep.x < -projectileBuffer || ep.x > this.canvas.width + projectileBuffer;
            const outOfBoundsY = ep.y < -projectileBuffer || ep.y > this.canvas.height + projectileBuffer;

            if (outOfBoundsX || outOfBoundsY || ep.life <= 0) {
                if (ep.life <= 0 && ep.explosionRadius > 0 && !ep.exploded) {
                    
                }
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            if (!ep.exploded && this.utils.distance(this.player.x, this.player.y, ep.x, ep.y) < this.player.size / 2 + ep.size / 2) {
                const consumed = ep.handlePlayerCollision();
                if (consumed) {
                    this.enemyProjectiles.splice(i, 1);
                }
            }
        }

        this.enemies.forEach((e) => {
            e.update(); 
            if (this.utils.distance(this.player.x, this.player.y, e.x, e.y) < this.player.size / 2 + e.size / 2) {
                if (!this.player.isInvulnerable) {
                    this.player.takeDamage(e.damage);
                    e.handleDamageDealtToPlayer(e.damage); 
                }
            }
        });

        
        for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
            const p = this.projectiles[pi];
            if (!p) continue; 

            for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
                const e = this.enemies[ei];
                if (!e || e.health <= 0) continue;

                const enemyVisibleX = e.x > -e.size && e.x < this.canvas.width + e.size;
                const enemyVisibleY = e.y > -e.size && e.y < this.canvas.height + e.size;
                if (!enemyVisibleX || !enemyVisibleY) continue;

                if (p.enemiesHit && p.enemiesHit.has(e.id) && p.ricochetsLeft <= 0 && p.piercing <= 0) continue;

                if (this.utils.distance(p.x, p.y, e.x, e.y) < p.size + e.size / 2) {
                    
                    if (p.explosionRadius > 0 && (p.weaponDamageAtShotTime > 0 || p.techniqueExplosionBaseDamage > 0)) {
                        
                        this.gameLogic.createExplosion(p.x, p.y, p.explosionRadius, p, false); 
                        this.projectiles.splice(pi, 1); 
                        break; 
                    }

                    let actualDamage = p.damage;
                    
                    let isCrit = false;
                    if (this.playerWeapon.critChance > 0 && Math.random() < this.playerWeapon.critChance) {
                        actualDamage = Math.round(actualDamage * this.playerWeapon.critMultiplier);
                        isCrit = true;
                    }
                    
                    actualDamage *= (this.player.damageOutputMultiplier || 1);
                    actualDamage = Math.round(actualDamage);


                    if (isCrit) {
                         this.utils.createFloatingText(`CRÍTICO! ${actualDamage}`, e.x, e.y - 20, 'orange', 18, this);
                    }
                    
                    
                    if (isCrit && this.player.canHealOnCrit && Math.random() < this.player.healOnCritChance) {
                        this.player.heal(this.player.healOnCritAmount);
                    }
                     
                    if (this.playerWeapon.cocoaSlowChance && Math.random() < this.playerWeapon.cocoaSlowChance) {
                        e.applySlow(this.playerWeapon.cocoaSlowDuration || 60, 0.7); 
                        this.utils.createFloatingText('Lento!', e.x, e.y - 10, '#A0522D', 12, this);
                    }
                    
                    if (this.playerWeapon.lavenderSpeedReduceChance && Math.random() < this.playerWeapon.lavenderSpeedReduceChance) {
                        e.applySlow(this.playerWeapon.lavenderSpeedReduceDuration || 120, this.playerWeapon.lavenderSpeedReduceFactor || 0.7);
                        this.utils.createFloatingText('Relaxado!', e.x, e.y - 10, '#E6E6FA', 12, this);
                    }


                    e.takeDamage(actualDamage, p); 

                    if (p.enemiesHit) p.enemiesHit.add(e.id);

                    if (p.ricochetsLeft > 0) {
                        p.ricochetsLeft--;
                        let newTarget = null;
                        let closestDist = Infinity;
                        this.enemies.forEach(otherEnemy => {
                            if (otherEnemy.health > 0 && !p.enemiesHit.has(otherEnemy.id) && otherEnemy.id !== e.id) {
                                const d = this.utils.distance(p.x, p.y, otherEnemy.x, otherEnemy.y);
                                if (d < closestDist && d < 250) {
                                    closestDist = d;
                                    newTarget = otherEnemy;
                                }
                            }
                        });
                        if (newTarget) {
                            const angleToNewTarget = Math.atan2(newTarget.y - p.y, newTarget.x - p.x);
                            const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
                            p.vx = Math.cos(angleToNewTarget) * speed;
                            p.vy = Math.sin(angleToNewTarget) * speed;
                            p.homingTarget = newTarget; 
                        } else {
                            this.projectiles.splice(pi, 1); break;
                        }
                    } else if (p.piercing > 0) {
                        p.piercing--;
                    } else {
                        this.projectiles.splice(pi, 1);
                        break; 
                    }
                }
            }
        }
        this.enemies = this.enemies.filter(e => e.health > 0 || (e.isBoss && e.health > 0)); 


        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.xpOrbs[i];
            orb.update(this.player, this);
            if (this.utils.distance(this.player.x, this.player.y, orb.x, orb.y) < this.player.size / 2 + orb.size / 2 + this.player.xpCollectionRadius / 2) {
                this.gameLogic.gainXP(orb.value);
                this.xpOrbs.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.update();
            if (ft.opacity <= 0 || ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
        
        
        if(this.player && this.player.activeDebuffs){
            for(let i = this.player.activeDebuffs.length -1; i >=0; i--){
                const debuff = this.player.activeDebuffs[i];
                debuff.duration--;
                if(debuff.duration <= 0){
                    if(debuff.revert) debuff.revert(this.player);
                    this.player.activeDebuffs.splice(i,1);
                }
            }
        }


        this.ui.updateEnemyCountDisplay();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.player) return;

        
        const drawBuffer = 50; 
        this.enemies.forEach(e => {
            if (e.x > -drawBuffer && e.x < this.canvas.width + drawBuffer &&
                e.y > -drawBuffer && e.y < this.canvas.height + drawBuffer) {
                e.draw(this.ctx);
            }
        });
        this.projectiles.forEach(p => {
             if (p.x > -drawBuffer && p.x < this.canvas.width + drawBuffer &&
                p.y > -drawBuffer && p.y < this.canvas.height + drawBuffer) {
                p.draw(this.ctx);
            }
        });
        this.enemyProjectiles.forEach(ep => {
            if (ep.x > -drawBuffer && ep.x < this.canvas.width + drawBuffer &&
                ep.y > -drawBuffer && ep.y < this.canvas.height + drawBuffer) {
                ep.draw(this.ctx);
            }
        });
        this.player.draw(this.ctx); 
        this.xpOrbs.forEach(o => {
            if (o.x > -drawBuffer && o.x < this.canvas.width + drawBuffer &&
                o.y > -drawBuffer && o.y < this.canvas.height + drawBuffer) {
                o.draw(this.ctx);
            }
        });
        this.floatingTexts.forEach(ft => ft.draw(this.ctx)); 

        if (this.isMobile) {
            this.drawTouchControls();
        }
    }

    
    setupTouchControls() {
        
        if (this.touchListenersAdded) return;

        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
        this.touchListenersAdded = true;
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (!this.isMobile) return;

        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchX = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const touchY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);

        
        const activationWidthThreshold = this.canvas.width / 2;
        const dPadActivationAreaTest = touchX >= activationWidthThreshold;

        
        
        
        
        if (dPadActivationAreaTest && this.touchControls.activeTouchId === null) {
            
            this.touchControls.dpadCenterX = touchX;
            this.touchControls.dpadCenterY = touchY;
            this.touchControls.dpadVisualCenterX = touchX;
            this.touchControls.dpadVisualCenterY = touchY;
            this.touchControls.activeTouchId = touch.identifier;
            this.touchControls.isThumbstickActive = true;
            this.updateTouchMovement(touchX, touchY); 
        } 
        
        
        
        
        
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isMobile || this.touchControls.activeTouchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchControls.activeTouchId) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
                const touchY = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
                
                this.updateTouchMovement(touchX, touchY);
                break;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.isMobile) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchControls.activeTouchId) {
                this.touchControls.activeTouchId = null;
                this.touchControls.isThumbstickActive = false;
                this.touchControls.thumbstickX = 0;
                this.touchControls.thumbstickY = 0;
                this.touchControls.left = false;
                this.touchControls.right = false;
                this.touchControls.up = false;
                this.touchControls.down = false;
                
                
                this.touchControls.dpadVisualCenterX = this.touchControls.dpadRestCenterX;
                this.touchControls.dpadVisualCenterY = this.touchControls.dpadRestCenterY;
                
                
                break;
            }
        }
    }

    updateTouchMovement(touchX, touchY) {
        
        
        let dx = touchX - this.touchControls.dpadCenterX;
        let dy = touchY - this.touchControls.dpadCenterY;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx); 

        
        if (dist > this.touchControls.dpadRadius) {
            this.touchControls.thumbstickX = Math.cos(angle) * this.touchControls.dpadRadius;
            this.touchControls.thumbstickY = Math.sin(angle) * this.touchControls.dpadRadius;
        } else {
            this.touchControls.thumbstickX = dx;
            this.touchControls.thumbstickY = dy;
        }

        
        this.touchControls.left = false;
        this.touchControls.right = false;
        this.touchControls.up = false;
        this.touchControls.down = false;

        const deadZone = this.touchControls.dpadRadius * 0.15; 

        

        if (dist > deadZone) {
            
            let angleDeg = angle * (180 / Math.PI);
            if (angleDeg < 0) {
                angleDeg += 360;
            }

            
            
            if (angleDeg <= 22.5 || angleDeg > 337.5) {
                this.touchControls.right = true;
            }
            
            else if (angleDeg > 22.5 && angleDeg <= 67.5) {
                this.touchControls.right = true;
                this.touchControls.down = true;
            }
            
            else if (angleDeg > 67.5 && angleDeg <= 112.5) {
                this.touchControls.down = true;
            }
            
            else if (angleDeg > 112.5 && angleDeg <= 157.5) {
                this.touchControls.left = true;
                this.touchControls.down = true;
            }
            
            else if (angleDeg > 157.5 && angleDeg <= 202.5) {
                this.touchControls.left = true;
            }
            
            else if (angleDeg > 202.5 && angleDeg <= 247.5) {
                this.touchControls.left = true;
                this.touchControls.up = true;
            }
            
            else if (angleDeg > 247.5 && angleDeg <= 292.5) {
                this.touchControls.up = true;
            }
            
            else if (angleDeg > 292.5 && angleDeg <= 337.5) {
                this.touchControls.right = true;
                this.touchControls.up = true;
            }
            
        }
        
    }

    drawTouchControls() {
        if (!this.isMobile || !this.touchControls.isThumbstickActive) { 
             
            if (this.isMobile && this.touchControls.dpadRadius > 0) { 
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(this.touchControls.dpadRestCenterX, this.touchControls.dpadRestCenterY, this.touchControls.dpadRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = "rgba(100, 100, 100, 0.15)"; 
                this.ctx.fill();
                
                
                
                this.ctx.restore();
            }
            return;
        }


        this.ctx.save();
        
        this.ctx.beginPath();
        this.ctx.arc(this.touchControls.dpadVisualCenterX, this.touchControls.dpadVisualCenterY, this.touchControls.dpadRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        const thumbstickRadius = this.touchControls.dpadRadius * 0.45;
        
        const thumbX = this.touchControls.dpadVisualCenterX + this.touchControls.thumbstickX;
        const thumbY = this.touchControls.dpadVisualCenterY + this.touchControls.thumbstickY;

        this.ctx.beginPath();
        this.ctx.arc(thumbX, thumbY, thumbstickRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(150, 150, 150, 0.6)";
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(230, 230, 230, 0.8)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }
    gameLoop() {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    togglePause() {
        if (this.gameOver) return;
        if (this.ui.quizModal.style.display === 'block' ||
            this.ui.levelUpModal.style.display === 'block' ||
            this.ui.marketModal.style.display === 'block') {
            return;
        }

        this.gamePaused = !this.gamePaused;
        this.ui.togglePauseModal(this.gamePaused);
        if (!this.gamePaused && this.animationFrameId === null && !this.gameOver) {
            this.gameLoop();
        }

        if (this.gamePaused) {
            this.audioManager.pauseCurrentMusic();
        } else {
            this.audioManager.resumeCurrentMusic();
        }

    }

    restartGame() {
        this.audioManager.stopCurrentMusic();
        this.ui.hideGameOverModal();
        this.init();
    }

    setupEventListeners() {
        
        if (this.isMobile) {
            window.addEventListener('orientationchange', () => {
                
                setTimeout(() => {
                    this.resizeCanvas();
                }, 100); 
            });
        }
        
        window.addEventListener('resize', () => {
             
             
             setTimeout(() => { 
                this.resizeCanvas();
             }, 50);
        });


        if (!this.isMobile ) {
            window.addEventListener('keydown', (e) => {
                this.keys[e.key.toLowerCase()] = true;
                if (e.key.toLowerCase() === 'p') this.togglePause();
            });
            window.addEventListener('keyup', (e) => {
                this.keys[e.key.toLowerCase()] = false;
            });
        }

        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                const isMuted = this.audioManager.toggleMuteAll();
                muteButton.textContent = isMuted ? '🔇' : '🔊';
                muteButton.title = isMuted ? "Ativar Som" : "Desativar Som";
            });
        }
    }
}

    


window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; 
    game.setupEventListeners();
    
    requestAnimationFrame(() => game.resizeCanvas());
    
    
    
    
    const playUnlockAudio = async () => {
        const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"); 
        try {
            await unlockAudio.play();
            console.log("Contexto de áudio desbloqueado.");
        } catch (e) {
            console.warn("Não foi possível desbloquear o contexto de áudio automaticamente.", e);
        }
        
        document.removeEventListener('click', playUnlockAudio);
        document.removeEventListener('touchstart', playUnlockAudio);
    };
    document.addEventListener('click', playUnlockAudio, { once: true });
    document.addEventListener('touchstart', playUnlockAudio, { once: true });

});