require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    console.log('Starting migration...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'ordeneya',
    });

    try {
        console.log('Connected to database.');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists.');

        // Check if admin exists
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@taqueria.com']);

        if (rows.length === 0) {
            // Insert default admin
            // Hash for 'admin123'
            const hash = '$2b$10$cifDJHVJhvoI1IkICOZsr.qCh6AAzMEo6V//pNf3JLctTvG28Oe7u';
            await connection.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', ['admin@taqueria.com', hash, 'admin']);
            console.log('Default admin user created.');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
