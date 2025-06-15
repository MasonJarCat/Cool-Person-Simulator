class CoolDadGame {
    constructor() {
        this.coolPoints = 0;
        this.prestigeLevel = 0;
        this.unlockedActivities = new Set(['cool']); // Track permanently unlocked activities
        this.activities = [
            {
                id: 'cool',
                name: 'Just Being Cool',
                icon: '😎',
                baseRate: 1,
                currentRate: 1,
                level: 1,
                cost: 10,
                baseCost: 10,
                description: 'Natural coolness at work!',
                unlockThreshold: 0
            },
            {
                id: 'walks',
                name: 'Going on Walks',
                icon: '🚶‍♂️',
                baseRate: 5,
                currentRate: 0,
                level: 0,
                cost: 25,
                baseCost: 25,
                description: 'Getting those steps in!',
                unlockThreshold: 50
            },
            {
                id: 'theatre',
                name: 'Community Theatre',
                icon: '🎭',
                baseRate: 25,
                currentRate: 0,
                level: 0,
                cost: 100,
                baseCost: 100,
                description: 'Break a leg out there!',
                unlockThreshold: 200
            },
            {
                id: 'accounting',
                name: 'Forensic Accounting',
                icon: '🔍',
                baseRate: 100,
                currentRate: 0,
                level: 0,
                cost: 500,
                baseCost: 500,
                description: 'Following the money trail!',
                unlockThreshold: 1000
            },
            {
                id: 'league',
                name: 'Playing League of Legends',
                icon: '🎮',
                baseRate: 500,
                currentRate: 0,
                level: 0,
                cost: 2500,
                baseCost: 2500,
                description: 'Carrying the team to victory!',
                unlockThreshold: 5000
            },
            {
                id: 'enhance',
                name: 'Enhance Coolness',
                icon: '✨',
                baseRate: 0,
                currentRate: 0,
                level: 0,
                cost: 10000,
                baseCost: 10000,
                description: '2x multiplier for ALL activities!',
                unlockThreshold: 25000
            }
        ];
        
        this.coolLevels = [
            { threshold: 0, title: "Getting Started" },
            { threshold: 100, title: "Somewhat Cool Person" },
            { threshold: 500, title: "Pretty Cool Person" },
            { threshold: 1000, title: "Really Cool Person" },
            { threshold: 2500, title: "Super Cool Person" },
            { threshold: 5000, title: "Ultra Cool Person" },
            { threshold: 10000, title: "Mega Cool Person" },
            { threshold: 25000, title: "Epic Cool Person" },
            { threshold: 50000, title: "Legendary Cool Person" },
            { threshold: 100000, title: "Mythical Cool Person" },
            { threshold: 250000, title: "Godlike Cool Person" },
            { threshold: 500000, title: "Transcendent Cool Person" },
            { threshold: 1000000, title: "Wait... you're just Dad!" }
        ];
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.renderActivities();
        this.startGameLoop();
        this.setupEventListeners();
    }
    
    renderActivities() {
        const grid = document.getElementById('activitiesGrid');
        grid.innerHTML = '';
        
        // Show activities that are unlocked (either by points or previously unlocked)
        const visibleActivities = this.activities.filter(activity => 
            this.unlockedActivities.has(activity.id) || this.coolPoints >= activity.unlockThreshold
        );
        
        // Add newly unlocked activities to the permanent set
        this.activities.forEach(activity => {
            if (this.coolPoints >= activity.unlockThreshold) {
                this.unlockedActivities.add(activity.id);
            }
        });
        
                        visibleActivities.forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card';
            
            // Special display for Enhance Coolness
            let statsHTML = '';
            if (activity.id === 'enhance') {
                const multiplier = activity.level > 0 ? Math.pow(2, activity.level) : 1;
                statsHTML = `
                    <div class="stat-row">
                        <span>Level:</span>
                        <span>${activity.level}</span>
                    </div>
                    <div class="stat-row">
                        <span>Current Multiplier:</span>
                        <span>${multiplier}x</span>
                    </div>
                    <div class="stat-row">
                        <span>${activity.description}</span>
                    </div>
                `;
            } else {
                statsHTML = `
                    <div class="stat-row">
                        <span>Level:</span>
                        <span>${activity.level}</span>
                    </div>
                    <div class="stat-row">
                        <span>Cool Points/sec:</span>
                        <span>${activity.currentRate.toFixed(1)}</span>
                    </div>
                    <div class="stat-row">
                        <span>${activity.description}</span>
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div class="activity-header">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-title">${activity.name}</div>
                </div>
                <div class="activity-stats">
                    ${statsHTML}
                </div>
                <button class="upgrade-btn" data-activity-id="${activity.id}" 
                        ${this.coolPoints < activity.cost ? 'disabled' : ''}>
                    Upgrade - ${this.formatNumber(activity.cost)} cool points
                </button>
            `;
            grid.appendChild(card);
        });
        
        // Show next unlock hint for activities not yet unlocked
        const nextActivity = this.activities.find(activity => 
            !this.unlockedActivities.has(activity.id) && this.coolPoints < activity.unlockThreshold
        );
        
        if (nextActivity) {
            const hintCard = document.createElement('div');
            hintCard.className = 'activity-card';
            hintCard.style.opacity = '0.6';
            hintCard.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
            hintCard.innerHTML = `
                <div class="activity-header">
                    <div class="activity-icon">🔒</div>
                    <div class="activity-title">??? Activity Locked</div>
                </div>
                <div class="activity-stats">
                    <div class="stat-row">
                        <span>Unlock at:</span>
                        <span>${this.formatNumber(nextActivity.unlockThreshold)} cool points</span>
                    </div>
                    <div class="stat-row">
                        <span>Progress:</span>
                        <span>${((this.coolPoints / nextActivity.unlockThreshold) * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <button class="upgrade-btn" disabled>
                    Need ${this.formatNumber(nextActivity.unlockThreshold - this.coolPoints)} more points
                </button>
            `;
            grid.appendChild(hintCard);
        }
    }
    
    checkForNewUnlocks() {
        let hasNewUnlock = false;
        
        // Check if any new activities should be unlocked
        this.activities.forEach(activity => {
            if (!this.unlockedActivities.has(activity.id) && this.coolPoints >= activity.unlockThreshold) {
                this.unlockedActivities.add(activity.id);
                hasNewUnlock = true;
            }
        });
        
        // Only re-render if there's a new unlock or if we need to update button states
        if (hasNewUnlock || this.needsButtonUpdate()) {
            this.renderActivities();
        }
    }
    
    needsButtonUpdate() {
        // Check if any button's enabled/disabled state needs to change
        const buttons = document.querySelectorAll('.upgrade-btn[data-activity-id]');
        for (let button of buttons) {
            const activityId = button.getAttribute('data-activity-id');
            const activity = this.activities.find(a => a.id === activityId);
            if (activity) {
                const shouldBeDisabled = this.coolPoints < activity.cost;
                if (button.disabled !== shouldBeDisabled) {
                    return true;
                }
            }
        }
        return false;
    }
    
    upgradeActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity || this.coolPoints < activity.cost) return;
        
        this.coolPoints -= activity.cost;
        activity.level++;
        
        // Special handling for Enhance Coolness
        if (activity.id === 'enhance') {
            activity.currentRate = 0; // Doesn't generate points directly
            activity.cost = Math.floor(activity.baseCost * Math.pow(2, activity.level - 1));
            // Recalculate all other activities when enhance is upgraded
            this.recalculateAllActivities();
        } else {
            // For regular activities
            if (activity.level === 1) {
                activity.currentRate = activity.baseRate * (1 + this.prestigeLevel * 0.5);
            } else {
                activity.currentRate = activity.baseRate * activity.level * (1 + this.prestigeLevel * 0.5);
            }
            
            // Apply enhance coolness multiplier
            const enhanceActivity = this.activities.find(a => a.id === 'enhance');
            if (enhanceActivity && enhanceActivity.level > 0) {
                activity.currentRate *= Math.pow(2, enhanceActivity.level);
            }
            
            activity.cost = Math.floor(activity.baseCost * Math.pow(1.5, activity.level - 1));
        }
        
        // Force immediate re-render after purchase
        this.renderActivities();
        this.saveGame();
    }
    
    recalculateAllActivities() {
        const enhanceActivity = this.activities.find(a => a.id === 'enhance');
        const enhanceMultiplier = enhanceActivity ? Math.pow(2, enhanceActivity.level) : 1;
        
        this.activities.forEach(activity => {
            if (activity.id !== 'enhance' && activity.level > 0) {
                // Recalculate base rate with prestige bonus
                if (activity.level === 1) {
                    activity.currentRate = activity.baseRate * (1 + this.prestigeLevel * 0.5);
                } else {
                    activity.currentRate = activity.baseRate * activity.level * (1 + this.prestigeLevel * 0.5);
                }
                
                // Apply enhance multiplier
                activity.currentRate *= enhanceMultiplier;
            }
        });
    }
    
    startGameLoop() {
        setInterval(() => {
            let totalRate = 0;
            this.activities.forEach(activity => {
                // Only count activities that are unlocked and have been purchased (level > 0)
                if (this.unlockedActivities.has(activity.id) && activity.level > 0) {
                    totalRate += activity.currentRate;
                }
            });
            
            this.coolPoints += totalRate / 10; // 10 updates per second
            this.updateDisplay();
        }, 100);
    }
    
    updateDisplay() {
        document.getElementById('coolPoints').textContent = this.formatNumber(Math.floor(this.coolPoints));
        
        const currentLevel = this.getCurrentCoolLevel();
        document.getElementById('coolLevel').textContent = `Coolness Level: ${currentLevel.title}`;
        
        const nextLevel = this.getNextCoolLevel();
        if (nextLevel) {
            const progress = ((this.coolPoints - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
            document.getElementById('coolProgress').style.width = Math.min(progress, 100) + '%';
        } else {
            document.getElementById('coolProgress').style.width = '100%';
        }
        
        const prestigeBtn = document.getElementById('prestigeBtn');
        prestigeBtn.disabled = this.coolPoints < 1000000;
        
        document.getElementById('prestigeLevel').textContent = `Legend Level: ${this.prestigeLevel}`;
        
        // Only re-render activities if unlocks have changed
        this.checkForNewUnlocks();
    }
    
    getCurrentCoolLevel() {
        let currentLevel = this.coolLevels[0];
        for (let level of this.coolLevels) {
            if (this.coolPoints >= level.threshold) {
                currentLevel = level;
            } else {
                break;
            }
        }
        return currentLevel;
    }
    
    getNextCoolLevel() {
        for (let level of this.coolLevels) {
            if (this.coolPoints < level.threshold) {
                return level;
            }
        }
        return null;
    }
    
    prestige() {
        if (this.coolPoints < 1000000) return;
        
        this.prestigeLevel++;
        this.coolPoints = 0;
        
        // Reset activities but keep some progress
        this.activities.forEach(activity => {
            if (activity.unlockThreshold === 0) {
                // Keep the first activity at level 1
                activity.level = 1;
                activity.currentRate = activity.baseRate * (1 + this.prestigeLevel * 0.5);
            } else {
                // Reset locked activities to level 0
                activity.level = 0;
                activity.currentRate = 0;
            }
            activity.cost = activity.baseCost;
        });
        
        // Recalculate all activities to ensure proper multipliers
        this.recalculateAllActivities();
        
        this.saveGame();
        this.renderActivities();
        
        alert(`🌟 Congratulations! You've ascended to Legend Level ${this.prestigeLevel}! 🌟\nAll activities now generate ${((this.prestigeLevel * 0.5 + 1) * 100).toFixed(0)}% more cool points!`);
    }
    
    setupEventListeners() {
        document.getElementById('prestigeBtn').addEventListener('click', () => this.prestige());
        
        // Add event delegation for upgrade buttons with debouncing
        let clickTimeout = null;
        document.getElementById('activitiesGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-btn') && !e.target.disabled) {
                const activityId = e.target.getAttribute('data-activity-id');
                if (activityId && !clickTimeout) {
                    // Prevent rapid clicking
                    clickTimeout = setTimeout(() => {
                        clickTimeout = null;
                    }, 100);
                    
                    this.upgradeActivity(activityId);
                }
            }
        });
    }
    
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    saveGame() {
        const saveData = {
            coolPoints: this.coolPoints,
            prestigeLevel: this.prestigeLevel,
            activities: this.activities,
            unlockedActivities: Array.from(this.unlockedActivities)
        };
        localStorage.setItem('coolDadGame', JSON.stringify(saveData));
    }
    
    loadGame() {
        const saveData = localStorage.getItem('coolDadGame');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.coolPoints = data.coolPoints || 0;
            this.prestigeLevel = data.prestigeLevel || 0;
            if (data.activities) {
                this.activities = data.activities;
            }
            if (data.unlockedActivities) {
                this.unlockedActivities = new Set(data.unlockedActivities);
            } else {
                // For backward compatibility with old saves
                this.unlockedActivities = new Set(['cool']);
                this.activities.forEach(activity => {
                    if (activity.level > 0 || this.coolPoints >= activity.unlockThreshold) {
                        this.unlockedActivities.add(activity.id);
                    }
                });
            }
        }
    }
}

// Start the game
const game = new CoolDadGame();