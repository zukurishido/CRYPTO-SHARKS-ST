// Состояние админ-панели
let isAdminPanelVisible = false;
let isAuthenticated = false;

// Инициализация админ-панели
function initializeAdminPanel() {
    const adminButton = document.getElementById('adminButton');
    const closeAdmin = document.getElementById('closeAdmin');
    const adminPanel = document.getElementById('adminPanel');

    adminButton.addEventListener('click', () => {
        if (!isAuthenticated) {
            showLoginForm();
        } else {
            toggleAdminPanel();
        }
    });

    closeAdmin.addEventListener('click', () => {
        toggleAdminPanel();
    });
}

// Показ/скрытие админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    adminPanel.classList.toggle('visible');
}

// Форма входа
function showLoginForm() {
    const adminPanel = document.getElementById('adminPanel');
    const form = document.querySelector('.admin-form');
    
    form.innerHTML = `
        <div class="input-group">
            <input type="password" id="passwordInput" placeholder="Введите пароль" class="admin-input">
            <button onclick="login()" class="add-btn">Войти</button>
        </div>
    `;
    
    toggleAdminPanel();
}

// Вход в админ-панель
function login() {
    const password = document.getElementById('passwordInput').value;
    if (password === 'admin123') { // Замените на реальный пароль
        isAuthenticated = true;
        showBulkInput();
        showNotification('Успешный вход', 'success');
    } else {
        showNotification('Неверный пароль', 'error');
    }
}

// Показ формы массового добавления
function showBulkInput() {
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
    const text = document.getElementById('bulkInput').value;
    const trades = parseTrades(text);
    
    if (trades.length === 0) {
        showNotification('Не удалось распознать сделки', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    addTradeData(year, month, category, trades);
    updateContent();
    
    document.getElementById('bulkInput').value = '';
    showNotification(`Добавлено ${trades.length} сделок`, 'success');
}

// Обработка одиночного добавления
function processSingleTrade() {
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
        leverage: leverage ? `${leverage}` : '',
        status: result > 0 ? 'profit' : 'loss'
    };

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    addTradeData(year, month, category, trade);
    updateContent();

    // Очистка формы
    document.getElementById('pairInput').value = '';
    document.getElementById('resultInput').value = '';
    document.getElementById('leverageInput').value = '';
    
    showNotification('Сделка добавлена', 'success');
}

// Показ списка сделок
function showTradesList() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    let html = '<div class="trades-list">';
    
    if (trades.length === 0) {
        html += '<p>Нет сделок за выбранный период</p>';
    } else {
        trades.forEach((trade) => {
            html += `
                <div class="trade-item ${trade.status}">
                    <div class="trade-content">
                        <div class="trade-pair">#${trade.pair}</div>
                        <div class="trade-result">
                            ${trade.result > 0 ? '+' : ''}${trade.result}% 
                            ${trade.leverage ? `(${trade.leverage})` : ''}
                        </div>
                    </div>
                    <div class="trade-actions">
                        <button onclick="editTrade('${trade.id}')" class="edit-btn">✎</button>
                        <button onclick="deleteTrade('${trade.id}')" class="delete-btn">✕</button>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    document.querySelector('.admin-form').innerHTML = html;
    updateModeBtns('manage');
}

// Редактирование сделки
function editTrade(tradeId) {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    const trade = trades.find(t => t.id === tradeId);
    
    if (trade) {
        const newResult = prompt('Введите новый результат:', trade.result);
        if (newResult !== null) {
            const updatedTrade = {
                ...trade,
                result: parseFloat(newResult),
                status: parseFloat(newResult) > 0 ? 'profit' : 'loss'
            };
            
            if (updateTradeData(year, month, category, tradeId, updatedTrade)) {
                updateContent();
                showTradesList();
                showNotification('Сделка обновлена', 'success');
            }
        }
    }
}

// Удаление сделки
function deleteTrade(tradeId) {
    if (confirm('Удалить эту сделку?')) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.getElementById('categorySelect').value;
        
        if (deleteTradeData(year, month, category, tradeId)) {
            updateContent();
            showTradesList();
            showNotification('Сделка удалена', 'success');
        }
    }
}

// Обновление активной кнопки режима
function updateModeBtns(activeMode) {
    const btns = document.querySelectorAll('.mode-btn');
    btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === activeMode);
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
