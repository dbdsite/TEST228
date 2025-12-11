        // Анти-копирование защита
(function() {
    if (window.location.hostname !== 'dbdsite.github.io' && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1') {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#D4AF37;font-size:24px;">⚠️ Несанкционированный доступ запрещен!</div>';
    }
})();
        
 // ============================================
// SLAY DBD 25 - FRONTEND С БЭКЕНДОМ НА GOOGLE SHEETS
// ============================================

// URL вашего развернутого Google Apps Script
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzTCuFYOaDwOhBwv8cBFt8SvuvwE6v7UaCrchL-DeiRRwV1IsHvBfn1OQB4kIa2Qnpq/exec';

// ============================================
// ГЛОБАЛЬНАЯ КОНФИГУРАЦИЯ (загружается с сервера)
// ============================================
let CONFIG = {
    BUTTONS: {},
    TELEGRAM_BOT_TOKEN: '',
    TELEGRAM_CHAT_ID: '',
    THREADS: {},
    SUPPORT_URL: ''
};

let STREAMERS_DB = [];
let isConfigLoaded = false;

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

const NOMINATION_NAMES = {
    'best_streamer': 'Лучший ДБД стример года',
    'best_guide': 'Лучший гайд контент',
    'best_entertainment': 'Лучший развлекательный контент',
    'viewers_choice': 'Приз зрительских симпатий'
};

