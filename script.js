// Анти-копирование защита
(function() {
    if (window.location.hostname !== 'dbdsite.github.io' && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1') {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#D4AF37;font-size:24px;">⚠️ Несанкционированный доступ запрещен!</div>';
    }
})();
        
        // ============================================
// CONFIGURATION - НАСТРОЙКИ
// ============================================
const CONFIG = {
    // URL Google Apps Script (ОБЯЗАТЕЛЬНО ЗАМЕНИТЬ!)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwqVft21GrSNNESk0x0x8sN_8_CAxGVhqVCCqj-lctqXpk5yn-ZjgTNYkwEPYyQEjbT5Q/exec',
    
    // Локальные настройки (не содержат секретов!)
    TELEGRAM_CHANNEL_URL: 'https://t.me/slaydbd2025',
    SUPPORT_URL: 'https://dalink.to/slaydbd25',
    
    // Включение/выключение кнопок
    BUTTONS: {
        SUGGEST_STREAMER: true,
        NOMINATE_STREAMER: false,
        STREAMERS_LIST: true,
        NOMINEES_LIST: false,
        SUPPORT_FUND: true,
        INFO: true,
        VOTES_COUNT: true,
        CONTACT_SUPPORT: true
    }
};

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let currentNomination = '';
let currentStreamers = [];
let winner = null;
let voterData = {};
let supportUserTelegram = '';
let selectedStreamerForVote = { name: '', twitch: '' };
let streamersVoteTelegram = '';
let streamersFromSheet = [];

const NOMINATION_NAMES = {
    'best_streamer': 'Лучший ДБД стример года',
    'best_guide': 'Лучший гайд контент',
    'best_entertainment': 'Лучший развлекательный контент',
    'viewers_choice': 'Приз зрительских симпатий'
};

// ============================================
// BROWSER FINGERPRINT
// ============================================
function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        canvasData.slice(-50)
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return 'fp_' + Math.abs(hash).toString(36);
}

function getFingerprint() {
    let fp = localStorage.getItem('deviceFingerprint');
    if (!fp) {
        fp = generateFingerprint();
        localStorage.setItem('deviceFingerprint', fp);
    }
    return fp;
}

// ============================================
// COOKIES & LOCAL STORAGE
// ============================================
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Strict';
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

function hasAlreadyActed(actionType) {
    return localStorage.getItem(actionType) || getCookie(actionType);
}

function markAsActed(actionType) {
    const fp = getFingerprint();
    const data = { fingerprint: fp, timestamp: Date.now() };
    localStorage.setItem(actionType, JSON.stringify(data));
    setCookie(actionType, fp, 365);
}

// ============================================
// API ЗАПРОСЫ К GOOGLE APPS SCRIPT (ИСПРАВЛЕНО!)
// ============================================

async function apiRequest(action, data = {}) {
    try {
        // Используем text/plain чтобы избежать preflight запроса
        const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: action,
                fingerprint: getFingerprint(),
                ...data
            })
        });
        
        // Проверяем, что ответ получен
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        
        // Пробуем распарсить JSON
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response:', text);
            return { error: 'Invalid response format' };
        }
        
    } catch (error) {
        console.error(`API Error (${action}):`, error);
        return { error: error.message };
    }
}

async function apiGet(action) {
    try {
        // GET запросы работают без проблем
        const response = await fetch(`${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=${action}`, {
            method: 'GET',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response:', text);
            return { error: 'Invalid response format' };
        }
        
    } catch (error) {
        console.error(`API GET Error (${action}):`, error);
        return { error: error.message };
    }
}

// ============================================
// LOADING OVERLAY
// ============================================
function showLoadingOverlay(text = 'Загрузка...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                flex-direction: column;
                gap: 20px;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(212, 175, 55, 0.3);
                    border-top-color: #d4af37;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <p id="loadingText" style="color: #d4af37; font-size: 1.2rem;">${text}</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    } else {
        const textEl = document.getElementById('loadingText');
        if (textEl) textEl.textContent = text;
        overlay.style.display = 'block';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    createIntroParticles();
    
    // Проверяем доступность API
    const pingResult = await apiGet('ping');
    if (pingResult.error) {
        console.warn('API недоступен, будет использована локальная база');
    } else {
        console.log('✅ API доступен:', pingResult.timestamp);
    }
    
    setTimeout(() => {
        const intro = document.getElementById('introOverlay');
        if (intro) intro.classList.add('hidden');
    }, 4500);
    
    checkVotedNominations();
});

