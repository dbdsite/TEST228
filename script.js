        // Анти-копирование защита
(function() {
    if (window.location.hostname !== 'dbdsite.github.io' && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1') {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#D4AF37;font-size:24px;">⚠️ Несанкционированный доступ запрещен!</div>';
    }
})();
        
// ============================================
// SLAY DBD 25 - SECURE FRONTEND
// ============================================

// 🔴 ВАЖНО: Замените на ваш URL после развертывания Apps Script
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzTCuFYOaDwOhBwv8cBFt8SvuvwE6v7UaCrchL-DeiRRwV1IsHvBfn1OQB4kIa2Qnpq/exec';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let CONFIG = {
    BUTTONS: {},
    THREADS: {},
    SUPPORT_URL: ''
};
let STREAMERS_DB = [];
let isConfigLoaded = false;

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
// ЗАГРУЗКА КОНФИГУРАЦИИ (тихая, без оверлея)
// ============================================
async function loadConfigFromBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}?action=config`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
        }
        
        // Применяем конфигурацию
        CONFIG.BUTTONS = data.buttons || {};
        CONFIG.THREADS = data.threads || {};
        CONFIG.SUPPORT_URL = data.config?.SUPPORT_URL || '';
        STREAMERS_DB = data.streamers || [];
        
        // Кэшируем
        localStorage.setItem('slaydbd_cache', JSON.stringify({
            ...data,
            cachedAt: Date.now()
        }));
        
        isConfigLoaded = true;
        console.log('✅ Конфигурация загружена, стримеров:', STREAMERS_DB.length);
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        
        // Пробуем кэш
        const cached = localStorage.getItem('slaydbd_cache');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                CONFIG.BUTTONS = data.buttons || {};
                CONFIG.THREADS = data.threads || {};
                STREAMERS_DB = data.streamers || [];
                isConfigLoaded = true;
                console.log('📦 Использован кэш');
                return true;
            } catch (e) {
                console.error('Ошибка чтения кэша:', e);
            }
        }
        
        return false;
    }
}

// ============================================
// ОТПРАВКА ДАННЫХ НА БЭКЕНД
// ============================================
async function sendToBackend(action, data) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                ...data,
                fingerprint: getFingerprint()
            })
        });
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Backend error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FINGERPRINT
// ============================================
function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        canvas.toDataURL().slice(-50)
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
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
    const data = { fingerprint: getFingerprint(), timestamp: Date.now() };
    localStorage.setItem(actionType, JSON.stringify(data));
    setCookie(actionType, getFingerprint(), 365);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    // Запускаем анимацию частиц
    createIntroParticles();
    
    // Загружаем конфигурацию параллельно с анимацией интро
    const configPromise = loadConfigFromBackend();
    
    // Ждём минимум 4.5 секунды (время анимации) И загрузку конфигурации
    const [configLoaded] = await Promise.all([
        configPromise,
        new Promise(resolve => setTimeout(resolve, 4500)) // Ждём анимацию
    ]);
    
    // Скрываем интро
    const introOverlay = document.getElementById('introOverlay');
    if (introOverlay) {
        introOverlay.classList.add('hidden');
    }
    
    // Если конфигурация не загрузилась - показываем ошибку
    if (!configLoaded) {
        showModal('errorModal', 'Не удалось загрузить данные. Обновите страницу.');
    }
    
    // Проверяем проголосованные номинации
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
// BUTTON HANDLER
// ============================================
function handleButton(buttonType) {
    if (!isConfigLoaded) {
        showModal('errorModal', 'Подождите, данные загружаются...');
        return;
    }
    
    const buttonMap = {
        'suggest': { enabled: CONFIG.BUTTONS.SUGGEST_STREAMER, action: handleSuggestStreamer, name: 'Предложить стримера' },
        'nominate': { enabled: CONFIG.BUTTONS.NOMINATE_STREAMER, action: handleVote, name: 'Номинировать стримера' },
        'streamersList': { enabled: CONFIG.BUTTONS.STREAMERS_LIST, action: () => { showSection('streamersListSection'); renderStreamers(STREAMERS_DB); }, name: 'Список стримеров' },
        'nomineesList': { enabled: CONFIG.BUTTONS.NOMINEES_LIST, action: () => { showSection('nomineesListSection'); loadNominees(); }, name: 'Список номинантов' },
        'fund': { enabled: CONFIG.BUTTONS.SUPPORT_FUND, action: () => showSection('fundSection'), name: 'Поддержать фонд' },
        'info': { enabled: CONFIG.BUTTONS.INFO, action: () => showSection('infoSection'), name: 'Информация' },
        'votes': { enabled: CONFIG.BUTTONS.VOTES_COUNT, action: () => { showSection('votesSection'); loadVotes(); }, name: 'Количество голосов' },
        'support': { enabled: CONFIG.BUTTONS.CONTACT_SUPPORT, action: openSupportModal, name: 'Связаться с поддержкой' }
    };

    const button = buttonMap[buttonType];
    
    if (!button) {
        console.error('Unknown button:', buttonType);
        return;
    }
    
    if (!button.enabled) {
        showModal('disabledModal', `Раздел "${button.name}" пока что недоступен. Следите за новостями!`);
        return;
    }
    
    button.action();
}

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    window.scrollTo(0, 0);
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}

function showModal(modalId, text = null) {
    if (text) {
        const textEl = document.getElementById(modalId + 'Text');
        if (textEl) textEl.textContent = text;
    }
    document.getElementById(modalId)?.classList.add('active');
}

// ============================================
// STREAMERS LIST
// ============================================
function renderStreamers(streamers) {
    const grid = document.getElementById('streamersGrid');
    const loading = document.getElementById('streamersLoading');
    
    if (loading) loading.style.display = 'none';
    
    const hasVoted = hasAlreadyActed('streamersListVoted');
    
    if (!streamers?.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#d4af37;">Список пуст</div>';
        return;
    }
    
    grid.innerHTML = streamers.map(s => `
        <div class="streamer-list-card">
            <img src="${s.image}" alt="${s.name}" class="streamer-list-image" 
                 onerror="this.src='https://via.placeholder.com/120?text=?'">
            <h3 class="streamer-list-name">${s.name}</h3>
            <div class="streamer-buttons">
                <a href="${s.twitch}" target="_blank" class="streamer-list-link">
                    <i class="fab fa-twitch"></i> TWITCH
                </a>
                <button class="streamer-vote-btn" 
                        onclick="openStreamersVoteModal('${s.name.replace(/'/g, "\\'")}', '${s.twitch.replace(/'/g, "\\'")}')"
                        ${hasVoted ? 'disabled' : ''}>
                    ${hasVoted ? '✓ Голос отдан' : '🗳️ Проголосовать'}
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// STREAMERS VOTING
// ============================================
function openStreamersVoteModal(name, twitch) {
    if (hasAlreadyActed('streamersListVoted')) {
        showStreamersVoteStep('streamersVoteAlready');
        document.getElementById('streamersVoteModal').classList.add('active');
        return;
    }
    
    selectedStreamerForVote = { name, twitch };
    document.getElementById('voteStreamerName').textContent = name;
    document.getElementById('voteStreamerNameConfirm').textContent = name;
    document.getElementById('streamersVoteTelegram').value = '';
    
    showStreamersVoteStep('streamersVoteStep1');
    document.getElementById('streamersVoteModal').classList.add('active');
}

