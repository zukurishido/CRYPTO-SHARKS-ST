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
        `;

        container.appendChild(card);
    });
}

// Инициализация фильтров
function initializeFilters() {
    // Установка текущего года по умолчанию
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        const currentYear = new Date().getFullYear().toString();
        yearSelect.value = currentYear;
    }

    // Установка текущего месяца по умолчанию
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        const currentMonth = months[new Date().getMonth()];
        monthSelect.value = currentMonth;
    }

    // Добавление обработчиков событий для фильтров
    const selects = document.querySelectorAll('.filter-select');
    selects.forEach(select => {
        select.addEventListener('change', () => {
            updateContent();
            
            // Добавляем анимацию обновления
            const statsContainer = document.getElementById('statsContainer');
            if (statsContainer) {
                statsContainer.classList.add('updating');
                setTimeout(() => {
                    statsContainer.classList.remove('updating');
                }, 500);
            }
        });
    });
}

// Вспомогательная функция для форматирования чисел
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(number);
}

// Инициализация приложения
function initializeApp() {
    loadData();
    initializeFilters();
    updateContent();

    // Добавляем обработчик для обновления при изменении данных
    window.addEventListener('storage', (e) => {
        if (e.key === 'cryptoSharksData') {
            loadData();
            updateContent();
        }
    });
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);
