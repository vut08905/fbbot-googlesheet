# Kiểm tra Page Subscription

$pageToken = "EAAU4ueJSwM0BPE6d6ZAeQBvXG3lBRtkZBNAJadxugUt0e4msRknyyn51ZC9EAjEz9vEtqQEHZAaFZBJ7KabZC3rlhi8ySCnteHyGiQgO9HC9nJnUmjwzVFg26ymieyGsVJV2Sd5hpCs862vbJJ4F3jLXj70FURu1NfVLR15jWmiZCmgDQQ7G64nVxm1rWZA6HuBXOnZCIxMbsswZDZD"
$webhookUrls = @(
    "https://fbbotgooglesheet-production.up.railway.app/webhook",
    "https://fbbot-googlesheet-production.up.railway.app/webhook",  
    "https://fbbotgooglesheet.up.railway.app/webhook",
    "https://fbbot-googlesheet.up.railway.app/webhook"
)
$verifyToken = "Vtoan123@"

Write-Host "=== KIỂM TRA MULTIPLE WEBHOOK URLs ===" -ForegroundColor Green

foreach ($webhookUrl in $webhookUrls) {
    Write-Host "`nTesting: $webhookUrl" -ForegroundColor Yellow
    try {
        # Test với GET request (như Facebook verification)
        $getParams = @{
            'hub.mode' = 'subscribe'
            'hub.verify_token' = $verifyToken
            'hub.challenge' = 'test_challenge'
        }
        $queryString = ($getParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join '&'
        $testUrl = "$webhookUrl" + "?" + $queryString
        
        Write-Host "Testing GET verification..." -ForegroundColor Cyan
        $testResponse = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 10
        Write-Host "✅ SUCCESS: $testResponse" -ForegroundColor Green
        Write-Host "✅ WEBHOOK URL HOẠT ĐỘNG: $webhookUrl" -ForegroundColor Green
        break
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        
        # Test thêm với root endpoint
        try {
            Write-Host "Testing root endpoint..." -ForegroundColor Cyan
            $rootUrl = $webhookUrl -replace "/webhook", "/"
            $rootResponse = Invoke-RestMethod -Uri $rootUrl -Method GET -TimeoutSec 5
            Write-Host "✅ Root endpoint works: $rootResponse" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Root also failed: $($_.Exception.Message)" -ForegroundColor DarkRed
        }
    }
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
