class ApiService {
    static async request(url, method, data) {
        const token = localStorage.getItem('auth_token');
        
        console.log(token);
        
        const options = {
            method: method,
            headees: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = 'Bearer' + token;
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
}