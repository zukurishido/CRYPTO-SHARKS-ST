// Глобальное состояние
window.isAuthenticated = false;
let isAdminPanelVisible = false;

// Инициализация админ-панели
function initializeAdminPanel() {
    const adminButton = document.getElementById('adminButton');
    const closeAdmin = document.getElementById('closeAdmin');

    adminButton.addEventListener('click', () => {
        if (!window.isAuthenticated) {
            showLoginForm();
        } else {
            toggleAdminPanel();
        }
    });

    closeAdmin.addEventListener('click', () => {
        toggleAdminPanel();
    });

    // Проверяем элементы управления при загрузке
    updateControlsVisibility();
}

// Переключение видимости админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    adminPanel.classList.toggle('visible');
    
    if (isAdminPanelVisible && window.isAuthenticated) {
        showBulkInput();
    }
}

// Показ формы входа
function showLoginForm() {
    const form = document.querySelector('.admin-form');
    form.innerHTML = `
        <div class="input-group">
            <input type="password" 
                   id="passwordInput" 
                   placeholder="Введите пароль" 
                   class="admin-input"
                   onkeypress="if(event.key === 'Enter') login()">
            <button onclick="login()" class="add-btn">Войти</button>
        </div>
    `;
    
    toggleAdminPanel();
}

// Проверка пароля и вход
function login() {
    const password = document.getElementById('passwordInput').value;
    // Захешированный пароль "Cr5pt0Sh@rks2024#AdminP@nel"
    const validHash = "Q3I1cHQwU2hAcmtzMjAyNCNBZG1pblBAb" + "mVs";
    
    if (btoa(password) === validHash) {
        window.isAuthenticated = true;
        showBulkInput();
        showNotification('Успешный вход', 'success');
        updateControlsVisibility();
    } else {
        showNotification('Неверный пароль', 'error');
    }
}

// Обновление видимости элементов управления
function updateControlsVisibility() {
    const adminControls = document.querySelectorAll('.admin-control');
    adminControls.forEach(control => {
        control.style.display = window.isAuthenticated ? 'flex' : 'none';
    });
}

// Показ формы массового добавления
function showBulkInput() {
    if (!window.isAuthenticated) return;

    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Массовое добавление сделок</label>
            <textarea id="bulkInput" placeholder="DEFI:🚀
1.#FIT +20%
2.#AMT +22%

FUTURES:🚀
1.#BNB +35% (5х)
2.#CELO +76% (20х)

SPOT:🚀
1.#TWT +35%
2.#NEAR -15%"></textarea>
            <button onclick="processBulkTrades()" class="add-btn">Добавить сделки</button>
        </div>
    `;
    updateModeBtns('bulk');
}

// Показ формы одиночного добавления
function showRegularForm() {
    if (!window.isAuthenticated) return;

    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Пара</label>
            <input type="text" id="pairInput" placeholder="Например: BTC">
        </div>
        <div class="input-group">
            <label>Результат (%)</label>
            <input type="number" id="resultInput" step="0.01">
        </div>
        <div class="input-group">
            <label>Кратность (для FUTURES)</label>
            <input type="text" id="leverageInput" placeholder="Например: 20x">
        </div>
        <button onclick="processSingleTrade()" class="add-btn">Добавить сделку</button>
    `;
    updateModeBtns('single');
}

// Обработка массового добавления
function processBulkTrades() {
    if (!window.isAuthenticated) {
        showNotification('Доступ запрещен', 'error');
        return;
    }

    const text = document.getElementById('bulkInput').value;
    const trades = parseTrades(text);
    
    if (trades.length === 0) {
        showNotification('Не удалось распознать сделки', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    if (addTradeData(year, month, category, trades)) {
        document.getElementById('bulkInput').value = '';
        showNotification(`Добавлено ${trades.length} сделок`, 'success');
        updateContent();
    }
}

// Обработка одиночного добавления
function processSingleTrade() {
    if (!window.isAuthenticated) {
        showNotification('Доступ запрещен', 'error');
        return;
    }

    const pair = document.getElementById('pairInput').value;
    const result = parseFloat(document.getElementById('resultInput').value);
    const leverage = document.getElementById('leverageInput').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const trade = {
        id: Date.now(),
        pair: pair,
        result: result,
        leverage: leverage ? leverage : '',
        status: result > 0 ? 'profit' : 'loss'
    };

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    if (addTradeData(year, month, category, trade)) {
        // Очистка формы
        document.getElementById('pairInput').value = '';
        document.getElementById('resultInput').value = '';
        document.getElementById('leverageInput').value = '';
        
        showNotification('Сделка добавлена', 'success');
        updateContent();
    }
}

// Обновление активных кнопок режима
function updateModeBtns(activeMode) {
    const btns = document.querySelectorAll('.mode-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('onclick').includes(activeMode)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeAdminPanel);
