// app/api/productos/route.ts

import { NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    imagen?: string;
    variantes?: any[];
}

export async function GET() {
    try {
        const productos = await query<Producto[]>(
            'SELECT id, nombre, precio, imagen FROM productos ORDER BY id ASC'
        );

        const productosWithVariants = await Promise.all(productos.map(async (producto) => {
            const variants = await query(
                'SELECT id, nombre, precio, sku, imagen, activo FROM producto_variantes WHERE productoId = ? AND activo = true',
                [producto.id]
            );
            return { ...producto, variantes: variants };
        }));

        return NextResponse.json(productosWithVariants);
    } catch (error) {
        console.error('Error fetching productos:', error);
        return NextResponse.json(
            { error: 'Error al cargar productos' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const connection = await getConnection();
    try {
        const body = await request.json();
        const { nombre, precio, imagen, variantes } = body;

        if (!nombre || !precio) {
            return NextResponse.json(
                { error: 'Nombre y precio son requeridos' },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        const [result] = await connection.execute<ResultSetHeader>(
            'INSERT INTO productos (nombre, precio, imagen) VALUES (?, ?, ?)',
            [nombre, parseFloat(precio), imagen || null]
        );

        const productoId = result.insertId;

        if (variantes && Array.isArray(variantes)) {
            for (const variante of variantes) {
                await connection.execute(
                    'INSERT INTO producto_variantes (productoId, nombre, precio, sku, imagen, activo) VALUES (?, ?, ?, ?, ?, ?)',
                    [productoId, variante.nombre, variante.precio, variante.sku || null, variante.imagen || null, variante.activo !== false]
                );
            }
        }

        await connection.commit();

        const [newProducto] = await connection.execute<RowDataPacket[]>(
            'SELECT id, nombre, precio, imagen FROM productos WHERE id = ?',
            [productoId]
        );

        const [newVariantes] = await connection.execute<RowDataPacket[]>(
            'SELECT id, nombre, precio, sku, imagen, activo FROM producto_variantes WHERE productoId = ?',
            [productoId]
        );

        return NextResponse.json({ ...newProducto[0], variantes: newVariantes }, { status: 201 });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating producto:', error);
        return NextResponse.json(
            { error: 'Error al crear producto' },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
