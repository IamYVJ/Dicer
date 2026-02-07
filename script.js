// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    diceCount: 2,
    diceType: 6,
    rngMode: 'random',
    displayMode: 'total',
    theme: 'light',
    multiplayerEnabled: false,
    playerCount: 2,
    currentPlayer: 0,
    players: [],
    history: [],
    statistics: {
        dice: {},
        totals: {}
    },
    balancedDeck: []
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    themeToggle: document.getElementById('themeToggle'),
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
    multiplayerToggle: document.getElementById('multiplayerToggle'),
    playerControls: document.getElementById('playerControls'),
    playerCount: document.getElementById('playerCount'),
    playerCountValue: document.getElementById('playerCountValue'),
    playerList: document.getElementById('playerList'),
    playerIndicator: document.getElementById('playerIndicator'),
    currentPlayerName: document.getElementById('currentPlayerName'),
    statsBtn: document.getElementById('statsBtn'),
    historyBtn: document.getElementById('historyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    statsModal: document.getElementById('statsModal'),
    historyModal: document.getElementById('historyModal'),
    closeStatsModal: document.getElementById('closeStatsModal'),
    closeHistoryModal: document.getElementById('closeHistoryModal'),
    diceStatsBtn: document.getElementById('diceStatsBtn'),
    totalStatsBtn: document.getElementById('totalStatsBtn'),
    playerStatsSelector: document.getElementById('playerStatsSelector'),
    statsPlayerSelect: document.getElementById('statsPlayerSelect'),
    totalRolls: document.getElementById('totalRolls'),
    avgRoll: document.getElementById('avgRoll'),
    statsChart: document.getElementById('statsChart'),
    historyList: document.getElementById('historyList')
};

// ========================================
// INITIALIZATION
// ========================================

function init() {
    loadTheme();
    initBalancedDeck();
    updatePlayerList();
    setupEventListeners();
}

// ========================================
// THEME MANAGEMENT
// ========================================

function loadTheme() {
    const savedTheme = localStorage.getItem('dicerTheme') || 'light';
    state.theme = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    localStorage.setItem('dicerTheme', state.theme);
}

// ========================================
// AUDIO SYNTHESIS
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
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(100, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    oscillator.start(now);
    oscillator.stop(now + 0.12);
}

// ========================================
// BALANCED RNG - DECK SYSTEM
// ========================================

function initBalancedDeck() {
    state.balancedDeck = [];
    for (let i = 1; i <= state.diceType; i++) {
        state.balancedDeck.push(i);
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = state.balancedDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.balancedDeck[i], state.balancedDeck[j]] = [state.balancedDeck[j], state.balancedDeck[i]];
    }
}

function drawFromDeck() {
    if (state.balancedDeck.length === 0) {
        initBalancedDeck();
    }
    return state.balancedDeck.pop();
}

// ========================================
// DICE ROLLING
// ========================================

function rollDice() {
    const results = [];
    
    for (let i = 0; i < state.diceCount; i++) {
        let value;
        if (state.rngMode === 'balanced') {
            value = drawFromDeck();
        } else {
            value = Math.floor(Math.random() * state.diceType) + 1;
        }
        results.push(value);
    }
    
    return results;
}

function handleRoll() {
    initAudio();
    playDiceSound();
    
    const results = rollDice();
    const sum = results.reduce((acc, val) => acc + val, 0);
    
    const playerName = state.multiplayerEnabled ? state.players[state.currentPlayer] : null;
    
    updateStatistics(results, sum, playerName);
    addToHistory(results, sum, playerName);
    displayResults(results, sum);
    
    if (state.multiplayerEnabled) {
        advancePlayer();
    }
}

function displayResults(results, sum) {
    if (state.displayMode === 'total') {
        elements.totalDisplay.classList.remove('hidden');
        elements.individualDisplay.classList.add('hidden');
        elements.totalDisplay.querySelector('.result-number').textContent = sum;
    } else {
        elements.totalDisplay.classList.add('hidden');
        elements.individualDisplay.classList.remove('hidden');
        renderIndividualDice(results);
    }
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
// MULTIPLAYER MANAGEMENT
// ========================================

function updatePlayerList() {
    state.players = [];
    for (let i = 1; i <= state.playerCount; i++) {
        state.players.push(`Player ${i}`);
    }
    
    renderPlayerList();
    updatePlayerIndicator();
}

function renderPlayerList() {
    elements.playerList.innerHTML = '';
    state.players.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `player-item ${index === state.currentPlayer ? 'active' : ''}`;
        
        const name = document.createElement('span');
        name.className = 'player-name';
        name.textContent = player;
        
        const btn = document.createElement('button');
        btn.className = 'player-select-btn';
        btn.textContent = 'Select';
        btn.onclick = () => selectPlayer(index);
        
        item.appendChild(name);
        item.appendChild(btn);
        elements.playerList.appendChild(item);
    });
}

