/**
 * JavaScript API để tích hợp với hệ thống chatbot Facebook
 * Sử dụng trong trang game để lưu thông tin người dùng và giải thưởng
 */

class FacebookChatbotAPI {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint || 'https://fbbot-googlesheet-production.up.railway.app/api/game.php';
        this.token = this.getTokenFromURL();
        this.userInfo = null;
    }

    /**
     * Lấy token từ URL parameter
     */
    getTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token') || urlParams.get('psid');
    }

    /**
     * Lấy thông tin user từ token
     */
    async getUserInfo() {
        if (!this.token) {
            throw new Error('Không tìm thấy token trong URL');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_user',
                    token: this.token
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.userInfo = data.data;
                return this.userInfo;
            } else {
                throw new Error(data.error || 'Không thể lấy thông tin user');
            }
        } catch (error) {
            console.error('Get user info error:', error);
            throw error;
        }
    }

    /**
     * Lưu số điện thoại và email của user
     */
    async saveContact(phone, email = '') {
        if (!this.token) {
            throw new Error('Không tìm thấy token');
        }

        // Validate phone
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(phone)) {
            throw new Error('Số điện thoại không hợp lệ');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save_contact',
                    token: this.token,
                    phone: phone,
                    email: email
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Không thể lưu thông tin');
            }
        } catch (error) {
            console.error('Save contact error:', error);
            throw error;
        }
    }

    /**
     * Lưu thông tin trúng giải thưởng
     */
    async savePrize(prizeId, verificationStatus = 'pending') {
        if (!this.token) {
            throw new Error('Không tìm thấy token');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save_prize',
                    token: this.token,
                    prize_id: prizeId,
                    verification_status: verificationStatus
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Không thể lưu giải thưởng');
            }
        } catch (error) {
            console.error('Save prize error:', error);
            throw error;
        }
    }

    /**
     * Hiển thị form nhập số điện thoại
     */
    showPhoneForm(onSuccess, onError) {
        const modalHTML = `
            <div id="phoneModal" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.8); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                z-index: 9999;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    max-width: 400px; 
                    width: 90%;
                    text-align: center;
                ">
                    <h3 style="margin-bottom: 20px; color: #4267B2;">🎉 Chúc mừng!</h3>
                    <p style="margin-bottom: 20px;">Để nhận giải thưởng, vui lòng nhập số điện thoại:</p>
                    
                    <form id="phoneForm">
                        <input type="tel" id="phoneInput" placeholder="Nhập số điện thoại" required style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #ddd; 
                            border-radius: 5px; 
                            margin-bottom: 15px;
                            font-size: 16px;
                        ">
                        
                        <input type="email" id="emailInput" placeholder="Email (tùy chọn)" style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #ddd; 
                            border-radius: 5px; 
                            margin-bottom: 20px;
                            font-size: 16px;
                        ">
                        
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button type="submit" style="
                                background: #4267B2; 
                                color: white; 
                                border: none; 
                                padding: 12px 24px; 
                                border-radius: 5px; 
                                cursor: pointer;
                                font-size: 16px;
                            ">💾 Lưu thông tin</button>
                            
                            <button type="button" id="cancelBtn" style="
                                background: #ccc; 
                                color: black; 
                                border: none; 
                                padding: 12px 24px; 
                                border-radius: 5px; 
                                cursor: pointer;
                                font-size: 16px;
                            ">❌ Hủy</button>
                        </div>
                    </form>
                    
                    <div id="phoneMessage" style="margin-top: 15px; display: none;"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('phoneModal');
        const form = document.getElementById('phoneForm');
        const phoneInput = document.getElementById('phoneInput');
        const emailInput = document.getElementById('emailInput');
        const cancelBtn = document.getElementById('cancelBtn');
        const messageDiv = document.getElementById('phoneMessage');

        // Focus vào input
        phoneInput.focus();

        // Xử lý submit form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = phoneInput.value.trim();
            const email = emailInput.value.trim();
            
            if (!phone) {
                this.showMessage(messageDiv, 'Vui lòng nhập số điện thoại!', 'error');
                return;
            }

            try {
                this.showMessage(messageDiv, 'Đang lưu thông tin...', 'info');
                
                const result = await this.saveContact(phone, email);
                
                this.showMessage(messageDiv, '✅ Đã lưu thông tin thành công!', 'success');
                
                setTimeout(() => {
                    modal.remove();
                    if (onSuccess) onSuccess(result);
                }, 1500);
                
            } catch (error) {
                this.showMessage(messageDiv, '❌ ' + error.message, 'error');
                if (onError) onError(error);
            }
        });

        // Xử lý nút hủy
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Đóng modal khi click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Hiển thị thông báo
     */
    showMessage(element, message, type) {
        const colors = {
            success: '#d4edda',
            error: '#f8d7da',
            info: '#d1ecf1'
        };
        
        element.style.display = 'block';
        element.style.background = colors[type] || colors.info;
        element.style.padding = '10px';
        element.style.borderRadius = '5px';
        element.style.marginTop = '10px';
        element.textContent = message;
    }

    /**
     * Xử lý khi người dùng trúng thưởng
     */
    async handlePrizeWon(prizeId, prizeName, prizeValue) {
        try {
            // Hiển thị thông báo trúng thưởng
            this.showPrizeNotification(prizeName, prizeValue);
            
            // Lưu thông tin trúng thưởng
            await this.savePrize(prizeId);
            
            // Hiển thị form nhập số điện thoại
            this.showPhoneForm(
                (result) => {
                    console.log('Đã lưu thông tin thành công:', result);
                    this.showFinalMessage();
                },
                (error) => {
                    console.error('Lỗi lưu thông tin:', error);
                }
            );
            
        } catch (error) {
            console.error('Handle prize won error:', error);
        }
    }

    /**
     * Hiển thị thông báo trúng thưởng
     */
    showPrizeNotification(prizeName, prizeValue) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4267B2;
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
        `;
        
        notification.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">🎉 Chúc mừng!</h4>
            <p style="margin: 0;">Bạn đã trúng: <strong>${prizeName}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 18px;">💰 ${prizeValue}</p>
        `;
        
        document.body.appendChild(notification);
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Hiển thị thông báo cuối
     */
    showFinalMessage() {
        alert('🎉 Cảm ơn bạn! Thông tin của bạn đã được lưu. Chúng tôi sẽ liên hệ sớm để trao giải!');
    }
}

// Ví dụ sử dụng
window.FacebookChatbotAPI = FacebookChatbotAPI;

// Auto-init khi trang load
document.addEventListener('DOMContentLoaded', function() {
    window.fbChatbotAPI = new FacebookChatbotAPI();
    
    // Lấy thông tin user nếu có token
    if (window.fbChatbotAPI.token) {
        window.fbChatbotAPI.getUserInfo()
            .then(userInfo => {
                console.log('User info:', userInfo);
                // Có thể hiển thị tên user trên giao diện
                if (userInfo.first_name) {
                    const welcomeElement = document.querySelector('.welcome-message');
                    if (welcomeElement) {
                        welcomeElement.textContent = `Xin chào ${userInfo.first_name}!`;
                    }
                }
            })
            .catch(error => {
                console.log('Không thể lấy thông tin user:', error.message);
            });
    }
});

/* 
HƯỚNG DẪN SỬ DỤNG:

1. Include file này vào trang game:
   <script src="facebook-chatbot-api.js"></script>

2. Sử dụng khi người dùng trúng thưởng:
   
   // ID giải thưởng (tương ứng với bảng prizes)
   const prizeId = 1; // Giải Nhất
   const prizeName = "Voucher 500k";
   const prizeValue = "500,000đ";
   
   fbChatbotAPI.handlePrizeWon(prizeId, prizeName, prizeValue);

3. Hoặc chỉ hiển thị form nhập số điện thoại:
   
   fbChatbotAPI.showPhoneForm(
       (result) => console.log('Success:', result),
       (error) => console.error('Error:', error)
   );

4. Lưu thông tin liên hệ đơn giản:
   
   fbChatbotAPI.saveContact('0901234567', 'email@example.com')
       .then(result => console.log('Saved!'))
       .catch(error => console.error('Error:', error));
*/
