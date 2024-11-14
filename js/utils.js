// Утилиты для работы с приложением
class Utils {
    // Получение имени месяца
    static getMonthName(monthIndex) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[monthIndex];
    }

    // Форматирование чисел
    static formatNumber(number, options = {}) {
        const defaults = {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
            locale: 'ru-RU'
        };

        const config = { ...defaults, ...options };
        return new Intl.NumberFormat(config.locale, config).format(number);
    }

    // Форматирование даты
    static formatDate(date, options = {}) {
        const defaults = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const config = { ...defaults, ...options };
        return new Date(date).toLocaleDateString('ru-RU', config);
    }

    // Расчет статистики
    static calculateStats(trades) {
        try {
            const initial = {
                totalTrades: 0,
                profitTrades: 0,
                lossTrades: 0,
                totalProfit: 0,
                totalLoss: 0
            };

            const stats = trades.reduce((acc, trade) => {
                acc.totalTrades++;
                
                if (trade.result > 0) {
                    acc.profitTrades++;
                    acc.totalProfit += trade.result;
                } else if (trade.result < 0) {
                    acc.lossTrades++;
                    acc.totalLoss += Math.abs(trade.result);
                }
                
                return acc;
            }, initial);

            return {
                ...stats,
                totalProfit: this.formatNumber(stats.totalProfit),
                totalLoss: this.formatNumber(stats.totalLoss),
                winRate: this.formatNumber(
                    stats.totalTrades > 0 ? 
                    (stats.profitTrades / stats.totalTrades) * 100 : 
                    0
                )
            };

        } catch (error) {
            console.error('Ошибка расчета статистики:', error);
            return {
                totalTrades: 0,
                profitTrades: 0,
                lossTrades: 0,
                totalProfit: '0.0',
                totalLoss: '0.0',
                winRate: '0.0'
            };
        }
    }

    // Дебаунс функция
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Троттлинг функция
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Генерация уникального ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Валидация данных
    static validateTrade(trade) {
        const required = ['pair', 'result', 'status', 'category'];
        
        for (const field of required) {
            if (!trade[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        if (isNaN(parseFloat(trade.result))) {
            throw new Error('Неверный формат результата');
        }

        return true;
    }

    // Копирование в буфер обмена
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Ошибка копирования:', error);
            return false;
        }
    }

    // Склонение числительных
    static pluralize(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        const index = (number % 100 > 4 && number % 100 < 20) ? 
            2 : 
            cases[(number % 10 < 5) ? number % 10 : 5];
        return `${number} ${words[index]}`;
    }
}

// Экспорт утилит
window.Utils = Utils;
