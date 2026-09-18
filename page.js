// Balance system
class BalanceSystem {
    constructor() {
        this.balance = 0;
        this.bonusAmount = 2;
        this.bonusCooldown = 1800000;
        this.lastBonusTime = null;


        this.cashbackPercent = 0.05;
        this.cashbackAmount = 0;       // накоплено
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.updateDisplay();
        this.updateCashbackDisplay();
        this.setupEventListeners();
        this.checkBonusAvailability();
        console.log("init");
    }
    
    loadFromStorage() {
        const savedBalance = localStorage.getItem('casinoBalance');
        const savedTime = localStorage.getItem('lastBonusTime');
        console.log("load");
        if (savedBalance) {
            this.balance = parseFloat(savedBalance);
        }
        const savedCashback = localStorage.getItem('casinoCashback');
        if (savedCashback) {
            this.cashbackAmount = parseFloat(savedCashback);
        }
        
        if (savedTime) {
            this.lastBonusTime = parseInt(savedTime);
        }
    }
    
    saveToStorage() {
        
        localStorage.setItem('casinoBalance', this.balance.toString());
        localStorage.setItem('casinoCashback', this.cashbackAmount.toString());
        if (this.lastBonusTime) {
            localStorage.setItem('lastBonusTime', this.lastBonusTime.toString());
        }
    }
    
    setupEventListeners() {
        const button = document.getElementById('but');
        if (button) {
            button.addEventListener('click', () => {
                this.claimBonus();
            });
        }
    }
    
    claimBonus() {
        const now = Date.now();
        
        if (this.lastBonusTime && (now - this.lastBonusTime) < this.bonusCooldown) {
            const timeLeft = this.bonusCooldown - (now - this.lastBonusTime);
            this.showMessage(this.formatTime(timeLeft));
            return;
        }
        
        this.balance += this.bonusAmount;
        this.lastBonusTime = now;
        
        this.updateDisplay();
        this.saveToStorage();
        
        this.showMessage('Бонус $' + this.bonusAmount + ' собран! Баланс: $' + this.balance.toFixed(2), 'success');
        this.checkBonusAvailability();
    }
    
    checkBonusAvailability() {
        const button = document.getElementById('but');
        if (!button) return;
        
        const now = Date.now();
        
        if (this.lastBonusTime && (now - this.lastBonusTime) < this.bonusCooldown) {
            const timeLeft = this.bonusCooldown - (now - this.lastBonusTime);
            button.innerHTML = this.formatTime(timeLeft);
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
            
            setTimeout(() => this.checkBonusAvailability(), 1000);
        } else {
            button.innerHTML = 'Бонус 🎁';
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        
        return [
            (minutes % 60).toString().padStart(2, '0'),
            (seconds % 60).toString().padStart(2, '0')
        ].join(':');
    }
    
    updateDisplay() {
        const balanceElement = document.getElementById('balanceValue');
        if (balanceElement) {
            balanceElement.textContent = '$' + this.balance.toFixed(2);
        }
    }
    
    showMessage(text, type = 'error') {
        console.log('Message:', text, type); // Отладка
        
        let messageContainer = document.getElementById('messageContainer');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.style.position = 'fixed';
            messageContainer.style.top = '20px';
            messageContainer.style.right = '20px';
            messageContainer.style.zIndex = '1000';
            messageContainer.style.maxWidth = '300px';
            document.body.appendChild(messageContainer);
        }
        
        const message = document.createElement('div');
        const backgroundColor = type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
        
        message.style.background = backgroundColor;
        message.style.color = 'white';
        message.style.padding = '15px 20px';
        message.style.marginBottom = '10px';
        message.style.borderRadius = '10px';
        message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.fontSize = '16px';
        message.style.textAlign = 'center';
        
        message.textContent = text;
        messageContainer.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }
    
    addMoney(amount) {
        this.balance += amount;
        this.updateDisplay();
        this.saveToStorage();
        return this.balance;
    }
    
    subtractMoney(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.updateDisplay();
            this.saveToStorage();
            return true;
        }
        return false;
    }
    addToCashback(betAmount) {
    const cashback = betAmount * this.cashbackPercent;
    this.cashbackAmount += cashback;
    this.saveToStorage();
    this.updateCashbackDisplay();
}

claimCashback() {
    if (this.cashbackAmount <= 0) {
        return;
    }
    const amount = this.cashbackAmount;
    this.balance += amount;
    this.cashbackAmount = 0;
    this.updateDisplay();
    this.saveToStorage();
    this.updateCashbackDisplay();
    this.showMessage('Кешбек $' + amount.toFixed(2) + ' собран!', 'success');
}

