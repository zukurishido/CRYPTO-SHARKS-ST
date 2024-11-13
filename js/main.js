// Обновление контента
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
    
    // Проверяем, существует ли элемент
    if (!summaryStats) return;

    summaryStats.innerHTML = `
        <div class="stat-box fade-in">
            <h3>Всего сделок</h3>
            <div class="stat-value">${stats.totalTrades}</div>
        </div>
        <div class="stat-box fade-in">
            <h3>Прибыльных</h3>
            <div class="stat-value profit">+${stats.totalProfit}%</div>
        </div>
        <div class="stat-box fade-in">
            <h3>Убыточных</h3>
            <div class="stat-value loss">-${stats.totalLoss}%</div>
        </div>
    `;
}

// Обновление сетки сделок
function updateTradesGrid(trades) {
    const container = document.getElementById('tradesGrid');
    
    // Проверяем, существует ли элемент
    if (!container) return;
    
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = `
            <div class="no-trades fade-in">
                <p class="text-center text-gray-500">Нет сделок за выбранный период</p>
            </div>
        `;
        return;
    }

    // Сортируем сделки по дате (новые сверху)
    trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
        `;

        container.appendChild(card);
    });
}

// Инициализация фильтров
function initializeFilters() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');

    if (yearSelect && monthSelect) {
        // Установка текущего года и месяца
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString();
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        const currentMonth = months[currentDate.getMonth()];

        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;

        // Добавление обработчиков событий для фильтров
        const selects = document.querySelectorAll('.filter-select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                // Анимация обновления
                const statsContainer = document.getElementById('statsContainer');
                if (statsContainer) statsContainer.classList.add('updating');
                
                updateContent();
                
                setTimeout(() => {
                    if (statsContainer) statsContainer.classList.remove('updating');
                }, 500);
            });
        });
    }
}

// Инициализация приложения
function initializeApp() {
    // Загрузка данных
    loadData();
    
    // Инициализация фильтров
    initializeFilters();
    
    // Первое обновление контента
    updateContent();
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);
