export type EstadoRef = {
  id: number;
  descripcion: string;
};

export type ProductoCatalogo = {
  idProducto: number;
  nombre: string;
  codigo: string;
  precioVenta: number;
  stock: number;
  fotoUrl: string | null;
};

export type Catalogo = {
  impuestoPorcentaje: number;
  estados: EstadoRef[];
  productos: ProductoCatalogo[];
};

export type FacturaListItem = {
  idFactura: number;
  fecha: string;
  cliente: { id: number; nombre: string };
  empleado: { id: number; nombre: string };
  estado: EstadoRef;
  total: number;
  estadosPermitidos: number[];
};

export type DetalleLinea = {
  idDetalle: number;
  idProducto: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export type FacturaDetalle = FacturaListItem & {
  subtotal: number;
  descuento: number;
  impuesto: number;
  detalles: DetalleLinea[];
};