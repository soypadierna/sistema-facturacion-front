export type DashboardData = {
  clientes: { total: number } | null;
  productos: { total: number; stockBajo: number; umbralStockBajo: number } | null;
  empleados: { total: number } | null;
  facturas: {
    total: number;
    pendientes: number;
    vencidas: number;
    ingresosCobrados: number;
    porCobrar: number;
  } | null;
};