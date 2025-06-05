
export const bossTypes = [
    {
        id: "desperdicio_prime",
        name: "O Grande Desperdício",
        baseColorHex: "#8B0000", 
        totalHealthBase: 500, 
        phases: [
            { 
                nameSuffix: "", 
                color: "#8B0000", 
                size: 70, speed: 0.12, healthPercentThreshold: 0.6, 
                damageMultiplier: 1.0, 
                xp: 100, 
                collisionDamage: 25,
                isShooter: true,
                shootRange: 300, projectileDamage: 18, projectileSpeed: 3.2, projectileSize: 10, projectileColor: "#DC143C", attackCooldownBase: 90, projectileLifeTime: 300,
                abilities: [
                    { name: "Convocar Contaminação", type: "spawn_minions", chance: 0.02, minionType: "Bactéria Comum", count: 3, cooldown: 240 },
                    { name: "Pulso Nocivo Leve", type: "area_pulse_damage", chance: 0.015, damage: 12, radius: 130, cooldown: 300, pulseColor: "rgba(220, 20, 60, 0.3)"},
                    { name: "Rajada Simples", type: "shoot_volley", chance: 0.02, count: 3, spread: Math.PI / 12, projectileDamage: 15, projectileSpeed: 3.5, projectileSize: 8, projectileColor: "#FF6347", projectileLifeTime: 240, cooldown: 200}
                ]
            },
            { 
                nameSuffix: " Enfurecido", 
                color: "#FF0000", 
                size: 75, speed: 0.18, healthPercentThreshold: 0.25, 
                damageMultiplier: 1.3,
                xp: 150,
                collisionDamage: 35,
                isShooter: true,
                shootRange: 350, projectileDamage: 22, projectileSpeed: 4, projectileSize: 12, projectileColor: "#FF4500", attackCooldownBase: 70, projectileLifeTime: 300,
                abilities: [
                    { name: "Convocar Contaminação Maior", type: "spawn_minions", chance: 0.025, minionType: "Levedura Selvagem", count: 2, cooldown: 200 },
                    { name: "Investida Destrutiva", type: "charge_attack", chance: 0.015, speedMultiplier: 3.5, duration: 90, cooldown: 400 },
                    { name: "Pulso Nocivo Forte", type: "area_pulse_damage", chance: 0.02, damage: 18, radius: 160, cooldown: 240, pulseColor: "rgba(255, 0, 0, 0.4)" },
                    { name: "Rajada Furiosa", type: "shoot_volley", chance: 0.025, count: 5, spread: Math.PI / 8, projectileDamage: 18, projectileSpeed: 4.5, projectileSize: 9, projectileColor: "#FF00FF", projectileLifeTime: 240, cooldown: 150}
                ]
            },
            { 
                nameSuffix: " Desesperado",
                color: "#B22222", 
                size: 65, speed: 0.25, healthPercentThreshold: 0, 
                damageMultiplier: 1.6,
                xp: 250, 
                collisionDamage: 40,
                isShooter: true,
                shootRange: 400, projectileDamage: 25, projectileSpeed: 5, projectileSize: 14, projectileColor: "#800000", attackCooldownBase: 50, projectileLifeTime: 300,
                abilities: [
                    { name: "Convocar Campeões", type: "spawn_minions", chance: 0.03, minionType: "Super Bactéria", count: 1, isChampionMinion: true, cooldown: 300 }, 
                    { name: "Pulso Nocivo Devastador", type: "area_pulse_damage", chance: 0.025, damage: 25, radius: 200, cooldown: 180, pulseColor: "rgba(128, 0, 0, 0.5)" },
                    { name: "Rajada Final", type: "shoot_volley_pattern", pattern: "spiral", numProjectiles: 20, projectileDamage: 20, projectileSpeed: 4, projectileSize: 10, projectileColor: "#4B0082", projectileLifeTime: 300, cooldown: 280, chance: 0.03 } 
                ]
            }
        ],
        entryCry: "VOCÊ NÃO VAI DESPERDIÇAR MEU POTENCIAL!",
        deathCry: "NÃÃÃOOO... O SABOR... PERDIDO..."
    },
    {
        id: "lord_contaminatus",
        name: "Lorde Contaminatus",
        baseColorHex: "#4B0082", 
        totalHealthBase: 650,
        phases: [
            {
                nameSuffix: ", o Supervisor",
                color: "#8A2BE2", 
                size: 60, speed: 0.1, healthPercentThreshold: 0.65,
                damageMultiplier: 1.0,
                xp: 120,
                collisionDamage: 20,
                isShooter: true,
                shootRange: 280, projectileDamage: 15, projectileSpeed: 2.8, projectileSize: 12, projectileColor: "#9932CC", attackCooldownBase: 100, projectileLifeTime: 280,
                abilities: [
                    { name: "Invocação Menor", type: "spawn_minions", chance: 0.025, minionType: "Bactéria Comum", count: 4, cooldown: 280 },
                    { name: "Névoa Pútrida", type: "area_pulse_damage", chance: 0.01, damage: 10, radius: 150, cooldown: 350, pulseColor: "rgba(128, 0, 128, 0.25)" },
                    { name: "Tiro Contaminado", type: "shoot_volley", chance: 0.02, count: 1, spread: 0, projectileDamage: 20, projectileSpeed: 3, projectileSize: 15, projectileColor: "#BA55D3", projectileLifeTime: 260, cooldown: 180}
                ]
            },
            {
                nameSuffix: ", o Propagador",
                color: "#9400D3", 
                size: 65, speed: 0.15, healthPercentThreshold: 0.30,
                damageMultiplier: 1.4,
                xp: 180,
                collisionDamage: 30,
                isShooter: true,
                shootRange: 320, projectileDamage: 20, projectileSpeed: 3.5, projectileSize: 10, projectileColor: "#800080", attackCooldownBase: 80, projectileLifeTime: 300,
                abilities: [
                    { name: "Horda Mista", type: "spawn_minions", chance: 0.02, minionType: "Levedura Selvagem", count: 2, cooldown: 220 },
                    { name: "Horda de Mofo", type: "spawn_minions", chance: 0.015, minionType: "Mofo Sorrateiro", count: 3, cooldown: 200 },
                    { name: "Investida Corrompida", type: "charge_attack", chance: 0.012, speedMultiplier: 3.0, duration: 75, cooldown: 450 },
                    { name: "Rajada Dupla", type: "shoot_volley", chance: 0.025, count: 2, spread: Math.PI / 16, projectileDamage: 18, projectileSpeed: 4, projectileSize: 10, projectileColor: "#DA70D6", projectileLifeTime: 280, cooldown: 140}
                ]
            },
            {
                nameSuffix: ", Arauto da Podridão",
                color: "#4B0082", 
                size: 70, speed: 0.22, healthPercentThreshold: 0,
                damageMultiplier: 1.8,
                xp: 300,
                collisionDamage: 38,
                isShooter: true,
                shootRange: 380, projectileDamage: 25, projectileSpeed: 4.5, projectileSize: 12, projectileColor: "#483D8B", attackCooldownBase: 60, projectileLifeTime: 320,
                abilities: [
                    { name: "Campeões da Ruína", type: "spawn_minions", chance: 0.035, minionType: "Super Bactéria", count: 1, isChampionMinion: true, cooldown: 320 },
                    { name: "Campeões da Ruína II", type: "spawn_minions", chance: 0.02, minionType: "Colônia de Levedura", count: 1, isChampionMinion: true, cooldown: 350 },
                    { name: "Pulso da Podridão", type: "area_pulse_damage", chance: 0.025, damage: 22, radius: 180, cooldown: 200, pulseColor: "rgba(75, 0, 130, 0.45)" },
                    { name: "Espiral da Perdição", type: "shoot_volley_pattern", pattern: "spiral", numProjectiles: 24, projectileDamage: 20, projectileSpeed: 4.2, projectileSize: 10, projectileColor: "#6A0DAD", projectileLifeTime: 300, cooldown: 260, chance: 0.03, spiralSpeed: 1.2 }
                ]
            }
        ],
        entryCry: "CONTEMPLEM A PERFEIÇÃO DA DETERIORAÇÃO!",
        deathCry: "A... PODRIDÃO... É... ETERNA..."
    },
    {
        id: "terror_lupular",
        name: "O Terror Lupular",
        baseColorHex: "#006400", 
        totalHealthBase: 720,
        phases: [
            {
                nameSuffix: ": Broto Selvagem",
                color: "#228B22", 
                size: 55, speed: 0.14, healthPercentThreshold: 0.70,
                damageMultiplier: 1.0,
                xp: 130,
                collisionDamage: 22,
                isShooter: true,
                shootRange: 300, projectileDamage: 16, projectileSpeed: 3.0, projectileSize: 7, projectileColor: "#32CD32", attackCooldownBase: 90, projectileLifeTime: 250,
                abilities: [
                    { name: "Esporos Parasitas", type: "spawn_minions", chance: 0.02, minionType: "Mofo Sorrateiro", count: 3, cooldown: 260 },
                    { name: "Rajada de Espinhos", type: "shoot_volley", chance: 0.025, count: 3, spread: Math.PI / 10, projectileDamage: 14, projectileSpeed: 3.5, projectileSize: 6, projectileColor: "#ADFF2F", projectileLifeTime: 220, cooldown: 170},
                    { name: "Pulso de Pólen", type: "area_pulse_damage", chance: 0.01, damage: 10, radius: 120, cooldown: 320, pulseColor: "rgba(173, 255, 47, 0.3)"}
                ]
            },
            {
                nameSuffix: ": Videira Furiosa",
                color: "#556B2F", 
                size: 65, speed: 0.19, healthPercentThreshold: 0.35,
                damageMultiplier: 1.5,
                xp: 200,
                collisionDamage: 33,
                isShooter: true,
                shootRange: 340, projectileDamage: 20, projectileSpeed: 3.8, projectileSize: 8, projectileColor: "#6B8E23", attackCooldownBase: 70, projectileLifeTime: 280,
                abilities: [
                    { name: "Chicote de Vinhas", type: "shoot_volley", chance: 0.03, count: 5, spread: Math.PI / 6, projectileDamage: 18, projectileSpeed: 4.0, projectileSize: 7, projectileColor: "#8FBC8F", projectileLifeTime: 260, cooldown: 150},
                    { name: "Amargor Extremo (Pulso)", type: "area_pulse_damage", chance: 0.015, damage: 15, radius: 160, cooldown: 280, pulseColor: "rgba(85, 107, 47, 0.4)", 
                      onHitPlayerEffect: (player, game) => { 
                          if (!player.activeDebuffs.some(d => d.type === 'amargor')) {
                              const originalDamageMultiplier = player.damageOutputMultiplier || 1;
                              player.damageOutputMultiplier = (player.damageOutputMultiplier || 1) * 0.75; 
                              player.activeDebuffs.push({type: 'amargor', duration: 300, revert: (p) => { if(p) p.damageOutputMultiplier = originalDamageMultiplier; }});
                              game.utils.createFloatingText("Amargo!", player.x, player.y -15, "#FFFF00", 14, game);
                              setTimeout(() => {
                                  if(player) player.damageOutputMultiplier = originalDamageMultiplier;
                                  if(player) player.activeDebuffs = player.activeDebuffs.filter(d => d.type !== 'amargor');
                              }, 5000); 
                          }
                      }
                    },
                    { name: "Investida Selvagem", type: "charge_attack", chance: 0.01, speedMultiplier: 4.0, duration: 60, cooldown: 500 }
                ]
            },
            {
                nameSuffix: ": Floração Devastadora",
                color: "#006400", 
                size: 75, speed: 0.23, healthPercentThreshold: 0,
                damageMultiplier: 2.0,
                xp: 350,
                collisionDamage: 42,
                isShooter: true,
                shootRange: 400, projectileDamage: 26, projectileSpeed: 4.2, projectileSize: 9, projectileColor: "#2E8B57", attackCooldownBase: 50, projectileLifeTime: 300,
                abilities: [
                    { name: "Polinizadores Mutantes", type: "spawn_minions", chance: 0.03, minionType: "Colônia de Levedura", count: 2, isChampionMinion: true, cooldown: 300 },
                    { name: "Explosão de Lúpulo", type: "shoot_volley_pattern", pattern: "burst_explosive", numProjectiles: 8, projectileDamage: 22, projectileSpeed: 3.5, projectileSize: 10, projectileColor: "#90EE90", projectileLifeTime: 200, cooldown: 240, chance: 0.025, 
                      
                      
                      
                      
                    },
                    { name: "Tempestade de Espinhos", type: "shoot_volley_pattern", pattern: "radial_barrage", numProjectiles: 36, projectileDamage: 15, projectileSpeed: 5, projectileSize: 5, projectileColor: "#3CB371", projectileLifeTime: 350, cooldown: 320, chance: 0.035 }
                ]
            }
        ],
        entryCry: "SINTA A FÚRIA DA NATUREZA DESCONTROLADA!",
        deathCry: "O... AMARGOR... SE... VAI..."
    }
];

