// Константы
const CONSTANTS = {
    YEARS: ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
    MONTHS: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    CATEGORIES: ['SPOT', 'FUTURES', 'DeFi']
};

// Класс для работы с данными
class DataService {
    constructor() {
        this.data = {};
        this.initialized = false;
    }

    // Инициализация структуры данных
    async init() {
        try {
            if (this.initialized) return;

            await this.loadData();
            this.initializeStructure();
            this.initialized = true;

        } catch (error) {
            console.error('Ошибка инициализации данных:', error);
            throw new Error('Не удалось инициализировать данные');
        }
    }

    // Инициализация структуры данных
    initializeStructure() {
        CONSTANTS.YEARS.forEach(year => {
            if (!this.data[year]) this.data[year] = {};
            
            CONSTANTS.MONTHS.forEach(month => {
                if (!this.data[year][month]) {
                    this.data[year][month] = {};
                    
                    CONSTANTS.CATEGORIES.forEach(category => {
                        if (!this.data[year][month][category]) {
                            this.data[year][month][category] = { trades: [] };
                        }
                    });
                }
            });
        });
    }

    // Загрузка данных
    async loadData() {
        try {
            const savedData = await StorageService.getData();
            if (savedData) {
                this.data = savedData;
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            NotificationService.show('Ошибка при загрузке данных', 'error');
        }
    }

    // Парсинг сделок из текста
    parseTrades(text) {
        const lines = text.split('\n').filter(line => line.trim());
        let currentCategory = '';
        let trades = [];

        const categoryPatterns = {
            DeFi: /DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀|DEF|DEPOSIT|ДЕФИ СПОТЫ?/i,
            FUTURES: /FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀|FUT|PERPETUAL|ФЬЮЧЕРСЫ?/i,
            SPOT: /SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀|DEPOSIT|SPOT TRADING|СПОТ ТОРГОВЛЯ/i
        };

        const tradePatterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i,
            /[#]?(\w+)\s*([+-])?(\d+\.?\d*)%\s*(?:\((\d+)[xх]\)?)?/i
        ];

        lines.forEach(line => {
            const cleanLine = line.trim().replace(/["""'']/g, '');

            // Определение категории
            for (const [category, pattern] of Object.entries(categoryPatterns)) {
                if (cleanLine.match(pattern)) {
                    currentCategory = category;
                    return;
                }
            }

            if (!currentCategory) return;

            // Парсинг сделки
            for (const pattern of tradePatterns) {
                const match = cleanLine.match(pattern);
                if (match) {
                    const [_, symbol, sign, value, leverage] = match;
                    const result = this.parseTradeResult(value, sign, cleanLine);
                    
                    trades.push(this.createTradeObject(
                        symbol,
                        result,
                        leverage,
                        currentCategory
                    ));
                    break;
                }
            }
        });

        return trades;
    }

    // Парсинг результата сделки
    parseTradeResult(value, sign, line) {
        let result = parseFloat(value);
        if (sign === '-' || line.includes('-')) {
            result = -result;
        }
        return result;
    }

    // Создание объекта сделки
    createTradeObject(symbol, result, leverage, category) {
        return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            pair: symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
            result: result,
            leverage: leverage || '',
            status: result > 0 ? 'profit' : 'loss',
            category: category,
            timestamp: new Date().toISOString()
        };
    }

    // Добавление сделок
    async addTrades(year, month, category, trades) {
        try {
            if (!this.data[year]) this.data[year] = {};
            if (!this.data[year][month]) this.data[year][month] = {};
            if (!this.data[year][month][category]) {
                this.data[year][month][category] = { trades: [] };
            }

            const tradesArray = Array.isArray(trades) ? trades : [trades];
            this.data[year][month][category].trades.push(...tradesArray);

            await StorageService.saveData(this.data);
            return true;

        } catch (error) {
            console.error('Ошибка добавления сделок:', error);
            throw new Error('Не удалось добавить сделки');
        }
    }

    // Удаление сделки
    async deleteTrade(year, month, category, index) {
        try {
            if (!this.data[year]?.[month]?.[category]?.trades) {
                throw new Error('Неверный путь к сделке');
            }

            const trades = this.data[year][month][category].trades;
            if (index >= 0 && index < trades.length) {
                trades.splice(index, 1);
                await StorageService.saveData(this.data);
                return true;
            }

            return false;

        } catch (error) {
            console.error('Ошибка удаления сделки:', error);
            throw new Error('Не удалось удалить сделку');
        }
    }

    // Получение данных за период
    getPeriodData(year, month, category) {
        return this.data[year]?.[month]?.[category]?.trades || [];
    }
}

// Экспорт сервиса
const dataService = new DataService();
window.dataService = dataService;
