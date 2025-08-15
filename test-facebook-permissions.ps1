# Test Facebook Page Access và Permissions

# Kiểm tra Page Access Token
$pageToken = "EAAU4ueJSwM0BPE6d6ZAeQBvXG3lBRtkZBNAJadxugUt0e4msRknyyn51ZC9EAjEz9vEtqQEHZAaFZBJ7KabZC3rlhi8ySCnteHyGiQgO9HC9nJnUmjwzVFg26ymieyGsVJV2Sd5hpCs862vbJJ4F3jLXj70FURu1NfVLR15jWmiZCmgDQQ7G64nVxm1rWZA6HuBXOnZCIxMbsswZDZD"

Write-Host "=== KIỂM TRA PAGE INFO ===" -ForegroundColor Green
$pageInfoUrl = "https://graph.facebook.com/v7.0/me?access_token=$pageToken"
try {
    $pageInfo = Invoke-RestMethod -Uri $pageInfoUrl -Method GET
    Write-Host "Page Name: $($pageInfo.name)" -ForegroundColor Yellow
    Write-Host "Page ID: $($pageInfo.id)" -ForegroundColor Yellow
} catch {
    Write-Host "Lỗi khi lấy thông tin page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== KIỂM TRA APP INFO ===" -ForegroundColor Green
# Thay YOUR_APP_ID và YOUR_APP_SECRET
$appId = "YOUR_APP_ID"  # Cần thay bằng App ID thật
$appSecret = "YOUR_APP_SECRET"  # Cần thay bằng App Secret thật

if ($appId -ne "YOUR_APP_ID") {
    $appTokenUrl = "https://graph.facebook.com/oauth/access_token?client_id=$appId&client_secret=$appSecret&grant_type=client_credentials"
    try {
        $appToken = Invoke-RestMethod -Uri $appTokenUrl -Method GET
        Write-Host "App Token: $($appToken.access_token)" -ForegroundColor Yellow
        
        $appInfoUrl = "https://graph.facebook.com/v7.0/$appId?access_token=$($appToken.access_token)"
        $appInfo = Invoke-RestMethod -Uri $appInfoUrl -Method GET
        Write-Host "App Name: $($appInfo.name)" -ForegroundColor Yellow
        Write-Host "App Status: $($appInfo.app_status)" -ForegroundColor Yellow
    } catch {
        Write-Host "Lỗi khi lấy thông tin app: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Chưa cấu hình App ID và App Secret" -ForegroundColor Red
}

Write-Host "`n=== HƯỚNG DẪN KHẮC PHỤC ===" -ForegroundColor Cyan
Write-Host "1. Vào Facebook Developer Console" -ForegroundColor White
Write-Host "2. Chọn App của bạn" -ForegroundColor White
Write-Host "3. Messenger -> Settings" -ForegroundColor White
Write-Host "4. Kiểm tra 'App Review' status" -ForegroundColor White
Write-Host "5. Nếu chưa được phê duyệt, làm theo hướng dẫn dưới" -ForegroundColor White
