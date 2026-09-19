export type Categoria = {
  id: number;
  descripcion: string;
};

export type Producto = {
  idProducto: number;
  nombre: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
  categoria: Categoria;
  detalle: string | null;
  fotoUrl: string | null;
  stock: number;
  fechaModificacion: string | null;
  modificadoPor: string | null;
};