function createIntroParticles() {
    const container = document.getElementById('introParticles');
    if (!container) return;
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(particle);
    }
}

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'streamersListSection') {
        loadStreamersFromSheet();
    }
    
    window.scrollTo(0, 0);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showModal(modalId, text = null) {
    if (text) {
        const textElement = document.getElementById(modalId + 'Text');
        if (textElement) textElement.textContent = text;
    }
    document.getElementById(modalId).classList.add('active');
}

// ============================================
// BUTTON HANDLER
// ============================================
function handleButton(buttonType) {
    const buttonMap = {
        'suggest': { enabled: CONFIG.BUTTONS.SUGGEST_STREAMER, action: handleSuggestStreamer, name: 'Предложить стримера' },
        'nominate': { enabled: CONFIG.BUTTONS.NOMINATE_STREAMER, action: handleVote, name: 'Номинировать стримера' },
        'streamersList': { enabled: CONFIG.BUTTONS.STREAMERS_LIST, action: () => showSection('streamersListSection'), name: 'Список стримеров' },
        'nomineesList': { enabled: CONFIG.BUTTONS.NOMINEES_LIST, action: () => { showSection('nomineesListSection'); loadNominees(); }, name: 'Список номинантов' },
        'fund': { enabled: CONFIG.BUTTONS.SUPPORT_FUND, action: () => showSection('fundSection'), name: 'Поддержать фонд' },
        'info': { enabled: CONFIG.BUTTONS.INFO, action: () => showSection('infoSection'), name: 'Информация' },
        'votes': { enabled: CONFIG.BUTTONS.VOTES_COUNT, action: () => { showSection('votesSection'); loadVotes(); }, name: 'Количество голосов' },
        'support': { enabled: CONFIG.BUTTONS.CONTACT_SUPPORT, action: openSupportModal, name: 'Связаться с поддержкой' }
    };

    const button = buttonMap[buttonType];
    
    if (!button.enabled) {
        showModal('disabledModal', `Раздел "${button.name}" пока что недоступен.`);
        return;
    }
    
    button.action();
}

// ============================================
// ЗАГРУЗКА СТРИМЕРОВ
// ============================================
async function loadStreamersFromSheet() {
    const loadingEl = document.getElementById('streamersLoading');
    const errorEl = document.getElementById('streamersError');
    const gridEl = document.getElementById('streamersGrid');
    
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    gridEl.innerHTML = '';
    
    try {
        const result = await apiGet('getStreamers');
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        streamersFromSheet = result;
        loadingEl.style.display = 'none';
        renderStreamers(result.length > 0 ? result : STREAMERS_DB);
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loadingEl.style.display = 'none';
        
        // Fallback на локальную базу
        if (typeof STREAMERS_DB !== 'undefined') {
            renderStreamers(STREAMERS_DB);
        } else {
            errorEl.style.display = 'block';
        }
    }
}

