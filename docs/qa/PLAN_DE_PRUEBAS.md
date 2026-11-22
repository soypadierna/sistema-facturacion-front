# Plan de Pruebas — Sistema de Facturación

## 1. Objetivo
Verificar que las funcionalidades de Login, Creación de clientes y Creación de facturas cumplen los requisitos funcionales, incluyendo validaciones, mensajes de error y cálculos, y seleccionar los casos a automatizar.

## 2. Alcance
**Incluido**
- F1 Login (acceso, credenciales inválidas, bloqueo por intentos).
- F2 Crear cliente (validaciones, duplicados, visualización en tabla).
- F3 Crear factura (cálculo de totales, descuento de stock, validación de stock).

**Excluido**
- Roles, empleados, productos, categorías, informes y dashboard.
- Pruebas de carga, seguridad avanzada y compatibilidad entre navegadores.

## 3. Entorno
| Elemento | Detalle |
|---|---|
| Frontend | http://localhost:5173 (React + TypeScript + Tailwind) |
| API | http://localhost:8000 (FastAPI) |
| Base de datos | PostgreSQL (Supabase) |
| Navegador | Google Chrome (última versión) |
| SO | Windows |
| Herramientas | Navegador + DevTools, Postman (apoyo), Selenium (automatización) |

## 4. Datos de prueba
| Dato | Valor |
|---|---|
| Usuario válido (rol con acceso a clientes y facturas) | `USUARIO_QA` (definir antes de ejecutar) |
| Clave válida | `CLAVE_QA` |
| Usuario inexistente | `usuario_inexistente` |
| Clave incorrecta | `ClaveErronea123` |
| Cliente válido | Nombre `Cliente QA <timestamp>`, documento único, email `qa<timestamp>@test.com` |
| Email inválido | `correo-sin-arroba` |
| Producto de prueba | Precio de venta $100.000, stock inicial conocido (ej. 20) |
| Descuento / IVA | 10 % / 19 % |
| Total esperado | 100.000 − 10.000 = 90.000; IVA 17.100; **total 107.100** |

Nota: el usuario de prueba de login masivo (F1-05) debe ser distinto al usado en el resto de casos, para no bloquearlo.

## 5. Criterios
- **Entrada:** front y API arriba, usuario y producto de prueba creados.
- **Salida:** todos los casos ejecutados y defectos críticos documentados.

## 6. Casos de prueba manuales

### F1 — Login
| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| F1-01 | Login | Ingreso con credenciales válidas | Usuario activo existente | 1. Abrir la app 2. Escribir usuario 3. Escribir clave 4. Clic en "Iniciar Sesión" | USUARIO_QA / CLAVE_QA | Se muestra el dashboard con el nombre del usuario en el menú lateral | | | |
| F1-02 | Login | Clave incorrecta | Usuario existente | 1. Escribir usuario válido 2. Escribir clave errónea 3. Iniciar sesión | USUARIO_QA / ClaveErronea123 | Mensaje "Usuario o contraseña incorrectos"; permanece en login | | | |
| F1-03 | Login | Usuario inexistente | Ninguna | 1. Escribir usuario inexistente 2. Escribir cualquier clave 3. Iniciar sesión | usuario_inexistente / ClaveErronea123 | Mismo mensaje genérico (no revela si el usuario existe) | | | |
| F1-04 | Login | Campos vacíos | Ninguna | 1. Dejar usuario y clave vacíos 2. Clic en "Iniciar Sesión" | (vacío) | El formulario no se envía; el navegador pide completar los campos obligatorios | | | |
| F1-05 | Login | Bloqueo tras 5 fallos | Usuario existente sin intentos previos | 1. Intentar login con clave errónea 5 veces seguidas 2. Intentar un sexto login | USUARIO_QA_BLOQ / ClaveErronea123 | A partir del intento bloqueado se muestra mensaje de demasiados intentos | | | |
| F1-06 | Login | Bloqueo no se evita con clave correcta | Usuario bloqueado (F1-05) | 1. Con el usuario bloqueado, ingresar la clave correcta | USUARIO_QA_BLOQ / clave correcta | Se mantiene el bloqueo (mensaje de demasiados intentos) | | | |
| F1-07 | Login | Persistencia de sesión | Sesión iniciada | 1. Iniciar sesión 2. Recargar la página (F5) | USUARIO_QA | Permanece en el dashboard sin pedir login | | | |
| F1-08 | Login | Token inválido | Sesión iniciada | 1. Alterar o borrar `dbfacturas_token` en localStorage 2. Recargar | — | Regresa a la pantalla de login | | | |

