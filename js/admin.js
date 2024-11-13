function showTradesList() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    const category = document.getElementById('categorySelect').value;
    
    const trades = getPeriodData(year, month, category);
    let html = '<div class="trades-list">';
    
    if (trades.length === 0) {
        html += '<p class="text-center text-gray-500">Нет сделок за выбранный период</p>';
    } else {
        trades.forEach((trade) => {
            html += `
                <div class="trade-item fade-in">
                    <div class="trade-content">
                        <span class="trade-pair ${trade.result > 0 ? 'profit' : 'loss'}">
                            #${trade.pair} ${trade.result > 0 ? '+' : ''}${trade.result}%
                            ${trade.leverage ? ` (${trade.leverage})` : ''}
                        </span>
                    </div>
                    <button 
                        onclick="confirmAndDelete('${trade.id}')" 
                        class="delete-btn"
                    >
                        Удалить
                    </button>
                </div>
            `;
        });
    }
    
    html += '</div>';
    document.querySelector('.admin-form').innerHTML = html;
    updateModeBtns('manage');
}

function confirmAndDelete(tradeId) {
    if (confirm('Удалить эту сделку?')) {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        const category = document.getElementById('categorySelect').value;

        if (deleteTradeData(year, month, category, tradeId)) {
            showNotification('Сделка удалена', 'success');
            showTradesList();
            updateContent();
        } else {
            showNotification('Ошибка при удалении', 'error');
        }
    }
}
