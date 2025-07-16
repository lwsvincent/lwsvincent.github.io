# 🚀 GitHub Pages 快速部署指南

## 第一步：建立 GitHub 帳號和 Repository

1. **註冊 GitHub 帳號**
   - 到 [github.com](https://github.com) 註冊（如果還沒有）

2. **建立新的 Repository**
   - 點擊右上角 ➕ → "New repository"
   - Repository 名稱：`asset-inventory`
   - 設定為 **Public**（必須是 Public 才能使用免費 GitHub Pages）
   - ✅ 勾選 "Add a README file"
   - 點擊 "Create repository"

## 第二步：上傳檔案

### 🖱️ 方法一：網頁拖拉上傳（推薦）

1. 在新建的 repository 頁面，點擊 "uploading an existing file"
2. 拖拉這些檔案到網頁：
   ```
   📁 需要上傳的檔案：
   ├── index.html
   ├── location-tracking.html
   ├── styles.css
   ├── scanner.js
   ├── sheets-api.js
   ├── main.js
   ├── location-tracking.js
   └── README.md
   ```
3. 在底部 Commit message 寫：`上傳財產盤點系統檔案`
4. 點擊 "Commit changes"

### 💻 方法二：使用 Git 指令

如果您熟悉命令列：
```bash
# 在 e:\equip 資料夾中執行
git init
git add .
git commit -m "Initial commit - 財產盤點系統"
git branch -M main
git remote add origin https://github.com/您的用戶名/asset-inventory.git
git push -u origin main
```

## 第三步：啟用 GitHub Pages

1. 在 repository 頁面點擊 **"Settings"** 標籤
2. 在左側選單找到 **"Pages"**
3. Source 選擇 **"Deploy from a branch"**
4. Branch 選擇 **"main"**
5. 資料夾選擇 **"/ (root)"**
6. 點擊 **"Save"**

## 第四步：取得您的網站網址

⏱️ 等待 5-10 分鐘後，您的網站會在以下網址上線：

```
https://您的GitHub用戶名.github.io/asset-inventory
```

例如：
- 用戶名是 `johnsmith` → `https://johnsmith.github.io/asset-inventory`
- 用戶名是 `company123` → `https://company123.github.io/asset-inventory`

## 🧪 測試您的網站

部署完成後，請測試：

1. **基本功能**
   - ✅ 網站正常載入
   - ✅ 樣式顯示正確
   - ✅ 可以切換到地點記錄頁面

2. **QR Code 掃描**
   - ✅ 允許攝像頭權限
   - ✅ 掃描財產 QR Code
   - ✅ 手機瀏覽器相容性

3. **Google Sheets 整合**
   - ✅ 連接到您的 Google Sheets
   - ✅ 讀取現有資料
   - ✅ 資料格式顯示

## 📱 手機使用

在手機上開啟網站：
1. 打開 Safari (iOS) 或 Chrome (Android)
2. 輸入您的 GitHub Pages 網址
3. 首次使用時允許攝像頭權限
4. 測試 QR Code 掃描功能

## 🔄 更新網站

當您需要修改功能時：
1. 編輯本地檔案
2. 重新上傳到 GitHub
3. 網站會自動更新（可能需要幾分鐘）

## ⚡ 立即開始

現在就可以開始部署了！有任何問題請告訴我。

---

## 💡 小提醒

- GitHub Pages 完全免費
- 自動提供 HTTPS（QR Code 掃描必需）
- 全球 CDN 加速
- 無流量限制
- 適合小型到中型企業使用
