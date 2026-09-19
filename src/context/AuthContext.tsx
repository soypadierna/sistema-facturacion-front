import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setUnauthorizedHandler, ApiError } from '@/shared/api/httpClient';
import { getToken, setToken, clearToken } from '@/features/auth/tokenStorage';
import * as authApi from '@/features/auth/authApi';

export type Permission =
  | 'dashboard'
  | 'clientes'
  | 'productos'
  | 'categorias'
  | 'facturas'
  | 'informes'
  | 'empleados'
  | 'roles'
  | 'crear-admin';

type AuthUser = {
  strusuario: string;
  idempleado: number;
  nombreEmpleado: string;
  idrolempleado: number | null;
  rolDescripcion: string | null;
  isAdmin: boolean;
  permissions: Permission[];
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (usuario: string, clave: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  hasPermission: (perm: Permission) => boolean;
};

const ADMIN_ROLE_ID = 1;

const ROLE_PERMISSIONS: Record<number, Permission[]> = {
  1: ['dashboard', 'clientes', 'productos', 'categorias', 'facturas', 'informes', 'empleados', 'roles', 'crear-admin'],
  2: ['dashboard', 'clientes', 'facturas', 'informes'],
  3: ['dashboard', 'productos'],
  4: ['dashboard', 'clientes', 'productos', 'categorias', 'facturas', 'informes'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USUARIO_KEY = 'dbfacturas_usuario';

function buildAuthUser(strusuario: string, apiUser: { idEmpleado: number; nombre: string; rol: { id: number; descripcion: string } }): AuthUser {
  const rolId = apiUser.rol?.id ?? null;
  const isAdmin = rolId === ADMIN_ROLE_ID;
  const permissions: Permission[] = rolId != null ? (ROLE_PERMISSIONS[rolId] ?? ['dashboard']) : ['dashboard'];
  return {
    strusuario,
    idempleado: apiUser.idEmpleado,
    nombreEmpleado: apiUser.nombre,
    idrolempleado: rolId,
    rolDescripcion: apiUser.rol?.descripcion ?? null,
    isAdmin,
    permissions,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  const signOut = () => {
    clearToken();
    localStorage.removeItem(USUARIO_KEY);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(signOut);

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((apiUser) => {
        const strusuario = localStorage.getItem(USUARIO_KEY) ?? '';
        setUser(buildAuthUser(strusuario, apiUser));
      })
      .catch(() => {
        clearToken();
        localStorage.removeItem(USUARIO_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (usuario: string, clave: string) => {
    try {
      const res = await authApi.login(usuario, clave);
      setToken(res.accessToken);
      localStorage.setItem(USUARIO_KEY, usuario);
      setUser(buildAuthUser(usuario, res.user));
      return { error: null };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Error de conexión';
      return { error: message };
    }
  };

  const hasPermission = (perm: Permission) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}