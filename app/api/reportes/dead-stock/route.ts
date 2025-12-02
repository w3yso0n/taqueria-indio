import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const date = dateParam ? new Date(dateParam) : new Date();
        const dateStr = date.toISOString().split('T')[0];

        // Find products that are NOT in the pedido_items for the given date
        const results = await query<RowDataPacket[]>(
            `SELECT p.id, p.nombre, p.precio, p.costo
             FROM productos p
             WHERE p.id NOT IN (
                SELECT DISTINCT pi.productoId
                FROM pedido_items pi
                JOIN pedidos ped ON pi.pedidoId = ped.id
                WHERE DATE(ped.createdAt) = ?
                AND ped.estado IN ('PAGADO', 'ENTREGADO')
             )
             ORDER BY p.nombre ASC`,
            [dateStr]
        );

        return NextResponse.json(results);

    } catch (error) {
        console.error('Error generating dead stock report:', error);
        return NextResponse.json(
            { error: 'Error al generar reporte de dead stock' },
            { status: 500 }
        );
    }
}
