# 個人行程與任務管理系統

手機優先的前端原型，使用原生 HTML、CSS 與 JavaScript，Firebase SDK 由 CDN 載入。

## 功能

- 週曆日期導覽與每日行程檢視
- 新增行程（單次／每週／每月選項）、時間、顏色與地點備註
- 新增待辦，支援指定時間或全天，並可標記完成
- 首頁顯示近期未完成期限
- 使用 Firebase Authentication 以 Google 帳號登入與登出

## 預覽

GitHub Pages 網址：<https://jack2006950215-bit.github.io/WEBAPP/>

## 本機開啟

在專案根目錄啟動本機 HTTP 伺服器（例如 `python -m http.server 8000`），再瀏覽 `http://localhost:8000`。Google 登入需要透過 HTTP(S) 載入頁面。

## Firebase

- Firebase 專案顯示名稱：`11510-30`
- Web App 暱稱：`WEBAPP`
- Google 登入供應商已啟用；GitHub Pages 網域 `jack2006950215-bit.github.io` 已加入授權網域。
- `firebase-config.js` 是 Web App 的前端設定；不要在前端放入服務帳戶金鑰或其他伺服器憑證。

## 專案內容與限制

- `index.html`：互動式前端原型
- `auth.js`：Firebase Google 登入／登出與登入狀態顯示
- `firebase-config.js`：Firebase Web App 前端設定
- `ai-assistant.js`：Firebase AI Logic Gemini 行程問答，僅讀取目前使用者的行程快照
- `PRD_個人行程與任務管理系統.docx`、`.pdf`：產品需求文件
- `create_prd.py`：產生需求文件的 Python 腳本
- `prd_render/`：需求文件頁面預覽圖與 PDF

## Gemini 行程助理

- Firebase Console 需完成 Firebase AI Logic 設定，選用 Gemini Developer API，並為 Web App 設定 Firebase App Check。
- 將註冊的 reCAPTCHA Enterprise 公開 site key 填入 `firebase-config.js` 的 `appCheckSiteKey`。這是公開網站金鑰，不是 Gemini API 金鑰；不要將私密金鑰或服務帳戶憑證放在前端。
- 對話面板會在送出前顯示本次傳送筆數與日期範圍。每次提問會把行程名稱、日期、時間、地點／備註、重複頻率，以及待辦名稱、期限、完成狀態和小步驟傳給 Google Gemini。頁面不會儲存對話紀錄。
- Gemini 只應用來協助查詢與整理，不會替使用者建立或修改行程。請勿在行程備註中放入不想傳給 Gemini 的敏感資料。

行程與待辦在登入時會同步到使用者自己的 Firestore 文件，未登入時保存在瀏覽器本機。此版本沒有主動通知。
