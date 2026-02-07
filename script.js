// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    diceCount: 2,
    diceType: 6,
    rngMode: 'random', // 'random' or 'balanced'
    displayMode: 'total', // 'total' or 'individual'
    history: [],
    statistics: {},
    balancedDeck: [] // For balanced mode: stores remaining values in the "deck"
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    diceCount: document.getElementById('diceCount'),
    diceCountValue: document.getElementById('diceCountValue'),
    diceType: document.getElementById('diceType'),
    randomMode: document.getElementById('randomMode'),
    balancedMode: document.getElementById('balancedMode'),
    totalMode: document.getElementById('totalMode'),
    individualMode: document.getElementById('individualMode'),
    rollBtn: document.getElementById('rollBtn'),
    totalDisplay: document.getElementById('totalDisplay'),
    individualDisplay: document.getElementById('individualDisplay'),
    historyList: document.getElementById('historyList'),
    statsBtn: document.getElementById('statsBtn'),
    resetBtn: document.getElementById('resetBtn'),
    statsModal: document.getElementById('statsModal'),
    closeModal: document.getElementById('closeModal'),
    totalRolls: document.getElementById('totalRolls'),
    distributionChart: document.getElementById('distributionChart')
};

// ========================================
// WEB AUDIO API - SOUND SYNTHESIS
// ========================================

let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playDiceSound() {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a percussive "clatter" sound using white noise burst
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(80, now);
    oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
}

// ========================================
// BALANCED RNG - "DECK/BAG" SYSTEM
// ========================================

/**
 * Balanced Mode Algorithm:
 * - Creates a "deck" containing all possible outcomes for the selected dice type
 * - For a D6, the deck contains [1, 2, 3, 4, 5, 6]
 * - Shuffle this deck using Fisher-Yates algorithm
 * - Draw from the deck sequentially
 * - When the deck is empty, refill and reshuffle
 * - This ensures perfect uniform distribution over the long run
 */

function initBalancedDeck() {
    state.balancedDeck = [];
    for (let i = 1; i <= state.diceType; i++) {
        state.balancedDeck.push(i);
    }
    shuffleDeck();
}

function shuffleDeck() {
    // Fisher-Yates shuffle for true randomness
    for (let i = state.balancedDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.balancedDeck[i], state.balancedDeck[j]] = [state.balancedDeck[j], state.balancedDeck[i]];
    }
}

function drawFromDeck() {
    // If deck is empty, refill and reshuffle
    if (state.balancedDeck.length === 0) {
        initBalancedDeck();
    }
    // Draw one card from the deck
    return state.balancedDeck.pop();
}

// ========================================
// DICE ROLLING LOGIC
// ========================================

function rollDice() {
    const results = [];
    
    for (let i = 0; i < state.diceCount; i++) {
        let value;
        
        if (state.rngMode === 'balanced') {
            value = drawFromDeck();
        } else {
            // Standard random: 1 to diceType (inclusive)
            value = Math.floor(Math.random() * state.diceType) + 1;
        }
        
        results.push(value);
    }
    
    return results;
}

function displayResults(results) {
    const sum = results.reduce((acc, val) => acc + val, 0);
    
    // Update statistics
    updateStatistics(results);
    
    // Update display based on mode
    if (state.displayMode === 'total') {
        elements.totalDisplay.classList.remove('hidden');
        elements.individualDisplay.classList.add('hidden');
        elements.totalDisplay.querySelector('.result-number').textContent = sum;
    } else {
        elements.totalDisplay.classList.add('hidden');
        elements.individualDisplay.classList.remove('hidden');
        renderIndividualDice(results);
    }
    
    // Update history
    addToHistory(results, sum);
}

function renderIndividualDice(results) {
    elements.individualDisplay.innerHTML = '';
    results.forEach(value => {
        const die = document.createElement('div');
        die.className = 'die';
        die.textContent = value;
        elements.individualDisplay.appendChild(die);
    });
}

// ========================================
// HISTORY MANAGEMENT
// ========================================

function addToHistory(results, sum) {
    const entry = {
        results,
        sum,
        timestamp: new Date().toLocaleTimeString()
    };
    
    state.history.unshift(entry);
    
    // Keep only last 5 rolls
    if (state.history.length > 5) {
        state.history.pop();
    }
    
    renderHistory();
}

