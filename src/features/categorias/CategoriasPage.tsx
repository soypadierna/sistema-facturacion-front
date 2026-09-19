import { useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/httpClient';
import * as categoriasApi from './categoriasApi';
import type { Categoria } from './types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { showToast } from '@/components/ui/Toast';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Error de conexión';
}

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState({ descripcion: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Categoria | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCategorias(await categoriasApi.listCategorias());
    } catch (e) {
      showToast(errMsg(e), 'error');
      setCategorias([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ descripcion: '' });
    setModalOpen(true);
  }

  function openEdit(c: Categoria) {
    setEditing(c);
    setForm({ descripcion: c.descripcion ?? '' });
    setModalOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoriasApi.updateCategoria(editing.id, form.descripcion);
        showToast('Categoría actualizada');
      } else {
        await categoriasApi.createCategoria(form.descripcion);
        showToast('Categoría creada');
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
      await categoriasApi.deleteCategoria(deleting.id);
      showToast('Categoría eliminada');
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
            { key: 'descripcion', label: 'Descripción', render: (c) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <FolderTree size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">{c.descripcion}</span>
              </div>
            )},
            { key: 'fechaModificacion', label: 'Fecha modificación', render: (c) => c.fechaModificacion ? new Date(c.fechaModificacion).toLocaleDateString('es') : '-' },
            { key: 'modificadoPor', label: 'Modificado por', render: (c) => c.modificadoPor ?? '-' },
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
          rowKey={(c) => c.id}
          emptyMessage="No hay categorías registradas"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} size="md">
        <form onSubmit={save} className="space-y-4">
          <Input label="Descripción *" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} icon={<FolderTree size={18} />} maxLength={60} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría ${deleting?.descripcion}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}