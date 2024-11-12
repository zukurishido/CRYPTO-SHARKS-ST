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
    const savedData = localStorage.getItem('cryptoSharksData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem('cryptoSharksData', JSON.stringify(data));
}

// Парсинг сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Определение категории
        if (line.includes('DEFI:') || line.includes('DeFi:')) {
            currentCategory = 'DeFi';
            return;
        } else if (line.includes('FUTURES:')) {
            currentCategory = 'FUTURES';
            return;
        } else if (line.includes('SPOT:')) {
            currentCategory = 'SPOT';
            return;
        }

        // Парсинг одиночной сделки
        const tradeMatch = line.match(/[\d.]+\.?#?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/);
        
        if (tradeMatch && currentCategory) {
            const [_, symbol, sign, value, leverage] = tradeMatch;
            const result = (sign === '+' ? 1 : -1) * parseFloat(value);
            
            trades.push({
                id: Date.now() + Math.random(),
                pair: symbol,
                result: result,
                leverage: leverage || '',
                status: result > 0 ? 'profit' : 'loss',
                category: currentCategory
            });
        }
    });

    return trades;
}

// Добавление сделок
function addTradeData(year, month, category, trades) {
    if (!data[year]) data[year] = {};
    if (!data[year][month]) data[year][month] = {};
    if (!data[year][month][category]) data[year][month][category] = { trades: [] };

    if (Array.isArray(trades)) {
        data[year][month][category].trades.push(...trades);
    } else {
        data[year][month][category].trades.push(trades);
    }
    
    saveData();
}

// Обновление сделки
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

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);
