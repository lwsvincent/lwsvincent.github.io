// QR Code 掃描器功能
class QRScanner {
    constructor() {
        if (typeof ZXing === 'undefined') {
            console.error('ZXing library not loaded');
            this.showMessage('❌ QR Code 掃描庫載入失敗，請重新整理頁面', 'error');
            return;
        }
        this.codeReader = new ZXing.BrowserQRCodeReader();
        this.scanning = false;
        this.stream = null;
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.result = document.getElementById('scanResult');
        this.scanCallback = null;
        this.scanControls = null;
    }

    async startScanning(callback) {
        if (this.scanning) return;
        
        if (!this.codeReader) {
            this.showMessage('❌ QR Code 掃描器未初始化，請重新整理頁面', 'error');
            return;
        }

        try {
            this.scanning = true;
            this.scanCallback = callback;

            // 顯示載入訊息
            this.showMessage('正在啟動攝像頭...', 'info');

            // 設定攝像頭約束，包含縮放功能
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // 優先後置攝像頭
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    zoom: true // 啟用縮放功能
                }
            };

            // 請求攝像頭權限
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // 等待視頻載入
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });

            // 檢查是否支援縮放
            this.setupZoomControls();

            // 開始掃描
            this.startDecoding();

            this.showMessage('攝像頭已啟動，請將 QR Code 對準攝像頭', 'success');

        } catch (error) {
            console.error('啟動掃描器失敗:', error);
            this.showMessage(`啟動掃描器失敗: ${error.message}`, 'error');
            this.scanning = false;
        }
    }    // 設定縮放控制
    setupZoomControls() {
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        if (capabilities.zoom) {
            this.addZoomControls(track, capabilities.zoom);
        }
    }

    // 添加縮放控制按鈕
    addZoomControls(track, zoomCapabilities) {
        if (this.scanControls) return; // 避免重複添加

        const scannerSection = this.video.closest('.scanner-section');
        if (!scannerSection) return;

        this.scanControls = document.createElement('div');
        this.scanControls.className = 'zoom-controls';
        this.scanControls.innerHTML = `
            <div class="zoom-control-group">
                <button id="zoomOut" class="btn btn-small">🔍-</button>
                <span id="zoomLevel">1x</span>
                <button id="zoomIn" class="btn btn-small">🔍+</button>
            </div>
        `;

        // 插入到掃描控制區域
        const scannerControls = scannerSection.querySelector('.scanner-controls');
        scannerControls.appendChild(this.scanControls);

        // 設定縮放事件
        let currentZoom = zoomCapabilities.min;
        const zoomStep = (zoomCapabilities.max - zoomCapabilities.min) / 10;

        document.getElementById('zoomIn').onclick = () => {
            currentZoom = Math.min(currentZoom + zoomStep, zoomCapabilities.max);
            track.applyConstraints({ advanced: [{ zoom: currentZoom }] });
            document.getElementById('zoomLevel').textContent = `${currentZoom.toFixed(1)}x`;
        };

        document.getElementById('zoomOut').onclick = () => {
            currentZoom = Math.max(currentZoom - zoomStep, zoomCapabilities.min);
            track.applyConstraints({ advanced: [{ zoom: currentZoom }] });
            document.getElementById('zoomLevel').textContent = `${currentZoom.toFixed(1)}x`;
        };
    }

    // 開始解碼
    startDecoding() {
        const decode = () => {
            if (!this.scanning) return;

            try {
                // 將視頻畫面繪製到 canvas
                const canvas = this.canvas;
                const video = this.video;

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // 嘗試從 canvas 解碼 QR Code
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        this.handleScanResult(code.data);
                        return; // 掃描成功，停止循環
                    }
                }
            } catch (error) {
                console.error('解碼錯誤:', error);
            }

            // 繼續掃描
            requestAnimationFrame(decode);
        };

        // 載入 jsQR 庫（如果還沒載入）
        if (typeof jsQR === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            script.onload = () => {
                decode();
            };
            document.head.appendChild(script);
        } else {
            decode();
        }
    }

    stopScanning() {
        if (!this.scanning) return;

        try {
            this.scanning = false;

            // 停止視頻流
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }

            // 清除視頻源
            if (this.video) {
                this.video.srcObject = null;
            }

            // 移除縮放控制
            if (this.scanControls) {
                this.scanControls.remove();
                this.scanControls = null;
            }

            this.showMessage('掃描已停止', 'info');
        } catch (error) {
            console.error('停止掃描器失敗:', error);
        }
    }

    handleScanResult(text) {
        this.showMessage(`🎉 掃描成功: ${text}`, 'success');

        // 停止掃描
        this.stopScanning();

        // 執行回調函數
        if (this.scanCallback && typeof this.scanCallback === 'function') {
            this.scanCallback(text);
        }
    }

    showMessage(message, type = 'info') {
        if (!message || message.trim() === '') {
            this.result.style.display = 'none';
            this.result.innerHTML = '';
        } else {
            this.result.style.display = 'block';
            this.result.innerHTML = `<div class="message ${type}">${message}</div>`;
        }
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
