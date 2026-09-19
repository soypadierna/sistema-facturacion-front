import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/shared/api/httpClient';
import * as productosApi from './productosApi';
import * as categoriasApi from '../categorias/categoriasApi';
import type { Producto } from './types';
import type { Categoria } from '../categorias/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Boxes, Barcode, Upload, X } from 'lucide-react';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Error de conexión';
}

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', precioCompra: '', precioVenta: '', idCategoria: '', detalle: '', stock: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Producto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [removeFoto, setRemoveFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imgViewOpen, setImgViewOpen] = useState(false);
  const [imgViewing, setImgViewing] = useState<Producto | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [prod, cats] = await Promise.all([
        productosApi.listProductos(),
        categoriasApi.listCategorias(),
      ]);
      setProductos(prod);
      setCategorias(cats);
    } catch (e) {
      showToast(errMsg(e), 'error');
      setProductos([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  function resetFotoState() {
    if (fotoPreview && fotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openNew() {
    setEditing(null);
    setForm({ nombre: '', codigo: '', precioCompra: '', precioVenta: '', idCategoria: '', detalle: '', stock: '' });
    resetFotoState();
    setModalOpen(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      codigo: p.codigo,
      precioCompra: String(p.precioCompra),
      precioVenta: String(p.precioVenta),
      idCategoria: String(p.categoria.id),
      detalle: p.detalle ?? '',
      stock: String(p.stock),
    });
    resetFotoState();
    setFotoPreview(p.fotoUrl);
    setModalOpen(true);
  }

  function closeModal() {
    resetFotoState();
    setModalOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('Formato no válido (usa JPEG, PNG o WebP)', 'error');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast('La imagen supera el tamaño máximo de 3 MB', 'error');
      return;
    }
    if (fotoPreview && fotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setRemoveFoto(false);
  }

  function handleRemoveFoto() {
    if (fotoPreview && fotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoFile(null);
    setFotoPreview(null);
    setRemoveFoto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      codigo: form.codigo,
      precioCompra: parseFloat(form.precioCompra) || 0,
      precioVenta: parseFloat(form.precioVenta) || 0,
      idCategoria: parseInt(form.idCategoria),
      detalle: form.detalle || null,
      stock: parseInt(form.stock) || 0,
    };
    try {
      let saved: Producto;
      if (editing) {
        saved = await productosApi.updateProducto(editing.idProducto, payload);
      } else {
        saved = await productosApi.createProducto(payload);
      }

      try {
        if (fotoFile) {
          await productosApi.uploadFoto(saved.idProducto, fotoFile);
        } else if (removeFoto) {
          await productosApi.deleteFoto(saved.idProducto);
        }
      } catch (fotoErr) {
        showToast(`Producto guardado, pero la foto no se pudo subir: ${errMsg(fotoErr)}`, 'error');
        closeModal();
        load();
        setSaving(false);
        return;
      }

      showToast(editing ? 'Producto actualizado' : 'Producto creado');
      closeModal();
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
    }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await productosApi.deleteProducto(deleting.idProducto);
      showToast('Producto eliminado');
      setDeleting(null);
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
      setDeleting(null);
    }
    setDeleteLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Productos</h3>
          <p className="text-sm text-slate-500 mt-1">{productos.length} productos en catálogo</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nuevo Producto</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            { key: 'nombre', label: 'Producto', render: (p) => (
              <div className="flex items-center gap-2">
                {p.fotoUrl ? (
                  <img
                    src={p.fotoUrl}
                    alt={p.nombre}
                    loading="lazy"
                    onClick={() => { setImgViewing(p); setImgViewOpen(true); }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-lg">
                    <Package size={15} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.categoria?.descripcion ?? 'Sin categoría'}</p>
                </div>
              </div>
            )},
            { key: 'codigo', label: 'Código', render: (p) => <span className="font-mono text-xs">{p.codigo}</span> },
            { key: 'precioVenta', label: 'Precio Venta', render: (p) => (
              <span className="font-medium">${Number(p.precioVenta).toLocaleString('es')}</span>
            )},
            { key: 'precioCompra', label: 'Precio Compra', render: (p) => (
              <span className="text-slate-500">${Number(p.precioCompra).toLocaleString('es')}</span>
            )},
            { key: 'stock', label: 'Stock', render: (p) => (
              <Badge variant={(p.stock ?? 0) < 10 ? 'red' : 'green'}>{p.stock ?? 0} unidades</Badge>
            )},
            { key: 'actions', label: '', render: (p) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(p)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleting(p)} title="Eliminar" aria-label="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          rowKey={(p) => p.idProducto}
          emptyMessage="No hay productos registrados"
        />
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre del producto *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} icon={<Package size={18} />} maxLength={70} required />
            <Input label="Código *" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} icon={<Barcode size={18} />} maxLength={30} required />
            <Select label="Categoría *" value={form.idCategoria} onChange={(e) => setForm({ ...form, idCategoria: e.target.value })} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.descripcion}</option>)}
            </Select>
            <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} icon={<Boxes size={18} />} />
            <Input label="Precio de compra *" type="number" step="0.01" min="0.01" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} icon={<DollarSign size={18} />} required />
            <Input label="Precio de venta *" type="number" step="0.01" min="0.01" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} icon={<DollarSign size={18} />} required />
          </div>
          <Input label="Detalle" value={form.detalle} onChange={(e) => setForm({ ...form, detalle: e.target.value })} maxLength={50} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto</label>
            {fotoPreview ? (
              <div className="flex items-center gap-3">
                <img src={fotoPreview} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                <Button type="button" variant="secondary" size="sm" onClick={handleRemoveFoto}>
                  <X size={14} /> Quitar foto
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg py-6 cursor-pointer hover:border-slate-400 transition-colors">
                <Upload size={20} className="text-slate-400" />
                <span className="text-sm text-slate-500">Subir imagen (JPEG, PNG o WebP, máx. 3 MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={imgViewOpen} onClose={() => setImgViewOpen(false)} title={imgViewing?.nombre ?? ''} size="md">
        {imgViewing && (
          <div className="space-y-3">
            {imgViewing.fotoUrl && (
              <img src={imgViewing.fotoUrl} alt={imgViewing.nombre} className="w-full rounded-lg object-cover" />
            )}
            <p className="text-sm text-slate-500 font-mono">{imgViewing.codigo}</p>
            {imgViewing.detalle && <p className="text-sm text-slate-600">{imgViewing.detalle}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar producto"
        message={`¿Eliminar ${deleting?.nombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}