function closeStreamersVoteModal() {
    document.getElementById('streamersVoteModal').classList.remove('active');
}

function showStreamersVoteStep(stepId) {
    ['streamersVoteStep1', 'streamersVoteStep2', 'streamersVoteStep3', 'streamersVoteAlready'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = id === stepId ? 'block' : 'none';
    });
}

function streamersVoteStep2() {
    const telegram = document.getElementById('streamersVoteTelegram').value.trim();
    if (!telegram) {
        showModal('errorModal', 'Введите Telegram логин');
        return;
    }
    streamersVoteTelegram = telegram;
    showStreamersVoteStep('streamersVoteStep2');
}

async function submitStreamersVote() {
    const result = await sendToBackend('voteStreamer', {
        telegram: streamersVoteTelegram,
        streamerName: selectedStreamerForVote.name,
        streamerTwitch: selectedStreamerForVote.twitch
    });
    
    if (result.success) {
        markAsActed('streamersListVoted');
        showStreamersVoteStep('streamersVoteStep3');
        document.querySelectorAll('.streamer-vote-btn').forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '✓ Голос отдан';
        });
    } else {
        showModal('errorModal', result.error || 'Ошибка отправки');
    }
}

// ============================================
// SUGGEST STREAMER
// ============================================
function handleSuggestStreamer() {
    showSection('suggestSection');
    
    if (hasAlreadyActed('hasSuggested')) {
        document.getElementById('suggestStep1').style.display = 'none';
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'none';
        document.getElementById('alreadySuggested').style.display = 'block';
    } else {
        document.getElementById('suggestStep1').style.display = 'block';
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'none';
        document.getElementById('alreadySuggested').style.display = 'none';
    }
}

