// Состояние админ-панели
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Управление паролем
function setAdminPassword(password) {
    const hashedPassword = btoa(password);
    localStorage.setItem('adminPass', hashedPassword);
}

function checkAdminPassword(password) {
    const hashedPassword = localStorage.getItem('adminPass');
    return hashedPassword === btoa(password);
}

function initializeAdminPassword() {
    if (!localStorage.getItem('adminPass')) {
        setAdminPassword('Cr5pt0Sh@rks2024#AdminP@nel');
    }
}

// Уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Переключение админ-панели
function toggleAdmin() {
    if (!isAuthenticated) {
        const password = prompt('Введите пароль администратора:');
        if (!checkAdminPassword(password)) {
            showNotification('Неверный пароль!', 'error');
            return;
        }
        isAuthenticated = true;
    }

    const panel = document.getElementById('adminPanel');
    isAdminPanelVisible = !isAdminPanelVisible;
    
    if (isAdminPanelVisible) {
        panel.classList.add('visible');
        updateAdminPanelInfo();
        showBulkInput();
    } else {
        panel.classList.remove('visible');
    }
}

// Выход
function logoutAdmin() {
    isAuthenticated = false;
    isAdminPanelVisible = false;
    const panel = document.getElementById('adminPanel');
    panel.classList.remove('visible');
    showNotification('Вы вышли из админ-панели');
}

// Изменение пароля
function changeAdminPassword() {
    const currentPassword = prompt('Введите текущий пароль:');
    if (!checkAdminPassword(currentPassword)) {
        showNotification('Неверный текущий пароль!', 'error');
        return;
    }

    const newPassword = prompt('Введите новый пароль (минимум 8 символов):');
    if (!newPassword || newPassword.length < 8) {
        showNotification('Пароль должен содержать минимум 8 символов!', 'error');
        return;
    }

    setAdminPassword(newPassword);
    showNotification('Пароль успешно изменен!');
}

// Функция для обновления активных кнопок
function updateActiveButton(mode) {
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    switch(mode) {
        case 'bulk':
            document.querySelector('.mode-btn:nth-child(1)').classList.add('active');
            break;
        case 'single':
            document.querySelector('.mode-btn:nth-child(2)').classList.add('active');
            break;
        case 'manage':
            document.querySelector('.mode-btn:nth-child(3)').classList.add('active');
            break;
    }
}

// Показ формы массового добавления
function showBulkInput() {
    updateActiveButton('bulk');
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group fade-in">
            <label>Массовое добавление сделок</label>
            <textarea id="bulkInput" rows="15" placeholder="Вставьте список сделок в любом формате:
BTC +50%
ETH -20%
SOL +30
AVAX +15.5%"></textarea>
            <button onclick="parseBulkTrades()" class="add-btn">
                Добавить все сделки
            </button>
        </div>
    `;
}

// Показ формы одиночного добавления
function showRegularForm() {
    updateActiveButton('single');
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Пара</label>
            <input type="text" id="singlePair" placeholder="Например: BTC">
        </div>
        <div class="input-group">
            <label>Результат</label>
            <div class="result-input-group">
                <input type="number" id="singleResult" step="0.1" placeholder="50">
                <span class="result-symbol">%</span>
            </div>
        </div>
        <div class="input-group">
            <label>Статус</label>
            <select id="singleStatus">
                <option value="profit">Прибыль</option>
                <option value="loss">Убыток</option>
                <option value="neutral">В работе</option>
            </select>
        </div>
        <div class="input-group">
            <label>Комментарий (необязательно)</label>
            <input type="text" id="singleComment">
        </div>
        <button onclick="addSingleTrade()" class="add-btn">Добавить сделку</button>
    `;
}

