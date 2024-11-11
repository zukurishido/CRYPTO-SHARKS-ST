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
            <h3>Winrate</h3>
            <div class="stat-value">${stats.winRate}%</div>
        </div>
        <div class="stat-box fade-in delay-3">
            <h3>Прибыль</h3>
            <div class="stat-value profit">+${stats.totalProfit}%</div>
        </div>
        <div class="stat-box fade-in delay-4">
            <h3>Убыток</h3>
            <div class="stat-value loss">-${stats.totalLoss}%</div>
        </div>
    `;
}

// Обновление списка сделок
function updateTradesGrid(trades) {
    const container = document.getElementById('tradesGrid');
    container.innerHTML = '';

    trades.forEach((trade, index) => {
        const card = createTradeCard(trade, index);
        container.appendChild(card);
    });
}

// Создание карточки сделки с анимацией
function createTradeCard(trade, index) {
    const card = document.createElement('div');
    const statusClass = trade.result > 0 ? 'profit' : (trade.result < 0 ? 'loss' : 'neutral');
    
    card.className = `trade-card ${statusClass}`;
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="trade-header">
            <div class="trade-pair">
                <div class="pair-icon">
                    ${getStatusIcon(trade.status)}
                </div>
                <div class="pair-name">#${trade.pair}</div>
            </div>
            <div class="trade-result">
                ${trade.result > 0 ? '+' : ''}${trade.result}%
                ${trade.leverage ? ` (${trade.leverage})` : ''}
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" style="width: 0%">
                <div class="progress-shine"></div>
            </div>
        </div>
        ${trade.comment ? `<div class="trade-comment">${trade.comment}</div>` : ''}
    `;

    // Анимация появления и заполнения прогресс-бара
    setTimeout(() => {
        card.classList.add('visible');
        setTimeout(() => {
            const progressBar = card.querySelector('.progress-bar');
            const width = Math.min(Math.abs(trade.result) * 1.5, 100);
            progressBar.style.width = `${width}%`;
        }, 300);
    }, index * 100);

    return card;
}

// Получение иконки для статуса
function getStatusIcon(status) {
    switch(status) {
        case 'profit':
            return '<i class="lucide lucide-trending-up"></i>';
        case 'loss':
            return '<i class="lucide lucide-trending-down"></i>';
        default:
            return '<i class="lucide lucide-minus"></i>';
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Обновляем контент первый раз
    updateContent();

    // Добавляем обработчики для анимации при наведении
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.trade-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

// Форматирование чисел
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(number);
}
