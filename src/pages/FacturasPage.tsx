import { useEffect, useState } from 'react';
import { supabase, type Factura, type Cliente, type Producto, type Empleado, type EstadoFactura } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { Plus, Trash2, FileText, Calendar, User, DollarSign, Eye, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type DetalleRow = { idproducto: number; numcantidad: number; numprecio: number; nombre: string };

export function FacturasPage() {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [estados, setEstados] = useState<EstadoFactura[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Factura | null>(null);
  const [form, setForm] = useState({ idcliente: '', idempleado: '', idestado: '', numdescuento: '', numimpuesto: '' });
  const [detalles, setDetalles] = useState<DetalleRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Factura | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tblfactura').select('*, cliente:tblclientes(*), empleado:tblempleado(*), estado:tblestado_factura(*)').order('idfactura', { ascending: false });
    setFacturas(data ?? []);
    const [cl, emp, est, prod] = await Promise.all([
      supabase.from('tblclientes').select('*').order('strnombre'),
      supabase.from('tblempleado').select('*').order('strnombre'),
      supabase.from('tblestado_factura').select('*').order('idestadofactura'),
      supabase.from('tblproducto').select('*').order('strnombre'),
    ]);
    setClientes(cl.data ?? []);
    setEmpleados(emp.data ?? []);
    setEstados(est.data ?? []);
    setProductos(prod.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totalDetalles = detalles.reduce((sum, d) => sum + d.numprecio * d.numcantidad, 0);
  const descuento = parseFloat(form.numdescuento) || 0;
  const impuesto = parseFloat(form.numimpuesto) || 0;
  const totalFinal = totalDetalles - descuento + impuesto;

  function openNew() {
    setForm({ idcliente: '', idempleado: user ? String(user.idempleado) : '', idestado: '1', numdescuento: '', numimpuesto: '' });
    setDetalles([]);
    setModalOpen(true);
  }

  function addDetalle() {
    setDetalles([...detalles, { idproducto: 0, numcantidad: 1, numprecio: 0, nombre: '' }]);
  }

  function updateDetalle(index: number, field: keyof DetalleRow, value: string) {
    const next = [...detalles];
    if (field === 'idproducto') {
      const prod = productos.find((p) => p.idproducto === parseInt(value));
      next[index] = { ...next[index], idproducto: parseInt(value), nombre: prod?.strnombre ?? '', numprecio: prod ? Number(prod.numprecioventa) : 0 };
    } else if (field === 'numcantidad') {
      next[index] = { ...next[index], numcantidad: parseInt(value) || 1 };
    } else if (field === 'numprecio') {
      next[index] = { ...next[index], numprecio: parseFloat(value) || 0 };
    }
    setDetalles(next);
  }

  function removeDetalle(index: number) {
    setDetalles(detalles.filter((_, i) => i !== index));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.idcliente) { showToast('Selecciona un cliente', 'error'); return; }
    if (!form.idempleado) { showToast('Selecciona un empleado', 'error'); return; }
    if (detalles.length === 0) { showToast('Agrega al menos un producto', 'error'); return; }
    setSaving(true);
    const { data: factura, error } = await supabase.from('tblfactura').insert({
      dtmfecha: new Date().toISOString(),
      idcliente: parseInt(form.idcliente),
      idempleado: parseInt(form.idempleado),
      numdescuento: descuento,
      numimpuesto: impuesto,
      numvalortotal: totalFinal,
      idestado: parseInt(form.idestado) || 1,
      dtmfechamodifica: new Date().toISOString(),
      strusuariomodifico: user?.strusuario ?? 'admin',
    }).select().single();
    if (error) { showToast('Error al crear factura', 'error'); setSaving(false); return; }
    const detallesPayload = detalles.map((d) => ({
      idfactura: factura.idfactura,
      numcantidad: d.numcantidad,
      idproducto: d.idproducto,
      numprecio: d.numprecio,
    }));
    const { error: detError } = await supabase.from('tbldetalle_factura').insert(detallesPayload);
    if (detError) showToast('Error al guardar detalles', 'error');
    else showToast('Factura creada');
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function viewFactura(f: Factura) {
    const { data: detalles } = await supabase
      .from('tbldetalle_factura')
      .select('*, producto:tblproducto(*)')
      .eq('idfactura', f.idfactura);
    setViewing({ ...f, detalles: detalles ?? [] });
    setViewOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    await supabase.from('tbldetalle_factura').delete().eq('idfactura', deleting.idfactura);
    const { error } = await supabase.from('tblfactura').delete().eq('idfactura', deleting.idfactura);
    if (error) showToast('Error al eliminar', 'error');
    else showToast('Factura eliminada');
    setDeleteLoading(false);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Facturas</h3>
          <p className="text-sm text-slate-500 mt-1">{facturas.length} facturas emitidas</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Nueva Factura</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={[
            { key: 'idfactura', label: 'N°', render: (f) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <FileText size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">#{f.idfactura}</span>
              </div>
            )},
            { key: 'cliente', label: 'Cliente', render: (f) => f.cliente?.strnombre ?? '-' },
            { key: 'empleado', label: 'Empleado', render: (f) => f.empleado?.strnombre ?? '-' },
            { key: 'dtmfecha', label: 'Fecha', render: (f) => f.dtmfecha ? new Date(f.dtmfecha).toLocaleDateString('es') : '-' },
            { key: 'numvalortotal', label: 'Total', render: (f) => <span className="font-medium">${Number(f.numvalortotal ?? 0).toLocaleString('es')}</span> },
            { key: 'estado', label: 'Estado', render: (f) => {
              const v = f.estado?.idestadofactura;
              const variant = v === 2 ? 'green' : v === 1 ? 'yellow' : v === 3 ? 'red' : 'gray';
              return <Badge variant={variant}>{f.estado?.strdescripcion ?? 'Sin estado'}</Badge>;
            }},
            { key: 'actions', label: '', render: (f) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => viewFactura(f)} title="Ver" aria-label="Ver" className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
                <button onClick={() => setDeleting(f)} title="Eliminar" aria-label="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )},
          ]}
          data={facturas}
          rowKey={(f) => f.idfactura}
          emptyMessage="No hay facturas registradas"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Factura" size="xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Cliente *" value={form.idcliente} onChange={(e) => setForm({ ...form, idcliente: e.target.value })} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => <option key={c.idcliente} value={c.idcliente}>{c.strnombre}</option>)}
            </Select>
            <Select label="Empleado *" value={form.idempleado} onChange={(e) => setForm({ ...form, idempleado: e.target.value })} required>
              <option value="">Selecciona un empleado</option>
              {empleados.map((e) => <option key={e.idempleado} value={e.idempleado}>{e.strnombre}</option>)}
            </Select>
            <Select label="Estado" value={form.idestado} onChange={(e) => setForm({ ...form, idestado: e.target.value })}>
              {estados.map((e) => <option key={e.idestadofactura} value={e.idestadofactura}>{e.strdescripcion}</option>)}
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Productos</label>
              <Button type="button" variant="secondary" size="sm" onClick={addDetalle}><Plus size={14} /> Agregar</Button>
            </div>
            <div className="space-y-2">
              {detalles.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg">No hay productos agregados</p>
              )}
              {detalles.map((d, i) => (
                <div key={i} className="flex items-end gap-2 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Producto</label>
                    <select
                      value={d.idproducto || ''}
                      onChange={(e) => updateDetalle(i, 'idproducto', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {productos.map((p) => <option key={p.idproducto} value={p.idproducto}>{p.strnombre} - ${Number(p.numprecioventa).toLocaleString('es')}</option>)}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs text-slate-500 mb-1">Cant.</label>
                    <input type="number" min="1" value={d.numcantidad} onChange={(e) => updateDetalle(i, 'numcantidad', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs text-slate-500 mb-1">Precio</label>
                    <input type="number" step="0.01" value={d.numprecio} onChange={(e) => updateDetalle(i, 'numprecio', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="w-24 text-right">
                    <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                    <span className="font-medium text-sm">${(d.numprecio * d.numcantidad).toLocaleString('es')}</span>
                  </div>
                  <button type="button" onClick={() => removeDetalle(i)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Descuento" type="number" step="0.01" value={form.numdescuento} onChange={(e) => setForm({ ...form, numdescuento: e.target.value })} icon={<DollarSign size={18} />} />
            <Input label="Impuesto" type="number" step="0.01" value={form.numimpuesto} onChange={(e) => setForm({ ...form, numimpuesto: e.target.value })} icon={<DollarSign size={18} />} />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg text-white">
            <span className="text-sm font-medium">Total</span>
            <span className="text-xl font-bold">${totalFinal.toLocaleString('es', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Factura'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={`Factura #${viewing?.idfactura ?? ''}`} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-slate-400" />
                <span className="text-slate-500">Cliente:</span>
                <span className="font-medium text-slate-800">{viewing.cliente?.strnombre ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-500">Fecha:</span>
                <span className="font-medium text-slate-800">{viewing.dtmfecha ? new Date(viewing.dtmfecha).toLocaleDateString('es') : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-slate-400" />
                <span className="text-slate-500">Empleado:</span>
                <span className="font-medium text-slate-800">{viewing.empleado?.strnombre ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-slate-400" />
                <span className="text-slate-500">Estado:</span>
                <Badge variant={viewing.estado?.idestadofactura === 2 ? 'green' : 'yellow'}>{viewing.estado?.strdescripcion ?? '-'}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
              <div><span className="text-slate-500">Descuento: </span><span className="font-medium">${Number(viewing.numdescuento ?? 0).toLocaleString('es')}</span></div>
              <div><span className="text-slate-500">Impuesto: </span><span className="font-medium">${Number(viewing.numimpuesto ?? 0).toLocaleString('es')}</span></div>
              <div><span className="text-slate-500">Total: </span><span className="font-bold">${Number(viewing.numvalortotal ?? 0).toLocaleString('es')}</span></div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Detalle de productos</h4>
              <div className="space-y-2">
                {(viewing.detalles ?? []).map((d) => (
                  <div key={d.iddetalle} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.producto?.strnombre ?? 'Producto eliminado'}</p>
                      <p className="text-xs text-slate-500">{d.numcantidad} x ${Number(d.numprecio).toLocaleString('es')}</p>
                    </div>
                    <span className="font-medium text-sm">${(d.numcantidad * d.numprecio).toLocaleString('es')}</span>
                  </div>
                ))}
                {((viewing.detalles ?? []).length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin detalles</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar factura"
        message={`¿Eliminar la factura #${deleting?.idfactura}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}