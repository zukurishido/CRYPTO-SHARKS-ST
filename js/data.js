// Структура для хранения данных
let data = {
    '2024': {
        '10': {
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

// Добавление новой сделки
function addTradeData(year, month, category, tradeData) {
    if (!data[year]) {
        data[year] = {};
    }
    if (!data[year][month]) {
        data[year][month] = {};
    }
    if (!data[year][month][category]) {
        data[year][month][category] = { trades: [] };
    }

    // Добавляем сделку
    data[year][month][category].trades.push({
        ...tradeData,
        timestamp: new Date().toISOString()
    });
    
    // Сохраняем данные
    saveData();
}

// Получение данных за период
function getPeriodData(year, month, category) {
    return data[year]?.[month]?.[category]?.trades || [];
}

// Обновление существующей сделки
function updateTradeData(year, month, category, index, tradeData) {
    if (data[year]?.[month]?.[category]?.trades[index]) {
        data[year][month][category].trades[index] = {
            ...tradeData,
            updatedAt: new Date().toISOString()
        };
        saveData();
        return true;
    }
    return false;
}

// Удаление сделки
function deleteTradeData(year, month, category, index) {
    if (data[year]?.[month]?.[category]?.trades[index]) {
        data[year][month][category].trades.splice(index, 1);
        saveData();
        return true;
    }
    return false;
}

// Расчет статистики
function calculateStats(trades) {
    let stats = {
        totalTrades: 0,
        profitTrades: 0,
        lossTrades: 0,
        neutralTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        maxProfit: 0,
        maxLoss: 0
    };

    trades.forEach(trade => {
        stats.totalTrades++;
        
        if (trade.result > 0) {
            stats.profitTrades++;
            stats.totalProfit += trade.result;
            stats.maxProfit = Math.max(stats.maxProfit, trade.result);
        } else if (trade.result < 0) {
            stats.lossTrades++;
            stats.totalLoss += Math.abs(trade.result);
            stats.maxLoss = Math.max(stats.maxLoss, Math.abs(trade.result));
        } else {
            stats.neutralTrades++;
        }
    });

    return {
        totalTrades: stats.totalTrades,
        profitTrades: stats.profitTrades,
        lossTrades: stats.lossTrades,
        neutralTrades: stats.neutralTrades,
        totalProfit: stats.totalProfit.toFixed(1),
        totalLoss: stats.totalLoss.toFixed(1),
        netProfit: (stats.totalProfit - stats.totalLoss).toFixed(1),
        winRate: stats.totalTrades ? 
            ((stats.profitTrades / stats.totalTrades) * 100).toFixed(1) : 0,
        maxProfit: stats.maxProfit.toFixed(1),
        maxLoss: stats.maxLoss.toFixed(1)
    };
}

// Парсинг массового ввода
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

        // Парсинг сделки
        const tradeMatch = line.match(/\d+\.#(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/);
        
        if (tradeMatch && currentCategory) {
            const [_, symbol, sign, value, leverage] = tradeMatch;
            const result = (sign === '+' ? 1 : -1) * parseFloat(value);
            
            trades.push({
                pair: symbol,
                result: result,
                status: result > 0 ? 'profit' : (result < 0 ? 'loss' : 'neutral'),
                leverage: leverage || '',
                comment: leverage ? `(${leverage}x)` : '',
                category: currentCategory
            });
        }
    });

    return trades;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', loadData);
