# BNI 管理助理

BNI 華冠分會的內部管理工具：通訊錄整理、一對一預約、名片／簡報照片與逐字稿上傳、AI 摘要，以及 Email 發送。使用 Next.js（App Router）+ PostgreSQL（Prisma）+ Anthropic Claude API + Nodemailer 打造，設計給單一管理者使用，**不需要登入系統**。

## 功能總覽（v1 MVP）

- **通訊錄整理** (`/contacts`)：新增、搜尋、編輯聯絡人資料，包含公司、產業別、所屬分會、地址（可顯示 Google 地圖）。
- **預約系統** (`/book`)：對外分享的免登入預約頁面，夥伴填寫資料並選擇時間後，系統會寄出確認信；管理者也會同步收到通知信，避免漏接。
- **會後資料上傳** (`/book/[token]`)：預約成功後取得的專屬連結，供對方會後上傳名片／簡報照片，並貼上逐字稿，系統會自動呼叫 Claude 產生「有目的性」的摘要（對方需求、可轉介機會、待跟進事項等）。
- **分析一對一內容** (`/meetings`)：瀏覽所有一對一紀錄與 AI 摘要，可搜尋逐字稿／摘要關鍵字，也可手動新增紀錄或重新產生摘要。
- **Google 日曆** (`/calendar`)：嵌入既有的 Google 日曆，並列出系統內即將到來的預約。
- **發送 Email** (`/email`)：勾選聯絡人快速發送課程資訊或分會通知，並保留寄送紀錄。
- **自動提醒信**：透過排程呼叫 `/api/cron/reminders`，於預約前 24 小時內自動寄出提醒信給對方。

v2 之後才做：媒合服務、LINE 助理整合、逐字稿關鍵字全文檢索優化。

## 技術棧

- Next.js 16（App Router + Server Actions）
- PostgreSQL + Prisma ORM
- Nodemailer（透過 Gmail SMTP 寄信）
- Anthropic Claude API（`@anthropic-ai/sdk`，用於一對一摘要）
- Tailwind CSS v4（藍、白、橘的商業風格）

## 本機開發

```bash
npm install
cp .env.example .env   # 如果沒有 .env，請依下方「環境變數」章節建立
npx prisma db push     # 將 schema 同步到你的 PostgreSQL
npm run dev
```

開發時需要一個可連線的 PostgreSQL（本機安裝、Docker、或 Zeabur/Neon 等雲端服務都可以）。

上傳的照片預設存放在專案根目錄的 `uploads/`（開發用，正式環境請設定 `UPLOAD_DIR` 並掛載 Volume，見下方）。

## 環境變數

| 變數 | 說明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 連線字串。Zeabur 建立 Postgres 服務後會自動提供。 |
| `GMAIL_USER` | 寄件用 Gmail 帳號。 |
| `GMAIL_APP_PASSWORD` | Gmail「應用程式密碼」（不是登入密碼，需在 Google 帳戶「安全性」>「應用程式密碼」產生，且該 Gmail 帳號需開啟兩步驟驗證）。 |
| `ADMIN_EMAIL` | 管理者信箱，用於接收新預約通知與摘要完成通知。 |
| `ANTHROPIC_API_KEY` | Anthropic API 金鑰，用於產生一對一摘要。未設定時，摘要功能會顯示失敗訊息，但不影響其他功能。 |
| `GOOGLE_CALENDAR_EMBED_URL` | 在 Google 日曆「設定與共用」>「嵌入程式碼」取得的網址，貼到 `/calendar` 頁面。 |
| `NEXT_PUBLIC_BASE_URL` | 網站對外網址（例如 `https://your-app.zeabur.app`），用於信件中的連結。 |
| `CRON_SECRET` | 保護 `/api/cron/reminders` 的金鑰，排程呼叫時需帶上（`Authorization: Bearer <CRON_SECRET>` 或 `?secret=<CRON_SECRET>`）。未設定時該端點不受保護，僅建議本機測試使用。 |
| `UPLOAD_DIR` | 照片上傳存放的資料夾路徑，正式環境請指向掛載的 Volume，例如 `/app/uploads`。 |

## 部署到 Zeabur

1. **建立 PostgreSQL 服務**：在 Zeabur 專案中新增 Postgres 服務，會自動產生 `DATABASE_URL`，將它加到本專案服務的環境變數中。
2. **建立 Volume 存放上傳照片**：由於容器重啟後本機檔案會消失，請在 Zeabur 服務設定中新增一個 Volume，掛載路徑設為 `/app/uploads`，並設定環境變數 `UPLOAD_DIR=/app/uploads`。
3. **設定其餘環境變數**：`GMAIL_USER`、`GMAIL_APP_PASSWORD`、`ADMIN_EMAIL`、`ANTHROPIC_API_KEY`、`GOOGLE_CALENDAR_EMBED_URL`、`NEXT_PUBLIC_BASE_URL`、`CRON_SECRET`。
4. **部署後執行資料庫遷移**：可在 Zeabur 的部署設定中，將啟動指令改為先執行 `npx prisma db push && npm run start`，或使用 Zeabur 的一次性指令（Pre-deploy Command）執行 `npx prisma db push`。
5. **設定排程提醒信（Zeabur Cron）**：在 Zeabur 建立一個 Cron 任務，例如每小時執行一次，呼叫：
   ```
   curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.zeabur.app/api/cron/reminders
   ```
6. **設定 Google 日曆嵌入**：到 Google 日曆網頁版 →「設定與共用」→ 你的日曆 →「整合」→ 複製「嵌入程式碼」中的網址，貼到 `GOOGLE_CALENDAR_EMBED_URL`。
7. **設定 Gmail 應用程式密碼**：Google 帳戶 →「安全性」→「兩步驟驗證」（需先啟用）→「應用程式密碼」→ 產生一組 16 碼密碼，填入 `GMAIL_APP_PASSWORD`。

程式碼推送到 GitHub 後，於 Zeabur 建立服務並選擇該 GitHub Repository，Zeabur 會自動偵測為 Next.js 專案並建置部署。

## 安全性提醒

本系統依需求設計為「不需要登入」，代表任何知道網址的人都能瀏覽通訊錄與一對一摘要等內部資料。若要對外提供服務（例如分享 `/book` 預約頁面），建議：

- 將預約頁面（`/book`）分享給夥伴使用，但通訊錄、一對一摘要、Email 發送等管理頁面網址不要公開分享。
- 若需要更進一步的保護，可考慮在 Zeabur 或網域層加上簡單的存取限制（例如 Basic Auth），或未來視需求加入登入機制。

## 專案結構

```
src/
  app/
    page.tsx                總覽 Dashboard
    contacts/                通訊錄整理
    calendar/                 Google 日曆
    book/                     公開預約頁面 + 會後資料上傳
    meetings/                 一對一紀錄與 AI 摘要
    email/                    Email 發送
    api/
      cron/reminders/         排程提醒信
      files/[filename]/       上傳照片的檔案伺服端點
  lib/
    prisma.ts                Prisma Client
    mail.ts                  Nodemailer 寄信與紀錄
    ai.ts                    Claude API 摘要產生
    uploads.ts               檔案上傳存取
prisma/
  schema.prisma              資料庫結構（Contact / Booking / Meeting / Photo / EmailLog）
```
