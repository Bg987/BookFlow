const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const pool = mysql.createPool({
    uri: process.env.DB_URL,
    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA)
    }
});


const testDBConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = testDBConnection;