updateCashbackDisplay() {
    const el = document.getElementById('cashbackAmount');
    if (el) {
        el.textContent = 'Доступно: $' + this.cashbackAmount.toFixed(2);
    }
}
    
    getBalance() {
        return this.balance;
    }
}

// Slots system
// Slots system
class SlotsGame {
    constructor(balanceSystem) {
        this.balanceSystem = balanceSystem;
        this.speedMultiplier = 1; // 1 = обычная, 0.5 = ускорение в 2 раза
        this.betAmount = 0.01;
        this.symbols = ['💎', '🍉', '🍓', '🍇', '🍋', '🍒'];
        this.multipliers = {
            '💎': 20,
            '🍉': 10,
            '🍓': 7,
            '🍇': 4,
            '🍋': 3,
            '🍒': 2
        };
        this.fourMatchBonus = 5;
        this.isSpinning = false;

        // 8 барабанов: 4 сверху (line1) + 4 снизу (line2)
        this.reelIds = [
            'reel1', 'reel2', 'reel3', 'reel4',
            'reel5', 'reel6', 'reel7', 'reel8'
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateWinDisplay(0);
        this.updateBetDisplay();
    }

    setupEventListeners() {
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }

        const cashbackBtn = document.getElementById('cashbackButton');
        if (cashbackBtn) {
            cashbackBtn.addEventListener('click', () => {
                this.balanceSystem.claimCashback();
            });
        }

        const betButtons = document.querySelectorAll('.bet-btn');
        betButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setBetAmount(parseFloat(e.target.dataset.bet));
                this.updateActiveBetButton(e.target);
            });
        });

        if (betButtons.length > 0) {
            this.updateActiveBetButton(betButtons[0]);
        }
        const speedBtn = document.getElementById('speedToggle');
if (speedBtn) {
    speedBtn.addEventListener('click', () => {
        if (this.speedMultiplier === 1) {
            this.speedMultiplier = 0.3;
            speedBtn.textContent = '⚡';
            speedBtn.classList.add('active');
        } else {
            this.speedMultiplier = 1;
            speedBtn.textContent = '⚡';
            speedBtn.classList.remove('active');
        }
    });
}
    }

    setBetAmount(amount) {
        this.betAmount = amount;
        this.updateBetDisplay();
    }

    updateActiveBetButton(activeButton) {
        const betButtons = document.querySelectorAll('.bet-btn');
        betButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    updateBetDisplay() {
        const betInfo = document.querySelector('.bet-info span');
        if (betInfo) {
            betInfo.textContent = 'Ставка: $' + this.betAmount.toFixed(2);
        }
        this.updatePayoutsDisplay();
    }

    updatePayoutsDisplay() {
        const payoutItems = document.querySelectorAll('.payout-item');
        const payouts = [
            { symbol: '💎', multiplier: 20 },
            { symbol: '🍉', multiplier: 10 },
            { symbol: '🍓', multiplier: 7 },
            { symbol: '🍇', multiplier: 4 },
            { symbol: '🍋', multiplier: 3 },
            { symbol: '🍒', multiplier: 2 }
        ];

        payouts.forEach((payout, index) => {
            const win3 = this.betAmount * payout.multiplier;
            const win4 = win3 * this.fourMatchBonus;
        });
    }
    getSymbolClass(symbol) {
    const map = {
        '💎': 'sym-diamond',
        '🍉': 'sym-watermelon',
        '🍓': 'sym-strawberry',
        '🍇': 'sym-grape',
        '🍋': 'sym-lemon',
        '🍒': 'sym-cherry'
    };
    return map[symbol] || '';
}

    spin() {
        if (this.isSpinning) {
            console.log('Уже вращается!');
            return;
        }

        // Ставка списывается ОДИН раз на обе линии
        if (!this.balanceSystem.subtractMoney(this.betAmount)) {
            this.balanceSystem.showMessage('Недостаточно денег! Нужно $' + this.betAmount.toFixed(2));
            return;
        }
        this.balanceSystem.addToCashback(this.betAmount);

        this.isSpinning = true;
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.disabled = true;
            spinButton.textContent = 'Вращается...';
        }

        this.updateWinDisplay(0);
        this.animateSpin();

        const result = this.generateSpinResult();
        console.log('Результат:', result);

        setTimeout(() => {
            this.displayFinalResult(result);

            setTimeout(() => {
                const winAmount = this.calculateWin(result);
                console.log('Общий выигрыш:', winAmount);

                if (winAmount > 0) {
                    this.balanceSystem.addMoney(winAmount);
                    this.updateWinDisplay(winAmount);
                    this.balanceSystem.showMessage('Ты выиграл $' + winAmount.toFixed(2) + '!', 'success');
                    this.triggerWinAnimation(result);
                }

                this.isSpinning = false;
                if (spinButton) {
                    spinButton.disabled = false;
                    spinButton.textContent = '🔁 Крутить';
                }
            }, 2000 * this.speedMultiplier);
        }, 1000 * this.speedMultiplier);
    }

    animateSpin() {
        this.reelIds.forEach((id, index) => {
            const reel = document.getElementById(id);
            reel.classList.remove('win-animation');
            if (!reel) return;

            reel.classList.add('spinning');

            let spinCount = 0;
            const maxSpins = 2 + (index % 4) * 2; // для каждой линии своя задержка
            const spinInterval = setInterval(() => {
                const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                reel.textContent = randomSymbol;

                reel.classList.remove('sym-diamond', 'sym-watermelon', 'sym-strawberry',
                     'sym-grape', 'sym-lemon', 'sym-cherry');
const cls = this.getSymbolClass(randomSymbol);
if (cls) reel.classList.add(cls);
                spinCount++;

                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);
                }
            }, 200 * this.speedMultiplier);
        });
    }

    // Генерируем 8 независимых символов
    generateSpinResult() {
        return this.reelIds.map(() =>
            this.symbols[Math.floor(Math.random() * this.symbols.length)]
        );
    }

