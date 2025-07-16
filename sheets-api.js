// Google Sheets API 功能
class GoogleSheetsAPI {
    constructor() {
        this.spreadsheetId = null;
        this.worksheetName = 'Sheet1';
        this.connected = false;
        this.baseUrl = null;
    }

    // 連接到 Google Sheets
    async connect(sheetsUrl, worksheetName = 'Sheet1') {
        try {
            // 從分享連結中提取 spreadsheet ID
            const match = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

            if (!match) {
                throw new Error('無效的 Google Sheets URL');
            }

            this.spreadsheetId = match[1];
            this.worksheetName = worksheetName;

            // 構建 CSV 匯出 URL
            this.baseUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(this.worksheetName)}`;

            // 測試連接
            await this.testConnection();

            this.connected = true;
            this.showConnectionStatus('已成功連接到 Google Sheets', 'success');

            // 儲存設定到本地存儲
            localStorage.setItem('sheetsUrl', sheetsUrl);
            localStorage.setItem('worksheetName', worksheetName);

            return true;

        } catch (error) {
            console.error('連接失敗:', error);
            this.showConnectionStatus(`連接失敗: ${error.message}`, 'error');
            this.connected = false;
            return false;
        }
    }

    // 測試連接
    async testConnection() {
        try {
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 請確認試算表已設為公開檢視`);
            }

            const csvData = await response.text();

            if (!csvData || csvData.trim() === '') {
                throw new Error('試算表似乎是空的或無法讀取');
            }

            return true;

        } catch (error) {
            throw new Error(`無法讀取試算表: ${error.message}`);
        }
    }

    // 讀取資料
    async readData() {
        if (!this.connected) {
            throw new Error('尚未連接到 Google Sheets');
        }

        try {
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error(`讀取失敗: HTTP ${response.status}`);
            }

            const csvData = await response.text();
            return this.parseCSV(csvData);

        } catch (error) {
            console.error('讀取資料失敗:', error);
            throw error;
        }
    }

    // 解析 CSV 資料
    parseCSV(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }

        // 解析標題行
        const headers = this.parseCSVLine(lines[0]);

        // 解析資料行
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const row = this.parseCSVLine(lines[i]);
            if (row.length > 0) {
                rows.push(row);
            }
        }

        return { headers, rows };
    }

    // 解析 CSV 行
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result.map(item => item.replace(/^"|"$/g, ''));
    }

    // 寫入資料 (通過 Google Forms)
    async writeData(data) {
        // 由於無法直接寫入 Google Sheets，我們提供替代方案
        this.showWriteInstructions(data);
    }

    // 顯示寫入說明
    showWriteInstructions(data) {
        const instructions = `
            <div class="write-instructions">
                <h4>📝 請手動將以下資料添加到 Google Sheets:</h4>
                <div class="data-to-copy">
                    ${Object.entries(data).map(([key, value]) =>
            `<div><strong>${key}:</strong> ${value}</div>`
        ).join('')}
                </div>
                <p><small>💡 建議：您可以建立 Google Forms 來自動收集資料到試算表</small></p>
            </div>
        `;

        this.showMessage(instructions, 'info');
    }

    // 顯示連接狀態
    showConnectionStatus(message, type) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.innerHTML = `<div class="status ${type}">${message}</div>`;
        }
    }

    // 顯示訊息
    showMessage(message, type = 'info') {
        // 可以自定義顯示訊息的位置
        const messageContainer = document.getElementById('messageContainer') ||
            document.getElementById('connectionStatus');

        if (messageContainer) {
            messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
        }
    }

    // 載入儲存的設定
    loadSavedSettings() {
        const savedUrl = localStorage.getItem('sheetsUrl');
        const savedWorksheet = localStorage.getItem('worksheetName');

        if (savedUrl) {
            const urlInput = document.getElementById('sheetsUrl');
            if (urlInput) urlInput.value = savedUrl;
        }

        if (savedWorksheet) {
            const worksheetInput = document.getElementById('worksheetName');
            if (worksheetInput) worksheetInput.value = savedWorksheet;
        }

        return { savedUrl, savedWorksheet };
    }
}

// 全局變數
let sheetsAPI = null;

// 初始化 Google Sheets API
function initSheetsAPI() {
    if (!sheetsAPI) {
        sheetsAPI = new GoogleSheetsAPI();
    }
    return sheetsAPI;
}

// 連接到 Google Sheets
async function connectToSheets() {
    const api = initSheetsAPI();

    const urlInput = document.getElementById('sheetsUrl');
    const worksheetInput = document.getElementById('worksheetName');

    if (!urlInput || !worksheetInput) {
        alert('找不到輸入欄位');
        return false;
    }

    const sheetsUrl = urlInput.value.trim();
    const worksheetName = worksheetInput.value.trim() || 'Sheet1';

    if (!sheetsUrl) {
        alert('請輸入 Google Sheets URL');
        return false;
    }

    const success = await api.connect(sheetsUrl, worksheetName);
    return success;
}

// 讀取 Google Sheets 資料
async function readSheetsData() {
    const api = initSheetsAPI();

    if (!api.connected) {
        throw new Error('請先連接到 Google Sheets');
    }

    return await api.readData();
}

// 寫入資料到 Google Sheets
async function writeSheetsData(data) {
    const api = initSheetsAPI();

    if (!api.connected) {
        throw new Error('請先連接到 Google Sheets');
    }

    return await api.writeData(data);
}

// 頁面載入時自動載入設定
document.addEventListener('DOMContentLoaded', function () {
    const api = initSheetsAPI();
    const { savedUrl, savedWorksheet } = api.loadSavedSettings();

    // 如果有儲存的設定，自動嘗試連接
    if (savedUrl && savedWorksheet) {
        setTimeout(() => {
            connectToSheets();
        }, 1000);
    }
});