function selectPlayer(index) {
    state.currentPlayer = index;
    renderPlayerList();
    updatePlayerIndicator();
}

function advancePlayer() {
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    renderPlayerList();
    updatePlayerIndicator();
}

function updatePlayerIndicator() {
    if (state.multiplayerEnabled) {
        elements.playerIndicator.classList.remove('hidden');
        elements.currentPlayerName.textContent = state.players[state.currentPlayer];
    } else {
        elements.playerIndicator.classList.add('hidden');
    }
}

function toggleMultiplayer() {
    state.multiplayerEnabled = elements.multiplayerToggle.checked;
    
    if (state.multiplayerEnabled) {
        elements.playerControls.classList.remove('hidden');
        updatePlayerList();
    } else {
        elements.playerControls.classList.add('hidden');
        elements.playerIndicator.classList.add('hidden');
    }
}

// ========================================
// STATISTICS
// ========================================

function updateStatistics(results, sum, playerName) {
    const key = playerName || 'global';
    
    // Dice statistics
    if (!state.statistics.dice[key]) {
        state.statistics.dice[key] = {};
    }
    results.forEach(value => {
        if (!state.statistics.dice[key][value]) {
            state.statistics.dice[key][value] = 0;
        }
        state.statistics.dice[key][value]++;
    });
    
    // Total statistics
    if (!state.statistics.totals[key]) {
        state.statistics.totals[key] = {};
    }
    if (!state.statistics.totals[key][sum]) {
        state.statistics.totals[key][sum] = 0;
    }
    state.statistics.totals[key][sum]++;
}

function showStatistics() {
    updateStatsPlayerSelector();
    renderStatistics();
    elements.statsModal.classList.remove('hidden');
}

function updateStatsPlayerSelector() {
    if (state.multiplayerEnabled) {
        elements.playerStatsSelector.classList.remove('hidden');
        elements.statsPlayerSelect.innerHTML = '<option value="global">All Players</option>';
        state.players.forEach((player, index) => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            elements.statsPlayerSelect.appendChild(option);
        });
    } else {
        elements.playerStatsSelector.classList.add('hidden');
    }
}

function renderStatistics() {
    const statsType = elements.diceStatsBtn.classList.contains('active') ? 'dice' : 'totals';
    const player = state.multiplayerEnabled ? elements.statsPlayerSelect.value : 'global';
    
    const data = state.statistics[statsType][player] || {};
    const entries = Object.entries(data).map(([k, v]) => [parseInt(k), v]).sort((a, b) => a[0] - b[0]);
    
    if (entries.length === 0) {
        elements.totalRolls.textContent = '0';
        elements.avgRoll.textContent = '--';
        elements.statsChart.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No data available. Start rolling!</p>';
        return;
    }
    
    const totalRolls = entries.reduce((sum, [, count]) => sum + count, 0);
    const weightedSum = entries.reduce((sum, [val, count]) => sum + (val * count), 0);
    const average = (weightedSum / totalRolls).toFixed(2);
    
    elements.totalRolls.textContent = totalRolls;
    elements.avgRoll.textContent = average;
    
    renderChart(entries, statsType);
}

function renderChart(data, statsType) {
    const width = 540;
    const height = 300;
    const padding = 50;
    
    const maxValue = Math.max(...data.map(([, count]) => count));
    const minX = Math.min(...data.map(([val]) => val));
    const maxX = Math.max(...data.map(([val]) => val));
    
    const xScale = (val) => padding + ((val - minX) / (maxX - minX)) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val / maxValue) * (height - 2 * padding));
    
    let svg = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i * (height - 2 * padding) / 5);
        svg += `<line class="chart-grid" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"/>`;
    }
    
    // Axes
    svg += `<line class="chart-axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}"/>`;
    svg += `<line class="chart-axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"/>`;
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const val = Math.round((maxValue / 5) * (5 - i));
        const y = padding + (i * (height - 2 * padding) / 5);
        svg += `<text class="chart-label" x="${padding - 10}" y="${y + 5}" text-anchor="end">${val}</text>`;
    }
    
    // X-axis labels
    data.forEach(([val]) => {
        const x = xScale(val);
        svg += `<text class="chart-label" x="${x}" y="${height - padding + 20}" text-anchor="middle">${val}</text>`;
    });
    
    // Line path
    const pathData = data.map(([val, count], index) => {
        const x = xScale(val);
        const y = yScale(count);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    svg += `<path class="chart-line" d="${pathData}"/>`;
    
    // Data points
    data.forEach(([val, count]) => {
        const x = xScale(val);
        const y = yScale(count);
        svg += `<circle class="chart-dot" cx="${x}" cy="${y}" r="5"/>`;
    });
    
    // Axis labels
    svg += `<text class="chart-label" x="${width / 2}" y="${height - 5}" text-anchor="middle" font-weight="700">${statsType === 'dice' ? 'Dice Value' : 'Total Sum'}</text>`;
    svg += `<text class="chart-label" x="15" y="${height / 2}" text-anchor="middle" transform="rotate(-90 15 ${height / 2})" font-weight="700">Rolls</text>`;
    
    svg += '</svg>';
    
    elements.statsChart.innerHTML = svg;
}

// ========================================
// HISTORY
// ========================================

function addToHistory(results, sum, playerName) {
    const entry = {
        results,
        sum,
        player: playerName,
        timestamp: new Date().toLocaleString()
    };
    
    state.history.unshift(entry);
    
    if (state.history.length > 50) {
        state.history.pop();
    }
}

function showHistory() {
    renderHistory();
    elements.historyModal.classList.remove('hidden');
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No rolls yet!</p>';
        return;
    }
    
    elements.historyList.innerHTML = '';
    state.history.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const time = document.createElement('div');
        time.className = 'history-time';
        time.textContent = entry.timestamp;
        
        const details = document.createElement('div');
        details.className = 'history-details';
        
        let text = '';
        if (entry.player) {
            text += `<span class="history-player">${entry.player}:</span> `;
        }
        text += `[${entry.results.join(', ')}] = ${entry.sum}`;
        details.innerHTML = text;
        
        item.appendChild(time);
        item.appendChild(details);
        elements.historyList.appendChild(item);
    });
}

