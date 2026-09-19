import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Package, FileText, UserCog, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

type Stats = {
  totalClientes: number;
  totalProductos: number;
  totalFacturas: number;
  totalEmpleados: number;
  ingresosTotales: number;
  facturasPendientes: number;
  stockBajo: number;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [clientes, productos, facturas, empleados] = await Promise.all([
        supabase.from('tblclientes').select('*', { count: 'exact', head: true }),
        supabase.from('tblproducto').select('*', { count: 'exact', head: true }),
        supabase.from('tblfactura').select('numvalortotal, idestado'),
        supabase.from('tblempleado').select('*', { count: 'exact', head: true }),
      ]);

      const ingresos = (facturas.data ?? []).reduce((sum, f) => sum + Number(f.numvalortotal ?? 0), 0);
      const pendientes = (facturas.data ?? []).filter((f) => f.idestado === 1).length;

      const { count: stockBajo } = await supabase
        .from('tblproducto')
        .select('*', { count: 'exact', head: true })
        .lt('numstock', 10);

      setStats({
        totalClientes: clientes.count ?? 0,
        totalProductos: productos.count ?? 0,
        totalFacturas: facturas.data?.length ?? 0,
        totalEmpleados: empleados.count ?? 0,
        ingresosTotales: ingresos,
        facturasPendientes: pendientes,
        stockBajo: stockBajo ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Clientes', value: stats.totalClientes, icon: Users, color: 'bg-sky-500', bg: 'bg-sky-50' },
    { label: 'Productos', value: stats.totalProductos, icon: Package, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Facturas', value: stats.totalFacturas, icon: FileText, color: 'bg-amber-500', bg: 'bg-amber-50' },
    { label: 'Empleados', value: stats.totalEmpleados, icon: UserCog, color: 'bg-violet-500', bg: 'bg-violet-50' },
  ];

  const formatoMoneda = stats.ingresosTotales.toLocaleString('es', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Resumen General</h3>
        <p className="text-sm text-slate-500 mt-1">Vista general del estado de tu empresa</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">Ingresos Totales</h4>
          </div>
          <p className="text-3xl font-bold text-slate-800">${formatoMoneda}</p>
          <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-600">
            <TrendingUp size={14} />
            <span>Facturación acumulada</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-lg">
              <FileText size={20} className="text-amber-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">Facturas Pendientes</h4>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.facturasPendientes}</p>
          <p className="text-sm text-slate-500 mt-2">de {stats.totalFacturas} facturas totales</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">Stock Bajo</h4>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.stockBajo}</p>
          <p className="text-sm text-slate-500 mt-2">productos con menos de 10 unidades</p>
        </div>
      </div>

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