function renderStreamers(streamers) {
    const gridEl = document.getElementById('streamersGrid');
    const hasVoted = hasAlreadyActed('streamersListVoted');
    
    if (streamers.length === 0) {
        gridEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #d4af37;"><p>Список стримеров пока пуст</p></div>`;
        return;
    }
    
    gridEl.innerHTML = streamers.map(streamer => `
        <div class="streamer-list-card">
            <img src="${streamer.image}" alt="${streamer.name}" class="streamer-list-image" 
                 onerror="this.src='https://via.placeholder.com/120?text=No+Image'">
            <h3 class="streamer-list-name">${streamer.name}</h3>
            <div class="streamer-buttons">
                <a href="${streamer.twitch}" target="_blank" class="streamer-list-link">
                    <i class="fab fa-twitch"></i> TWITCH
                </a>
                <button class="streamer-vote-btn" 
                        onclick="openStreamersVoteModal('${escapeHtmlAttr(streamer.name)}', '${escapeHtmlAttr(streamer.twitch)}')"
                        ${hasVoted ? 'disabled' : ''}>
                    ${hasVoted ? '✓ Голос отдан' : '🗳️ Проголосовать'}
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtmlAttr(text) {
    return String(text).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ============================================
// ГОЛОСОВАНИЕ ЗА СТРИМЕРА (СПИСОК)
// ============================================
function openStreamersVoteModal(streamerName, streamerTwitch) {
    if (hasAlreadyActed('streamersListVoted')) {
        showStreamersVoteStep('streamersVoteAlready');
        document.getElementById('streamersVoteModal').classList.add('active');
        return;
    }
    
    selectedStreamerForVote = { name: streamerName, twitch: streamerTwitch };
    
    document.getElementById('voteStreamerName').textContent = streamerName;
    document.getElementById('voteStreamerNameConfirm').textContent = streamerName;
    document.getElementById('streamersVoteTelegram').value = '';
    
    showStreamersVoteStep('streamersVoteStep1');
    document.getElementById('streamersVoteModal').classList.add('active');
}

function closeStreamersVoteModal() {
    document.getElementById('streamersVoteModal').classList.remove('active');
    selectedStreamerForVote = { name: '', twitch: '' };
    streamersVoteTelegram = '';
}

function showStreamersVoteStep(stepId) {
    ['streamersVoteStep1', 'streamersVoteStep2', 'streamersVoteStep3', 'streamersVoteAlready'].forEach(step => {
        const el = document.getElementById(step);
        if (el) el.style.display = step === stepId ? 'block' : 'none';
    });
}

function streamersVoteStep2() {
    const telegram = document.getElementById('streamersVoteTelegram').value.trim();
    if (!telegram) {
        showModal('errorModal', 'Введите ваш Telegram логин');
        return;
    }
    streamersVoteTelegram = telegram;
    showStreamersVoteStep('streamersVoteStep2');
}

async function submitStreamersVote() {
    showLoadingOverlay('Отправка голоса...');
    
    const result = await apiRequest('vote', {
        streamerName: selectedStreamerForVote.name,
        telegram: streamersVoteTelegram
    });
    
    hideLoadingOverlay();
    
    if (result.error) {
        if (result.code === 'DUPLICATE') {
            showModal('errorModal', 'Вы уже голосовали!');
            markAsActed('streamersListVoted');
        } else {
            showModal('errorModal', 'Ошибка: ' + result.error);
        }
        return;
    }
    
    if (result.success) {
        markAsActed('streamersListVoted');
        showStreamersVoteStep('streamersVoteStep3');
        updateVoteButtons();
    } else {
        showModal('errorModal', 'Ошибка отправки. Попробуйте позже.');
    }
}

function updateVoteButtons() {
    document.querySelectorAll('.streamer-vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '✓ Голос отдан';
    });
}

// ============================================
// КОЛИЧЕСТВО ГОЛОСОВ
// ============================================
async function loadVotes() {
    const container = document.getElementById('votesContainer');
    container.innerHTML = '<p style="text-align: center; color: #d4af37;">Загрузка...</p>';
    
    try {
        const streamers = await apiGet('getStreamers');
        
        if (streamers.error) {
            throw new Error(streamers.error);
        }
        
        const sortedStreamers = [...streamers].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        const maxVotes = sortedStreamers[0]?.votes || 1;
        
        container.innerHTML = sortedStreamers.map((streamer, index) => {
            const percentage = ((streamer.votes || 0) / maxVotes) * 100;
            const position = index + 1;
            const isTop3 = position <= 3;
            const medals = ['🥇', '🥈', '🥉'];
            
            return `
                <div class="vote-item">
                    <div class="vote-position ${isTop3 ? 'top-3' : ''}">
                        ${isTop3 ? medals[position - 1] : position}
                    </div>
                    <img src="${streamer.image}" alt="${streamer.name}" class="vote-avatar"
                         onerror="this.src='https://via.placeholder.com/50?text=?'">
                    <div class="vote-info">
                        <div class="vote-name">${streamer.name}</div>
                        <div class="vote-bar-container">
                            <div class="vote-bar" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="vote-count">${streamer.votes || 0}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки голосов:', error);
        container.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Ошибка загрузки данных</p>';
    }
}

