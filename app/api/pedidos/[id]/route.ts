import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { estado, metodoPago } = body;

        const updates: string[] = [];
        const values: any[] = [];

        if (estado) {
            updates.push('estado = ?');
            values.push(estado);
        }

        if (metodoPago !== undefined) {
            updates.push('metodoPago = ?');
            values.push(metodoPago);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No hay datos para actualizar' },
                { status: 400 }
            );
        }

        values.push(id);

        const result = await query<ResultSetHeader>(
            `UPDATE pedidos SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'Pedido no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating pedido:', error);
        return NextResponse.json(
            { error: 'Error al actualizar pedido' },
            { status: 500 }
        );
    }
}