// Состояние админ-панели
window.isAuthenticated = false;
let isAdminPanelVisible = false;

// Проверка авторизации
function checkAuth() {
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        showLoginForm();
        return false;
    }
    return true;
}

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

// Вход в админ-панель
function login() {
    const password = document.getElementById('passwordInput').value;
    // Захешированный пароль "Cr5pt0Sh@rks2024#AdminP@nel"
    const validHash = "Q3I1cHQwU2hAcmtzMjAyNCNBZG1pblBAb" + "mVs";
    
    if (btoa(password) === validHash) {
        window.isAuthenticated = true;
        document.body.classList.add('is-admin');
        showBulkInput();
        showNotification('Успешный вход', 'success');
    } else {
        showNotification('Неверный пароль', 'error');
    }
}

// Показ формы массового добавления
function showBulkInput() {
    if (!checkAuth()) return;

    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <h3 class="text-[#00ff9d] text-xl mb-4">Массовое добавление сделок</h3>
            
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn active">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn">Управление сделками</button>
            </div>

            <textarea id="bulkInput" placeholder="Поддерживаемые форматы:

SPOT:
BTC +55%
ETH -12%
1. SOL +33%
#APE -20%

FUTURES:
BNB +35% (5x)
DOGE -15% (10x)
1. ETH +76% (20x)

DeFi:
UNI +25%
AAVE -18%"></textarea>
            <button onclick="processBulkTrades()" class="add-btn">Добавить сделки</button>
        </div>
    `;
}

// Показ формы одиночного добавления
function showRegularForm() {
    if (!checkAuth()) return;

    document.querySelector('.admin-form').innerHTML = `
        <div class="form-content">
            <h3 class="text-[#00ff9d] text-xl mb-4">Одиночное добавление</h3>
            
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn active">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn">Управление сделками</button>
            </div>

            <div class="input-group">
                <label>Пара</label>
                <input type="text" id="pairInput" placeholder="Например: BTC">
            </div>
            <div class="input-group">
                <label>Результат (%)</label>
                <input type="number" id="resultInput" step="0.01" placeholder="Например: 55 или -12">
            </div>
            <div class="input-group">
                <label>Кратность (для FUTURES)</label>
                <input type="text" id="leverageInput" placeholder="Например: 20x">
            </div>
            <button onclick="processSingleTrade()" class="add-btn">Добавить сделку</button>
        </div>
    `;
}

// Показ списка сделок для управления
function showTradesList() {
    if (!checkAuth()) return;

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    
    let html = `
        <div class="trades-manager">
            <h3 class="text-[#00ff9d] text-xl mb-4">Управление сделками</h3>
            
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn active">Управление сделками</button>
            </div>

            <div class="trades-list">
    `;
    
    if (trades.length === 0) {
        html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
    } else {
        trades.forEach((trade) => {
            const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
            html += `
                <div class="trade-item fade-in">
                    <div class="trade-content">
                        <span style="color: ${resultColor}">
                            #${trade.pair} ${trade.result > 0 ? '+' : ''}${trade.result}%
                            ${trade.leverage ? ` (${trade.leverage})` : ''}
                        </span>
                    </div>
                    <button onclick="confirmDelete('${trade.id}')" class="delete-btn">Удалить</button>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
    `;
    
    document.querySelector('.admin-form').innerHTML = html;
}

// Подтверждение удаления
function confirmDelete(tradeId) {
    if (!checkAuth()) return;

    if (confirm('Удалить эту сделку?')) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.getElementById('categorySelect').value;

        if (deleteTradeData(year, month, category, tradeId)) {
            showNotification('Сделка удалена', 'success');
            showTradesList();
            updateContent();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}

// Обработка массового добавления
function processBulkTrades() {
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

    const pair = document.getElementById('pairInput').value;
    const result = parseFloat(document.getElementById('resultInput').value);
    const leverage = document.getElementById('leverageInput').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const trade = {
        id: Date.now(),
        pair: pair.toUpperCase(),
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
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(activeMode)) {
            btn.classList.add('active');
        }
    });
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeAdminPanel);
