
export const processUpgrades = [
    
    {id:"firerate_small", name:"Ajuste Fino da Bomba", description:"Aumenta a velocidade de 'ataque' em 8%.", apply:(game)=>{game.playerWeapon.fireRate = Math.max(5, Math.floor(game.playerWeapon.fireRate * 0.92)); }},
    {id:"firerate_medium", name:"Brassagem Rápida", description:"Aumenta a velocidade de 'ataque' em 15%.", apply:(game)=>{game.playerWeapon.fireRate = Math.max(5, Math.floor(game.playerWeapon.fireRate * 0.85));}},
    {id:"damage_small", name:"Sanitizante Concentrado", description:"Aumenta o 'dano' base em 10%.", apply:(game)=>{game.playerWeapon.baseDamage=Math.ceil(game.playerWeapon.baseDamage*1.10); }},
    {id:"damage_medium", name:"Sanitizante Potente", description:"Aumenta o 'dano' base em 20%.", apply:(game)=>{game.playerWeapon.baseDamage=Math.ceil(game.playerWeapon.baseDamage*1.20); }},
    {id:"crit_chance_small", name:"Olhar Atento", description:"Aumenta a chance de crítico base em 3%.", apply:(game)=>{game.playerWeapon.baseCritChance = (game.playerWeapon.baseCritChance || 0.05) + 0.03; }},
    {id:"crit_damage_small", name:"Impacto Preciso", description:"Aumenta o multiplicador de dano crítico em 25% (ex: 1.5x -> 1.75x).", apply:(game)=>{game.playerWeapon.critMultiplier = (game.playerWeapon.critMultiplier || 1.5) + 0.25;}},

    
    {id:"projectiles_plus_one", name:"Multi-Sanitização", description:"Dispara +1 jato de sanitizante.", apply:(game)=>{game.playerWeapon.projectilesPerShot++;}},
    {id:"piercing_plus_one", name:"Sanitização Penetrante", description:"Jatos atravessam +1 contaminante.", apply:(game)=>{game.playerWeapon.piercing++;}},
    {id:"projectilespeed_small", name:"Jatos Ágeis", description:"Aumenta a velocidade dos jatos em 10%.", apply:(game)=>{game.playerWeapon.projectileSpeed*=1.10;}},
    {id:"projectilespeed_medium", name:"Jatos Pressurizados", description:"Aumenta a velocidade dos jatos em 20%.", apply:(game)=>{game.playerWeapon.projectileSpeed*=1.20;}},
    {id:"projectilelifetime_small", name:"Jatos Persistentes", description:"Aumenta o tempo de vida dos jatos em 20%.", apply:(game)=>{game.playerWeapon.projectileLifeTime = (game.playerWeapon.projectileLifeTime || 180) * 1.20;}},
    {id:"projectilelifetime_medium", name:"Jatos Duradouros", description:"Aumenta o tempo de vida dos jatos em 40%.", apply:(game)=>{game.playerWeapon.projectileLifeTime = (game.playerWeapon.projectileLifeTime || 180) * 1.40;}},
    {id:"projectile_size_small", name:"Bicos Alargados", description:"Aumenta o tamanho dos jatos em 10%.", apply:(game)=>{game.playerWeapon.projectileSize = Math.ceil(game.playerWeapon.projectileSize * 1.10);}},

    
    {id:"health_small", name:"Tanques Reforçados Leves", description:"Aumenta a Vida Máxima em 15.", apply:(game)=>{game.player.maxHealth+=15;game.player.heal(15); }},
    {id:"health_medium", name:"Tanques Reforçados Padrão", description:"Aumenta a Vida Máxima em 30.", apply:(game)=>{game.player.maxHealth+=30;game.player.heal(30);}},
    {id:"speed_small", name:"Botas Confortáveis", description:"Aumenta a velocidade de movimento base em 8%.", apply:(game)=>{game.player.baseSpeed*=1.08; }},
    {id:"speed_medium", name:"Logística Eficiente", description:"Aumenta a velocidade de movimento base em 15%.", apply:(game)=>{game.player.baseSpeed*=1.15; }},
    {id:"collectionradius_small", name:"Coleta Otimizada", description:"Aumenta o raio de coleta de XP em 15%.", apply:(game)=>{game.player.xpCollectionRadius*=1.15;}},
    {id:"collectionradius_medium", name:"Coleta Ampliada", description:"Aumenta o raio de coleta de XP em 30%.", apply:(game)=>{game.player.xpCollectionRadius*=1.30;}},
    {id:"shield_on_levelup", name:"Recompensa por Otimização", description:"Ganha um pequeno escudo (10pts) ao subir de nível.", apply:(game)=>{
        game.player.gainsShieldOnLevelUp = (game.player.gainsShieldOnLevelUp || 0) + 10;
        game.player.currentShield = Math.min((game.player.maxShield || 0) + 10, game.player.currentShield + 10);
        if(!game.player.maxShield || game.player.maxShield < game.player.currentShield) game.player.maxShield = game.player.currentShield; 
    }},
    {id:"heal_on_crit", name:"Vigor do Mestre", description:"Pequena chance (5%) de curar 1 de vida ao causar dano crítico.", apply:(game)=>{
        game.player.canHealOnCrit = true;
        game.player.healOnCritChance = 0.05;
        game.player.healOnCritAmount = 1;
    }},
];