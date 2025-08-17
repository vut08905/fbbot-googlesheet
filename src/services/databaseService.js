const mysql = require('mysql2/promise');

class DatabaseService {
    constructor() {
        this.pool = null;
        this.initPool();
    }

    initPool() {
        // Cấu hình database từ environment variables
        const config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'vong_quay_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        };

        this.pool = mysql.createPool(config);
        console.log('Database pool initialized');
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Tạo hoặc cập nhật user từ Facebook
    async saveUser(psid, userData) {
        const { first_name, last_name, profile_pic } = userData;
        
        const sql = `
            INSERT INTO users (psid, first_name, last_name, profile_pic)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            profile_pic = VALUES(profile_pic),
            updated_at = CURRENT_TIMESTAMP
        `;
        
        return await this.query(sql, [psid, first_name, last_name, profile_pic]);
    }

    // Tạo verification token cho user
    async createVerificationToken(psid) {
        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const sql = `
            UPDATE users 
            SET verification_token = ?, token_expires_at = ?
            WHERE psid = ?
        `;

        await this.query(sql, [token, expiresAt, psid]);
        return token;
    }

    // Lưu số điện thoại với verification token
    async savePhoneWithToken(token, phone, email = null) {
        const sql = `
            UPDATE users 
            SET phone = ?, email = ?, is_verified = 1, verification_token = NULL, token_expires_at = NULL
            WHERE verification_token = ? AND token_expires_at > NOW()
        `;

        const result = await this.query(sql, [phone, email, token]);
        return result.affectedRows > 0;
    }

    // Lấy thông tin user bằng PSID
    async getUserByPsid(psid) {
        const sql = 'SELECT * FROM users WHERE psid = ?';
        const rows = await this.query(sql, [psid]);
        return rows[0] || null;
    }

    // Lấy thông tin user bằng token
    async getUserByToken(token) {
        const sql = `
            SELECT * FROM users 
            WHERE verification_token = ? AND token_expires_at > NOW()
        `;
        const rows = await this.query(sql, [token]);
        return rows[0] || null;
    }

    // Lấy tất cả users (cho admin)
    async getAllUsers(limit = 100, offset = 0) {
        const sql = `
            SELECT u.*, 
                   COUNT(up.id) as total_prizes,
                   COUNT(CASE WHEN up.is_claimed = 1 THEN 1 END) as claimed_prizes
            FROM users u
            LEFT JOIN user_prizes up ON u.id = up.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        `;
        return await this.query(sql, [limit, offset]);
    }

    // Lưu thông tin trúng thưởng
    async saveUserPrize(userId, prizeId, verificationStatus = 'pending') {
        const sql = `
            INSERT INTO user_prizes (user_id, prize_id, verification_status)
            VALUES (?, ?, ?)
        `;
        return await this.query(sql, [userId, prizeId, verificationStatus]);
    }

    // Cập nhật trạng thái giải thưởng
    async updatePrizeStatus(userPrizeId, status, notes = null) {
        const sql = `
            UPDATE user_prizes 
            SET verification_status = ?, notes = ?, 
                claimed_at = CASE WHEN ? = 'verified' THEN NOW() ELSE claimed_at END
            WHERE id = ?
        `;
        return await this.query(sql, [status, notes, status, userPrizeId]);
    }

    // Lấy danh sách giải thưởng
    async getAllPrizes() {
        const sql = 'SELECT * FROM prizes WHERE is_active = 1 ORDER BY value DESC';
        return await this.query(sql);
    }

    // Lấy lịch sử trúng thưởng của user
    async getUserPrizes(userId) {
        const sql = `
            SELECT up.*, p.name as prize_name, p.description, p.value
            FROM user_prizes up
            JOIN prizes p ON up.prize_id = p.id
            WHERE up.user_id = ?
            ORDER BY up.won_at DESC
        `;
        return await this.query(sql, [userId]);
    }

    generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = new DatabaseService();
