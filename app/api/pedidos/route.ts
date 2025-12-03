// app/api/pedidos/route.ts

import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { normalizarNumeroPlato, compactarPlatos } from '@/lib/pedido-utils';

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'today';

        let queryStr = `SELECT id, clienteNombre, tipo, estado, metodoPago, total, createdAt, updatedAt 
             FROM pedidos`;

        const queryParams: any[] = [];

        if (filter === 'today') {
            queryStr += ` WHERE DATE(createdAt) = CURDATE()`;
        }

        queryStr += ` ORDER BY createdAt DESC`;

        // Get all pedidos
        const pedidos = await query<RowDataPacket[]>(queryStr, queryParams);

        // For each pedido, get its items
        const pedidosWithItems = await Promise.all(
            pedidos.map(async (pedido) => {
                const items = await query<RowDataPacket[]>(
                    `SELECT pi.id, pi.cantidad, pi.precioUnitario, pi.notas, pi.varianteNombre, pi.numeroPlato, p.nombre as productoNombre
                     FROM pedido_items pi
                     JOIN productos p ON pi.productoId = p.id
                     WHERE pi.pedidoId = ?
                     ORDER BY pi.numeroPlato ASC, pi.id ASC`,
                    [pedido.id]
                );

                return {
                    ...pedido,
                    items: items.map(item => ({
                        id: item.id,
                        producto: {
                            nombre: item.productoNombre
                        },
                        productoNombre: item.productoNombre,
                        cantidad: item.cantidad,
                        precioUnitario: item.precioUnitario,
                        notas: item.notas,
                        varianteNombre: item.varianteNombre,
                        numeroPlato: item.numeroPlato || 1
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

        // Calculate total and normalize numeroPlato
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
                    precioUnitario: precio,
                    numeroPlato: normalizarNumeroPlato(item.numeroPlato, [])
                };
            })
        );

        // Compact plates to ensure consecutive numbering (1, 2, 3...)
        const itemsCompactados = compactarPlatos(itemsWithPrices);

        // Insert pedido
        const [pedidoResult] = await connection.execute<ResultSetHeader>(
            'INSERT INTO pedidos (clienteNombre, tipo, estado, total, metodoPago) VALUES (?, ?, ?, ?, ?)',
            [clienteNombre, tipo || 'LOCAL', 'RECIBIDO', total, metodoPago || null]
        );

        const pedidoId = pedidoResult.insertId;

        // Insert pedido items with numeroPlato
        for (const item of itemsCompactados) {
            await connection.execute(
                'INSERT INTO pedido_items (pedidoId, productoId, cantidad, precioUnitario, notas, varianteId, varianteNombre, numeroPlato) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [pedidoId, item.productoId, item.cantidad, item.precioUnitario, item.notas || null, item.varianteId || null, item.varianteNombre || null, item.numeroPlato]
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
            `SELECT pi.id, pi.cantidad, pi.precioUnitario, pi.notas, pi.varianteNombre, pi.numeroPlato, p.nombre as productoNombre
             FROM pedido_items pi
             JOIN productos p ON pi.productoId = p.id
             WHERE pi.pedidoId = ?
             ORDER BY pi.numeroPlato ASC, pi.id ASC`,
            [pedidoId]
        );

        const response = {
            ...createdPedido[0],
            items: pedidoItems[0].map((item: any) => ({
                id: item.id,
                producto: {
                    nombre: item.productoNombre
                },
                productoNombre: item.productoNombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                notas: item.notas,
                varianteNombre: item.varianteNombre,
                numeroPlato: item.numeroPlato || 1
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
