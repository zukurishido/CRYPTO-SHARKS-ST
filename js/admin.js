// Состояние админ-панели
let isAuthenticated = false;
let isAdminPanelVisible = false;

// Управление паролем
function setAdminPassword(password) {
    const hashedPassword = btoa(password); // Простое кодирование
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

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
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
        showBulkInput(); // Показываем форму массового ввода по умолчанию
    } else {
        panel.classList.remove('visible');
    }
}

// Выход из админ-панели
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
            <textarea id="bulkInput" rows="15" placeholder="DEFI:🚀
1.#FIT +20%
2.#AMT +22%

FUTURES:🚀
1.#BNB +35% (5х)
2.#CELO +76% (20х)

SPOT:🚀
1.#TWT +35%
2.#NEAR -15%"></textarea>
            <button onclick="parseBulkTrades()" class="add-btn">
                Добавить все сделки
            </button>
        </div>
    `;
}

// Парсинг и добавление массива сделок
function parseBulkTrades() {
    const bulkText = document.getElementById('bulkInput').value;
    const trades = parseTrades(bulkText);

    if (trades.length === 0) {
        showNotification('Не найдено сделок для добавления', 'error');
        return;
    }

    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;

    // Группируем сделки по категориям для статистики
    const stats = trades.reduce((acc, trade) => {
        if (!acc[trade.category]) {
            acc[trade.category] = { count: 0, profit: 0, loss: 0 };
        }
        acc[trade.category].count++;
        if (trade.result > 0) acc[trade.category].profit += trade.result;
        if (trade.result < 0) acc[trade.category].loss += Math.abs(trade.result);
        return acc;
    }, {});

    // Формируем текст подтверждения
    let confirmText = 'Найдены сделки:\n\n';
    Object.entries(stats).forEach(([category, stat]) => {
        confirmText += `${category}:\n`;
        confirmText += `Количество: ${stat.count}\n`;
        if (stat.profit > 0) confirmText += `Прибыль: +${stat.profit.toFixed(1)}%\n`;
        if (stat.loss > 0) confirmText += `Убыток: -${stat.loss.toFixed(1)}%\n`;
        confirmText += '\n';
    });

    if (confirm(confirmText + '\nДобавить эти сделки?')) {
        trades.forEach((trade, index) => {
            setTimeout(() => {
                addTradeData(year, month, trade.category, trade);
                if (index === trades.length - 1) {
                    updateContent();
                    showNotification(`Добавлено ${trades.length} сделок`);
                    document.getElementById('bulkInput').value = '';
                }
            }, index * 50); // Небольшая задержка для анимации
        });
    }
}

// Показ списка сделок для редактирования
function showTradesList() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const categories = ['SPOT', 'FUTURES', 'DeFi'];
    
    let html = '<div class="trades-list">';
    
    categories.forEach(category => {
        const trades = getPeriodData(year, month, category);
        if (trades.length > 0) {
            html += `
                <div class="category-section">
                    <h3>${category}</h3>
                    <div class="trades-grid">
            `;
            
            trades.forEach((trade, index) => {
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
                            <button onclick="editTrade('${year}', '${month}', '${category}', ${index})" 
                                    class="edit-btn">
                                Редактировать
                            </button>
                            <button onclick="deleteTrade('${year}', '${month}', '${category}', ${index})" 
                                    class="delete-btn">
                                Удалить
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
    });
    
    html += '</div>';
    document.querySelector('.admin-form').innerHTML = html;
}

// Редактирование сделки
function editTrade(year, month, category, index) {
    const trades = getPeriodData(year, month, category);
    const trade = trades[index];
    
    document.querySelector('.admin-form').innerHTML = `
        <div class="edit-form">
            <h3>Редактирование сделки</h3>
            <div class="input-group">
                <label>Пара</label>
                <input type="text" id="editPair" value="${trade.pair}">
            </div>
            <div class="input-group">
                <label>Результат (%)</label>
                <input type="number" id="editResult" value="${trade.result}" step="0.1">
            </div>
            <div class="input-group">
                <label>Кратность (для FUTURES)</label>
                <input type="text" id="editLeverage" value="${trade.leverage || ''}">
            </div>
            <div class="input-group">
                <label>Комментарий</label>
                <input type="text" id="editComment" value="${trade.comment || ''}">
            </div>
            <div class="button-group">
                <button onclick="saveTrade('${year}', '${month}', '${category}', ${index})" class="save-btn">
                    Сохранить
                </button>
                <button onclick="showTradesList()" class="cancel-btn">
                    Отмена
                </button>
            </div>
        </div>
    `;
}

// Сохранение отредактированной сделки
function saveTrade(year, month, category, index) {
    const updatedTrade = {
        pair: document.getElementById('editPair').value,
        result: parseFloat(document.getElementById('editResult').value),
        leverage: document.getElementById('editLeverage').value,
        comment: document.getElementById('editComment').value
    };

    // Определяем статус на основе результата
    updatedTrade.status = updatedTrade.result > 0 ? 'profit' : 
                         (updatedTrade.result < 0 ? 'loss' : 'neutral');

    if (updateTradeData(year, month, category, index, updatedTrade)) {
        showNotification('Сделка обновлена');
        showTradesList();
        updateContent();
    } else {
        showNotification('Ошибка при обновлении', 'error');
    }
}

// Удаление сделки
function deleteTrade(year, month, category, index) {
    if (confirm('Удалить эту сделку?')) {
        if (deleteTradeData(year, month, category, index)) {
            showNotification('Сделка удалена');
            showTradesList();
            updateContent();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();
});
