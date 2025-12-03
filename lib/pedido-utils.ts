/**
 * Utilidades compartidas para gestión de pedidos y distribución por platos
 */

export interface PedidoItem {
    id: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    varianteNombre?: string;
    notas?: string;
    numeroPlato: number;
}

export interface PlatoAgrupado {
    numeroPlato: number;
    items: PedidoItem[];
    totalCantidad: number;
    totalPrecio: number;
}

/**
 * Agrupa items por número de plato y calcula totales
 * @param items - Array de items del pedido
 * @returns Array ordenado por numeroPlato ASC con totales calculados
 */
export function agruparPorPlato(items: PedidoItem[]): PlatoAgrupado[] {
    const grupos = new Map<number, PedidoItem[]>();

    items.forEach(item => {
        const plato = item.numeroPlato || 1;
        if (!grupos.has(plato)) {
            grupos.set(plato, []);
        }
        grupos.get(plato)!.push(item);
    });

    return Array.from(grupos.entries())
        .map(([numeroPlato, items]) => ({
            numeroPlato,
            items,
            totalCantidad: items.reduce((sum, i) => sum + i.cantidad, 0),
            totalPrecio: items.reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0)
        }))
        .sort((a, b) => a.numeroPlato - b.numeroPlato);
}

/**
 * Normaliza y valida el número de plato
 * Si el numeroPlato no es válido, asigna (máximo plato actual + 1)
 * @param numeroPlato - Número de plato solicitado
 * @param itemsExistentes - Items ya existentes en el pedido
 * @returns Número de plato válido
 */
export function normalizarNumeroPlato(
    numeroPlato: number | undefined | null,
    itemsExistentes: Array<{ numeroPlato?: number }>
): number {
    // Si ya tiene un número válido, usarlo
    if (numeroPlato && numeroPlato > 0) {
        return numeroPlato;
    }

    // Encontrar el máximo número de plato existente
    const maxPlato = itemsExistentes.reduce((max, item) =>
        Math.max(max, item.numeroPlato || 1), 0
    );

    // Retornar el siguiente número de plato
    return maxPlato + 1;
}

/**
 * Elimina números de plato que no tienen items (platos vacíos)
 * Reasigna platos consecutivos (1, 2, 3...)
 * @param items - Array de items a compactar
 * @returns Array con números de plato consecutivos
 */
export function compactarPlatos<T extends { numeroPlato: number }>(items: T[]): T[] {
    if (items.length === 0) return items;

    // Obtener números de plato únicos y ordenarlos
    const platosUnicos = [...new Set(items.map(i => i.numeroPlato))].sort((a, b) => a - b);

    // Crear un mapa de plato viejo -> plato nuevo (consecutivo)
    const mapaPlatos = new Map(platosUnicos.map((plato, idx) => [plato, idx + 1]));

    // Reasignar números de plato
    return items.map(item => ({
        ...item,
        numeroPlato: mapaPlatos.get(item.numeroPlato) || 1
    }));
}
