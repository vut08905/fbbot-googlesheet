<?php
// Admin Authentication
$ADMIN_USER = 'admin';  // Thay đổi username
$ADMIN_PASS = 'changeme123';  // Thay đổi password

if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== $ADMIN_USER || $_SERVER['PHP_AUTH_PW'] !== $ADMIN_PASS) {
    header('WWW-Authenticate: Basic realm="Admin Area - Quản lý người dùng Facebook"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Truy cập không được phép. Vui lòng đăng nhập.';
    exit;
}
?>
