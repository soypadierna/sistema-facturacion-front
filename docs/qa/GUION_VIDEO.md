# Guion del video (16 min, 4 integrantes × 4 min)

Regla general: cada integrante aparece en cámara al inicio de su tramo (cámara en una esquina durante todo el tramo) y se presenta con nombre y rol.

## Integrante 1 — Contexto, plan y pruebas manuales (0:00–4:00)
| Tiempo | Qué decir | Qué mostrar |
|---|---|---|
| 0:00–0:40 | Saludo, presentación del equipo, objetivo de la actividad | Cámara de los 4, título del proyecto |
| 0:40–1:30 | Qué es el sistema y su arquitectura (React + FastAPI + PostgreSQL) | README o diagrama de capas |
| 1:30–2:30 | Alcance: F1 Login, F2 Crear cliente, F3 Crear factura | `PLAN_DE_PRUEBAS.md` (alcance y entorno) |
| 2:30–4:00 | Casos manuales: 25 casos, positivos, negativos y borde. Demo manual de 1 caso (ej. total 107.100) | Tabla de casos y la app corriendo |

## Integrante 2 — Escenario de automatización (4:00–8:00)
| Tiempo | Qué decir | Qué mostrar |
|---|---|---|
| 4:00–5:00 | Criterios para elegir qué automatizar y por qué estos 3 flujos | `ESCENARIO_AUTOMATIZACION.md` (sección de criterios) |
| 5:00–6:00 | Herramientas: Python, Selenium, pytest, pytest-html, webdriver-manager | Sección de herramientas y `requirements.txt` |
| 6:00–7:00 | Arquitectura Page Object y uso de `data-testid` | Árbol de `tests_e2e/` y un `data-testid` en el código del front |
| 7:00–8:00 | Datos únicos, limpieza y riesgos | Sección de entorno, datos y riesgos |

## Integrante 3 — Código y demo (8:00–12:00)
| Tiempo | Qué decir | Qué mostrar |
|---|---|---|
| 8:00–9:00 | `conftest.py`: driver, esperas explícitas, capturas al fallar, fixtures | Archivo `conftest.py` |
| 9:00–10:00 | Page Object y un test (ej. total 107.100) | `facturas_page.py` y `test_facturas.py` |
| 10:00–12:00 | Demo: ejecutar la suite con Chrome visible | Terminal con `pytest --html=reporte.html --self-contained-html` y el navegador actuando |

## Integrante 4 — Resultados, métricas y conclusiones (12:00–16:00)
| Tiempo | Qué decir | Qué mostrar |
|---|---|---|
| 12:00–13:30 | Lectura del reporte: pasadas, fallidas, duración y capturas | `reporte.html` |
| 13:30–14:30 | Métricas: 15 de 25 automatizados (60 %), % de pase, tiempo vs manual | Tabla de resultados de `EJECUCION.md` |
| 14:30–15:30 | Hallazgos, defectos y lecciones aprendidas | Fallo con captura (si lo hubo) |
| 15:30–16:00 | Conclusiones y cierre con los 4 en cámara | Cámara de los 4 |

## Checklist antes de grabar
- Front y API corriendo, usuario QA probado.
- Ejecución previa de la suite sin errores.
- Zoom del navegador al 100 % y terminal con letra grande.
- Cada integrante ensaya sus 4 minutos.