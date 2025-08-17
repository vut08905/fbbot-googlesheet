# Hướng dẫn tích hợp Database cho Facebook Chatbot

## 🎯 Tổng quan
Hệ thống này cho phép:
- Lưu thông tin người dùng Facebook (tên, avatar, PSID)
- Người dùng nhập số điện thoại từ trang game
- Quản lý giải thưởng và xác minh
- Admin interface để quản lý

## 📋 Yêu cầu
- MySQL/MariaDB database
- PHP 7.4+ (cho admin interface)
- Node.js (cho chatbot)
- npm packages: mysql2

## 🚀 Cài đặt

### 1. Cài đặt database

#### Option A: Sử dụng XAMPP (local)
```bash
# Tạo database trong phpMyAdmin
CREATE DATABASE vong_quay_db;

# Import schema
mysql -u root -p vong_quay_db < database/schema.sql
```

#### Option B: Sử dụng hosting (InfinityFree)
- Database đã có sẵn: `if0_39722476_vong_quay_db`
- Import schema qua phpMyAdmin của hosting

### 2. Cấu hình environment variables

#### Railway (production)
```bash
# Thêm vào Railway environment variables
DB_HOST=sql113.infinityfree.com
DB_PORT=3306
DB_NAME=if0_39722476_vong_quay_db
DB_USER=if0_39722476
DB_PASS=lfjaOysrnJ5dKUc
```

#### Local development (.env)
```bash
# Tạo file .env trong thư mục gốc
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vong_quay_db
DB_USER=root
DB_PASS=
```

### 3. Cài đặt dependencies
```bash
cd fbBotGoogleSheet
npm install mysql2
```

### 4. Copy files admin sang vongquay4
```bash
# Copy các file sau sang c:\xampp\htdocs\vongquay4\
- admin/auth.php
- admin/users.php
- api/game.php
- config/database_improved.php
```

## 📊 Database Schema

### Bảng `users`
- `id`: Primary key
- `psid`: Facebook Page-Scoped ID (unique)
- `first_name`, `last_name`: Tên Facebook
- `profile_pic`: URL avatar
- `phone`, `email`: Thông tin liên hệ
- `verification_token`: Token tạm thời
- `is_verified`: Đã xác minh hay chưa

### Bảng `prizes`
- `id`: Primary key
- `name`: Tên giải thưởng
- `value`: Giá trị (VNĐ)
- `quantity`: Số lượng

### Bảng `user_prizes`
- Liên kết user và giải thưởng
- `verification_status`: pending/verified/rejected

## 🔧 API Endpoints

### 1. Lưu thông tin liên hệ
```bash
POST /api/save-contact
Content-Type: application/json

{
    "token": "verification_token",
    "phone": "0901234567",
    "email": "user@example.com"
}
```

### 2. Lưu giải thưởng
```bash
POST /api/save-prize
Content-Type: application/json

{
    "psid": "user_psid",
    "prizeId": 1,
    "verificationStatus": "pending"
}
```

### 3. Lấy danh sách users (admin)
```bash
GET /api/users?limit=100&offset=0
```

## 🎮 Tích hợp trang game

### 1. Include JavaScript API
```html
<script src="facebook-chatbot-api.js"></script>
```

### 2. Xử lý khi trúng thưởng
```javascript
// Khi người dùng trúng giải
const prizeId = 1; // ID từ bảng prizes
const prizeName = "Voucher 500k";
const prizeValue = "500,000đ";

fbChatbotAPI.handlePrizeWon(prizeId, prizeName, prizeValue);
```

### 3. Chỉ thu thập số điện thoại
```javascript
fbChatbotAPI.showPhoneForm(
    (result) => console.log('Đã lưu:', result),
    (error) => console.error('Lỗi:', error)
);
```

## 👨‍💼 Admin Interface

### Truy cập
```
URL: http://localhost/vongquay4/admin/users.php
Username: admin
Password: changeme123
```

### Tính năng
- ✅ Xem danh sách người dùng
- ✅ Xem thông tin: tên, avatar, SĐT, email
- ✅ Quản lý giải thưởng chờ xác minh
- ✅ Xác minh/từ chối giải thưởng
- ✅ Xuất danh sách (có thể thêm)

### Thống kê
- Tổng số người dùng
- Số người đã có SĐT
- Số giải chờ xác minh
- Tổng giải thưởng đã trao

## 🔐 Bảo mật

### 1. Thay đổi mật khẩu admin
```php
// Trong admin/auth.php
$ADMIN_USER = 'your_username';
$ADMIN_PASS = 'your_strong_password';
```

### 2. Sử dụng HTTPS
- Bắt buộc cho production
- Railway tự động có SSL

### 3. Validation
- Phone: chỉ cho phép số và ký tự đặc biệt
- Token: có thời hạn 24h
- SQL injection protected

## 🧪 Testing

### 1. Test chatbot locally
```bash
# Chạy chatbot
npm start

# Test webhook
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"page","entry":[{"messaging":[{"sender":{"id":"test"},"message":{"text":"hello"}}]}]}'
```

### 2. Test API endpoints
```bash
# Test save contact
curl -X POST http://localhost/vongquay4/api/game.php \
  -H "Content-Type: application/json" \
  -d '{"action":"save_contact","token":"test_token","phone":"0901234567"}'
```

## 🚀 Deployment

### 1. Railway
```bash
# Push code sẽ tự động deploy
git add .
git commit -m "Add database integration"
git push origin master
```

### 2. Hosting (InfinityFree)
- Upload admin files qua File Manager
- Database đã có sẵn

## 📈 Monitoring

### 1. Logs
- Railway: xem logs trong dashboard
- PHP: check error logs

### 2. Database
- Theo dõi số lượng users
- Kiểm tra giải thưởng pending

## 🛠️ Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra credentials trong .env
# Đảm bảo database exists
# Check firewall/security groups
```

### Token hết hạn
```bash
# Token có thời hạn 24h
# User cần nhắn tin lại để lấy token mới
```

### Admin không truy cập được
```bash
# Kiểm tra username/password trong auth.php
# Đảm bảo file có permission đọc
```

## 📞 Support

- GitHub Issues: https://github.com/vut08905/fbbot-googlesheet/issues
- Email: [your-email]

## 📝 Changelog

### v1.0.0
- ✅ Database integration
- ✅ User management
- ✅ Prize system
- ✅ Admin interface
- ✅ JavaScript API
- ✅ Token-based security
