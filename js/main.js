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

    // Сортировка сделок: сначала прибыльные, потом убыточные
    const sortedTrades = [...trades].sort((a, b) => b.result - a.result);

    sortedTrades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card ${trade.status} fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;

        // Расчет ширины прогресс-бара (максимум 100%)
        const progressWidth = Math.min(Math.abs(trade.result) * 1.5, 100);
        
        // Иконка в зависимости от результата
        const icon = trade.result > 0 ? '↗' : '↘';
        const resultColor = trade.result > 0 ? 'var(--profit)' : 'var(--loss)';
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="trade-icon" style="color: ${resultColor}">${icon}</span>
                    <span class="pair-name">#${trade.pair}</span>
                </div>
                <div class="trade-result" style="color: ${resultColor}">
                    ${trade.result > 0 ? '+' : ''}${trade.result}%
                    ${trade.leverage ? `<span class="leverage">(${trade.leverage})</span>` : ''}
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
    // Установка текущего года и месяца
    const currentDate = new Date();
    
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    const currentYear = currentDate.getFullYear().toString();
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const currentMonth = months[currentDate.getMonth()];

    // Установка значений по умолчанию
    yearSelect.value = currentYear;
    monthSelect.value = currentMonth;

    // Добавление обработчиков событий
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            // Анимация обновления контента
            const statsContainer = document.getElementById('statsContainer');
            statsContainer.classList.add('updating');
            
            // Обновление данных
            updateContent();
            
            // Удаление класса анимации
            setTimeout(() => {
                statsContainer.classList.remove('updating');
            }, 500);
        });
    });
}

// Вспомогательная функция форматирования чисел
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(number);
}

// Проверка состояния аутентификации при загрузке
function checkAuthState() {
    if (window.isAuthenticated) {
        document.body.classList.add('is-admin');
    } else {
        document.body.classList.remove('is-admin');
    }
}

// Инициализация приложения
function initializeApp() {
    loadData();
    initializeFilters();
    updateContent();
    checkAuthState();

    // Обновление при изменении данных в других вкладках
    window.addEventListener('storage', (e) => {
        if (e.key === 'cryptoSharksData') {
            loadData();
            updateContent();
        }
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initializeApp);
