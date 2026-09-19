import { apiFetch } from '@/shared/api/httpClient';
import type { Producto } from './types';

export type ProductoPayload = {
  nombre: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
  idCategoria: number;
  detalle: string | null;
  stock: number;
};

export function listProductos() {
  return apiFetch<Producto[]>('/productos');
}
export function createProducto(payload: ProductoPayload) {
  return apiFetch<Producto>('/productos', { method: 'POST', body: payload });
}
export function updateProducto(id: number, payload: ProductoPayload) {
  return apiFetch<Producto>(`/productos/${id}`, { method: 'PUT', body: payload });
}
export function deleteProducto(id: number) {
  return apiFetch<void>(`/productos/${id}`, { method: 'DELETE' });
}
export function uploadFoto(id: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<Producto>(`/productos/${id}/foto`, { method: 'POST', body: formData });
}
export function deleteFoto(id: number) {
  return apiFetch<void>(`/productos/${id}/foto`, { method: 'DELETE' });
}