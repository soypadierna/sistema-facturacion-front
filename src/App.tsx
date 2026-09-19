import { AuthProvider, useAuth, type Permission } from '@/context/AuthContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoginPage } from '@/pages/LoginPage';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ProductosPage } from '@/pages/ProductosPage';
import { CategoriasPage } from '@/pages/CategoriasPage';
import { FacturasPage } from '@/pages/FacturasPage';
import { InformesPage } from '@/pages/InformesPage';
import { EmpleadosPage } from '@/features/empleados/EmpleadosPage';
import { RolesPage } from '@/features/roles/RolesPage';
import { CrearAdminPage } from '@/pages/CrearAdminPage';
import { ToastContainer } from '@/components/ui/Toast';


const VIEW_PERMISSIONS: Record<string, Permission> = {
  dashboard: 'dashboard',
  clientes: 'clientes',
  productos: 'productos',
  categorias: 'categorias',
  facturas: 'facturas',
  informes: 'informes',
  empleados: 'empleados',
  roles: 'roles',
  'crear-admin': 'crear-admin',
};

function AppContent() {
  const { user, loading, hasPermission } = useAuth();
  const { view } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    clientes: <ClientesPage />,
    productos: <ProductosPage />,
    categorias: <CategoriasPage />,
    facturas: <FacturasPage />,
    informes: <InformesPage />,
    empleados: <EmpleadosPage />,
    roles: <RolesPage />,
    'crear-admin': <CrearAdminPage />,
  };

  const requiredPerm = VIEW_PERMISSIONS[view];
  const canAccess = !requiredPerm || hasPermission(requiredPerm);

  return <Layout>{canAccess ? (pages[view] ?? <DashboardPage />) : <DashboardPage />}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
        <ToastContainer />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;