// ============================================
// ПРЕДЛОЖИТЬ СТРИМЕРА
// ============================================
function handleSuggestStreamer() {
    if (hasAlreadyActed('hasSuggested')) {
        showSection('suggestSection');
        document.getElementById('suggestStep1').style.display = 'none';
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'none';
        document.getElementById('alreadySuggested').style.display = 'block';
        return;
    }

    showSection('suggestSection');
    document.getElementById('suggestStep1').style.display = 'block';
    document.getElementById('suggestStep2').style.display = 'none';
    document.getElementById('suggestSuccess').style.display = 'none';
    document.getElementById('alreadySuggested').style.display = 'none';
}

function suggestStep2() {
    const telegram = document.getElementById('userTelegram').value.trim();
    const twitch = document.getElementById('userTwitch').value.trim();

    if (!telegram || !twitch) {
        showModal('errorModal', 'Пожалуйста, заполните все поля!');
        return;
    }

    document.getElementById('suggestStep1').style.display = 'none';
    document.getElementById('suggestStep2').style.display = 'block';
}

async function submitSuggestion() {
    const userTelegram = document.getElementById('userTelegram').value.trim();
    const userTwitch = document.getElementById('userTwitch').value.trim();
    const streamerNick = document.getElementById('streamerNick').value.trim();
    const streamerTwitch = document.getElementById('streamerTwitch').value.trim();

    if (!streamerNick || !streamerTwitch) {
        showModal('errorModal', 'Пожалуйста, заполните все поля!');
        return;
    }

    showLoadingOverlay('Отправка предложения...');

    const result = await apiRequest('suggest', {
        userTelegram: userTelegram,
        userTwitch: userTwitch,
        streamerNick: streamerNick,
        streamerTwitch: streamerTwitch
    });

    hideLoadingOverlay();

    if (result.success) {
        markAsActed('hasSuggested');
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'block';
    } else {
        if (result.code === 'DUPLICATE') {
            showModal('errorModal', 'Вы уже отправляли предложение!');
            markAsActed('hasSuggested');
        } else {
            showModal('errorModal', 'Ошибка отправки: ' + (result.error || 'Попробуйте позже'));
        }
    }
}

// ============================================
// ГОЛОСОВАНИЕ В НОМИНАЦИЯХ
// ============================================
function handleVote() {
    showSection('voteSection');
}

function checkVotedNominations() {
    ['best_streamer', 'best_guide', 'best_entertainment', 'viewers_choice'].forEach(nom => {
        const btn = document.querySelector(`[data-nomination="${nom}"]`);
        if (btn && hasAlreadyActed(`voted_${nom}`)) {
            btn.classList.add('voted');
        }
    });
}

