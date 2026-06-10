class ApiService {
    static async request(url, method, data) {
        const token = localStorage.getItem('auth_token');
        
        console.log(token);
        
        const options = {
            method: method,
            headers: { // ИСПРАВЛЕНО: было headees
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token; // ИСПРАВЛЕНО: добавлен пробел после Bearer
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const fullUrl = CONFIG.API_URL + url;
        const response = await fetch(fullUrl, options);
        
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Server error');
        }
        
        return await response.json();
    }
    
    static get(url) {
        return this.request(url, 'GET');
    }
    
    static post(url, data) {
        return this.request(url, 'POST', data);
    }
    
    // === Методы для авторизации ===
    static login(email, password) {
        return this.post(CONFIG.ENDPOINTS.LOGIN, {
            email: email,
            password: password
        });
    }
    
    static register(userData) {
        return this.post(CONFIG.ENDPOINTS.REGISTER, userData);
    }
    
    static getProfile() {
        return this.get(CONFIG.ENDPOINTS.PROFILE);
    }

    // ==========================================
    // === РЕАЛИЗАЦИЯ ОТСУТСТВУЮЩИХ МЕТОДОВ ===
    // ==========================================

    // Получение информации о конкретном мероприятии
    static getEventById(id) {
        return this.get(CONFIG.ENDPOINTS.EVENT_BY_ID(id));
    }

    // Получение сообщений чата для мероприятия
    static getChatMessages(eventId) {
        return this.get(CONFIG.ENDPOINTS.CHAT(eventId));
    }

    // Отправка нового сообщения в чат
    static sendMessage(eventId, text) {
        return this.post(CONFIG.ENDPOINTS.CHAT(eventId), { text: text });
    }

    // Приглашение друга по email
    static inviteFriend(eventId, email) {
        return this.post(CONFIG.ENDPOINTS.INVITE(eventId), { email: email });
    }

    // Запись на мероприятие
    static joinEvent(eventId) {
        return this.post(CONFIG.ENDPOINTS.JOIN(eventId));
    }
}