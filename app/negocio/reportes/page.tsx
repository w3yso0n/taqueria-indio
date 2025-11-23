'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, CreditCard, Banknote, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    fecha: string;
}

interface VentaData {
    fecha: string;
    total: number;
}

export default function ReportesPage() {
    const [date, setDate] = useState(new Date());

    const { data: corte, error: corteError } = useSWR<CorteData>(
        `/reportes/corte?date=${date.toISOString()}`,
        fetcher
    );

    const { data: ventas, error: ventasError } = useSWR<VentaData[]>(
        '/reportes/ventas?days=7',
        fetcher
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link href="/negocio" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Volver a Cocina
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Reportes y Corte</h1>
                        <p className="text-slate-500">Resumen de ventas y operaciones</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <span className="font-medium text-slate-700 capitalize">
                            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                        </span>
                    </div>
                </header>

                {/* Corte de Caja */}
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Corte del Día
                    </h2>

                    {!corte && !corteError ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : corte ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-green-100 bg-green-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-green-600">Total General</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-700">${corte.totalDia.toFixed(2)}</div>
                                    <p className="text-xs text-green-600 mt-1">Ventas totales del día</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Efectivo</CardTitle>
                                    <Banknote className="w-4 h-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-800">${corte.totales.efectivo?.toFixed(2) || '0.00'}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Tarjeta</CardTitle>
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-800">${corte.totales.tarjeta?.toFixed(2) || '0.00'}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-medium text-slate-600">Transferencia</CardTitle>
                                    <ArrowLeft className="w-4 h-4 text-slate-400 rotate-45" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-800">${corte.totales.transferencia?.toFixed(2) || '0.00'}</div>
                                </CardContent>
                            </Card>

                            {corte.totales.sinMetodo > 0 && (
                                <Card className="border-amber-200 bg-amber-50">
                                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-sm font-medium text-amber-700">Sin Especificar</CardTitle>
                                        <HelpCircle className="w-4 h-4 text-amber-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-amber-800">${corte.totales.sinMetodo?.toFixed(2) || '0.00'}</div>
                                        <p className="text-xs text-amber-600 mt-1">Requiere asignar método</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div className="text-red-500">Error al cargar el corte</div>
                    )}
                </section>

                {/* Historial de Ventas */}
                <section>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Historial (Últimos 7 días)</h2>
                    <Card>
                        <CardContent className="p-6">
                            {!ventas ? (
                                <Skeleton className="h-48 w-full" />
                            ) : (
                                <div className="h-48 flex items-end justify-between gap-2">
                                    {ventas.map((venta) => (
                                        <div key={venta.fecha} className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full flex items-end justify-center h-32 bg-slate-50 rounded-t-lg overflow-hidden">
                                                <div
                                                    className="w-full bg-sky-500 group-hover:bg-sky-600 transition-all rounded-t-md"
                                                    style={{ height: `${Math.max(5, (venta.total / Math.max(...ventas.map(v => v.total))) * 100)}%` }}
                                                ></div>
                                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded pointer-events-none">
                                                    ${venta.total}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {format(new Date(venta.fecha), 'EEE d', { locale: es })}
                                            </span>
                                        </div>
                                    ))}
                                    {ventas.length === 0 && <div className="text-slate-400 w-full text-center">No hay datos de ventas recientes</div>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
