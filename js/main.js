// Обновление контента при изменении фильтров
function updateContent() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const trades = getPeriodData(year, month, category);
    const stats = calculateStats(trades);

    updateSummaryStats(stats);
    updateTradesGrid(trades);
}

// Обновление статистики
function updateSummaryStats(stats) {
    const summaryStats = document.getElementById('summaryStats');
    summaryStats.innerHTML = `
        <div class="stat-box fade-in delay-1">
            <h3>Всего сделок</h3>
            <div class="stat-value">${stats.totalTrades}</div>
        </div>
        <div class="stat-box fade-in delay-2">
            <h3>Прибыльных</h3>
            <div class="stat-value profit">+${stats.totalProfit}%</div>
        </div>
        <div class="stat-box fade-in delay-3">
            <h3>Убыточных</h3>
            <div class="stat-value loss">-${stats.totalLoss}%</div>
        </div>
    `;
}

// Обновление сетки сделок
function updateTradesGrid(trades) {
    const container = document.getElementById('tradesGrid');
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = `
            <div class="no-trades fade-in">
                <p class="text-center text-gray-500">Нет сделок за выбранный период</p>
            </div>
        `;
        return;
    }

    trades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card ${trade.status} fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;

        const progressWidth = Math.min(Math.abs(trade.result) * 1.5, 100);
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="trade-icon">${trade.result > 0 ? '↗' : '↘'}</span>
                    <span class="pair-name">#${trade.pair}</span>
                </div>
                <div class="trade-result">
                    ${trade.result > 0 ? '+' : ''}${trade.result}%
                    ${trade.leverage ? ` <span class="leverage">(${trade.leverage})</span>` : ''}
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progressWidth}%">
                    <div class="progress-shine"></div>
                </div>
            </div>
            ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
            ${window.isAuthenticated ? `
                <div class="trade-actions admin-control">
                    <button onclick="editTrade('${trade.id}')" class="edit-btn">✎</button>
                    <button onclick="confirmDelete('${trade.id}')" class="delete-btn">✕</button>
                </div>
            ` : ''}
        `;

        container.appendChild(card);
    });
}

// Подтверждение удаления
function confirmDelete(tradeId) {
    if (!window.isAuthenticated) {
        showNotification('Доступ запрещен', 'error');
        return;
    }

    if (confirm('Удалить эту сделку?')) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.getElementById('categorySelect').value;

        if (deleteTradeData(year, month, category, tradeId)) {
            showNotification('Сделка удалена', 'success');
            updateContent();
        }
    }
}

// Редактирование сделки
function editTrade(tradeId) {
    if (!window.isAuthenticated) {
        showNotification('Доступ запрещен', 'error');
        return;
    }

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
                showNotification('Сделка обновлена', 'success');
                updateContent();
            }
        }
    }
}

// Инициализация фильтров
function initializeFilters() {
    const selects = ['yearSelect', 'monthSelect', 'categorySelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', updateContent);
        }
    });
}

// Инициализация приложения
function initializeApp() {
    loadData();
    initializeFilters();
    updateContent();
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);
