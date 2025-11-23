import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        // Default to today if no date provided
        const date = dateParam ? new Date(dateParam) : new Date();

        // Format date for SQL query (YYYY-MM-DD)
        // We want to match the date part of createdAt
        const dateStr = date.toISOString().split('T')[0];

        const results = await query<RowDataPacket[]>(
            `SELECT 
                COALESCE(metodoPago, 'sinMetodo') as metodo, 
                SUM(total) as total 
             FROM pedidos 
             WHERE DATE(createdAt) = ? 
             AND estado != 'CANCELADO'
             GROUP BY metodoPago`,
            [dateStr]
        );

        const totales: Record<string, number> = {
            efectivo: 0,
            tarjeta: 0,
            transferencia: 0,
            sinMetodo: 0
        };

        let totalDia = 0;

        results.forEach(row => {
            const metodo = row.metodo.toLowerCase();
            const total = parseFloat(row.total);

            if (totales[metodo] !== undefined) {
                totales[metodo] = total;
            } else {
                // Handle unexpected payment methods or map them
                totales[metodo] = total;
            }

            totalDia += total;
        });

        return NextResponse.json({
            totales,
            totalDia,
            fecha: dateStr
        });

    } catch (error) {
        console.error('Error generating corte report:', error);
        return NextResponse.json(
            { error: 'Error al generar reporte' },
            { status: 500 }
        );
    }
}