function renderHistory() {
    elements.historyList.innerHTML = '';
    state.history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.timestamp}: [${entry.results.join(', ')}] = ${entry.sum}`;
        elements.historyList.appendChild(li);
    });
}

// ========================================
// STATISTICS
// ========================================

function updateStatistics(results) {
    results.forEach(value => {
        if (!state.statistics[value]) {
            state.statistics[value] = 0;
        }
        state.statistics[value]++;
    });
}

function showStatistics() {
    const totalRolls = Object.values(state.statistics).reduce((acc, val) => acc + val, 0);
    elements.totalRolls.textContent = totalRolls;
    
    // Render distribution chart
    elements.distributionChart.innerHTML = '';
    
    if (totalRolls === 0) {
        elements.distributionChart.innerHTML = '<p style="color: var(--text-secondary);">No rolls yet. Start rolling!</p>';
        return;
    }
    
    // Sort by dice value
    const sortedStats = Object.entries(state.statistics).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    const maxCount = Math.max(...Object.values(state.statistics));
    
    sortedStats.forEach(([value, count]) => {
        const percentage = (count / totalRolls * 100).toFixed(1);
        const barWidth = (count / maxCount * 100);
        
        const barContainer = document.createElement('div');
        barContainer.className = 'distribution-bar';
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = value;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${barWidth}%`;
        bar.style.minWidth = '60px';
        
        const barValue = document.createElement('span');
        barValue.className = 'bar-value';
        barValue.textContent = `${count} (${percentage}%)`;
        
        bar.appendChild(barValue);
        barContainer.appendChild(label);
        barContainer.appendChild(bar);
        elements.distributionChart.appendChild(barContainer);
    });
    
    elements.statsModal.classList.remove('hidden');
}

function resetSession() {
    if (confirm('Reset all statistics and history?')) {
        state.history = [];
        state.statistics = {};
        initBalancedDeck();
        renderHistory();
        elements.totalDisplay.querySelector('.result-number').textContent = '--';
        elements.individualDisplay.innerHTML = '';
    }
}

// ========================================
// EVENT HANDLERS
// ========================================

function handleRoll() {
    initAudio(); // Initialize audio context on user interaction
    playDiceSound();
    const results = rollDice();
    displayResults(results);
}

function handleDiceCountChange() {
    state.diceCount = parseInt(elements.diceCount.value);
    elements.diceCountValue.textContent = state.diceCount;
}

function handleDiceTypeChange() {
    state.diceType = parseInt(elements.diceType.value);
    // Reset balanced deck when dice type changes
    if (state.rngMode === 'balanced') {
        initBalancedDeck();
    }
}

function handleRngModeChange(mode) {
    state.rngMode = mode;
    elements.randomMode.classList.toggle('active', mode === 'random');
    elements.balancedMode.classList.toggle('active', mode === 'balanced');
    
    if (mode === 'balanced') {
        initBalancedDeck();
    }
}

function handleDisplayModeChange(mode) {
    state.displayMode = mode;
    elements.totalMode.classList.toggle('active', mode === 'total');
    elements.individualMode.classList.toggle('active', mode === 'individual');
}

// ========================================
// EVENT LISTENERS
// ========================================

elements.diceCount.addEventListener('input', handleDiceCountChange);
elements.diceType.addEventListener('change', handleDiceTypeChange);
elements.rollBtn.addEventListener('click', handleRoll);
elements.randomMode.addEventListener('click', () => handleRngModeChange('random'));
elements.balancedMode.addEventListener('click', () => handleRngModeChange('balanced'));
elements.totalMode.addEventListener('click', () => handleDisplayModeChange('total'));
elements.individualMode.addEventListener('click', () => handleDisplayModeChange('individual'));
elements.statsBtn.addEventListener('click', showStatistics);
elements.resetBtn.addEventListener('click', resetSession);
elements.closeModal.addEventListener('click', () => elements.statsModal.classList.add('hidden'));

// Close modal on backdrop click
elements.statsModal.addEventListener('click', (e) => {
    if (e.target === elements.statsModal) {
        elements.statsModal.classList.add('hidden');
    }
});

// ========================================
// INITIALIZATION
// ========================================

function init() {
    initBalancedDeck();
    handleDiceCountChange();
}

init();
