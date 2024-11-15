// Структура данных
let data = {};

// Константы для структуры данных
const YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const CATEGORIES = ['SPOT', 'FUTURES', 'DeFi'];

// Загрузка данных из GitHub Gist
async function loadData() {
    try {
        // Получаем данные из публичного Gist
        const response = await fetch(`https://api.github.com/gists/${window.githubConfig.gistId}`);
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const gistData = await response.json();
        const content = gistData.files['trading-data.json'].content;
        data = JSON.parse(content);

        // Инициализация структуры данных если чего-то не хватает
        YEARS.forEach(year => {
            if (!data[year]) data[year] = {};
            MONTHS.forEach(month => {
                if (!data[year][month]) {
                    data[year][month] = {};
                    CATEGORIES.forEach(category => {
                        if (!data[year][month][category]) {
                            data[year][month][category] = { trades: [] };
                        }
                    });
                }
            });
        });

        // Кэшируем данные локально
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Пробуем загрузить из кэша в случае ошибки
        const cachedData = localStorage.getItem('cryptoSharksData');
        if (cachedData) {
            data = JSON.parse(cachedData);
            return true;
        }
        return false;
    }
}

// Сохранение данных в GitHub Gist
async function saveData() {
    if (!window.isAuthenticated) return false;

    try {
        const files = {
            'trading-data.json': {
                content: JSON.stringify(data, null, 2)
            }
        };

        const response = await fetch(`https://api.github.com/gists/${window.githubConfig.gistId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${window.githubConfig.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ files })
        });

        if (!response.ok) throw new Error('Failed to save data');

        // Обновляем локальный кэш
        localStorage.setItem('cryptoSharksData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('Ошибка сохранения данных', 'error');
        return false;
    }
}

// Парсер сделок
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Очистка строки
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории
        if (cleanLine.match(/DEFI|ДЕФИ|DEFI:|ДЕФИ:|DEFI🚀|DEF|DEPOSIT|ДЕФИ СПОТЫ?/i)) {
            currentCategory = 'DeFi';
            return;
        } else if (cleanLine.match(/FUTURES|ФЬЮЧЕРС|FUTURES:|ФЬЮЧЕРС:|FUTURES🚀|FUT|PERPETUAL|ФЬЮЧЕРСЫ?/i)) {
            currentCategory = 'FUTURES';
            return;
        } else if (cleanLine.match(/SPOT|СПОТ|SPOT:|СПОТ:|SPOT🚀|DEPOSIT|SPOT TRADING|СПОТ ТОРГОВЛЯ/i)) {
            currentCategory = 'SPOT';
            return;
        }

        // Паттерны для разных форматов записи
        const patterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i,
            /[#]?(\w+)\s*([+-])?(\d+\.?\d*)%\s*(?:\((\d+)[xх]\)?)?/i
        ];

        // Проверка каждого паттерна
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                let result = parseFloat(value);
                
                if (sign === '-' || cleanLine.includes('-')) {
                    result = -result;
                }
                
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
async function addTradeData(year, month, category, trades) {
    try {
        if (!data[year]) data[year] = {};
        if (!data[year][month]) data[year][month] = {};
        if (!data[year][month][category]) data[year][month][category] = { trades: [] };

        if (Array.isArray(trades)) {
            data[year][month][category].trades.push(...trades);
        } else {
            data[year][month][category].trades.push(trades);
        }
        
        return await saveData();
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

// Удаление сделки
async function deleteTradeData(year, month, category, index) {
    try {
        if (!data[year] || !data[year][month] || !data[year][month][category]) {
            return false;
        }

        const trades = data[year][month][category].trades;
        if (index >= 0 && index < trades.length) {
            trades.splice(index, 1);
            return await saveData();
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

// Периодическое обновление данных
setInterval(async () => {
    await loadData();
    if (typeof updateContent === 'function') {
        updateContent();
    }
}, 30000); // Обновление каждые 30 секунд
