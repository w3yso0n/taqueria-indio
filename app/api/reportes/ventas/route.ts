import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const daysParam = searchParams.get('days');
        const days = daysParam ? parseInt(daysParam) : 7;

        const results = await query<RowDataPacket[]>(
            `SELECT 
                DATE(createdAt) as fecha, 
                SUM(total) as total 
             FROM pedidos 
             WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             AND estado != 'CANCELADO'
             GROUP BY DATE(createdAt)
             ORDER BY fecha ASC`,
            [days]
        );

        const ventas = results.map(row => ({
            fecha: row.fecha.toISOString().split('T')[0],
            total: parseFloat(row.total)
        }));

        return NextResponse.json(ventas);

    } catch (error) {
        console.error('Error generating sales report:', error);
        return NextResponse.json(
            { error: 'Error al generar reporte de ventas' },
            { status: 500 }
        );
    }
}
