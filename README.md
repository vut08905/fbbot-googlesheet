# Facebook Messenger Chatbot với Google Sheets

## Deploy lên Railway

### Các bước deploy:

1. **Commit code lên Git repository**
2. **Đăng nhập Railway.app**
3. **Tạo project mới từ GitHub repository**
4. **Thêm Environment Variables:**
   - `MY_VERIFY_TOKEN=Vtoan123@`
   - `PAGE_ACCESS_TOKEN=your_facebook_page_access_token`
   - `PORT=8080` (Railway sẽ tự động set)

### Environment Variables cần thiết:
```
MY_VERIFY_TOKEN=Vtoan123@
PAGE_ACCESS_TOKEN=EAAU4ueJSwM0BPE6d6ZAeQBvXG3lBRtkZBNAJadxugUt0e4msRknyyn51ZC9EAjEz9vEtqQEHZAaFZBJ7KabZC3rlhi8ySCnteHyGiQgO9HC9nJnUmjwzVFg26ymieyGsVJV2Sd5hpCs862vbJJ4F3jLXj70FURu1NfVLR15jWmiZCmgDQQ7G64nVxm1rWZA6HuBXOnZCIxMbsswZDZD
```

### Sau khi deploy:
1. Copy URL từ Railway (ví dụ: https://your-app.railway.app)
2. Thêm webhook URL trong Facebook Developer: `https://your-app.railway.app/webhook`
3. Verify token: `Vtoan123@`

## Test chatbot:
Gửi tin nhắn đến Facebook Page để test tính năng trả lời tự động bằng tiếng Việt.
