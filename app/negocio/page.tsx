'use client';

import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ArrowLeft, Clock, CheckCircle2, ChefHat, Package, Banknote, CreditCard, HelpCircle, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export interface Pedido {
    id: number;
    clienteNombre: string;
    estado: string;
    total: number;
    items: {
        producto: {
            nombre: string;
        };
        cantidad: number;
        varianteNombre?: string;
        notas?: string;
    }[];
    metodoPago?: string;
    createdAt: string;
}

const fetcher = (url: string) => api.get(url);

const PAYMENT_METHODS = [
    { id: 'Efectivo', icon: Banknote, color: 'text-green-600 bg-green-50' },
    { id: 'Tarjeta', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { id: 'Transferencia', icon: ArrowLeft, color: 'text-purple-600 bg-purple-50' },
];

const COLUMNS = [
    { id: 'RECIBIDO', title: 'Recibido', color: 'bg-blue-50 border-blue-200', icon: Clock, badgeColor: 'bg-blue-500' },
    { id: 'PREPARANDO', title: 'Preparando', color: 'bg-yellow-50 border-yellow-200', icon: ChefHat, badgeColor: 'bg-yellow-500' },
    { id: 'LISTO', title: 'Listo', color: 'bg-green-50 border-green-200', icon: CheckCircle2, badgeColor: 'bg-green-500' },
    { id: 'ENTREGADO', title: 'Entregado', color: 'bg-slate-50 border-slate-200', icon: Package, badgeColor: 'bg-slate-500' },
    { id: 'CANCELADO', title: 'Cancelado', color: 'bg-red-50 border-red-200', icon: X, badgeColor: 'bg-red-500' },
];

export default function NegocioPage() {
    const { data: pedidos, error, mutate } = useSWR<Pedido[]>('/pedidos', fetcher, {
        refreshInterval: 5000,
    });

    const handleStatusChange = async (id: number, newStatus: string) => {
        // Optimistic update
        const updatedPedidos = pedidos?.map(p => p.id === id ? { ...p, estado: newStatus } : p);
        mutate(updatedPedidos, false);

        try {
            await api.patch(`/pedidos/${id}`, { estado: newStatus });
            toast.success(`Pedido #${id} movido a ${newStatus}`);
            mutate();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error("Error al actualizar estado");
            mutate(); // Revert on error
        }
    };

    const handlePaymentMethodChange = async (id: number, method: string) => {
        const updatedPedidos = pedidos?.map(p => p.id === id ? { ...p, metodoPago: method } : p);
        mutate(updatedPedidos, false);

        try {
            await api.patch(`/pedidos/${id}`, { metodoPago: method });
            toast.success(`Método de pago actualizado a ${method}`);
            mutate();
        } catch (error) {
            console.error('Error updating payment method:', error);
            toast.error("Error al actualizar método de pago");
            mutate();
        }
    };

    if (error) return <div className="p-8 text-center text-red-500">Error al cargar pedidos</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-6">
            <header className="mb-4 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg">
                        <ChefHat className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Panel de Cocina</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <Link href="/negocio/productos">
                        <Button variant="outline" size="sm" className="bg-white text-xs sm:text-sm text-slate-700">
                            <span className="hidden sm:inline">Gestionar </span>Productos
                        </Button>
                    </Link>
                    <Link href="/negocio/reportes">
                        <Button variant="outline" size="sm" className="bg-white border-sky-200 text-sky-700 hover:bg-sky-50 text-xs sm:text-sm">
                            📊 <span className="hidden sm:inline">Reportes</span>
                        </Button>
                    </Link>
                    <Badge variant="outline" className="bg-white px-2 sm:px-3 py-1 text-xs text-slate-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        En vivo
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-6 overflow-x-auto pb-4 md:h-[calc(100vh-140px)]">
                {COLUMNS.map((col) => (
                    <div key={col.id} className={`flex flex-col rounded-xl border-2 ${col.color} h-full bg-white/50 backdrop-blur-sm`}>
                        <div className={`p-4 border-b ${col.color.split(' ')[1]} bg-white/80 rounded-t-xl flex justify-between items-center sticky top-0 z-10`}>
                            <div className="flex items-center gap-2">
                                <col.icon className={`w-5 h-5 ${col.badgeColor.replace('bg-', 'text-')}`} />
                                <h2 className="font-bold text-slate-700">{col.title}</h2>
                            </div>
                            <Badge className={`${col.badgeColor} text-white border-none`}>
                                {pedidos ? pedidos.filter((p) => p.estado === col.id).length : 0}
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {!pedidos ? (
                                // Skeletons
                                [1, 2].map(i => (
                                    <Card key={i} className="opacity-50">
                                        <CardHeader className="pb-2">
                                            <Skeleton className="h-4 w-1/2 mb-2" />
                                            <Skeleton className="h-6 w-3/4" />
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-12 w-full" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {pedidos
                                        .filter((p) => p.estado === col.id)
                                        .map((pedido) => (
                                            <motion.div
                                                key={pedido.id}
                                                layoutId={`pedido-${pedido.id}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                    <CardHeader className="p-4 pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <Badge variant="outline" className="font-mono text-xs text-slate-700">
                                                                #{pedido.id}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: es })}
                                                            </span>
                                                        </div>
                                                        <CardTitle className="text-lg font-bold text-slate-800 pt-1">
                                                            {pedido.clienteNombre}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-2">
                                                        <div className="space-y-1 mb-3">
                                                            {pedido.items.map((item, idx) => (
                                                                <div key={idx} className="text-sm text-slate-600 border-b border-dashed border-slate-100 last:border-0 py-1">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex justify-between">
                                                                            <span><span className="font-bold text-slate-800">{item.cantidad}x</span> {item.producto.nombre}</span>
                                                                        </div>
                                                                        {item.varianteNombre && (
                                                                            <div className="text-xs text-slate-500 pl-4">
                                                                                {item.varianteNombre}
                                                                            </div>
                                                                        )}
                                                                        {item.notas && (
                                                                            <div className="text-xs text-amber-600 pl-4 italic">
                                                                                "{item.notas}"
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                                            <span className="text-xs text-slate-600">Total</span>
                                                            <span className="font-bold text-lg text-slate-900">${pedido.total}</span>
                                                        </div>

                                                        <div className="mt-3 pt-2 border-t border-slate-100">
                                                            <div className="flex flex-wrap gap-1">
                                                                {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => (
                                                                    <button
                                                                        key={method}
                                                                        onClick={() => handlePaymentMethodChange(pedido.id, method)}
                                                                        className={`text-[10px] px-2 py-1 rounded-full border transition-all ${pedido.metodoPago === method
                                                                            ? 'bg-slate-800 text-white border-slate-800 font-medium'
                                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                                            }`}
                                                                    >
                                                                        {method}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {!pedido.metodoPago && (
                                                                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                                                    <HelpCircle className="w-3 h-3" />
                                                                    Sin método de pago
                                                                </p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-3 bg-slate-50 rounded-b-lg flex flex-col gap-2">
                                                        <div className="flex justify-between gap-2 w-full">
                                                            {col.id !== 'RECIBIDO' && col.id !== 'CANCELADO' ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(pedido.id, getPrevStatus(col.id))}
                                                                    className="flex-1 hover:bg-slate-200 text-slate-700"
                                                                >
                                                                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                                                                </Button>
                                                            ) : <div className="flex-1"></div>}

                                                            {col.id !== 'ENTREGADO' && col.id !== 'CANCELADO' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(pedido.id, getNextStatus(col.id))}
                                                                    className={`flex-1 ${col.id === 'LISTO' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-sky-500 hover:bg-sky-600'}`}
                                                                >
                                                                    {col.id === 'LISTO' ? 'Entregar' : 'Avanzar'} <ArrowRight className="w-4 h-4 ml-1" />
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {col.id !== 'CANCELADO' && col.id !== 'ENTREGADO' && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(pedido.id, 'CANCELADO')}
                                                                className="w-full bg-red-500 hover:bg-red-600"
                                                            >
                                                                <X className="w-4 h-4 mr-1" /> Cancelar Pedido
                                                            </Button>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            </motion.div>
                                        ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}

function getNextStatus(current: string) {
    const states = ['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
    const idx = states.indexOf(current);
    return states[idx + 1];
}

function getPrevStatus(current: string) {
    const states = ['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
    const idx = states.indexOf(current);
    return states[idx - 1];
}
