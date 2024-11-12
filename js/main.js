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

        // Рассчитываем ширину прогресс-бара (максимум 100%)
        const progressWidth = Math.min(Math.abs(trade.result) * 1.5, 100);
        
        // Иконка в зависимости от результата
        const icon = trade.result > 0 ? '↗' : '↘';
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="trade-icon">${icon}</span>
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
        `;

        // Добавляем эффект свечения при наведении
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
        });

        container.appendChild(card);
    });
}

// Инициализация фильтров
function initializeFilters() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const categorySelect = document.getElementById('categorySelect');

    // Заполняем актуальным годом
    const currentYear = new Date().getFullYear();
    yearSelect.value = currentYear.toString();

    // Заполняем актуальным месяцем
    const currentMonth = new Date().toLocaleString('ru', { month: 'long' });
    monthSelect.value = currentMonth;

    // Добавляем обработчики событий
    [yearSelect, monthSelect, categorySelect].forEach(select => {
        select.addEventListener('change', () => {
            updateContent();
            // Анимация обновления контента
            const container = document.getElementById('statsContainer');
            container.classList.add('updating');
            setTimeout(() => container.classList.remove('updating'), 500);
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

// Функция инициализации приложения
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

    // Показываем уведомление о загрузке
    showNotification('Приложение готово к работе', 'success');
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);
