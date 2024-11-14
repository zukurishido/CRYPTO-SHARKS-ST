// Класс управления админ-панелью 
class AdminPanel {
   constructor() {
       this.isAuthenticated = false;
       this.isVisible = false;
       this.currentMode = 'bulk';
       
       // Кэширование DOM элементов
       this.elements = {
           panel: document.getElementById('adminPanel'),
           button: document.getElementById('adminButton'),
           closeBtn: document.getElementById('closeAdmin'),
           form: document.querySelector('.admin-form')
       };

       // Привязка методов
       this.togglePanel = this.togglePanel.bind(this);
       this.handleAuth = this.handleAuth.bind(this);
       this.handleModeSwitch = this.handleModeSwitch.bind(this);
       this.processBulkTrades = this.processBulkTrades.bind(this);
       this.processSingleTrade = this.processSingleTrade.bind(this);
   }

   // Инициализация
   init() {
       this.setupEventListeners();
       this.checkAuthState();
   }

   // Настройка слушателей событий
   setupEventListeners() {
       this.elements.button.addEventListener('click', () => {
           if (!this.isAuthenticated) {
               this.showLoginForm();
           } else {
               this.togglePanel();
           }
       });

       this.elements.closeBtn.addEventListener('click', this.togglePanel);

       // Закрытие по Escape
       document.addEventListener('keydown', (e) => {
           if (e.key === 'Escape' && this.isVisible) {
               this.togglePanel();
           }
       });

       // Закрытие по клику вне панели
       document.addEventListener('click', (e) => {
           if (this.isVisible && 
               !this.elements.panel.contains(e.target) && 
               e.target !== this.elements.button) {
               this.togglePanel();
           }
       });
   }

   // Проверка состояния авторизации
   checkAuthState() {
       const token = localStorage.getItem('adminToken');
       if (token) {
           // В реальном приложении здесь должна быть проверка токена
           this.isAuthenticated = true;
       }
   }

   // Показ формы входа
   showLoginForm() {
       this.elements.form.innerHTML = `
           <div class="input-group">
               <input type="password" 
                      id="passwordInput" 
                      placeholder="Введите пароль" 
                      class="admin-input"
                      autocomplete="current-password">
               <button onclick="adminPanel.handleAuth()" class="add-btn">
                   Войти
               </button>
           </div>
       `;
       
       const input = document.getElementById('passwordInput');
       input.addEventListener('keypress', (e) => {
           if (e.key === 'Enter') this.handleAuth();
       });
       
       this.togglePanel();
   }

   // Обработка авторизации
   async handleAuth() {
       const passwordInput = document.getElementById('passwordInput');
       const password = passwordInput.value;
       
       try {
           const validHash = "Q3I1cHQwU2hAcmtzMjAyNCNBZG1pblBAb" + "mVs";
           
           if (btoa(password) === validHash) {
               this.isAuthenticated = true;
               localStorage.setItem('adminToken', validHash);
               
               NotificationService.show('Успешный вход', 'success');
               this.showBulkInput();
           } else {
               NotificationService.show('Неверный пароль', 'error');
               passwordInput.value = '';
           }
       } catch (error) {
           console.error('Ошибка авторизации:', error);
           NotificationService.show('Ошибка авторизации', 'error');
       }
   }

   // Переключение панели
   togglePanel() {
       this.isVisible = !this.isVisible;
       this.elements.panel.classList.toggle('visible');
   }

   // Показ формы массового ввода
   showBulkInput() {
       if (!this.checkAuth()) return;

       this.currentMode = 'bulk';
       this.elements.form.innerHTML = `
           <div class="mode-switcher">
               <button onclick="adminPanel.handleModeSwitch('bulk')" 
                       class="mode-btn active">
                   Массовое добавление
               </button>
               <button onclick="adminPanel.handleModeSwitch('single')" 
                       class="mode-btn">
                   Одиночное добавление
               </button>
               <button onclick="adminPanel.handleModeSwitch('manage')" 
                       class="mode-btn">
                   Управление сделками
               </button>
           </div>

           <div class="input-group">
               <label>Массовое добавление сделок</label>
               <textarea id="bulkInput" 
                         class="admin-textarea"
                         placeholder="Формат ввода:

SPOT:
BTC +55%
ETH -12%

FUTURES:
BNB +35% (5x)
DOGE -15% (10x)

DeFi:
UNI +25%
AAVE -18%"></textarea>
               <button onclick="adminPanel.processBulkTrades()" 
                       class="add-btn">
                   Добавить сделки
               </button>
           </div>
       `;
   }

