export type Cliente = {
  idCliente: number;
  nombre: string;
  documento: number | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  fechaModificacion: string | null;
  modificadoPor: string | null;
};