function startVoting(nomination) {
    if (hasAlreadyActed(`voted_${nomination}`)) {
        currentNomination = nomination;
        showSection('votingProcess');
        document.getElementById('voterVerification').style.display = 'none';
        document.getElementById('bracketVoting').style.display = 'none';
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'none';
        document.getElementById('alreadyVoted').style.display = 'block';
        document.getElementById('currentNominationTitle').textContent = NOMINATION_NAMES[nomination];
        return;
    }

    currentNomination = nomination;
    document.getElementById('currentNominationTitle').textContent = NOMINATION_NAMES[nomination];
    showSection('votingProcess');
    
    document.getElementById('voterVerification').style.display = 'block';
    document.getElementById('bracketVoting').style.display = 'none';
    document.getElementById('winnerDisplay').style.display = 'none';
    document.getElementById('alreadyVoted').style.display = 'none';
    document.getElementById('voteSuccess').style.display = 'none';
}

function startBracket() {
    const nick = document.getElementById('voterNick').value.trim();
    const telegram = document.getElementById('voterTelegram').value.trim();
    const twitch = document.getElementById('voterTwitch').value.trim();

    if (!nick || !telegram || !twitch) {
        showModal('errorModal', 'Пожалуйста, заполните все поля!');
        return;
    }

    voterData = { nick, telegram, twitch };
    
    // Используем загруженных стримеров или локальную базу
    const sourceStreamers = streamersFromSheet.length > 0 ? streamersFromSheet : STREAMERS_DB;
    currentStreamers = [...sourceStreamers].sort(() => Math.random() - 0.5);

    document.getElementById('voterVerification').style.display = 'none';
    document.getElementById('bracketVoting').style.display = 'block';

    showNextMatch();
}

function showNextMatch() {
    if (currentStreamers.length === 1) {
        winner = currentStreamers[0];
        showWinner();
        return;
    }

    const remainingInRound = currentStreamers.length;
    document.getElementById('roundInfo').textContent = `Осталось стримеров: ${remainingInRound}`;
    
    const total = streamersFromSheet.length || STREAMERS_DB.length;
    const progress = ((total - remainingInRound) / (total - 1)) * 100;
    document.getElementById('progressFill').style.width = progress + '%';

    const streamer1 = currentStreamers[0];
    const streamer2 = currentStreamers[1];

    document.getElementById('streamersBattle').innerHTML = `
        <div class="streamer-card" onclick="selectStreamer(0)">
            <img src="${streamer1.image}" alt="${streamer1.name}" class="streamer-image" 
                 onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <h3 class="streamer-name">${streamer1.name}</h3>
            <a href="${streamer1.twitch}" target="_blank" class="streamer-link" onclick="event.stopPropagation()">
                <i class="fab fa-twitch"></i> Twitch
            </a>
        </div>
        <span class="vs-text">VS</span>
        <div class="streamer-card" onclick="selectStreamer(1)">
            <img src="${streamer2.image}" alt="${streamer2.name}" class="streamer-image"
                 onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <h3 class="streamer-name">${streamer2.name}</h3>
            <a href="${streamer2.twitch}" target="_blank" class="streamer-link" onclick="event.stopPropagation()">
                <i class="fab fa-twitch"></i> Twitch
            </a>
        </div>
    `;
}

function selectStreamer(index) {
    const selectedStreamer = currentStreamers[index];
    currentStreamers.splice(0, 2);
    currentStreamers.push(selectedStreamer);
    currentStreamers = currentStreamers.sort(() => Math.random() - 0.5);
    setTimeout(() => showNextMatch(), 300);
}

function showWinner() {
    document.getElementById('bracketVoting').style.display = 'none';
    document.getElementById('winnerDisplay').style.display = 'block';
    
    document.getElementById('winnerCard').innerHTML = `
        <img src="${winner.image}" alt="${winner.name}" class="streamer-image"
             onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
        <h3 class="streamer-name">${winner.name}</h3>
        <a href="${winner.twitch}" target="_blank" class="streamer-link">
            <i class="fab fa-twitch"></i> Twitch
        </a>
    `;
}

