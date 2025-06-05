
import { masterTechniques } from './master-techniques.js';

export const permanentMarketUpgrades = [
    { id: "perm_health_boost_1", type: "upgrade", name: "Tanque Reforçado", description: "+25 Vida Máxima.", cost: 120, apply: (game) => { game.player.maxHealth += 25; game.player.heal(25); } },
    { id: "perm_damage_boost_1", type: "upgrade", name: "Bicos Otimizados", description: "+5 Dano Base dos jatos.", cost: 150, apply: (game) => { game.playerWeapon.baseDamage += 5; game.playerWeapon.currentDamage = game.playerWeapon.baseDamage; } },
    { id: "perm_speed_boost_1", type: "upgrade", name: "Carrinho Ágil", description: "+0.2 Velocidade Movimento.", cost: 100, apply: (game) => { game.player.baseSpeed += 0.2; game.player.currentSpeed = game.player.baseSpeed; } },
    { id: "perm_xp_boost_1", type: "upgrade", name: "Manual Avançado", description: "+10% Ganho de XP.", cost: 180, apply: (game) => { game.xpGainMultiplier = (game.xpGainMultiplier || 1) * 1.10; } },
    { id: "perm_crit_chance_1", type: "upgrade", name: "Lentes de Precisão", description: "+3% Chance Crítico.", cost: 130, apply: (game) => { game.playerWeapon.critChance = (game.playerWeapon.critChance || 0.05) + 0.03; } },
    { id: "perm_pickup_radius_1", type: "upgrade", name: "Ímã de Conhecimento", description: "+20% Raio Coleta XP.", cost: 90, apply: (game) => { game.player.xpCollectionRadius *= 1.20; } },
];

export const marketMasterTechniques = masterTechniques.map(tech => ({
    ...tech, 
    id: `market_tech_${tech.id}`, 
    type: "technique", 
    cost: 150 + ( (tech.rarity === "Lendaria") ? 200 : (tech.rarity === "Epica") ? 100 : (tech.rarity === "Rara") ? 50 : 0) 
}));

