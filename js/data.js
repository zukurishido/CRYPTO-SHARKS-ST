// Парсинг сделок с поддержкой различных форматов
function parseTrades(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = '';
    let trades = [];
    
    lines.forEach(line => {
        // Очищаем строку от лишних символов
        const cleanLine = line.trim().replace(/["""'']/g, '');

        // Определение категории (нечувствительно к регистру и доп. символам)
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
            /(\w+)([-+])(\d+\.?\d*)%\s*(?:\((\d+)x\)?)?/i
        ];

        // Проверяем каждый паттерн
        let matched = false;
        for (const pattern of patterns) {
            const match = cleanLine.match(pattern);
            if (match && currentCategory) {
                const [_, symbol, sign, value, leverage] = match;
                const result = (sign === '+' ? 1 : -1) * parseFloat(value);
                
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
        if (!matched && currentCategory) {
            // Формат "пара результат": BTC 50% или BTC 30%
            const simpleMatch = cleanLine.match(/(\w+)\s+(\d+\.?\d*)%/i);
            if (simpleMatch) {
                const [_, symbol, value] = simpleMatch;
                trades.push({
                    id: Date.now() + Math.random(),
                    pair: symbol.replace(/[^A-Za-z0-9]/g, ''),
                    result: parseFloat(value),
                    leverage: '',
                    status: parseFloat(value) > 0 ? 'profit' : 'loss',
                    category: currentCategory,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });

    return trades;
}

// Тестирование парсинга различных форматов
function testParsing(text) {
    const trades = parseTrades(text);
    console.log('Распознанные сделки:', trades);
    return trades.length > 0;
}

// Примеры форматов, которые теперь распознаются:
/*
DEFI:
#BTC +50%
BTC -30%
1. ETH +25%
2) SOL -15%
BTC - +40%
ETH . -20%
DOT+35%
AVAX-25%
BNB 45%

FUTURES:
#BTC +50% (10x)
BTC -30% (5x)
1. ETH +25% (3x)
2) SOL -15% (2x)

SPOT:
#BTC +50%
BTC -30%
*/
