'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, CreditCard, Banknote, HelpCircle, TrendingUp, ShoppingBag, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';


const fetcher = (url: string) => api.get(url);

interface CorteData {
    totales: {
        efectivo: number;
        tarjeta: number;
        transferencia: number;
        sinMetodo: number;
        [key: string]: number;
    };
    totalDia: number;
    totalPedidos: number;
    ticketPromedio: number;
    totalMargen: number;
    fecha: string;
}

interface ProductoReporte {
    nombre: string;
    cantidad: number;
    revenue: number;
    costo: number;
    margen: number;
}

interface DeadStockItem {
    id: number;
    nombre: string;
    precio: number;
    costo: number;
}

export default function ReportesPage() {
    const [date, setDate] = useState<Date>(new Date());

    const dateStr = date.toISOString().split('T')[0];

    const { data: corte, error: corteError } = useSWR<CorteData>(
        `/reportes/corte?date=${dateStr}`,
        fetcher
    );

    const { data: productos, error: productosError } = useSWR<ProductoReporte[]>(
        `/reportes/productos?date=${dateStr}`,
        fetcher
    );

    const { data: deadStock, error: deadStockError } = useSWR<DeadStockItem[]>(
        `/reportes/dead-stock?date=${dateStr}`,
        fetcher
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link href="/negocio" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Volver a Cocina
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Reportes y Métricas</h1>
                        <p className="text-slate-500">Análisis detallado de operaciones</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-slate-400" />
                        <Input
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            onChange={(e) => setDate(new Date(e.target.value))}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-auto"
                        />
                    </div>
                </header>

                {/* KPI Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {!corte ? (
                        [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)
                    ) : (
                        <>
                            <Card className="border-green-100 bg-green-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-green-600">Ventas Totales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-700">${corte.totalDia.toFixed(2)}</div>
                                    <p className="text-xs text-green-600 mt-1">{corte.totalPedidos} pedidos completados</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Ticket Promedio</CardTitle>
                                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-800">${corte.ticketPromedio.toFixed(2)}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Margen Bruto</CardTitle>
                                    <TrendingUp className="w-4 h-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-800">${corte.totalMargen.toFixed(2)}</div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {corte.totalDia > 0 ? ((corte.totalMargen / corte.totalDia) * 100).toFixed(1) : 0}% de ventas
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Desglose Pago</CardTitle>
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Efectivo:</span>
                                            <span className="font-medium">${corte.totales.efectivo.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Tarjeta:</span>
                                            <span className="font-medium">${corte.totales.tarjeta.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Transf:</span>
                                            <span className="font-medium">${corte.totales.transferencia.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Products */}
                    <section className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold text-slate-800">Productos Más Vendidos</h2>
                        <Card>
                            <CardContent className="p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                            <tr>
                                                <th className="px-4 py-3">Producto</th>
                                                <th className="px-4 py-3 text-right">Cant.</th>
                                                <th className="px-4 py-3 text-right">Ventas</th>
                                                <th className="px-4 py-3 text-right">Margen</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {!productos ? (
                                                <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
                                            ) : productos.length === 0 ? (
                                                <tr><td colSpan={4} className="p-4 text-center text-slate-500">No hay ventas registradas</td></tr>
                                            ) : (
                                                productos.map((prod, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 font-medium text-slate-700">{prod.nombre}</td>
                                                        <td className="px-4 py-3 text-right text-slate-600">{prod.cantidad}</td>
                                                        <td className="px-4 py-3 text-right font-medium text-slate-800">${prod.revenue.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-right text-green-600 font-medium">${prod.margen.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Dead Stock */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-slate-800">Sin Ventas (Dead Stock)</h2>
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Productos no vendidos en la fecha seleccionada</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                                {!deadStock ? (
                                    <div className="p-4 text-center">Cargando...</div>
                                ) : deadStock.length === 0 ? (
                                    <div className="p-4 text-center text-green-600">¡Todo se ha vendido hoy!</div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {deadStock.map((item) => (
                                            <li key={item.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50">
                                                <span className="text-sm text-slate-600">{item.nombre}</span>
                                                <span className="text-xs text-slate-400">${item.precio}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}
