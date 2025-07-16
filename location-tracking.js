// 地點記錄功能

// 當前掃描狀態
let scanState = {
    currentStep: 1, // 1: 掃描地點, 2: 掃描儀器, 3: 確認儲存
    location: null,
    equipment: null
};

// 設定掃描回調
window.currentScanCallback = function (result) {
    try {
        if (scanState.currentStep === 1) {
            // 處理地點 QR Code
            setLocation(result);
        } else if (scanState.currentStep === 2) {
            // 處理儀器 QR Code
            setEquipment(result);
        }
    } catch (error) {
        console.error('處理掃描結果失敗:', error);
        qrScanner.showMessage(`❌ 處理失敗: ${error.message}`, 'error');
    }
};

// 設定地點
function setLocation(locationCode) {
    scanState.location = {
        code: locationCode,
        name: '', // 將由用戶填入
        timestamp: new Date()
    };

    // 更新顯示
    document.getElementById('currentLocation').textContent = locationCode;
    document.getElementById('locationCode').value = locationCode;

    // 更新步驟狀態
    updateStepDisplay(1, 'completed');
    updateStepDisplay(2, 'active');
    scanState.currentStep = 2;

    // 更新掃描器標題
    document.getElementById('scannerTitle').textContent = '掃描儀器 QR Code';

    showMessage('✅ 地點已設定，請掃描儀器 QR Code', 'success');
}

// 設定儀器
function setEquipment(equipmentCode) {
    // 解析儀器編號（如果是財產編號格式）
    let parsedData = null;
    try {
        parsedData = qrScanner.parseAssetCode(equipmentCode);
        equipmentCode = parsedData.key; // 使用序號-子序號作為儀器標識
    } catch (error) {
        // 如果不是財產編號格式，直接使用原始編號
        console.log('不是財產編號格式，使用原始編號');
    }

    scanState.equipment = {
        code: equipmentCode,
        fullCode: parsedData ? parsedData.fullCode : equipmentCode,
        name: '', // 將由用戶填入
        timestamp: new Date()
    };

    // 更新顯示
    document.getElementById('currentEquipment').textContent = equipmentCode;
    document.getElementById('equipmentCode').value = equipmentCode;

    // 更新步驟狀態
    updateStepDisplay(2, 'completed');
    updateStepDisplay(3, 'active');
    scanState.currentStep = 3;

    // 顯示記錄表單
    document.getElementById('recordSection').style.display = 'block';

    // 更新時間顯示
    updateTimeDisplay();

    showMessage('✅ 儀器已設定，請填寫詳細資訊並儲存', 'success');
}

// 手動設定地點
function setLocationManually() {
    const locationCode = document.getElementById('locationCode').value.trim();
    if (!locationCode) {
        alert('請輸入地點代碼');
        return;
    }
    setLocation(locationCode);
}

// 手動設定儀器
function setEquipmentManually() {
    const equipmentCode = document.getElementById('equipmentCode').value.trim();
    if (!equipmentCode) {
        alert('請輸入儀器編號');
        return;
    }
    setEquipment(equipmentCode);
}

// 更新步驟顯示
function updateStepDisplay(stepNumber, status) {
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.className = `step ${status}`;
    }
}

// 更新時間顯示
function updateTimeDisplay() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
        now.toLocaleString('zh-TW');
}

// 儲存位置記錄
async function saveLocationRecord() {
    if (!scanState.location || !scanState.equipment) {
        alert('請先掃描地點和儀器');
        return;
    }

    try {
        // 收集表單資料
        const recordData = {
            '記錄時間': new Date().toLocaleString('zh-TW'),
            '地點代碼': scanState.location.code,
            '地點名稱': document.getElementById('locationName').value.trim(),
            '儀器編號': scanState.equipment.code,
            '完整儀器編號': scanState.equipment.fullCode,
            '儀器名稱': document.getElementById('equipmentName').value.trim(),
            '操作人員': document.getElementById('operator').value.trim(),
            '備註': document.getElementById('recordNotes').value.trim()
        };

        // 驗證必填欄位
        if (!recordData['地點名稱']) {
            alert('請填入地點名稱');
            return;
        }

        if (!recordData['儀器名稱']) {
            alert('請填入儀器名稱');
            return;
        }

        if (!recordData['操作人員']) {
            alert('請填入操作人員');
            return;
        }

        // 寫入到 Google Sheets
        await writeSheetsData(recordData);

        showMessage('✅ 位置記錄已準備儲存到 Google Sheets', 'success');

        // 更新記錄列表
        setTimeout(() => {
            loadRecordList();
        }, 1000);

        // 重置流程
        setTimeout(() => {
            resetProcess();
        }, 2000);

    } catch (error) {
        console.error('儲存失敗:', error);
        showMessage(`❌ 儲存失敗: ${error.message}`, 'error');
    }
}

