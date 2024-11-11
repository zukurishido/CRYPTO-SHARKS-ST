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

// Показ формы массового добавления
function showBulkInput() {
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
    showRegularForm(); // Очищаем форму
}

// Массовое добавление сделок
function parseBulkTrades() {
    const bulkText = document.getElementById('bulkInput').value;
    const lines = bulkText.split('\n').filter(line => line.trim());
    let trades = [];

    lines.forEach(line => {
        // Очищаем строку от лишних символов
        const cleanLine = line.trim().replace('#', '');
        
        // Ищем любые комбинации символа и результата
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();
});
