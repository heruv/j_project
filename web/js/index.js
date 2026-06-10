// js/index.js — логика главной страницы (афиша мероприятий)

document.addEventListener('DOMContentLoaded', function () {

    // === Элементы страницы ===
    const eventsGrid = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilters = document.getElementById('categoryFilters');
    const userStatus = document.getElementById('userStatus');

    // === Состояние ===
    let allEvents = [];
    let currentCategory = 'all';
    let currentSearch = '';

    // === Обновляем статус пользователя в шапке ===
    updateUserStatus();

    // === Загружаем мероприятия ===
    loadEvents();

    // === Фильтры по категориям ===
    categoryFilters.addEventListener('click', function (e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        // Убираем active у всех
        categoryFilters.querySelectorAll('.filter-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        currentCategory = btn.dataset.category;
        renderEvents();
    });

    // === Поиск ===
    searchBtn.addEventListener('click', function () {
        currentSearch = searchInput.value.trim().toLowerCase();
        renderEvents();
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim().toLowerCase();
            renderEvents();
        }
    });

    // Очистка поиска при пустом поле
    searchInput.addEventListener('input', function () {
        if (searchInput.value.trim() === '') {
            currentSearch = '';
            renderEvents();
        }
    });

    // === Загрузка мероприятий с сервера ===
    async function loadEvents() {
        try {
            // Пробуем загрузить с сервера
            const data = await ApiService.getEvents();

            // data может быть массивом или объектом с полем events
            allEvents = Array.isArray(data) ? data : (data.events || []);
        } catch (error) {
            console.warn('Не удалось загрузить с сервера, используем демо-данные:', error.message);
            // Если сервер недоступен — используем демо-данные
            allEvents = getDemoEvents();
        }

        renderEvents();
    }

    // === Отрисовка мероприятий с учётом фильтров ===
    function renderEvents() {
        let filtered = allEvents;

        // Фильтр по категории
        if (currentCategory !== 'all') {
            filtered = filtered.filter(function (ev) {
                return ev.category === currentCategory;
            });
        }

        // Фильтр по поиску
        if (currentSearch) {
            filtered = filtered.filter(function (ev) {
                return ev.title.toLowerCase().includes(currentSearch) ||
                       (ev.description && ev.description.toLowerCase().includes(currentSearch)) ||
                       (ev.location && ev.location.toLowerCase().includes(currentSearch));
            });
        }

        // Показываем / скрываем пустое состояние
        if (filtered.length === 0) {
            eventsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Генерируем карточки
        eventsGrid.innerHTML = filtered.map(function (ev) {
            return createEventCard(ev);
        }).join('');

        // Навешиваем обработчики клика на карточки
        eventsGrid.querySelectorAll('.event-card').forEach(function (card) {
            card.addEventListener('click', function () {
                const eventId = this.dataset.id;
                window.location.href = 'event.html?id=' + eventId;
            });
        });
    }

    // === Создание HTML карточки мероприятия ===
    function createEventCard(event) {
        const categoryLabels = {
            concert: 'Концерт',
            exhibition: 'Выставка',
            workshop: 'Мастер-класс',
            cinema: 'Кино',
            comedy: 'Stand-up'
        };

        const categoryLabel = categoryLabels[event.category] || event.category;

        const priceText = (event.price === 0 || event.price === 'free' || !event.price)
            ? '<span class="event-price free">Бесплатно</span>'
            : '<span class="event-price">' + event.price + ' ₽</span>';

        const participantsCount = event.participantsCount || event.participants || 0;

        const image = event.image || 'https://picsum.photos/seed/' + event.id + '/600/400';

        return '<div class="event-card" data-id="' + event.id + '">' +
            '  <div class="event-card-image">' +
            '    <img src="' + image + '" alt="' + escapeHtml(event.title) + '" ' +
            '         onerror="this.src=\'https://picsum.photos/seed/' + event.id + '/600/400\'">' +
            '    <span class="event-category-badge">' + categoryLabel + '</span>' +
            '  </div>' +
            '  <div class="event-card-body">' +
            '    <h3 class="event-card-title">' + escapeHtml(event.title) + '</h3>' +
            '    <div class="event-card-meta">' +
            '      <span><i class="fas fa-calendar"></i> ' + escapeHtml(event.date || '') + '</span>' +
            '      <span><i class="fas fa-clock"></i> ' + escapeHtml(event.time || '') + '</span>' +
            '    </div>' +
            '    <div class="event-card-meta">' +
            '      <span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(event.location || '') + '</span>' +
            '    </div>' +
            '    <div class="event-card-footer">' +
            priceText +
            '      <span class="event-participants-count">' +
            '        <i class="fas fa-users"></i> ' + participantsCount + ' участников' +
            '      </span>' +
            '    </div>' +
            '  </div>' +
            '</div>';
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

    // === Экранирование HTML ===
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === Демо-данные (если сервер недоступен) ===
    function getDemoEvents() {
        return [
            {
                id: 1,
                title: 'Концерт «Классика под звёздами»',
                category: 'concert',
                date: '15 июня 2026',
                time: '20:00',
                location: 'Филармония, ул. Ленина 10',
                price: 1500,
                description: 'Вечер классической музыки в открытом зале. Симфонический оркестр исполнит лучшие произведения Чайковского и Рахманинова.',
                image: 'https://picsum.photos/seed/concert1/600/400',
                participantsCount: 42
            },
            {
                id: 2,
                title: 'Выставка «Современное искусство»',
                category: 'exhibition',
                date: '10 июня – 30 июля 2026',
                time: '10:00 – 20:00',
                location: 'Музей современного искусства',
                price: 500,
                description: 'Более 200 работ молодых художников из 15 стран мира.',
                image: 'https://picsum.photos/seed/exhibit1/600/400',
                participantsCount: 18
            },
            {
                id: 3,
                title: 'Мастер-класс по керамике',
                category: 'workshop',
                date: '18 июня 2026',
                time: '14:00',
                location: 'Арт-пространство «Глина»',
                price: 2000,
                description: 'Научитесь создавать уникальную посуду своими руками. Все материалы включены.',
                image: 'https://picsum.photos/seed/workshop1/600/400',
                participantsCount: 8
            },
            {
                id: 4,
                title: 'Премьера фильма «Горизонт»',
                category: 'cinema',
                date: '20 июня 2026',
                time: '19:30',
                location: 'Кинотеатр «Октябрь»',
                price: 450,
                description: 'Научно-фантастическая драма о путешествии к границам Вселенной.',
                image: 'https://picsum.photos/seed/cinema1/600/400',
                participantsCount: 65
            },
            {
                id: 5,
                title: 'Stand-up вечер «Смех до слёз»',
                category: 'comedy',
                date: '22 июня 2026',
                time: '21:00',
                location: 'Комеди-клуб «Юморина»',
                price: 1200,
                description: 'Лучшие комиксы города выступят с новыми программами.',
                image: 'https://picsum.photos/seed/comedy1/600/400',
                participantsCount: 30
            },
            {
                id: 6,
                title: 'Джазовый вечер в парке',
                category: 'concert',
                date: '25 июня 2026',
                time: '18:00',
                location: 'Центральный парк, летняя сцена',
                price: 0,
                description: 'Бесплатный концерт джазовой музыки на открытом воздухе.',
                image: 'https://picsum.photos/seed/jazz1/600/400',
                participantsCount: 120
            },
            {
                id: 7,
                title: 'Мастер-класс по фотографии',
                category: 'workshop',
                date: '28 июня 2026',
                time: '12:00',
                location: 'Лофт «Камера»',
                price: 3000,
                description: 'Основы композиции, работа со светом и обработка в Lightroom.',
                image: 'https://picsum.photos/seed/photo1/600/400',
                participantsCount: 12
            },
            {
                id: 8,
                title: 'Выставка ретро-автомобилей',
                category: 'exhibition',
                date: '12 июня 2026',
                time: '10:00 – 18:00',
                location: 'Экспоцентр',
                price: 300,
                description: 'Редкие автомобили 60-х – 80-х годов. Фотозона и тест-драйв.',
                image: 'https://picsum.photos/seed/cars1/600/400',
                participantsCount: 55
            }
        ];
    }
});