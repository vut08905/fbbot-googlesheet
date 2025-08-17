// Helper function để lưu thông tin user vào database web vòng quay
const https = require('https');
const http = require('http');

async function saveUserToDatabase(sender_psid, userProfile, messageText = '') {
    try {
        console.log('=== SAVING USER TO WEB DATABASE ===');
        
        // Chuẩn bị dữ liệu user
        const userData = {
            facebook_id: sender_psid,
            full_name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User',
            avatar_url: userProfile.profile_pic || '',
            message_text: messageText
        };
        
        console.log('User data to save:', userData);
        
        // Tạo query string
        const queryParams = new URLSearchParams(userData);
        const postData = queryParams.toString();
        
        // URL API của web vòng quay - THAY ĐỔI DOMAIN NÀY
        const apiUrl = 'quan3goc.infinityfree.com'; // HOẶC domain/IP thực tế của bạn
        const apiPath = '/api/save_facebook_user.php'; // Đường dẫn đã sửa
        
        // Options cho HTTPS request
        const options = {
            hostname: apiUrl,
            port: 443,
            path: apiPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'FacebookBot/1.0'
            }
        };
        
        // Tạo promise để gọi API
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        console.log('=== API RESPONSE ===');
                        console.log(response);
                        
                        if (response.success) {
                            console.log(`✅ User saved successfully: ${response.action}, ID: ${response.user_id}`);
                            resolve(response);
                        } else {
                            console.error('❌ API Error:', response.error);
                            reject(new Error(response.error));
                        }
                    } catch (parseError) {
                        console.error('❌ Failed to parse API response:', parseError);
                        console.error('Raw response:', data);
                        reject(parseError);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ HTTPS Request Error:', error);
                reject(error);
            });
            
            req.on('timeout', () => {
                console.error('❌ Request timeout');
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            // Set timeout
            req.setTimeout(10000); // 10 seconds
            
            // Gửi dữ liệu
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('❌ Error in saveUserToDatabase:', error);
        throw error;
    }
}

module.exports = {
    saveUserToDatabase
};
