// js/event.js — логика страницы конкретного мероприятия + чат

document.addEventListener('DOMContentLoaded', function () {

    // === Получаем ID мероприятия из URL ===
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        window.location.href = 'index.html';
        return;
    }

    // === Элементы страницы ===
    const eventDetail = document.getElementById('eventDetail');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatLoginHint = document.getElementById('chatLoginHint');
    const inviteBtn = document.getElementById('inviteBtn');
    const friendEmail = document.getElementById('friendEmail');
    const vkChatBtn = document.getElementById('vkChatBtn');
    const chatParticipants = document.getElementById('chatParticipants');
    const inviteBox = document.getElementById('inviteBox');
    const userStatus = document.getElementById('userStatus');

    // === Состояние ===
    let currentEvent = null;
    let chatPollingInterval = null;
    let lastMessageId = 0;

    // === Обновляем статус пользователя ===
    updateUserStatus();

    // === Загружаем мероприятие ===
    loadEvent();

    // === Загрузка мероприятия ===
    async function loadEvent() {
        try {
            currentEvent = await ApiService.getEventById(eventId);
        } catch (error) {
            console.warn('Сервер недоступен, используем демо:', error.message);
            currentEvent = getDemoEvent(parseInt(eventId));
        }

        if (!currentEvent) {
            eventDetail.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Мероприятие не найдено</h3></div>';
            return;
        }

        renderEventDetail();
        initChat();
    }

    // === Отрисовка деталей мероприятия ===
    function renderEventDetail() {
        const ev = currentEvent;
        const image = ev.image || 'https://picsum.photos/seed/' + ev.id + '/1200/600';
        const priceText = (ev.price === 0 || ev.price === 'free' || !ev.price)
            ? '<span class="event-price free">Бесплатно</span>'
            : '<span class="event-price">' + ev.price + ' ₽</span>';

        eventDetail.innerHTML =
            '<div class="event-detail-image">' +
            '  <img src="' + image + '" alt="' + escapeHtml(ev.title) + '" ' +
            '       onerror="this.src=\'https://picsum.photos/seed/' + ev.id + '/1200/600\'">' +
            '</div>' +
            '<div class="event-detail-body">' +
            '  <h1>' + escapeHtml(ev.title) + '</h1>' +
            '  <div class="event-detail-meta">' +
            '    <div class="meta-item"><i class="fas fa-calendar"></i> <span>' + escapeHtml(ev.date || '') + '</span></div>' +
            '    <div class="meta-item"><i class="fas fa-clock"></i> <span>' + escapeHtml(ev.time || '') + '</span></div>' +
            '    <div class="meta-item"><i class="fas fa-map-marker-alt"></i> <span>' + escapeHtml(ev.location || '') + '</span></div>' +
            '    <div class="meta-item"><i class="fas fa-ruble-sign"></i> <span>' + priceText + '</span></div>' +
            '  </div>' +
            '  <div class="event-detail-description">' + escapeHtml(ev.description || '') + '</div>' +
            '  <div class="event-detail-actions">' +
            '    <button id="joinEventBtn" class="btn btn-primary">' +
            '      <i class="fas fa-check-circle"></i> Записаться на мероприятие' +
            '    </button>' +
            '    <button id="shareBtn" class="btn btn-outline" style="border-color:var(--primary);color:var(--primary);">' +
            '      <i class="fas fa-share-alt"></i> Поделиться' +
            '    </button>' +
            '  </div>' +
            '</div>';

        // Обработчик записи на мероприятие
        const joinBtn = document.getElementById('joinEventBtn');
        if (joinBtn) {
            joinBtn.addEventListener('click', function () {
                if (!AuthService.isLoggedIn()) {
                    showNotification('Войдите, чтобы записаться на мероприятие', 'info');
                    window.location.href = 'profile.html';
                    return;
                }
                joinEvent();
            });
        }

        // Обработчик "Поделиться"
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                if (navigator.share) {
                    navigator.share({
                        title: ev.title,
                        text: 'Посмотри это мероприятие: ' + ev.title,
                        url: window.location.href
                    });
                } else {
                    // Копируем ссылку в буфер
                    navigator.clipboard.writeText(window.location.href).then(function () {
                        showNotification('Ссылка скопирована!', 'success');
                    });
                }
            });
        }
    }

    // === Записаться на мероприятие ===
    async function joinEvent() {
        const joinBtn = document.getElementById('joinEventBtn');
        try {
            await ApiService.joinEvent(eventId);
            joinBtn.innerHTML = '<i class="fas fa-check"></i> Вы записаны!';
            joinBtn.disabled = true;
            joinBtn.style.background = 'var(--success)';
            showNotification('Вы записались на мероприятие!', 'success');
        } catch (error) {
            // Даже если сервер недоступен — показываем успех (для демо)
            joinBtn.innerHTML = '<i class="fas fa-check"></i> Вы записаны!';
            joinBtn.disabled = true;
            joinBtn.style.background = 'var(--success)';
            showNotification('Вы записались на мероприятие!', 'success');
        }
    }

    // === Инициализация чата ===
    function initChat() {
        const isLoggedIn = AuthService.isLoggedIn();

        if (isLoggedIn) {
            // Пользователь авторизован — разрешаем писать
            messageInput.disabled = false;
            sendMessageBtn.disabled = false;
            chatLoginHint.style.display = 'none';
            inviteBox.style.display = 'block';

            // Отправка сообщения по клику
            sendMessageBtn.addEventListener('click', function () {
                sendChatMessage();
            });

            // Отправка по Enter
            messageInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });

            // Загружаем сообщения и запускаем опрос
            loadChatMessages();
            chatPollingInterval = setInterval(loadChatMessages, 5000); // каждые 5 сек
        } else {
            // Не авторизован — чат только для чтения
            messageInput.disabled = true;
            sendMessageBtn.disabled = true;
            chatLoginHint.style.display = 'block';
            inviteBox.style.display = 'none';

            // Всё равно загружаем сообщения
            loadChatMessages();
        }

        // === Пригласить друга ===
        if (inviteBtn) {
            inviteBtn.addEventListener('click', function () {
                inviteFriendByEmail();
            });
        }

        // === Открыть обсуждение ВК ===
        if (vkChatBtn) {
            vkChatBtn.addEventListener('click', function () {
                // Замените на ссылку вашего обсуждения ВК
                const vkDiscussionUrl = 'https://vk.com/im?media=&section=chat&csrf_id=&from=group&ref=group_menu';
                window.open(vkDiscussionUrl, '_blank');
            });
        }
    }

    // === Загрузка сообщений чата ===
    async function loadChatMessages() {
        try {
            const data = await ApiService.getChatMessages(eventId);
            const messages = Array.isArray(data) ? data : (data.messages || []);
            renderChatMessages(messages);
        } catch (error) {
            console.warn('Не удалось загрузить чат:', error.message);
            // Используем демо-сообщения
            const demoMessages = getDemoMessages();
            renderChatMessages(demoMessages);
        }
    }

    // === Отрисовка сообщений ===
    function renderChatMessages(messages) {
        if (!messages || messages.length === 0) {
            chatMessages.innerHTML =
                '<div class="chat-empty">' +
                '  <i class="fas fa-comment-dots"></i>' +
                '  <p>Начните обсуждение первым!</p>' +
                '</div>';
            return;
        }

        const currentUser = AuthService.getUser();
        const currentUserId = currentUser ? (currentUser.id || currentUser.email) : null;

        chatMessages.innerHTML = messages.map(function (msg) {
            const isOwn = currentUserId && (msg.userId === currentUserId || msg.userEmail === currentUserId);
            const avatar = msg.avatar || 'https://i.pravatar.cc/50?u=' + (msg.userId || msg.userName);
            const time = msg.time || formatTime(msg.timestamp);

            return '<div class="chat-message ' + (isOwn ? 'own' : '') + '">' +
                '  <div class="chat-message-header">' +
                '    <div class="chat-message-avatar">' +
                '      <img src="' + avatar + '" alt="" onerror="this.src=\'https://i.pravatar.cc/50\'">' +
                '    </div>' +
                '    <span class="chat-message-name">' + escapeHtml(msg.userName || 'Гость') + '</span>' +
                '    <span class="chat-message-time">' + time + '</span>' +
                '  </div>' +
                '  <div class="chat-message-text">' + escapeHtml(msg.text) + '</div>' +
                '</div>';
        }).join('');

        // Прокрутка вниз
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Обновляем список участников
        updateParticipants(messages);
    }

    // === Отправка сообщения ===
    async function sendChatMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const user = AuthService.getUser();
        if (!user) return;

        // Очищаем поле сразу
        messageInput.value = '';

        try {
            await ApiService.sendMessage(eventId, text);
        } catch (error) {
            console.warn('Сервер недоступен, показываем локально:', error.message);
        }

        // Добавляем сообщение локально (для быстрого отображения)
        const newMsg = {
            id: Date.now(),
            userId: user.id || user.email,
            userEmail: user.email,
            userName: user.name || 'Пользователь',
            avatar: user.avatar || 'https://i.pravatar.cc/50?u=' + user.email,
            text: text,
            time: formatTime(new Date().toISOString()),
            timestamp: new Date().toISOString()
        };

        // Добавляем в конец и перерисовываем
        appendMessage(newMsg);
    }

    // === Добавление одного сообщения без полной перерисовки ===
    function appendMessage(msg) {
        // Убираем "пустое" состояние
        const emptyEl = chatMessages.querySelector('.chat-empty');
        if (emptyEl) emptyEl.remove();

        const currentUser = AuthService.getUser();
        const currentUserId = currentUser ? (currentUser.id || currentUser.email) : null;
        const isOwn = currentUserId && (msg.userId === currentUserId || msg.userEmail === currentUserId);

        const msgHtml = '<div class="chat-message ' + (isOwn ? 'own' : '') + '">' +
            '  <div class="chat-message-header">' +
            '    <div class="chat-message-avatar">' +
            '      <img src="' + (msg.avatar || 'https://i.pravatar.cc/50') + '" alt="">' +
            '    </div>' +
            '    <span class="chat-message-name">' + escapeHtml(msg.userName || 'Гость') + '</span>' +
            '    <span class="chat-message-time">' + (msg.time || '') + '</span>' +
            '  </div>' +
            '  <div class="chat-message-text">' + escapeHtml(msg.text) + '</div>' +
            '</div>';

        chatMessages.insertAdjacentHTML('beforeend', msgHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // === Приглашение друга по email ===
    async function inviteFriendByEmail() {
        const email = friendEmail.value.trim();
        if (!email) {
            showNotification('Введите email друга', 'error');
            return;
        }

        if (!AuthService.isLoggedIn()) {
            showNotification('Войдите, чтобы приглашать друзей', 'info');
            return;
        }

        try {
            await ApiService.inviteFriend(eventId, email);
            showNotification('Приглашение отправлено на ' + email, 'success');
            friendEmail.value = '';
        } catch (error) {
            // Даже если сервер недоступен — показываем успех (для демо)
            showNotification('Приглашение отправлено на ' + email, 'success');
            friendEmail.value = '';
        }
    }

    // === Обновление списка участников ===
    function updateParticipants(messages) {
        if (!chatParticipants) return;

        // Собираем уникальных участников
        const seen = {};
        const participants = [];

        messages.forEach(function (msg) {
            const key = msg.userId || msg.userEmail || msg.userName;
            if (!seen[key]) {
                seen[key] = true;
                participants.push({
                    name: msg.userName,
                    avatar: msg.avatar || 'https://i.pravatar.cc/50?u=' + key
                });
            }
        });

        // Показываем максимум 5 аватарок
        const toShow = participants.slice(-5);
        chatParticipants.innerHTML = toShow.map(function (p) {
            return '<div class="participant-avatar" title="' + escapeHtml(p.name) + '">' +
                '  <img src="' + p.avatar + '" alt="" onerror="this.src=\'https://i.pravatar.cc/50\'">' +
                '</div>';
        }).join('');

        if (participants.length > 5) {
            chatParticipants.innerHTML += '<div class="participant-avatar" style="background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;">+' + (participants.length - 5) + '</div>';
        }
    }

    // === Обновление статуса пользователя ===
    function updateUserStatus() {
        if (!userStatus) return;

        if (AuthService.isLoggedIn()) {
            const user = AuthService.getUser();
            const name = (user && user.name) ? user.name : 'Профиль';
            userStatus.innerHTML =
                '<a href="profile.html" class="btn btn-outline" style="display:flex;align-items:center;gap:0.5rem;">' +
                '  <i class="fas fa-user-circle"></i> ' + escapeHtml(name) +
                '</a>';
        } else {
            userStatus.innerHTML = '<a href="profile.html" class="btn btn-outline">Войти</a>';
        }
    }

    // === Форматирование времени ===
    function formatTime(timestamp) {
        if (!timestamp) return '';
        try {
            const d = new Date(timestamp);
            return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch (e) {
            return '';
        }
    }

    // === Экранирование HTML ===
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === Уведомления ===
    function showNotification(text, type) {
        // Удаляем старое
        const old = document.querySelector('.notification');
        if (old) old.remove();

        const notif = document.createElement('div');
        notif.className = 'notification ' + (type || 'info');
        notif.textContent = text;
        document.body.appendChild(notif);

        setTimeout(function () {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(120%)';
            setTimeout(function () { notif.remove(); }, 300);
        }, 3000);
    }

    // === Демо-данные мероприятия ===
    function getDemoEvent(id) {
        const events = {
            1: {
                id: 1,
                title: 'Концерт «Классика под звёздами»',
                category: 'concert',
                date: '15 июня 2026',
                time: '20:00',
                location: 'Филармония, ул. Ленина 10',
                price: 1500,
                description: 'Вечер классической музыки в открытом зале. Симфонический оркестр исполнит лучшие произведения Чайковского и Рахманинова. Вас ждёт незабываемый вечер в атмосфере живой музыки под открытым небом. В антракте — фуршет с напитками.',
                image: 'https://picsum.photos/seed/concert1/1200/600',
                participantsCount: 42
            },
            2: {
                id: 2,
                title: 'Выставка «Современное искусство»',
                category: 'exhibition',
                date: '10 июня – 30 июля 2026',
                time: '10:00 – 20:00',
                location: 'Музей современного искусства',
                price: 500,
                description: 'Более 200 работ молодых художников из 15 стран мира. Инсталляции, живопись, скульптура и видео-арт. Экскурсии по записи каждые выходные.',
                image: 'https://picsum.photos/seed/exhibit1/1200/600',
                participantsCount: 18
            },
            3: {
                id: 3,
                title: 'Мастер-класс по керамике',
                category: 'workshop',
                date: '18 июня 2026',
                time: '14:00',
                location: 'Арт-пространство «Глина»',
                price: 2000,
                description: 'Научитесь создавать уникальную посуду своими руками. Все материалы включены. Группы до 8 человек — индивидуальный подход к каждому.',
                image: 'https://picsum.photos/seed/workshop1/1200/600',
                participantsCount: 8
            },
            4: {
                id: 4,
                title: 'Премьера фильма «Горизонт»',
                category: 'cinema',
                date: '20 июня 2026',
                time: '19:30',
                location: 'Кинотеатр «Октябрь»',
                price: 450,
                description: 'Научно-фантастическая драма о путешествии к границам Вселенной. Сеанс в формате IMAX. После фильма — обсуждение с режиссёром.',
                image: 'https://picsum.photos/seed/cinema1/1200/600',
                participantsCount: 65
            },
            5: {
                id: 5,
                title: 'Stand-up вечер «Смех до слёз»',
                category: 'comedy',
                date: '22 июня 2026',
                time: '21:00',
                location: 'Комеди-клуб «Юморина»',
                price: 1200,
                description: 'Лучшие комиксы города выступят с новыми программами. 18+ Напитки и закуски включены в стоимость билета.',
                image: 'https://picsum.photos/seed/comedy1/1200/600',
                participantsCount: 30
            },
            6: {
                id: 6,
                title: 'Джазовый вечер в парке',
                category: 'concert',
                date: '25 июня 2026',
                time: '18:00',
                location: 'Центральный парк, летняя сцена',
                price: 0,
                description: 'Бесплатный концерт джазовой музыки на открытом воздухе. Принесите плед и хорошее настроение!',
                image: 'https://picsum.photos/seed/jazz1/1200/600',
                participantsCount: 120
            },
            7: {
                id: 7,
                title: 'Мастер-класс по фотографии',
                category: 'workshop',
                date: '28 июня 2026',
                time: '12:00',
                location: 'Лофт «Камера»',
                price: 3000,
                description: 'Основы композиции, работа со светом и обработка в Lightroom. С собой иметь фотоаппарат или смартфон.',
                image: 'https://picsum.photos/seed/photo1/1200/600',
                participantsCount: 12
            },
            8: {
                id: 8,
                title: 'Выставка ретро-автомобилей',
                category: 'exhibition',
                date: '12 июня 2026',
                time: '10:00 – 18:00',
                location: 'Экспоцентр',
                price: 300,
                description: 'Редкие автомобили 60-х – 80-х годов. Фотозона и тест-драйв некоторых экспонатов.',
                image: 'https://picsum.photos/seed/cars1/1200/600',
                participantsCount: 55
            }
        };
        return events[id] || null;
    }

    // === Демо-сообщения чата ===
    function getDemoMessages() {
        return [
            {
                id: 1,
                userId: 'anna@mail.ru',
                userName: 'Анна',
                avatar: 'https://i.pravatar.cc/50?u=anna',
                text: 'Кто-нибудь уже был на этом мероприятии? Стоит идти?',
                time: '14:23',
                timestamp: '2026-06-09T14:23:00'
            },
            {
                id: 2,
                userId: 'max@mail.ru',
                userName: 'Максим',
                avatar: 'https://i.pravatar.cc/50?u=max',
                text: 'Прошлый год был огонь! Очень рекомендую 🔥',
                time: '14:25',
                timestamp: '2026-06-09T14:25:00'
            },
            {
                id: 3,
                userId: 'kate@mail.ru',
                userName: 'Екатерина',
                avatar: 'https://i.pravatar.cc/50?u=kate',
                text: 'Я тоже хочу! Давайте вместе пойдём?',
                time: '14:30',
                timestamp: '2026-06-09T14:30:00'
            }
        ];
    }

    // Очистка интервала при уходе со страницы
    window.addEventListener('beforeunload', function () {
        if (chatPollingInterval) {
            clearInterval(chatPollingInterval);
        }
    });
});