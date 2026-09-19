import { useEffect, useState } from 'react';
import { supabase, type Producto, type CategoriaProd } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Boxes, Barcode } from 'lucide-react';

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProd[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState({ strnombre: '', strcodigo: '', numpreciocompra: '', numprecioventa: '', idcategoria: '', strdetalle: '', numstock: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Producto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tblproducto').select('*, categoria:tblcategoria_prod(*)').order('idproducto', { ascending: false });
    setProductos(data ?? []);
    const { data: cats } = await supabase.from('tblcategoria_prod').select('*').order('strdescripcion');
    setCategorias(cats ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = productos.filter((p) =>
    p.strnombre.toLowerCase().includes(search.toLowerCase()) ||
    p.strcodigo.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(null);
    setForm({ strnombre: '', strcodigo: '', numpreciocompra: '', numprecioventa: '', idcategoria: '', strdetalle: '', numstock: '' });
    setModalOpen(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      strnombre: p.strnombre,
      strcodigo: p.strcodigo,
      numpreciocompra: String(p.numpreciocompra),
      numprecioventa: String(p.numprecioventa),
      idcategoria: String(p.idcategoria),
      strdetalle: p.strdetalle ?? '',
      numstock: p.numstock != null ? String(p.numstock) : '',
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      strnombre: form.strnombre,
      strcodigo: form.strcodigo,
      numpreciocompra: parseFloat(form.numpreciocompra) || 0,
      numprecioventa: parseFloat(form.numprecioventa) || 0,
      idcategoria: parseInt(form.idcategoria) || 1,
      strdetalle: form.strdetalle || null,
      numstock: form.numstock ? parseInt(form.numstock) : 0,
      dtmfechamodifica: new Date().toISOString(),
      strusuariomodifico: 'admin',
    };
    if (editing) {
      const { error } = await supabase.from('tblproducto').update(payload).eq('idproducto', editing.idproducto);
      if (error) showToast('Error al actualizar', 'error');
      else showToast('Producto actualizado');
    } else {
      const { error } = await supabase.from('tblproducto').insert(payload);
      if (error) showToast('Error al crear', 'error');
      else showToast('Producto creado');
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('tblproducto').delete().eq('idproducto', deleting.idproducto);
    if (error) showToast('Error al eliminar', 'error');
    else showToast('Producto eliminado');
    setDeleteLoading(false);
    setDeleting(null);
    load();
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
            { key: 'strnombre', label: 'Producto', render: (p) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <Package size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{p.strnombre}</p>
                  <p className="text-xs text-slate-400">{p.categoria?.strdescripcion ?? 'Sin categoría'}</p>
                </div>
              </div>
            )},
            { key: 'strcodigo', label: 'Código', render: (p) => <span className="font-mono text-xs">{p.strcodigo}</span> },
            { key: 'numprecioventa', label: 'Precio Venta', render: (p) => (
              <span className="font-medium">${Number(p.numprecioventa).toLocaleString('es')}</span>
            )},
            { key: 'numpreciocompra', label: 'Precio Compra', render: (p) => (
              <span className="text-slate-500">${Number(p.numpreciocompra).toLocaleString('es')}</span>
            )},
            { key: 'numstock', label: 'Stock', render: (p) => (
              <Badge variant={(p.numstock ?? 0) < 10 ? 'red' : 'green'}>{p.numstock ?? 0} unidades</Badge>
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
          rowKey={(p) => p.idproducto}
          emptyMessage="No hay productos registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre del producto *" value={form.strnombre} onChange={(e) => setForm({ ...form, strnombre: e.target.value })} icon={<Package size={18} />} required />
            <Input label="Código *" value={form.strcodigo} onChange={(e) => setForm({ ...form, strcodigo: e.target.value })} icon={<Barcode size={18} />} required />
            <Select label="Categoría *" value={form.idcategoria} onChange={(e) => setForm({ ...form, idcategoria: e.target.value })} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => <option key={c.idcategoria} value={c.idcategoria}>{c.strdescripcion}</option>)}
            </Select>
            <Input label="Stock" type="number" value={form.numstock} onChange={(e) => setForm({ ...form, numstock: e.target.value })} icon={<Boxes size={18} />} />
            <Input label="Precio de compra *" type="number" step="0.01" value={form.numpreciocompra} onChange={(e) => setForm({ ...form, numpreciocompra: e.target.value })} icon={<DollarSign size={18} />} required />
            <Input label="Precio de venta *" type="number" step="0.01" value={form.numprecioventa} onChange={(e) => setForm({ ...form, numprecioventa: e.target.value })} icon={<DollarSign size={18} />} required />
          </div>
          <Input label="Detalle" value={form.strdetalle} onChange={(e) => setForm({ ...form, strdetalle: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar producto"
        message={`¿Eliminar ${deleting?.strnombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}