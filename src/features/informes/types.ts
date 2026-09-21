export type TipoInforme = {
  id: string;
  nombre: string;
  requiereFechas: boolean;
};

export type MetricaItem = {
  label: string;
  value: number;
  format: 'moneda' | 'entero';
};

export type SeccionMetricas = {
  kind: 'metricas';
  titulo: string;
  items: MetricaItem[];
};

export type Columna = {
  key: string;
  label: string;
  format: 'moneda' | 'entero' | 'texto' | 'fecha';
};

export type SeccionTabla = {
  kind: 'tabla';
  titulo: string;
  columnas: Columna[];
  filas: Record<string, string | number>[];
};

export type Seccion = SeccionMetricas | SeccionTabla;

export type Informe = {
  tipo: string;
  titulo: string;
  desde: string | null;
  hasta: string | null;
  generadoEn: string;
  secciones: Seccion[];
};