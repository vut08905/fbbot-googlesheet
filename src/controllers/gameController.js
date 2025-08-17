const gameDatabase = require('../services/gameDatabase');
const request = require("request");

// API để tạo verification token và gửi link game
let createGameLink = async (req, res) => {
    const { psid } = req.body;
    
    if (!psid) {
        return res.status(400).json({ error: 'PSID is required' });
    }
    
    try {
        // Tạo verification token
        const token = await gameDatabase.createVerificationToken(psid);
        
        // Tạo link game với token
        const gameLink = `https://quan3goc.page.gd/?token=${token}`;
        
        return res.json({ 
            success: true, 
            gameLink: gameLink,
            token: token 
        });
    } catch (error) {
        console.error('Error creating game link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// API để lưu thông tin user từ game
let saveUserFromGame = async (req, res) => {
    const { token, phone, email } = req.body;
    
    if (!token || !phone) {
        return res.status(400).json({ error: 'Token and phone are required' });
    }
    
    try {
        // Lấy PSID từ token
        const psid = await gameDatabase.getPsidFromToken(token);
        if (!psid) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Lấy thông tin user từ Facebook Graph API
        const userProfile = await getUserProfile(psid);
        
        // Lưu thông tin user vào database
        const userData = {
            psid: psid,
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            profile_pic: userProfile.profile_pic || '',
            phone: phone,
            email: email || null
        };
        
        await gameDatabase.saveUser(userData);
        
        // Đánh dấu token đã sử dụng
        await gameDatabase.markTokenUsed(token);
        
        return res.json({ 
            success: true, 
            message: 'User information saved successfully',
            user: {
                name: `${userData.first_name} ${userData.last_name}`.trim(),
                phone: userData.phone
            }
        });
    } catch (error) {
        console.error('Error saving user from game:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function để lấy user profile từ Facebook
function getUserProfile(sender_psid) {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/v7.0/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
            "method": "GET"
        }, (err, res, body) => {
            if (!err) {
                try {
                    const userProfile = JSON.parse(body);
                    console.log('=== USER PROFILE FROM FACEBOOK ===');
                    console.log(JSON.stringify(userProfile, null, 2));
                    resolve(userProfile);
                } catch (parseError) {
                    console.error("Error parsing user profile:", parseError);
                    reject(parseError);
                }
            } else {
                console.error("=== ERROR GETTING USER PROFILE ===");
                console.error("Error:", err);
                reject(err);
            }
        });
    });
}

module.exports = {
    createGameLink,
    saveUserFromGame
};
