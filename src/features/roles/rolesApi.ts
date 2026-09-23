import { apiFetch } from '@/shared/api/httpClient';
import type { Rol } from './types';

export function listRoles() {
  return apiFetch<Rol[]>('/roles');
}
export function listModulos() {
  return apiFetch<string[]>('/roles/modulos');
}
export function createRol(descripcion: string, permisos: string[]) {
  return apiFetch<Rol>('/roles', { method: 'POST', body: { descripcion, permisos } });
}
export function updateRol(id: number, descripcion: string, permisos: string[]) {
  return apiFetch<Rol>(`/roles/${id}`, { method: 'PUT', body: { descripcion, permisos } });
}
export function deleteRol(id: number) {
  return apiFetch<void>(`/roles/${id}`, { method: 'DELETE' });
}