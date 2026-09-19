import { apiFetch } from '@/shared/api/httpClient';
import type { Empleado } from './types';

export type EmpleadoPayload = {
  nombre: string;
  documento: number;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  idRol: number | null;
  ingreso: string | null;
  datosAdicionales: string | null;
};

export function listEmpleados(incluirRetirados: boolean) {
  return apiFetch<Empleado[]>(`/empleados?incluirRetirados=${incluirRetirados}`);
}
export function createEmpleado(payload: EmpleadoPayload) {
  return apiFetch<Empleado>('/empleados', { method: 'POST', body: payload });
}
export function updateEmpleado(id: number, payload: EmpleadoPayload) {
  return apiFetch<Empleado>(`/empleados/${id}`, { method: 'PUT', body: payload });
}
export function retireEmpleado(id: number) {
  return apiFetch<void>(`/empleados/${id}`, { method: 'DELETE' });
}
export function reactivarEmpleado(id: number) {
  return apiFetch<Empleado>(`/empleados/${id}/reactivar`, { method: 'PATCH' });
}