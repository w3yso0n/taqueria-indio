import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const date = dateParam ? new Date(dateParam) : new Date();
        const dateStr = date.toISOString().split('T')[0];

        const results = await query<RowDataPacket[]>(
            `SELECT 
                p.nombre,
                SUM(pi.cantidad) as cantidad,
                SUM(pi.cantidad * pi.precioUnitario) as revenue,
                SUM(pi.cantidad * COALESCE(pv.costo, p.costo, 0)) as costo
             FROM pedidos ped
             JOIN pedido_items pi ON ped.id = pi.pedidoId
             JOIN productos p ON pi.productoId = p.id
             LEFT JOIN producto_variantes pv ON pi.varianteId = pv.id
             WHERE DATE(ped.createdAt) = ?
             AND ped.estado IN ('PAGADO', 'ENTREGADO')
             GROUP BY p.id
             ORDER BY revenue DESC
             LIMIT 20`,
            [dateStr]
        );

        const productos = results.map(row => ({
            nombre: row.nombre,
            cantidad: Number(row.cantidad),
            revenue: Number(row.revenue),
            costo: Number(row.costo),
            margen: Number(row.revenue) - Number(row.costo)
        }));

        return NextResponse.json(productos);

    } catch (error) {
        console.error('Error generating products report:', error);
        return NextResponse.json(
            { error: 'Error al generar reporte de productos' },
            { status: 500 }
        );
    }
}
