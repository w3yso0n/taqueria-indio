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
        console.log('🔧 Iniciando migración de numeroPlato...\n');

        // 1. Add numeroPlato column
        console.log('1️⃣ Agregando columna numeroPlato a pedido_items...');
        try {
            await connection.query(
                'ALTER TABLE pedido_items ADD COLUMN numeroPlato INT DEFAULT 1 NOT NULL AFTER varianteNombre'
            );
            console.log('✅ Columna numeroPlato agregada exitosamente');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  Columna numeroPlato ya existe');
            } else {
                throw e;
            }
        }

        // 2. Create index
        console.log('\n2️⃣ Creando índice idx_numeroPlato...');
        try {
            await connection.query('CREATE INDEX idx_numeroPlato ON pedido_items(numeroPlato)');
            console.log('✅ Índice idx_numeroPlato creado exitosamente');
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️  Índice idx_numeroPlato ya existe');
            } else {
                throw e;
            }
        }

        // 3. Normalize existing data (set NULL values to 1)
        console.log('\n3️⃣ Normalizando datos existentes...');
        const [updateResult] = await connection.query(
            'UPDATE pedido_items SET numeroPlato = 1 WHERE numeroPlato IS NULL'
        );
        console.log(`✅ ${updateResult.affectedRows} registros normalizados`);

        // 4. Validate no NULL values remain
        console.log('\n4️⃣ Validando integridad de datos...');
        const [nullCheck] = await connection.query(
            'SELECT COUNT(*) as count FROM pedido_items WHERE numeroPlato IS NULL'
        );
        const nullCount = nullCheck[0].count;

        if (nullCount === 0) {
            console.log('✅ No hay registros con numeroPlato NULL');
        } else {
            console.warn(`⚠️  Advertencia: ${nullCount} registros aún tienen numeroPlato NULL`);
        }

        // 5. Show statistics
        console.log('\n📊 Estadísticas:');
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total_items,
                COUNT(DISTINCT pedidoId) as total_pedidos,
                MAX(numeroPlato) as max_plato
            FROM pedido_items
        `);
        console.log(`   Total items: ${stats[0].total_items}`);
        console.log(`   Total pedidos: ${stats[0].total_pedidos}`);
        console.log(`   Máximo número de plato: ${stats[0].max_plato}`);

        console.log('\n✨ Migración completada exitosamente!\n');

    } catch (error) {
        console.error('\n❌ Error en la migración:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
