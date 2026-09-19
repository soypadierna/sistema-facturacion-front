import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
  },
});

export type CategoriaProd = {
  idcategoria: number;
  strdescripcion: string | null;
  dtmfechamodifica: string | null;
  strusuariomodifico: string | null;
};

export type Rol = {
  idrolempleado: number;
  strdescripcion: string | null;
};

export type EstadoFactura = {
  idestadofactura: number;
  strdescripcion: string | null;
};

export type Cliente = {
  idcliente: number;
  strnombre: string | null;
  numdocumento: number | null;
  strdireccion: string | null;
  strtelefono: string | null;
  stremail: string | null;
  dtmfechamodifica: string | null;
  strusuariomodifico: string | null;
};

export type Empleado = {
  idempleado: number;
  strnombre: string;
  numdocumento: number;
  strdireccion: string | null;
  strtelefono: string | null;
  stremail: string | null;
  idrolempleado: number | null;
  dtmingreso: string | null;
  dtmretiro: string | null;
  strdatosadicionales: string | null;
  dtmfechamodifica: string | null;
  strusuariomodifico: string | null;
  rol?: Rol | null;
};

export type Seguridad = {
  idseguridad: number;
  idempleado: number;
  strusuario: string | null;
  strclave: string | null;
  dtmfechamodifica: string | null;
  strusuariomodifico: string | null;
  empleado?: Empleado | null;
};

export type Producto = {
  idproducto: number;
  strnombre: string;
  strcodigo: string;
  numpreciocompra: number;
  numprecioventa: number;
  idcategoria: number;
  strdetalle: string | null;
  strfoto: string | null;
  numstock: number | null;
  dtmfechamodifica: string;
  strusuariomodifico: string;
  categoria?: CategoriaProd | null;
};

export type Factura = {
  idfactura: number;
  dtmfecha: string | null;
  idcliente: number;
  idempleado: number;
  numdescuento: number | null;
  numimpuesto: number | null;
  numvalortotal: number | null;
  idestado: number | null;
  dtmfechamodifica: string | null;
  strusuariomodifico: string | null;
  cliente?: Cliente | null;
  empleado?: Empleado | null;
  estado?: EstadoFactura | null;
  detalles?: DetalleFactura[];
};

export type DetalleFactura = {
  iddetalle: number;
  idfactura: number;
  numcantidad: number;
  idproducto: number;
  numprecio: number;
  producto?: Producto | null;
};

export type Informe = {
  idinforme: number;
  strtitulo: string;
  strtipo: string;
  strdescripcion: string | null;
  dtmfechainicio: string | null;
  dtmfechafin: string | null;
  dtmfechacreacion: string;
};
