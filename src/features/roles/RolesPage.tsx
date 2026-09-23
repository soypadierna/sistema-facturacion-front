import { useEffect, useState } from 'react';
import { getErrorMessage as errMsg } from '@/shared/api/httpClient';
import * as rolesApi from './rolesApi';
import type { Rol } from './types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';

const SYSTEM_ROLE_IDS = [1, 2, 3, 4];

const MODULO_LABELS: Record<string, string> = {
  dashboard: 'Panel principal',
  clientes: 'Clientes',
  productos: 'Productos',
  categorias: 'Categorías',
  facturas: 'Facturas',
  informes: 'Informes',
  empleados: 'Empleados',
  roles: 'Roles',
  'crear-admin': 'Crear usuarios',
};

function labelForModulo(mod: string): string {
  return MODULO_LABELS[mod] ?? mod;
}

export function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [form, setForm] = useState({ descripcion: '' });
  const [permisosForm, setPermisosForm] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Rol | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [rolesData, modulosData] = await Promise.all([
        rolesApi.listRoles(),
        rolesApi.listModulos(),
      ]);
      setRoles(rolesData);
      setModulos(modulosData);
    } catch (e) {
      showToast(errMsg(e), 'error');
      setRoles([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const isSistema = (id: number) => SYSTEM_ROLE_IDS.includes(id);
  const esGerente = (id: number) => id === 1;

  function openNew() {
    setEditing(null);
    setForm({ descripcion: '' });
    setPermisosForm([]);
    setModalOpen(true);
  }

  function openEdit(r: Rol) {
    setEditing(r);
    setForm({ descripcion: r.descripcion ?? '' });
    setPermisosForm(r.permisos ?? []);
    setModalOpen(true);
  }

  function toggleModulo(mod: string) {
    setPermisosForm((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await rolesApi.updateRol(editing.id, form.descripcion, permisosForm);
        showToast('Rol actualizado');
      } else {
        await rolesApi.createRol(form.descripcion, permisosForm);
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

  function modulosResumen(permisos: string[]): string {
    if (!permisos || permisos.length === 0) return 'Sin módulos';
    if (permisos.length <= 3) {
      return permisos.map(labelForModulo).join(', ');
    }
    return `${permisos.slice(0, 3).map(labelForModulo).join(', ')}... (${permisos.length} módulos)`;
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
            { key: 'modulos', label: 'Módulos', render: (r) => (
              <span className="text-sm text-slate-600">
                {esGerente(r.id) ? 'Todos' : modulosResumen(r.permisos)}
              </span>
            )},
            { key: 'actions', label: '', render: (r) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(r)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                {!isSistema(r.id) && (
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Módulos con acceso</label>
            {editing && esGerente(editing.id) && (
              <p className="text-xs text-slate-500 mb-2">El Gerente siempre tiene acceso a todo.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {modulos.map((mod) => (
                <label key={mod} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editing && esGerente(editing.id) ? true : permisosForm.includes(mod)}
                    onChange={() => toggleModulo(mod)}
                    disabled={!!editing && esGerente(editing.id)}
                  />
                  {labelForModulo(mod)}
                </label>
              ))}
            </div>
          </div>

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