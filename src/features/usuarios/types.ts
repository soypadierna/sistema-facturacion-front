export type Usuario = {
  idEmpleado: number;
  nombre: string;
  usuario: string | null;
};

export type CredencialesResult = {
  idEmpleado: number;
  usuario: string;
  creado: boolean;
};