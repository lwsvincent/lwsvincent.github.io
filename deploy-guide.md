# 部署指南 - GitHub Pages

## 步驟 1: 建立 GitHub Repository

1. 到 [github.com](https://github.com) 註冊帳號（如果還沒有）
2. 點擊右上角的 "+" → "New repository"
3. Repository 名稱：`asset-inventory` 或任何您喜歡的名稱
4. 設定為 Public
5. 點擊 "Create repository"

## 步驟 2: 上傳檔案

### 方法 A: 網頁介面上傳
1. 在新建的 repository 頁面點擊 "uploading an existing file"
2. 拖拉或選擇所有檔案：
   - index.html
   - location-tracking.html
   - styles.css
   - scanner.js
   - sheets-api.js
   - main.js
   - location-tracking.js
   - README.md
3. 在底部填寫 Commit message：`Initial commit`
4. 點擊 "Commit changes"

### 方法 B: Git 指令（進階）
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用戶名/repository名稱.git
git push -u origin main
```

## 步驟 3: 啟用 GitHub Pages

1. 在 repository 頁面點擊 "Settings"
2. 左側選單找到 "Pages"
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main"
5. 資料夾選擇 "/ (root)"
6. 點擊 "Save"

## 步驟 4: 存取您的網站

幾分鐘後，您的網站就會在以下網址上線：
```
https://您的用戶名.github.io/repository名稱
```

例如：`https://johnsmith.github.io/asset-inventory`

## 💡 使用技巧

### 更新網站
只要重新上傳檔案到 GitHub，網站就會自動更新。

### 自訂網域（選用）
如果您有自己的網域，可以在 Pages 設定中設定 Custom domain。

### 測試
部署後請測試：
1. QR Code 掃描功能
2. Google Sheets 連接
3. 手機瀏覽器相容性

## 📱 手機測試

在手機上開啟網站後：
1. 允許攝像頭權限
2. 測試 QR Code 掃描
3. 確認 Google Sheets 連接正常

## 🔒 安全性

GitHub Pages 提供：
- 自動 HTTPS
- DDoS 保護
- 全球 CDN

## 常見問題

### Q: 網站沒有立即上線？
A: GitHub Pages 需要 5-10 分鐘建置時間。

### Q: 攝像頭無法使用？
A: 確認網站使用 HTTPS（GitHub Pages 預設就是）。

### Q: 如何更新？
A: 重新上傳檔案到 GitHub repository。

### Q: 免費嗎？
A: 完全免費，無流量限制。
