# 個人行程與任務管理系統

手機優先的前端原型，使用原生 HTML、CSS 與 JavaScript，Firebase SDK 由 CDN 載入。

## 功能

- 週曆日期導覽與每日行程檢視
- 新增行程（單次／每週／每月選項）、時間、顏色與地點備註
- 可將行程移至垃圾桶，並從垃圾桶還原，避免誤刪
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
- `PRD_個人行程與任務管理系統.docx`、`.pdf`：產品需求文件
- `create_prd.py`：產生需求文件的 Python 腳本
- `prd_render/`：需求文件頁面預覽圖與 PDF

行程與待辦資料會先保存在瀏覽器本機；登入 Google 帳號後會同步到該帳號的 Firestore 資料。已刪除的行程會保存在垃圾桶，並一併同步，直到使用者還原。此版本沒有主動通知。
