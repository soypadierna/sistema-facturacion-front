import { apiFetch } from '@/shared/api/httpClient';
import type { Categoria } from './types';

export function listCategorias() {
  return apiFetch<Categoria[]>('/categorias');
}
export function createCategoria(descripcion: string) {
  return apiFetch<Categoria>('/categorias', { method: 'POST', body: { descripcion } });
}
export function updateCategoria(id: number, descripcion: string) {
  return apiFetch<Categoria>(`/categorias/${id}`, { method: 'PUT', body: { descripcion } });
}
export function deleteCategoria(id: number) {
  return apiFetch<void>(`/categorias/${id}`, { method: 'DELETE' });
}