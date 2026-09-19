import { createContext, useContext, useState, type ReactNode } from 'react';

export type View =
  | 'dashboard'
  | 'clientes'
  | 'productos'
  | 'categorias'
  | 'facturas'
  | 'informes'
  | 'empleados'
  | 'roles'
  | 'crear-admin';

type AppContextType = {
  view: View;
  setView: (v: View) => void;
  helpOpen: boolean;
  setHelpOpen: (b: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('dashboard');
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <AppContext.Provider value={{ view, setView, helpOpen, setHelpOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
