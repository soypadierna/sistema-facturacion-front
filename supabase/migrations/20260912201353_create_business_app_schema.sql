/*
# Esquema completo de la aplicación de gestión empresarial

## Descripción
Crea todas las tablas necesarias para una aplicación de escritorio de gestión empresarial
con autenticación de administrador. Incluye clientes, productos, categorías, facturas,
detalles de factura, informes, empleados y roles de empleados.

## Tablas nuevas

1. `clientes` - Información de clientes de la empresa
   - id (uuid, PK)
   - nombre (text, no null)
   - email (text)
   - telefono (text)
   - direccion (text)
   - ciudad (text)
   - documento (text) - número de identificación
   - fecha_registro (timestamptz)

2. `categorias_producto` - Categorías para organizar productos
   - id (uuid, PK)
   - nombre (text, no null)
   - descripcion (text)
   - created_at (timestamptz)

3. `productos` - Catálogo de productos
   - id (uuid, PK)
   - nombre (text, no null)
   - descripcion (text)
   - precio (numeric, no null)
   - stock (integer, default 0)
   - categoria_id (uuid, FK -> categorias_producto)
   - created_at (timestamptz)

4. `facturas` - Facturas emitidas a clientes
   - id (uuid, PK)
   - numero (text, no null, unique)
   - cliente_id (uuid, FK -> clientes)
   - fecha (timestamptz)
   - total (numeric, default 0)
   - estado (text, default 'pendiente')
   - created_at (timestamptz)

5. `factura_detalles` - Líneas de detalle de cada factura
   - id (uuid, PK)
   - factura_id (uuid, FK -> facturas, cascade delete)
   - producto_id (uuid, FK -> productos)
   - cantidad (integer, no null)
   - precio_unitario (numeric, no null)
   - subtotal (numeric, no null)

6. `informes` - Informes generados en el sistema
   - id (uuid, PK)
   - titulo (text, no null)
   - tipo (text, no null)
   - descripcion (text)
   - fecha_inicio (date)
   - fecha_fin (date)
   - datos (jsonb)
   - created_at (timestamptz)

7. `roles_empleado` - Roles disponibles para empleados
   - id (uuid, PK)
   - nombre (text, no null, unique)
   - descripcion (text)
   - permisos (jsonb)
   - created_at (timestamptz)

8. `empleados` - Empleados de la empresa
   - id (uuid, PK)
   - nombre (text, no null)
   - email (text)
   - telefono (text)
   - direccion (text)
   - cargo (text)
   - salario (numeric)
   - fecha_contratacion (date)
   - rol_id (uuid, FK -> roles_empleado)
   - created_at (timestamptz)

## Seguridad
- RLS habilitado en todas las tablas
- Políticas CRUD para usuarios autenticados (la app requiere login)
- Todas las tablas permiten acceso a usuarios autenticados
*/

-- =================== CLIENTES ===================
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text,
  telefono text,
  direccion text,
  ciudad text,
  documento text,
  fecha_registro timestamptz DEFAULT now()
);
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clientes" ON clientes;
CREATE POLICY "select_clientes" ON clientes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_clientes" ON clientes;
CREATE POLICY "insert_clientes" ON clientes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_clientes" ON clientes;
CREATE POLICY "update_clientes" ON clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_clientes" ON clientes;
CREATE POLICY "delete_clientes" ON clientes FOR DELETE TO authenticated USING (true);

-- =================== CATEGORÍAS DE PRODUCTO ===================
CREATE TABLE IF NOT EXISTS categorias_producto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categorias_producto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_categorias" ON categorias_producto;
CREATE POLICY "select_categorias" ON categorias_producto FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_categorias" ON categorias_producto;
CREATE POLICY "insert_categorias" ON categorias_producto FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_categorias" ON categorias_producto;
CREATE POLICY "update_categorias" ON categorias_producto FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_categorias" ON categorias_producto;
CREATE POLICY "delete_categorias" ON categorias_producto FOR DELETE TO authenticated USING (true);

-- =================== PRODUCTOS ===================
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  precio numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  categoria_id uuid REFERENCES categorias_producto(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_productos" ON productos;
CREATE POLICY "select_productos" ON productos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_productos" ON productos;
CREATE POLICY "insert_productos" ON productos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_productos" ON productos;
CREATE POLICY "update_productos" ON productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_productos" ON productos;
CREATE POLICY "delete_productos" ON productos FOR DELETE TO authenticated USING (true);

-- =================== FACTURAS ===================
CREATE TABLE IF NOT EXISTS facturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  fecha timestamptz DEFAULT now(),
  total numeric NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_facturas" ON facturas;
CREATE POLICY "select_facturas" ON facturas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_facturas" ON facturas;
CREATE POLICY "insert_facturas" ON facturas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_facturas" ON facturas;
CREATE POLICY "update_facturas" ON facturas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_facturas" ON facturas;
CREATE POLICY "delete_facturas" ON facturas FOR DELETE TO authenticated USING (true);

-- =================== FACTURA DETALLES ===================
CREATE TABLE IF NOT EXISTS factura_detalles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id uuid NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id) ON DELETE SET NULL,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0
);
ALTER TABLE factura_detalles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_factura_detalles" ON factura_detalles;
CREATE POLICY "select_factura_detalles" ON factura_detalles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_factura_detalles" ON factura_detalles;
CREATE POLICY "insert_factura_detalles" ON factura_detalles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_factura_detalles" ON factura_detalles;
CREATE POLICY "update_factura_detalles" ON factura_detalles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_factura_detalles" ON factura_detalles;
CREATE POLICY "delete_factura_detalles" ON factura_detalles FOR DELETE TO authenticated USING (true);

-- =================== INFORMES ===================
CREATE TABLE IF NOT EXISTS informes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo text NOT NULL,
  descripcion text,
  fecha_inicio date,
  fecha_fin date,
  datos jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_informes" ON informes;
CREATE POLICY "select_informes" ON informes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_informes" ON informes;
CREATE POLICY "insert_informes" ON informes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_informes" ON informes;
CREATE POLICY "update_informes" ON informes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_informes" ON informes;
CREATE POLICY "delete_informes" ON informes FOR DELETE TO authenticated USING (true);

-- =================== ROLES DE EMPLEADO ===================
CREATE TABLE IF NOT EXISTS roles_empleado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  permisos jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE roles_empleado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_roles" ON roles_empleado;
CREATE POLICY "select_roles" ON roles_empleado FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_roles" ON roles_empleado;
CREATE POLICY "insert_roles" ON roles_empleado FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_roles" ON roles_empleado;
CREATE POLICY "update_roles" ON roles_empleado FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_roles" ON roles_empleado;
CREATE POLICY "delete_roles" ON roles_empleado FOR DELETE TO authenticated USING (true);

-- =================== EMPLEADOS ===================
CREATE TABLE IF NOT EXISTS empleados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text,
  telefono text,
  direccion text,
  cargo text,
  salario numeric,
  fecha_contratacion date,
  rol_id uuid REFERENCES roles_empleado(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_empleados" ON empleados;
CREATE POLICY "select_empleados" ON empleados FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_empleados" ON empleados;
CREATE POLICY "insert_empleados" ON empleados FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_empleados" ON empleados;
CREATE POLICY "update_empleados" ON empleados FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_empleados" ON empleados;
CREATE POLICY "delete_empleados" ON empleados FOR DELETE TO authenticated USING (true);

-- =================== ÍNDICES ===================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_factura_detalles_factura ON factura_detalles(factura_id);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol_id);
