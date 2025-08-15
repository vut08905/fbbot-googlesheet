# Test script để kiểm tra webhook sau khi deploy

# 1. Test webhook verification (GET request)
Write-Host "=== TESTING WEBHOOK VERIFICATION ===" -ForegroundColor Green
Write-Host "URL to test: https://fbbot-googlesheet-production.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=Vtoan123@&hub.challenge=test123"
Write-Host ""

# 2. Test webhook message handling (POST request)
$body = @{
    object = "page"
    entry = @(
        @{
            messaging = @(
                @{
                    sender = @{ id = "123456789" }
                    message = @{ text = "Hello test message" }
                }
            )
        }
    )
} | ConvertTo-Json -Depth 4

Write-Host "=== TEST POST REQUEST ===" -ForegroundColor Green
Write-Host "Command to run after deploy:"
Write-Host "Invoke-RestMethod -Uri 'https://fbbot-googlesheet-production.up.railway.app/webhook' -Method POST -ContentType 'application/json' -Body '$body'"
Write-Host ""

Write-Host "=== EXPECTED RESPONSE ===" -ForegroundColor Green
Write-Host "Should return: EVENT_RECEIVED"
Write-Host ""

Write-Host "=== CHECK RAILWAY LOGS ===" -ForegroundColor Yellow
Write-Host "In Railway dashboard, check 'Deployments' tab to see logs"
Write-Host "Look for messages like:"
Write-Host "- WEBHOOK_VERIFIED"
Write-Host "- RECEIVED WEBHOOK"
Write-Host "- MESSAGE SENT SUCCESSFULLY"
