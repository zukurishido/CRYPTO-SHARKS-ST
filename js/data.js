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
    const savedData = localStorage.getItem('cryptoSharksData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('cryptoSharksData', JSON.stringify(data));
}

// Улучшенный парсинг сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Очищаем строку от лишних символов
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории (поддержка различных форматов)
        if (cleanLine.match(/DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀|DEFI */i)) {
            currentCategory = 'DeFi';
            return;
        } else if (cleanLine.match(/FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀/i)) {
            currentCategory = 'FUTURES';
            return;
        } else if (cleanLine.match(/SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀/i)) {
            currentCategory = 'SPOT';
            return;
        }

        // Паттерны для различных форматов записи сделок
        const patterns = [
            // #BTC +50% или #BTC -30%
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // BTC +50% или BTC -30%
            /(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // 1. BTC +50% или 1) BTC -30%
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // BTC - +50% или BTC . -30%
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // BTC+50% или BTC-30%
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            
            // Общий формат для чисел и символов
            /(\w+)[^\w\s]*\s*([-+])?(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i
        ];

        // Проверка каждого паттерна
        let matched = false;
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                let result = parseFloat(value);
                result = (sign === '-' || cleanLine.includes('-')) ? -result : result;
                
                // Очищаем название пары от лишних символов
                const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '');
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: cleanSymbol,
                    result: result,
                    leverage: leverage || '',
                    status: result > 0 ? 'profit' : 'loss',
                    category: currentCategory,
                    timestamp: new Date().toISOString()
                });
                matched = true;
                break;
            }
        }

        // Дополнительная проверка для особых форматов
        if (!matched && currentCategory && cleanLine.length > 0) {
            // Пытаемся извлечь любые числа и символы
            const numberMatch = cleanLine.match(/(\d+\.?\d*)/);
            const symbolMatch = cleanLine.match(/([A-Za-z]+)/);
            
            if (numberMatch && symbolMatch) {
                const value = parseFloat(numberMatch[1]);
                const symbol = symbolMatch[1];
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: symbol,
                    result: value,
                    leverage: '',
                    status: value > 0 ? 'profit' : 'loss',
                    category: currentCategory,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });

    return trades;
}

// Добавление сделок
function addTradeData(year, month, category, trades) {
    // Создаем структуру если её нет
    if (!data[year]) data[year] = {};
    if (!data[year][month]) data[year][month] = {};
    if (!data[year][month][category]) data[year][month][category] = { trades: [] };

    // Добавляем сделки
    if (Array.isArray(trades)) {
        data[year][month][category].trades.push(...trades);
    } else {
        data[year][month][category].trades.push(trades);
    }
    
    saveData();
}

// Обновление существующей сделки
function updateTradeData(year, month, category, tradeId, updatedData) {
    if (data[year]?.[month]?.[category]) {
        const trades = data[year][month][category].trades;
        const index = trades.findIndex(t => t.id === tradeId);
        
        if (index !== -1) {
            trades[index] = { ...trades[index], ...updatedData };
            saveData();
            return true;
        }
    }
    return false;
}

// Удаление сделки
function deleteTradeData(year, month, category, tradeId) {
    if (data[year]?.[month]?.[category]) {
        const trades = data[year][month][category].trades;
        data[year][month][category].trades = trades.filter(t => t.id !== tradeId);
        saveData();
        return true;
    }
    return false;
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Расчет статистики
function calculateStats(trades) {
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
}

// Экспорт данных
function exportData() {
    return {
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
    };
}

// Импорт данных
function importData(jsonData) {
    try {
        const importedData = JSON.parse(jsonData);
        data = importedData;
        saveData();
        return true;
    } catch (error) {
        console.error('Ошибка импорта данных:', error);
        return false;
    }
}

// Очистка данных за период
function clearPeriodData(year, month, category) {
    if (data[year]?.[month]?.[category]) {
        data[year][month][category].trades = [];
        saveData();
        return true;
    }
    return false;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', loadData);
