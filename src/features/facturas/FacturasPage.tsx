import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage as errMsg } from '@/shared/api/httpClient';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, FileText, Calendar, User, DollarSign, Eye, X } from 'lucide-react';
import { showToast } from '@/components/ui/Toast';
import { Table } from '@/components/ui/Table';
import { useAuth } from '@/features/auth/AuthContext';
import { useEffect, useState } from 'react';
import * as clientesApi from '../clientes/clientesApi';
import * as facturasApi from './facturasApi';
import type { Catalogo, FacturaListItem, FacturaDetalle } from './types';
import type { Cliente } from '../clientes/types';

type LineaForm = { idProducto: number; cantidad: number };

function estadoBadgeVariant(idEstado: number): 'yellow' | 'green' | 'red' | 'gray' {
  if (idEstado === 1) return 'yellow';
  if (idEstado === 2) return 'green';
  if (idEstado === 3) return 'red';
  return 'gray';
}

export function FacturasPage() {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<FacturaDetalle | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [idCliente, setIdCliente] = useState('');
  const [idEstado, setIdEstado] = useState('1');
  const [descuentoPct, setDescuentoPct] = useState('0');
  const [lineas, setLineas] = useState<LineaForm[]>([]);
  const [saving, setSaving] = useState(false);

  const [anulando, setAnulando] = useState(false);
  const [anulandoLoading, setAnulandoLoading] = useState(false);
  const [estadoActionLoading, setEstadoActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [fact, cl] = await Promise.all([
        facturasApi.listFacturas(200),
        clientesApi.listClientes(),
      ]);
      setFacturas(fact);
      setClientes(cl);
    } catch (e) {
      showToast(errMsg(e), 'error');
      setFacturas([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setIdCliente('');
    setIdEstado('1');
    setDescuentoPct('0');
    setLineas([]);
    facturasApi.getCatalogo()
      .then(setCatalogo)
      .catch((e) => showToast(errMsg(e), 'error'));
    setModalOpen(true);
  }

  function addLinea() {
    if (!catalogo) return;
    const usados = new Set(lineas.map((l) => l.idProducto));
    const disponible = catalogo.productos.find((p) => !usados.has(p.idProducto));
    if (!disponible) {
      showToast('No hay más productos disponibles para agregar', 'error');
      return;
    }
    setLineas([...lineas, { idProducto: disponible.idProducto, cantidad: 1 }]);
  }

  function updateLinea(index: number, field: keyof LineaForm, value: string) {
    const next = [...lineas];
    if (field === 'idProducto') {
      next[index] = { ...next[index], idProducto: parseInt(value), cantidad: 1 };
    } else {
      next[index] = { ...next[index], cantidad: parseInt(value) || 1 };
    }
    setLineas(next);
  }

  function removeLinea(index: number) {
    setLineas(lineas.filter((_, i) => i !== index));
  }

  function productoById(id: number) {
    return catalogo?.productos.find((p) => p.idProducto === id);
  }

  const subtotal = lineas.reduce((sum, l) => {
    const p = productoById(l.idProducto);
    return sum + (p ? p.precioVenta * l.cantidad : 0);
  }, 0);
  const descuentoNum = parseFloat(descuentoPct) || 0;
  const descuentoImporte = Math.round(subtotal * (descuentoNum / 100) * 100) / 100;
  const base = subtotal - descuentoImporte;
  const impuestoPct = catalogo?.impuestoPorcentaje ?? 0;
  const impuestoImporte = Math.round(base * (impuestoPct / 100) * 100) / 100;
  const totalPreview = base + impuestoImporte;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!idCliente) { showToast('Selecciona un cliente', 'error'); return; }
    if (lineas.length === 0) { showToast('Agrega al menos un producto', 'error'); return; }
    setSaving(true);
    try {
      const detalle = await facturasApi.createFactura({
        idCliente: parseInt(idCliente),
        idEstado: parseInt(idEstado),
        descuentoPorcentaje: descuentoNum,
        detalles: lineas.map((l) => ({ idProducto: l.idProducto, cantidad: l.cantidad })),
      });
      showToast('Factura creada');
      setModalOpen(false);
      setViewing(detalle);
      setViewOpen(true);
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
    }
    setSaving(false);
  }

  async function openView(f: FacturaListItem) {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const detalle = await facturasApi.getFactura(f.idFactura);
      setViewing(detalle);
    } catch (e) {
      showToast(errMsg(e), 'error');
      setViewOpen(false);
    }
    setViewLoading(false);
  }

  async function cambiarEstado(nuevo: number) {
    if (!viewing) return;
    setEstadoActionLoading(true);
    try {
      const detalle = await facturasApi.updateEstado(viewing.idFactura, nuevo);
      setViewing(detalle);
      showToast('Estado actualizado');
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
    }
    setEstadoActionLoading(false);
  }

  async function confirmAnular() {
    if (!viewing) return;
    setAnulandoLoading(true);
    try {
      const detalle = await facturasApi.updateEstado(viewing.idFactura, 3);
      setViewing(detalle);
      showToast('Factura anulada');
      setAnulando(false);
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
      setAnulando(false);
    }
    setAnulandoLoading(false);
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
            { key: 'idFactura', label: 'N°', render: (f) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg">
                  <FileText size={15} className="text-slate-500" />
                </div>
                <span className="font-medium text-slate-800">#{f.idFactura}</span>
              </div>
            )},
            { key: 'cliente', label: 'Cliente', render: (f) => f.cliente?.nombre ?? '-' },
            { key: 'empleado', label: 'Empleado', render: (f) => f.empleado?.nombre ?? '-' },
            { key: 'fecha', label: 'Fecha', render: (f) => f.fecha ? new Date(f.fecha).toLocaleString('es') : '-' },
            { key: 'total', label: 'Total', render: (f) => <span className="font-medium">${Number(f.total ?? 0).toLocaleString('es')}</span> },
            { key: 'estado', label: 'Estado', render: (f) => (
              <Badge variant={estadoBadgeVariant(f.estado.id)}>{f.estado.descripcion}</Badge>
            )},
            { key: 'actions', label: '', render: (f) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openView(f)} title="Ver" aria-label="Ver" className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            )},
          ]}
          data={facturas}
          rowKey={(f) => f.idFactura}
          emptyMessage="No hay facturas registradas"
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Factura" size="xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Cliente *" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => <option key={c.idCliente} value={c.idCliente}>{c.nombre}</option>)}
            </Select>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emitida por</label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
                <User size={16} className="text-slate-400" />
                {user?.nombreEmpleado}
              </div>
            </div>
            <Select label="Estado" value={idEstado} onChange={(e) => setIdEstado(e.target.value)}>
              <option value="1">Pendiente Pago</option>
              <option value="2">Pagada</option>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Productos</label>
              <Button type="button" variant="secondary" size="sm" onClick={addLinea}><Plus size={14} /> Agregar</Button>
            </div>
            <div className="space-y-2">
              {lineas.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg">No hay productos agregados</p>
              )}
              {lineas.map((l, i) => {
                const usados = new Set(lineas.filter((_, idx) => idx !== i).map((x) => x.idProducto));
                const opciones = catalogo?.productos.filter((p) => !usados.has(p.idProducto) || p.idProducto === l.idProducto) ?? [];
                const prod = productoById(l.idProducto);
                return (
                  <div key={i} className="flex items-end gap-2 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Producto</label>
                      <select
                        value={l.idProducto || ''}
                        onChange={(e) => updateLinea(i, 'idProducto', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {opciones.map((p) => (
                          <option key={p.idProducto} value={p.idProducto}>
                            {p.nombre} - ${p.precioVenta.toLocaleString('es')} (stock: {p.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-slate-500 mb-1">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        max={prod?.stock ?? 1}
                        value={l.cantidad}
                        onChange={(e) => updateLinea(i, 'cantidad', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-slate-500 mb-1">Precio</label>
                      <div className="px-3 py-2 text-sm text-slate-500">${prod?.precioVenta.toLocaleString('es') ?? '-'}</div>
                    </div>
                    <div className="w-24 text-right">
                      <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                      <span className="font-medium text-sm">${prod ? (prod.precioVenta * l.cantidad).toLocaleString('es') : '-'}</span>
                    </div>
                    <button type="button" onClick={() => removeLinea(i)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Descuento (%)" type="number" min="0" max="100" step="0.01" value={descuentoPct} onChange={(e) => setDescuentoPct(e.target.value)} icon={<DollarSign size={18} />} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IVA {impuestoPct}%</label>
              <div className="px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
                ${impuestoImporte.toLocaleString('es', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-slate-800 rounded-lg text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Descuento</span>
              <span>-${descuentoImporte.toLocaleString('es', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total estimado</span>
              <span className="text-xl font-bold">${totalPreview.toLocaleString('es', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">El total final lo confirma el servidor.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Factura'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={`Factura #${viewing?.idFactura ?? ''}`} size="lg">
        {viewLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-slate-400" />
                <span className="text-slate-500">Cliente:</span>
                <span className="font-medium text-slate-800">{viewing.cliente?.nombre ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-500">Fecha:</span>
                <span className="font-medium text-slate-800">{viewing.fecha ? new Date(viewing.fecha).toLocaleString('es') : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-slate-400" />
                <span className="text-slate-500">Empleado:</span>
                <span className="font-medium text-slate-800">{viewing.empleado?.nombre ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-slate-400" />
                <span className="text-slate-500">Estado:</span>
                <Badge variant={estadoBadgeVariant(viewing.estado.id)}>{viewing.estado.descripcion}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
              <div><span className="text-slate-500">Subtotal: </span><span className="font-medium">${Number(viewing.subtotal ?? 0).toLocaleString('es')}</span></div>
              <div><span className="text-slate-500">Descuento: </span><span className="font-medium">${Number(viewing.descuento ?? 0).toLocaleString('es')}</span></div>
              <div><span className="text-slate-500">Impuesto: </span><span className="font-medium">${Number(viewing.impuesto ?? 0).toLocaleString('es')}</span></div>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg text-white flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">${Number(viewing.total ?? 0).toLocaleString('es')}</span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Detalle de productos</h4>
              <div className="space-y-2">
                {viewing.detalles.map((d) => (
                  <div key={d.idDetalle} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.nombre}</p>
                      <p className="text-xs text-slate-500">{d.cantidad} x ${Number(d.precio).toLocaleString('es')}</p>
                    </div>
                    <span className="font-medium text-sm">${Number(d.subtotal).toLocaleString('es')}</span>
                  </div>
                ))}
                {viewing.detalles.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin detalles</p>
                )}
              </div>
            </div>

            {viewing.estadosPermitidos.length > 0 && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                {viewing.estadosPermitidos.includes(2) && (
                  <Button type="button" variant="success" disabled={estadoActionLoading} onClick={() => cambiarEstado(2)}>
                    Marcar pagada
                  </Button>
                )}
                {viewing.estadosPermitidos.includes(4) && (
                  <Button type="button" variant="secondary" disabled={estadoActionLoading} onClick={() => cambiarEstado(4)}>
                    Marcar vencida
                  </Button>
                )}
                {viewing.estadosPermitidos.includes(3) && (
                  <Button type="button" variant="danger" disabled={estadoActionLoading} onClick={() => setAnulando(true)}>
                    Anular
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={anulando}
        title="Anular factura"
        message="Se devolverá el stock de los productos. Esta acción no se puede deshacer."
        confirmLabel="Anular"
        variant="danger"
        loading={anulandoLoading}
        onConfirm={confirmAnular}
        onClose={() => setAnulando(false)}
      />
    </div>
  );
}