# Sistema de Facturación — Frontend

Aplicación React + TypeScript + Vite. Consume la API de facturación vía HTTP; algunas pantallas restantes (no migradas aún) usan Supabase directamente.

## Requisitos técnicos

- Node.js 18 o superior
- npm
- La API del sistema corriendo (ver README del backend)

## Arquitectura de carpetas

```text
sistema-facturacion-front/
├── src/
│   ├── App.tsx # Enrutamiento por vista + permisos
│   ├── context/
│   │   ├── AuthContext.tsx # Sesión, token, permisos por rol
│   │   └── AppContext.tsx # Navegación entre vistas
│   ├── components/
│   │   └── ui/ # Componentes reutilizables (Button, Modal, Table, ConfirmDialog, Toast, etc.)
│   ├── shared/
│   │   ├── api/httpClient.ts # Cliente HTTP central (apiFetch, manejo de 401, ApiError)
│   │   └── utils/date.ts # Utilidades de formato de fecha
│   ├── features/ # Un folder por dominio, conectado a la API
│   │   ├── auth/ # Login, token, tipos
│   │   ├── empleados/ # CRUD de empleados
│   │   ├── roles/ # CRUD de roles
│   │   ├── usuarios/ # Asignación de credenciales
│   │   ├── categorias/ # CRUD de categorías
│   │   ├── productos/ # CRUD de productos + fotos
│   │   ├── clientes/ # CRUD de clientes
│   │   ├── facturas/ # Facturación
│   │   └── dashboard/ # Indicadores
│   │
│   │   # cada feature contiene:
│   │   # <Nombre>Page.tsx -> vista (UI)
│   │   # <nombre>Api.ts -> llamadas HTTP a la API
│   │   # types.ts -> tipos TypeScript (camelCase, igual al contrato de la API)
│   ├── pages/ # Vistas aún no migradas a features (usan Supabase directo)
│   └── lib/supabase.ts # Cliente de Supabase (uso restante en pages/)
├── .env / .env.example
└── package.json
```

## Variables de entorno

Copia `.env.example` a `.env`:

```text
VITE_API_URL=http://localhost:8000
```


Debe apuntar a la URL donde corre la API (local o desplegada).

## Pasos para levantar el proyecto localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/soypadierna/sistema-facturacion-front.git
cd sistema-facturacion-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
copy .env.example .env       # Windows
cp .env.example .env         # Linux/Mac

# 4. Ejecutar en modo desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` (puerto por defecto de Vite).

**Importante**: la API debe tener `CORS_ORIGINS` configurado con esta URL (`http://localhost:5173`) para que las peticiones no sean bloqueadas.

## Notas de arquitectura

- La sesión se persiste como un JWT en `localStorage` (`dbfacturas_token`); al recargar, se valida contra `GET /auth/me`.
- Los permisos por rol se calculan en el frontend (`ROLE_PERMISSIONS` en `AuthContext.tsx`) reflejando lo que el backend también valida — el backend es la fuente de verdad real.
- Todas las llamadas HTTP pasan por `apiFetch` (`shared/api/httpClient.ts`), que agrega el token automáticamente y cierra sesión ante un 401.
- Los formularios de creación/edición usan modales; las acciones destructivas (retirar, eliminar, anular) usan `ConfirmDialog` en vez de `confirm()` nativo del navegador.
