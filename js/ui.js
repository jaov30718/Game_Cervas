
import { quizCategoryNames, processUpgrades, masterTechniques } from './config.js';
import { getRandomInt, distance, createFloatingText } from './utils.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.healthBarEl = document.getElementById('healthBar');
        this.xpBarEl = document.getElementById('xpBar');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.roundDisplay = document.getElementById('roundDisplay');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.enemyCountDisplay = document.getElementById('enemyCountDisplay');
        this.qualityPointsDisplay = document.getElementById('qualityPointsDisplay'); 
        this.playerActiveSeasoningsCards = document.getElementById('playerActiveSeasoningsCards');

        this.levelUpModal = document.getElementById('levelUpModal');
        this.upgradeOptionsContainer = document.getElementById('upgradeOptionsContainer');
        this.quizModal = document.getElementById('quizModal');
        this.quizActivityText = document.getElementById('quizActivityText');
        this.quizOptionsContainer = document.getElementById('quizOptionsContainer');
        this.quizFeedbackText = document.getElementById('quizFeedbackText');
        this.marketModal = document.getElementById('marketModal');
        this.marketItemsContainer = document.getElementById('marketItemsContainer');
        this.closeMarketButton = document.getElementById('closeMarketButton');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.survivalTimeDisplay = document.getElementById('survivalTimeDisplay');
        this.finalRoundDisplay = document.getElementById('finalRoundDisplay');
        this.finalLevelDisplay = document.getElementById('finalLevelDisplay');
        this.pauseModal = document.getElementById('pauseModal');

        this.eventNotificationDisplay = document.getElementById('eventNotificationDisplay');
        this.eventNotificationText = document.getElementById('eventNotificationText');
        this.playerMasterTechniquesCards = document.getElementById('playerMasterTechniquesCards');
        this.playerActiveConditionsCards = document.getElementById('playerActiveConditionsCards');

        if (this.closeMarketButton) {
            this.closeMarketButton.addEventListener('click', () => {
                this.game.audioManager.playSFX('buttonClick'); 
                this.game.gameLogic.closeMarket();
            });
        }
        const restartButton = document.querySelector('#gameOverModal .modal-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.game.audioManager.playSFX('buttonClick'));
        }
        const continueButton = document.querySelector('#pauseModal .modal-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => this.game.audioManager.playSFX('buttonClick'));
        }
    }

    updateAll() {
        this.updateHealthBarUI();
        this.updateXPBarUI();
        this.updateLevelDisplay();
        this.updateRoundDisplay();
        this.updateTimerDisplay();
        this.updateEnemyCountDisplay();
        this.updatePlayerPowersDisplay();
        if (this.qualityPointsDisplay && this.game.player) {
            this.qualityPointsDisplay.textContent = this.game.player.qualityPoints || 0;
        }
    }

    updateHealthBarUI() { if (this.game.player && this.healthBarEl) this.healthBarEl.style.width = `${(this.game.player.health / this.game.player.maxHealth) * 100}%`; }
    updateXPBarUI() { if (this.xpBarEl) this.xpBarEl.style.width = `${(this.game.currentXP / this.game.xpToNextLevel) * 100}%`; }
    updateLevelDisplay() { if (this.levelDisplay) this.levelDisplay.textContent = this.game.level; }
    updateRoundDisplay() { if (this.roundDisplay) this.roundDisplay.textContent = this.game.currentRound; }
    updateTimerDisplay() { if (this.timerDisplay) this.timerDisplay.textContent = `${Math.floor(this.game.roundTimer / 60)}s`; }
    updateEnemyCountDisplay() { if (this.enemyCountDisplay) this.enemyCountDisplay.textContent = this.game.enemies.length; }

    showNotification(message, duration = 3000) {
        if (!this.eventNotificationDisplay || !this.eventNotificationText) return;
        this.eventNotificationText.textContent = message;
        this.eventNotificationDisplay.classList.add('visible');
        setTimeout(() => {
            if (this.eventNotificationDisplay) this.eventNotificationDisplay.classList.remove('visible');
        }, duration);
    }

    showLevelUpModal() {
        if (!this.levelUpModal || !this.upgradeOptionsContainer) return;
        this.upgradeOptionsContainer.innerHTML = '';
        const availableUpgrades = [...processUpgrades]; 
        let offeredTechnique = null;

        if (Math.random() < 0.25 && masterTechniques.length > 0) { 
            const unlearnedTechniques = masterTechniques.filter(
                mt => !this.game.playerMasterTechniques.some(pt => pt.id === mt.id)
            );
            if (unlearnedTechniques.length > 0) {
                 offeredTechnique = unlearnedTechniques[this.game.utils.getRandomInt(0, unlearnedTechniques.length - 1)];
            }
        }

        const numOptions = 3;
        const chosenUpgrades = [];

        if (offeredTechnique) {
            chosenUpgrades.push({ isMasterTechnique: true, ...offeredTechnique });
        }

        while (chosenUpgrades.length < numOptions && availableUpgrades.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
            chosenUpgrades.push(availableUpgrades.splice(randomIndex, 1)[0]);
        }
        
        for (let i = chosenUpgrades.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chosenUpgrades[i], chosenUpgrades[j]] = [chosenUpgrades[j], chosenUpgrades[i]];
        }

        chosenUpgrades.forEach(upgradeData => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('upgrade-option');
            if (upgradeData.isMasterTechnique) {
                optionDiv.innerHTML = `<strong>${upgradeData.name} (TÉCNICA <span style="color:gold">★</span>)</strong>
                                     <p class="master-technique-description">${upgradeData.description}</p>
                                     <p class="master-technique-mechanics">${upgradeData.mechanics}</p>`;
            } else {
                optionDiv.innerHTML = `<strong>${upgradeData.name}</strong>
                                     <p style="font-size:0.9em; color: #5a4a31;">${upgradeData.description}</p>`;
            }
            optionDiv.onclick = () => {
                this.game.audioManager.playSFX('buttonClick'); 
                this.game.gameLogic.selectUpgrade(upgradeData);
            }
            this.upgradeOptionsContainer.appendChild(optionDiv);
        });
        this.levelUpModal.style.display = 'block';
        this.game.audioManager.playSFX('modalOpen'); 
    }
    hideLevelUpModal() { if (this.levelUpModal) this.levelUpModal.style.display = 'none'; }

    showQuizModal(activity) {
        if (!this.quizModal || !this.quizActivityText || !this.quizOptionsContainer || !this.quizFeedbackText) return;
        this.quizActivityText.textContent = activity.activity;
        this.quizOptionsContainer.innerHTML = '';
        this.quizFeedbackText.textContent = '';

        
        let oldProceedButton = this.quizModal.querySelector('.modal-button.proceed-quiz');
        if (oldProceedButton) oldProceedButton.remove();

        const categories = ["AV", "NVA-N", "NVA"];
        categories.forEach(catKey => {
            const button = document.createElement('button');
            button.classList.add('quiz-option-button');
            button.textContent = quizCategoryNames[catKey];
            button.dataset.category = catKey;
            button.onclick = (event) => {
                this.game.audioManager.playSFX('buttonClick'); 
                this.game.gameLogic.answerQuiz(catKey, activity.category, event.target);
            }
            this.quizOptionsContainer.appendChild(button);
        });

        
        const proceedButton = document.createElement('button');
        proceedButton.classList.add('modal-button', 'proceed-quiz'); 
        proceedButton.textContent = 'Próximo Round';
        proceedButton.disabled = true; 
        proceedButton.onclick = () => {
            this.game.audioManager.playSFX('buttonClick'); 
            this.game.gameLogic.proceedFromQuiz();
        }
        this.quizModal.appendChild(proceedButton); 

        this.quizModal.style.display = 'block';
        this.game.audioManager.playSFX('modalOpen'); 
    }

    updateQuizFeedback(isCorrect, correctAnswerCategoryKey, chosenButton) {
        if (!this.quizFeedbackText || !this.quizOptionsContainer) return;
        const correctAnswerText = quizCategoryNames[correctAnswerCategoryKey];
        if (isCorrect) {
            this.quizFeedbackText.textContent = `Correto! A atividade é "${correctAnswerText}". Você ganhou um BUFF!`;
            this.quizFeedbackText.style.color = 'green';
            if(chosenButton) chosenButton.classList.add('correct');
        } else {
            this.quizFeedbackText.textContent = `Incorreto. A resposta certa era "${correctAnswerText}". Você recebeu um DEBUFF.`;
            this.quizFeedbackText.style.color = 'red';
            if(chosenButton) chosenButton.classList.add('chosen-incorrect');
        }

        const buttons = this.quizOptionsContainer.querySelectorAll('.quiz-option-button');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.category === correctAnswerCategoryKey && !isCorrect) { 
                btn.classList.add('correct'); 
            }
        });

        
        const proceedButton = this.quizModal.querySelector('.modal-button.proceed-quiz');
        if (proceedButton) {
            proceedButton.disabled = false;
        }
    }

    hideQuizModal() { 
        if (this.quizModal) {
            this.quizModal.style.display = 'none'; 
            
            if(this.quizFeedbackText) this.quizFeedbackText.textContent = '';
            let oldProceedButton = this.quizModal.querySelector('.modal-button.proceed-quiz');
            if (oldProceedButton) oldProceedButton.remove();
        }
    }


    showMarketModal(items) {
        if (!this.marketModal || !this.marketItemsContainer || !this.qualityPointsDisplay) return;
        this.marketItemsContainer.innerHTML = '';
        this.qualityPointsDisplay.textContent = this.game.player.qualityPoints || 0;

        if (items.length === 0) {
            this.marketItemsContainer.innerHTML = '<p>Nenhum item novo disponível no mercado desta vez.</p>';
        } else {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('market-item-button');

                let itemDisplayName = item.name;
                if (item.type === 'seasoning') itemDisplayName = `Tempero: ${item.name}`;
                else if (item.type === 'technique') itemDisplayName = `Técnica: ${item.name}`;

                itemDiv.innerHTML = `<strong>${itemDisplayName}</strong> (${item.cost} PQ)
                                     <p style="font-size:0.85em; color: #5a4a31;">${item.description}</p>`;

                if (this.game.purchasedMarketItemIds.includes(item.id)) {
                    itemDiv.innerHTML += `<p style="color: #c0392b; font-weight: bold; margin-top: 5px;">ESGOTADO</p>`;
                    itemDiv.disabled = true;
                    itemDiv.style.opacity = 0.6;
                    itemDiv.style.cursor = 'default';
                } else if ((this.game.player.qualityPoints || 0) < item.cost) {
                    itemDiv.disabled = true;
                    itemDiv.style.opacity = 0.6;
                    itemDiv.style.cursor = 'not-allowed';
                    itemDiv.title = "Pontos de Qualidade insuficientes.";
                } else {
                    if (!itemDiv.disabled) { 
                        itemDiv.onclick = () => {
                            this.game.audioManager.playSFX('buttonClick'); 
                            if (this.game.gameLogic.purchaseMarketItem(item)) {
                                this.showMarketModal(this.game.gameLogic.getMarketItems(false));
                            }
                            };
                    }
                }
                this.marketItemsContainer.appendChild(itemDiv);
                this.game.audioManager.playSFX('modalOpen'); 
            });
        }
        this.marketModal.style.display = 'block';
    }
    hideMarketModal() { if (this.marketModal) this.marketModal.style.display = 'none'; }

    showGameOverModal() {
        if (!this.gameOverModal || !this.survivalTimeDisplay || !this.finalRoundDisplay || !this.finalLevelDisplay) return;
        this.survivalTimeDisplay.textContent = Math.floor(this.game.totalGameTime / 60);
        this.finalRoundDisplay.textContent = this.game.currentRound;
        this.finalLevelDisplay.textContent = this.game.level;
        this.gameOverModal.style.display = 'block';
        this.game.audioManager.playSFX('modalOpen');
    }
    hideGameOverModal() { if (this.gameOverModal) this.gameOverModal.style.display = 'none'; }

    togglePauseModal(show) {
        if (!this.pauseModal) return;
        this.pauseModal.style.display = show ? 'block' : 'none';
        if (show) {
            this.game.audioManager.playSFX('modalOpen');
        } else {
            
            
            
        }
    }

   updatePlayerPowersDisplay() {
        if (!this.playerMasterTechniquesCards || !this.playerActiveConditionsCards || !this.playerActiveSeasoningsCards) return;

        this.playerMasterTechniquesCards.innerHTML = '';
        if (!this.game.playerMasterTechniques || this.game.playerMasterTechniques.length === 0) {
            this.playerMasterTechniquesCards.innerHTML = '<p class="text-xs" style="color: #d0c0a0;">Nenhuma técnica especial.</p>';
        } else {
            this.game.playerMasterTechniques.forEach(tech => {
                const techDiv = document.createElement('div');
                techDiv.classList.add('master-technique-card');
                if (tech.rarity) techDiv.classList.add(`technique-rarity-${tech.rarity.toLowerCase()}`);
                techDiv.innerHTML = `<strong>${tech.name}</strong>
                                     <span class="text-xs" style="color: #e0d0b0;">${tech.description.substring(0,50)}...</span>`; 
                techDiv.title = `${tech.name}: ${tech.description} (${tech.mechanics})`; 
                this.playerMasterTechniquesCards.appendChild(techDiv);
            });
        }

        this.playerActiveConditionsCards.innerHTML = '';
        if (!this.game.activeConditions || this.game.activeConditions.length === 0) {
            this.playerActiveConditionsCards.innerHTML = '<p class="text-xs" style="color: #d0c0a0;">Condições normais.</p>';
        } else {
            this.game.activeConditions.forEach(cond => {
                const condDiv = document.createElement('div');
                condDiv.classList.add('condition-card');
                condDiv.classList.add(cond.data.type === 'buff' ? 'condition-buff' : 'condition-debuff');
                const roundsLeft = (cond.startRound + cond.durationRounds) - this.game.currentRound;
                condDiv.innerHTML = `<strong>${cond.data.name}</strong>
                                     <span class="text-xs" style="color: #e0d0b0;">(${roundsLeft > 1 ? `${roundsLeft} rounds` : `${roundsLeft} round`})</span>`;
                condDiv.title = cond.data.description;
                this.playerActiveConditionsCards.appendChild(condDiv);
            });
        }

        this.playerActiveSeasoningsCards.innerHTML = '';
        if (!this.game.player || !this.game.player.activeSeasonings || this.game.player.activeSeasonings.length === 0) {
            this.playerActiveSeasoningsCards.innerHTML = '<p class="text-xs" style="color: #d0c0a0;">Sem temperos adicionados.</p>';
        } else {
            this.game.player.activeSeasonings.forEach(seasoning => {
                const seasoningDiv = document.createElement('div');
                seasoningDiv.classList.add('condition-card'); 
                seasoningDiv.style.borderLeft = "4px solid #DAA520"; 
                seasoningDiv.innerHTML = `<strong>${seasoning.name}</strong>`;
                seasoningDiv.title = seasoning.description; 
                this.playerActiveSeasoningsCards.appendChild(seasoningDiv);
            });
        }

        if (this.game.resizeCanvas) this.game.resizeCanvas();
    }
}