// app/api/productos/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// PATCH – update a product and its variants
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, precio, imagen, variantes } = body;

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        // update product
        await connection.execute(
            'UPDATE productos SET nombre = ?, precio = ?, imagen = ? WHERE id = ?',
            [nombre, parseFloat(precio), imagen || null, id]
        );

        // handle variants
        if (Array.isArray(variantes)) {
            const [existingRows] = await connection.execute<RowDataPacket[]>(
                'SELECT id FROM producto_variantes WHERE productoId = ?',
                [id]
            );

            const existingIds = existingRows.map((v: any) => v.id);
            const incomingIds = variantes.filter(v => v.id).map(v => v.id);

            // delete removed variants
            const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));

            if (toDelete.length > 0) {
                const placeholders = toDelete.map(() => '?').join(',');
                await connection.execute(
                    `DELETE FROM producto_variantes WHERE id IN (${placeholders})`,
                    toDelete
                );
            }

            // insert & update
            for (const variante of variantes) {
                if (variante.id) {
                    await connection.execute(
                        'UPDATE producto_variantes SET nombre = ?, precio = ?, sku = ?, imagen = ?, activo = ? WHERE id = ? AND productoId = ?',
                        [
                            variante.nombre,
                            parseFloat(variante.precio) || 0,
                            variante.sku || null,
                            variante.imagen || null,
                            variante.activo !== false ? 1 : 0,
                            variante.id,
                            id
                        ]
                    );
                } else {
                    await connection.execute(
                        'INSERT INTO producto_variantes (productoId, nombre, precio, sku, imagen, activo) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            id,
                            variante.nombre,
                            parseFloat(variante.precio) || 0,
                            variante.sku || null,
                            variante.imagen || null,
                            variante.activo !== false ? 1 : 0
                        ]
                    );
                }
            }
        }

        await connection.commit();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        await connection.rollback();
        return NextResponse.json(
            { error: 'Error al actualizar producto', details: error.message },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

// DELETE
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute('DELETE FROM pedido_items WHERE productoId = ?', [id]);
        await connection.execute('DELETE FROM producto_variantes WHERE productoId = ?', [id]);
        await connection.execute('DELETE FROM productos WHERE id = ?', [id]);

        await connection.commit();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        await connection.rollback();
        return NextResponse.json(
            { error: 'Error al eliminar producto', details: error.message },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}