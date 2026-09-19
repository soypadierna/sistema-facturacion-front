export type Rol = {
  id: number;
  descripcion: string;
};

export type Empleado = {
  idEmpleado: number;
  nombre: string;
  documento: number;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ingreso: string | null;
  retiro: string | null;
  retirado: boolean;
  datosAdicionales: string | null;
  rol: Rol | null;
};