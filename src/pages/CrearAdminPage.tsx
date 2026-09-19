import { useState, useEffect } from 'react';
import { supabase, type Empleado } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { UserPlus, User, Lock, Shield, CheckCircle, IdCard } from 'lucide-react';

export function CrearAdminPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [idempleado, setIdempleado] = useState('');
  const [strusuario, setStrusuario] = useState('');
  const [strclave, setStrclave] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('tblempleado').select('*').order('strnombre');
      setEmpleados(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idempleado) { showToast('Selecciona un empleado', 'error'); return; }
    if (!strusuario) { showToast('Ingresa un usuario', 'error'); return; }
    if (!strclave) { showToast('Ingresa una contraseña', 'error'); return; }
    setSaving(true);
    const { data: existing } = await supabase
      .from('tblseguridad')
      .select('idseguridad')
      .eq('idempleado', parseInt(idempleado))
      .maybeSingle();
    if (existing) {
      const { error } = await supabase.from('tblseguridad').update({
        strusuario, strclave,
        dtmfechamodifica: new Date().toISOString(),
        strusuariomodifico: 'admin',
      }).eq('idempleado', parseInt(idempleado));
      if (error) showToast('Error al actualizar', 'error');
      else { showToast('Usuario actualizado'); setSuccess(true); }
    } else {
      const { error } = await supabase.from('tblseguridad').insert({
        idempleado: parseInt(idempleado),
        strusuario, strclave,
        dtmfechamodifica: new Date().toISOString(),
        strusuariomodifico: 'admin',
      });
      if (error) showToast('Error al crear usuario', 'error');
      else { showToast('Usuario creado exitosamente'); setSuccess(true); }
    }
    setSaving(false);
    setStrusuario('');
    setStrclave('');
    setIdempleado('');
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

        {success && (
          <div className="mx-6 mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Usuario creado</p>
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
            <Select label="Empleado *" value={idempleado} onChange={(e) => setIdempleado(e.target.value)} required>
              <option value="">Selecciona un empleado</option>
              {empleados.map((e) => <option key={e.idempleado} value={e.idempleado}>{e.strnombre}</option>)}
            </Select>
          )}
          <Input
            label="Usuario *"
            placeholder="ej: admin"
            value={strusuario}
            onChange={(e) => setStrusuario(e.target.value)}
            icon={<User size={18} />}
            required
          />
          <Input
            label="Contraseña *"
            placeholder="ej: 1234"
            value={strclave}
            onChange={(e) => setStrclave(e.target.value)}
            icon={<Lock size={18} />}
            required
          />

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
                Creando...
              </span>
            ) : (
              <><UserPlus size={18} /> Crear Usuario</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