displayFinalResult(result) {
    this.reelIds.forEach((id, index) => {
        const reel = document.getElementById(id);
        if (!reel) return;

        const posInLine = index % 4;
        setTimeout(() => {
            reel.textContent = result[index];
            reel.classList.remove('spinning');

            // сброс старых цветов
            reel.classList.remove('sym-diamond', 'sym-watermelon', 'sym-strawberry',
                                 'sym-grape', 'sym-lemon', 'sym-cherry');

            // новый цвет
            const cls = this.getSymbolClass(result[index]);
            if (cls) reel.classList.add(cls);

        }, (150 + posInLine * 500) * this.speedMultiplier);
    });
}

    calculateWin(result) {
        // Разбиваем 8 символов на две линии по 4
        const line1 = result.slice(0, 4);
        const line2 = result.slice(4, 8);

        const win1 = this.calculateLineWin(line1);
        const win2 = this.calculateLineWin(line2);

        console.log('Линия 1:', line1, '→', win1);
        console.log('Линия 2:', line2, '→', win2);

        return win1 + win2;
    }

    // Считает выигрыш для одной линии из 4 символов
    calculateLineWin(line) {
        const [a, b, c, d] = line;

        // 4 одинаковых
        if (a === b && b === c && c === d) {
            const multiplier = this.multipliers[a];
            if (multiplier !== undefined) {
                return this.betAmount * multiplier * this.fourMatchBonus;
            }
        }

        // 3 одинаковых на первых трёх
        if (a === b && b === c) {
            const multiplier = this.multipliers[a];
            if (multiplier !== undefined) {
                return this.betAmount * multiplier;
            }
        }

        // 2 алмаза
        if (a === '💎' && a === b) {
            return this.betAmount * 3;
        }

        // 2 арбуза
        if (a === '🍉' && a === b) {
            return this.betAmount * 2;
        }

        return 0;
    }

    triggerWinAnimation(result) {
        // Анимируем только те барабаны, что реально в выигрышной комбинации
        const winIndexes = [];

        const line1 = result.slice(0, 4);
        const line2 = result.slice(4, 8);

        if (this.calculateLineWin(line1) > 0) winIndexes.push(0, 1, 2, 3);
        if (this.calculateLineWin(line2) > 0) winIndexes.push(4, 5, 6, 7);

        winIndexes.forEach(i => {
            const reel = document.getElementById(this.reelIds[i]);
            if (!reel) return;

            reel.classList.add('win-animation');
            setTimeout(() => reel.classList.remove('win-animation'), 1500);
        });
    }

    updateWinDisplay(amount) {
        const winElement = document.getElementById('winAmount');
        if (winElement) {
            winElement.textContent = 'Выигрыш: $' + amount.toFixed(2);
            if (amount > 0) {
                winElement.style.color = '#4CAF50';
                winElement.style.textShadow = '0 0 10px #4CAF50';
            } else {
                winElement.style.color = 'white';
                winElement.style.textShadow = 'none';
            }
        }
    }
}
// НЕ УБИРАЙ ЭТО!!!
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing game...');

    setTimeout(() => {
        window.balanceSystem = new BalanceSystem();
        window.slotsGame = new SlotsGame(window.balanceSystem);
        console.log('Game initialized successfully!');
    }, 100);
});
