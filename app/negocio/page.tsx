'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '../../lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ArrowLeft, Clock, CheckCircle2, ChefHat, Package, Banknote, CreditCard, HelpCircle, X, LogOut, Plus, Calendar, History, Minus, Printer } from 'lucide-react';
import { printTicket } from '../../lib/print-ticket';
import { renderOrderTicketToString } from '../../components/tickets/OrderTicket';
import { renderReceiptTicketToString } from '../../components/tickets/ReceiptTicket';
import { agruparPorPlato } from '@/lib/pedido-utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface Pedido {
    id: number;
    clienteNombre: string;
    estado: string;
    tipo: string;
    total: number;
    items: {
        id: number;
        producto: {
            nombre: string;
        };
        productoNombre: string;
        cantidad: number;
        precioUnitario: number;
        varianteNombre?: string;
        notas?: string;
    }[];
    metodoPago?: string;
    createdAt: string;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    variantes?: { id: number; nombre: string; precio: number; activo: boolean }[];
}

const fetcher = (url: string) => api.get(url);

const COLUMNS = [
    { id: 'RECIBIDO', title: 'Recibido', color: 'bg-blue-50 border-blue-200', icon: Clock, badgeColor: 'bg-blue-500' },
    { id: 'PREPARANDO', title: 'Preparando', color: 'bg-yellow-50 border-yellow-200', icon: ChefHat, badgeColor: 'bg-yellow-500' },
    { id: 'LISTO', title: 'Listo', color: 'bg-green-50 border-green-200', icon: CheckCircle2, badgeColor: 'bg-green-500' },
    { id: 'ENTREGADO', title: 'Entregado', color: 'bg-slate-50 border-slate-200', icon: Package, badgeColor: 'bg-slate-500' },
    { id: 'CANCELADO', title: 'Cancelado', color: 'bg-red-50 border-red-200', icon: X, badgeColor: 'bg-red-500' },
];