async function submitVote() {
    showLoadingOverlay('Отправка голоса...');

    const result = await apiRequest('nominationVote', {
        nomination: currentNomination,
        voterNick: voterData.nick,
        voterTelegram: voterData.telegram,
        voterTwitch: voterData.twitch,
        winnerName: winner.name,
        winnerTwitch: winner.twitch
    });

    hideLoadingOverlay();

    if (result.success) {
        markAsActed(`voted_${currentNomination}`);
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'block';
        checkVotedNominations();
    } else {
        if (result.code === 'DUPLICATE') {
            showModal('errorModal', 'Вы уже голосовали в этой номинации!');
            markAsActed(`voted_${currentNomination}`);
        } else {
            showModal('errorModal', 'Ошибка отправки: ' + (result.error || 'Попробуйте позже'));
        }
    }
}

function backToNominations() {
    showSection('voteSection');
    document.getElementById('voterNick').value = '';
    document.getElementById('voterTelegram').value = '';
    document.getElementById('voterTwitch').value = '';
    voterData = {};
    currentStreamers = [];
    winner = null;
}

// ============================================
// ПОДДЕРЖКА
// ============================================
function openSupportModal() {
    const lastSent = localStorage.getItem('supportLastSent') || getCookie('supportLastSent');
    
    if (lastSent) {
        const timePassed = Date.now() - parseInt(lastSent);
        const hoursLeft = 24 - (timePassed / (1000 * 60 * 60));
        
        if (hoursLeft > 0) {
            showSupportStep('supportAlreadySent');
            const hours = Math.floor(hoursLeft);
            const minutes = Math.floor((hoursLeft - hours) * 60);
            document.getElementById('supportCooldown').textContent = 
                hours > 0 ? `${hours} ч. ${minutes} мин.` : `${minutes} мин.`;
            document.getElementById('supportModal').classList.add('active');
            return;
        }
    }
    
    showSupportStep('supportStep1');
    document.getElementById('supportTelegram').value = '';
    document.getElementById('supportMessage').value = '';
    document.getElementById('supportModal').classList.add('active');
}

function showSupportStep(stepId) {
    ['supportStep1', 'supportStep2', 'supportStep3', 'supportStep4', 'supportAlreadySent'].forEach(step => {
        const el = document.getElementById(step);
        if (el) el.style.display = step === stepId ? 'block' : 'none';
    });
}

function supportStep2() {
    const telegram = document.getElementById('supportTelegram').value.trim();
    if (!telegram) {
        showModal('errorModal', 'Введите ваш Telegram логин');
        return;
    }
    supportUserTelegram = telegram;
    showSupportStep('supportStep2');
}

function supportStep3() {
    showSupportStep('supportStep3');
}

async function submitSupport() {
    const message = document.getElementById('supportMessage').value.trim();
    
    if (!message) {
        showModal('errorModal', 'Введите ваше сообщение');
        return;
    }
    
    if (message.length < 10) {
        showModal('errorModal', 'Сообщение слишком короткое (минимум 10 символов)');
        return;
    }

    showLoadingOverlay('Отправка сообщения...');

    const result = await apiRequest('support', {
        telegram: supportUserTelegram,
        message: message
    });

    hideLoadingOverlay();
    
    if (result.success) {
        const timestamp = Date.now().toString();
        localStorage.setItem('supportLastSent', timestamp);
        setCookie('supportLastSent', timestamp, 1);
        showSupportStep('supportStep4');
    } else {
        showModal('errorModal', 'Ошибка отправки: ' + (result.error || 'Попробуйте позже'));
    }
}

// ============================================
// NOMINEES (локальная база как fallback)
// ============================================
function loadNominees() {
    const grid = document.getElementById('nomineesGrid');
    const sourceStreamers = streamersFromSheet.length > 0 ? streamersFromSheet : STREAMERS_DB;
    
    grid.innerHTML = sourceStreamers.map(streamer => `
        <div class="nominee-card" onclick="openNomineeProfile(${streamer.id})">
            <img src="${streamer.image}" alt="${streamer.name}" class="nominee-card-image"
                 onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
            <h3 class="nominee-card-name">${streamer.name}</h3>
            <p class="nominee-card-hint">Нажмите для подробностей</p>
        </div>
    `).join('');
}

