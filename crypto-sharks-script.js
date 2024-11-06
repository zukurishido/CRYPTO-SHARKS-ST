// Trading Data
const tradingData = {
  futures: [
    { symbol: 'BLZ', percentage: 48.26, status: 'profit' },
    { symbol: 'TIA', percentage: -20, status: 'loss' },
    { symbol: 'ATOM', percentage: 0, status: 'neutral' }
  ],
  spot: [
    { symbol: 'ETH', percentage: 6, status: 'profit' },
    { symbol: 'MEW', percentage: 120, status: 'profit' },
    { symbol: 'FLOKI', percentage: 20, status: 'profit' },
    { symbol: 'SOL', percentage: 10, status: 'profit' },
    { symbol: 'ZRO', percentage: 10, status: 'profit' },
    { symbol: 'APT', percentage: 15, status: 'profit' },
    { symbol: 'INJ', percentage: 20, status: 'profit' },
    { symbol: 'BONK', percentage: 8, status: 'profit' },
    { symbol: 'TURBO', percentage: 80, status: 'profit' },
    { symbol: '1MBABYDOGE', percentage: 40, status: 'profit' },
    { symbol: 'TIA', percentage: 10, status: 'profit' },
    { symbol: 'PEPE', percentage: 15, status: 'profit' },
    { symbol: 'DOGE', percentage: 24, status: 'profit' },
    { symbol: 'WIF', percentage: 5, status: 'profit' },
    { symbol: 'NEIROCTO', percentage: 15, status: 'profit' },
    { symbol: 'MAVIA', percentage: 0, status: 'neutral' },
    { symbol: 'SUI', percentage: 0, status: 'neutral' }
  ],
  defi: [
    { symbol: 'EGGY', percentage: 51, status: 'profit' },
    { symbol: 'PINKE', percentage: 800, status: 'profit' },
    { symbol: 'OR', percentage: 25, status: 'profit' },
    { symbol: 'BGG', percentage: 150, status: 'profit' },
    { symbol: 'PHOENIX', percentage: 20, status: 'profit' },
    { symbol: 'MANTIS', percentage: 56, status: 'profit' },
    { symbol: 'DBTT', percentage: 150, status: 'profit' },
    { symbol: 'BELUGA', percentage: 100, status: 'profit' },
    { symbol: 'NIKICOIN', percentage: 100, status: 'profit' },
    { symbol: 'KLAUS', percentage: 72, status: 'profit' },
    { symbol: 'ENERGY', percentage: 50, status: 'profit' },
    { symbol: 'FLIP', percentage: 50, status: 'profit' },
    { symbol: 'MAVA', percentage: -40, status: 'loss' },
    { symbol: 'MORUD', percentage: 70, status: 'profit' },
    { symbol: 'VIKITA', percentage: 54, status: 'profit' },
    { symbol: 'REALCHAD', percentage: 800, status: 'profit' },
    { symbol: 'DOBBY', percentage: 40, status: 'profit' },
    { symbol: 'PUMPKING', percentage: 120, status: 'profit' },
    { symbol: 'TNUT', percentage: 66, status: 'profit' }
  ]
};

// Interactive Effects
document.querySelectorAll('.trading-column').forEach(column => {
  // Mouse move effect
  column.addEventListener('mousemove', e => {
    const rect = column.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    column.style.setProperty('--mouse-x', `${x}px`);
    column.style.setProperty('--mouse-y', `${y}px`);
  });

  // Click handler
  column.addEventListener('click', function() {
    // Remove active class from all columns
    document.querySelectorAll('.trading-column').forEach(col => {
      col.classList.remove('active');
    });
    
    // Add active class to clicked column
    this.classList.add('active');
    
    // Get column type
    const type = this.dataset.type;
    
    // Clear existing trades
    const tradesList = this.querySelector('.trades-list');
    tradesList.innerHTML = '';
    
    // Add trades with animation
    tradingData[type].forEach((trade, index) => {
      setTimeout(() => {
        const tradeEl = createTradeElement(trade);
        tradesList.appendChild(tradeEl);
        
        // Trigger animations
        setTimeout(() => {
          tradeEl.classList.add('show');
          const progressFill = tradeEl.querySelector('.progress-fill');
          progressFill.style.width = `${Math.abs(trade.percentage)}%`;
        }, 50);
      }, index * 100);
    });
  });
});

// Create trade element
function createTradeElement(trade) {
  const tradeEl = document.createElement('div');
  tradeEl.className = 'trade-item';
  
  const color = trade.status === 'profit' ? 'var(--primary)' : 
                trade.status === 'loss' ? '#ff4444' : '#ffaa00';
  
  tradeEl.innerHTML = `
    <div class="trade-info">
      <span class="symbol">#${trade.symbol}</span>
      <span class="percentage" style="color: ${color}">
        ${trade.percentage > 0 ? '+' : ''}${trade.percentage}%
      </span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="background: ${color}"></div>
    </div>
  `;
  
  return tradeEl;
}

// Initialize first column
document.querySelector('.trading-column').click();

// Add particle background
particlesJS('particles-js', {
  particles: {
    number: { value: 80 },
    color: { value: '#00ff88' },
    shape: { type: 'circle' },
    opacity: { value: 0.5 },
    size: { value: 3 },
    move: {
      enable: true,
      speed: 2,
      direction: 'none',
      random: true
    }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: 'repulse' },
      onclick: { enable: true, mode: 'push' }
    }
  }
});