// ============================================
// ЗАГРУЗКА КОНФИГУРАЦИИ С СЕРВЕРА
// ============================================
async function loadConfigFromBackend() {
    showLoadingScreen(true, 'Загрузка конфигурации...');
    
    try {
        const response = await fetch(`${BACKEND_URL}?action=config`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Применяем конфигурацию
        applyConfig(data);
        
        isConfigLoaded = true;
        console.log('✅ Конфигурация загружена:', data.timestamp);
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки конфигурации:', error);
        
        // Пробуем загрузить из кэша
        const cached = loadCachedConfig();
        if (cached) {
            applyConfig(cached);
            console.log('📦 Использован кэш конфигурации');
            return true;
        }
        
        showConfigError(error.message);
        return false;
    } finally {
        showLoadingScreen(false);
    }
}

/**
 * Применить загруженную конфигурацию
 */
function applyConfig(data) {
    // Базовая конфигурация
    if (data.config) {
        CONFIG.TELEGRAM_BOT_TOKEN = data.config.TELEGRAM_BOT_TOKEN || '';
        CONFIG.TELEGRAM_CHAT_ID = data.config.TELEGRAM_CHAT_ID || '';
        CONFIG.SUPPORT_URL = data.config.SUPPORT_URL || '';
        CONFIG.GOOGLE_SHEET_ID = data.config.GOOGLE_SHEET_ID || '';
        CONFIG.GOOGLE_SHEET_NAME = data.config.GOOGLE_SHEET_NAME || 'SlayDBD25';
    }
    
    // Кнопки
    if (data.buttons) {
        CONFIG.BUTTONS = {
            SUGGEST_STREAMER: data.buttons.SUGGEST_STREAMER ?? true,
            NOMINATE_STREAMER: data.buttons.NOMINATE_STREAMER ?? false,
            STREAMERS_LIST: data.buttons.STREAMERS_LIST ?? true,
            NOMINEES_LIST: data.buttons.NOMINEES_LIST ?? false,
            SUPPORT_FUND: data.buttons.SUPPORT_FUND ?? true,
            INFO: data.buttons.INFO ?? true,
            VOTES_COUNT: data.buttons.VOTES_COUNT ?? true,
            CONTACT_SUPPORT: data.buttons.CONTACT_SUPPORT ?? true
        };
    }
    
    // Треды
    if (data.threads) {
        CONFIG.THREADS = {
            SUGGESTIONS: data.threads.SUGGESTIONS || 5,
            BEST_STREAMER: data.threads.BEST_STREAMER || 7,
            BEST_GUIDE: data.threads.BEST_GUIDE || 9,
            BEST_ENTERTAINMENT: data.threads.BEST_ENTERTAINMENT || 11,
            VIEWERS_CHOICE: data.threads.VIEWERS_CHOICE || 13,
            SUPPORT: data.threads.SUPPORT || 27,
            STREAMERS_LIST_VOTE: data.threads.STREAMERS_LIST_VOTE || 51
        };
    }
    
    // Стримеры
    if (data.streamers && Array.isArray(data.streamers)) {
        STREAMERS_DB = data.streamers;
    }
    
    // Кэшируем конфигурацию
    cacheConfig(data);
    
    // Обновляем UI на основе конфигурации
    updateUIBasedOnConfig();
}

/**
 * Обновить UI на основе конфигурации
 */
function updateUIBasedOnConfig() {
    // Показать/скрыть кнопки на основе настроек
    const buttonMappings = {
        'suggest': CONFIG.BUTTONS.SUGGEST_STREAMER,
        'nominate': CONFIG.BUTTONS.NOMINATE_STREAMER,
        'streamersList': CONFIG.BUTTONS.STREAMERS_LIST,
        'nomineesList': CONFIG.BUTTONS.NOMINEES_LIST,
        'fund': CONFIG.BUTTONS.SUPPORT_FUND,
        'info': CONFIG.BUTTONS.INFO,
        'votes': CONFIG.BUTTONS.VOTES_COUNT,
        'support': CONFIG.BUTTONS.CONTACT_SUPPORT
    };
    
    // Можно добавить визуальные индикаторы для отключенных кнопок
    Object.keys(buttonMappings).forEach(btnType => {
        const btn = document.querySelector(`[data-button="${btnType}"]`);
        if (btn) {
            if (!buttonMappings[btnType]) {
                btn.classList.add('disabled-visual');
            } else {
                btn.classList.remove('disabled-visual');
            }
        }
    });
}

/**
 * Кэширование конфигурации в localStorage
 */
function cacheConfig(data) {
    try {
        const cacheData = {
            ...data,
            cachedAt: Date.now()
        };
        localStorage.setItem('slaydbd_config_cache', JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Не удалось кэшировать конфигурацию:', e);
    }
}

/**
 * Загрузить конфигурацию из кэша
 */
function loadCachedConfig() {
    try {
        const cached = localStorage.getItem('slaydbd_config_cache');
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        
        // Проверяем возраст кэша (максимум 24 часа)
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - data.cachedAt > maxAge) {
            localStorage.removeItem('slaydbd_config_cache');
            return null;
        }
        
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Показать/скрыть экран загрузки
 */
function showLoadingScreen(show, message = 'Загрузка...') {
    let loader = document.getElementById('configLoader');
    
    if (!loader && show) {
        loader = document.createElement('div');
        loader.id = 'configLoader';
        loader.innerHTML = `
            <div class="config-loader-content">
                <div class="loader-spinner"></div>
                <p class="loader-message">${message}</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        document.body.appendChild(loader);
    }
    
    if (loader) {
        if (show) {
            const msgEl = loader.querySelector('.loader-message');
            if (msgEl) msgEl.textContent = message;
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    }
}

/**
 * Показать ошибку загрузки конфигурации
 */
function showConfigError(message) {
    const errorHtml = `
        <div id="configError" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            text-align: center;
            padding: 20px;
        ">
            <div>
                <h2 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Ошибка загрузки</h2>
                <p style="margin-bottom: 20px;">${message}</p>
                <button onclick="retryLoadConfig()" style="
                    background: linear-gradient(135deg, #d4af37, #b8860b);
                    border: none;
                    padding: 15px 30px;
                    color: black;
                    font-weight: bold;
                    border-radius: 10px;
                    cursor: pointer;
                ">🔄 Попробовать снова</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', errorHtml);
}

/**
 * Повторная попытка загрузки
 */
async function retryLoadConfig() {
    const errorEl = document.getElementById('configError');
    if (errorEl) errorEl.remove();
    
    await loadConfigFromBackend();
    
    if (isConfigLoaded) {
        initializeApp();
    }
}

// ============================================
// ESCAPE MARKDOWN FOR TELEGRAM
// ============================================
function escapeMarkdown(text) {
    if (!text) return '';
    return String(text)
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/`/g, '\\`');
}

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
// COOKIES FUNCTIONS
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
// BUTTON HANDLER
// ============================================
function handleButton(buttonType) {
    if (!isConfigLoaded) {
        showModal('errorModal', 'Конфигурация еще загружается. Подождите...');
        return;
    }
    
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
    
    if (!button) {
        console.error('Unknown button type:', buttonType);
        return;
    }
    
    if (!button.enabled) {
        showModal('disabledModal', `Раздел "${button.name}" пока что недоступен. Следите за новостями у нас в Соц. Сетях!`);
        return;
    }
    
    button.action();
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
async function initializeApp() {
    createIntroParticles();
    
    // Загружаем конфигурацию
    const configLoaded = await loadConfigFromBackend();
    
    if (!configLoaded) {
        console.error('Не удалось загрузить конфигурацию');
        return;
    }
    
    // Скрываем интро после загрузки
    setTimeout(() => {
        document.getElementById('introOverlay').classList.add('hidden');
    }, 2000);
    
    checkVotedNominations();
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeApp);

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
        renderStreamers(STREAMERS_DB);
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
// NOMINEES LIST
// ============================================
function loadNominees() {
    const grid = document.getElementById('nomineesGrid');
    
    grid.innerHTML = STREAMERS_DB.map(streamer => `
        <div class="nominee-card" onclick="openNomineeProfile(${streamer.id})">
            <img src="${streamer.image}" alt="${streamer.name}" class="nominee-card-image"
                 onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
            <h3 class="nominee-card-name">${streamer.name}</h3>
            <p class="nominee-card-hint">Нажмите для подробностей</p>
        </div>
    `).join('');
}

function openNomineeProfile(streamerId) {
    const streamer = STREAMERS_DB.find(s => s.id === streamerId);
    if (!streamer) return;
    
    document.getElementById('nomineeProfileImage').src = streamer.profileImage || streamer.image;
    document.getElementById('nomineeProfileImage').alt = streamer.name;
    document.getElementById('nomineeProfileName').textContent = streamer.name;
    document.getElementById('nomineeProfileTwitch').href = streamer.twitch;
    
    let interviewHTML = '';
    if (streamer.interview && streamer.interview.q1) {
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
    } else {
        interviewHTML = '<p style="color: var(--gold-light);">Интервью скоро появится...</p>';
    }
    
    document.getElementById('nomineeInterviewContent').innerHTML = interviewHTML;
    document.getElementById('nomineeProfileModal').classList.add('active');
}

// ============================================
// VOTES COUNT
// ============================================
function loadVotes() {
    const container = document.getElementById('votesContainer');
    
    const sortedStreamers = [...STREAMERS_DB].sort((a, b) => (b.votes || 0) - (a.votes || 0));
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
}

// ============================================
// STREAMERS LIST
// ============================================
function renderStreamers(streamers) {
    const gridEl = document.getElementById('streamersGrid');
    const loadingEl = document.getElementById('streamersLoading');
    
    if (loadingEl) loadingEl.style.display = 'none';
    
    const hasVoted = hasAlreadyActed('streamersListVoted');
    
    if (!streamers || streamers.length === 0) {
        gridEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gold-light);"><p>Список стримеров пока пуст</p></div>`;
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
// STREAMERS LIST VOTING
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
    const fingerprint = getFingerprint();
    
    const message = `🗳️ *ГОЛОС ЗА СТРИМЕРА*

👤 *Голосующий:*
├ Telegram: ${escapeMarkdown(streamersVoteTelegram)}
└ 🔐 ID: \`${fingerprint}\`

🎮 *Голос за стримера:*
├ Никнейм: ${escapeMarkdown(selectedStreamerForVote.name)}
└ Twitch: ${escapeMarkdown(selectedStreamerForVote.twitch)}

📅 Дата: ${new Date().toLocaleString('ru-RU')}`;

    const success = await sendToTelegram(message, CONFIG.THREADS.STREAMERS_LIST_VOTE);
    
    if (success) {
        markAsActed('streamersListVoted');
        showStreamersVoteStep('streamersVoteStep3');
        updateVoteButtons();
        
        // Также можно обновить счётчик голосов на бэкенде
        await updateVoteCount(selectedStreamerForVote.name);
    } else {
        showModal('errorModal', 'Ошибка отправки. Попробуйте позже.');
    }
}

/**
 * Обновить счетчик голосов на бэкенде
 */
async function updateVoteCount(streamerName) {
    const streamer = STREAMERS_DB.find(s => s.name === streamerName);
    if (!streamer) return;
    
    try {
        await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'addVote',
                streamerId: streamer.id
            })
        });
    } catch (e) {
        console.warn('Не удалось обновить счётчик голосов:', e);
    }
}

function updateVoteButtons() {
    document.querySelectorAll('.streamer-vote-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '✓ Голос отдан';
    });
}

// ============================================
// SUGGEST STREAMER
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

    const fingerprint = getFingerprint();

    const message = `🎯 *НОВОЕ ПРЕДЛОЖЕНИЕ СТРИМЕРА*

👤 *Отправитель:*
├ Telegram: ${escapeMarkdown(userTelegram)}
├ Twitch: ${escapeMarkdown(userTwitch)}
└ 🔐 ID: \`${fingerprint}\`

🎮 *Предложенный стример:*
├ Никнейм: ${escapeMarkdown(streamerNick)}
└ Twitch: ${escapeMarkdown(streamerTwitch)}

📅 Дата: ${new Date().toLocaleString('ru-RU')}`;

    const success = await sendToTelegram(message, CONFIG.THREADS.SUGGESTIONS);

    if (success) {
        markAsActed('hasSuggested');
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'block';
    } else {
        showModal('errorModal', 'Ошибка отправки. Попробуйте позже.');
    }
}