// ========================================
// RESET FUNCTION
// ========================================

function resetSession() {
    if (confirm('Reset all statistics and history? This cannot be undone.')) {
        state.history = [];
        state.statistics = { dice: {}, totals: {} };
        initBalancedDeck();
        elements.totalDisplay.querySelector('.result-number').textContent = '--';
        elements.individualDisplay.innerHTML = '';
        alert('Session reset successfully!');
    }
}

// ========================================
// EVENT HANDLERS
// ========================================

function setupEventListeners() {
    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Dice configuration
    elements.diceCount.addEventListener('input', () => {
        state.diceCount = parseInt(elements.diceCount.value);
        elements.diceCountValue.textContent = state.diceCount;
    });
    
    elements.diceType.addEventListener('change', () => {
        state.diceType = parseInt(elements.diceType.value);
        if (state.rngMode === 'balanced') {
            initBalancedDeck();
        }
    });
    
    // Display modes
    elements.totalMode.addEventListener('click', () => {
        state.displayMode = 'total';
        elements.totalMode.classList.add('active');
        elements.individualMode.classList.remove('active');
    });
    
    elements.individualMode.addEventListener('click', () => {
        state.displayMode = 'individual';
        elements.individualMode.classList.add('active');
        elements.totalMode.classList.remove('active');
    });
    
    // RNG modes
    elements.randomMode.addEventListener('click', () => {
        state.rngMode = 'random';
        elements.randomMode.classList.add('active');
        elements.balancedMode.classList.remove('active');
    });
    
    elements.balancedMode.addEventListener('click', () => {
        state.rngMode = 'balanced';
        elements.balancedMode.classList.add('active');
        elements.randomMode.classList.remove('active');
        initBalancedDeck();
    });
    
    // Roll button
    elements.rollBtn.addEventListener('click', handleRoll);
    
    // Multiplayer
    elements.multiplayerToggle.addEventListener('change', toggleMultiplayer);
    
    elements.playerCount.addEventListener('input', () => {
        state.playerCount = parseInt(elements.playerCount.value);
        elements.playerCountValue.textContent = state.playerCount;
        updatePlayerList();
    });
    
    // Actions
    elements.statsBtn.addEventListener('click', showStatistics);
    elements.historyBtn.addEventListener('click', showHistory);
    elements.resetBtn.addEventListener('click', resetSession);
    
    // Statistics modal
    elements.closeStatsModal.addEventListener('click', () => {
        elements.statsModal.classList.add('hidden');
    });
    
    elements.diceStatsBtn.addEventListener('click', () => {
        elements.diceStatsBtn.classList.add('active');
        elements.totalStatsBtn.classList.remove('active');
        renderStatistics();
    });
    
    elements.totalStatsBtn.addEventListener('click', () => {
        elements.totalStatsBtn.classList.add('active');
        elements.diceStatsBtn.classList.remove('active');
        renderStatistics();
    });
    
    elements.statsPlayerSelect.addEventListener('change', renderStatistics);
    
    // History modal
    elements.closeHistoryModal.addEventListener('click', () => {
        elements.historyModal.classList.add('hidden');
    });
    
    // Close modals on backdrop click
    elements.statsModal.addEventListener('click', (e) => {
        if (e.target === elements.statsModal) {
            elements.statsModal.classList.add('hidden');
        }
    });
    
    elements.historyModal.addEventListener('click', (e) => {
        if (e.target === elements.historyModal) {
            elements.historyModal.classList.add('hidden');
        }
    });
}

// ========================================
// INITIALIZE APP
// ========================================

init();
