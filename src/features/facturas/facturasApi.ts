import { apiFetch } from '@/shared/api/httpClient';
import type { Catalogo, FacturaListItem, FacturaDetalle } from './types';

export type FacturaCreatePayload = {
  idCliente: number;
  idEstado: number;
  descuentoPorcentaje: number;
  detalles: { idProducto: number; cantidad: number }[];
};

export function getCatalogo() {
  return apiFetch<Catalogo>('/facturas/catalogo');
}
export function listFacturas(limit = 200) {
  return apiFetch<FacturaListItem[]>(`/facturas?limit=${limit}`);
}
export function getFactura(id: number) {
  return apiFetch<FacturaDetalle>(`/facturas/${id}`);
}
export function createFactura(payload: FacturaCreatePayload) {
  return apiFetch<FacturaDetalle>('/facturas', { method: 'POST', body: payload });
}
export function updateEstado(id: number, idEstado: number) {
  return apiFetch<FacturaDetalle>(`/facturas/${id}/estado`, { method: 'PATCH', body: { idEstado } });
}