// 地點記錄功能// 設定掃描回調
window.currentScanCallback = function (result) {
    console.log('地點記錄掃描回調被調用:', result);

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
        showMessage(`❌ 處理失敗: ${error.message}`, 'error');
    }
}; let scanState = {
    currentStep: 1, // 1: 掃描地點, 2: 掃描儀器, 3: 確認儲存
    location: null,
    equipment: null
};

// localStorage 鍵名
const SAVED_LOCATION_KEY = 'savedLocationCode';
const SAVED_USER_ID_KEY = 'savedUserId';

// 保存地點到 localStorage
function saveLocationToStorage(locationCode) {
    localStorage.setItem(SAVED_LOCATION_KEY, locationCode);
}

// 從 localStorage 讀取地點
function getSavedLocation() {
    return localStorage.getItem(SAVED_LOCATION_KEY);
}

// 清除保存的地點
function clearSavedLocation() {
    localStorage.removeItem(SAVED_LOCATION_KEY);
}

// 保存用戶 ID 到 localStorage
function saveUserIdToStorage(userId) {
    localStorage.setItem(SAVED_USER_ID_KEY, userId);
}

// 從 localStorage 讀取用戶 ID
function getSavedUserId() {
    return localStorage.getItem(SAVED_USER_ID_KEY);
}

// 清除保存的用戶 ID
function clearSavedUserId() {
    localStorage.removeItem(SAVED_USER_ID_KEY);
}

// 自動請求攝像頭權限
async function requestCameraPermission() {
    try {
        // 檢查是否支援 getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('此瀏覽器不支援攝像頭功能');
            return;
        }

        // 先檢查權限狀態
        if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'camera' });
            if (permission.state === 'granted') {
                console.log('攝像頭權限已授權');
                return;
            }
        }

        // 請求攝像頭權限（使用簡單的約束）
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } }
        });
        
        // 立即停止串流，我們只是要取得權限
        stream.getTracks().forEach(track => track.stop());
        
        console.log('攝像頭權限請求成功');
        showMessage('✅ 攝像頭權限已獲得', 'success');
        
    } catch (error) {
        console.log('攝像頭權限請求失敗:', error);
        if (error.name === 'NotAllowedError') {
            showMessage('⚠️ 請允許攝像頭權限以使用掃描功能', 'warning');
        } else if (error.name === 'NotFoundError') {
            showMessage('⚠️ 未找到攝像頭設備', 'warning');
        } else {
            showMessage('⚠️ 攝像頭初始化失敗', 'warning');
        }
    }
}

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

    // 保存地點到 localStorage
    saveLocationToStorage(locationCode);

    // 更新顯示
    updateLocationDisplay(locationCode);

    // 直接跳到步驟2（掃描儀器）
    updateStepDisplay(1, 'completed');
    updateStepDisplay(2, 'active');
    scanState.currentStep = 2;

    // 更新掃描器標題
    // scannerTitle removed = '掃描儀器 QR Code';

    showMessage('✅ 地點已設定並保存，請掃描儀器 QR Code', 'success');
}

// 更新地點顯示
function updateLocationDisplay(locationCode) {
    document.getElementById('locationCode').value = locationCode;
    
    // 顯示已保存指示
    // savedLocationIndicator removed
}

// 記住地點功能
function rememberLocation() {
    const locationCode = document.getElementById('locationCode').value.trim();
    if (!locationCode) {
        alert('請輸入地點代碼');
        return;
    }
    setLocation(locationCode);
}

