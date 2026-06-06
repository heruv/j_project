// js/profile.js - логика страницы профиля

// Ждём загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // === Находим элементы на странице ===
    const authSection = document.getElementById('authSection');
    const profileSection = document.getElementById('profileSection');
    
    // Кнопки
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Поля ввода
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    
    // Блоки ошибок
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    
    // === 1. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ВХОД/РЕГИСТРАЦИЯ ===
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Убираем класс active у всех вкладок
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });
            
            // Добавляем active на текущую
            this.classList.add('active');
            
            // Показываем нужную форму
            if (this.dataset.tab === 'login') {
                document.getElementById('loginForm').classList.add('active');
                document.getElementById('registerForm').classList.remove('active');
            } else {
                document.getElementById('registerForm').classList.add('active');
                document.getElementById('loginForm').classList.remove('active');
            }
        });
    });
    
    // === 2. ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ ===
    checkAuth();
    
    function checkAuth() {
        if (AuthService.isLoggedIn()) {
            // Пользователь авторизован
            authSection.style.display = 'none';
            profileSection.style.display = 'block';
            showProfile();
        } else {
            // Пользователь не авторизован
            authSection.style.display = 'block';
            profileSection.style.display = 'none';
        }
    }
    
    // === 3. ПОКАЗ ПРОФИЛЯ ===
    function showProfile() {
        const user = AuthService.getUser();
        
        if (user) {
            document.getElementById('profileName').textContent = user.name || 'Пользователь';
            document.getElementById('profileEmail').textContent = user.email || '';
            
            // Аватар
            const avatarImg = document.querySelector('#profileAvatar img');
            if (avatarImg) {
                avatarImg.src = user.avatar || 'https://i.pravatar.cc/120';
            }
        }
    }
    
    // === 4. ОБРАБОТКА ВХОДА ===
    loginBtn.addEventListener('click', async function() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        // Скрываем старую ошибку
        loginError.style.display = 'none';
        
        // Проверяем заполнение
        if (!email || !password) {
            loginError.textContent = 'Заполните email и пароль';
            loginError.style.display = 'block';
            return;
        }
        
        // Меняем кнопку на "Загрузка..."
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        
        try {
            // Отправляем запрос
            await AuthService.login(email, password);
            
            // Успешно - показываем профиль
            checkAuth();
            alert('Вход выполнен успешно!');
            
        } catch (error) {
            // Ошибка
            loginError.textContent = error.message || 'Ошибка входа';
            loginError.style.display = 'block';
            
        } finally {
            // Возвращаем кнопку
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        }
    });
    
    // === 5. ОБРАБОТКА РЕГИСТРАЦИИ ===
    registerBtn.addEventListener('click', async function() {
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        
        // Скрываем старую ошибку
        registerError.style.display = 'none';
        
        // Проверяем заполнение
        if (!name || !email || !password) {
            registerError.textContent = 'Заполните все поля';
            registerError.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            registerError.textContent = 'Пароль должен быть минимум 6 символов';
            registerError.style.display = 'block';
            return;
        }
        
        // Меняем кнопку на "Загрузка..."
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        
        try {
            // Отправляем запрос
            const userData = {
                name: name,
                email: email,
                password: password
            };
            
            console.log('Отправляю данные:', userData);
            
            await AuthService.register(userData);
            
            // Успешно
            checkAuth();
            alert('Регистрация успешна!');
            
        } catch (error) {
            // Ошибка
            console.error('Ошибка:', error);
            registerError.textContent = error.message || 'Ошибка регистрации';
            registerError.style.display = 'block';
            
        } finally {
            // Возвращаем кнопку
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Зарегистрироваться';
        }
    });
    
    // === 6. ВЫХОД ===
    logoutBtn.addEventListener('click', function() {
        AuthService.logout();
        checkAuth();
    });
    
    // === 7. ОТПРАВКА ПО ENTER ===
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // Если видна форма входа - отправляем вход
            if (document.getElementById('loginForm').classList.contains('active')) {
                loginBtn.click();
            }
            // Если видна форма регистрации - отправляем регистрацию
            if (document.getElementById('registerForm').classList.contains('active')) {
                registerBtn.click();
            }
        }
    });
    
});