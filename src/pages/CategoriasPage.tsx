import { useEffect, useState } from 'react';
import { supabase, type CategoriaProd } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaProd[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaProd | null>(null);
  const [form, setForm] = useState({ strdescripcion: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<CategoriaProd | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tblcategoria_prod').select('*').order('idcategoria', { ascending: false });
    setCategorias(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ strdescripcion: '' });
    setModalOpen(true);
  }

  function openEdit(c: CategoriaProd) {
    setEditing(c);
    setForm({ strdescripcion: c.strdescripcion ?? '' });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      strdescripcion: form.strdescripcion,
      dtmfechamodifica: new Date().toISOString(),
      strusuariomodifico: 'admin',
    };
    if (editing) {
      const { error } = await supabase.from('tblcategoria_prod').update(payload).eq('idcategoria', editing.idcategoria);
      if (error) showToast('Error al actualizar', 'error');
      else showToast('Categoría actualizada');
    } else {
      const { error } = await supabase.from('tblcategoria_prod').insert(payload);
      if (error) showToast('Error al crear', 'error');
      else showToast('Categoría creada');
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await supabase.from('tblcategoria_prod').delete().eq('idcategoria', deleting.idcategoria);
    if (error) showToast('Error al eliminar', 'error');
    else showToast('Categoría eliminada');
    setDeleteLoading(false);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Categorías de Productos</h3>
          <p className="text-sm text-slate-500 mt-1">{categorias.length} categorías registradas</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nueva Categoría</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            { key: 'strdescripcion', label: 'Descripción', render: (c) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <FolderTree size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{c.strdescripcion}</span>
              </div>
            )},
            { key: 'dtmfechamodifica', label: 'Fecha modificación', render: (c) => c.dtmfechamodifica ? new Date(c.dtmfechamodifica).toLocaleDateString('es') : '-' },
            { key: 'strusuariomodifico', label: 'Modificado por', render: (c) => c.strusuariomodifico ?? '-' },
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
          data={categorias}
          rowKey={(c) => c.idcategoria}
          emptyMessage="No hay categorías registradas"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} size="md">
        <form onSubmit={save} className="space-y-4">
          <Input label="Descripción *" value={form.strdescripcion} onChange={(e) => setForm({ ...form, strdescripcion: e.target.value })} icon={<FolderTree size={18} />} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría ${deleting?.strdescripcion}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}