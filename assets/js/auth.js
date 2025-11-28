// ==================== АУТЕНТИФИКАЦИЯ ====================
function updateUserInfo() {
    document.getElementById('headerUserName').textContent = currentUser.name;
    document.getElementById('headerUserRole').textContent = currentUser.role === 'admin' ? 'Администратор' : 'Покупатель';
    document.getElementById('headerAvatar').textContent = currentUser.avatar;
    
    // Показываем/скрываем конструктор для админа
    const constructorToolbar = document.getElementById('constructorToolbar');
    if (currentUser.role === 'admin') {
        constructorToolbar.style.display = 'block';
    } else {
        constructorToolbar.style.display = 'none';
    }
}

function updateProfileView() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRole').textContent = currentUser.role === 'admin' ? 'Администратор' : 'Покупатель';
    document.getElementById('profileAvatar').textContent = currentUser.avatar;
    document.getElementById('profileUserName').value = currentUser.name;
    document.getElementById('profileUserPhone').value = currentUser.phone;
}

function saveUserProfile() {
    const name = document.getElementById('profileUserName').value;
    const phone = document.getElementById('profileUserPhone').value;
    
    if (!name.trim()) {
        showNotification('❌ Введите ваше имя');
        return;
    }
    
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.avatar = name.charAt(0).toUpperCase();
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInfo();
    updateProfileView();
    showNotification('✅ Профиль сохранен!');
    closeProfile();
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = {
            name: 'Гость',
            phone: '',
            role: 'customer',
            avatar: 'Г'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInfo();
        showNotification('👋 До свидания!');
    }
}

// Автоматический вход для тестирования (в реальном приложении убрать)
function autoLoginAsAdmin() {
    currentUser = {
        name: 'Администратор',
        phone: '+7 (923) 753-36-06',
        role: 'admin',
        avatar: 'А'
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInfo();
}

// Вызываем авто-логин при загрузке (для демонстрации)
document.addEventListener('DOMContentLoaded', function() {
    autoLoginAsAdmin();
});
