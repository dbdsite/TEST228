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

            // Thread IDs для разных разделов (Message Thread ID для топиков в группе)
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
        // БАЗА ДАННЫХ СТРИМЕРОВ (32 стримера)
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
    {
        id: 2,
        name: "MogilevTM",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/183376cf-247a-433e-91bd-22fcd30d3901-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=2",
        twitch: "https://twitch.tv/mogilevtm",
        votes: 22,
        interview: {
            q1: "Почему начал стримить?",
            a1: "Хотел делиться своим игровым опытом.",
            q2: "Твой главный секрет успеха?",
            a2: "Регулярность и постоянное самосовершенствование.",
            q3: "Планы на будущее?",
            a3: "Расти дальше и пробовать новые форматы."
        }
    },
    {
        id: 3,
        name: "Otryzhka_Bomzha",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/d132b535-5ea8-4e10-91d7-6f31ba1c3e50-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=3",
        twitch: "https://twitch.tv/otryzhka_bomzha",
        votes: 14,
        interview: {
            q1: "Особенность твоих стримов?",
            a1: "Много юмора и общения с чатом.",
            q2: "Самый запоминающийся момент?",
            a2: "Когда собрал 1000 зрителей в первый раз.",
            q3: "Что мотивирует?",
            a3: "Реакция и отзывы моих зрителей."
        }
    },
    {
        id: 4,
        name: "Provans_Kate",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/b852763d-fd00-46e3-b5ff-765df0ebacd0-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=4",
        twitch: "https://twitch.tv/provans_kate",
        votes: 14,
        interview: {
            q1: "Твоя ниша?",
            a1: "Развлекательные и игровые стримы.",
            q2: "Сложности в начале пути?",
            a2: "Было трудно набрать первую аудиторию.",
            q3: "Совет новичкам?",
            a3: "Будьте собой и не бойтесь экспериментировать."
        }
    },
    {
        id: 5,
        name: "STROGANOV",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/96383744-94f7-41a1-af62-3fe7c7641f09-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=5",
        twitch: "https://twitch.tv/stroganov",
        votes: 13,
        interview: {
            q1: "Как пришел в стриминг?",
            a1: "Друзья предложили попробовать.",
            q2: "Любимая игра для стримов?",
            a2: "Сейчас это Escape from Tarkov.",
            q3: "Что ценишь в зрителях?",
            a3: "Их преданность и чувство юмора."
        }
    },
    {
        id: 6,
        name: "Mulder",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/61dffcb4-a3d1-4347-bbd4-80a74b57307a-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=6",
        twitch: "https://twitch.tv/mulder",
        votes: 11,
        interview: {
            q1: "Идея для никнейма?",
            a1: "Большой фанат сериала 'Секретные материалы'.",
            q2: "Формат стримов?",
            a2: "Расследования в разных играх и разборы лора.",
            q3: "Пожелание коммьюнити?",
            a3: "Ищите истину! Спасибо за просмотры."
        }
    },
    {
        id: 7,
        name: "Penguin_Ruina",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/17e0566d-7b5c-453c-b7d6-a94569c05c80-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=7",
        twitch: "https://twitch.tv/penguin_ruina",
        votes: 10,
        interview: {
            q1: "Почему 'Penguin'?",
            a1: "Обожаю пингвинов с детства.",
            q2: "Твое настроение на стриме?",
            a2: "Всегда позитивное, даже при проигрышах.",
            q3: "Цель на этот год?",
            a3: "Достичь партнерки на Twitch."
        }
    },
    {
        id: 8,
        name: "AneSstezia",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/61d0b92f-27dc-4fd9-b35f-9cba01f5302c-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=8",
        twitch: "https://twitch.tv/anessstezia",
        votes: 9,
        interview: {
            q1: "Специализация?",
            a1: "Стримы по хоррорам и инди-играм.",
            q2: "Атмосфера канала?",
            a2: "Уютная и немного мистическая.",
            q3: "Спасибо зрителям?",
            a3: "Вы создаете эту уникальную атмосферу!"
        }
    },
    {
        id: 9,
        name: "KiperOnZavod",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/9b0e6eea-1ff5-4601-a4f4-f7681a6397e4-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=9",
        twitch: "https://twitch.tv/kiperonzavod",
        votes: 9,
        interview: {
            q1: "Никнейм означает?",
            a1: "Был вратарем на заводских турнирах.",
            q2: "Часто играешь?",
            a2: "Каждый день, в основном FIFA и футбольные симуляторы.",
            q3: "Привет зрителям?",
            a3: "Всем гол! Заходите поболеть за наши виртуальные матчи."
        }
    },
    {
        id: 10,
        name: "ParabellumLTD",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/cce3ce1c-bfec-4f25-80a7-4c0283118dce-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=10",
        twitch: "https://twitch.tv/parabellumltd",
        votes: 9,
        interview: {
            q1: "Философия канала?",
            a1: "Если хочешь мира, готовься к войне (в играх).",
            q2: "Любимый жанр?",
            a2: "Тактические шутеры и стратегии.",
            q3: "Лозунг?",
            a3: "Играй умно, побеждай красиво."
        }
    },
    {
        id: 11,
        name: "Kalerine",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/99f2889a-f77a-4ef0-9990-a7aca8413760-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=11",
        twitch: "https://twitch.tv/kalerine",
        votes: 7,
        interview: {
            q1: "О себе?",
            a1: "Стример, художник и любительница RPG.",
            q2: "Чем удивляешь зрителей?",
            a2: "Иногда рисую в прямом эфире.",
            q3: "Пожелание?",
            a3: "Творите и не бойтесь проявлять себя!"
        }
    },
    {
        id: 12,
        name: "KRISTYUSHA_",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad5997f1-c8b8-4dd5-8e44-1af0b476f91d-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=12",
        twitch: "https://twitch.tv/kristyusha_",
        votes: 7,
        interview: {
            q1: "Контент?",
            a1: "Разговорные стримы и прохождения сюжетных игр.",
            q2: "Ключ к общению с чатом?",
            a2: "Искренность и открытость.",
            q3: "Спасибо?",
            a3: "Спасибо, что делаете каждый эфир теплее."
        }
    },
    {
        id: 13,
        name: "MrGrifonio",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/db6f7818-f007-4187-b844-69cc522be453-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=13",
        twitch: "https://twitch.tv/mrgrifonio",
        votes: 7,
        interview: {
            q1: "Откуда такой ник?",
            a1: "От любви к грифонам и фэнтези.",
            q2: "Основные игры?",
            a2: "MMORPG и кооперативные приключения.",
            q3: "Приветствие?",
            a3: "Добро пожаловать в мое логово, путники!"
        }
    },
    {
        id: 14,
        name: "Riversong___",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/bcebbd2b-2034-4da6-9454-9041b46a059b-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=14",
        twitch: "https://twitch.tv/riversong___",
        votes: 7,
        interview: {
            q1: "Вдохновение для ника?",
            a1: "Персонаж из Доктора Кто и любовь к музыке.",
            q2: "Что на стримах?",
            a2: "Музыкальные подборки, игры и философские беседы.",
            q3: "Прощальные слова?",
            a3: "Помните, что каждая река найдет свое море."
        }
    },
    {
        id: 15,
        name: "TumannayaMgla",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/519164d5-8061-46c0-ad90-f2ff2c0e8aab-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=15",
        twitch: "https://twitch.tv/tumannayamgla",
        votes: 6,
        interview: {
            q1: "Атмосфера?",
            a1: "Спокойные, медитативные стримы, часто с атмосферными играми.",
            q2: "Любимое время для стрима?",
            a2: "Поздний вечер или ночь.",
            q3: "Пожелание?",
            a3: "Находите время на умиротворение."
        }
    },
    {
        id: 16,
        name: "Vshtamm",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/0acbf4e9-a0f6-4d06-aa79-690f814fee2c-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=16",
        twitch: "https://twitch.tv/vshtamm",
        votes: 6,
        interview: {
            q1: "Тематика?",
            a1: "Выживание в играх и реальные навыки.",
            q2: "Чему можно научиться?",
            a2: "Основам выживания, разведению костров и т.д.",
            q3: "Девиз?",
            a3: "Будь готов ко всему!"
        }
    },
    {
        id: 17,
        name: "Animu19",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/b85dac9b-0ef6-427f-890c-8c1097973e53-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=17",
        twitch: "https://twitch.tv/animu19",
        votes: 5,
        interview: {
            q1: "Почему аниме?",
            a1: "Это часть моей жизни с детства.",
            q2: "Контент?",
            a2: "Обзоры аниме, обсуждения и аниме-игры.",
            q3: "Рекомендация?",
            a3: "Посмотрите 'Клинок, рассекающий демонов'!"
        }
    },
    {
        id: 18,
        name: "Californication",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/61a303dd-fb89-4ae5-b329-95e1097a01cc-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=18",
        twitch: "https://twitch.tv/californication",
        votes: 5,
        interview: {
            q1: "Стиль?",
            a1: "Независимый дух Калифорнии и рок-н-ролл.",
            q2: "Музыка на стримах?",
            a2: "Много классического рока и гранжа.",
            q3: "Фраза на прощание?",
            a3: "Stay cool, California dreaming!"
        }
    },
    {
        id: 19,
        name: "DianaDunaeva",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/49ed9681-9fd2-427f-a5cc-e38818551ca8-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=19",
        twitch: "https://twitch.tv/dianadunaeva",
        votes: 5,
        interview: {
            q1: "Чем занимаешься?",
            a1: "Стримы по Sims 4 и другим симуляторам жизни.",
            q2: "Особенность?",
            a2: "Создаю целые истории и семьи в играх.",
            q3: "Приглашение?",
            a3: "Приходите, обсудим сюжетные повороты вместе!"
        }
    },
    {
        id: 20,
        name: "MCPLEH",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/b7a31939-32c0-404d-8b5a-3bea0be49c98-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=20",
        twitch: "https://twitch.tv/mcpleh",
        votes: 5,
        interview: {
            q1: "Minecraft?",
            a1: "Да, это моя основная и давняя любовь.",
            q2: "Что строишь?",
            a2: "Большие замки, механизмы и целые города.",
            q3: "Привет киберспортсменам?",
            a3: "Добро пожаловать на стройплощадку!"
        }
    },
    {
        id: 21,
        name: "T1muren",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/cb5f7869-99b6-4a61-a85e-da6e2b5bdfe9-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=21",
        twitch: "https://twitch.tv/t1muren",
        votes: 5,
        interview: {
            q1: "Никнейм?",
            a1: "Комбинация имени Тимур и увлечения IT.",
            q2: "Специализация?",
            a2: "Киберспортивные дисциплины, разборы стратегий.",
            q3: "Совет игрокам?",
            a3: "Анализируйте свои ошибки, это ключ к прогрессу."
        }
    },
    {
        id: 22,
        name: "TimeToKillTeam",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/cf9f8fe6-e398-483c-886f-d8fd377a9caf-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=22",
        twitch: "https://twitch.tv/timetokillteam",
        votes: 5,
        interview: {
            q1: "Командный стриминг?",
            a1: "Да, мы команда из нескольких человек.",
            q2: "Преимущество?",
            a2: "Всегда живое общение и разные взгляды.",
            q3: "Кредо?",
            a3: "Вместе веселее и эффективнее!"
        }
    },
    {
        id: 23,
        name: "Immolimbo",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/e883a3a3-fd6e-4958-b929-9299ea5cf724-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=23",
        twitch: "https://twitch.tv/immolimbo",
        votes: 4,
        interview: {
            q1: "Стиль игр?",
            a1: "Хардкорные прохождения и сложные боссы.",
            q2: "Зачем усложнять?",
            a2: "Это дает азарт и настоящее чувство победы.",
            q3: "Что скажешь новичкам?",
            a3: "Не сдавайтесь после первой же смерти."
        }
    },
    {
        id: 24,
        name: "TheCrashB",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/d7d67dfe-230a-4f8f-81e5-7157c37bce84-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=24",
        twitch: "https://twitch.tv/thecrashb",
        votes: 4,
        interview: {
            q1: "Почему 'Crash'?",
            a1: "Люблю гонки и аварии в симуляторах.",
            q2: "Основная игра?",
            a2: "BeamNG.drive и другие автосимуляторы.",
            q3: "Пожелание?",
            a3: "Пристегивайтесь, будет жарко!"
        }
    },
    {
        id: 25,
        name: "Tigra",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/f5cb5de3-3e93-49c6-a5b3-03b1523589dc-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=25",
        twitch: "https://twitch.tv/tigra",
        votes: 4,
        interview: {
            q1: "Твоя харизма?",
            a1: "Энергичная и хищная, как у тигра.",
            q2: "Жанры?",
            a2: "Экшен, файтинги, динамичные игры.",
            q3: "Рычишь на прощание?",
            a3: "До встречи в джунглях, не отставайте!"
        }
    },
    {
        id: 26,
        name: "Cfcbrt",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/188bb88f-1f7f-4da4-b849-d6159bfd439d-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=26",
        twitch: "https://twitch.tv/cfcbrt",
        votes: 3,
        interview: {
            q1: "Аббревиатура в нике?",
            a1: "Личный шифр из юности.",
            q2: "Чем увлекаешься?",
            a2: "Головоломки, стратегии и программирование.",
            q3: "Финальная фраза?",
            a3: "Думайте нестандартно. Пока!"
        }
    },
    {
        id: 27,
        name: "NightFuryo3o",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/c6d254e0-e155-4268-beac-23a79db42d74-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=27",
        twitch: "https://twitch.tv/nightfuryo3o",
        votes: 3,
        interview: {
            q1: "Ночной фьюри?",
            a1: "Да, от дракона из 'Как приручить дракона'.",
            q2: "Время стримов?",
            a2: "Практически всегда ночью.",
            q3: "Привет совам?",
            a3: "Спокойной ночи, всем совиный привет!"
        }
    },
    {
        id: 28,
        name: "Vladaholod",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/9b19d1b2-bb30-49d9-9d76-83bf7ed95aba-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=28",
        twitch: "https://twitch.tv/vladaholod",
        votes: 3,
        interview: {
            q1: "Холодно?",
            a1: "Люблю зимние локации в играх.",
            q2: "Любимая игра?",
            a2: "Metro Exodus и другие постапокалипсисы.",
            q3: "Напутствие?",
            a3: "Одевайтесь теплее, впереди много снега."
        }
    },
    {
        id: 29,
        name: "HozyMei",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/7bf0b38e-a322-46bf-a95a-92133e36a63a-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=29",
        twitch: "https://twitch.tv/hozymeii",
        votes: 2,
        interview: {
            q1: "Откуда ник?",
            a1: "От слов 'Хозяин' и 'Mei' из Overwatch.",
            q2: "Роль в играх?",
            a2: "Чаще играю поддержку или контроллеров.",
            q3: "Подпись?",
            a3: "Устраивайтесь поудобнее, я всё контролирую."
        }
    },
    {
        id: 30,
        name: "iPiC",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/99e1979b-5fb8-493f-889f-4bc574b251c4-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=30",
        twitch: "https://twitch.tv/ipic",
        votes: 2,
        interview: {
            q1: "Короткий ник?",
            a1: "Люблю минимализм, да и запомнить легко.",
            q2: "Контент?",
            a2: "Короткие и интенсивные игровые сессии.",
            q3: "Прощание?",
            a3: "Всё гениальное просто. До завтра!"
        }
    },
    {
        id: 31,
        name: "Lagerta_Seeman",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/481347b6-d915-4e3f-bb44-613a427e79f1-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=31",
        twitch: "https://twitch.tv/lagerta_seeman",
        votes: 2,
        interview: {
            q1: "Морская тема?",
            a1: "Бывший моряк, люблю морские баталии.",
            q2: "Какие игры?",
            a2: "World of Warships, Sea of Thieves.",
            q3: "Крик души?",
            a3: "Полный вперед! Курс на новый контент!"
        }
    },
    {
        id: 32,
        name: "Mypx7ka",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/64fa2c37-8468-468c-b3d2-b815f00f663b-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=32",
        twitch: "https://twitch.tv/mypx7ka",
        votes: 2,
        interview: {
            q1: "Загадочный ник?",
            a1: "Это секрет, который знают только постоянные.",
            q2: "Что показываешь?",
            a2: "Стримы с ARG и загадочными играми.",
            q3: "Намек?",
            a3: "Ищите подсказки, они везде..."
        }
    },
    {
        id: 33,
        name: "PRIUT_BEZDELNIKA",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/640c5535-ad20-491d-a02c-fbebac539ac6-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=33",
        twitch: "https://twitch.tv/priut_bezdeelnika",
        votes: 2,
        interview: {
            q1: "Приют?",
            a1: "Да, это место, где можно расслабиться.",
            q2: "Атмосфера?",
            a2: "Ленивая и уютная, без спешки.",
            q3: "Предложение?",
            a3: "Заходи, отдохни от дел."
        }
    },
    {
        id: 34,
        name: "Sharllin",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/8a5cbef6-e7c7-4740-b699-41644ed3e023-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=34",
        twitch: "https://twitch.tv/sharllin",
        votes: 2,
        interview: {
            q1: "Имя?",
            a1: "Комбинация Шарлин и shark (акула).",
            q2: "Поведение на стриме?",
            a2: "Активная, резкая, но дружелюбная.",
            q3: "Прощание?",
            a3: "Не попадайтесь мне на зуб! Шучу. Пока!"
        }
    },
    {
        id: 35,
        name: "DasaR_29",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/451574a9-dd70-4b0c-87ef-559cfbf507c2-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=35",
        twitch: "https://twitch.tv/dasar_29",
        votes: 1,
        interview: {
            q1: "Начало пути?",
            a1: "Стримлю недавно, всего пару месяцев.",
            q2: "Почему решил?",
            a2: "Друзья уговорили попробовать.",
            q3: "Обращение к зрителям?",
            a3: "Рад каждому, кто зашел! Помогите советом."
        }
    },
    {
        id: 36,
        name: "Glimkat",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/98038355-f0f5-4804-9abc-57c42148a0d0-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=36",
        twitch: "https://twitch.tv/glimkat",
        votes: 1,
        interview: {
            q1: "Значение ника?",
            a1: "Мерцающий кот (Glimmer + cat).",
            q2: "Что на стримах?",
            a2: "Уютные игры, инди-платформеры.",
            q3: "Прощание?",
            a3: "Мур-мяу, всем спокойной ночи!"
        }
    },
    {
        id: 37,
        name: "Goleaf_Gaming",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/08362008-b30c-4609-b665-68c0b82853cb-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=37",
        twitch: "https://twitch.tv/goleaf_gaming",
        votes: 1,
        interview: {
            q1: "Goleaf?",
            a1: "Отсылка к 'золотому листу' и росту.",
            q2: "Цель канала?",
            a2: "Стать большим и зеленым, как дерево.",
            q3: "Пожелание?",
            a3: "Растите вместе со мной!"
        }
    },
    {
        id: 38,
        name: "Laeykka",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/0944edbb-3f35-4b24-9f19-121e54cc14e5-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=38",
        twitch: "https://twitch.tv/laeykka",
        votes: 1,
        interview: {
            q1: "Произношение?",
            a1: "Лейкка. От слова 'lake' (озеро).",
            q2: "Тема?",
            a2: "Спокойные игры-исследования.",
            q3: "Фраза?",
            a3: "Тихие воды глубоки. До встречи."
        }
    },
    {
        id: 39,
        name: "Pand0ra_Actor",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/130579d8-35a7-448c-8ae0-523f09accae7-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=39",
        twitch: "https://twitch.tv/pand0ra_actor",
        votes: 1,
        interview: {
            q1: "Актер?",
            a1: "Да, закончил театральный, люблю вживаться в роли.",
            q2: "Как это в стримах?",
            a2: "Озвучиваю персонажей и разыгрываю сцены.",
            q3: "Цитата?",
            a3: "Каждый стрим - это новая роль."
        }
    },
    {
        id: 40,
        name: "GalaxyTM",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/b1b9b857-e5c7-4649-b106-9d52605b98cf-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=40",
        twitch: "https://twitch.tv/galaxytm",
        votes: 0,
        interview: {
            q1: "Галактика?",
            a1: "Обожаю космос и научную фантастику.",
            q2: "Игры?",
            a2: "No Man's Sky, Star Citizen, Elite Dangerous.",
            q3: "Послание?",
            a3: "Смотрите вверх, там целые миры!"
        }
    },
    {
        id: 41,
        name: "KichiRichiii",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/3f14b33a-d4a0-4c14-a27a-e3bd220f7ee1-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=41",
        twitch: "https://twitch.tv/kichirichiii",
        votes: 0,
        interview: {
            q1: "Аниме-ник?",
            a1: "Да, вдохновлен персонажами-сорванцами.",
            q2: "Энергия?",
            a2: "Много криков, смеха и сумасшествия.",
            q3: "Крик?",
            a3: "У-у-у-у! Зажигаем!"
        }
    },
    {
        id: 42,
        name: "Meinlend",
        image: "https://static-cdn.jtvnw.net/user-default-pictures-uv/ead5c8b2-a4c9-4724-b1dd-9f00b46cbd3d-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=42",
        twitch: "https://twitch.tv/meinlend",
        votes: 0,
        interview: {
            q1: "Стратег?",
            a1: "Точно. Люблю экономику и планирование.",
            q2: "Основные игры?",
            a2: "Hearts of Iron, Civilization, менеджеры.",
            q3: "Совет?",
            a3: "Планируйте на десять ходов вперед."
        }
    },
    {
        id: 43,
        name: "Moldim94",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/5e81a11c-9c20-46af-9132-5ee70dc6cef3-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=43",
        twitch: "https://twitch.tv/moldim94",
        votes: 0,
        interview: {
            q1: "Ретро-геймер?",
            a1: "Да, вырос на играх 90-х и 2000-х.",
            q2: "Что играешь?",
            a2: "Старые RPG, платформеры с эмуляторов.",
            q3: "Лозунг?",
            a3: "Старая школа - лучшая школа!"
        }
    },
    {
        id: 44,
        name: "Mommyalya",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/91cb67be-e0fc-4573-99b4-e94e23ed1bc4-profile_image-70x70.jpeg",
        profileImage: "https://i.pravatar.cc/500?img=44",
        twitch: "https://twitch.tv/mommyalya",
        votes: 0,
        interview: {
            q1: "Мамочка?",
            a1: "Это мое внутрикомьюнити прозвище.",
            q2: "Атмосфера?",
            a2: "Домашняя, заботливая, как в семье.",
            q3: "Прощание?",
            a3: "Не забудьте покушать. Целую!"
        }
    },
    {
        id: 45,
        name: "Pluto_Show",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/820f6700-4625-46f9-bded-b8010609967d-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=45",
        twitch: "https://twitch.tv/pluto_show",
        votes: 0,
        interview: {
            q1: "Плутон?",
            a1: "Да, это планета, и это шоу!",
            q2: "Формат?",
            a2: "Развлекательные шоу, викторины, интерактив.",
            q3: "Анонс?",
            a3: "Оставайтесь на линии, шоу начинается!"
        }
    },
    {
        id: 46,
        name: "xVETKA",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/998b3d6b-67c2-499c-8c9f-ee3a36c29fef-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=46",
        twitch: "https://twitch.tv/xvetka",
        votes: 0,
        interview: {
            q1: "Ветка?",
            a1: "Люблю природу и лесные походы.",
            q2: "Игровой сеттинг?",
            a2: "Игры с открытым миром и природой.",
            q3: "Прощание?",
            a3: "Не сворачивайте с тропы. Увидимся!"
        }
    },
    {
        id: 47,
        name: "YaponaMad",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/430e67d4-b5a5-43bc-92b0-6e5ccdb47ded-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=47",
        twitch: "https://twitch.tv/yaponamad",
        votes: 0,
        interview: {
            q1: "Япония?",
            a1: "Обожаю японскую культуру и игры.",
            q2: "Контент?",
            a2: "Японские экшены, JRPG, аниме-стиль.",
            q3: "Возглас?",
            a3: "Банзай! Давайте греть этот чат!"
        }
    },
    {
        id: 48,
        name: "ZlobnayaPoltorashka",
        image: "https://static-cdn.jtvnw.net/jtv_user_pictures/4d2a66dc-0968-4d25-ae2c-812333a92275-profile_image-70x70.png",
        profileImage: "https://i.pravatar.cc/500?img=48",
        twitch: "https://twitch.tv/zlobnayapoltorashka",
        votes: 0,
        interview: {
            q1: "Злая полторашка?",
            a1: "Это внутренняя шутка про бутылку воды.",
            q2: "Настроение?",
            a2: "Ироничное, иногда саркастичное.",
            q3: "Фраза?",
            a3: "Не злите полторашку, а то плеснёт!"
        }
    },
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
                showModal('disabledModal', `Раздел "${button.name}" пока что недоступен. Следите за новостями у нас в Соц. Сетях!`);
                return;
            }
            
            button.action();
        }

        // ============================================
        // INTRO ANIMATION
        // ============================================
        document.addEventListener('DOMContentLoaded', function() {
            createIntroParticles();
            setTimeout(() => {
                document.getElementById('introOverlay').classList.add('hidden');
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
        // STREAMERS FROM GOOGLE SHEETS
        // ============================================
        async function loadStreamersFromSheet() {
            const loadingEl = document.getElementById('streamersLoading');
            const errorEl = document.getElementById('streamersError');
            const gridEl = document.getElementById('streamersGrid');
            
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            gridEl.innerHTML = '';
            
            if (!CONFIG.GOOGLE_SHEET_ID || 
                CONFIG.GOOGLE_SHEET_ID === 'ВАШ_ID_ТАБЛИЦЫ' || 
                CONFIG.GOOGLE_SHEET_ID.length < 10) {
                loadingEl.style.display = 'none';
                renderStreamers(STREAMERS_DB);
                return;
            }
            
            try {
                const url = `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(CONFIG.GOOGLE_SHEET_NAME)}`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const csvText = await response.text();
                const lines = csvText.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) throw new Error('Таблица пуста');
                
                const streamers = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i].trim());
                    const name = values[0] || '';
                    const image = values[1] || '';
                    const twitch = values[2] || '';
                    
                    if (name && twitch) {
                        streamers.push({
                            name: name.trim(),
                            image: image.trim() || 'https://via.placeholder.com/150?text=No+Image',
                            twitch: twitch.trim()
                        });
                    }
                }
                
                loadingEl.style.display = 'none';
                renderStreamers(streamers.length > 0 ? streamers : STREAMERS_DB);
                
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                loadingEl.style.display = 'none';
                renderStreamers(STREAMERS_DB);
            }
        }

        function parseCSVLine(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.replace(/^"|"$/g, '').trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.replace(/^"|"$/g, '').trim());
            return result;
        }

        function renderStreamers(streamers) {
            const gridEl = document.getElementById('streamersGrid');
            const hasVoted = hasAlreadyActed('streamersListVoted');
            
            if (streamers.length === 0) {
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
            
            const progress = ((32 - remainingInRound) / 31) * 100;
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
