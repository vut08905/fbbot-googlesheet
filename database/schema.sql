-- Schema cho database người dùng Facebook chatbot
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    psid VARCHAR(255) UNIQUE NOT NULL COMMENT 'Facebook Page-Scoped ID',
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_pic TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    verification_token VARCHAR(100),
    token_expires_at TIMESTAMP NULL,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_psid (psid),
    INDEX idx_phone (phone),
    INDEX idx_verification_token (verification_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng quản lý giải thưởng
CREATE TABLE IF NOT EXISTS prizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    quantity INT DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lịch sử trúng thưởng
CREATE TABLE IF NOT EXISTS user_prizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prize_id INT NOT NULL,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_claimed TINYINT(1) DEFAULT 0,
    claimed_at TIMESTAMP NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE,
    INDEX idx_user_prizes (user_id, prize_id),
    INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert dữ liệu mẫu cho prizes
INSERT IGNORE INTO prizes (name, description, value, quantity) VALUES
('Giải Nhất', 'Voucher 500k', 500000, 1),
('Giải Nhì', 'Voucher 200k', 200000, 2),
('Giải Ba', 'Voucher 100k', 100000, 5),
('Giải Khuyến Khích', 'Voucher 50k', 50000, 10);