### F2 — Crear cliente
| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| F2-01 | Crear cliente | Cliente válido aparece en la tabla | Sesión iniciada, módulo Clientes | 1. Clic en "Nuevo Cliente" 2. Completar nombre, documento y email 3. Guardar | Nombre, documento único, email válido | Toast "Cliente creado"; el cliente aparece en la tabla | | | |
| F2-02 | Crear cliente | Nombre obligatorio | Modal abierto | 1. Dejar nombre vacío 2. Completar el resto 3. Guardar | Nombre vacío | No se guarda; el navegador marca el nombre como obligatorio | | | |
| F2-03 | Crear cliente | Email inválido | Modal abierto | 1. Nombre válido 2. Email sin formato correcto 3. Guardar | Email `correo-sin-arroba` | Rechazo: no se crea el cliente y se muestra el error de validación | | | |
| F2-04 | Crear cliente | Documento duplicado (409) | Existe un cliente con documento X | 1. Crear otro cliente con el mismo documento | Documento X repetido | Toast "Ya existe un cliente con ese documento"; no se crea | | | |
| F2-05 | Crear cliente | Solo nombre (campos opcionales vacíos) | Modal abierto | 1. Ingresar solo el nombre 2. Guardar | Nombre válido | Cliente creado con documento, email, teléfono y dirección vacíos | | | |
| F2-06 | Crear cliente | Nombre en el límite de 55 caracteres | Modal abierto | 1. Ingresar un nombre de 55 caracteres 2. Guardar | 55 caracteres | Se crea correctamente | | | |
| F2-07 | Crear cliente | Nombre excede 55 caracteres | Modal abierto | 1. Intentar escribir 56+ caracteres | 60 caracteres | El campo limita a 55 caracteres | | | |
| F2-08 | Crear cliente | Documento solo numérico | Modal abierto | 1. Intentar escribir letras y símbolos en Documento | `abc-1.5` | Solo se aceptan dígitos | | | |

### F3 — Crear factura
| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| F3-01 | Crear factura | Cálculo de total con descuento e IVA | Cliente y producto ($100.000, stock ≥ 1) | 1. Nueva Factura 2. Elegir cliente 3. Agregar el producto, cantidad 1 4. Descuento 10 5. Crear | Subtotal 100.000, desc. 10 %, IVA 19 % | Total **107.100** (descuento 10.000, IVA 17.100) | | | |
| F3-02 | Crear factura | Stock disminuye | Stock inicial N conocido | 1. Crear factura vendiendo 2 unidades 2. Revisar el stock en Productos | Cantidad 2 | Stock final = N − 2 | | | |
| F3-03 | Crear factura | Cantidad mayor al stock | Producto con stock N | 1. Ingresar cantidad N + 1 2. Crear | Cantidad N + 1 | Error de stock insuficiente; no se crea la factura | | | |
| F3-04 | Crear factura | Sin cliente | Modal abierto | 1. Agregar producto sin elegir cliente 2. Crear | — | No se crea; se exige seleccionar un cliente | | | |
| F3-05 | Crear factura | Sin productos | Modal abierto | 1. Elegir cliente sin agregar productos 2. Crear | — | Mensaje "Agrega al menos un producto"; no se crea | | | |
| F3-06 | Crear factura | Descuento 0 % | Cliente y producto | 1. Descuento 0 2. Crear | Subtotal 100.000 | Total 119.000 | | | |
| F3-07 | Crear factura | Descuento 100 % | Cliente y producto | 1. Descuento 100 2. Crear | Subtotal 100.000 | Total 0 | | | |
| F3-08 | Crear factura | Cantidad igual al stock (borde) | Producto con stock N | 1. Vender exactamente N unidades | Cantidad N | Se crea; stock queda en 0 | | | |
| F3-09 | Crear factura | Factura aparece en la lista | Factura creada | 1. Revisar la tabla de facturas | — | La factura nueva figura con estado y total correctos | | | |

## 7. Resumen
| Funcionalidad | Casos | Positivos | Negativos | Borde |
|---|---|---|---|---|
| F1 Login | 8 | 2 | 4 | 2 |
| F2 Crear cliente | 8 | 2 | 3 | 3 |
| F3 Crear factura | 9 | 4 | 3 | 2 |
| **Total** | **25** | | | |