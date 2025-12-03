'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChefHat } from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/login', { email, password });
            toast.success('Inicio de sesión exitoso');

            const redirect = searchParams?.get('redirect') || '/negocio';

            // Usar window.location.href en lugar de router.push para asegurar
            // que la cookie de sesión se propague correctamente antes de la navegación
            window.location.href = redirect;
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message || 'Error al iniciar sesión');
            setLoading(false); // Solo establecer loading a false en error
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-orange-100">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg">
                                <ChefHat className="w-12 h-12 text-white" strokeWidth={2} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Taquería El Indio
                        </h1>
                        <p className="text-slate-500 text-sm">Panel Administrativo</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@taqueria.com"
                                required
                                className="border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-medium">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Iniciando sesión...
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-center text-xs text-slate-400">
                            Credenciales de prueba: admin@taqueria.com / admin123
                        </p>
                    </div>
                </div>

                {/* Branding */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Sistema de gestión de pedidos
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
