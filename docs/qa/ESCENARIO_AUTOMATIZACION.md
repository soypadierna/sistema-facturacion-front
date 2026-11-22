# Escenario de Automatización — Sistema de Facturación

## 1. Objetivo y alcance
**Objetivo:** automatizar pruebas end-to-end de los flujos críticos del sistema para detectar regresiones de forma rápida y repetible.

**Alcance:** F1 Login, F2 Crear cliente y F3 Crear factura, ejecutados sobre la interfaz web real (front + API + base de datos).

**Fuera de alcance:** módulos restantes, pruebas de rendimiento y compatibilidad multi-navegador.

## 2. Criterios para elegir qué automatizar
| Criterio | Aplicación |
|---|---|
| Criticidad del negocio | Sin login no se usa el sistema; sin facturas no hay ingresos. |
| Frecuencia de uso | Los tres flujos se usan en cada jornada. |
| Riesgo de regresión | Cálculo de totales y control de stock son propensos a errores al cambiar código. |
| Estabilidad | Reglas claras y resultados deterministas. |
| Costo manual | Repetir cálculos y revisar stock a mano es lento y propenso a errores. |

**Por qué estos 3 casos**
1. **Login:** puerta de entrada; valida seguridad y mensajes.
2. **Crear cliente:** valida formularios, validaciones de entrada y errores del servidor (409).
3. **Crear factura:** concentra la mayor lógica de negocio (descuento, IVA, total, stock).

**No se automatizan** por ahora: casos de poco valor o de verificación visual (ej. límites de caracteres) y los que requieren manipular la base de datos directamente.

## 3. Herramientas
| Herramienta | Uso |
|---|---|
| Python 3 | Lenguaje de las pruebas |
| Selenium WebDriver | Control del navegador |
| pytest | Ejecución y organización de pruebas |
| pytest-html | Reporte HTML autocontenido |
| webdriver-manager | Descarga automática del driver de Chrome |

## 4. Arquitectura (Page Object Model)
tests_e2e/
├── conftest.py # driver, URL base, credenciales, capturas al fallar
├── pages/
│ ├── login_page.py
│ ├── clientes_page.py
│ └── facturas_page.py
├── tests/
│ ├── test_login.py
│ ├── test_clientes.py
│ └── test_facturas.py
├── requirements.txt
└── pytest.ini

- **Pages:** encapsulan selectores (`data-testid`) y acciones de cada pantalla.
- **Tests:** solo contienen la lógica de verificación, sin selectores.
- **conftest:** configuración compartida (driver, esperas explícitas, evidencia).
- Los selectores usan únicamente atributos `data-testid`, estables ante cambios de estilos.

## 5. Entorno y datos
- Front en `http://localhost:5173` y API en `http://localhost:8000` levantados.
- URL base y credenciales por variables de entorno (`BASE_URL`, `QA_USER`, `QA_PASS`).
- Cada prueba genera sus propios datos únicos con timestamp (documento, código, nombre) y limpia lo que puede, de modo que se pueda repetir sin conflictos.
- Esperas explícitas (`WebDriverWait`); no se usa `time.sleep`.

## 6. Flujo de ejecución
1. Preparar entorno e instalar dependencias.
2. Levantar front y API.
3. Ejecutar `pytest --html=reporte.html --self-contained-html`.
4. Cada prueba abre Chrome, ejecuta el flujo, verifica y cierra el navegador.
5. Si una prueba falla, se guarda una captura de pantalla automáticamente.
6. Revisión del reporte y registro de resultados.

## 7. Métricas
| Métrica | Cómo se calcula |
|---|---|
| Casos automatizados vs manuales | Automatizados / 25 casos del plan |
| % de pase | Pasadas / ejecutadas × 100 |
| Tiempo de ejecución | Duración total del reporte vs tiempo estimado manual |
| Defectos encontrados | Cantidad de fallos con causa real |
| Estabilidad | Fallos intermitentes en ejecuciones repetidas |

## 8. Riesgos y mantenimiento
| Riesgo | Mitigación |
|---|---|
| Cambios en la interfaz rompen selectores | Uso de `data-testid` y Page Object centralizado |
| Datos duplicados entre ejecuciones | Datos únicos con timestamp y limpieza al final |
| Bloqueo del usuario por intentos fallidos | Usuario dedicado para el caso de bloqueo |
| Lentitud o intermitencia del servidor | Esperas explícitas, no pausas fijas |
| Stock insuficiente para facturar | Crear un producto de prueba con stock propio |
| Dependencia del entorno local | Variables de entorno y documentación de ejecución |

**Mantenimiento:** actualizar el Page Object cuando cambie la pantalla; revisar los casos tras cada release; mantener los `data-testid` como contrato entre front y pruebas.