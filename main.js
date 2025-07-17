// 財產盤點主頁面功能

// 當前處理的資產
let currentAsset = null;

// 設定掃描回調
window.currentScanCallback = function (result) {
    console.log('掃描回調被調用:', result);

    try {
        // 解析 QR Code
        const assetData = qrScanner.parseAssetCode(result);

        // 顯示解析結果
        document.getElementById('serialNumber').value = assetData.serialNumber;
        document.getElementById('subSerial').value = assetData.subSerial;

        // 設定當前資產
        currentAsset = assetData;

        // 顯示編輯區域
        document.getElementById('editSection').style.display = 'block';

        // 嘗試載入現有資料
        loadExistingAssetData(assetData.key);

        // 顯示成功訊息
        showMessage(`✅ 已識別資產: ${assetData.key}`, 'success');

    } catch (error) {
        console.error('解析 QR Code 失敗:', error);
        showMessage(`❌ 解析失敗: ${error.message}`, 'error');
    }
};

// 手動處理財產編號
function processAssetCode() {
    const input = document.getElementById('assetCode');
    const code = input.value.trim();

    if (!code) {
        alert('請輸入財產編號');
        return;
    }

    // 使用掃描回調處理
    window.currentScanCallback(code);
}

// 載入現有資產資料
async function loadExistingAssetData(assetKey) {
    try {
        if (!sheetsAPI || !sheetsAPI.connected) {
            console.log('Google Sheets 未連接，跳過載入現有資料');
            return;
        }

        const data = await readSheetsData();

        // 查找對應的資產
        const assetRow = data.rows.find(row => {
            // 假設第一欄是序號，第二欄是子序號，或者有組合欄位
            const rowKey = `${row[0]}-${row[1]}`;
            return rowKey === assetKey;
        });

        if (assetRow && data.headers) {
            // 填入現有資料
            fillAssetForm(data.headers, assetRow);
            showMessage('✅ 已載入現有資產資料', 'success');
        } else {
            showMessage('ℹ️ 這是新資產，請填入資料', 'info');
        }

    } catch (error) {
        console.error('載入現有資料失敗:', error);
        showMessage('⚠️ 載入現有資料失敗，請手動填入', 'warning');
    }
}

// 填入資產表單
function fillAssetForm(headers, rowData) {
    const fieldMapping = {
        '資產名稱': 'assetName',
        '分類': 'category',
        '部門': 'department',
        '位置': 'location',
        '狀態': 'condition',
        '備註': 'notes'
    };

    headers.forEach((header, index) => {
        const fieldId = fieldMapping[header];
        if (fieldId && rowData[index]) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = rowData[index];
            }
        }
    });
}

// 儲存資產
async function saveAsset() {
    if (!currentAsset) {
        alert('請先掃描或輸入財產編號');
        return;
    }

    try {
        // 收集表單資料
        const assetData = {
            '日期時間': new Date().toLocaleString('zh-TW'),
            '序號': currentAsset.serialNumber,
            '子序號': currentAsset.subSerial,
            '完整編號': currentAsset.fullCode,
            '資產名稱': document.getElementById('assetName').value,
            '分類': document.getElementById('category').value,
            '部門': document.getElementById('department').value,
            '位置': document.getElementById('location').value,
            '狀態': document.getElementById('condition').value,
            '備註': document.getElementById('notes').value,
            '操作人員': '系統用戶' // 可以改為讓用戶輸入
        };

        // 驗證必填欄位
        if (!assetData['資產名稱']) {
            alert('請填入資產名稱');
            return;
        }

        // 寫入到 Google Sheets
        await writeSheetsData(assetData);

        showMessage('✅ 資產資料已準備儲存到 Google Sheets', 'success');

        // 更新資產列表
        setTimeout(() => {
            loadAssetList();
        }, 1000);

    } catch (error) {
        console.error('儲存失敗:', error);
        showMessage(`❌ 儲存失敗: ${error.message}`, 'error');
    }
}

// 清除表單
function clearForm() {
    // 清除表單欄位
    const fields = ['assetName', 'category', 'department', 'location', 'condition', 'notes'];
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
        }
    });

    // 清除序號欄位
    document.getElementById('serialNumber').value = '';
    document.getElementById('subSerial').value = '';
    document.getElementById('assetCode').value = '';

    // 隱藏編輯區域
    document.getElementById('editSection').style.display = 'none';

    // 重置當前資產
    currentAsset = null;

    showMessage('🔄 表單已清除', 'info');
}

// 載入資產列表
async function loadAssetList() {
    try {
        if (!sheetsAPI || !sheetsAPI.connected) {
            document.getElementById('assetList').innerHTML =
                '<div class="message info">請先連接到 Google Sheets</div>';
            return;
        }

        const data = await readSheetsData();

        if (!data.rows || data.rows.length === 0) {
            document.getElementById('assetList').innerHTML =
                '<div class="message info">暫無資產資料</div>';
            return;
        }

        // 顯示最近的資產（最多10筆）
        const recentAssets = data.rows.slice(-10).reverse();

        const listHtml = recentAssets.map(row => {
            return `
                <div class="asset-item">
                    <h4>${row[4] || '未命名資產'}</h4>
                    <p><strong>編號:</strong> ${row[1]}-${row[2]}</p>
                    <p><strong>分類:</strong> ${row[5] || '-'}</p>
                    <p><strong>部門:</strong> ${row[6] || '-'}</p>
                    <p><strong>位置:</strong> ${row[7] || '-'}</p>
                    <p><strong>狀態:</strong> ${row[8] || '-'}</p>
                    <p><strong>更新時間:</strong> ${row[0] || '-'}</p>
                </div>
            `;
        }).join('');

        document.getElementById('assetList').innerHTML = listHtml;

    } catch (error) {
        console.error('載入資產列表失敗:', error);
        document.getElementById('assetList').innerHTML =
            `<div class="message error">載入失敗: ${error.message}</div>`;
    }
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 創建或更新訊息容器
    let messageContainer = document.getElementById('mainMessage');

    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'mainMessage';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.maxWidth = '90%';
        document.body.appendChild(messageContainer);
    }

    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;

    // 3秒後自動隱藏
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.innerHTML = '';
        }
    }, 3000);
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function () {
    // 載入資產列表
    setTimeout(() => {
        loadAssetList();
    }, 2000);

    // 設定表單提交防止頁面刷新
    const assetForm = document.getElementById('assetForm');
    if (assetForm) {
        assetForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveAsset();
        });
    }

    // 設定 Enter 鍵處理
    const assetCodeInput = document.getElementById('assetCode');
    if (assetCodeInput) {
        assetCodeInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                processAssetCode();
            }
        });
    }
});
