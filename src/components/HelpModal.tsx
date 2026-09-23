import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Building2, Mail, Phone, Globe, Info, Code, Shield } from 'lucide-react';

export function HelpModal() {
  const { helpOpen, setHelpOpen } = useApp();

  return (
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Acerca de" size="md">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <Building2 size={40} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Sistema de Facturación CMD</h3>
          <p className="text-sm text-slate-500 mt-1">Versión 1.0.0</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <Info size={20} className="text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">Descripción</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Aplicación de escritorio para la gestión integral de empresas. Permite administrar
                clientes, productos, categorías, facturas, informes, empleados y roles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <Shield size={20} className="text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">Seguridad</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Sistema de autenticación con tabla de usuarios (tblseguridad). Todos los datos están protegidos con
                Row Level Security (RLS) a nivel de base de datos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <Code size={20} className="text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">Tecnologías</p>
              <p className="text-sm text-slate-500 mt-0.5">
                React + TypeScript + Tailwind CSS + Supabase
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Mail size={16} /> soporte@gestion.com
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone size={16} /> +1 (809) 000-0000
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Globe size={16} /> www.gestion.com
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          © 2026 Sistema de Facturación CMD. Todos los derechos reservados.
        </p>
      </div>
    </Modal>
  );
}
