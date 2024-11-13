// Структура данных
let data = {
    '2024': {
        'Январь': {
            'SPOT': { trades: [] },
            'FUTURES': { trades: [] },
            'DeFi': { trades: [] }
        }
    }
};

// Загрузка данных из localStorage
function loadData() {
    try {
        const savedData = localStorage.getItem('cryptoSharksData');
        if (savedData) {
            data = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных', 'error');
    }
}

// Сохранение данных в localStorage
function saveData() {
    try {
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('Ошибка сохранения данных', 'error');
        return false;
    }
}

// Улучшенный парсер сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Очистка строки от лишних символов
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории
        if (cleanLine.match(/DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀|DEF|DEPOSIT/i)) {
            currentCategory = 'DeFi';
            return;
        } else if (cleanLine.match(/FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀|FUT|PERPETUAL/i)) {
            currentCategory = 'FUTURES';
            return;
        } else if (cleanLine.match(/SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀|DEPOSIT|SPOT TRADING/i)) {
            currentCategory = 'SPOT';
            return;
        }

        // Различные паттерны для сделок
        const patterns = [
            // Стандартный формат: #BTC +50% или #BTC -30%
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Формат без #: BTC +50% или BTC -30%
            /(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Формат с номером: 1. BTC +50% или 1) BTC -30%
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Формат через дефис или точку: BTC - +50% или BTC . -30%
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Формат без пробелов: BTC+50% или BTC-30%
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Простой формат: BTC 50%
            /(\w+)\s+(\d+\.?\d*)%/i
        ];

        // Проверка каждого паттерна
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                let result = parseFloat(value);
                
                // Определение знака
                if (sign === '-' || cleanLine.includes('-')) {
                    result = -result;
                }
                
                // Очистка названия пары
                const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: cleanSymbol,
                    result: result,
                    leverage: leverage || '',
                    status: result > 0 ? 'profit' : 'loss',
                    category: currentCategory,
                    timestamp: new Date().toISOString()
                });
                break;
            }
        }
    });

    return trades;
}

// Добавление сделок
function addTradeData(year, month, category, trades) {
    if (!window.isAuthenticated) {
        showNotification('Требуется авторизация', 'error');
        return false;
    }

    try {
        if (!data[year]) data[year] = {};
        if (!data[year][month]) data[year][month] = {};
        if (!data[year][month][category]) data[year][month][category] = { trades: [] };

        if (Array.isArray(trades)) {
            data[year][month][category].trades.push(...trades);
        } else {
            data[year][month][category].trades.push(trades);
        }
        
        return saveData();
    } catch (error) {
        console.error('Ошибка добавления:', error);
        showNotification('Ошибка при добавлении сделок', 'error');
        return false;
    }
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Удаление сделки (исправленная версия)
function deleteTradeData(year, month, category, index) {
    try {
        if (!data[year] || !data[year][month] || !data[year][month][category]) {
            return false;
        }

        const trades = data[year][month][category].trades;
        
        if (index >= 0 && index < trades.length) {
            trades.splice(index, 1);
            saveData();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Ошибка удаления данных:', error);
        showNotification('Ошибка при удалении', 'error');
        return false;
    }
}

// Расчет статистики
function calculateStats(trades) {
    try {
        let totalProfit = 0;
        let totalLoss = 0;
        let profitCount = 0;
        let lossCount = 0;
        
        trades.forEach(trade => {
            if (trade.result > 0) {
                totalProfit += trade.result;
                profitCount++;
            } else if (trade.result < 0) {
                totalLoss += Math.abs(trade.result);
                lossCount++;
            }
        });

        return {
            totalTrades: trades.length,
            profitTrades: profitCount,
            lossTrades: lossCount,
            totalProfit: totalProfit.toFixed(1),
            totalLoss: totalLoss.toFixed(1),
            winRate: trades.length > 0 ? ((profitCount / trades.length) * 100).toFixed(1) : 0
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', loadData);
