// app/negocio/productos/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Package, Settings, LogOut, Trash2, Edit, Image as ImageIcon, X, PlusCircle, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface Variante {
    id?: number;
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

export default function ProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagen, setImagen] = useState('');
    const [variantes, setVariantes] = useState<Variante[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [editNombre, setEditNombre] = useState('');
    const [editPrecio, setEditPrecio] = useState('');
    const [editImagen, setEditImagen] = useState('');
    const [editVariantes, setEditVariantes] = useState<Variante[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number, nombre: string } | null>(null);


    const fetchProductos = async () => {
        try {
            const data = await api.get('/productos');
            setProductos(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching productos:', error);
            toast.error("Error al cargar productos");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const addVariante = (isEdit: boolean) => {
        const newVariante: Variante = {
            nombre: '',
            precio: 0,
            activo: true
        };
        if (isEdit) {
            setEditVariantes([...editVariantes, newVariante]);
        } else {
            setVariantes([...variantes, newVariante]);
        }
    };

    const updateVariante = (isEdit: boolean, index: number, field: keyof Variante, value: any) => {
        const setter = isEdit ? setEditVariantes : setVariantes;
        const current = isEdit ? editVariantes : variantes;
        const updated = [...current];
        updated[index] = { ...updated[index], [field]: value };
        setter(updated);
    };

    const removeVariante = (isEdit: boolean, index: number) => {
        const setter = isEdit ? setEditVariantes : setVariantes;
        const current = isEdit ? editVariantes : variantes;
        setter(current.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !precio) {
            toast.error("Nombre y precio son obligatorios");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/productos', {
                nombre,
                precio: parseFloat(precio),
                imagen: imagen || null,
                variantes: variantes
            });
            setNombre('');
            setPrecio('');
            setImagen('');
            setVariantes([]);
            fetchProductos();
            toast.success("Producto agregado correctamente");
        } catch (error) {
            console.error('Error creating producto:', error);
            toast.error("Error al crear producto");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (producto: Producto) => {
        setEditingProducto(producto);
        setEditNombre(producto.nombre);
        setEditPrecio(producto.precio.toString());
        setEditImagen(producto.imagen || '');
        setEditVariantes(producto.variantes || []);
        setEditDialogOpen(true);
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProducto || !editNombre || !editPrecio) {
            toast.error("Nombre y precio son obligatorios");
            return;
        }

        setSubmitting(true);
        try {
            await api.patch(`/productos/${editingProducto.id}`, {
                nombre: editNombre,
                precio: parseFloat(editPrecio),
                imagen: editImagen || null,
                variantes: editVariantes
            });
            setEditDialogOpen(false);
            fetchProductos();
            toast.success("Producto actualizado correctamente");
        } catch (error) {
            console.error('Error updating producto:', error);
            toast.error("Error al actualizar producto");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

        try {
            await api.delete(`/productos/${id}`);
            fetchProductos();
            toast.success("Producto eliminado correctamente");
        } catch (error) {
            console.error('Error deleting producto:', error);
            toast.error("Error al eliminar producto");
        }
    };

    const renderVariantEditor = (isEdit: boolean) => {
        const currentVariantes = isEdit ? editVariantes : variantes;

        return (
            <div className="space-y-4 mt-4 border-t pt-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Variantes del Producto</Label>
                    <Button type="button" size="sm" variant="outline" onClick={() => addVariante(isEdit)}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Agregar Variante
                    </Button>
                </div>

                {currentVariantes.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                        <p className="text-sm">Este producto no tiene variantes.</p>
                        <p className="text-xs mt-1">Usa variantes para diferentes tamaños o tipos (ej. Litro, 1/2 Litro).</p>
                    </div>
                )}

                <div className="space-y-3">
                    {currentVariantes.map((variante, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="col-span-2 sm:col-span-1">
                                    <Label className="text-xs text-slate-500 mb-1 block">Nombre</Label>
                                    <Input
                                        placeholder="Ej. Litro"
                                        value={variante.nombre}
                                        onChange={(e) => updateVariante(isEdit, idx, 'nombre', e.target.value)}
                                        className="h-8 text-sm bg-white"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Label className="text-xs text-slate-500 mb-1 block">Precio</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={variante.precio}
                                            onChange={(e) => updateVariante(isEdit, idx, 'precio', parseFloat(e.target.value) || 0)}
                                            className="h-8 text-sm pl-5 bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <Label className="text-xs text-slate-500 mb-1 block">SKU (Opcional)</Label>
                                    <Input
                                        placeholder="SKU-123"
                                        value={variante.sku || ''}
                                        onChange={(e) => updateVariante(isEdit, idx, 'sku', e.target.value)}
                                        className="h-8 text-sm bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-6">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeVariante(isEdit, idx)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-sky-500 p-1 rounded">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    ElToldito Admin
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/negocio">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Cocina
                        </Button>
                    </Link>
                    <Button variant="secondary" className="w-full justify-start bg-slate-800 text-white hover:bg-slate-700">
                        <Package className="w-4 h-4 mr-2" /> Productos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                        <Settings className="w-4 h-4 mr-2" /> Configuración
                    </Button>
                </nav>

                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Productos</h1>
                        <p className="text-slate-500">Administra el menú de tu restaurante.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                                <CardHeader>
                                    <CardTitle>Agregar Producto</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input
                                                placeholder="Ej. Tacos al Pastor"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Precio Base</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={precio}
                                                onChange={(e) => setPrecio(e.target.value)}
                                                required
                                                min="0"
                                                step="0.01"
                                            />
                                            <p className="text-[10px] text-slate-500">Si tiene variantes, este precio puede ser referencial o base.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL Imagen</Label>
                                            <Input
                                                placeholder="https://..."
                                                value={imagen}
                                                onChange={(e) => setImagen(e.target.value)}
                                            />
                                        </div>

                                        {renderVariantEditor(false)}

                                        <Button
                                            type="submit"
                                            className="w-full bg-sky-600 hover:bg-sky-700 mt-4"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Guardando...' : 'Agregar Producto'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Lista de Productos */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <Card key={i}>
                                            <CardHeader className="flex-row gap-4 items-center">
                                                <Skeleton className="w-16 h-16 rounded-md" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))
                                ) : (
                                    productos.map((producto) => (
                                        <motion.div
                                            key={producto.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card className="flex flex-row overflow-hidden h-full">
                                                <div className="w-24 bg-slate-100 relative flex-shrink-0">
                                                    {producto.imagen ? (
                                                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <ImageIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 line-clamp-1">{producto.nombre}</h3>
                                                        <p className="text-sky-600 font-semibold">${producto.precio}</p>
                                                        {producto.variantes && producto.variantes.length > 0 && (
                                                            <Badge variant="secondary" className="mt-1 text-[10px]">
                                                                {producto.variantes.length} variantes
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-sky-600"
                                                            onClick={() => handleEdit(producto)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                            onClick={() => {
                                                                setDeleteTarget({ id: producto.id, nombre: producto.nombre });
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>

                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Editar Producto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="space-y-5 pt-2">
                        <div className="space-y-2">
                            <Label>Nombre del Producto</Label>
                            <Input
                                placeholder="Ej. Tacos al Pastor"
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                                required
                                className="h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Precio Base</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={editPrecio}
                                    onChange={(e) => setEditPrecio(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="h-11 pl-7 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL de Imagen (opcional)</Label>
                            <Input
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={editImagen}
                                onChange={(e) => setEditImagen(e.target.value)}
                                className="h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                            />
                        </div>

                        {renderVariantEditor(true)}

                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                                disabled={submitting}
                                className="h-11 border-slate-300 hover:bg-slate-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm"
                                disabled={submitting}
                            >
                                {submitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Eliminar Producto</DialogTitle>
                    </DialogHeader>

                    <p>¿Seguro que deseas eliminar <b>{deleteTarget?.nombre}</b>?</p>

                    <DialogFooter className="gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                                if (!deleteTarget) return;

                                try {
                                    await api.delete(`/productos/${deleteTarget.id}`);
                                    toast.success('Producto eliminado correctamente');
                                    fetchProductos();
                                } catch (error) {
                                    toast.error('Error al eliminar producto');
                                } finally {
                                    setDeleteDialogOpen(false);
                                }
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
