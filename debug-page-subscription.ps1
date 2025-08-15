# Kiểm tra Page Subscription

$pageToken = "EAAU4ueJSwM0BPE6d6ZAeQBvXG3lBRtkZBNAJadxugUt0e4msRknyyn51ZC9EAjEz9vEtqQEHZAaFZBJ7KabZC3rlhi8ySCnteHyGiQgO9HC9nJnUmjwzVFg26ymieyGsVJV2Sd5hpCs862vbJJ4F3jLXj70FURu1NfVLR15jWmiZCmgDQQ7G64nVxm1rWZA6HuBXOnZCIxMbsswZDZD"
$webhookUrl = "https://fbbotgooglesheet-production.up.railway.app/webhook"
$verifyToken = "Vtoan123@"

Write-Host "=== KIỂM TRA WEBHOOK STATUS ===" -ForegroundColor Green

# Test webhook endpoint
try {
    Write-Host "Testing webhook endpoint..." -ForegroundColor Yellow
    $testResponse = Invoke-RestMethod -Uri $webhookUrl -Method GET -Headers @{"User-Agent"="FacebookBot"}
    Write-Host "Webhook response: $testResponse" -ForegroundColor Green
} catch {
    Write-Host "Webhook test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Kiểm tra subscribed webhooks
Write-Host "`nKiểm tra Page Subscriptions..." -ForegroundColor Yellow
try {
    $subscriptionsUrl = "https://graph.facebook.com/v7.0/me/subscribed_apps?access_token=$pageToken"
    $subscriptions = Invoke-RestMethod -Uri $subscriptionsUrl -Method GET
    Write-Host "Page Subscriptions:" -ForegroundColor Green
    $subscriptions.data | ForEach-Object { 
        Write-Host "App: $($_.category) - $($_.link)" -ForegroundColor White 
    }
} catch {
    Write-Host "Failed to get subscriptions: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== HƯỚNG DẪN DEBUG ===" -ForegroundColor Cyan
Write-Host "1. Kiểm tra App có được subscribed tới Page không" -ForegroundColor White
Write-Host "2. Xem App Review status trong Facebook Developer" -ForegroundColor White  
Write-Host "3. Thêm test users nếu App chưa được approve" -ForegroundColor White
Write-Host "4. Kiểm tra webhook fields subscription: messages, messaging_postbacks" -ForegroundColor White
