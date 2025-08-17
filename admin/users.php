<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../config/database_improved.php';

try {
    $pdo = getPDO();
    createTablesIfNotExists($pdo);
} catch (Exception $e) {
    die("Lỗi kết nối database: " . htmlspecialchars($e->getMessage()));
}

// Xử lý các action
$action = $_GET['action'] ?? '';
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'update_prize_status') {
        $userPrizeId = $_POST['user_prize_id'] ?? 0;
        $status = $_POST['status'] ?? '';
        $notes = $_POST['notes'] ?? '';
        
        if ($userPrizeId && in_array($status, ['pending', 'verified', 'rejected'])) {
            $sql = "UPDATE user_prizes SET verification_status = ?, notes = ?, 
                    claimed_at = CASE WHEN ? = 'verified' THEN NOW() ELSE claimed_at END
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$status, $notes, $status, $userPrizeId]);
            $message = "Đã cập nhật trạng thái giải thưởng thành công!";
        }
    }
    
    if ($action === 'delete_user') {
        $userId = $_POST['user_id'] ?? 0;
        if ($userId) {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $message = "Đã xóa người dùng thành công!";
        }
    }
}

// Lấy danh sách users với thông tin giải thưởng
$sql = "
    SELECT u.*, 
           COUNT(up.id) as total_prizes,
           COUNT(CASE WHEN up.is_claimed = 1 THEN 1 END) as claimed_prizes,
           COUNT(CASE WHEN up.verification_status = 'pending' THEN 1 END) as pending_prizes
    FROM users u
    LEFT JOIN user_prizes up ON u.id = up.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
";
$users = $pdo->query($sql)->fetchAll();

// Lấy danh sách giải thưởng cần xác minh
$pendingSql = "
    SELECT up.*, u.first_name, u.last_name, u.phone, u.profile_pic, p.name as prize_name, p.value
    FROM user_prizes up
    JOIN users u ON up.user_id = u.id
    JOIN prizes p ON up.prize_id = p.id
    WHERE up.verification_status = 'pending'
    ORDER BY up.won_at DESC
