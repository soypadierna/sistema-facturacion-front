import { useEffect, useState } from 'react';
import { supabase, type Cliente } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Search, Users, Mail, Phone, MapPin, IdCard } from 'lucide-react';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ strnombre: '', numdocumento: '', strdireccion: '', strtelefono: '', stremail: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Cliente | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tblclientes').select('*').order('idcliente', { ascending: false });
    setClientes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = clientes.filter((c) =>
    (c.strnombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.stremail ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(c.numdocumento ?? '').includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm({ strnombre: '', numdocumento: '', strdireccion: '', strtelefono: '', stremail: '' });
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      strnombre: c.strnombre ?? '',
      numdocumento: c.numdocumento ? String(c.numdocumento) : '',
      strdireccion: c.strdireccion ?? '',
      strtelefono: c.strtelefono ?? '',
      stremail: c.stremail ?? '',
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      strnombre: form.strnombre,
      numdocumento: form.numdocumento ? parseInt(form.numdocumento) : null,
      strdireccion: form.strdireccion || null,
      strtelefono: form.strtelefono || null,
      stremail: form.stremail || null,
      dtmfechamodifica: new Date().toISOString(),
      strusuariomodifico: 'admin',
    };
    if (editing) {
      const { error } = await supabase.from('tblclientes').update(payload).eq('idcliente', editing.idcliente);
      if (error) showToast('Error al actualizar', 'error');
      else showToast('Cliente actualizado');
    } else {
      const { error } = await supabase.from('tblclientes').insert(payload);
      if (error) showToast('Error al crear', 'error');
      else showToast('Cliente creado');
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('tblclientes').delete().eq('idcliente', deleting.idcliente);
    if (error) showToast('Error al eliminar', 'error');
    else showToast('Cliente eliminado');
    setDeleteLoading(false);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Clientes</h3>
          <p className="text-sm text-slate-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nuevo Cliente</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar por nombre, email o documento..."
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
            { key: 'strnombre', label: 'Nombre', render: (c) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full">
                  <Users size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{c.strnombre}</span>
              </div>
            )},
            { key: 'numdocumento', label: 'Documento', render: (c) => c.numdocumento ?? '-' },
            { key: 'stremail', label: 'Email', render: (c) => c.stremail ?? '-' },
            { key: 'strtelefono', label: 'Teléfono', render: (c) => c.strtelefono ?? '-' },
            { key: 'strdireccion', label: 'Dirección', render: (c) => c.strdireccion ?? '-' },
            { key: 'actions', label: '', render: (c) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(c)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleting(c)} title="Eliminar" aria-label="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          rowKey={(c) => c.idcliente}
          emptyMessage="No hay clientes registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre completo *" value={form.strnombre} onChange={(e) => setForm({ ...form, strnombre: e.target.value })} icon={<Users size={18} />} required />
            <Input label="Documento" type="number" value={form.numdocumento} onChange={(e) => setForm({ ...form, numdocumento: e.target.value })} icon={<IdCard size={18} />} />
            <Input label="Email" type="email" value={form.stremail} onChange={(e) => setForm({ ...form, stremail: e.target.value })} icon={<Mail size={18} />} />
            <Input label="Teléfono" value={form.strtelefono} onChange={(e) => setForm({ ...form, strtelefono: e.target.value })} icon={<Phone size={18} />} />
            <Input label="Dirección" value={form.strdireccion} onChange={(e) => setForm({ ...form, strdireccion: e.target.value })} icon={<MapPin size={18} />} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar cliente"
        message={`¿Eliminar a ${deleting?.strnombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}