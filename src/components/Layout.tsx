import { type ReactNode, useState } from 'react';
import { useAuth, type Permission } from '@/context/AuthContext';
import { useApp, type View } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { HelpModal } from '@/components/HelpModal';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard, Users, Package, FolderTree, FileText,
  BarChart3, UserCog, Shield, LogOut, HelpCircle, Building2,
  Menu, UserPlus,
} from 'lucide-react';

const allNavItems: { id: View; label: string; icon: typeof LayoutDashboard; perm: Permission }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard' },
  { id: 'clientes', label: 'Clientes', icon: Users, perm: 'clientes' },
  { id: 'productos', label: 'Productos', icon: Package, perm: 'productos' },
  { id: 'categorias', label: 'Categorías', icon: FolderTree, perm: 'categorias' },
  { id: 'facturas', label: 'Facturas', icon: FileText, perm: 'facturas' },
  { id: 'informes', label: 'Informes', icon: BarChart3, perm: 'informes' },
  { id: 'empleados', label: 'Empleados', icon: UserCog, perm: 'empleados' },
  { id: 'roles', label: 'Roles de Empleado', icon: Shield, perm: 'roles' },
  { id: 'crear-admin', label: 'Crear Usuario', icon: UserPlus, perm: 'crear-admin' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, user, hasPermission } = useAuth();
  const { view, setView, setHelpOpen } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = allNavItems.filter((item) => hasPermission(item.perm));
  const currentLabel = navItems.find((n) => n.id === view)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">DBFACTURAS</h1>
            <p className="text-xs text-slate-400">Sistema de Facturación</p>
          </div>
        </div>

        {user && (
          <div className="px-5 py-3 border-b border-slate-700/50">
            <p className="text-sm font-medium text-white truncate">{user.nombreEmpleado}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.isAdmin ? 'green' : 'blue'}>
                {user.rolDescripcion ?? 'Sin rol'}
              </Badge>
              {user.isAdmin && <Badge variant="green">Admin</Badge>}
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
          <button
            onClick={() => setHelpOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <HelpCircle size={18} className="text-slate-400" />
            Ayuda
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">{currentLabel}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
            <HelpCircle size={16} /> Ayuda
          </Button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      <HelpModal />
    </div>
  );
}
