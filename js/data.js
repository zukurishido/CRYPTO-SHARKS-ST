import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Константы
export const YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
export const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
export const CATEGORIES = ['SPOT', 'FUTURES', 'DeFi'];

// Загрузка данных из Firestore
export async function loadData(year, month, category) {
    try {
        const tradesRef = collection(window.db, 'trades');
        const q = query(
            tradesRef,
            where('year', '==', year),
            where('month', '==', month),
            where('category', '==', category),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return [];
    }
}

// Сохранение данных в Firestore
export async function saveData(year, month, category, trades) {
    try {
        const batch = window.db.batch();
        
        trades.forEach(trade => {
            const tradeRef = doc(collection(window.db, 'trades'));
            batch.set(tradeRef, {
                ...trade,
                year,
                month,
                category,
                timestamp: new Date().toISOString()
            });
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

// Добавление сделок
export async function addTradeData(year, month, category, trades) {
    try {
        if (Array.isArray(trades)) {
            return await saveData(year, month, category, trades);
        } else {
            return await saveData(year, month, category, [trades]);
        }
    } catch (error) {
        console.error('Ошибка добавления:', error);
        return false;
    }
}

// Удаление сделки
export async function deleteTradeData(tradeId) {
    try {
        await deleteDoc(doc(window.db, 'trades', tradeId));
        return true;
    } catch (error) {
        console.error('Ошибка удаления:', error);
        return false;
    }
}

// Расчет статистики
export function calculateStats(trades) {
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

// Парсер сделок
export function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        const cleanLine = line.trim().replace(/["""'']/g, '');

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

        const patterns = [
            /[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(?:\d+[\.)]\s*)[#]?(\w+)\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s*[-\.]\s*([-+])\s*(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i,
            /(\w+)\s+(\d+\.?\d*)%/i,
            /[#]?(\w+)\s*([+-])?(\d+\.?\d*)%\s*(?:\((\d+)[xх]\)?)?/i
        ];

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