// 重置流程
function resetProcess() {
    // 重置狀態
    scanState = {
        currentStep: 1,
        location: null,
        equipment: null
    };

    // 重置顯示
    document.getElementById('currentLocation').textContent = '未設定';
    document.getElementById('currentEquipment').textContent = '未設定';
    document.getElementById('currentTime').textContent = '-';

    // 清除輸入欄位
    document.getElementById('locationCode').value = '';
    document.getElementById('equipmentCode').value = '';
    document.getElementById('locationName').value = '';
    document.getElementById('equipmentName').value = '';
    document.getElementById('operator').value = '';
    document.getElementById('recordNotes').value = '';

    // 重置步驟顯示
    updateStepDisplay(1, '');
    updateStepDisplay(2, '');
    updateStepDisplay(3, '');
    updateStepDisplay(1, 'active');

    // 隱藏記錄表單
    document.getElementById('recordSection').style.display = 'none';

    // 重置掃描器標題
    document.getElementById('scannerTitle').textContent = '掃描地點 QR Code';

    showMessage('🔄 流程已重置，請重新開始', 'info');
}

// 載入記錄列表
async function loadRecordList() {
    try {
        if (!sheetsAPI || !sheetsAPI.connected) {
            document.getElementById('recordList').innerHTML =
                '<div class="message info">請先連接到 Google Sheets</div>';
            return;
        }

        const data = await readSheetsData();

        if (!data.rows || data.rows.length === 0) {
            document.getElementById('recordList').innerHTML =
                '<div class="message info">暫無記錄資料</div>';
            return;
        }

        // 顯示最近的記錄（最多10筆）
        const recentRecords = data.rows.slice(-10).reverse();

        const listHtml = recentRecords.map(row => {
            return `
                <div class="record-item">
                    <h4>${row[2] || '未知地點'} → ${row[5] || '未知儀器'}</h4>
                    <p><strong>地點:</strong> ${row[1] || '-'} (${row[2] || '-'})</p>
                    <p><strong>儀器:</strong> ${row[3] || '-'} (${row[5] || '-'})</p>
                    <p><strong>操作人員:</strong> ${row[6] || '-'}</p>
                    <p><strong>備註:</strong> ${row[7] || '-'}</p>
                    <p><strong>記錄時間:</strong> ${row[0] || '-'}</p>
                </div>
            `;
        }).join('');

        document.getElementById('recordList').innerHTML = listHtml;

    } catch (error) {
        console.error('載入記錄列表失敗:', error);
        document.getElementById('recordList').innerHTML =
            `<div class="message error">載入失敗: ${error.message}</div>`;
    }
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 創建或更新訊息容器
    let messageContainer = document.getElementById('locationMessage');

    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'locationMessage';
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
    // 初始化步驟顯示
    updateStepDisplay(1, 'active');

    // 定期更新時間顯示
    setInterval(updateTimeDisplay, 1000);

    // 載入記錄列表
    setTimeout(() => {
        loadRecordList();
    }, 2000);

    // 設定表單提交防止頁面刷新
    const locationForm = document.getElementById('locationForm');
    if (locationForm) {
        locationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveLocationRecord();
        });
    }

    // 設定 Enter 鍵處理
    const locationCodeInput = document.getElementById('locationCode');
    if (locationCodeInput) {
        locationCodeInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                setLocationManually();
            }
        });
    }

    const equipmentCodeInput = document.getElementById('equipmentCode');
    if (equipmentCodeInput) {
        equipmentCodeInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                setEquipmentManually();
            }
        });
    }
});
