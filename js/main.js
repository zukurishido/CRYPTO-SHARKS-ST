// Инициализация приложения
class App {
    constructor() {
        this.initialized = false;
        this.year = '';
        this.month = '';
        this.category = '';
        
        // Кэширование DOM элементов
        this.elements = {
            filters: document.getElementById('filters'),
            yearSelect: document.getElementById('yearSelect'),
            monthSelect: document.getElementById('monthSelect'),
            categorySelect: document.getElementById('categorySelect'),
            summaryStats: document.getElementById('summaryStats'),
            tradesGrid: document.getElementById('tradesGrid'),
            statsContainer: document.getElementById('statsContainer')
        };

        // Привязка методов к контексту
        this.updateContent = this.updateContent.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleStorageChange = this.handleStorageChange.bind(this);
    }

    // Инициализация приложения
    async init() {
        try {
            if (this.initialized) return;

            // Загрузка начальных данных
            await StorageService.init();
            
            // Установка текущих значений фильтров
            this.setInitialFilters();
            
            // Установка обработчиков событий
            this.setupEventListeners();
            
            // Первичное обновление контента
            await this.updateContent();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            NotificationService.show('Ошибка при загрузке приложения', 'error');
        }
    }

    // Установка начальных значений фильтров
    setInitialFilters() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear().toString();
        const currentMonth = Utils.getMonthName(currentDate.getMonth());

        this.elements.yearSelect.value = currentYear;
        this.elements.monthSelect.value = currentMonth;
        this.elements.categorySelect.value = 'SPOT';

        this.year = currentYear;
        this.month = currentMonth;
        this.category = 'SPOT';
    }

    // Установка обработчиков событий
    setupEventListeners() {
        // Обработчики фильтров
        Object.values(this.elements)
            .filter(element => element?.classList.contains('filter-select'))
            .forEach(select => {
                select.addEventListener('change', this.handleFilterChange);
            });

        // Обработчик изменения хранилища
        window.addEventListener('storage', this.handleStorageChange);
    }

    // Обработка изменения фильтров
    async handleFilterChange(event) {
        const { id, value } = event.target;
        
        switch(id) {
            case 'yearSelect':
                this.year = value;
                break;
            case 'monthSelect':
                this.month = value;
                break;
            case 'categorySelect':
                this.category = value;
                break;
        }

        this.elements.statsContainer.classList.add('updating');
        await this.updateContent();
        this.elements.statsContainer.classList.remove('updating');
    }

    // Обработка изменений в хранилище
    async handleStorageChange(event) {
        if (event.key === StorageService.STORAGE_KEY) {
            await this.updateContent();
        }
    }

    // Обновление контента
    async updateContent() {
        try {
            const trades = await StorageService.getPeriodData(
                this.year, 
                this.month, 
                this.category
            );
            
            const stats = Utils.calculateStats(trades);

            // Обновляем статистику
            this.updateSummaryStats(stats);
            
            // Обновляем сетку сделок
            this.updateTradesGrid(trades);

        } catch (error) {
            console.error('Ошибка обновления контента:', error);
            NotificationService.show('Ошибка при обновлении данных', 'error');
        }
    }

    // Обновление статистики
    updateSummaryStats(stats) {
        if (!this.elements.summaryStats) return;

        this.elements.summaryStats.innerHTML = `
            <div class="stat-box fade-in">
                <h3>Всего сделок</h3>
                <div class="stat-value">${stats.totalTrades}</div>
            </div>
            <div class="stat-box fade-in delay-1">
                <h3>Прибыльных</h3>
                <div class="stat-value profit">+${stats.totalProfit}%</div>
            </div>
            <div class="stat-box fade-in delay-2">
                <h3>Убыточных</h3>
                <div class="stat-value loss">-${stats.totalLoss}%</div>
            </div>
        `;
    }

    // Обновление сетки сделок
    updateTradesGrid(trades) {
        if (!this.elements.tradesGrid) return;

        this.elements.tradesGrid.innerHTML = '';

        if (trades.length === 0) {
            this.elements.tradesGrid.innerHTML = `
                <div class="no-trades fade-in">
                    <p class="text-center text-gray-500">
                        Нет сделок за выбранный период
                    </p>
                </div>
            `;
            return;
        }

        const sortedTrades = [...trades].sort((a, b) => b.result - a.result);
        const fragment = document.createDocumentFragment();

        sortedTrades.forEach((trade, index) => {
            const card = this.createTradeCard(trade, index);
            fragment.appendChild(card);
        });

        this.elements.tradesGrid.appendChild(fragment);
    }

    // Создание карточки сделки
    createTradeCard(trade, index) {
        const card = document.createElement('div');
        card.className = 'trade-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;

        const isProfit = trade.result > 0;
        const resultClass = isProfit ? 'profit-text' : 'loss-text';
        
        card.innerHTML = `
            <div class="trade-header">
                <div class="trade-pair">
                    <span class="pair-name">#${trade.pair}</span>
                </div>
                <div class="trade-result ${resultClass}">
                    ${isProfit ? '+' : ''}${trade.result}%
                    ${trade.leverage ? 
                        `<span class="leverage">(${trade.leverage})</span>` : 
                        ''}
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar ${isProfit ? 'profit' : 'loss'}" 
                     style="width: 100%;">
                </div>
            </div>
        `;

        return card;
    }
}

// Создание и запуск приложения
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());

// Экспорт для использования в других модулях
window.app = app;
