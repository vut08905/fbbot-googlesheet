<?php
// File cấu hình database được cải tiến để hỗ trợ cả local và hosting
function detectEnvironment() {
    $serverName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost';
    $isLocalhost = in_array($serverName, ['localhost', '127.0.0.1', '::1']) || 
                   strpos($serverName, 'localhost') !== false ||
                   strpos($serverName, '127.0.0.1') !== false;
    
    return $isLocalhost ? 'local' : 'hosting';
}

$environment = detectEnvironment();

if ($environment === 'local') {
    // Localhost configuration (XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'vong_quay_db');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_PORT', '3306');
} else {
    // Hosting configuration (InfinityFree)
    define('DB_HOST', 'sql113.infinityfree.com');
    define('DB_PORT', '3306');
    define('DB_NAME', 'if0_39722476_vong_quay_db');
    define('DB_USER', 'if0_39722476');
    define('DB_PASS', 'lfjaOysrnJ5dKUc');
}

// Environment constant for debugging
define('ENVIRONMENT', $environment);

// Hàm tạo kết nối PDO
function getPDO() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

// Tạo các bảng nếu chưa có
function createTablesIfNotExists($pdo) {
    $sql = "
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

    CREATE TABLE IF NOT EXISTS prizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        value DECIMAL(10,2),
        quantity INT DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    ";
    
    $pdo->exec($sql);
    
    // Insert dữ liệu mẫu cho prizes nếu chưa có
    $checkPrizes = $pdo->query("SELECT COUNT(*) FROM prizes")->fetchColumn();
    if ($checkPrizes == 0) {
        $insertPrizes = "
        INSERT INTO prizes (name, description, value, quantity) VALUES
        ('Giải Nhất', 'Voucher 500k', 500000, 1),
        ('Giải Nhì', 'Voucher 200k', 200000, 2),
        ('Giải Ba', 'Voucher 100k', 100000, 5),
        ('Giải Khuyến Khích', 'Voucher 50k', 50000, 10)
        ";
        $pdo->exec($insertPrizes);
    }
}
?>
