
export const masterTechniques = [
    { id: "jato_guiado", name: "Jato Teleguiado", description: "Jatos perseguem contaminantes.", mechanics: "Jatos ganham leve perseguição.", type: "PROJECTILE_MOD_HOMING_WEAK", value: 0.04, rarity: "Rara", apply: function(p, pW) { pW.isHoming = true; pW.homingStrength = (pW.homingStrength || 0) + this.value; } },
    {
    id: "limpeza_explosiva",
    name: "Limpeza Explosiva",
    description: "Seus sanitizantes agora explodem ao contato ou no fim de sua trajetória, causando dano em área.",
    mechanics: "Projéteis causam dano em área. O dano da explosão é o dano do projétil mais um bônus.",
    rarity: "rara",
    apply: (player, weapon) => {
        weapon.canExplode = true; 
        weapon.explosionRadius = (weapon.explosionRadius || 0) + 40; 
        
        
        
        const bonusExplosionDamageFromTechnique = Math.round(weapon.baseDamage * 2.35); 
        weapon.techniqueBaseExplosionDamage = (weapon.techniqueBaseExplosionDamage || 0) + bonusExplosionDamageFromTechnique;
        
        console.log(`[Technique Limpeza Explosiva] Applied. Weapon explosionRadius: ${weapon.explosionRadius}, techniqueBaseExplosionDamage: ${weapon.techniqueBaseExplosionDamage} (added ${bonusExplosionDamageFromTechnique})`);
    }
},
    { id: "fermentacao_robusta", name: "Fermentação Robusta", description: "Regenera 'vida' ao longo do tempo.", mechanics: "Recupera 0.5 integridade/s.", type: "PLAYER_ABILITY_HEALTH_REGEN", value: 0.5, rarity: "Comum", apply: function(p, pW) { p.healthRegenRate = (p.healthRegenRate || 0) + this.value; } },
    { id: "escudo_de_mosto", name: "Escudo de Mosto", description: "Ganha um escudo que absorve dano.", mechanics: "Ganha um escudo com 25 pontos.", type: "PLAYER_ABILITY_SHIELD", value: 25, cooldown: 1200, rarity: "Rara", apply: function(p, pW) { p.maxShield = (p.maxShield || 0) + this.value; p.currentShield = Math.min(p.maxShield, p.currentShield + this.value); } },
    { id: "sanitizacao_veloz", name: "Sanitização Veloz", description: "Jatos de sanitizante viajam mais rápido.", mechanics: "Aumenta a velocidade dos projéteis em 15%.", type: "PROJECTILE_MOD_SPEED_INCREASE", value: 1.15, rarity: "Comum", apply: function(p, pW) { pW.projectileSpeed *= this.value; } },
    { id: "foco_apurado", name: "Foco Apurado", description: "Leve aumento na chance de acerto crítico base.", mechanics: "+2% Chance de Crítico Base.", type: "PLAYER_ABILITY_CRIT_CHANCE", value: 0.02, rarity: "Comum", apply: function(p, pW) { pW.baseCritChance = (pW.baseCritChance || 0.05) + this.value; } },
    { id: "jatos_ricocheteantes", name: "Jatos Ricocheteantes", description: "Jatos podem ricochetear em um inimigo adicional.", mechanics: "Projéteis ganham +1 ricochete.", type: "PROJECTILE_MOD_RICOCHET", value: 1, rarity: "Rara", apply: function(p, pW) { pW.maxRicochets = (pW.maxRicochets || 0) + this.value; } },
    { id: "aura_sanitizante", name: "Aura Sanitizante", description: "Emite uma aura que causa dano leve contínuo a inimigos próximos.", mechanics: "Causa 5 de dano/0.5s em raio de 50.", type: "PLAYER_ABILITY_AURA_DAMAGE", value: 5, radius: 50, rarity: "Rara", apply: function(p, pW) { p.auraDamage = (p.auraDamage || 0) + this.value; p.auraRadius = Math.max(p.auraRadius || 0, this.radius); } },
    { id: "chuva_de_sanitizante", name: "Chuva de Sanitizante", description: "Aumenta significativamente a quantidade de jatos e a dispersão.", mechanics: "+2 projéteis, +150% dispersão.", type: "PROJECTILE_MOD_MULTI_WIDE", value: 2, spreadFactor: 2.5, rarity: "Epica", apply: function(p, pW) { pW.projectilesPerShot += this.value; pW.spreadAngle *= this.spreadFactor; } },
    { id: "golpe_critico_potente", name: "Golpe Crítico Potente", description: "Aumenta drasticamente o multiplicador de dano crítico.", mechanics: "+100% Multiplicador de Crítico (ex: 1.5x -> 2.5x).", type: "PLAYER_ABILITY_CRIT_MULTIPLIER", value: 1.0, rarity: "Epica", apply: function(p, pW) { pW.critMultiplier = (pW.critMultiplier || 1.5) + this.value; } },
    { id: "mestre_da_brassagem", name: "Mestre da Brassagem", description: "Melhora geral nos atributos de combate e um pequeno escudo.", mechanics: "+10% Dano Base, -10% Cooldown Tiro, +1 Projétil. +10 Escudo Máx.", type: "PLAYER_SUPER_BUFF", rarity: "Lendaria", apply: function(p, pW) { pW.baseDamage = Math.ceil(pW.baseDamage * 1.10); pW.fireRate = Math.max(5, Math.floor(pW.fireRate * 0.90)); pW.projectilesPerShot++; p.maxShield = (p.maxShield || 0) + 10; p.currentShield = Math.min(p.maxShield, p.currentShield + 10); } },
    { id: "essencia_purificadora", name: "Essência Purificadora",
    description: "Jatos causam dano massivo e têm grande chance de crítico base, mas a cadência de tiro é reduzida.", mechanics: "+100% Dano Base, +25% Chance Crítico Base, +50% Cooldown Tiro.", type: "PROJECTILE_HIGH_DAMAGE_SLOW_FIRE", rarity: "Lendaria", apply: function(p, pW) { pW.baseDamage = Math.ceil(pW.baseDamage * 2.0); pW.baseCritChance = (pW.baseCritChance || 0.05) + 0.25; pW.fireRate = Math.floor(pW.fireRate * 1.50); } }
];