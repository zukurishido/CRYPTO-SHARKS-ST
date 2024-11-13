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

// Загрузка данных
function loadData() {
    try {
        const savedData = localStorage.getItem('cryptoSharksData');
        if (savedData) {
            data = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Сохранение данных
function saveData() {
    try {
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

// Парсинг сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории
        if (cleanLine.match(/DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀/i)) {
            currentCategory = 'DeFi';
            return;
        } else if (cleanLine.match(/FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀/i)) {
            currentCategory = 'FUTURES';
            return;
        } else if (cleanLine.match(/SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀/i)) {
            currentCategory = 'SPOT';
            return;
        }

        // Различные паттерны для сделок
        const patterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i
        ];

        // Проверка каждого паттерна
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                const result = (sign === '+' ? 1 : -1) * parseFloat(value);
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: symbol.replace(/[^A-Za-z0-9]/g, ''),
                    result: result,
                    leverage: leverage || '',
                    status: result > 0 ? 'profit' : 'loss',
                    category: currentCategory
                });
                break;
            }
        }
    });

    return trades;
}

// Добавление сделок
function addTradeData(year, month, category, trades) {
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
        return false;
    }
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Расчет статистики
function calculateStats(trades) {
    let totalProfit = 0;
    let totalLoss = 0;
    
    trades.forEach(trade => {
        if (trade.result > 0) {
            totalProfit += trade.result;
        } else if (trade.result < 0) {
            totalLoss += Math.abs(trade.result);
        }
    });

    return {
        totalTrades: trades.length,
        profitTrades: trades.filter(t => t.result > 0).length,
        lossTrades: trades.filter(t => t.result < 0).length,
        totalProfit: totalProfit.toFixed(1),
        totalLoss: totalLoss.toFixed(1)
    };
}

// Удаление сделки
function deleteTradeData(year, month, category, tradeId) {
    if (!data[year]?.[month]?.[category]) return false;

    const trades = data[year][month][category].trades;
    const initialLength = trades.length;
    
    data[year][month][category].trades = trades.filter(t => t.id !== tradeId);
    
    if (initialLength === data[year][month][category].trades.length) {
        return false;
    }

    return saveData();
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);
