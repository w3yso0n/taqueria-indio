// app/api/pedidos/route.ts

import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PedidoItem {
    id: number;
    producto: {
        nombre: string;
    };
    cantidad: number;
    precioUnitario: number;
    notas?: string;
    varianteNombre?: string;
}

interface Pedido {
    id: number;
    clienteNombre: string;
    tipo: string;
    estado: string;
    metodoPago?: string;
    total: number;
    items: PedidoItem[];
    createdAt: string;
    updatedAt: string;
}

export async function GET() {
    try {
        // Get all pedidos
        const pedidos = await query<RowDataPacket[]>(
            `SELECT id, clienteNombre, tipo, estado, metodoPago, total, createdAt, updatedAt 
             FROM pedidos 
             ORDER BY createdAt DESC`
        );

        // For each pedido, get its items
        const pedidosWithItems = await Promise.all(
            pedidos.map(async (pedido) => {
                const items = await query<RowDataPacket[]>(
                    `SELECT pi.id, pi.cantidad, pi.precioUnitario, pi.notas, pi.varianteNombre, p.nombre as productoNombre
                     FROM pedido_items pi
                     JOIN productos p ON pi.productoId = p.id
                     WHERE pi.pedidoId = ?`,
                    [pedido.id]
                );

                return {
                    ...pedido,
                    items: items.map(item => ({
                        id: item.id,
                        producto: {
                            nombre: item.productoNombre
                        },
                        cantidad: item.cantidad,
                        precioUnitario: item.precioUnitario,
                        notas: item.notas,
                        varianteNombre: item.varianteNombre
                    }))
                };
            })
        );

        return NextResponse.json(pedidosWithItems);
    } catch (error) {
        console.error('Error fetching pedidos:', error);
        return NextResponse.json(
            { error: 'Error al cargar pedidos' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const connection = await getConnection();

    try {
        const body = await request.json();
        const { clienteNombre, tipo, items, metodoPago } = body;

        if (!clienteNombre || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Start transaction
        await connection.beginTransaction();

        // Calculate total
        let total = 0;
        const itemsWithPrices = await Promise.all(
            items.map(async (item: any) => {
                // If variant is selected, get price from variant
                let precio = 0;

                if (item.varianteId) {
                    const [variante] = await connection.execute<RowDataPacket[]>(
                        'SELECT precio, nombre FROM producto_variantes WHERE id = ? AND productoId = ?',
                        [item.varianteId, item.productoId]
                    );

                    if (!variante || variante.length === 0) {
                        throw new Error(`Variante ${item.varianteId} no encontrada para producto ${item.productoId}`);
                    }
                    precio = parseFloat(variante[0].precio);
                    item.varianteNombre = variante[0].nombre;
                } else {
                    // Fallback to product base price if no variant
                    const [producto] = await connection.execute<RowDataPacket[]>(
                        'SELECT precio FROM productos WHERE id = ?',
                        [item.productoId]
                    );

                    if (!producto || producto.length === 0) {
                        throw new Error(`Producto ${item.productoId} no encontrado`);
                    }
                    precio = parseFloat(producto[0].precio);
                }

                total += precio * item.cantidad;

                return {
                    ...item,
                    precioUnitario: precio
                };
            })
        );

        // Insert pedido
        const [pedidoResult] = await connection.execute<ResultSetHeader>(
            'INSERT INTO pedidos (clienteNombre, tipo, estado, total, metodoPago) VALUES (?, ?, ?, ?, ?)',
            [clienteNombre, tipo || 'LOCAL', 'RECIBIDO', total, metodoPago || null]
        );

        const pedidoId = pedidoResult.insertId;

        // Insert pedido items
        for (const item of itemsWithPrices) {
            await connection.execute(
                'INSERT INTO pedido_items (pedidoId, productoId, cantidad, precioUnitario, notas, varianteId, varianteNombre) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [pedidoId, item.productoId, item.cantidad, item.precioUnitario, item.notas || null, item.varianteId || null, item.varianteNombre || null]
            );
        }

        // Commit transaction
        await connection.commit();

        // Fetch the created pedido with items
        const [createdPedido] = await connection.execute<RowDataPacket[]>(
            'SELECT id, clienteNombre, tipo, estado, metodoPago, total, createdAt, updatedAt FROM pedidos WHERE id = ?',
            [pedidoId]
        );

        const pedidoItems = await connection.execute<RowDataPacket[]>(
            `SELECT pi.id, pi.cantidad, pi.precioUnitario, pi.notas, pi.varianteNombre, p.nombre as productoNombre
             FROM pedido_items pi
             JOIN productos p ON pi.productoId = p.id
             WHERE pi.pedidoId = ?`,
            [pedidoId]
        );

        const response = {
            ...createdPedido[0],
            items: pedidoItems[0].map((item: any) => ({
                id: item.id,
                producto: {
                    nombre: item.productoNombre
                },
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                notas: item.notas,
                varianteNombre: item.varianteNombre
            }))
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        // Rollback on error
        await connection.rollback();
        console.error('Error creating pedido:', error);
        return NextResponse.json(
            { error: 'Error al crear pedido' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
