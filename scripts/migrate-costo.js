const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also load .env if exists

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'ordeneya',
    });

    try {
        console.log('Adding costo column to productos...');
        try {
            await connection.query('ALTER TABLE productos ADD COLUMN costo DECIMAL(10,2) DEFAULT 0');
            console.log('✅ Added costo to productos');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column costo already exists in productos');
            } else {
                throw e;
            }
        }

        console.log('Adding costo column to producto_variantes...');
        try {
            await connection.query('ALTER TABLE producto_variantes ADD COLUMN costo DECIMAL(10,2) DEFAULT 0');
            console.log('✅ Added costo to producto_variantes');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column costo already exists in producto_variantes');
            } else {
                throw e;
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
