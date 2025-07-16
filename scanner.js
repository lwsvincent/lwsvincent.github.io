// QR Code 掃描器功能
class QRScanner {
    constructor() {
        this.codeReader = new ZXing.BrowserQRCodeReader();
        this.scanning = false;
        this.stream = null;
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.result = document.getElementById('scanResult');
    }

    async startScanning(callback) {
        if (this.scanning) return;

        try {
            this.scanning = true;

            // 請求攝像頭權限
            const devices = await this.codeReader.getVideoInputDevices();

            if (devices.length === 0) {
                throw new Error('沒有找到攝像頭設備');
            }

            // 優先使用後置攝像頭
            let selectedDevice = devices[0];
            for (const device of devices) {
                if (device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('environment')) {
                    selectedDevice = device;
                    break;
                }
            }

            this.showMessage('正在啟動攝像頭...', 'info');

            // 開始掃描
            this.codeReader.decodeFromVideoDevice(
                selectedDevice.deviceId,
                this.video,
                (result, err) => {
                    if (result) {
                        this.handleScanResult(result.text, callback);
                    }
                }
            );

            this.showMessage('攝像頭已啟動，請將 QR Code 對準攝像頭', 'success');

        } catch (error) {
            console.error('啟動掃描器失敗:', error);
            this.showMessage(`啟動掃描器失敗: ${error.message}`, 'error');
            this.scanning = false;
        }
    }

    stopScanning() {
        if (!this.scanning) return;

        try {
            this.codeReader.reset();
            this.scanning = false;
            this.showMessage('掃描已停止', 'info');
        } catch (error) {
            console.error('停止掃描器失敗:', error);
        }
    }

    handleScanResult(text, callback) {
        this.showMessage(`掃描成功: ${text}`, 'success');

        // 停止掃描
        this.stopScanning();

        // 執行回調函數
        if (callback && typeof callback === 'function') {
            callback(text);
        }
    }

    showMessage(message, type = 'info') {
        this.result.innerHTML = `<div class="message ${type}">${message}</div>`;
    }

    // 解析財產編號
    parseAssetCode(code) {
        // 從 URL 中提取 data 參數
        let dataValue = code;

        if (code.includes('data=')) {
            const urlParams = new URLSearchParams(code.split('?')[1]);
            dataValue = urlParams.get('data');
        }

        if (!dataValue) {
            throw new Error('無法從 QR Code 中提取資料');
        }

        // 解析格式: 1000-{序號}-{子序號}{識別碼}
        const parts = dataValue.split('-');

        if (parts.length !== 3) {
            throw new Error('QR Code 格式不正確，應為: 1000-序號-子序號識別碼');
        }

        const prefix = parts[0]; // 1000
        const serialNumber = parts[1]; // F007485
        const subSerialAndId = parts[2]; // 00008

        // 假設子序號是前5位，識別碼是後面的部分
        const subSerial = subSerialAndId.substring(0, 5);
        const identifier = subSerialAndId.substring(5);

        return {
            prefix,
            serialNumber,
            subSerial,
            identifier,
            fullCode: dataValue,
            key: `${serialNumber}-${subSerial}` // 重要的唯一識別
        };
    }
}

// 全局變數
let qrScanner = null;

// 初始化掃描器
function initScanner() {
    if (!qrScanner) {
        qrScanner = new QRScanner();
    }
}

// 開始掃描
function startScanner() {
    initScanner();

    const callback = window.currentScanCallback || function (result) {
        console.log('掃描結果:', result);
    };

    qrScanner.startScanning(callback);
}

// 停止掃描
function stopScanner() {
    if (qrScanner) {
        qrScanner.stopScanning();
    }
}

// 檢查瀏覽器支援
function checkBrowserSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的瀏覽器不支援攝像頭功能，請使用較新版本的 Chrome 或 Safari');
        return false;
    }
    return true;
}

// 頁面載入時檢查支援
document.addEventListener('DOMContentLoaded', function () {
    checkBrowserSupport();
});
