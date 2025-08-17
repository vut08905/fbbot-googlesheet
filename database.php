<?php
// Auto-detect environment and configure database accordingly
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
?>
