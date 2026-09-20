import { apiFetch } from '@/shared/api/httpClient';
import type { DashboardData } from './types';

export function getDashboard() {
  return apiFetch<DashboardData>('/dashboard');
}