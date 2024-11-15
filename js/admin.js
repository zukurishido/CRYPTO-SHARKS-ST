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

    if (adminButton && closeAdmin) {
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
}

// Переключение видимости админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (adminPanel) {
        adminPanel.classList.toggle('visible');
        
        if (isAdminPanelVisible && window.isAuthenticated) {
            showBulkInput();
        }
    }
}

// Показ формы входа
function showLoginForm() {
    const form = document.querySelector('.admin-form');
    if (form) {
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
}

// Вход в админ-панель
async function login() {
    const passwordInput = document.getElementById('passwordInput');
    if (!passwordInput) return;

    const password = passwordInput.value;
    const validHash = window.githubConfig.adminHash;
    
    if (btoa(password) === validHash) {
        window.isAuthenticated = true;
        window.githubConfig.token = atob(window.githubConfig.encryptedToken);
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

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn active">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn">Управление сделками</button>
            </div>

            <div class="input-group">
                <label>Массовое добавление сделок</label>
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
}

// Показ формы одиночного добавления
function showRegularForm() {
    if (!checkAuth()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
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
        `;
    }
}

// Показ списка сделок
function showTradesList() {
    if (!checkAuth()) return;

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    
    const form = document.querySelector('.admin-form');
    if (form) {
        let html = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn active">Управление сделками</button>
            </div>
        `;
        
        html += '<div class="trades-list">';
        
        if (trades.length === 0) {
            html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
        } else {
            trades.forEach((trade, index) => {
                const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
                const resultText = `${trade.result > 0 ? '+' : ''}${trade.result}%${trade.leverage ? ` (${trade.leverage})` : ''}`;
                
                html += `
                    <div class="trade-item fade-in">
                        <div class="trade-content">
                            <span style="color: ${resultColor}">#${trade.pair} ${resultText}</span>
                        </div>
                        <button onclick="confirmDelete('${year}', '${month}', '${category}', ${index})" class="delete-btn">
                            Удалить
                        </button>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        form.innerHTML = html;
    }
}

// Обработка массового добавления
async function processBulkTrades() {
    if (!checkAuth()) return;

    const bulkInput = document.getElementById('bulkInput');
    if (!bulkInput) return;

    const text = bulkInput.value;
    const trades = parseTrades(text);
    
    if (trades.length === 0) {
        showNotification('Не удалось распознать сделки', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const success = await addTradeData(year, month, category, trades);
    if (success) {
        bulkInput.value = '';
        showNotification(`Добавлено ${trades.length} сделок`, 'success');
        updateContent();
    }
}

// Обработка одиночного добавления
async function processSingleTrade() {
    if (!checkAuth()) return;

    const pair = document.getElementById('pairInput').value;
    const result = parseFloat(document.getElementById('resultInput').value);
    const leverage = document.getElementById('leverageInput').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const trade = {
        id: Date.now() + Math.random(),
        pair: pair.toUpperCase(),
        result: result,
        leverage: leverage ? leverage : '',
        status: result > 0 ? 'profit' : 'loss',
        timestamp: new Date().toISOString()
    };

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const success = await addTradeData(year, month, category, trade);
    if (success) {
        document.getElementById('pairInput').value = '';
        document.getElementById('resultInput').value = '';
        document.getElementById('leverageInput').value = '';
        
        showNotification('Сделка добавлена', 'success');
        updateContent();
    }
}

// Подтверждение удаления
async function confirmDelete(year, month, category, index) {
    if (!checkAuth()) return;

    if (confirm('Удалить эту сделку?')) {
        const success = await deleteTradeData(year, month, category, index);
        if (success) {
            showNotification('Сделка удалена', 'success');
            showTradesList();
            updateContent();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
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