export default function NegocioPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'today' | 'all'>('today');
    const { data: pedidos, error, mutate } = useSWR<Pedido[]>(`/pedidos?filter=${filter}`, fetcher, {
        refreshInterval: 5000,
    });

    // Add Item State
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [products, setProducts] = useState<Producto[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [submittingItem, setSubmittingItem] = useState(false);

    useEffect(() => {
        api.get('/productos').then(setProducts).catch(console.error);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {});
            toast.success('Sesión cerrada');
            router.push('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        const updatedPedidos = pedidos?.map(p => p.id === id ? { ...p, estado: newStatus } : p);
        mutate(updatedPedidos, false);

        try {
            await api.patch(`/pedidos/${id}`, { estado: newStatus });
            toast.success(`Pedido #${id} movido a ${newStatus}`);
            mutate();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error("Error al actualizar estado");
            mutate();
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

    const openAddItemModal = (orderId: number) => {
        setSelectedOrderId(orderId);
        setSelectedProduct(null);
        setSelectedVariantId('');
        setQuantity(1);
        setIsAddingItem(true);
    };

    const handlePrintOrderTicket = (pedido: Pedido) => {
        const ticketHtml = renderOrderTicketToString({
            orderId: pedido.id,
            customerName: pedido.clienteNombre,
            orderType: pedido.tipo || 'Para llevar',
            items: pedido.items.map(item => ({
                id: item.id,
                productoNombre: item.producto?.nombre || item.productoNombre || '',
                cantidad: item.cantidad,
                notas: item.notas,
                varianteNombre: item.varianteNombre,
                numeroPlato: (item as any).numeroPlato || 1
            })),
            createdAt: pedido.createdAt,
            printedBy: 'admin@taqueria.com'
        });
        printTicket(ticketHtml, `Comanda #${pedido.id} - ${pedido.clienteNombre}`).catch(err => {
            console.error('Print error:', err);
            toast.error('Error al imprimir comanda');
        });
    };

    const handlePrintReceiptTicket = (pedido: Pedido) => {
        const ticketHtml = renderReceiptTicketToString({
            orderId: pedido.id,
            customerName: pedido.clienteNombre,
            orderType: pedido.tipo || 'Para llevar',
            items: pedido.items.map(item => ({
                id: item.id,
                productoNombre: item.producto?.nombre || item.productoNombre || '',
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario || 0,
                varianteNombre: item.varianteNombre
            })),
            total: pedido.total,
            paymentMethod: pedido.metodoPago,
            createdAt: pedido.createdAt,
            printedBy: 'admin@taqueria.com'
        });
        printTicket(ticketHtml, `Cuenta #${pedido.id} - ${pedido.clienteNombre}`).catch(err => {
            console.error('Print error:', err);
            toast.error('Error al imprimir cuenta');
        });
    };

    const handleAddItemSubmit = async () => {
        if (!selectedProduct || (selectedProduct.variantes && selectedProduct.variantes.length > 0 && !selectedVariantId)) {
            toast.error('Por favor selecciona un producto y variante');
            return;
        }

        setSubmittingItem(true);
        try {
            await api.post(`/pedidos/${selectedOrderId}/items`, {
                productoId: selectedProduct.id,
                varianteId: selectedVariantId || null,
                cantidad: quantity,
            });
            toast.success('Producto agregado');
            setIsAddingItem(false);
            mutate();
        } catch (error) {
            console.error(error);
            toast.error('Error al agregar producto');
        } finally {
            setSubmittingItem(false);
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
                    <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center">
                        <Button
                            variant={filter === 'today' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('today')}
                            className={`text-xs ${filter === 'today' ? 'bg-slate-100 font-bold' : 'text-slate-500'}`}
                        >
                            <Calendar className="w-3 h-3 mr-1" /> Hoy
                        </Button>
                        <Button
                            variant={filter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('all')}
                            className={`text-xs ${filter === 'all' ? 'bg-slate-100 font-bold' : 'text-slate-500'}`}
                        >
                            <History className="w-3 h-3 mr-1" /> Historial
                        </Button>
                    </div>

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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
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
                                                        <div className="space-y-3 mb-3">
                                                            {agruparPorPlato(pedido.items.map(item => ({
                                                                ...item,
                                                                productoNombre: item.producto?.nombre || item.productoNombre || '',
                                                                numeroPlato: (item as any).numeroPlato || 1
                                                            }))).map((plato) => (
                                                                <div key={plato.numeroPlato} className="border-l-4 border-orange-400 pl-3 py-1 bg-orange-50/30 rounded-r">
                                                                    <div className="text-xs font-bold text-orange-600 mb-1.5 flex items-center gap-1">
                                                                        <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px]">PLATO {plato.numeroPlato}</span>
                                                                        <span className="text-slate-500 font-normal">({plato.totalCantidad} items)</span>
                                                                    </div>
                                                                    {plato.items.map((item, idx) => (
                                                                        <div key={idx} className="text-sm text-slate-600 border-b border-dashed border-slate-100 last:border-0 py-1">
                                                                            <div className="flex flex-col">
                                                                                <div className="flex justify-between">
                                                                                    <span><span className="font-bold text-slate-800">{item.cantidad}x</span> {item.productoNombre}</span>
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
                                                        <div className="flex gap-2 w-full">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePrintOrderTicket(pedido)}
                                                                className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100"
                                                            >
                                                                <Printer className="w-3 h-3 mr-1" /> Comanda
                                                            </Button>
                                                            {(col.id === 'LISTO' || col.id === 'ENTREGADO') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handlePrintReceiptTicket(pedido)}
                                                                    className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100"
                                                                >
                                                                    <Printer className="w-3 h-3 mr-1" /> Cuenta
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {col.id !== 'CANCELADO' && col.id !== 'ENTREGADO' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openAddItemModal(pedido.id)}
                                                                className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-100"
                                                            >
                                                                <Plus className="w-4 h-4 mr-1" /> Agregar Producto
                                                            </Button>
                                                        )}

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

            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Producto al Pedido #{selectedOrderId}</DialogTitle>
                        <DialogDescription>Selecciona un producto para agregar.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <select
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => {
                                    const prod = products.find(p => p.id === Number(e.target.value));
                                    setSelectedProduct(prod || null);
                                    setSelectedVariantId('');
                                }}
                                value={selectedProduct?.id || ''}
                            >
                                <option value="">Seleccionar producto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProduct?.variantes && selectedProduct.variantes.length > 0 && (
                            <div className="space-y-2">
                                <Label>Variante</Label>
                                <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId}>
                                    {selectedProduct.variantes.map((v) => (
                                        <div key={v.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={v.id.toString()} id={`v-${v.id}`} />
                                            <Label htmlFor={`v-${v.id}`}>{v.nombre} (${v.precio})</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancelar</Button>
                        <Button onClick={handleAddItemSubmit} disabled={submittingItem || !selectedProduct}>
                            {submittingItem ? 'Agregando...' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
