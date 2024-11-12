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

// Проверка авторизации
function checkAuth() {
    return window.isAuthenticated || false;
}

// Загрузка данных - доступна всем для просмотра
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

// Сохранение данных - только для админа
function saveData() {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
        return false;
    }

    try {
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('Ошибка сохранения', 'error');
        return false;
    }
}

// Парсинг сделок - только для админа
function parseTrades(text) {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
        return [];
    }

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
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i  // Простой формат "пара процент"
        ];

        // Проверяем каждый паттерн
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                const result = sign === '-' ? -parseFloat(value) : parseFloat(value);
                
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: symbol.replace(/[^A-Za-z0-9]/g, ''),
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

// Добавление сделок - только для админа
function addTradeData(year, month, category, trades) {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
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
        showNotification('Ошибка добавления сделок', 'error');
        return false;
    }
}

// Удаление сделки - только для админа
function deleteTradeData(year, month, category, tradeId) {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
        return false;
    }

    try {
        if (!data[year]?.[month]?.[category]) {
            console.error('Путь к данным не существует');
            return false;
        }

        const trades = data[year][month][category].trades;
        const initialLength = trades.length;
        
        data[year][month][category].trades = trades.filter(trade => trade.id != tradeId);
        
        if (initialLength === data[year][month][category].trades.length) {
            console.error('Сделка не найдена');
            return false;
        }

        return saveData();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showNotification('Ошибка удаления сделки', 'error');
        return false;
    }
}

// Обновление сделки - только для админа
function updateTradeData(year, month, category, tradeId, updatedData) {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
        return false;
    }

    try {
        if (!data[year]?.[month]?.[category]) return false;

        const trades = data[year][month][category].trades;
        const index = trades.findIndex(t => t.id == tradeId);
        
        if (index !== -1) {
            trades[index] = { ...trades[index], ...updatedData };
            return saveData();
        }
        return false;
    } catch (error) {
        console.error('Ошибка обновления:', error);
        showNotification('Ошибка обновления сделки', 'error');
        return false;
    }
}

// Получение данных - доступно всем для просмотра
function getPeriodData(year, month, category) {
    try {
        return data[year]?.[month]?.[category]?.trades || [];
    } catch (error) {
        console.error('Ошибка получения данных:', error);
        return [];
    }
}

// Расчет статистики - доступно всем для просмотра
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

// Очистка данных - только для админа
function clearPeriodData(year, month, category) {
    if (!checkAuth()) {
        showNotification('Доступ запрещен', 'error');
        return false;
    }

    try {
        if (data[year]?.[month]?.[category]) {
            data[year][month][category].trades = [];
            return saveData();
        }
        return false;
    } catch (error) {
        console.error('Ошибка очистки данных:', error);
        return false;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    if (typeof updateContent === 'function') {
        updateContent();
    }
});