// Управление сделками
function showTradesList() {
    updateActiveButton('manage');
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category) || [];
    
    let html = `
        <div class="trade-management fade-in">
            <h3>Управление сделками</h3>
            <div class="trades-list">
    `;
    
    if (trades.length === 0) {
        html += `
            <div class="trade-item neutral">
                <span>Нет сделок для отображения</span>
            </div>
        `;
    } else {
        trades.forEach((trade, index) => {
            html += `
                <div class="trade-item ${trade.status}">
                    <span class="trade-pair">${trade.pair}</span>
                    <span class="trade-result">${trade.result > 0 ? '+' : ''}${trade.result}%</span>
                    <div class="trade-actions">
                        <button onclick="editTrade(${index})" class="edit-btn">✏️</button>
                        <button onclick="deleteTrade(${index})" class="delete-btn">❌</button>
                    </div>
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

// Редактирование сделки
function editTrade(index) {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category) || [];
    const trade = trades[index];
    
    if (!trade) {
        showNotification('Сделка не найдена', 'error');
        return;
    }
    
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group fade-in">
            <h3>Редактирование сделки</h3>
            <div class="input-group">
                <label>Пара</label>
                <input type="text" id="editPair" value="${trade.pair}">
            </div>
            <div class="input-group">
                <label>Результат</label>
                <div class="result-input-group">
                    <input type="number" id="editResult" step="0.1" value="${Math.abs(trade.result)}">
                    <span class="result-symbol">%</span>
                </div>
            </div>
            <div class="input-group">
                <label>Статус</label>
                <select id="editStatus">
                    <option value="profit" ${trade.status === 'profit' ? 'selected' : ''}>Прибыль</option>
                    <option value="loss" ${trade.status === 'loss' ? 'selected' : ''}>Убыток</option>
                    <option value="neutral" ${trade.status === 'neutral' ? 'selected' : ''}>В работе</option>
                </select>
            </div>
            <div class="input-group">
                <label>Комментарий (необязательно)</label>
                <input type="text" id="editComment" value="${trade.comment || ''}">
            </div>
            <div class="button-group">
                <button onclick="saveEditedTrade(${index})" class="save-btn">Сохранить</button>
                <button onclick="showTradesList()" class="cancel-btn">Отмена</button>
            </div>
        </div>
    `;
}

// Сохранение отредактированной сделки
function saveEditedTrade(index) {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category) || [];
    
    const pair = document.getElementById('editPair').value;
    const result = parseFloat(document.getElementById('editResult').value);
    const status = document.getElementById('editStatus').value;
    const comment = document.getElementById('editComment').value;
    
    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }
    
    trades[index] = {
        ...trades[index],
        pair: pair,
        result: status === 'loss' ? -Math.abs(result) : result,
        status: status,
        comment: comment
    };
    
    setTradeData(year, month, category, trades);
    updateContent();
    showNotification('Сделка обновлена');
    showTradesList();
}

// Удаление сделки
function deleteTrade(index) {
    if (!confirm('Вы уверены, что хотите удалить эту сделку?')) {
        return;
    }
    
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category) || [];
    trades.splice(index, 1);
    
    setTradeData(year, month, category, trades);
    updateContent();
    showNotification('Сделка удалена');
    showTradesList();
}

// Добавление одиночной сделки
function addSingleTrade() {
    const pair = document.getElementById('singlePair').value;
    const result = parseFloat(document.getElementById('singleResult').value);
    const status = document.getElementById('singleStatus').value;
    const comment = document.getElementById('singleComment').value;

    if (!pair || isNaN(result)) {
        showNotification('Заполните обязательные поля', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const trade = {
        pair: pair,
        result: status === 'loss' ? -Math.abs(result) : result,
        status: status,
        comment: comment,
        timestamp: new Date().toISOString()
    };

    addTradeData(year, month, category, trade);
    updateContent();
    showNotification('Сделка добавлена');
    showRegularForm();
}

// Массовое добавление сделок
function parseBulkTrades() {
    const bulkText = document.getElementById('bulkInput').value;
    const lines = bulkText.split('\n').filter(line => line.trim());
    let trades = [];

    lines.forEach(line => {
        const cleanLine = line.trim().replace('#', '');
        const parts = cleanLine.match(/([A-Za-z0-9]+).*?([-+]?\d+\.?\d*)%?/);

        if (parts) {
            const [_, symbol, result] = parts;
            const numResult = parseFloat(result);

            trades.push({
                pair: symbol,
                result: numResult,
                status: numResult > 0 ? 'profit' : (numResult < 0 ? 'loss' : 'neutral'),
                timestamp: new Date().toISOString()
            });
        }
    });

    if (trades.length === 0) {
        showNotification('Не найдено сделок для добавления', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    let totalProfit = 0;
    let totalLoss = 0;
    trades.forEach(trade => {
        if (trade.result > 0) totalProfit += trade.result;
        else totalLoss += Math.abs(trade.result);
    });

    const confirmText = `
Найдено сделок: ${trades.length}
Общая прибыль: +${totalProfit.toFixed(1)}%
${totalLoss > 0 ? `Общий убыток: -${totalLoss.toFixed(1)}%` : ''}

Добавить эти сделки в категорию ${category}?`;

    if (confirm(confirmText)) {
        trades.forEach((trade, index) => {
            setTimeout(() => {
                addTradeData(year, month, category, trade);
                if (index === trades.length - 1) {
                    updateContent();
                    document.getElementById('bulkInput').value = '';
                    showNotification(`Добавлено ${trades.length} сделок`);
                }
            }, index * 50);
        });
    }
}

// Вспомогательные функции для работы с данными
function getTradeData(year, month, category) {
    const key = `trades_${year}_${month}_${category}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setTradeData(year, month, category, trades) {
    const key = `trades_${year}_${month}_${category}`;
    localStorage.setItem(key, JSON.stringify(trades));
}

function addTradeData(year, month, category, trade) {
    const trades = getTradeData(year, month, category);
    trades.push(trade);
    setTradeData(year, month, category, trades);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();
});
