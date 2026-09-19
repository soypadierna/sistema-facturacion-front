import { useState, useEffect } from 'react';
import { ApiError } from '@/shared/api/httpClient';
import * as usuariosApi from './usuariosApi';
import type { Usuario } from './types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { UserPlus, User, Lock, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const USUARIO_REGEX = /^[A-Za-z0-9._-]{3,50}$/;

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Error de conexión';
}

export function CrearAdminPage() {
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [idempleado, setIdempleado] = useState('');
  const [strusuario, setStrusuario] = useState('');
  const [strclave, setStrclave] = useState('');
  const [showClave, setShowClave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [usuarioError, setUsuarioError] = useState<string | null>(null);
  const [claveError, setClaveError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setEmpleados(await usuariosApi.listUsuarios());
    } catch (e) {
      showToast(errMsg(e), 'error');
      setEmpleados([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const selectedEmpleado = empleados.find((e) => String(e.idEmpleado) === idempleado);

  function handleSelectEmpleado(id: string) {
    setIdempleado(id);
    const emp = empleados.find((e) => String(e.idEmpleado) === id);
    if (emp?.usuario) {
      setStrusuario(emp.usuario);
    } else {
      setStrusuario('');
    }
  }

  function validate(): boolean {
    let ok = true;
    if (!USUARIO_REGEX.test(strusuario)) {
      setUsuarioError('Usuario inválido: solo letras, números, puntos, guiones y guion bajo (3-50 caracteres)');
      ok = false;
    } else {
      setUsuarioError(null);
    }
    if (strclave.length < 6 || strclave.length > 50) {
      setClaveError('La contraseña debe tener entre 6 y 50 caracteres');
      ok = false;
    } else {
      setClaveError(null);
    }
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    if (!idempleado) { showToast('Selecciona un empleado', 'error'); return; }
    if (!validate()) return;

    setSaving(true);
    try {
      const result = await usuariosApi.setCredenciales(parseInt(idempleado), strusuario, strclave);
      setSuccessMsg(result.creado ? 'Usuario creado' : 'Credenciales actualizadas');
      showToast(result.creado ? 'Usuario creado exitosamente' : 'Credenciales actualizadas');
      setStrusuario('');
      setStrclave('');
      setIdempleado('');
      load();
    } catch (e) {
      showToast(errMsg(e), 'error');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Crear Usuario del Sistema</h3>
              <p className="text-sm text-slate-300">Asigna credenciales de acceso a un empleado</p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mx-6 mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-700">{successMsg}</p>
              <p className="text-xs text-emerald-600 mt-0.5">El usuario ya puede iniciar sesión con sus credenciales.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : (
            <Select label="Empleado *" value={idempleado} onChange={(e) => handleSelectEmpleado(e.target.value)} required>
              <option value="">Selecciona un empleado</option>
              {empleados.map((e) => (
                <option key={e.idEmpleado} value={e.idEmpleado}>
                  {e.usuario ? `${e.nombre} (usuario: ${e.usuario})` : e.nombre}
                </option>
              ))}
            </Select>
          )}

          {selectedEmpleado?.usuario && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Este empleado ya tiene usuario; se reemplazarán sus credenciales.
              </p>
            </div>
          )}

          <div>
            <Input
              label="Usuario *"
              placeholder="ej: jperez"
              value={strusuario}
              onChange={(e) => setStrusuario(e.target.value)}
              icon={<User size={18} />}
              maxLength={50}
              autoComplete="off"
              required
            />
            {usuarioError && <p className="text-xs text-red-600 mt-1">{usuarioError}</p>}
          </div>

          <div>
            <div className="relative">
              <Input
                label="Contraseña *"
                type={showClave ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={strclave}
                onChange={(e) => setStrclave(e.target.value)}
                icon={<Lock size={18} />}
                maxLength={50}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowClave(!showClave)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showClave ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {claveError && <p className="text-xs text-red-600 mt-1">{claveError}</p>}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              El usuario creado tendrá acceso al sistema con las credenciales asignadas.
              Asegúrate de recordar el usuario y contraseña.
            </p>
          </div>

          <Button type="submit" size="lg" disabled={saving || loading} className="w-full">
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              <><UserPlus size={18} /> Guardar Credenciales</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}