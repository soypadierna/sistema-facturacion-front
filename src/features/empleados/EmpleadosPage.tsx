import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/shared/utils/date';
import { getErrorMessage as errMsg } from '@/shared/api/httpClient';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, UserMinus, RotateCcw, UserCog, Mail, Phone, MapPin, Calendar, IdCard, Search } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { Table } from '@/components/ui/Table';
import { useAuth } from '@/features/auth/AuthContext';
import { useEffect, useState } from 'react';
import * as empleadosApi from './empleadosApi';
import * as rolesApi from '../roles/rolesApi';
import type { Empleado } from './types';
import type { Rol } from '../roles/types';

export function EmpleadosPage() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [incluirRetirados, setIncluirRetirados] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Empleado | null>(null);
  const [form, setForm] = useState({ nombre: '', documento: '', direccion: '', telefono: '', email: '', idRol: '', ingreso: '', datosAdicionales: '' });
  const [saving, setSaving] = useState(false);
  const [retiring, setRetiring] = useState<Empleado | null>(null);
  const [retireLoading, setRetireLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [emp, rol] = await Promise.all([
        empleadosApi.listEmpleados(incluirRetirados),
        rolesApi.listRoles(),
      ]);
      setEmpleados(emp);
      setRoles(rol);
    } catch (e) {
      showToast(errMsg(e), 'error');
      setEmpleados([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [incluirRetirados]);

  const filtered = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (e.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(e.documento ?? '').includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm({ nombre: '', documento: '', direccion: '', telefono: '', email: '', idRol: '', ingreso: '', datosAdicionales: '' });
    setModalOpen(true);
  }

  function openEdit(e: Empleado) {
    setEditing(e);
    setForm({
      nombre: e.nombre,
      documento: e.documento ? String(e.documento) : '',
      direccion: e.direccion ?? '',
      telefono: e.telefono ?? '',
      email: e.email ?? '',
      idRol: e.rol ? String(e.rol.id) : '',
      ingreso: e.ingreso ?? '',
      datosAdicionales: e.datosAdicionales ?? '',
    });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      documento: parseInt(form.documento) || 0,
      direccion: form.direccion || null,
      telefono: form.telefono || null,
      email: form.email || null,
      idRol: form.idRol ? parseInt(form.idRol) : null,
      ingreso: form.ingreso || null,
      datosAdicionales: form.datosAdicionales || null,
    };
    try {
      if (editing) {
        await empleadosApi.updateEmpleado(editing.idEmpleado, payload);
        showToast('Empleado actualizado');
      } else {
        await empleadosApi.createEmpleado(payload);
        showToast('Empleado creado');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
    }
    setSaving(false);
  }

  async function confirmRetire() {
    if (!retiring) return;
    setRetireLoading(true);
    try {
      await empleadosApi.retireEmpleado(retiring.idEmpleado);
      showToast('Empleado retirado');
      setRetiring(null);
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
      setRetiring(null);
    }
    setRetireLoading(false);
  }

  async function reactivar(e: Empleado) {
    try {
      await empleadosApi.reactivarEmpleado(e.idEmpleado);
      showToast('Empleado reactivado');
      load();
    } catch (err) {
      showToast(errMsg(err), 'error');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Empleados</h3>
          <p className="text-sm text-slate-500 mt-1">{empleados.length} empleados registrados</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={incluirRetirados} onChange={(e) => setIncluirRetirados(e.target.checked)} />
            Mostrar retirados
          </label>
          <Button onClick={openNew}><Plus size={18} /> Nuevo Empleado</Button>
        </div>
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
            { key: 'nombre', label: 'Nombre', render: (e) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full">
                  <UserCog size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{e.nombre}</span>
                {e.retirado && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Retirado</span>
                )}
                {e.retiro && !e.retirado && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Retiro programado {formatDate(e.retiro)}
                  </span>
                )}
              </div>
            )},
            { key: 'documento', label: 'Documento', render: (e) => e.documento ?? '-' },
            { key: 'email', label: 'Email', render: (e) => e.email ?? '-' },
            { key: 'telefono', label: 'Teléfono', render: (e) => e.telefono ?? '-' },
            { key: 'rol', label: 'Rol', render: (e) => e.rol?.descripcion ?? '-' },
            { key: 'ingreso', label: 'Ingreso', render: (e) => formatDate(e.ingreso) },
            { key: 'actions', label: '', render: (e) => (
              <div className="flex items-center gap-1 justify-end">
                {e.retirado ? (
                  <button onClick={() => reactivar(e)} title="Reactivar" aria-label="Reactivar" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <RotateCcw size={16} />
                  </button>
                ) : (
                  <>
                    <button onClick={() => openEdit(e)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </button>
                    {e.idEmpleado !== user?.idempleado && (
                      <button onClick={() => setRetiring(e)} title="Retirar" aria-label="Retirar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <UserMinus size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            )},
          ]}
          data={filtered}
          rowKey={(e) => e.idEmpleado}
          emptyMessage="No hay empleados registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Empleado' : 'Nuevo Empleado'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre completo *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} icon={<UserCog size={18} />} required />
            <Input label="Documento *" type="number" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} icon={<IdCard size={18} />} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<Mail size={18} />} />
            <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} icon={<Phone size={18} />} />
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} icon={<MapPin size={18} />} />
            <Select label="Rol" value={form.idRol} onChange={(e) => setForm({ ...form, idRol: e.target.value })} disabled={editing?.idEmpleado === user?.idempleado}>
              <option value="">Sin rol asignado</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.descripcion}</option>)}
            </Select>
            <Input label="Fecha de ingreso" type="date" value={form.ingreso} onChange={(e) => setForm({ ...form, ingreso: e.target.value })} icon={<Calendar size={18} />} />
          </div>
          <Textarea label="Datos adicionales" value={form.datosAdicionales} onChange={(e) => setForm({ ...form, datosAdicionales: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!retiring}
        title="Retirar empleado"
        message={`¿Retirar a ${retiring?.nombre}? Ya no podrá iniciar sesión, pero su historial se conserva.`}
        confirmLabel="Retirar"
        variant="danger"
        loading={retireLoading}
        onConfirm={confirmRetire}
        onClose={() => setRetiring(null)}
      />
    </div>
  );
}