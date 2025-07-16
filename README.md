# 財產盤點系統

這是一個基於 Web 的財產盤點系統，支援 QR Code 掃描功能，可以與 Google Sheets 整合進行資料管理。

## 功能特色

### 主要功能
1. **財產 QR Code 掃描** - 掃描財產編號 QR Code 並編輯資產資訊
2. **地點記錄系統** - 掃描地點和儀器 QR Code 記錄設備位置
3. **Google Sheets 整合** - 直接讀取和寫入 Google Sheets 資料
4. **手機支援** - 支援 Safari 和 Chrome 手機瀏覽器

### QR Code 格式支援
- 財產編號格式：`https://assets.acbel.com/fixed?data=1000-{序號}-{子序號}{識別碼}`
- 系統會自動解析序號和子序號作為唯一識別

## 檔案結構

```
equip/
├── index.html              # 主頁面 - 財產盤點
├── location-tracking.html  # 地點記錄頁面
├── styles.css              # 共用樣式
├── scanner.js              # QR Code 掃描功能
├── sheets-api.js           # Google Sheets API 整合
├── main.js                 # 主頁面邏輯
├── location-tracking.js    # 地點記錄邏輯
└── README.md               # 說明文件
```

## 設定說明

### Google Sheets 設定

1. **建立 Google Sheets**
   - 建立一個新的 Google Sheets 文件
   - 為財產盤點建議欄位：
     ```
     日期時間 | 序號 | 子序號 | 完整編號 | 資產名稱 | 分類 | 部門 | 位置 | 狀態 | 備註 | 操作人員
     ```
   - 為地點記錄建議欄位：
     ```
     記錄時間 | 地點代碼 | 地點名稱 | 儀器編號 | 完整儀器編號 | 儀器名稱 | 操作人員 | 備註
     ```

2. **設定分享權限**
   - 點擊右上角「共用」按鈕
   - 設定為「知道連結的使用者」可以檢視
   - 複製分享連結

3. **在系統中設定**
   - 將分享連結貼到「Google Sheets URL」欄位
   - 設定正確的工作表名稱
   - 點擊「連接試算表」

### 部署說明

1. **上傳到 Google Drive**
   - 將所有檔案上傳到 Google Drive
   - 設定 HTML 檔案的分享權限為公開
   - 使用 Google Drive 的檔案預覽功能開啟 HTML

2. **使用 GitHub Pages**
   - 將檔案上傳到 GitHub repository
   - 啟用 GitHub Pages
   - 透過 HTTPS 連結存取

3. **本地測試**
   - 使用本地網頁伺服器（不能直接開啟檔案）
   - 例如：`python -m http.server 8000`

## 使用方法

### 財產盤點
1. 連接到 Google Sheets
2. 掃描或手動輸入財產編號
3. 填寫資產資訊
4. 儲存資料

### 地點記錄
1. 連接到 Google Sheets
2. 掃描地點 QR Code
3. 掃描儀器 QR Code
4. 填寫詳細資訊並儲存

## 技術特點

- **純前端實作** - 無需後端伺服器
- **響應式設計** - 適配手機和桌面裝置
- **離線儲存** - 自動儲存 Google Sheets 設定
- **現代化 UI** - 美觀的使用者介面
- **錯誤處理** - 完善的錯誤提示和處理

## 瀏覽器支援

- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Desktop)
- ✅ Edge (Desktop)

## 注意事項

1. **攝像頭權限** - 首次使用需要允許攝像頭權限
2. **HTTPS 需求** - QR Code 掃描需要 HTTPS 環境
3. **Google Sheets 限制** - 無法直接寫入，需要手動複製資料或使用 Google Forms
4. **網路連線** - 需要網路連線讀取 Google Sheets

## 故障排除

### 攝像頭無法啟動
- 確認瀏覽器有攝像頭權限
- 確認網站使用 HTTPS
- 嘗試重新整理頁面

### Google Sheets 連接失敗
- 確認分享連結正確
- 確認工作表名稱正確
- 確認試算表設定為公開檢視

### QR Code 掃描失敗
- 確認 QR Code 清晰可見
- 調整手機與 QR Code 的距離
- 確認光線充足

## 進階功能建議

1. **Google Forms 整合** - 建立對應的 Google Forms 自動收集資料
2. **批次處理** - 支援批次掃描和處理
3. **資料匯出** - 支援 CSV/Excel 匯出功能
4. **用戶管理** - 添加用戶登入和權限管理

## 授權

MIT License - 可自由使用和修改
