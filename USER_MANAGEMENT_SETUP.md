# 🎮 Hệ thống quản lý User từ Facebook Chatbot

## 📋 Tổng quan
Hệ thống này cho phép:
- Lưu thông tin người dùng từ Facebook Messenger (tên, avatar, số điện thoại, email)
- Quản lý và xác minh người dùng qua admin panel
- Tích hợp giữa chatbot (Node.js) và game website (PHP)

## 🔧 Cài đặt

### 1. Database Setup (MySQL)
```sql
-- Chạy file schema.sql để tạo các bảng cần thiết
mysql -u root -p vong_quay_db < database/schema.sql
```

### 2. fbBotGoogleSheet (Node.js)
```bash
cd d:\fbBotGoogleSheet
npm install mysql2
```

Thêm vào file `.env`:
```env
# Database cho game (MySQL từ vongquay4)
GAME_DB_HOST=localhost
GAME_DB_PORT=3306
GAME_DB_USER=root
GAME_DB_PASS=
GAME_DB_NAME=vong_quay_db

# Facebook Page Access Token (để lấy thông tin user)
PAGE_ACCESS_TOKEN=your_page_access_token_here
```

### 3. vongquay4 (PHP)
Không cần cài đặt thêm, sử dụng cấu hình database hiện có.

## 🚀 Luồng hoạt động

### 1. User nhắn tin cho Page
- Chatbot tạo verification token
- Gửi link: `https://quan3goc.page.gd/?token=ABC123`

### 2. User nhập thông tin trên website
- Website gọi API: `POST /api/save_user.php`
- Gửi: `{token, phone, email}`

### 3. Server xử lý
- Kiểm tra token hợp lệ
- Lấy PSID từ token
- Gọi Facebook API lấy tên/avatar
- Lưu vào database

### 4. Admin quản lý
- Truy cập: `http://localhost/vongquay4/admin_users.php`
- Login: admin / quan3goc2024
- Xem/xác minh/export user

## 📁 Cấu trúc file

### fbBotGoogleSheet/
```
src/
├── services/gameDatabase.js    # Kết nối MySQL cho game
├── controllers/gameController.js # API endpoints
└── controllers/chatbotController.js # Updated với token

routes/web.js                   # Updated với API routes
package.json                    # Added mysql2
```

### vongquay4/
```
database/schema.sql             # Database schema
api/save_user.php              # API nhận thông tin user
admin_users.php                # Admin panel quản lý user
test_user_registration.html    # Test page
```

## 🔑 API Endpoints

### 1. Create Game Link (fbBotGoogleSheet)
```
POST /api/game/create-link
Body: {psid: "123456"}
Response: {success: true, gameLink: "https://game.com/?token=ABC", token: "ABC"}
```

### 2. Save User (vongquay4)
```
POST /api/save_user.php
Body: {token: "ABC123", phone: "0901234567", email: "test@email.com"}
Response: {success: true, message: "User saved", user: {name, phone, email}}
```

## 🛡️ Bảo mật
- Token có thời hạn 30 phút
- Mỗi token chỉ dùng được 1 lần
- HTTP Basic Auth cho admin panel
- Validate đầu vào và sanitize output

## 📊 Admin Features
- Dashboard thống kê
- Danh sách người dùng với avatar/tên Facebook
- Xác minh/hủy xác minh user
- Export CSV
- Tìm kiếm

## 🧪 Testing
1. Truy cập: `http://localhost/vongquay4/test_user_registration.html`
2. Test với token mẫu
3. Nhập số điện thoại
4. Kiểm tra kết quả trong admin panel

## 🔄 Deploy lên Production

### Railway (fbBotGoogleSheet):
```env
GAME_DB_HOST=sql113.infinityfree.com
GAME_DB_PORT=3306
GAME_DB_NAME=if0_39722476_vong_quay_db
GAME_DB_USER=if0_39722476
GAME_DB_PASS=lfjaOysrnJ5dKUc
```

### InfinityFree (vongquay4):
- Upload files qua File Manager
- Database sử dụng cấu hình hiện có
- Cập nhật URL trong chatbot

## ⚠️ Lưu ý
- Backup database trước khi deploy
- Test token expiry và validation
- Kiểm tra CORS nếu game và API khác domain
- Cập nhật Privacy Policy về việc lưu thông tin user
- Set strong password cho admin panel

## 📞 Support
- Admin panel: `admin_users.php`
- Test page: `test_user_registration.html`
- Logs: Check server logs cho errors
- Database: Kiểm tra bảng `users` và `verification_tokens`
