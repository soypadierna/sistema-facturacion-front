import { useEffect, useState } from 'react';
import { supabase, type Informe } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, BarChart3, Calendar, FileText, Eye } from 'lucide-react';

const tipos = ['Ventas', 'Inventario', 'Financiero', 'Empleados', 'Clientes'];

export function InformesPage() {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Informe | null>(null);
  const [editing, setEditing] = useState<Informe | null>(null);
  const [form, setForm] = useState({ strtitulo: '', strtipo: 'Ventas', strdescripcion: '', dtmfechainicio: '', dtmfechafin: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Informe | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tblinformes').select('*').order('idinforme', { ascending: false });
    setInformes(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ strtitulo: '', strtipo: 'Ventas', strdescripcion: '', dtmfechainicio: '', dtmfechafin: '' });
    setModalOpen(true);
  }

  function openEdit(i: Informe) {
    setEditing(i);
    setForm({ strtitulo: i.strtitulo, strtipo: i.strtipo, strdescripcion: i.strdescripcion ?? '', dtmfechainicio: i.dtmfechainicio ?? '', dtmfechafin: i.dtmfechafin ?? '' });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      strtitulo: form.strtitulo,
      strtipo: form.strtipo,
      strdescripcion: form.strdescripcion || null,
      dtmfechainicio: form.dtmfechainicio || null,
      dtmfechafin: form.dtmfechafin || null,
    };
    if (editing) {
      const { error } = await supabase.from('tblinformes').update(payload).eq('idinforme', editing.idinforme);
      if (error) showToast('Error al actualizar', 'error');
      else showToast('Informe actualizado');
    } else {
      const { error } = await supabase.from('tblinformes').insert(payload);
      if (error) showToast('Error al crear', 'error');
      else showToast('Informe creado');
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('tblinformes').delete().eq('idinforme', deleting.idinforme);
    if (error) showToast('Error al eliminar', 'error');
    else showToast('Informe eliminado');
    setDeleteLoading(false);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Informes</h3>
          <p className="text-sm text-slate-500 mt-1">{informes.length} informes generados</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nuevo Informe</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            { key: 'strtitulo', label: 'Título', render: (i) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <BarChart3 size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{i.strtitulo}</span>
              </div>
            )},
            { key: 'strtipo', label: 'Tipo', render: (i) => <Badge variant="blue">{i.strtipo}</Badge> },
            { key: 'dtmfechainicio', label: 'Desde', render: (i) => i.dtmfechainicio ?? '-' },
            { key: 'dtmfechafin', label: 'Hasta', render: (i) => i.dtmfechafin ?? '-' },
            { key: 'dtmfechacreacion', label: 'Creado', render: (i) => new Date(i.dtmfechacreacion).toLocaleDateString('es') },
            { key: 'actions', label: '', render: (i) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => { setViewing(i); setViewOpen(true); }} title="Ver" aria-label="Ver" className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
                <button onClick={() => openEdit(i)} title="Editar" aria-label="Editar" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleting(i)} title="Eliminar" aria-label="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )},
          ]}
          data={informes}
          rowKey={(i) => i.idinforme}
          emptyMessage="No hay informes registrados"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Informe' : 'Nuevo Informe'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Input label="Título *" value={form.strtitulo} onChange={(e) => setForm({ ...form, strtitulo: e.target.value })} icon={<FileText size={18} />} required />
          <Select label="Tipo de informe *" value={form.strtipo} onChange={(e) => setForm({ ...form, strtipo: e.target.value })}>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha inicio" type="date" value={form.dtmfechainicio} onChange={(e) => setForm({ ...form, dtmfechainicio: e.target.value })} icon={<Calendar size={18} />} />
            <Input label="Fecha fin" type="date" value={form.dtmfechafin} onChange={(e) => setForm({ ...form, dtmfechafin: e.target.value })} icon={<Calendar size={18} />} />
          </div>
          <Textarea label="Descripción" value={form.strdescripcion} onChange={(e) => setForm({ ...form, strdescripcion: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={viewing?.strtitulo ?? ''} size="md">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="blue">{viewing.strtipo}</Badge>
              <span className="text-sm text-slate-500">{new Date(viewing.dtmfechacreacion).toLocaleDateString('es')}</span>
            </div>
            {viewing.strdescripcion && <p className="text-sm text-slate-600">{viewing.strdescripcion}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Fecha inicio</p>
                <p className="text-sm font-medium text-slate-800">{viewing.dtmfechainicio ?? '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Fecha fin</p>
                <p className="text-sm font-medium text-slate-800">{viewing.dtmfechafin ?? '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar informe"
        message={`¿Eliminar el informe ${deleting?.strtitulo}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}