// Обновляем функцию showBulkInput()
function showBulkInput() {
    // Обновляем активные кнопки
    updateActiveButton('bulk');
    
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group fade-in">
            <label>Массовое добавление сделок</label>
            <textarea id="bulkInput" rows="15" placeholder="Вставьте список сделок в любом формате:
BTC +50%
ETH -20%
SOL +30
AVAX +15.5%"></textarea>
            <button onclick="parseBulkTrades()" class="add-btn">
                Добавить все сделки
            </button>
        </div>
    `;
}

// Обновляем функцию showRegularForm()
function showRegularForm() {
    // Обновляем активные кнопки
    updateActiveButton('single');
    
    document.querySelector('.admin-form').innerHTML = `
        <div class="input-group">
            <label>Пара</label>
            <input type="text" id="singlePair" placeholder="Например: BTC">
        </div>
        <div class="input-group">
            <label>Результат</label>
            <div class="result-input-group">
                <input type="number" id="singleResult" step="0.1" placeholder="50">
                <span class="result-symbol">%</span>
            </div>
        </div>
        <div class="input-group">
            <label>Статус</label>
            <select id="singleStatus">
                <option value="profit">Прибыль</option>
                <option value="loss">Убыток</option>
                <option value="neutral">В работе</option>
            </select>
        </div>
        <div class="input-group">
            <label>Комментарий (необязательно)</label>
            <input type="text" id="singleComment">
        </div>
        <button onclick="addSingleTrade()" class="add-btn">Добавить сделку</button>
    `;
}

// Обновляем функцию showTradesList()
function showTradesList() {
    // Обновляем активные кнопки
    updateActiveButton('manage');
    
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getTradeData(year, month, category) || [];
    
    let html = `
        <div class="trade-management fade-in">
            <h3>Управление сделками</h3>
            <div class="trades-list">
    `;
    
    if (trades.length === 0) {
        html += `
            <div class="trade-item neutral">
                <span>Нет сделок для отображения</span>
            </div>
        `;
    } else {
        trades.forEach((trade, index) => {
            html += `
                <div class="trade-item ${trade.status}">
                    <span class="trade-pair">${trade.pair}</span>
                    <span class="trade-result">${trade.result > 0 ? '+' : ''}${trade.result}%</span>
                    <div class="trade-actions">
                        <button onclick="editTrade(${index})" class="edit-btn">✏️</button>
                        <button onclick="deleteTrade(${index})" class="delete-btn">❌</button>
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
    `;
    
    document.querySelector('.admin-form').innerHTML = html;
}

// Добавляем новую функцию для обновления активных кнопок
function updateActiveButton(mode) {
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    switch(mode) {
        case 'bulk':
            document.querySelector('.mode-btn:nth-child(1)').classList.add('active');
            break;
        case 'single':
            document.querySelector('.mode-btn:nth-child(2)').classList.add('active');
            break;
        case 'manage':
            document.querySelector('.mode-btn:nth-child(3)').classList.add('active');
            break;
    }
}

// Обновляем инициализацию
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPassword();
    
    // Добавляем обработчики для кнопок режимов
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            updateActiveButton(mode);
        });
    });
});