   // Показ формы одиночного ввода
   showSingleInput() {
       if (!this.checkAuth()) return;

       this.currentMode = 'single';
       this.elements.form.innerHTML = `
           <div class="mode-switcher">
               <button onclick="adminPanel.handleModeSwitch('bulk')" 
                       class="mode-btn">
                   Массовое добавление
               </button>
               <button onclick="adminPanel.handleModeSwitch('single')" 
                       class="mode-btn active">
                   Одиночное добавление
               </button>
               <button onclick="adminPanel.handleModeSwitch('manage')" 
                       class="mode-btn">
                   Управление сделками
               </button>
           </div>

           <div class="input-group">
               <label>Пара</label>
               <input type="text" 
                      id="pairInput" 
                      class="admin-input"
                      placeholder="Например: BTC">
           </div>
           <div class="input-group">
               <label>Результат (%)</label>
               <input type="number" 
                      id="resultInput" 
                      class="admin-input"
                      step="0.01" 
                      placeholder="Например: 55 или -12">
           </div>
           <div class="input-group">
               <label>Кратность (для FUTURES)</label>
               <input type="text" 
                      id="leverageInput" 
                      class="admin-input"
                      placeholder="Например: 20x">
           </div>
           <button onclick="adminPanel.processSingleTrade()" 
                   class="add-btn">
               Добавить сделку
           </button>
       `;
   }

   // Показ списка сделок
   async showTradesList() {
       if (!this.checkAuth()) return;

       this.currentMode = 'manage';
       
       const year = document.getElementById('yearSelect').value;
       const month = document.getElementById('monthSelect').value;
       const category = document.getElementById('categorySelect').value;
       
       try {
           const trades = await dataService.getPeriodData(year, month, category);
           
           let html = `
               <div class="mode-switcher">
                   <button onclick="adminPanel.handleModeSwitch('bulk')" 
                           class="mode-btn">
                       Массовое добавление
                   </button>
                   <button onclick="adminPanel.handleModeSwitch('single')" 
                           class="mode-btn">
                       Одиночное добавление
                   </button>
                   <button onclick="adminPanel.handleModeSwitch('manage')" 
                           class="mode-btn active">
                       Управление сделками
                   </button>
               </div>
               
               <div class="current-period">
                   Период: ${month} ${year}, ${category}
               </div>
           `;

           html += '<div class="trades-list">';
           
           if (trades.length === 0) {
               html += `
                   <p class="text-center text-gray-500">
                       Нет сделок за выбранный период
                   </p>
               `;
           } else {
               trades.forEach((trade, index) => {
                   const resultColor = trade.result > 0 ? '#00ff9d' : '#ff4444';
                   const resultText = `${trade.result > 0 ? '+' : ''}${trade.result}%${
                       trade.leverage ? ` (${trade.leverage})` : ''
                   }`;
                   
                   html += `
                       <div class="trade-item fade-in">
                           <div class="trade-content">
                               <span style="color: ${resultColor}">
                                   #${trade.pair} ${resultText}
                               </span>
                           </div>
                           <button onclick="adminPanel.confirmDelete(
                               '${year}', 
                               '${month}', 
                               '${category}', 
                               ${index}
                           )" class="delete-btn">
                               Удалить
                           </button>
                       </div>
                   `;
               });
           }
           
           html += '</div>';
           this.elements.form.innerHTML = html;

       } catch (error) {
           console.error('Ошибка загрузки сделок:', error);
           NotificationService.show('Ошибка при загрузке сделок', 'error');
       }
   }

   // Обработка переключения режимов
   handleModeSwitch(mode) {
       if (!this.checkAuth()) return;

       switch (mode) {
           case 'bulk':
               this.showBulkInput();
               break;
           case 'single':
               this.showSingleInput();
               break;
           case 'manage':
               this.showTradesList();
               break;
       }
   }