function openNomineeProfile(streamerId) {
    const sourceStreamers = streamersFromSheet.length > 0 ? streamersFromSheet : STREAMERS_DB;
    const streamer = sourceStreamers.find(s => s.id === streamerId);
    if (!streamer) return;
    
    document.getElementById('nomineeProfileImage').src = streamer.profileImage || streamer.image;
    document.getElementById('nomineeProfileImage').alt = streamer.name;
    document.getElementById('nomineeProfileName').textContent = streamer.name;
    document.getElementById('nomineeProfileTwitch').href = streamer.twitch;
    
    let interviewHTML = '<p style="color: #d4af37;">Интервью скоро появится...</p>';
    
    if (streamer.interview) {
        interviewHTML = `
            <div class="interview-item">
                <p class="interview-question">${streamer.interview.q1}</p>
                <p class="interview-answer">${streamer.interview.a1}</p>
            </div>
            <div class="interview-item">
                <p class="interview-question">${streamer.interview.q2}</p>
                <p class="interview-answer">${streamer.interview.a2}</p>
            </div>
            <div class="interview-item">
                <p class="interview-question">${streamer.interview.q3}</p>
                <p class="interview-answer">${streamer.interview.a3}</p>
            </div>
        `;
    }
    
    document.getElementById('nomineeInterviewContent').innerHTML = interviewHTML;
    document.getElementById('nomineeProfileModal').classList.add('active');
}

// ============================================
// FALLBACK STREAMERS DATABASE (на случай если API недоступен)
// ============================================
const STREAMERS_DB = [
    { id: 1, name: "Spc_tgc", image: "https://static-cdn.jtvnw.net/jtv_user_pictures/f983d142-d6e5-46cf-80d9-f9c5cd6c6836-profile_image-70x70.png", twitch: "https://twitch.tv/spc_tgc", votes: 46 },
    { id: 2, name: "MogilevTM", image: "https://static-cdn.jtvnw.net/jtv_user_pictures/183376cf-247a-433e-91bd-22fcd30d3901-profile_image-70x70.jpeg", twitch: "https://twitch.tv/mogilevtm", votes: 23 },
    // ... остальные стримеры
];

        // ============================================
    // ANTI-DEVTOOLS PROTECTION
    // ============================================
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    (function() {
        const threshold = 160;
        let devtoolsOpen = false;

        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    document.body.innerHTML = `
                        <div style="
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background: #000000;
                            color: #D4AF37;
                            font-size: 2rem;
                            font-family: 'Montserrat', sans-serif;
                            text-align: center;
                            padding: 20px;
                            flex-direction: column;
                            gap: 20px;
                        ">
                            <div style="font-size: 5rem;">⚠️</div>
                            <div>Просмотр кода запрещён!</div>
                            <div style="font-size: 1rem; opacity: 0.7;">Закройте инструменты разработчика</div>
                        </div>
                    `;
                }
            } else {
                devtoolsOpen = false;
            }
        };

        setInterval(checkDevTools, 500);
        
        // Дополнительная проверка через debugger
        const detectDebugger = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                document.body.innerHTML = `
                    <div style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #000000;
                        color: #D4AF37;
                        font-size: 2rem;
                        font-family: sans-serif;
                        text-align: center;
                        padding: 20px;
                    ">
                        ⚠️ Просмотр кода запрещён!
                    </div>
                `;
            }
        };
        
        // Отключаем console методы
        const disableConsole = () => {
            const noop = () => undefined;
            const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile'];
            methods.forEach(method => {
                window.console[method] = noop;
            });
        };
        
        disableConsole();
    })();

    // ============================================
    // DISABLE TEXT SELECTION AND DRAG
    // ============================================
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());

    // ============================================
    // INITIALIZATION
    // ============================================
    console.log('%c⚠️ СТОП!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cЭто функция браузера предназначена для разработчиков.', 'font-size: 18px;');
