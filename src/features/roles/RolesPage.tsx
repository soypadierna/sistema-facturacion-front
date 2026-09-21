import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage as errMsg } from '@/shared/api/httpClient';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { Table } from '@/components/ui/Table';
import { useEffect, useState } from 'react';
import * as rolesApi from './rolesApi';
import type { Rol } from './types';

const SYSTEM_ROLE_IDS = [1, 2, 3, 4];

export function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [form, setForm] = useState({ descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Rol | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRoles(await rolesApi.listRoles());
    } catch (e) {
      showToast(errMsg(e), 'error');
      setRoles([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ descripcion: '' });
    setModalOpen(true);
  }

  function openEdit(r: Rol) {
    setEditing(r);
    setForm({ descripcion: r.descripcion ?? '' });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await rolesApi.updateRol(editing.id, form.descripcion);
        showToast('Rol actualizado');
      } else {
        await rolesApi.createRol(form.descripcion);
        showToast('Rol creado');
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
      await rolesApi.deleteRol(deleting.id);
      showToast('Rol eliminado');
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
          <h3 className="text-xl font-bold text-slate-800">Roles de Empleados</h3>
          <p className="text-sm text-slate-500 mt-1">{roles.length} roles configurados</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nuevo Rol</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            { key: 'descripcion', label: 'Descripción', render: (r) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <Shield size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{r.descripcion}</span>
              </div>
            )},
            { key: 'actions', label: '', render: (r) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(r)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                {!SYSTEM_ROLE_IDS.includes(r.id) && (
                  <button onClick={() => setDeleting(r)} title="Eliminar" aria-label="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )},
          ]}
          data={roles}
          rowKey={(r) => r.id}
          emptyMessage="No hay roles registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Rol' : 'Nuevo Rol'} size="md">
        <form onSubmit={save} className="space-y-4">
          <Input label="Descripción del rol *" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} icon={<Shield size={18} />} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar rol"
        message={`¿Eliminar el rol ${deleting?.descripcion}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}