";
$pendingPrizes = $pdo->query($pendingSql)->fetchAll();
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Quản lý người dùng Facebook</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: #4267B2; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-card h3 { color: #4267B2; font-size: 2em; margin-bottom: 10px; }
        .stat-card p { color: #666; font-weight: 500; }
        .section { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #dee2e6; border-radius: 8px 8px 0 0; }
        .section-content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; color: #495057; }
        tr:hover { background: #f8f9fa; }
        .avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
        .status { padding: 4px 8px; border-radius: 20px; font-size: 0.85em; font-weight: 500; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.verified { background: #d4edda; color: #155724; }
        .status.rejected { background: #f8d7da; color: #721c24; }
        .btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; text-decoration: none; display: inline-block; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn:hover { opacity: 0.9; }
        .message { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
        .modal-content { background-color: #fefefe; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 500px; }
        .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
        .close:hover { color: black; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .nav-tabs { display: flex; background: #f8f9fa; border-radius: 8px 8px 0 0; }
        .nav-tab { padding: 15px 20px; background: none; border: none; cursor: pointer; flex: 1; }
        .nav-tab.active { background: white; border-bottom: 2px solid #007bff; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .no-data { text-align: center; color: #666; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Admin - Quản lý người dùng Facebook</h1>
            <p>Quản lý người dùng từ Facebook Messenger và giải thưởng</p>
        </div>

        <?php if ($message): ?>
            <div class="message"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <div class="stats">
            <div class="stat-card">
                <h3><?= count($users) ?></h3>
                <p>Tổng người dùng</p>
            </div>
            <div class="stat-card">
                <h3><?= count(array_filter($users, fn($u) => !empty($u['phone']))) ?></h3>
                <p>Đã có SĐT</p>
            </div>
            <div class="stat-card">
                <h3><?= count($pendingPrizes) ?></h3>
                <p>Giải chờ xác minh</p>
            </div>
            <div class="stat-card">
                <h3><?= array_sum(array_column($users, 'total_prizes')) ?></h3>
                <p>Tổng giải thưởng</p>
            </div>
        </div>

        <div class="section">
            <div class="nav-tabs">
                <button class="nav-tab active" onclick="showTab('users')">👥 Người dùng</button>
                <button class="nav-tab" onclick="showTab('prizes')">🏆 Giải chờ xác minh</button>
            </div>

            <div id="users-tab" class="tab-content active">
                <div class="section-content">
                    <?php if (empty($users)): ?>
                        <div class="no-data">
                            <h3>Chưa có người dùng nào</h3>
                            <p>Người dùng sẽ xuất hiện khi họ nhắn tin cho Facebook Page</p>
                        </div>
                    <?php else: ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>Avatar</th>
                                    <th>Tên</th>
                                    <th>SĐT</th>
                                    <th>Email</th>
                                    <th>Giải thưởng</th>
                                    <th>Ngày tham gia</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($users as $user): ?>
                                    <tr>
                                        <td>
                                            <?php if ($user['profile_pic']): ?>
                                                <img src="<?= htmlspecialchars($user['profile_pic']) ?>" alt="Avatar" class="avatar">
                                            <?php else: ?>
                                                <div class="avatar" style="background: #ddd; display: flex; align-items: center; justify-content: center;">👤</div>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <strong><?= htmlspecialchars(trim($user['first_name'] . ' ' . $user['last_name'])) ?></strong>
                                            <br><small>PSID: <?= htmlspecialchars(substr($user['psid'], 0, 20)) ?>...</small>
                                        </td>
                                        <td><?= htmlspecialchars($user['phone'] ?: 'Chưa có') ?></td>
                                        <td><?= htmlspecialchars($user['email'] ?: 'Chưa có') ?></td>
                                        <td>
                                            <span class="btn btn-primary" style="font-size: 0.8em;"><?= $user['total_prizes'] ?> giải</span>
                                            <?php if ($user['pending_prizes'] > 0): ?>
                                                <span class="btn btn-warning" style="font-size: 0.8em;"><?= $user['pending_prizes'] ?> chờ</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?= date('d/m/Y H:i', strtotime($user['created_at'])) ?></td>
                                        <td>
                                            <?php if ($user['is_verified']): ?>
                                                <span class="status verified">✅ Đã xác minh</span>
                                            <?php else: ?>
                                                <span class="status pending">⏳ Chưa xác minh</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <form method="POST" style="display: inline;" onsubmit="return confirm('Bạn có chắc muốn xóa người dùng này?')">
                                                <input type="hidden" name="action" value="delete_user">
                                                <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                                                <button type="submit" class="btn btn-danger">🗑️ Xóa</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>

            <div id="prizes-tab" class="tab-content">
                <div class="section-content">
                    <?php if (empty($pendingPrizes)): ?>
                        <div class="no-data">
                            <h3>Không có giải thưởng nào chờ xác minh</h3>
                            <p>Các giải thưởng sẽ xuất hiện khi người dùng trúng thưởng từ game</p>
                        </div>
                    <?php else: ?>
                        <table>
                            <thead>
                                <tr>
                                    <th>Người trúng</th>
                                    <th>Giải thưởng</th>
                                    <th>Giá trị</th>
                                    <th>SĐT</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($pendingPrizes as $prize): ?>
                                    <tr>
                                        <td>
                                            <?php if ($prize['profile_pic']): ?>
                                                <img src="<?= htmlspecialchars($prize['profile_pic']) ?>" alt="Avatar" class="avatar" style="width: 40px; height: 40px; margin-right: 10px; vertical-align: middle;">
                                            <?php endif; ?>
                                            <strong><?= htmlspecialchars(trim($prize['first_name'] . ' ' . $prize['last_name'])) ?></strong>
                                        </td>
                                        <td><strong><?= htmlspecialchars($prize['prize_name']) ?></strong></td>
                                        <td><span class="btn btn-success"><?= number_format($prize['value']) ?>đ</span></td>
                                        <td><?= htmlspecialchars($prize['phone'] ?: 'Chưa có SĐT') ?></td>
                                        <td><?= date('d/m/Y H:i', strtotime($prize['won_at'])) ?></td>
                                        <td><span class="status pending">⏳ Chờ xác minh</span></td>
                                        <td>
                                            <button class="btn btn-success" onclick="updatePrizeStatus(<?= $prize['id'] ?>, 'verified')">✅ Xác minh</button>
                                            <button class="btn btn-danger" onclick="updatePrizeStatus(<?= $prize['id'] ?>, 'rejected')">❌ Từ chối</button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal cập nhật trạng thái giải thưởng -->
    <div id="prizeModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('prizeModal').style.display='none'">&times;</span>
            <h3>Cập nhật trạng thái giải thưởng</h3>
            <form method="POST">
                <input type="hidden" name="action" value="update_prize_status">
                <input type="hidden" name="user_prize_id" id="modal_user_prize_id">
                
                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select name="status" id="modal_status" required>
                        <option value="pending">⏳ Chờ xác minh</option>
                        <option value="verified">✅ Đã xác minh</option>
                        <option value="rejected">❌ Từ chối</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Ghi chú:</label>
                    <textarea name="notes" id="modal_notes" rows="3" placeholder="Nhập ghi chú (tùy chọn)"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary">💾 Lưu thay đổi</button>
                <button type="button" class="btn btn-danger" onclick="document.getElementById('prizeModal').style.display='none'">❌ Hủy</button>
            </form>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tabs
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            const navTabs = document.querySelectorAll('.nav-tab');
            navTabs.forEach(tab => tab.classList.remove('active'));
            
            // Show selected tab
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
        }

        function updatePrizeStatus(userPrizeId, status) {
            document.getElementById('modal_user_prize_id').value = userPrizeId;
            document.getElementById('modal_status').value = status;
            document.getElementById('prizeModal').style.display = 'block';
        }

        // Auto refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
