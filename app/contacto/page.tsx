"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/constants";
import Link from "next/link";

export default function ContactoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-orange-100/50 shadow-lg shadow-orange-100/20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                            <MapPin className="text-white w-5 h-5" />
                        </div>
                        <h1 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {BUSINESS_INFO.name}
                        </h1>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="border-orange-200 hover:bg-orange-50 text-slate-700">
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                        Contáctanos
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Estamos aquí para servirte. Visítanos o contáctanos para realizar tu pedido.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Contact Information Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Phone Card */}
                        <Card className="border-orange-100/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    Teléfonos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {BUSINESS_INFO.phones.map((phone, index) => (
                                    <a
                                        key={index}
                                        href={`tel:+52${phone.number}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                    >
                                        <Phone className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                                        <span className="text-lg font-semibold text-slate-700 group-hover:text-orange-600">
                                            {phone.display}
                                        </span>
                                    </a>
                                ))}
                                <p className="text-sm text-slate-500 mt-4">
                                    Llámanos para hacer tu pedido o resolver cualquier duda
                                </p>
                            </CardContent>
                        </Card>

                        {/* Location Card */}
                        <Card className="border-orange-100/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    Ubicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-slate-700">
                                        <p className="font-semibold text-lg">{BUSINESS_INFO.address.street}</p>
                                        <p>{BUSINESS_INFO.address.neighborhood}</p>
                                        <p>{BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}</p>
                                        <p className="text-sm text-slate-500 mt-1">{BUSINESS_INFO.address.country}</p>
                                    </div>
                                    <a
                                        href={BUSINESS_INFO.location.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all text-white">
                                            <Navigation className="w-4 h-4 mr-2" />
                                            Abrir en Google Maps
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hours Card */}
                        <Card className="border-orange-100/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-3 rounded-xl">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    Horarios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">

                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="font-medium text-slate-700">Sábado</span>
                                        <span className="text-slate-600">{BUSINESS_INFO.hours.saturday}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="font-medium text-slate-700">Domingo</span>
                                        <span className="text-slate-600">{BUSINESS_INFO.hours.sunday}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="h-full"
                    >
                        <Card className="border-orange-100/50 bg-white/80 backdrop-blur-sm shadow-lg">

                            <CardContent className="p-0">
                                <div className="w-full h-64 sm:h-96 lg:h-[580px] rounded-b-lg overflow-hidden">
                                    <iframe
                                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3735.365849940708!2d-103.36191262498166!3d20.57311188096468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ad5565d9214d%3A0x800b2f2bde257a2f!2sC.%20Hidalgo%201%2C%20Lopez%20Cotilla%2C%2045615%20San%20Pedro%20Tlaquepaque%2C%20Jal.!5e0!3m2!1ses-419!2smx!4v1763876859903!5m2!1ses-419!2smx`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación del negocio"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bank Account Card */}
                        <Card className="border-orange-100/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-3 rounded-xl">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    Transferencias
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Titular de la cuenta</p>
                                        <p className="font-semibold text-slate-700">{BUSINESS_INFO.bankAccount.accountHolder}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Banco</p>
                                        <p className="font-semibold text-slate-700">{BUSINESS_INFO.bankAccount.bank}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">CLABE</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-orange-50 px-3 py-2 rounded-lg font-mono text-sm text-orange-700 border border-orange-200">
                                                {BUSINESS_INFO.bankAccount.clabe}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(BUSINESS_INFO.bankAccount.clabe);
                                                    alert('CLABE copiada al portapapeles');
                                                }}
                                                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Copiar
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4">
                                        💡 Puedes realizar transferencias a esta cuenta para pagar tus pedidos
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center"
                >
                    <Card className="border-orange-100/50 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                        <CardContent className="py-8">
                            <h2 className="text-3xl font-bold mb-4">¿Listo para ordenar?</h2>
                            <p className="text-lg mb-6 text-white">
                                Visita nuestro menú y realiza tu pedido ahora
                            </p>
                            <Link href="/cliente">
                                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all text-orange-600 hover:text-orange-700">
                                    Ver Menú y Ordenar
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
