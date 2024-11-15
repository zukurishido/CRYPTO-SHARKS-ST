import { loadData, calculateStats } from './data.js';
import { initializeAdminPanel } from './admin.js';

// Обновление контента
async function updateContent() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;

    const trades = await loadData(year, month, category);
    const stats = calculateStats(trades);

    updateSummaryStats(stats);
    updateTradesGrid(trades);
}

// Обновление статистики
function updateSummaryStats(stats) {
    const summaryStats = document.getElementById('summaryStats');
    
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

    const sortedTrades = [...trades].sort((a, b) => b.result - a.result);

    sortedTrades.forEach((trade, index) => {
        const card = document.createElement('div');
        card.className = `trade-card fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;

        const isProfit = trade.result > 0;
        const resultClass = isProfit ? 'profit-text' : 'loss-text';
        const barColor = isProfit ? '#00ff9d' : '#ff4444';
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="pair-name">#${trade.pair}</span>
                </div>
                <div class="trade-result ${resultClass}">
                    ${isProfit ? '+' : ''}${trade.result}%
                    ${trade.leverage ? `<span class="leverage">(${trade.leverage})</span>` : ''}
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" 
                     style="background: ${barColor}; 
                            width: 100%;">
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

        // Добавление обработчиков событий
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                const statsContainer = document.getElementById('statsContainer');
                if (statsContainer) {
                    statsContainer.classList.add('updating');
                }
                
                updateContent();
                
                setTimeout(() => {
                    if (statsContainer) {
                        statsContainer.classList.remove('updating');
                    }
                }, 500);
            });
        });
    }
}

// Инициализация приложения
async function initializeApp() {
    initializeAdminPanel();
    initializeFilters();
    await updateContent();

    // Проверка авторизации при загрузке
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
        document.body.classList.add('is-admin');
    }
}

// Автоматическое обновление каждые 30 секунд
setInterval(async () => {
    if (!document.hidden) {
        await updateContent();
    }
}, 30000);

// Экспорт для использования в других модулях
window.updateContent = updateContent;

// Запуск приложения
document.addEventListener('DOMContentLoaded', initializeApp);
