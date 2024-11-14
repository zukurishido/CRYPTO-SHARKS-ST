// Сервис для работы с хранилищем
class StorageService {
    static STORAGE_KEY = 'cryptoSharksData';
    static API_CONFIG = {
        baseUrl: 'https://api.jsonbin.io/v3/b',
        binId: '673607eeacd3cb34a8a8912b',
        key: '$2a$10$ZyhJn3sHuiHpDJCn.I0B9.ynZDnNdcqrb3JuhEw9eEWvF4ADsoigi',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': '$2a$10$ZyhJn3sHuiHpDJCn.I0B9.ynZDnNdcqrb3JuhEw9eEWvF4ADsoigi'
        }
    };

    // Инициализация хранилища
    static async init() {
        try {
            // Попытка загрузки из JSONBin
            const binData = await this.loadFromApi();
            if (binData) {
                await this.saveToLocal(binData);
                return;
            }

            // Если нет данных в API, проверяем локальное хранилище
            const localData = this.loadFromLocal();
            if (localData) {
                await this.saveToApi(localData);
            }
        } catch (error) {
            console.error('Ошибка инициализации хранилища:', error);
            throw new Error('Не удалось инициализировать хранилище');
        }
    }

    // Загрузка данных из API
    static async loadFromApi() {
        try {
            const response = await fetch(
                `${this.API_CONFIG.baseUrl}/${this.API_CONFIG.binId}/latest`,
                {
                    headers: this.API_CONFIG.headers
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.record;
        } catch (error) {
            console.error('Ошибка загрузки из API:', error);
            return null;
        }
    }

    // Сохранение данных в API
    static async saveToApi(data) {
        try {
            const response = await fetch(
                `${this.API_CONFIG.baseUrl}/${this.API_CONFIG.binId}`,
                {
                    method: 'PUT',
                    headers: this.API_CONFIG.headers,
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Ошибка сохранения в API:', error);
            throw error;
        }
    }

    // Загрузка из локального хранилища
    static loadFromLocal() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return null;
        }
    }

    // Сохранение в локальное хранилище
    static async saveToLocal(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            throw error;
        }
    }

    // Получение данных
    static async getData() {
        try {
            const localData = this.loadFromLocal();
            if (!localData) {
                const apiData = await this.loadFromApi();
                if (apiData) {
                    await this.saveToLocal(apiData);
                    return apiData;
                }
            }
            return localData;
        } catch (error) {
            console.error('Ошибка получения данных:', error);
            throw error;
        }
    }

    // Сохранение данных
    static async saveData(data) {
        try {
            await Promise.all([
                this.saveToLocal(data),
                this.saveToApi(data)
            ]);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            throw error;
        }
    }

    // Синхронизация данных
    static async sync() {
        try {
            const apiData = await this.loadFromApi();
            if (apiData) {
                await this.saveToLocal(apiData);
                return apiData;
            }
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            throw error;
        }
    }

    // Запуск автоматической синхронизации
    static startAutoSync(interval = 30000) {
        setInterval(async () => {
            try {
                await this.sync();
                if (window.app) {
                    await window.app.updateContent();
                }
            } catch (error) {
                console.error('Ошибка автосинхронизации:', error);
            }
        }, interval);
    }
}

// Экспорт сервиса
window.StorageService = StorageService;
