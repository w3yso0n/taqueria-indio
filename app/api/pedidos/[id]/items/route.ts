import { NextResponse } from 'next/server';
import { getConnection, query } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { normalizarNumeroPlato } from '@/lib/pedido-utils';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const connection = await getConnection();
    const { id } = await params;
    const pedidoId = id;

    try {
        const body = await request.json();
        const { productoId, cantidad, notas, varianteId, numeroPlato } = body;

        // 1. Validation
        if (!productoId || !cantidad || cantidad <= 0) {
            return NextResponse.json(
                { error: 'Datos inválidos: productoId y cantidad > 0 son requeridos' },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        // 2. Check Order Status
        const [pedidos] = await connection.execute<RowDataPacket[]>(
            'SELECT estado FROM pedidos WHERE id = ? FOR UPDATE',
            [pedidoId]
        );

        if (pedidos.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const pedido = pedidos[0];
        if (['ENTREGADO', 'CANCELADO'].includes(pedido.estado)) {
            await connection.rollback();
            return NextResponse.json(
                { error: 'No se pueden agregar items a un pedido cerrado' },
                { status: 400 }
            );
        }

        // 2b. Get existing items to determine next plate number
        const [existingItems] = await connection.execute<RowDataPacket[]>(
            'SELECT numeroPlato FROM pedido_items WHERE pedidoId = ?',
            [pedidoId]
        );

        // 3. Get Product/Variant Price & Validate
        let precio = 0;
        let varianteNombre = null;

        if (varianteId) {
            const [variantes] = await connection.execute<RowDataPacket[]>(
                'SELECT precio, nombre, activo FROM producto_variantes WHERE id = ? AND productoId = ?',
                [varianteId, productoId]
            );

            if (variantes.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Variante no encontrada' }, { status: 400 });
            }
            if (!variantes[0].activo) {
                await connection.rollback();
                return NextResponse.json({ error: 'Variante inactiva' }, { status: 400 });
            }

            precio = parseFloat(variantes[0].precio);
            varianteNombre = variantes[0].nombre;
        } else {
            const [productos] = await connection.execute<RowDataPacket[]>(
                'SELECT precio FROM productos WHERE id = ?',
                [productoId]
            );

            if (productos.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Producto no encontrado' }, { status: 400 });
            }
            // Note: Assuming products don't have an 'activo' flag based on schema, but if they did we'd check it here.
            precio = parseFloat(productos[0].precio);
        }

        // 4. Insert Item with normalized numeroPlato
        const normalizedNumeroPlato = normalizarNumeroPlato(
            numeroPlato,
            existingItems.map(i => ({ numeroPlato: i.numeroPlato }))
        );

        await connection.execute(
            'INSERT INTO pedido_items (pedidoId, productoId, cantidad, precioUnitario, notas, varianteId, varianteNombre, numeroPlato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [pedidoId, productoId, cantidad, precio, notas ?? null, varianteId ?? null, varianteNombre ?? null, normalizedNumeroPlato]
        );

        // 5. Update Order Total (Atomic)
        const totalItem = precio * cantidad;
        await connection.execute(
            'UPDATE pedidos SET total = total + ? WHERE id = ?',
            [totalItem, pedidoId]
        );

        await connection.commit();

        return NextResponse.json({ success: true, message: 'Item agregado correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error adding item to pedido:', error);
        return NextResponse.json(
            { error: 'Error interno al agregar item' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
