// Состояние админ-панели
let isAdminPanelVisible = false;

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Проверка авторизации
async function checkAuth() {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
        showNotification('Требуется авторизация', 'error');
        showLoginForm();
        return false;
    }
    return true;
}

// Переключение видимости админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (adminPanel) {
        adminPanel.classList.toggle('visible');
    }
}

// Показ формы входа
function showLoginForm() {
    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="input-group">
                <input type="email" 
                       id="emailInput" 
                       value="admin@cryptosharks.com"
                       class="admin-input"
                       readonly>
                <input type="password" 
                       id="passwordInput" 
                       placeholder="Пароль" 
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
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    
    if (!emailInput || !passwordInput) return;

    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (error) throw error;

        document.body.classList.add('is-admin');
        showNotification('Успешный вход', 'success');
        showBulkInput();
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Неверные учетные данные', 'error');
    }
}

// Выход
async function logout() {
    try {
        await window.supabase.auth.signOut();
        document.body.classList.remove('is-admin');
        showNotification('Выход выполнен', 'success');
        toggleAdminPanel();
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showNotification('Ошибка при выходе', 'error');
    }
}

// Показ формы массового добавления
async function showBulkInput() {
    if (!await checkAuth()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn active">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn">Управление сделками</button>
                <button onclick="logout()" class="mode-btn">Выйти</button>
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
async function showRegularForm() {
    if (!await checkAuth()) return;

    const form = document.querySelector('.admin-form');
    if (form) {
        form.innerHTML = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn active">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn">Управление сделками</button>
                <button onclick="logout()" class="mode-btn">Выйти</button>
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
async function showTradesList() {
    if (!await checkAuth()) return;

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = await loadData(year, month, category);
    
    const form = document.querySelector('.admin-form');
    if (form) {
        let html = `
            <div class="mode-switcher mb-4">
                <button onclick="showBulkInput()" class="mode-btn">Массовое добавление</button>
                <button onclick="showRegularForm()" class="mode-btn">Одиночное добавление</button>
                <button onclick="showTradesList()" class="mode-btn active">Управление сделками</button>
                <button onclick="logout()" class="mode-btn">Выйти</button>
            </div>
        `;
        
        html += '<div class="trades-list">';
        
        if (trades.length === 0) {
            html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
        } else {
            trades.forEach(trade => {
                const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
                const resultText = `${trade.result > 0 ? '+' : ''}${trade.result}%${trade.leverage ? ` (${trade.leverage})` : ''}`;
                
                html += `
                    <div class="trade-item fade-in">
                        <div class="trade-content">
                            <span style="color: ${resultColor}">#${trade.pair} ${resultText}</span>
                        </div>
                        <button onclick="confirmDelete('${trade.id}')" class="delete-btn">
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

// Добавляем все функции в глобальную область видимости
window.showLoginForm = showLoginForm;
window.toggleAdminPanel = toggleAdminPanel;
window.login = login;
window.logout = logout;
window.showBulkInput = showBulkInput;
window.showRegularForm = showRegularForm;
window.showTradesList = showTradesList;
window.processBulkTrades = processBulkTrades;
window.processSingleTrade = processSingleTrade;
window.confirmDelete = confirmDelete;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем статус авторизации
    window.supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            document.body.classList.add('is-admin');
        } else {
            document.body.classList.remove('is-admin');
        }
    });
});