export const marketSeasonings = [
    { id: "seasoning_strawberry", type: "seasoning", name: "Morango Macerado", description: "+Spawns, +15% XP.", cost: 80, apply: (game) => { game.enemySpawnModifier = (game.enemySpawnModifier || 1) * 0.85; game.xpGainMultiplier = (game.xpGainMultiplier || 1) * 1.15; game.player.activeSeasonings.push({id: "seasoning_strawberry", name: "Morango", description: "+Spawns, +XP"}); } },
    { id: "seasoning_grape", type: "seasoning", name: "Uva Passa", description: "+5% Chance Crítico.", cost: 100, apply: (game) => { game.playerWeapon.critChance = (game.playerWeapon.critChance || 0.05) + 0.05; game.player.activeSeasonings.push({id: "seasoning_grape", name: "Uva Passa", description: "+5% Crítico"}); } },
    { id: "seasoning_cinnamon", type: "seasoning", name: "Canela", description: "+0.15 Velocidade.", cost: 70, apply: (game) => { game.player.baseSpeed += 0.15; game.player.currentSpeed = game.player.baseSpeed; game.player.activeSeasonings.push({id: "seasoning_cinnamon", name: "Canela", description: "+0.15 Vel."}); } },
    { id: "seasoning_hops_extra", type: "seasoning", name: "Lúpulo Extra", description: "+1 PQ por Elite/Chefe.", cost: 120, apply: (game) => { game.bonusQualityPointsPerElite = (game.bonusQualityPointsPerElite || 0) + 1; game.player.activeSeasonings.push({id: "seasoning_hops_extra", name: "Lúpulo Extra", description: "+PQ Elite"}); } },
    { id: "seasoning_coffee_beans", type: "seasoning", name: "Café Tostado", description: "-10% Cooldown Disparo.", cost: 130, apply: (game) => { game.playerWeapon.fireRate = Math.max(5, Math.floor(game.playerWeapon.fireRate * 0.90)); game.player.activeSeasonings.push({id: "seasoning_coffee_beans", name: "Café", description: "-10% CD Disparo"}); } },
    { id: "seasoning_vanilla", type: "seasoning", name: "Extrato de Baunilha", description: "Jatos de sanitizante duram 25% mais.", cost: 90, apply: (game) => { game.playerWeapon.projectileLifeTime = (game.playerWeapon.projectileLifeTime || 180) * 1.25; game.player.activeSeasonings.push({id: "seasoning_vanilla", name: "Baunilha", description: "+Vida Projétil"}); } },
    {
        id: "seasoning_chili_pepper", type: "seasoning", name: "Pimenta Malagueta",
        description: "+12% Dano Base, -5% Velocidade do Jogador.", cost: 110,
        apply: (game) => {
            game.playerWeapon.baseDamage = Math.ceil(game.playerWeapon.baseDamage * 1.12);
            game.playerWeapon.currentDamage = game.playerWeapon.baseDamage;
            game.player.baseSpeed *= 0.95;
            game.player.currentSpeed = game.player.baseSpeed;
            game.player.activeSeasonings.push({id: "seasoning_chili_pepper", name: "Pimenta", description: "+Dano, -Vel."});
        }
    },
    {
        id: "seasoning_candied_ginger", type: "seasoning", name: "Gengibre Cristalizado",
        description: "+15% Velocidade do Projétil, +10 Vida Máxima.", cost: 95,
        apply: (game) => {
            game.playerWeapon.projectileSpeed *= 1.15;
            game.player.maxHealth += 10;
            game.player.heal(10);
            game.player.activeSeasonings.push({id: "seasoning_candied_ginger", name: "Gengibre", description: "+Vel. Projétil, +Vida"});
        }
    },
    {
        id: "seasoning_cloves", type: "seasoning", name: "Cravo-da-Índia",
        description: "Jatos atravessam +1 contaminante adicional.", cost: 140,
        apply: (game) => {
            game.playerWeapon.piercing = (game.playerWeapon.piercing || 0) + 1;
            game.player.activeSeasonings.push({id: "seasoning_cloves", name: "Cravo", description: "+1 Perfuração"});
        }
    },
    {
        id: "seasoning_cardamom", type: "seasoning", name: "Cardamomo",
        description: "+10% Raio de Coleta de XP, +5% Ganho de XP.", cost: 85,
        apply: (game) => {
            game.player.xpCollectionRadius *= 1.10;
            game.xpGainMultiplier = (game.xpGainMultiplier || 1) * 1.05;
            game.player.activeSeasonings.push({id: "seasoning_cardamom", name: "Cardamomo", description: "+Raio XP, +XP"});
        }
    },
    {
        id: "seasoning_bitter_orange", type: "seasoning", name: "Laranja Amarga",
        description: "+20% Multiplicador de Dano Crítico.", cost: 125,
        apply: (game) => {
            game.playerWeapon.critMultiplier = (game.playerWeapon.critMultiplier || 1.5) + 0.20;
            game.player.activeSeasonings.push({id: "seasoning_bitter_orange", name: "Laranja Amarga", description: "+Dano Crítico"});
        }
    },
    {
        id: "seasoning_honey", type: "seasoning", name: "Mel Puro",
        description: "+10 Vida Máxima, +0.1 Regeneração de Vida/s.", cost: 115,
        apply: (game) => {
            game.player.maxHealth += 10;
            game.player.heal(10);
            game.player.healthRegenRate = (game.player.healthRegenRate || 0) + 0.1;
            game.player.activeSeasonings.push({id: "seasoning_honey", name: "Mel", description: "+Vida, +Regen."});
        }
    },
    {
        id: "seasoning_nutmeg", type: "seasoning", name: "Noz-Moscada",
        description: "Leve chance de inimigos comuns droparem +1 PQ.", cost: 150, 
        apply: (game) => {
            game.player.nutmegEffectChance = (game.player.nutmegEffectChance || 0) + 0.05; 
            game.player.activeSeasonings.push({id: "seasoning_nutmeg", name: "Noz-Moscada", description: "Chance +PQ"});
        }
    },
    {
        id: "seasoning_lemon_zest", type: "seasoning", name: "Raspas de Limão",
        description: "+5% Velocidade Mov., -5% Cooldown Disparo.", cost: 100,
        apply: (game) => {
            game.player.baseSpeed *= 1.05;
            game.player.currentSpeed = game.player.baseSpeed;
            game.playerWeapon.fireRate = Math.max(5, Math.floor(game.playerWeapon.fireRate * 0.95));
            game.player.activeSeasonings.push({id: "seasoning_lemon_zest", name: "Limão", description: "+Vel. Mov, -CD Disparo"});
        }
    },
    {
        id: "seasoning_cocoa_nibs", type: "seasoning", name: "Nibs de Cacau",
        description: "+5% Dano Base. Jatos têm 10% de chance de aplicar lentidão leve (1s).", cost: 130,
        apply: (game) => {
            game.playerWeapon.baseDamage = Math.ceil(game.playerWeapon.baseDamage * 1.05);
            game.playerWeapon.currentDamage = game.playerWeapon.baseDamage;
            game.playerWeapon.cocoaSlowChance = 0.10; 
            game.playerWeapon.cocoaSlowDuration = 60; 
            game.player.activeSeasonings.push({id: "seasoning_cocoa_nibs", name: "Cacau", description: "+Dano, Chance Lentidão"});
        }
    },
    {
        id: "seasoning_star_anise", type: "seasoning", name: "Anis Estrelado",
        description: "+15% Tamanho do Projétil, +10% Vida Útil do Projétil.", cost: 105,
        apply: (game) => {
            game.playerWeapon.projectileSize = Math.ceil(game.playerWeapon.projectileSize * 1.15);
            game.playerWeapon.projectileLifeTime = (game.playerWeapon.projectileLifeTime || 180) * 1.10;
            game.player.activeSeasonings.push({id: "seasoning_star_anise", name: "Anis", description: "+Tam/Vida Projétil"});
        }
    },
    {
        id: "seasoning_juniper_berries", type: "seasoning", name: "Bagas de Zimbro",
        description: "+10% Velocidade de Movimento, -5 Vida Máxima.", cost: 75,
        apply: (game) => {
            game.player.baseSpeed *= 1.10;
            game.player.currentSpeed = game.player.baseSpeed;
            game.player.maxHealth = Math.max(10, game.player.maxHealth - 5); 
            if (game.player.health > game.player.maxHealth) game.player.health = game.player.maxHealth;
            game.player.activeSeasonings.push({id: "seasoning_juniper_berries", name: "Zimbro", description: "+Vel. Mov, -Vida Máx."});
        }
    },
    {
        id: "seasoning_maple_syrup", type: "seasoning", name: "Xarope de Bordo",
        description: "+10% Ganho de XP, ganha 5 de Escudo ao coletar.", cost: 140,
        apply: (game) => {
            game.xpGainMultiplier = (game.xpGainMultiplier || 1) * 1.10;
            game.player.currentShield = Math.min((game.player.maxShield || 0) + 5, game.player.currentShield + 5);
            if(!game.player.maxShield || game.player.maxShield < game.player.currentShield) game.player.maxShield = game.player.currentShield;
            game.player.activeSeasonings.push({id: "seasoning_maple_syrup", name: "Bordo", description: "+XP, +Escudo"});
        }
    },
    {
        id: "seasoning_rosemary", type: "seasoning", name: "Alecrim Fresco",
        description: "-7% Cooldown Disparo, +2% Chance Crítico.", cost: 110,
        apply: (game) => {
            game.playerWeapon.fireRate = Math.max(5, Math.floor(game.playerWeapon.fireRate * 0.93));
            game.playerWeapon.critChance = (game.playerWeapon.critChance || 0.05) + 0.02;
            game.player.activeSeasonings.push({id: "seasoning_rosemary", name: "Alecrim", description: "-CD Disparo, +Crítico"});
        }
    },
    {
        id: "seasoning_lavender", type: "seasoning", name: "Flores de Lavanda",
        description: "Jatos têm 5% de chance de reduzir velocidade do inimigo atingido por 2s.", cost: 90,
        apply: (game) => {
            game.playerWeapon.lavenderSpeedReduceChance = 0.05;
            game.playerWeapon.lavenderSpeedReduceDuration = 120; 
            game.playerWeapon.lavenderSpeedReduceFactor = 0.7; 
            game.player.activeSeasonings.push({id: "seasoning_lavender", name: "Lavanda", description: "Chance Vel. Inimigo"});
        }
    },
    {
        id: "seasoning_mint_leaves", type: "seasoning", name: "Folhas de Hortelã",
        description: "+0.2 Regeneração de Vida/s, +5% Raio de Coleta XP.", cost: 120,
        apply: (game) => {
            game.player.healthRegenRate = (game.player.healthRegenRate || 0) + 0.2;
            game.player.xpCollectionRadius *= 1.05;
            game.player.activeSeasonings.push({id: "seasoning_mint_leaves", name: "Hortelã", description: "+Regen Vida, +Raio XP"});
        }
    },
    {
        id: "seasoning_saffron_threads", type: "seasoning", name: "Pistilos de Açafrão",
        description: "Aumenta em +2 os Pontos de Qualidade (PQ) ganhos de Elites/Chefes.", cost: 250,
        apply: (game) => {
            game.bonusQualityPointsPerElite = (game.bonusQualityPointsPerElite || 0) + 2;
            game.player.activeSeasonings.push({id: "seasoning_saffron_threads", name: "Açafrão", description: "++PQ Elite/Chefe"});
        }
    }
];