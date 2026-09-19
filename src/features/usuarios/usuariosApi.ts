import { apiFetch } from '@/shared/api/httpClient';
import type { Usuario, CredencialesResult } from './types';

export function listUsuarios() {
  return apiFetch<Usuario[]>('/usuarios');
}

export function setCredenciales(idEmpleado: number, usuario: string, clave: string) {
  return apiFetch<CredencialesResult>(`/usuarios/${idEmpleado}/credenciales`, {
    method: 'PUT',
    body: { usuario, clave },
  });
}