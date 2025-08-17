<?php
// API endpoint để nhận thông tin từ trang game
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database_improved.php';

try {
    $pdo = getPDO();
    createTablesIfNotExists($pdo);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$action = $input['action'] ?? '';

switch ($action) {
    case 'save_contact':
        saveContact($pdo, $input);
        break;
    
    case 'save_prize':
        savePrize($pdo, $input);
        break;
    
    case 'get_user':
        getUser($pdo, $input);
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}

function saveContact($pdo, $input) {
    $token = trim($input['token'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $email = trim($input['email'] ?? '');
    
    if (!$token || !$phone) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token và số điện thoại là bắt buộc']);
        return;
    }
    
    // Validate phone format
    if (!preg_match('/^[0-9+\-\s()]+$/', $phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Số điện thoại không hợp lệ']);
        return;
    }
    
    try {
        $sql = "UPDATE users 
                SET phone = ?, email = ?, is_verified = 1, 
                    verification_token = NULL, token_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE verification_token = ? AND token_expires_at > NOW()";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$phone, $email, $token]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Đã lưu thông tin thành công']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Token không hợp lệ hoặc đã hết hạn']);
        }
    } catch (Exception $e) {
        error_log('Save contact error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Lỗi server']);
    }
}

function savePrize($pdo, $input) {
    $token = trim($input['token'] ?? '');
    $prizeId = intval($input['prize_id'] ?? 0);
    $verificationStatus = $input['verification_status'] ?? 'pending';
    
    if (!$token || !$prizeId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token và Prize ID là bắt buộc']);
        return;
    }
    
    if (!in_array($verificationStatus, ['pending', 'verified', 'rejected'])) {
        $verificationStatus = 'pending';
    }
    
    try {
        // Tìm user bằng token
        $userSql = "SELECT id FROM users WHERE verification_token = ? AND token_expires_at > NOW()";
        $userStmt = $pdo->prepare($userSql);
        $userStmt->execute([$token]);
        $user = $userStmt->fetch();
        
        if (!$user) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Token không hợp lệ hoặc đã hết hạn']);
            return;
        }
        
        // Kiểm tra prize có tồn tại
        $prizeSql = "SELECT id FROM prizes WHERE id = ? AND is_active = 1";
        $prizeStmt = $pdo->prepare($prizeSql);
        $prizeStmt->execute([$prizeId]);
        
        if (!$prizeStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Giải thưởng không tồn tại']);
            return;
        }
        
        // Lưu thông tin trúng thưởng
        $sql = "INSERT INTO user_prizes (user_id, prize_id, verification_status) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['id'], $prizeId, $verificationStatus]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Đã lưu thông tin trúng thưởng',
            'user_prize_id' => $pdo->lastInsertId()
        ]);
    } catch (Exception $e) {
        error_log('Save prize error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Lỗi server']);
    }
}

function getUser($pdo, $input) {
    $token = trim($input['token'] ?? '');
    
    if (!$token) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token là bắt buộc']);
        return;
    }
    
    try {
        $sql = "SELECT u.*, COUNT(up.id) as total_prizes
                FROM users u
                LEFT JOIN user_prizes up ON u.id = up.user_id
                WHERE u.verification_token = ? AND u.token_expires_at > NOW()
                GROUP BY u.id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Không trả về sensitive data
            unset($user['verification_token']);
            echo json_encode(['success' => true, 'data' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Không tìm thấy user hoặc token đã hết hạn']);
        }
    } catch (Exception $e) {
        error_log('Get user error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Lỗi server']);
    }
}
?>
