
import { enemyTypes as regularAndChampionEnemyTypes } from './config/enemy-types.js';
import { bossTypes } from './config/boss-types.js';
import { enemyAfixes as importedEnemyAfixes } from './config/enemy-afixes.js';
import { beerActivities as importedBeerActivities, quizCategoryNames as importedQuizCategoryNames } from './config/quiz-data.js';
import { roundConditions as importedRoundConditions } from './config/round-conditions.js';
import { processUpgrades as importedProcessUpgrades } from './config/process-upgrades.js';
import { masterTechniques as importedMasterTechniques } from './config/master-techniques.js';
import { 
    permanentMarketUpgrades as importedPermanentMarketUpgrades, 
    marketMasterTechniques as importedMarketMasterTechniques, 
    marketSeasonings as importedMarketSeasonings 
} from './config/market-items.js';


export const PLAYER_BASE_SPEED = 2.5;
export const PLAYER_BASE_HEALTH = 100;
export const PLAYER_SIZE = 20;

export const ENEMY_SPAWN_INTERVAL_INITIAL = 120; 
export const MAX_ENEMIES_BASE = 30;

export const XP_ORB_VALUE_BASE = 3;
export const XP_TO_NEXT_LEVEL_BASE = 10;

export const MARKET_ROUND_INTERVAL = 3;
export const BOSS_ROUND_INTERVAL = 5;

export const ENEMY_MAX_SPEED_MULTIPLIER = 1.8;
export const ENEMY_MODIFIER_CHANCE_PER_ROUND_INCREMENT = 0.5;
export const MAX_ENEMY_MODIFIERS = 6;

export const NORMAL_ROUND_DURATION_SECONDS = 65; 
export const BOSS_DEFEATED_COOLDOWN_SECONDS = 3.5; 




export const enemyTypes = { 
    regular: regularAndChampionEnemyTypes.regular,
    champion: regularAndChampionEnemyTypes.champion,
    boss: bossTypes 
};

export const enemyAfixes = importedEnemyAfixes;
export const beerActivities = importedBeerActivities;
export const quizCategoryNames = importedQuizCategoryNames;
export const roundConditions = importedRoundConditions;
export const processUpgrades = importedProcessUpgrades;
export const masterTechniques = importedMasterTechniques;
export const permanentMarketUpgrades = importedPermanentMarketUpgrades;
export const marketMasterTechniques = importedMarketMasterTechniques;
export const marketSeasonings = importedMarketSeasonings;