function suggestStep2() {
    const telegram = document.getElementById('userTelegram').value.trim();
    const twitch = document.getElementById('userTwitch').value.trim();

    if (!telegram || !twitch) {
        showModal('errorModal', 'Заполните все поля!');
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
        showModal('errorModal', 'Заполните все поля!');
        return;
    }

    const result = await sendToBackend('suggestStreamer', {
        userTelegram,
        userTwitch,
        streamerNick,
        streamerTwitch
    });

    if (result.success) {
        markAsActed('hasSuggested');
        document.getElementById('suggestStep2').style.display = 'none';
        document.getElementById('suggestSuccess').style.display = 'block';
    } else {
        showModal('errorModal', result.error || 'Ошибка отправки');
    }
}

// ============================================
// NOMINATIONS VOTING
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
    currentNomination = nomination;
    document.getElementById('currentNominationTitle').textContent = NOMINATION_NAMES[nomination];
    showSection('votingProcess');
    
    if (hasAlreadyActed(`voted_${nomination}`)) {
        document.getElementById('voterVerification').style.display = 'none';
        document.getElementById('bracketVoting').style.display = 'none';
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'none';
        document.getElementById('alreadyVoted').style.display = 'block';
    } else {
        document.getElementById('voterVerification').style.display = 'block';
        document.getElementById('bracketVoting').style.display = 'none';
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('alreadyVoted').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'none';
    }
}

