class AuthService {
    
    static saveToken(token) {
        localStorage.setItem('auth_token', token);
    }
    
    static getToken() {
        return localStorage.getItem('auth_token');
    }
    
    // Удалить токен (выход)
    static removeToken() {
        localStorage.removeItem('auth_token');
    }
    
    static saveUser(user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
    }
    
    static getUser() {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    }
    
    static isLoggedIn() {
        return this.getToken() !== null;
    }
    
    static async login(email, password) {
        const response = await ApiService.login(email, password);
        this.saveToken(response.token);
        this.saveUser(response.user);
        return response.user;
    }
    
    static async register(userData) {
        const response = await ApiService.register(userData);
        this.saveToken(response.token);
        this.saveUser(response.user);
        return response.user;
    }
    
    static logout() {
        this.removeToken();
        localStorage.removeItem('auth_user');
    }
}