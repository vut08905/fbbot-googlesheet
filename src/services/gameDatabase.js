const mysql = require('mysql2/promise');

// Database configuration - sử dụng environment variables hoặc fallback
const dbConfig = {
    host: process.env.GAME_DB_HOST || 'localhost',
    port: process.env.GAME_DB_PORT || 3306,
    user: process.env.GAME_DB_USER || 'root',
    password: process.env.GAME_DB_PASS || '',
    database: process.env.GAME_DB_NAME || 'vong_quay_db',
    charset: 'utf8mb4',
    timezone: '+07:00'
};

let connection = null;

// Tạo kết nối database
async function getConnection() {
    if (!connection) {
        try {
            connection = await mysql.createConnection(dbConfig);
            console.log('Connected to game database');
        } catch (error) {
            console.error('Database connection error:', error);
            throw error;
        }
    }
    return connection;
}

// Lưu hoặc cập nhật thông tin user
async function saveUser(userData) {
    const conn = await getConnection();
    const { psid, first_name, last_name, profile_pic, phone, email } = userData;
    
    const facebook_name = `${first_name || ''} ${last_name || ''}`.trim();
    
    const query = `
        INSERT INTO users (psid, facebook_name, first_name, last_name, profile_pic, phone, email, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            facebook_name = VALUES(facebook_name),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            profile_pic = VALUES(profile_pic),
            phone = VALUES(phone),
            email = VALUES(email),
            updated_at = NOW()
    `;
    
    try {
        const [result] = await conn.execute(query, [
            psid, facebook_name, first_name, last_name, profile_pic, phone, email
        ]);
        return result;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
}

// Tạo verification token
async function createVerificationToken(psid) {
    const conn = await getConnection();
    const token = require('crypto').randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    const query = `
        INSERT INTO verification_tokens (token, psid, expires_at)
        VALUES (?, ?, ?)
    `;
    
    try {
        await conn.execute(query, [token, psid, expiresAt]);
        return token;
    } catch (error) {
        console.error('Error creating verification token:', error);
        throw error;
    }
}

// Lấy psid từ token
async function getPsidFromToken(token) {
    const conn = await getConnection();
    const query = `
        SELECT psid FROM verification_tokens 
        WHERE token = ? AND expires_at > NOW() AND used = 0
    `;
    
    try {
        const [rows] = await conn.execute(query, [token]);
        return rows.length > 0 ? rows[0].psid : null;
    } catch (error) {
        console.error('Error getting PSID from token:', error);
        throw error;
    }
}

// Đánh dấu token đã sử dụng
async function markTokenUsed(token) {
    const conn = await getConnection();
    const query = `UPDATE verification_tokens SET used = 1 WHERE token = ?`;
    
    try {
        await conn.execute(query, [token]);
    } catch (error) {
        console.error('Error marking token as used:', error);
        throw error;
    }
}

module.exports = {
    getConnection,
    saveUser,
    createVerificationToken,
    getPsidFromToken,
    markTokenUsed
};