   // Обработка массового добавления сделок
   async processBulkTrades() {
       if (!this.checkAuth()) return;

       const textArea = document.getElementById('bulkInput');
       const text = textArea.value.trim();

       if (!text) {
           NotificationService.show('Введите данные', 'error');
           return;
       }

       try {
           const trades = dataService.parseTrades(text);
           
           if (trades.length === 0) {
               NotificationService.show('Не удалось распознать сделки', 'error');
               return;
           }

           const year = document.getElementById('yearSelect').value;
           const month = document.getElementById('monthSelect').value;
           const category = document.getElementById('categorySelect').value;

           await dataService.addTrades(year, month, category, trades);
           
           textArea.value = '';
           NotificationService.show(`Добавлено ${trades.length} сделок`, 'success');
           
           if (window.app) {
               await window.app.updateContent();
           }

       } catch (error) {
           console.error('Ошибка добавления сделок:', error);
           NotificationService.show('Ошибка при добавлении сделок', 'error');
       }
   }

   // Обработка одиночного добавления
   async processSingleTrade() {
       if (!this.checkAuth()) return;

       const pair = document.getElementById('pairInput').value.trim();
       const result = parseFloat(document.getElementById('resultInput').value);
       const leverage = document.getElementById('leverageInput').value.trim();

       if (!pair || isNaN(result)) {
           NotificationService.show('Заполните обязательные поля', 'error');
           return;
       }

       try {
           const trade = {
               pair: pair.toUpperCase(),
               result: result,
               leverage: leverage || '',
               status: result > 0 ? 'profit' : 'loss',
               timestamp: new Date().toISOString()
           };

           const year = document.getElementById('yearSelect').value;
           const month = document.getElementById('monthSelect').value;
           const category = document.getElementById('categorySelect').value;

           await dataService.addTrades(year, month, category, trade);

           // Очистка полей
           document.getElementById('pairInput').value = '';
           document.getElementById('resultInput').value = '';
           document.getElementById('leverageInput').value = '';
           
           NotificationService.show('Сделка добавлена', 'success');
           
           if (window.app) {
               await window.app.updateContent();
           }

       } catch (error) {
           console.error('Ошибка добавления сделки:', error);
           NotificationService.show('Ошибка при добавлении сделки', 'error');
       }
   }

   // Подтверждение удаления сделки
   async confirmDelete(year, month, category, index) {
       if (!this.checkAuth()) return;

       if (await this.showConfirmDialog('Удалить эту сделку?')) {
           try {
               await dataService.deleteTrade(year, month, category, index);
               NotificationService.show('Сделка удалена', 'success');
               await this.showTradesList();
               
               if (window.app) {
                   await window.app.updateContent();
               }
           } catch (error) {
               console.error('Ошибка удаления:', error);
               NotificationService.show('Ошибка при удалении', 'error');
           }
       }
   }

   // Диалог подтверждения
   showConfirmDialog(message) {
       return new Promise(resolve => {
           const dialog = document.createElement('div');
           dialog.className = 'confirm-dialog fade-in';
           dialog.innerHTML = `
               <div class="confirm-content">
                   <p>${message}</p>
                   <div class="confirm-actions">
                       <button class="btn-cancel">Отмена</button>
                       <button class="btn-confirm">Подтвердить</button>
                   </div>
               </div>
           `;

           const close = (result) => {
               dialog.classList.add('fade-out');
               setTimeout(() => dialog.remove(), 300);
               resolve(result);
           };

           dialog.querySelector('.btn-cancel').onclick = () => close(false);
           dialog.querySelector('.btn-confirm').onclick = () => close(true);

           document.body.appendChild(dialog);
       });
   }

   // Проверка авторизации
   checkAuth() {
       if (!this.isAuthenticated) {
           NotificationService.show('Требуется авторизация', 'error');
           this.showLoginForm();
           return false;
       }
       return true;
   }

   // Выход из админ-панели
   logout() {
       this.isAuthenticated = false;
       localStorage.removeItem('adminToken');
       this.togglePanel();
       NotificationService.show('Вы вышли из системы', 'success');
   }
}

// Сервис уведомлений
class NotificationService {
   static show(message, type = 'success', duration = 3000) {
       const notification = document.createElement('div');
       notification.className = `notification ${type} fade-in`;
       notification.textContent = message;

       const container = document.querySelector('.notifications-container') || 
           this.createContainer();

       container.appendChild(notification);

       setTimeout(() => {
           notification.classList.add('fade-out');
           setTimeout(() => notification.remove(), 300);
       }, duration);
   }

   static createContainer() {
       const container = document.createElement('div');
       container.className = 'notifications-container';
       document.body.appendChild(container);
       return container;
   }
}

// Создание экземпляра админ-панели
const adminPanel = new AdminPanel();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => adminPanel.init());

// Экспорт для использования в других модулях
window.adminPanel = adminPanel;
window.NotificationService = NotificationService;
