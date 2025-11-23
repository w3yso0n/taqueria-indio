require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
        console.log('Connected to database.');

        // Create producto_variantes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS producto_variantes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                productoId INT NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                sku VARCHAR(100) NULL,
                imagen VARCHAR(500) NULL,
                activo BOOLEAN DEFAULT true,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE CASCADE
            )
        `);
        console.log('Created producto_variantes table.');

        // Add columns to pedido_items
        try {
            await connection.query(`
                ALTER TABLE pedido_items
                ADD COLUMN varianteId INT NULL,
                ADD COLUMN varianteNombre VARCHAR(255) NULL
            `);
            console.log('Added variant columns to pedido_items.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Variant columns already exist in pedido_items.');
            } else {
                throw error;
            }
        }

        // Add FK for varianteId (optional but good for integrity)
        // Note: If we delete a variant, we might want to keep the order history.
        // So maybe SET NULL or just don't enforce FK strictly for history?
        // The user requirement says "varianteId INT NULL".
        // Let's add a FK but ON DELETE SET NULL to preserve history if possible, 
        // or just rely on varianteNombre for history.
        // Given the requirements, I'll just add the columns.

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
