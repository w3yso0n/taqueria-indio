const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Starting migration: Add metodoPago to pedidos table...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'ordeneya',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

    try {
        const connection = await pool.getConnection();

        // Check if column exists
        const [columns] = await connection.execute(
            `SHOW COLUMNS FROM pedidos LIKE 'metodoPago'`
        );

        if (columns.length > 0) {
            console.log('Column metodoPago already exists. Skipping.');
        } else {
            // Add column
            await connection.execute(
                `ALTER TABLE pedidos ADD COLUMN metodoPago VARCHAR(50) NULL AFTER total`
            );
            console.log('Successfully added metodoPago column to pedidos table.');
        }

        connection.release();

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
