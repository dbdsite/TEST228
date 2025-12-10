// Весь JavaScript-код из тега <script> переносится сюда

// ============================================
// CONFIGURATION - НАСТРОЙКИ
// ============================================
const CONFIG = {
    // Включение/выключение кнопок (true = включено, false = выключено)
    BUTTONS: {
        SUGGEST_STREAMER: true,      // Предложить стримера
        NOMINATE_STREAMER: false,     // Номинировать стримера
        STREAMERS_LIST: true,        // Список стримеров
        NOMINEES_LIST: false,         // Список номинантов
        SUPPORT_FUND: true,          // Поддержать фонд
        INFO: true,                  // Информация о мероприятии
        VOTES_COUNT: true,           // Количество голосов
        CONTACT_SUPPORT: true        // Связаться с поддержкой
    },

    // Telegram Bot Configuration
    TELEGRAM_BOT_TOKEN: '7648746510:AAECKk-hOAIMd1_eQZItO8X69lQgKNl6Eoo',
    TELEGRAM_CHAT_ID: '-1003313064216',

    // Thread IDs для разных разделов
    THREADS: {
        SUGGESTIONS: 5,
        BEST_STREAMER: 7,
        BEST_GUIDE: 9,
        BEST_ENTERTAINMENT: 11,
        VIEWERS_CHOICE: 13,
        SUPPORT: 27,
        STREAMERS_LIST_VOTE: 51
    },

    // Google Sheets Configuration
    GOOGLE_SHEET_ID: '1Ncsp22K5EEa9ofqED8JEU-mKbB9fLP757_6SzRNr2Uw',
    GOOGLE_SHEET_NAME: 'SlayDBD25',

    // Ссылка для поддержки
    SUPPORT_URL: 'https://dalink.to/slaydbd25'
};

// ============================================
// БАЗА ДАННЫХ СТРИМЕРОВ
// ============================================
const STREAMERS_DB = [
    {
        id: 1,
        name: "Spc_tgc",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/f983d142-d6e5-46cf-80d9-f9c5cd6c6836-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=1",
        twitch: "https://twitch.tv/spc_tgc",
        votes: 30,
        interview: {
            q1: "Как давно стримишь?",
            a1: "Достаточно давно, больше 5 лет.",
            q2: "Что самое важное в стриме?",
            a2: "Взаимодействие с коммьюнити и качественный контент.",
            q3: "Пожелание зрителям?",
            a3: "Спасибо за вашу поддержку и активность!"
        }
    },
    // ... остальные стримеры ...
    {
        id: 49,
        name: "E1issey",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/d194b7dc-2faf-4379-ad08-1bea5328a273-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=49",
        twitch: "https://twitch.tv/e1issey",
        votes: 0,
        interview: {
            q1: "Элисси?",
            a1: "Уникальное написание моего имени Элис.",
            q2: "О чем стримы?",
            a2: "Арт-стримы, дизайн и креативные программы.",
            q3: "Пожелание?",
            a3: "Творите каждый день. Пока!"
        }
    }
];

// ... остальной JavaScript-код ...

// ============================================
// INITIALIZATION
// ============================================
console.log('%c⚠️ СТОП!', 'color: red; font-size: 50px; font-weight: bold;');
console.log('%cЭто функция браузера предназначена для разработчиков.', 'font-size: 18px;');