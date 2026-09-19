import { apiFetch } from '@/shared/api/httpClient';
import type { Rol } from './types';

export function listRoles() {
  return apiFetch<Rol[]>('/roles');
}
export function createRol(descripcion: string) {
  return apiFetch<Rol>('/roles', { method: 'POST', body: { descripcion } });
}
export function updateRol(id: number, descripcion: string) {
  return apiFetch<Rol>(`/roles/${id}`, { method: 'PUT', body: { descripcion } });
}
export function deleteRol(id: number) {
  return apiFetch<void>(`/roles/${id}`, { method: 'DELETE' });
}