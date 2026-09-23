export type ApiUser = {
  idEmpleado: number;
  nombre: string;
  rol: { id: number; descripcion: string };
  permisos: string[];
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
};