// ============================================
// VOTING (NOMINATIONS)
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
    currentStreamers = [...STREAMERS_DB].sort(() => Math.random() - 0.5);

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
    
    const totalStreamers = STREAMERS_DB.length;
    const progress = ((totalStreamers - remainingInRound) / (totalStreamers - 1)) * 100;
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
    const threadId = getThreadIdForNomination(currentNomination);
    const fingerprint = getFingerprint();
    
    const message = `🏆 *НОВЫЙ ГОЛОС*

📋 *Номинация:* ${NOMINATION_NAMES[currentNomination]}

👤 *Голосующий:*
├ Никнейм: ${escapeMarkdown(voterData.nick)}
├ Telegram: ${escapeMarkdown(voterData.telegram)}
├ Twitch: ${escapeMarkdown(voterData.twitch)}
└ 🔐 ID: \`${fingerprint}\`

🎮 *Выбранный стример:*
├ Никнейм: ${escapeMarkdown(winner.name)}
└ Twitch: ${escapeMarkdown(winner.twitch)}

📅 Дата: ${new Date().toLocaleString('ru-RU')}`;

    const success = await sendToTelegram(message, threadId);

    if (success) {
        markAsActed(`voted_${currentNomination}`);
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'block';
        checkVotedNominations();
    } else {
        showModal('errorModal', 'Ошибка отправки. Попробуйте позже.');
    }
}

