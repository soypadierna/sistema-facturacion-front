import { apiFetch } from '@/shared/api/httpClient';
import type { Cliente } from './types';

export type ClientePayload = {
  nombre: string;
  documento: number | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
};

export function listClientes() {
  return apiFetch<Cliente[]>('/clientes');
}
export function createCliente(payload: ClientePayload) {
  return apiFetch<Cliente>('/clientes', { method: 'POST', body: payload });
}
export function updateCliente(id: number, payload: ClientePayload) {
  return apiFetch<Cliente>(`/clientes/${id}`, { method: 'PUT', body: payload });
}
export function deleteCliente(id: number) {
  return apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' });
}