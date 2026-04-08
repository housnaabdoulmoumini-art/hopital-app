const { pool } = require('../config/database');

class Notification {
    static async create(data) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, titre, message, data)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.user_id, data.type, data.titre, data.message, data.data]
        );
        return result.rows[0];
    }

    static async findByUser(userId) {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        return result.rows;
    }

    static async markAsRead(id) {
        const result = await pool.query(
            'UPDATE notifications SET lu = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    static async getNonLu(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND lu = false',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = Notification;
