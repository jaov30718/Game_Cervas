

export class Projectile { 
    constructor(x, y, size, color, speed, angle, 
                weaponDamageAtShotTime, 
                piercing = 0, isHoming = false, homingStrength = 0.03, 
                maxRicochets = 0, 
                explosionRadius = 0, 
                techniqueExplosionBaseDamage = 0, 
                game, lifeTime = 180) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.weaponDamageAtShotTime = weaponDamageAtShotTime; 
        this.damage = weaponDamageAtShotTime; 

        this.piercing = piercing;
        this.enemiesHit = new Set();
        this.id = Math.random();
        this.life = lifeTime;

        this.isHoming = isHoming;
        this.homingStrength = homingStrength;
        this.homingTarget = null;

        this.maxRicochets = maxRicochets;
        this.ricochetsLeft = maxRicochets;

        this.explosionRadius = explosionRadius;
        this.techniqueExplosionBaseDamage = techniqueExplosionBaseDamage;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.life--;
        if (this.isHoming) {
            if (!this.homingTarget || this.homingTarget.health <= 0 || this.game.utils.distance(this.x, this.y, this.homingTarget.x, this.homingTarget.y) > 300) {
                let closestDist = Infinity;
                this.game.enemies.forEach(e => {
                    if (e.health > 0 && !this.enemiesHit.has(e.id)) { 
                        const d = this.game.utils.distance(this.x, this.y, e.x, e.y);
                        if (d < closestDist && d < 300) { 
                            closestDist = d;
                            this.homingTarget = e;
                        }
                    }
                });
            }
            if (this.homingTarget && this.homingTarget.health > 0) {
                const angleToTarget = Math.atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx += Math.cos(angleToTarget) * this.homingStrength * currentSpeed; 
                this.vy += Math.sin(angleToTarget) * this.homingStrength * currentSpeed;
                
                const speedMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const baseProjectileSpeed = this.game.playerWeapon ? this.game.playerWeapon.projectileSpeed : 5;
                if (speedMag > baseProjectileSpeed * 1.2) { 
                    this.vx = (this.vx / speedMag) * baseProjectileSpeed * 1.2;
                    this.vy = (this.vy / speedMag) * baseProjectileSpeed * 1.2;
                }
            }
        }

        this.x += this.vx;
        this.y += this.vy;
    }
}

export class EnemyProjectile {
    constructor(x, y, size, color, speed, angle, damage, game, lifeTime = 240, piercing = 0, explosionRadius = 0, explosionDamage = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.id = Math.random();
        this.life = lifeTime;
        this.piercing = piercing; 
        this.hitPlayer = false; 

        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage; 
        this.exploded = false; 
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.life--;
        this.x += this.vx;
        this.y += this.vy;

        
        if (this.life <= 0 && this.explosionRadius > 0 && !this.exploded) {
            this.game.gameLogic.createExplosion(this.x, this.y, this.explosionRadius, this.explosionDamage, this, true);
            this.exploded = true; 
        }
    }

    
    handlePlayerCollision() {
        if (this.exploded) return true; 

        if (this.explosionRadius > 0) {
            this.game.gameLogic.createExplosion(this.x, this.y, this.explosionRadius, this.explosionDamage, this, true);
            this.exploded = true;
            
            return true; 
        }

        if (this.piercing > 0) {
            if (!this.hitPlayer) { 
                this.game.player.takeDamage(this.damage);
                this.hitPlayer = true; 
                this.piercing--;
                return false; 
            }
            return false; 
        } else {
            if (!this.hitPlayer) { 
                 this.game.player.takeDamage(this.damage);
            }
            return true; 
        }
    }
}