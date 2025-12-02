import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        // Default to today if no date provided
        const date = dateParam ? new Date(dateParam) : new Date();
        const dateStr = date.toISOString().split('T')[0];

        // 1. Get Payment Methods Totals & Revenue
        const results = await query<RowDataPacket[]>(
            `SELECT 
                COALESCE(metodoPago, 'sinMetodo') as metodo, 
                SUM(total) as total 
             FROM pedidos 
             WHERE DATE(createdAt) = ? 
             AND estado IN ('PAGADO', 'ENTREGADO')
             GROUP BY metodoPago`,
            [dateStr]
        );

        const totales: Record<string, number> = {
            efectivo: 0,
            tarjeta: 0,
            transferencia: 0,
            sinMetodo: 0
        };

        let totalRevenue = 0;

        results.forEach(row => {
            const metodo = row.metodo.toLowerCase();
            const total = parseFloat(row.total);
            if (totales[metodo] !== undefined) {
                totales[metodo] = total;
            } else {
                totales[metodo] = total;
            }
            totalRevenue += total;
        });

        // 2. Get Order Count
        const countResult = await query<RowDataPacket[]>(
            `SELECT COUNT(*) as count 
             FROM pedidos 
             WHERE DATE(createdAt) = ? 
             AND estado IN ('PAGADO', 'ENTREGADO')`,
            [dateStr]
        );
        const totalPedidos = countResult[0].count;

        // 3. Calculate Margin (Revenue - Cost)
        // Join pedidos -> pedido_items -> productos/variantes to get cost
        const costResult = await query<RowDataPacket[]>(
            `SELECT 
                SUM(
                    pi.cantidad * COALESCE(
                        pv.costo, 
                        p.costo, 
                        0
                    )
                ) as totalCosto
             FROM pedidos ped
             JOIN pedido_items pi ON ped.id = pi.pedidoId
             JOIN productos p ON pi.productoId = p.id
             LEFT JOIN producto_variantes pv ON pi.varianteId = pv.id
             WHERE DATE(ped.createdAt) = ? 
             AND ped.estado IN ('PAGADO', 'ENTREGADO')`,
            [dateStr]
        );

        const totalCosto = parseFloat(costResult[0].totalCosto || '0');
        const totalMargen = totalRevenue - totalCosto;
        const ticketPromedio = totalPedidos > 0 ? totalRevenue / totalPedidos : 0;

        return NextResponse.json({
            totales,
            totalDia: totalRevenue,
            totalPedidos,
            ticketPromedio,
            totalMargen,
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
