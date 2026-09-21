import { apiFetch } from '@/shared/api/httpClient';
import type { TipoInforme, Informe } from './types';

export function listTipos() {
  return apiFetch<TipoInforme[]>('/informes/tipos');
}

export function getInforme(tipo: string, desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const qs = params.toString();
  return apiFetch<Informe>(`/informes/${tipo}${qs ? `?${qs}` : ''}`);
}