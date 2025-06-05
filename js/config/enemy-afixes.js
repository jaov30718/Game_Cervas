
import { enemyTypes } from './enemy-types.js';

export const enemyAfixes = {
    
    tough: { name: "Resistente", description: "Vida aumentada em 25%.", apply: (enemy) => { enemy.maxHealth *= 1.25; enemy.health = enemy.maxHealth; }, colorTint: { r: 0, g: 0, b: 30}, tier: 1 },
    swift: { name: "Veloz", description: "Velocidade de movimento aumentada em 20%.", apply: (enemy) => { enemy.baseSpeed *= 1.20; enemy.currentSpeed = enemy.baseSpeed; }, colorTint: { r: 30, g: 30, b: 0}, tier: 1 },
    damaging: { name: "Agressivo", description: "Dano (colisão/projétil) aumentado em 20%.", apply: (enemy) => { enemy.damage *= 1.20; if(enemy.isShooter) enemy.projectileDamage *=1.20; }, colorTint: {r: 30, g: -10, b: -10}, tier: 1},
    volatile: { name: "Instável", description: "Pequena chance de explodir ao morrer, causando dano leve.", onDeath: (enemy, gameLogic) => { if (Math.random() < 0.33) gameLogic.createExplosion(enemy.x, enemy.y, 35, enemy.damage * 0.5, null, true);}, colorTint: {r:40, g:10, b:-10}, tier: 1},
    elusive: { 
        name: "Esquivo", 
        description: "Pequena chance (10%) de ignorar completamente o dano recebido.", 
        takeDamageEffect: (enemy, amount) => { 
            if (Math.random() < 0.10) { 
                if (enemy.game && enemy.game.utils && typeof enemy.game.utils.createFloatingText === 'function') {
                    enemy.game.utils.createFloatingText(`Esquivou!`, enemy.x, enemy.y - 10, '#aaaaff', 12, enemy.game); 
                }
                return 0;
            } 
            return amount;
        }, 
        colorTint: {r:-10, g:-10, b:40}, 
        tier: 1 
    },

    
    regenerating: { name: "Regenerador", description: "Regenera 1% da vida máxima por segundo.", updateEffect: (enemy, game) => { if (game.gameTime % 60 === 0 && enemy.health < enemy.maxHealth) enemy.health = Math.min(enemy.maxHealth, enemy.health + enemy.maxHealth * 0.01);}, colorTint: {r: -20, g: 40, b: -20}, tier: 2 },
    splitting: { name: "Divisor", description: "Ao morrer, gera 2 versões menores e mais fracas.", onDeath: (enemy, gameLogic) => { gameLogic.spawnSplinterMinions(enemy, 2); }, colorTint: {r: 10, g: 10, b: 40}, tier: 2 },
    shielded: { name: "Blindado", description: "Começa com um escudo temporário que absorve dano.", apply: (enemy) => { enemy.shield = enemy.maxHealth * 0.3; enemy.hasShieldEffect = true; }, updateEffect: (enemy) => { if(enemy.shield <= 0) enemy.hasShieldEffect = false; }, takeDamageEffect: (enemy, amount) => { if(enemy.shield > 0) { const toShield = Math.min(enemy.shield, amount); enemy.shield -= toShield; return amount - toShield;} return amount;}, colorTint: {r:50,g:50,b:50}, tier: 2},
    arcane_projectiles: { name: "Projéteis Perfurantes", description: "Se for atirador, seus projéteis são 20% mais rápidos e atravessam 1 alvo.", apply: (enemy) => { if(enemy.isShooter) { enemy.projectileSpeed *= 1.20; enemy.projectilePiercing = (enemy.projectilePiercing || 0) + 1; enemy.projectileColor = '#8A2BE2'; } }, colorTint: {r:20, g:-20, b:50}, tier: 2},
    summoner: { 
        name: "Invocador de Pestes", 
        description: "Periodicamente invoca 1-2 contaminantes básicos e fracos.", 
        updateEffect: (enemy, game) => { 
            if (game.gameTime % 300 === 0 && game.enemies.length < game.gameLogic.maxEnemies -2 && Math.random() < 0.7) { 
                if (enemyTypes && enemyTypes.regular && enemyTypes.regular.length > 0) {
                     const count = (game.utils && typeof game.utils.getRandomInt === 'function') ? game.utils.getRandomInt(1,2) : (Math.floor(Math.random() * 2) + 1);
                    game.gameLogic.spawnMinionsAround(enemy, enemyTypes.regular[0].name, count); 
                    if (game.utils && typeof game.utils.createFloatingText === 'function') {
                        game.utils.createFloatingText(`Invoca!`, enemy.x, enemy.y - 10, '#66CDAA', 12, game);
                    }
                } else {
                    console.warn("Summoner afix: enemyTypes.regular is not available or empty for minion spawning.");
                }
            }
        }, 
        colorTint: {r:-20, g:30, b:10}, 
        tier: 2
    },
    freezing_aura: { 
        name: "Aura Congelante", 
        description: "Chance de aplicar lentidão ao jogador se estiver muito próximo por um tempo.", 
        updateEffect: (enemy, game) => { 
            if (game.player && game.utils && game.utils.distance(enemy.x, enemy.y, game.player.x, game.player.y) < 60 && game.gameTime % 90 === 0 && Math.random() < 0.25) { 
                if(!game.player.activeDebuffs || !game.player.activeDebuffs.some(d => d.type === 'slow_aura')) { 
                    game.player.currentSpeed *= 0.7; 
                    if (game.utils && typeof game.utils.createFloatingText === 'function') {
                        game.utils.createFloatingText(`Lento!`, game.player.x, game.player.y - 15, '#ADD8E6', 14, game); 
                    }
                    game.player.activeDebuffs = game.player.activeDebuffs || []; 
                    game.player.activeDebuffs.push({type: 'slow_aura', duration: 120, revert: (p) => { if(p) p.currentSpeed /= 0.7;} }); 
                    setTimeout(() => { 
                        if(game.player && game.player.currentSpeed / 0.7 <= game.player.baseSpeed * 1.5) game.player.currentSpeed /= 0.7; 
                        if(game.player) game.player.activeDebuffs = game.player.activeDebuffs.filter(d => d.type !== 'slow_aura'); 
                    }, 2000);
                }
            }
        }, 
        colorTint: {r:-30, g:10, b:50}, 
        tier: 2
    },
    thorns: {
        name: "Espinhos",
        description: "Reflete 15% do dano de contato recebido de volta ao atacante.",
        takeDamageEffect: (enemy, amount, projectile) => {
            if (!projectile && enemy && enemy.game && enemy.game.utils && enemy.game.player) {
                const player = enemy.game.player; 
                if (typeof player.x === 'number' && typeof player.y === 'number' && typeof player.size === 'number') { 
                    if (enemy.game.utils.distance(enemy.x, enemy.y, player.x, player.y) < enemy.size / 2 + player.size / 2 + 5) {
                        const reflectedDamage = Math.ceil(amount * 0.15);
                        if (typeof player.takeDamage === 'function') {
                            player.takeDamage(reflectedDamage);
                        }
                        if (enemy.game.utils && typeof enemy.game.utils.createFloatingText === 'function') {
                            enemy.game.utils.createFloatingText(`-${reflectedDamage} (Espinhos)`, player.x, player.y - 5, '#FF6347', 10, enemy.game);
                        }
                    }
                }
            }
            return amount;
        },
        colorTint: {r:20, g:20, b:-20},
        tier: 2
    },

    
    explosive_death: { name: "Morte Explosiva", description: "Explode ao morrer, causando dano em área.", onDeath: (enemy, gameLogic) => { gameLogic.createExplosion(enemy.x, enemy.y, 60, enemy.damage * 1.5, null, true);}, colorTint: {r:50, g:20, b:0}, tier: 3},
    leeching: { name: "Sanguessuga", description: "Cura-se por uma porcentagem do dano que causa.", onDamageDealtToPlayer: (enemy, damageDealt) => { enemy.health = Math.min(enemy.maxHealth, enemy.health + damageDealt * 0.2); }, colorTint: {r:30, g:-20, b:30}, tier: 3},
    juggernaut: { name: "Colosso", description: "Vida massivamente aumentada (+75%) e recebe 15% menos dano.", apply: (enemy) => { enemy.maxHealth *= 1.75; enemy.health = enemy.maxHealth; enemy.damageReduction = (enemy.damageReduction || 0) + 0.15; }, takeDamageEffect: (enemy, amount) => { return amount * (1 - (enemy.damageReduction || 0)); }, colorTint: {r:20, g:20, b:60}, tier: 3},
    teleporter: { 
        name: "Teleportador", 
        description: "Chance de se teleportar para uma posição aleatória próxima ao ser atingido ou periodicamente.", 
        updateEffect: (enemy, game) => { 
            if (game.gameTime % 180 === 0 && Math.random() < 0.20) { 
                const angle = Math.random() * Math.PI * 2; 
                const distance = 80 + Math.random() * 70; 
                enemy.x += Math.cos(angle) * distance; 
                enemy.y += Math.sin(angle) * distance; 
                enemy.x = Math.max(enemy.size / 2, Math.min(game.canvas.width - enemy.size / 2, enemy.x)); 
                enemy.y = Math.max(enemy.size / 2, Math.min(game.canvas.height - enemy.size / 2, enemy.y)); 
                if (game.utils && typeof game.utils.createFloatingText === 'function') {
                    game.utils.createFloatingText(`Teleportou!`, enemy.x, enemy.y - 10, '#DA70D6', 12, game);
                }
            }
        }, 
        takeDamageEffect: (enemy, amount) => { 
            if (Math.random() < 0.10 && amount > 0) { 
                const angle = Math.random() * Math.PI * 2; 
                const distance = 50 + Math.random() * 50; 
                enemy.x += Math.cos(angle) * distance; 
                enemy.y += Math.sin(angle) * distance; 
                enemy.x = Math.max(enemy.size / 2, Math.min(enemy.game.canvas.width - enemy.size / 2, enemy.x)); 
                enemy.y = Math.max(enemy.size / 2, Math.min(enemy.game.canvas.height - enemy.size / 2, enemy.y)); 
                if (enemy.game && enemy.game.utils && typeof enemy.game.utils.createFloatingText === 'function') {
                    enemy.game.utils.createFloatingText(`Blink!`, enemy.x, enemy.y - 10, '#DA70D6', 12, enemy.game); 
                }
            } 
            return amount; 
        }, 
        colorTint: {r:40, g:-10, b:40}, 
        tier: 3
    },
    haste_aura: { 
        name: "Aura de Rapidez", 
        description: "Aumenta a velocidade de movimento de contaminantes próximos (incluindo ele mesmo).", 
        updateEffect: (enemy, game) => { 
            if(game.gameTime % 60 === 0) { 
                let affected = false; 
                game.enemies.forEach(e => { 
                    if(e.health > 0 && e !== enemy && game.utils && game.utils.distance(enemy.x, enemy.y, e.x, e.y) < 100) { 
                        if(!e.hasteBuff) { 
                            e.currentSpeed *= 1.15; 
                            e.hasteBuff = true; 
                            setTimeout(() => {if(e) {e.currentSpeed /= 1.15; e.hasteBuff = false;}}, 3000); 
                            affected = true;
                        } 
                    } 
                }); 
                if(!enemy.hasteBuffSelf) {
                    enemy.currentSpeed *=1.10; 
                    enemy.hasteBuffSelf=true; 
                    setTimeout(()=>{if(enemy){enemy.currentSpeed /=1.10; enemy.hasteBuffSelf=false;}}, 3000); 
                    affected=true;
                } 
                if(affected && Math.random() < 0.2 && game.utils && typeof game.utils.createFloatingText === 'function') {
                    game.utils.createFloatingText(`Acelerando!`, enemy.x, enemy.y -10, '#FFD700', 10, game); 
                }
            }
        }, 
        colorTint: {r:50, g:40, b:-20}, 
        tier: 3
    },
    corrosive_touch: { 
        name: "Toque Corrosivo", 
        description: "Ataques de contato têm chance de aplicar um debuff que reduz temporariamente a regeneração ou escudo do jogador.", 
        onDamageDealtToPlayer: (enemy, damageDealt) => { 
            if (Math.random() < 0.25 && enemy.game.player) { 
                if (enemy.game.player.currentShield > 0) { 
                    enemy.game.player.currentShield = Math.max(0, enemy.game.player.currentShield - damageDealt * 0.5); 
                    if (enemy.game.utils && typeof enemy.game.utils.createFloatingText === 'function') {
                        enemy.game.utils.createFloatingText(`Escudo Corroído!`, enemy.game.player.x, enemy.game.player.y - 10, '#9ACD32', 12, enemy.game); 
                    }
                } else if (enemy.game.player.healthRegenRate > 0) { 
                    const originalRegen = enemy.game.player.healthRegenRate; 
                    enemy.game.player.healthRegenRate = 0; 
                    if (enemy.game.utils && typeof enemy.game.utils.createFloatingText === 'function') {
                        enemy.game.utils.createFloatingText(`Regen. Corroída!`, enemy.game.player.x, enemy.game.player.y - 10, '#9ACD32', 12, enemy.game); 
                    }
                    setTimeout(() => { if(enemy.game.player) enemy.game.player.healthRegenRate = originalRegen; }, 3000); 
                }
            }
        }, 
        colorTint: {r:10, g:40, b:-30}, 
        tier: 3
    },
};