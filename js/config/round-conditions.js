
export const roundConditions = {
    INGREDIENTES_FRESCOS: {
        id: "INGREDIENTES_FRESCOS", 
        name: "Ingredientes Frescos", type: "buff", description: "Aumento de 15% no dano dos jatos.",
        statModifiers: [{ target: "playerWeapon.damage", multiplier: 1.15 }],
        effect: (game) => {  },
        revert: (game) => {  }
    },
    EQUIPE_MOTIVADA: {
        id: "EQUIPE_MOTIVADA",
        name: "Equipe Motivada", type: "buff", description: "Aumento de 10% na velocidade de movimento.",
        statModifiers: [{ target: "player.speed", multiplier: 1.10 }],
        effect: (game) => { },
        revert: (game) => { }
    },
    LIMPEZA_IMPECÁVEL: {
        id: "LIMPEZA_IMPECÁVEL",
        name: "Limpeza Impecável", type: "buff", description: "+10% de chance de crítico.",
        
        
        
        
        statModifiers: [{ target: "playerWeapon.critChance", additive: 0.10 }],
        effect: (game) => { },
        revert: (game) => { }
    },
    MATERIA_PRIMA_DUVIDOSA: {
        id: "MATERIA_PRIMA_DUVIDOSA",
        name: "Matéria Prima Duvidosa", type: "debuff", description: "Redução de 10% no dano dos jatos.",
        statModifiers: [{ target: "playerWeapon.damage", multiplier: 0.90 }],
        effect: (game) => { },
        revert: (game) => { }
    },
    FADIGA_OPERACIONAL: {
        id: "FADIGA_OPERACIONAL",
        name: "Fadiga Operacional", type: "debuff", description: "Redução de 10% na velocidade de movimento.",
        statModifiers: [{ target: "player.speed", multiplier: 0.90 }],
        effect: (game) => { },
        revert: (game) => { }
    },
    CONTAMINACAO_LEVE: { 
        id: "CONTAMINACAO_LEVE",
        name: "Contaminação Leve", type: "debuff", description: "Inimigos 10% mais resistentes.",
        
        effect: (game) => game.enemyHealthMultiplier = (game.enemyHealthMultiplier || 1) * 1.10,
        revert: (game) => game.enemyHealthMultiplier /= 1.10
    }
};