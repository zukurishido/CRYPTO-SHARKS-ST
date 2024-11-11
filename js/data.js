// Функции для работы с данными
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

// Обновление контента
function updateContent() {
    updateSummaryStats();
    updateTradesGrid();
}

// Обновление статистики
function updateSummaryStats() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category);
    
    let totalProfit = 0;
    let totalLoss = 0;
    let profitCount = 0;
    let lossCount = 0;
    
    trades.forEach(trade => {
        if (trade.result > 0) {
            totalProfit += trade.result;
            profitCount++;
        } else if (trade.result < 0) {
            totalLoss += Math.abs(trade.result);
            lossCount++;
        }
    });

    const successRate = trades.length > 0 ? ((profitCount / trades.length) * 100).toFixed(1) : 0;
    
    document.getElementById('summaryStats').innerHTML = `
        <div class="stat-card">
            <h3>Всего сделок</h3>
            <p>${trades.length}</p>
        </div>
        <div class="stat-card">
            <h3>Прибыльных</h3>
            <p>${profitCount}</p>
        </div>
        <div class="stat-card">
            <h3>Убыточных</h3>
            <p>${lossCount}</p>
        </div>
        <div class="stat-card">
            <h3>Общая прибыль</h3>
            <p>+${totalProfit.toFixed(1)}%</p>
        </div>
        <div class="stat-card">
            <h3>Общий убыток</h3>
            <p>-${totalLoss.toFixed(1)}%</p>
        </div>
        <div class="stat-card">
            <h3>Винрейт</h3>
            <p>${successRate}%</p>
        </div>
    `;
}

// Обновление сетки сделок
function updateTradesGrid() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category);
    
    let html = '';
    trades.forEach(trade => {
        html += `
            <div class="trade-card ${trade.status}">
                <div class="trade-header">
                    <span class="trade-pair">${trade.pair}</span>
                    <span class="trade-result ${trade.result > 0 ? 'profit' : 'loss'}">${trade.result > 0 ? '+' : ''}${trade.result}%</span>
                </div>
                ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
                <div class="trade-date">${new Date(trade.timestamp).toLocaleDateString()}</div>
            </div>
        `;
    });
    
    document.getElementById('tradesGrid').innerHTML = html || '<p class="no-trades">Нет сделок для отображения</p>';
}

// Обновление информации в админ панели
function updateAdminPanelInfo() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    document.getElementById('currentSettings').innerHTML = `
        <div class="current-setting">
            <span class="setting-label">Год:</span>
            <span>${year}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Месяц:</span>
            <span>${getMonthName(month)}</span>
        </div>
        <div class="current-setting">
            <span class="setting-label">Категория:</span>
            <span>${category}</span>
        </div>
    `;
}

function getMonthName(month) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август',
        'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[parseInt(month) - 1];
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
});
