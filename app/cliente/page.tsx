/* --- CÓDIGO COMPLETO CORREGIDO --- */
'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Utensils, Check, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerClose, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Variante {
    id: number;
    nombre: string;
    precio: number;
    sku?: string;
    imagen?: string;
    activo: boolean;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    imagen?: string;
    variantes?: Variante[];
}

interface CartItem {
    producto: Producto;
    cantidad: number;
    notas: string;
    varianteId?: number;
    varianteNombre?: string;
    precioCalculado?: number;
    numeroPlato: number; // ← NUEVO para distribución por platos
}

export default function ClientePage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [metodoPago, setMetodoPago] = useState('');
    const [platosDisponibles, setPlatosDisponibles] = useState<number[]>([1]); // ← NUEVO

    // Business Panel
    // const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    // const [password, setPassword] = useState('');

    // Variantes modal
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [optionsModalOpen, setOptionsModalOpen] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState('');

    useEffect(() => {
        api.get('/productos')
            .then((data) => {
                setProductos(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Error al cargar productos");
                setLoading(false);
            });
    }, []);

    // Actualizar platos disponibles cuando el carrito cambia
    useEffect(() => {
        if (cart.length > 0) {
            const platosConItems = [...new Set(cart.map(i => i.numeroPlato))].sort((a, b) => a - b);
            setPlatosDisponibles(platosConItems);
        } else {
            setPlatosDisponibles([1]);
        }
    }, [cart]);

    const handleAddToCartClick = (producto: Producto) => {
        if (producto.variantes && producto.variantes.length > 0) {
            setSelectedProduct(producto);
            setSelectedVariantId(producto.variantes[0].id.toString());
            setOptionsModalOpen(true);
        } else {
            addToCart(producto);
        }
    };

    const confirmOptions = () => {
        if (!selectedProduct || !selectedVariantId) return;
        const variant = selectedProduct.variantes?.find(v => v.id.toString() === selectedVariantId);
        if (!variant) return;

        addToCart(selectedProduct, variant);
        setOptionsModalOpen(false);
        setSelectedProduct(null);
        setSelectedVariantId('');
    };

    const addToCart = (producto: Producto, variante?: Variante) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(item => {
                if (item.producto.id !== producto.id) return false;
                if (variante && item.varianteId !== variante.id) return false;
                if (!variante && item.varianteId) return false;
                return true;
            });

            if (existingIndex >= 0) {
                const newCart = [...prev];
                newCart[existingIndex].cantidad += 1;
                toast.success(`Agregado otro ${producto.nombre}`);
                return newCart;
            }

            toast.success(`${producto.nombre} agregado`);
            return [
                ...prev,
                {
                    producto,
                    cantidad: 1,
                    notas: '',
                    varianteId: variante?.id,
                    varianteNombre: variante?.nombre,
                    precioCalculado: variante ? variante.precio : producto.precio,
                    numeroPlato: 1 // ← Por defecto al plato 1
                }
            ];
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
        toast.info("Producto eliminado");
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
            )
        );
    };

    // Mover item a otro plato
    const moverItemAPlato = (indexItem: number, nuevoPlato: number) => {
        setCart(prev => prev.map((item, i) =>
            i === indexItem ? { ...item, numeroPlato: nuevoPlato } : item
        ));
    };

    // Agregar nuevo plato
    const agregarNuevoPlato = () => {
        const maxPlato = Math.max(...cart.map(i => i.numeroPlato), 0);
        const nuevoPlato = maxPlato + 1;
        setPlatosDisponibles(prev => [...prev, nuevoPlato].sort((a, b) => a - b));
    };

    const handleSubmit = async () => {
        if (!nombre.trim()) {
            toast.error("Ingresa tu nombre");
            return;
        }
        if (cart.length === 0) return;

        setSubmitting(true);
        try {
            const cartCompactado = compactarPlatos();

            await api.post('/pedidos', {
                clienteNombre: nombre,
                tipo: 'LOCAL',
                metodoPago: metodoPago || null,
                items: cartCompactado.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    notas: item.notas,
                    varianteId: item.varianteId,
                    varianteNombre: item.varianteNombre,
                    precioCalculado: item.precioCalculado,
                    numeroPlato: item.numeroPlato
                }))
            });

            setSuccessOpen(true);
            setCart([]);
            setNombre('');
            setMetodoPago('');
            setIsCartOpen(false);
        } catch (err) {
            toast.error("Error al enviar el pedido");
        } finally {
            setSubmitting(false);
        }
    };

    // Compactar platos antes de enviar
    const compactarPlatos = () => {
        const platosOrdenados = [...new Set(cart.map(i => i.numeroPlato))].sort((a, b) => a - b);
        const mapaPlatos = new Map(platosOrdenados.map((plato, idx) => [plato, idx + 1]));
        return cart.map(item => ({
            ...item,
            numeroPlato: mapaPlatos.get(item.numeroPlato) || 1
        }));
    };

    const total = cart.reduce(
        (sum, item) => sum + (item.precioCalculado || item.producto.precio) * item.cantidad,
        0
    );

    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 pb-24">

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-orange-100/50 z-40 px-4 h-16 flex items-center justify-between shadow-lg shadow-orange-100/20">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                        <Utensils className="text-white w-5 h-5" />
                    </div>
                    <h1 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Taqueria El Indio</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/contacto">
                        <Button variant="ghost" size="sm" className="text-xs hover:bg-orange-50 text-slate-700">
                            Contacto
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button variant="ghost" size="sm" className="text-xs hover:bg-orange-50 text-slate-700">
                            Inicio
                        </Button>
                    </Link>

                    <Link href="/negocio">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs hover:bg-orange-50 gap-1 text-slate-700"
                        >
                            <Store className="w-3 h-3" />
                            Negocio
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs hover:bg-orange-50 gap-1 text-slate-700 relative"
                        onClick={() => setIsCartOpen(true)}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {cart.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </div>
            </header>

            {/* MAIN */}
            <main className="container mx-auto px-4 pt-24 max-w-5xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Menú
                </h2>

                {/* PRODUCTOS */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="overflow-hidden border-orange-100/50">
                                <Skeleton className="h-48 w-full" />
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardFooter>
                                    <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map((producto, index) => (
                            <motion.div
                                key={producto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                                <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 border-orange-100/50 bg-white/80 backdrop-blur-sm h-full flex flex-col hover:-translate-y-1">
                                    <div className="aspect-video bg-gradient-to-br from-orange-100 to-yellow-100 relative overflow-hidden">
                                        {producto.imagen ? (
                                            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-orange-300">
                                                <Utensils />
                                            </div>
                                        )}

                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-orange-600 shadow-lg border border-orange-100/50">
                                            ${producto.precio}
                                        </div>

                                        {producto.variantes && producto.variantes.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-red-500/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg">
                                                Variantes
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-slate-800">{producto.nombre}</CardTitle>
                                    </CardHeader>

                                    <CardFooter className="mt-auto pt-4">
                                        <Button
                                            onClick={() => handleAddToCartClick(producto)}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Agregar
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* FLOATING CART BUTTON */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Button
                            onClick={() => setIsCartOpen(true)}
                            className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex flex-col items-center justify-center gap-1 border-4 border-white/20 backdrop-blur-sm"
                        >
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                    {totalItems}
                                </span>
                            </div>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DRAWER DEL CARRITO */}
            <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DrawerContent className="bg-gradient-to-br from-orange-50/95 to-yellow-50/95 backdrop-blur-xl border-orange-200/50">
                    <div className="mx-auto w-full max-w-lg">
                        <DrawerHeader>
                            <DrawerTitle className="text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Tu Pedido</DrawerTitle>
                            <DrawerDescription className="text-slate-600">Revisa tus items</DrawerDescription>
                        </DrawerHeader>

                        {/* ITEMS AGRUPADOS POR PLATO */}
                        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {cart.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12 text-slate-600"
                                    >
                                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        Carrito vacío
                                    </motion.div>
                                ) : (
                                    <>
                                        {platosDisponibles.map(numeroPlato => {
                                            const itemsDelPlato = cart
                                                .map((item, idx) => ({ ...item, originalIndex: idx }))
                                                .filter(item => item.numeroPlato === numeroPlato);

                                            if (itemsDelPlato.length === 0) return null;

                                            return (
                                                <motion.div
                                                    key={`plato-${numeroPlato}`}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="border-2 border-orange-200 rounded-2xl p-3 bg-white shadow-md"
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="font-bold text-orange-600 text-sm">
                                                            🍽️ Plato {numeroPlato}
                                                        </h3>
                                                        <Badge variant="outline" className="text-xs text-slate-600">
                                                            {itemsDelPlato.reduce((sum, i) => sum + i.cantidad, 0)} items
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {itemsDelPlato.map((item) => (
                                                            <motion.div
                                                                key={`item-${item.originalIndex}`}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-lg"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-slate-900 text-sm truncate">
                                                                        {item.producto.nombre}
                                                                    </div>
                                                                    {item.varianteNombre && (
                                                                        <div className="text-xs text-slate-500">
                                                                            {item.varianteNombre}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-sm text-orange-600 font-medium">
                                                                        ${item.precioCalculado}
                                                                    </div>
                                                                </div>

                                                                {/* Selector de plato (minimalista) */}
                                                                {platosDisponibles.length > 1 && (
                                                                    <select
                                                                        value={item.numeroPlato}
                                                                        onChange={(e) => moverItemAPlato(item.originalIndex, Number(e.target.value))}
                                                                        className="text-xs border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-700 cursor-pointer hover:border-orange-400 transition-colors"
                                                                    >
                                                                        {platosDisponibles.map(p => (
                                                                            <option key={p} value={p}>Plato {p}</option>
                                                                        ))}
                                                                    </select>
                                                                )}

                                                                {/* Controles de cantidad */}
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => updateQuantity(item.originalIndex, -1)}
                                                                        className="h-7 w-7 text-slate-700"
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </Button>
                                                                    <span className="w-6 text-center font-bold text-sm">
                                                                        {item.cantidad}
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => updateQuantity(item.originalIndex, 1)}
                                                                        className="h-7 w-7 text-slate-700"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeFromCart(item.originalIndex)}
                                                                        className="h-7 w-7"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {/* Botón para agregar nuevo plato */}
                                        <Button
                                            onClick={agregarNuevoPlato}
                                            variant="outline"
                                            className="w-full border-dashed border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Agregar Plato
                                        </Button>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* TOTAL Y BOTÓN */}
                        <div className="p-4 border-t border-orange-200/50 bg-white/60 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-5">
                                <span className="text-xl font-semibold text-slate-700">Total</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">${total}</span>
                            </div>

                            <Input
                                placeholder="Tu nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="mb-4 text-slate-700"
                            />

                            <Button
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Enviando..." : "Realizar Pedido"}
                            </Button>
                        </div>
                    </div>
                </DrawerContent >
            </Drawer >

            {/* DIALOG DE VARIANTES */}
            < Dialog open={optionsModalOpen} onOpenChange={setOptionsModalOpen} >
                <DialogContent className="bg-gradient-to-br from-orange-50 to-red-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {selectedProduct?.nombre}
                        </DialogTitle>
                        <DialogDescription>
                            Selecciona una opción
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId}>
                            {selectedProduct?.variantes?.map((variante) => (
                                <div key={variante.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
                                    <RadioGroupItem value={variante.id.toString()} id={`variant-${variante.id}`} />
                                    <Label htmlFor={`variant-${variante.id}`} className="flex-1 cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-800">{variante.nombre}</span>
                                            <span className="font-bold text-orange-600">${variante.precio}</span>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOptionsModalOpen(false)} className="text-slate-700">
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmOptions}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar al Carrito
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* DIALOG DE ÉXITO */}
            < Dialog open={successOpen} onOpenChange={setSuccessOpen} >
                <DialogContent className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-200">
                    <div className="text-center py-6">
                        <div className="mb-4">
                            <div className="text-7xl mb-4 animate-bounce">🎉</div>
                            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                                ¡Pedido Recibido!
                            </DialogTitle>
                            <DialogDescription className="text-lg text-slate-600 px-4">
                                Tu orden ha sido enviada.<br />
                                <span className="font-semibold text-orange-600">Te avisaremos cuando esté lista.</span>
                            </DialogDescription>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-orange-100">
                            <p className="text-sm text-slate-500 mb-2">Gracias por tu preferencia</p>
                            <p className="text-2xl font-bold text-slate-800">¡Buen provecho! 🍽️</p>
                        </div>

                        <Button
                            onClick={() => {
                                setSuccessOpen(false);
                                router.push('/');
                            }}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            ¡Perfecto!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* DIALOG NEGOCIO REMOVED */}

        </div >
    );
}