// 清除保存的地點並重置
function clearLocationAndReset() {
    clearSavedLocation();
    
    // 完全重置流程
    scanState = {
        currentStep: 1,
        location: null,
        equipment: null
    };
    
    // 重置顯示
    document.getElementById('locationCode').value = '';
    document.getElementById('currentEquipment').textContent = '未設定';
    // savedLocationIndicator removed
    document.getElementById('clearLocationBtn').style.display = 'none';
    
    // 清除輸入欄位
    const operatorInput = document.getElementById('operator');
    if (operatorInput) {
        operatorInput.value = '';
    }
    
    // 重置記住我選項
    const rememberUserCheckbox = document.getElementById('rememberUser');
    if (rememberUserCheckbox) {
        rememberUserCheckbox.checked = false;
    }
    
    // 重置步驟顯示
    updateStepDisplay(1, 'active');
    updateStepDisplay(2, '');
    updateStepDisplay(3, '');
    
    // 隱藏記錄表單
    document.getElementById('recordSection').style.display = 'none';
    
    // 重置掃描器標題
    // scannerTitle removed = '掃描地點 QR Code';
    
    showMessage('🔄 已清除保存的地點，請重新掃描地點 QR Code', 'info');
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

    // 更新步驟狀態
    updateStepDisplay(2, 'completed');
    updateStepDisplay(3, 'active');
    scanState.currentStep = 3;

    // 顯示記錄表單
    document.getElementById('recordSection').style.display = 'block';


    showMessage('✅ 儀器已設定，請填寫詳細資訊並儲存', 'success');
}


// 更新步驟顯示 (簡化版，不再需要視覺步驟指示)
function updateStepDisplay(stepNumber, status) {
    // 保留函數以避免錯誤，但不執行任何操作
}

// 儲存位置記錄
async function saveLocationRecord() {
    if (!scanState.location || !scanState.equipment) {
        alert('請先掃描地點和儀器');
        return;
    }

    try {
        const operatorId = document.getElementById('operator').value.trim();
        
        // 重新取得地點代碼（以防用戶修改了輸入欄位）
        const currentLocationCode = document.getElementById('locationCode').value.trim();
        if (!currentLocationCode) {
            alert('請填入地點代碼');
            return;
        }
        
        // 更新 scanState 中的地點代碼為當前輸入欄位的值
        scanState.location.code = currentLocationCode;
        
        // 如果勾選了記住地點，更新保存的地點
        const rememberLocationCheckbox = document.getElementById('rememberLocation');
        if (rememberLocationCheckbox && rememberLocationCheckbox.checked) {
            saveLocationToStorage(currentLocationCode);
        }
        
        // 驗證必填欄位
        if (!operatorId) {
            alert('請填入記錄人員 ID');
            return;
        }

        // 解析儀器編號
        let serialNumber = '';
        let subNumber = '';
        
        if (scanState.equipment.fullCode) {
            // 如果是完整的財產編號格式 (例如: 1000-F007485-00008)
            const parts = scanState.equipment.fullCode.split('-');
            if (parts.length >= 3) {
                serialNumber = parts[1]; // F007485
                subNumber = parts[2];    // 00008
            } else {
                serialNumber = scanState.equipment.code;
                subNumber = '';
            }
        } else {
            serialNumber = scanState.equipment.code;
            subNumber = '';
        }

        // 準備日期和時間
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        // 檢查是否要記住用戶 ID
        const rememberUserCheckbox = document.getElementById('rememberUser');
        if (rememberUserCheckbox) {
            const rememberUser = rememberUserCheckbox.checked;
            if (rememberUser) {
                saveUserIdToStorage(operatorId);
            } else {
                clearSavedUserId();
            }
        }

        // 檢查是否要記住地點
        if (rememberLocationCheckbox && !rememberLocationCheckbox.checked) {
            // 如果未勾選記住地點，清除保存的地點
            clearSavedLocation();
        }

        // 提交到 Google Forms
        await submitToGoogleForm({
            serialNumber,
            subNumber,
            date,
            time,
            location: scanState.location.code,
            recorderId: operatorId
        });

        showMessage('✅ 記錄已成功提交到 Google Forms', 'success');

        // 重置流程（但保留用戶 ID 如果有勾選記住我）
        setTimeout(() => {
            resetProcess();
        }, 2000);

    } catch (error) {
        console.error('儲存失敗:', error);
        showMessage(`❌ 儲存失敗: ${error.message}`, 'error');
    }
}

