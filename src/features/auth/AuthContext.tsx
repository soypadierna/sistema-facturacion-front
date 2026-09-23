import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { setUnauthorizedHandler, getErrorMessage, ApiError } from '@/shared/api/httpClient';
import { getToken, setToken, clearToken } from '@/shared/api/tokenStorage';
import { showToast } from '@/components/ui/Toast';
import * as authApi from './authApi';
import type { ApiUser } from './types';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USUARIO_KEY = 'dbfacturas_usuario';

function buildAuthUser(strusuario: string, apiUser: ApiUser): AuthUser {
  const rolId = apiUser.rol?.id ?? null;
  return {
    strusuario,
    idempleado: apiUser.idEmpleado,
    nombreEmpleado: apiUser.nombre,
    idrolempleado: rolId,
    rolDescripcion: apiUser.rol?.descripcion ?? null,
    isAdmin: rolId === 1,
    permissions: (apiUser.permisos ?? []) as Permission[],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!getToken());
  const userRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const signOut = () => {
    clearToken();
    localStorage.removeItem(USUARIO_KEY);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      const hadUser = !!userRef.current;
      clearToken();
      localStorage.removeItem(USUARIO_KEY);
      setUser(null);
      if (hadUser) {
        showToast('Tu sesión expiró. Inicia sesión de nuevo.', 'error');
      }
    };
    setUnauthorizedHandler(handleUnauthorized);

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
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          localStorage.removeItem(USUARIO_KEY);
          setUser(null);
        } else {
          setUser(null);
          showToast(getErrorMessage(err), 'error');
        }
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
      return { error: getErrorMessage(e) };
    }
  };

  const hasPermission = (perm: Permission) => {
    if (!user) return false;
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