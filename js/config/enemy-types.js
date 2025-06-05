
export const enemyTypes = {
    regular: [
        {
            name: "Bactéria Comum", color: "#aaffaa", baseColorHex: "#aaffaa", sizeMin: 12, sizeMax: 18,
            speedBase: 0.25, healthBase: 20, xpBase: 2, damageBase: 8,
            isShooter: false
        },
        {
            name: "Levedura Selvagem", color: "#ffddaa", baseColorHex: "#ffddaa", sizeMin: 15, sizeMax: 22,
            speedBase: 0.18, healthBase: 30, xpBase: 3, damageBase: 6,
            isShooter: true, shootRange: 180, projectileDamage: 7, projectileSpeed: 3, projectileSize: 4, projectileColor: "#FF8C00", attackCooldownBase: 140, projectileLifeTime: 180
        },
        {
            name: "Mofo Sorrateiro", color: "#E0E0E0", baseColorHex: "#E0E0E0", sizeMin: 10, sizeMax: 15,
            speedBase: 0.35, healthBase: 15, xpBase: 1, damageBase: 5,
            isShooter: false
        }
    ],
    champion: [ 
        {
            name: "Super Bactéria", baseName: "Bactéria Comum", cry: "IMPARÁVEL!", color: '#77FF77', baseColorHex: '#77FF77',
            healthMultiplier: 2.8, sizeMultiplier: 1.4, damageMultiplier: 1.0, xpMultiplier: 4,
            isShooter: true, shootRange: 160, projectileDamage: 9, projectileSpeed: 2.8, projectileSize: 5, projectileColor: "#50C878", attackCooldownBase: 170, projectileLifeTime: 210
        },
        {
            name: "Colônia de Levedura", baseName: "Levedura Selvagem", cry: "A PRAGA SE ESPALHA!", color: '#FFBF80', baseColorHex: '#FFBF80',
            healthMultiplier: 2.2, speedMultiplier: 0.9, damageMultiplier: 0.8, xpMultiplier: 4.5,
            isShooter: true, shootRange: 230, projectileDamage: 8, projectileSpeed: 3, projectileSize: 5, projectileColor: "#FFA500", attackCooldownBase: 110, projectileLifeTime: 240
        },
        {
            name: "Nuvem de Mofo Tóxico", baseName: "Mofo Sorrateiro", cry: "SUFOQUE NA TOXINA!", color: "#A9A9A9", baseColorHex: "#A9A9A9",
            healthMultiplier: 3.2, sizeMultiplier: 1.8, damageMultiplier: 1.2, xpMultiplier: 3.5,
            isShooter: true, shootRange: 120, projectileDamage: 6, projectileSpeed: 3.2, projectileSize: 3, projectileColor: "#696969", attackCooldownBase: 80, projectileLifeTime: 150
        },
        
        {
            name: "Aglomerado Pútrido",
            baseName: "Bactéria Comum", 
            cry: "NÓS SOMOS MUITOS!", 
            color: '#8B4513', baseColorHex: '#8B4513',
            healthMultiplier: 4.5, 
            sizeMultiplier: 2.0, 
            speedMultiplier: 0.6,
            damageMultiplier: 1.8,
            xpMultiplier: 6,
            isShooter: true, 
            shootRange: 80, 
            projectileDamage: 12, 
            projectileSpeed: 0, 
            projectileSize: 80, 
            projectileColor: "rgba(100, 40, 130,0.3)", 
            attackCooldownBase: 200,
            projectileLifeTime: 10,
            
            canSplinterOnDamage: true, 
            splinterThresholdPercent: 0.25, 
            splinterCount: 2, 
            splinterType: "Bactéria Comum", 
        },
        {
            name: "Ceifador Bacterial",
            baseName: "Levedura Selvagem",
            cry: "SUA HORA CHEGOU!",
            color: '#DC143C', baseColorHex: '#DC143C',
            healthMultiplier: 3.0,
            sizeMultiplier: 1.6,
            speedMultiplier: 0.9,
            damageMultiplier: 1.3,
            xpMultiplier: 5,
            isShooter: true,
            shootRange: 200,
            attackCooldownBase: 100,
            projectilesPerShotChampion: 3, 
            spreadAngleChampion: Math.PI / 9, 
            projectileDamage: 7, 
            projectileSpeed: 3,
            projectileSize: 6,
            projectileColor: "#FF4500", 
            projectileLifeTime: 180,
        },
        {
            name: "Vigia Fúngico",
            baseName: "Mofo Sorrateiro",
            cry: "VOCÊ NÃO PODE SE ESCONDER!",
            color: '#4B0082', baseColorHex: '#4B0082',
            healthMultiplier: 2.5,
            sizeMultiplier: 1.3,
            speedMultiplier: 0.7,
            damageMultiplier: 1.25,
            xpMultiplier: 5.5,
            isShooter: true,
            shootRange: 250,
            attackCooldownBase: 220, 
            projectileDamage: 12, 
            projectileSpeed: 3,
            projectileSize: 7,
            projectileColor: "#9400D3",
            projectileLifeTime: 300,
            
            hasChargedShot: true, 
            chargeShotDuration: 90, 
        }
    ]
};