const databaseService = require('../services/databaseService');

// API để lưu số điện thoại từ trang game
const saveContact = async (req, res) => {
    try {
        const { token, phone, email } = req.body;

        if (!token || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Token và số điện thoại là bắt buộc'
            });
        }

        // Validate phone format
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Số điện thoại không hợp lệ'
            });
        }

        const success = await databaseService.savePhoneWithToken(token, phone, email);
        
        if (success) {
            res.json({
                success: true,
                message: 'Đã lưu thông tin thành công'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    } catch (error) {
        console.error('Save contact error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

// API để lấy thông tin user (cho admin)
const getAllUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const users = await databaseService.getAllUsers(limit, offset);
        
        res.json({
            success: true,
            data: users,
            pagination: {
                limit,
                offset,
                total: users.length
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

// API để lưu thông tin trúng thưởng
const savePrize = async (req, res) => {
    try {
        const { psid, prizeId, verificationStatus = 'pending' } = req.body;

        if (!psid || !prizeId) {
            return res.status(400).json({
                success: false,
                error: 'PSID và Prize ID là bắt buộc'
            });
        }

        // Tìm user bằng PSID
        const user = await databaseService.getUserByPsid(psid);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy user'
            });
        }

        const result = await databaseService.saveUserPrize(user.id, prizeId, verificationStatus);
        
        res.json({
            success: true,
            message: 'Đã lưu thông tin trúng thưởng',
            data: { userPrizeId: result.insertId }
        });
    } catch (error) {
        console.error('Save prize error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

// API để cập nhật trạng thái giải thưởng
const updatePrizeStatus = async (req, res) => {
    try {
        const { userPrizeId } = req.params;
        const { status, notes } = req.body;

        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Trạng thái không hợp lệ'
            });
        }

        await databaseService.updatePrizeStatus(userPrizeId, status, notes);
        
        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái giải thưởng'
        });
    } catch (error) {
        console.error('Update prize status error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

// API để lấy danh sách giải thưởng
const getPrizes = async (req, res) => {
    try {
        const prizes = await databaseService.getAllPrizes();
        
        res.json({
            success: true,
            data: prizes
        });
    } catch (error) {
        console.error('Get prizes error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

// API để lấy lịch sử trúng thưởng của user
const getUserPrizes = async (req, res) => {
    try {
        const { psid } = req.params;
        
        const user = await databaseService.getUserByPsid(psid);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy user'
            });
        }

        const prizes = await databaseService.getUserPrizes(user.id);
        
        res.json({
            success: true,
            data: {
                user: user,
                prizes: prizes
            }
        });
    } catch (error) {
        console.error('Get user prizes error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

module.exports = {
    saveContact,
    getAllUsers,
    savePrize,
    updatePrizeStatus,
    getPrizes,
    getUserPrizes
};
