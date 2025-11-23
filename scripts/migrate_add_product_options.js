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

        // Add opciones to productos
        try {
            await connection.query(`
                ALTER TABLE productos
                ADD COLUMN opciones JSON NULL
            `);
            console.log('Added opciones column to productos table.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Column opciones already exists in productos.');
            } else {
                throw error;
            }
        }

        // Add opcionesSeleccionadas to pedido_items
        try {
            await connection.query(`
                ALTER TABLE pedido_items
                ADD COLUMN opcionesSeleccionadas JSON NULL
            `);
            console.log('Added opcionesSeleccionadas column to pedido_items table.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Column opcionesSeleccionadas already exists in pedido_items.');
            } else {
                throw error;
            }
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
