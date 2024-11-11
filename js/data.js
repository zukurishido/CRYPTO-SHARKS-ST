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
    updateAdminPanelInfo();
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

    const summaryStats = document.getElementById('summaryStats');
    if (summaryStats) {
        summaryStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card total">
                    <div class="stat-value">${trades.length}</div>
                    <div class="stat-label">Всего сделок</div>
                </div>
                <div class="stat-card profit">
                    <div class="stat-value">+${totalProfit.toFixed(1)}%</div>
                    <div class="stat-label">Прибыль</div>
                </div>
                <div class="stat-card loss">
                    <div class="stat-value">-${totalLoss.toFixed(1)}%</div>
                    <div class="stat-label">Убыток</div>
                </div>
                <div class="stat-card profit">
                    <div class="stat-value">${profitCount}</div>
                    <div class="stat-label">Прибыльных</div>
                </div>
                <div class="stat-card loss">
                    <div class="stat-value">${lossCount}</div>
                    <div class="stat-label">Убыточных</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${successRate}%</div>
                    <div class="stat-label">Винрейт</div>
                </div>
            </div>
        `;
    }
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
                    <div class="trade-info">
                        <span class="trade-pair">${trade.pair}</span>
                        <span class="trade-result ${trade.result > 0 ? 'profit' : 'loss'}">${trade.result > 0 ? '+' : ''}${trade.result}%</span>
                    </div>
                </div>
                ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
            </div>
        `;
    });
    
    const tradesGrid = document.getElementById('tradesGrid');
    if (tradesGrid) {
        tradesGrid.innerHTML = trades.length ? html : '<p class="no-trades">Нет сделок для отображения</p>';
    }
}

// Обновление информации в админ панели
function updateAdminPanelInfo() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const currentSettings = document.getElementById('currentSettings');
    if (currentSettings) {
        currentSettings.innerHTML = `
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
