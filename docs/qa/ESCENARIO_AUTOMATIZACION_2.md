# Estrategia de automatización de casos de prueba para el sistema de Facturación

**Contenido:** Introducción · Alcance · Roles y responsabilidades · Riesgos y contingencia · Herramientas · Planificación · Reporte de pruebas

## Historial de versiones del documento

| Fecha | Versión | Descripción | Autor |
|---|---|---|---|
| 22/11/2026 | 1.0 | Versión inicial de la estrategia | [Nombre del equipo] |
| | | | |

# Introducción

El Sistema de Facturación es una aplicación web para gestionar clientes, productos, categorías, facturas, empleados, roles e informes. Se compone de un frontend en React + TypeScript + Tailwind (http://localhost:5173), una API en FastAPI (http://localhost:8000) y una base de datos PostgreSQL alojada en Supabase.

Esta estrategia define cómo se automatizarán las pruebas end-to-end de los flujos críticos del sistema (Login, Crear cliente y Crear factura) con Selenium WebDriver y pytest. El objetivo es detectar regresiones de forma rápida y repetible, reducir el tiempo de las pruebas manuales y dejar evidencia verificable (reporte HTML y capturas de pantalla).

La automatización sigue el patrón Page Object Model: los selectores (`data-testid`) viven en las páginas y los tests solo contienen la lógica de verificación. Cada prueba crea sus propios datos únicos y limpia lo que genera, por lo que se puede repetir sin conflictos.

# Alcance

**Funcionalidades incluidas**
- F1 Login
- F2 Crear cliente
- F3 Crear factura

**Criterios para decidir qué se automatiza**
- **Funcionalidades críticas:** sin login no se usa el sistema y sin facturas no hay ingresos.
- **Tareas repetitivas:** se ejecutan en cada jornada y en cada cambio de código.
- **Reglas de negocio con riesgo de regresión:** cálculo de total (descuento e IVA), descuento de stock y validación de stock insuficiente.
- **Resultados deterministas:** las reglas son claras y el resultado esperado es verificable.

**Casos a automatizar (15 de 25 del plan de pruebas manual)**

| Funcionalidad | Casos automatizados | Prueba |
|---|---|---|
| F1 Login | F1-01 | Credenciales válidas entran al dashboard |
| | F1-02 | Clave incorrecta muestra "Usuario o contraseña incorrectos" |
| | F1-03 | Usuario inexistente muestra el mismo mensaje |
| | F1-04 | Campos vacíos no envían el formulario |
| | F1-05 | 5 fallos seguidos bloquean con mensaje de demasiados intentos |
| F2 Crear cliente | F2-01 | Cliente válido aparece en la tabla |
| | F2-02 | Nombre obligatorio |
| | F2-03 | Email inválido rechazado |
| | F2-04 | Documento duplicado muestra error 409 |
| | F2-05 | Cliente con solo el nombre se crea |
| F3 Crear factura | F3-01 | Subtotal 100.000, descuento 10 % e IVA 19 % da total 107.100 |
| | F3-02 | El stock baja la cantidad vendida |
| | F3-03 | Cantidad mayor al stock muestra error y no crea la factura |
| | F3-05 | Factura sin productos no se crea |
| | F3-08 | Cantidad igual al stock deja el stock en 0 |

**Casos que permanecen manuales (10):** F1-06, F1-07, F1-08, F2-06, F2-07, F2-08, F3-04, F3-06, F3-07, F3-09. Son de verificación visual, de manipulación del navegador (localStorage) o de bajo riesgo y baja frecuencia.

**Fuera de alcance:** módulos de empleados, roles, productos, categorías, informes y dashboard; pruebas de carga y de seguridad avanzada; compatibilidad entre navegadores (solo Chrome).

**Tiempo:** el detalle está en la sección Planificación.

# Roles y responsabilidades

| Rol | Responsabilidad |
|---|---|
| **Manager de QA** [Nombre] | Define el alcance y la estrategia, coordina al equipo, aprueba el plan de pruebas, hace seguimiento del cronograma y valida el reporte final. |
| **Ingeniero QA de Automatización** [Nombre] | Diseña la arquitectura (Page Object), desarrolla y mantiene los scripts de Selenium y pytest, configura el entorno y genera el reporte. |
| **Analista de pruebas manuales** [Nombre] | Diseña y ejecuta los casos manuales, prepara los datos de prueba, registra defectos y evidencias. |
| **Desarrollador de soporte** [Nombre] | Agrega los `data-testid` en el frontend, corrige los defectos reportados y apoya con el entorno (front, API y base de datos). |

# Riesgos y contingencia

| Riesgo | Probabilidad de ocurrencia | Complejidad / Impacto | Contingencia |
|---|---|---|---|
| Cambios en la interfaz rompen los selectores | Muy probable | Media | Uso exclusivo de `data-testid` y Page Object centralizado: se corrige en un solo archivo. |
| Datos duplicados entre ejecuciones (documento, código) | Muy probable | Media | Datos únicos con timestamp y limpieza automática al terminar cada prueba. |
| Intermitencia por tiempos de carga del front o la API | Muy probable | Alta | Esperas explícitas (`WebDriverWait`), nunca pausas fijas; reintento manual para confirmar el fallo. |
| El usuario de prueba se bloquea por intentos fallidos | Poco probable | Alta | El caso de bloqueo usa un usuario inexistente distinto en cada ejecución. |
| Stock insuficiente o producto compartido altera los resultados | Poco probable | Alta | Cada prueba crea su propio producto con stock conocido (10 unidades). |
| Facturas de prueba que no se pueden borrar (por diseño de la API) | Muy probable | Baja | Las facturas se anulan al terminar (repone el stock) y los datos quedan identificables con el prefijo "QA". |
| Front, API o base de datos no disponibles al ejecutar | Poco probable | Crítica | Verificar el entorno antes de ejecutar y reprogramar la ejecución. |
| Actualización de Chrome incompatible con el driver | Poco probable | Media | `webdriver-manager` descarga el driver compatible automáticamente. |
| Falta de tiempo para automatizar todos los casos | Poco probable | Media | Priorizar los casos críticos (total de la factura, stock y login) y dejar el resto como manual. |

# Herramientas

| Herramienta | Función |
|---|---|
| Python 3 | Lenguaje de los scripts de prueba |
| Selenium WebDriver | Control del navegador y simulación de las acciones del usuario |
| pytest | Ejecución, organización y fixtures de las pruebas |
| pytest-html | Reporte HTML autocontenido con capturas de pantalla |
| webdriver-manager | Descarga y gestión automática de ChromeDriver |
| requests | Preparación y limpieza de datos de prueba mediante la API |
| Google Chrome + DevTools | Navegador de ejecución y revisión manual de las peticiones |
| Postman | Apoyo en pruebas manuales de la API |
| Git / GitHub | Control de versiones y entrega del código |

# Planificación

> Ajustar las fechas al cronograma real de la actividad.

| Fecha | Tipo de prueba | Funcionalidad | Observaciones |
|---|---|---|---|
| 22/11/2026 | Diseño | Plan de pruebas manual y estrategia de automatización | 25 casos manuales; se eligen 15 para automatizar |
| 23/11/2026 | Preparación | Agregar `data-testid` en el frontend e instalar el entorno | Prerrequisito de todos los scripts |
| 24/11/2026 | Manual | F1, F2 y F3 (25 casos) | Se registran resultados y evidencias |
| 25/11/2026 | Automatizada | F1 Login (5 pruebas) | Incluye bloqueo tras 5 fallos |
| 26/11/2026 | Automatizada | F2 Crear cliente (5 pruebas) | Validaciones y error 409 |
| 27/11/2026 | Automatizada | F3 Crear factura (5 pruebas) | Total 107.100, stock y errores |
| 28/11/2026 | Regresión | Suite completa (15 pruebas) | Ejecución con reporte HTML |
| 29/11/2026 | Análisis | Resultados, métricas y conclusiones | Reporte final |

# Reporte de pruebas

Comando de ejecución:
```
pytest --html=reporte.html --self-contained-html
```

**Resultados de la ejecución**

| Caso | Prueba automatizada | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| F1-01 | test_f1_01_login_valido_entra_al_dashboard | Entra al dashboard | | | |
| F1-02 | test_f1_02_clave_incorrecta_muestra_mensaje | Mensaje "Usuario o contraseña incorrectos" | | | |
| F1-03 | test_f1_03_usuario_inexistente_muestra_mismo_mensaje | Mismo mensaje genérico | | | |
| F1-04 | test_f1_04_campos_vacios_no_envia | No envía el formulario | | | |
| F1-05 | test_f1_05_bloqueo_tras_5_fallos | Mensaje de demasiados intentos | | | |
| F2-01 | test_f2_01_cliente_valido_aparece_en_tabla | Cliente visible en la tabla | | | |
| F2-02 | test_f2_02_nombre_obligatorio | No se crea; nombre requerido | | | |
| F2-03 | test_f2_03_email_invalido_rechazado | No se crea; email inválido | | | |
| F2-04 | test_f2_04_documento_duplicado_muestra_error | Error de documento duplicado | | | |
| F2-05 | test_f2_05_cliente_solo_nombre_se_crea | Cliente creado | | | |
| F3-01 | test_f3_01_total_con_descuento_e_iva | Total 107.100 | | | |
| F3-02 | test_f3_02_stock_baja_la_cantidad_vendida | Stock de 10 a 8 | | | |
| F3-03 | test_f3_03_cantidad_mayor_al_stock_no_crea | Error y sin factura | | | |
| F3-05 | test_f3_05_sin_productos_no_crea | "Agrega al menos un producto" | | | |
| F3-08 | test_f3_08_cantidad_igual_al_stock_deja_stock_en_cero | Stock en 0 | | | |

**Métricas**

| Métrica | Valor |
|---|---|
| Casos automatizados vs manuales | 15 / 25 (60 %) |
| Pruebas ejecutadas | |
| Pruebas pasadas | |
| Pruebas fallidas | |
| % de pase | |
| Tiempo de ejecución automatizada | |
| Tiempo estimado manual | |
| Defectos encontrados | |

**Conclusiones**
[Completar después de ejecutar: hallazgos, defectos, ahorro de tiempo y lecciones aprendidas.]

**Evidencias**
- Reporte HTML: `reporte.html`
- Capturas de pantalla de fallos: carpeta `screenshots/`
- Código fuente: carpeta `tests_e2e/` del repositorio