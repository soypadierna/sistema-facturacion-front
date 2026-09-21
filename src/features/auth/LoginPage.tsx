import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Lock, User, LogIn } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(usuario, clave);
      if (result.error) setError(result.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 shadow-lg">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Sistema de Facturación</h1>
            <p className="text-sm text-slate-500 mt-1">Inicia sesión para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <Input
              label="Usuario"
              placeholder="Tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              icon={<User size={18} />}
              autoComplete="username"
              maxLength={50}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              icon={<Lock size={18} />}
              autoComplete="current-password"
              maxLength={50}
              required
            />

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <><LogIn size={18} /> Iniciar Sesión</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Sistema de Facturación
        </p>
      </div>
    </div>
  );
}