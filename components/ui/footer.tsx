import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="bg-gradient-to-br from-orange-900 to-red-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-4 md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Business Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                            {BUSINESS_INFO.name}
                        </h3>
                        <p className="text-slate-300 text-sm">
                            {BUSINESS_INFO.description}
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-400" />
                            Contacto
                        </h4>
                        <div className="space-y-1 text-slate-300 text-sm">
                            {BUSINESS_INFO.phones.map((phone, index) => (
                                <a
                                    key={index}
                                    href={`tel:+52${phone.number}`}
                                    className="block hover:text-orange-300 transition-colors"
                                >
                                    {phone.display}
                                </a>
                            ))}
                        </div>

                        <div className="mt-3">
                            <h5 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-400" />
                                Ubicación
                            </h5>
                            <a
                                href={BUSINESS_INFO.location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-300 text-xs hover:text-orange-300 transition-colors block"
                            >
                                {BUSINESS_INFO.address.street}
                                <br />
                                {BUSINESS_INFO.address.neighborhood}
                                <br />
                                {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}
                            </a>
                        </div>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            Horarios
                        </h4>
                        <div className="space-y-1 text-xs text-slate-300">

                            <div className="flex justify-between">
                                <span>Sábado:</span>
                                <span>{BUSINESS_INFO.hours.saturday}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Domingo:</span>
                                <span>{BUSINESS_INFO.hours.sunday}</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-700">
                            <h5 className="font-semibold text-xs mb-1 text-slate-300">💳 Transferencias</h5>
                            <p className="text-xs text-slate-400">{BUSINESS_INFO.bankAccount.bank}</p>
                            <p className="text-xs text-slate-400 font-mono">{BUSINESS_INFO.bankAccount.clabe}</p>
                        </div>

                        <div className="mt-3">
                            <Link
                                href="/contacto"
                                className="inline-block px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg text-xs font-semibold transition-all"
                            >
                                Más Info
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-700 mt-4 pt-3 text-center text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
