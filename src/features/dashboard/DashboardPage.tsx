import { getErrorMessage as errMsg } from '@/shared/api/httpClient';
import { showToast } from '@/components/ui/Toast';
import { useEffect, useState } from 'react';
import { Users, Package, FileText, UserCog, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import * as dashboardApi from './dashboardApi';
import type { DashboardData } from './types';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setData(await dashboardApi.getDashboard());
      } catch (e) {
        showToast(errMsg(e), 'error');
        setData(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    data?.clientes && { label: 'Clientes', value: data.clientes.total, icon: Users, color: 'bg-sky-500', bg: 'bg-sky-50' },
    data?.productos && { label: 'Productos', value: data.productos.total, icon: Package, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
    data?.facturas && { label: 'Facturas', value: data.facturas.total, icon: FileText, color: 'bg-amber-500', bg: 'bg-amber-50' },
    data?.empleados && { label: 'Empleados', value: data.empleados.total, icon: UserCog, color: 'bg-violet-500', bg: 'bg-violet-50' },
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Resumen General</h3>
        <p className="text-sm text-slate-500 mt-1">Vista general del estado de tu empresa</p>
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
                  </div>
                  <div className={'flex items-center justify-center w-12 h-12 ' + card.bg + ' rounded-xl'}>
                    <Icon size={24} className={card.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(data?.facturas || data?.productos) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data?.facturas && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">Ingresos cobrados</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                ${data.facturas.ingresosCobrados.toLocaleString('es', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-600">
                <TrendingUp size={14} />
                <span>Facturas pagadas</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Por cobrar: ${data.facturas.porCobrar.toLocaleString('es', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {data?.facturas && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg">
                  <FileText size={20} className="text-amber-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">Facturas Pendientes</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">{data.facturas.pendientes}</p>
              <p className="text-sm text-slate-500 mt-2">de {data.facturas.total} facturas</p>
              <p className="text-sm text-slate-500 mt-1">Vencidas: {data.facturas.vencidas}</p>
            </div>
          )}

          {data?.productos && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">Stock Bajo</h4>
              </div>
              <p className="text-3xl font-bold text-slate-800">{data.productos.stockBajo}</p>
              <p className="text-sm text-slate-500 mt-2">productos con menos de {data.productos.umbralStockBajo} unidades</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <h4 className="text-lg font-semibold">Bienvenido al Sistema de Facturación</h4>
        <p className="text-sm text-slate-300 mt-1">
          Usa el menú lateral para navegar entre los diferentes módulos. Desde aquí puedes gestionar
          clientes, productos, categorías, facturas, informes, empleados y roles.
        </p>
      </div>
    </div>
  );
}