function getThreadIdForNomination(nomination) {
    const map = {
        'best_streamer': CONFIG.THREADS.BEST_STREAMER,
        'best_guide': CONFIG.THREADS.BEST_GUIDE,
        'best_entertainment': CONFIG.THREADS.BEST_ENTERTAINMENT,
        'viewers_choice': CONFIG.THREADS.VIEWERS_CHOICE
    };
    return map[nomination] || null;
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
// SUPPORT FUNCTIONALITY
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

    const fingerprint = getFingerprint();
    
    const telegramMessage = `💬 *ОБРАЩЕНИЕ В ПОДДЕРЖКУ*

👤 *Отправитель:*
├ Telegram: ${escapeMarkdown(supportUserTelegram)}
└ 🔐 ID: \`${fingerprint}\`

📝 *Сообщение:*
${escapeMarkdown(message)}

📅 Дата: ${new Date().toLocaleString('ru-RU')}`;

    const success = await sendToTelegram(telegramMessage, CONFIG.THREADS.SUPPORT);
    
    if (success) {
        const timestamp = Date.now().toString();
        localStorage.setItem('supportLastSent', timestamp);
        setCookie('supportLastSent', timestamp, 1);
        showSupportStep('supportStep4');
    } else {
        showModal('errorModal', 'Ошибка отправки. Попробуйте позже.');
    }
}

// ============================================
// TELEGRAM API
// ============================================
async function sendToTelegram(message, threadId = null) {
    if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) {
        console.error('Telegram credentials not configured');
        return false;
    }
    
    try {
        const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const body = {
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        };

        if (threadId) body.message_thread_id = threadId;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Telegram API Error:', error);
        return false;
    }
}

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