// 提交到 Google Forms
async function submitToGoogleForm(data) {
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSckXIY2Hw9Kod5HbYKsSMcdWIs5m0jV6eActAvm5FHWPUTHwg/formResponse';
    
    const formData = new FormData();
    formData.append('entry.1173500043', data.serialNumber || ''); // 序號
    formData.append('entry.1070933766', data.subNumber || '');    // 子序號
    formData.append('entry.1415260859', data.date);               // 日期
    formData.append('entry.209013606', data.time);                // 時間
    formData.append('entry.1668811962', data.location);           // 地點
    formData.append('entry.1900843120', data.recorderId);         // 記錄人員ID

    const response = await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    });

    // no-cors 模式無法檢查回應狀態，假設成功
    console.log('表單已提交');
}

// 重置流程（但保留已保存的地點）
function resetProcess() {
    const savedLocation = getSavedLocation();
    
    if (savedLocation) {
        // 如果有保存的地點，直接跳到掃描儀器步驟
        scanState = {
            currentStep: 2,
            location: {
                code: savedLocation,
                name: '',
                timestamp: new Date()
            },
            equipment: null
        };
        
        // 更新顯示
        updateLocationDisplay(savedLocation);
        document.getElementById('currentEquipment').textContent = '未設定';
        
        // 重置步驟顯示
        updateStepDisplay(1, 'completed');
        updateStepDisplay(2, 'active');
        updateStepDisplay(3, '');
        
        // 更新掃描器標題
        // scannerTitle removed = '掃描儀器 QR Code';
        
        showMessage(`🔄 使用已保存的地點: ${savedLocation}，請掃描儀器 QR Code`, 'info');
    } else {
        // 沒有保存的地點，重置為初始狀態
        scanState = {
            currentStep: 1,
            location: null,
            equipment: null
        };
        
        // 重置顯示
        document.getElementById('locationCode').value = '';
        document.getElementById('currentEquipment').textContent = '未設定';
        
        // 重置步驟顯示
        updateStepDisplay(1, 'active');
        updateStepDisplay(2, '');
        updateStepDisplay(3, '');
        
        // 重置掃描器標題
        // scannerTitle removed = '掃描地點 QR Code';
        
        showMessage('🔄 流程已重置，請掃描地點 QR Code', 'info');
    }

    // 只有在沒有勾選記住我時才清除用戶 ID
    const rememberUserCheckbox = document.getElementById('rememberUser');
    const operatorInput = document.getElementById('operator');
    
    if (rememberUserCheckbox && operatorInput) {
        const rememberUser = rememberUserCheckbox.checked;
        if (!rememberUser) {
            operatorInput.value = '';
        }
    }

    // 隱藏記錄表單
    document.getElementById('recordSection').style.display = 'none';
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
    // 檢查是否有保存的用戶 ID
    const savedUserId = getSavedUserId();
    const operatorInput = document.getElementById('operator');
    const rememberUserCheckbox = document.getElementById('rememberUser');
    
    if (savedUserId && operatorInput && rememberUserCheckbox) {
        operatorInput.value = savedUserId;
        rememberUserCheckbox.checked = true;
    }
    
    // 初始化記住地點選項（預設為勾選）
    const rememberLocationCheckbox = document.getElementById('rememberLocation');
    if (rememberLocationCheckbox) {
        rememberLocationCheckbox.checked = true;
    }
    
    // 檢查是否有保存的地點
    const savedLocation = getSavedLocation();
    
    if (savedLocation) {
        // 如果有保存的地點，直接跳到掃描儀器步驟
        scanState = {
            currentStep: 2,
            location: {
                code: savedLocation,
                name: '',
                timestamp: new Date()
            },
            equipment: null
        };
        
        updateLocationDisplay(savedLocation);
        updateStepDisplay(1, 'completed');
        updateStepDisplay(2, 'active');
        // scannerTitle removed = '掃描儀器 QR Code';
        
        showMessage(`🔄 已自動載入保存的地點: ${savedLocation}，請掃描儀器 QR Code`, 'info');
    } else {
        // 沒有保存的地點，從第一步開始
        updateStepDisplay(1, 'active');
    }



    // 自動請求攝像頭權限
    requestCameraPermission();

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
                rememberLocation();
            }
        });
    }

});