function startBracket() {
    const nick = document.getElementById('voterNick').value.trim();
    const telegram = document.getElementById('voterTelegram').value.trim();
    const twitch = document.getElementById('voterTwitch').value.trim();

    if (!nick || !telegram || !twitch) {
        showModal('errorModal', 'Заполните все поля!');
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

    document.getElementById('roundInfo').textContent = `Осталось: ${currentStreamers.length}`;
    document.getElementById('progressFill').style.width = 
        ((STREAMERS_DB.length - currentStreamers.length) / (STREAMERS_DB.length - 1) * 100) + '%';

    const [s1, s2] = currentStreamers;

    document.getElementById('streamersBattle').innerHTML = `
        <div class="streamer-card" onclick="selectStreamer(0)">
            <img src="${s1.image}" alt="${s1.name}" class="streamer-image" onerror="this.src='https://via.placeholder.com/150?text=?'">
            <h3 class="streamer-name">${s1.name}</h3>
            <a href="${s1.twitch}" target="_blank" class="streamer-link" onclick="event.stopPropagation()"><i class="fab fa-twitch"></i> Twitch</a>
        </div>
        <span class="vs-text">VS</span>
        <div class="streamer-card" onclick="selectStreamer(1)">
            <img src="${s2.image}" alt="${s2.name}" class="streamer-image" onerror="this.src='https://via.placeholder.com/150?text=?'">
            <h3 class="streamer-name">${s2.name}</h3>
            <a href="${s2.twitch}" target="_blank" class="streamer-link" onclick="event.stopPropagation()"><i class="fab fa-twitch"></i> Twitch</a>
        </div>
    `;
}

function selectStreamer(index) {
    const selected = currentStreamers[index];
    currentStreamers.splice(0, 2);
    currentStreamers.push(selected);
    currentStreamers.sort(() => Math.random() - 0.5);
    setTimeout(showNextMatch, 300);
}

function showWinner() {
    document.getElementById('bracketVoting').style.display = 'none';
    document.getElementById('winnerDisplay').style.display = 'block';
    
    document.getElementById('winnerCard').innerHTML = `
        <img src="${winner.image}" alt="${winner.name}" class="streamer-image" onerror="this.src='https://via.placeholder.com/200?text=?'">
        <h3 class="streamer-name">${winner.name}</h3>
        <a href="${winner.twitch}" target="_blank" class="streamer-link"><i class="fab fa-twitch"></i> Twitch</a>
    `;
}

async function submitVote() {
    const result = await sendToBackend('voteNomination', {
        nomination: currentNomination,
        voterNick: voterData.nick,
        voterTelegram: voterData.telegram,
        voterTwitch: voterData.twitch,
        winnerName: winner.name,
        winnerTwitch: winner.twitch
    });

    if (result.success) {
        markAsActed(`voted_${currentNomination}`);
        document.getElementById('winnerDisplay').style.display = 'none';
        document.getElementById('voteSuccess').style.display = 'block';
        checkVotedNominations();
    } else {
        showModal('errorModal', result.error || 'Ошибка отправки');
    }
}

function backToNominations() {
    showSection('voteSection');
    voterData = {};
    currentStreamers = [];
    winner = null;
}

// ============================================
// NOMINEES LIST
// ============================================
function loadNominees() {
    const grid = document.getElementById('nomineesGrid');
    
    grid.innerHTML = STREAMERS_DB.map(s => `
        <div class="nominee-card" onclick="openNomineeProfile(${s.id})">
            <img src="${s.image}" alt="${s.name}" class="nominee-card-image" onerror="this.src='https://via.placeholder.com/100?text=?'">
            <h3 class="nominee-card-name">${s.name}</h3>
            <p class="nominee-card-hint">Нажмите для подробностей</p>
        </div>
    `).join('');
}

function openNomineeProfile(id) {
    const s = STREAMERS_DB.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById('nomineeProfileImage').src = s.profileImage || s.image;
    document.getElementById('nomineeProfileName').textContent = s.name;
    document.getElementById('nomineeProfileTwitch').href = s.twitch;
    
    const interview = s.interview?.q1 ? `
        <div class="interview-item"><p class="interview-question">${s.interview.q1}</p><p class="interview-answer">${s.interview.a1}</p></div>
        <div class="interview-item"><p class="interview-question">${s.interview.q2}</p><p class="interview-answer">${s.interview.a2}</p></div>
        <div class="interview-item"><p class="interview-question">${s.interview.q3}</p><p class="interview-answer">${s.interview.a3}</p></div>
    ` : '<p style="color:#d4af37;">Интервью скоро появится...</p>';
    
    document.getElementById('nomineeInterviewContent').innerHTML = interview;
    document.getElementById('nomineeProfileModal').classList.add('active');
}

// ============================================
// VOTES COUNT
// ============================================
function loadVotes() {
    const container = document.getElementById('votesContainer');
    const sorted = [...STREAMERS_DB].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const max = sorted[0]?.votes || 1;
    const medals = ['🥇', '🥈', '🥉'];
    
    container.innerHTML = sorted.map((s, i) => `
        <div class="vote-item">
            <div class="vote-position ${i < 3 ? 'top-3' : ''}">${i < 3 ? medals[i] : i + 1}</div>
            <img src="${s.image}" class="vote-avatar" onerror="this.src='https://via.placeholder.com/50?text=?'">
            <div class="vote-info">
                <div class="vote-name">${s.name}</div>
                <div class="vote-bar-container"><div class="vote-bar" style="width:${(s.votes || 0) / max * 100}%"></div></div>
            </div>
            <div class="vote-count">${s.votes || 0}</div>
        </div>
    `).join('');
}

// ============================================
// SUPPORT
// ============================================
function openSupportModal() {
    const lastSent = localStorage.getItem('supportLastSent');
    
    if (lastSent) {
        const hoursLeft = 24 - (Date.now() - parseInt(lastSent)) / 3600000;
        if (hoursLeft > 0) {
            document.getElementById('supportCooldown').textContent = 
                `${Math.floor(hoursLeft)} ч. ${Math.floor((hoursLeft % 1) * 60)} мин.`;
            showSupportStep('supportAlreadySent');
            document.getElementById('supportModal').classList.add('active');
            return;
        }
    }
    
    showSupportStep('supportStep1');
    document.getElementById('supportTelegram').value = '';
    document.getElementById('supportMessage').value = '';
    document.getElementById('supportModal').classList.add('active');
}

function closeSupportModal() {
    document.getElementById('supportModal').classList.remove('active');
}

function showSupportStep(stepId) {
    ['supportStep1', 'supportStep2', 'supportStep3', 'supportStep4', 'supportAlreadySent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = id === stepId ? 'block' : 'none';
    });
}

function supportStep2() {
    const telegram = document.getElementById('supportTelegram').value.trim();
    if (!telegram) {
        showModal('errorModal', 'Введите Telegram');
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
    
    if (!message || message.length < 10) {
        showModal('errorModal', 'Сообщение слишком короткое (минимум 10 символов)');
        return;
    }

    const result = await sendToBackend('support', {
        telegram: supportUserTelegram,
        message: message
    });
    
    if (result.success) {
        localStorage.setItem('supportLastSent', Date.now().toString());
        showSupportStep('supportStep4');
    } else {
        showModal('errorModal', result.error || 'Ошибка отправки');
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
