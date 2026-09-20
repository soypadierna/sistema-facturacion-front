import { useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/httpClient';
import * as clientesApi from './clientesApi';
import type { Cliente } from './types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Search, Users, Mail, Phone, MapPin, IdCard } from 'lucide-react';

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Error de conexión';
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nombre: '', documento: '', direccion: '', telefono: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Cliente | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setClientes(await clientesApi.listClientes());
    } catch (e) {
      showToast(errMsg(e), 'error');
      setClientes([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = clientes.filter((c) =>
    (c.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(c.documento ?? '').includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm({ nombre: '', documento: '', direccion: '', telefono: '', email: '' });
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nombre: c.nombre ?? '',
      documento: c.documento ? String(c.documento) : '',
      direccion: c.direccion ?? '',
      telefono: c.telefono ?? '',
      email: c.email ?? '',
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      documento: form.documento ? parseInt(form.documento) : null,
      direccion: form.direccion || null,
      telefono: form.telefono || null,
      email: form.email || null,
    };
    try {
      if (editing) {
        await clientesApi.updateCliente(editing.idCliente, payload);
        showToast('Cliente actualizado');
      } else {
        await clientesApi.createCliente(payload);
        showToast('Cliente creado');
      }
      setModalOpen(false);
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
      await clientesApi.deleteCliente(deleting.idCliente);
      showToast('Cliente eliminado');
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
            { key: 'nombre', label: 'Nombre', render: (c) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full">
                  <Users size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{c.nombre}</span>
              </div>
            )},
            { key: 'documento', label: 'Documento', render: (c) => c.documento ?? '-' },
            { key: 'email', label: 'Email', render: (c) => c.email ?? '-' },
            { key: 'telefono', label: 'Teléfono', render: (c) => c.telefono ?? '-' },
            { key: 'direccion', label: 'Dirección', render: (c) => c.direccion ?? '-' },
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
          rowKey={(c) => c.idCliente}
          emptyMessage="No hay clientes registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre completo *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} icon={<Users size={18} />} maxLength={55} required />
            <Input label="Documento" type="number" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} icon={<IdCard size={18} />} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<Mail size={18} />} maxLength={50} />
            <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} icon={<Phone size={18} />} maxLength={30} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} icon={<MapPin size={18} />} maxLength={70} />
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
        message={`¿Eliminar a ${deleting?.nombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}