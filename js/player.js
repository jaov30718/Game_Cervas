
import { PLAYER_BASE_HEALTH, PLAYER_BASE_SPEED, PLAYER_SIZE } from './config.js';
import { createFloatingText } from './utils.js';

export class Player {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = PLAYER_SIZE;
        this.color = '#3498db';
        this.maxHealth = PLAYER_BASE_HEALTH;
        this.health = this.maxHealth;
        this.baseSpeed = PLAYER_BASE_SPEED;
        this.currentSpeed = this.baseSpeed;
        this.xpCollectionRadius = 75;
        this.healthRegenRate = 0;
        this.auraDamage = 0;
        this.auraRadius = 0;
        this.currentShield = 0;
        this.shieldTimer = 0;
        this.qualityPoints = 0;
        this.activeSeasonings = [];
        this.invulnerabilityTimer = 0;
        this.isInvulnerable = false;
    }

    draw(ctx) {
        
        if (this.isInvulnerable && Math.floor(this.game.gameTime / 6) % 2 === 0) {
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }

        if (this.currentShield > 0) {
            ctx.strokeStyle = 'rgba(100,100,255,0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }
        if(this.auraRadius > 0 && this.auraDamage > 0) {
            const auraColor = 'rgba(255,165,0,0.15)'; 
            ctx.fillStyle = auraColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.auraRadius, 0, Math.PI*2);
            ctx.fill();
        }
    }

    
    move(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) { 
                 const normalizedDx = dx / magnitude;
                 const normalizedDy = dy / magnitude;
                 this.x += normalizedDx * this.currentSpeed;
                 this.y += normalizedDy * this.currentSpeed;
            }
        }
        
        this.x = Math.max(this.size / 2, Math.min(this.game.canvas.width - this.size / 2, this.x));
        this.y = Math.max(this.size / 2, Math.min(this.game.canvas.height - this.size / 2, this.y));
    }

    
    updateWeapon() {
        if (this.game.playerWeapon) {
            this.game.playerWeapon.fireCooldown--;
            if (this.game.playerWeapon.fireCooldown <= 0) {
                this.shoot();
                this.game.playerWeapon.fireCooldown = this.game.playerWeapon.fireRate;
            }
        }
    }


    update() { 
        

        if (this.healthRegenRate > 0 && this.game.gameTime % 60 === 0) {
            this.heal(this.healthRegenRate);
        }

        if (this.auraDamage > 0 && this.auraRadius > 0 && this.game.gameTime % 30 === 0) {
            this.game.enemies.forEach(e => {
                if (e.health > 0 && e.x > -e.size && e.x < this.game.canvas.width + e.size && e.y > -e.size && e.y < this.game.canvas.height + e.size) {
                    if (this.game.utils.distance(this.x, this.y, e.x, e.y) < this.auraRadius + e.size / 2) {
                        e.takeDamage(this.auraDamage, null, "AURA");
                        createFloatingText(`-${this.auraDamage} (Aura)`, e.x, e.y - 5, '#ffA500', 12, this.game);
                    }
                }
            });
        }

        if (this.invulnerabilityTimer > 0) {
            this.invulnerabilityTimer--;
            this.isInvulnerable = true;
        } else {
            this.isInvulnerable = false;
        }
    }

    shoot() {
        if (!this.game.playerWeapon) return;

        const visibleEnemies = this.game.enemies.filter(e => 
            e.health > 0 && 
            e.x > -e.size && e.x < this.game.canvas.width + e.size && 
            e.y > -e.size && e.y < this.game.canvas.height + e.size
        );

        if (visibleEnemies.length === 0 && this.game.playerWeapon.isHoming) return; 
        if (visibleEnemies.length === 0 && !this.game.playerWeapon.isHoming && this.game.enemies.length > 0) {
            
        } else if (visibleEnemies.length === 0 && this.game.enemies.length === 0) {
            return; 
        }

        let target = null;
        let closestDist = Infinity;
        visibleEnemies.forEach(e => {
            const d = this.game.utils.distance(this.x, this.y, e.x, e.y);
            if (d < closestDist) {
                closestDist = d;
                target = e;
            }
        });

        const baseAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : (this.game.playerWeapon.lastAngle || Math.random() * Math.PI * 2);
        this.game.playerWeapon.lastAngle = baseAngle;

        
        let techniqueExplosionBaseDmg = 0;
        if (this.game.playerWeapon.canExplode) {
            
            const explosiveTech = this.game.playerMasterTechniques.find(tech => tech.id === "limpeza_explosiva");
            if (explosiveTech && explosiveTech.techniqueBaseExplosionDamage) {
                techniqueExplosionBaseDmg = explosiveTech.techniqueBaseExplosionDamage;
            }
        }

        this.game.audioManager.playSFX('playerShoot');

        
        const weapon = this.game.playerWeapon;
        let projExplosionRadius = 0;
        let projExplosionBaseDmgFromTech = 0; 

        if (weapon.canExplode && weapon.explosionRadius > 0) {
            projExplosionRadius = weapon.explosionRadius;
            
            
            projExplosionBaseDmgFromTech = weapon.techniqueBaseExplosionDamage || 0;
        }

        for (let i = 0; i < weapon.projectilesPerShot; i++) {
            let angleOffset = (weapon.projectilesPerShot > 1) ? (i - (weapon.projectilesPerShot - 1) / 2) * weapon.spreadAngle : 0;
            this.game.projectiles.push(new this.game.PlayerProjectile( 
                this.x, this.y,
                weapon.projectileSize,
                weapon.projectileColor,
                weapon.projectileSpeed,
                baseAngle + angleOffset,
                weapon.currentDamage, 
                weapon.piercing,
                weapon.isHoming, 
                weapon.homingStrength, 
                weapon.maxRicochets, 
                projExplosionRadius, 
                projExplosionBaseDmgFromTech, 
                this.game,
                weapon.projectileLifeTime || 180 
            ));
        }
    }

    takeDamage(amount) {
        
        if (this.isInvulnerable) return; 

        this.game.audioManager.playSFX('playerHit');

        if (this.currentShield > 0) {
            const damageToShield = Math.min(this.currentShield, amount);
            this.currentShield -= damageToShield;
            amount -= damageToShield;
            createFloatingText(`-${damageToShield} (Escudo)`, this.x, this.y - 10, '#6495ED', 14, this.game);
            if (amount <= 0) {
                this.game.ui.updateHealthBarUI(); 
                return;
            }
        }

        this.health -= amount;
        createFloatingText(`-${amount}`, this.x, this.y, '#c0392b', 16, this.game);
        this.game.ui.updateHealthBarUI();

        this.invulnerabilityTimer = 30; 
        this.isInvulnerable = true;

        if (this.health <= 0) {
            this.health = 0;
            this.game.gameLogic.triggerGameOver();
        }
    }

    heal(amount) {
        
        this.health = Math.min(this.maxHealth, this.health + amount);
        createFloatingText(`+${amount}`, this.x, this.y, '#2ecc71', 16, this.game);
        this.game.ui.updateHealthBarUI();
        this.game.audioManager.playSFX('playerHeal');
    }
}