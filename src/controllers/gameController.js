const databaseService = require('../services/databaseService');
const request = require("request");

// API để tạo verification token và gửi link game
let createGameLink = async (req, res) => {
    const { psid } = req.body;
    
    if (!psid) {
        return res.status(400).json({ error: 'PSID is required' });
    }
    
    try {
        // Tạo verification token
        const token = await databaseService.createVerificationToken(psid);
        
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
        // Lấy user từ token
        const user = await databaseService.getUserByToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Lưu phone với token
        const success = await databaseService.savePhoneWithToken(token, phone, email);
        if (!success) {
            return res.status(400).json({ error: 'Failed to save user information' });
        }
        
        return res.json({ 
            success: true, 
            message: 'User information saved successfully',
            user: {
                name: `${user.first_name} ${user.last_name}`.trim(),
                phone: phone
            }
        });
    } catch (error) {
        console.error('Error saving user from game:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createGameLink,
    saveUserFromGame
};
