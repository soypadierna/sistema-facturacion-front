# Ejecución de las pruebas E2E

## Requisitos
- Python 3.11+, Google Chrome.
- Front en http://localhost:5173 y API en http://localhost:8000 corriendo.
- Usuario QA con rol 1 (necesita permisos de clientes, productos, categorías y facturas).
- Front con los `data-testid` agregados.

## Instalación (PowerShell)
```
cd tests_e2e
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Variables de entorno
```
$env:QA_USER="usuario_qa"
$env:QA_PASS="clave_qa"
# opcionales
$env:BASE_URL="http://localhost:5173"
$env:API_URL="http://localhost:8000"
$env:HEADLESS="1"
```

## Ejecutar
```
pytest --html=reporte.html --self-contained-html
pytest tests/test_login.py --html=reporte.html --self-contained-html
pytest -k f3_01
```

## Leer el reporte (reporte.html)
1. Arriba: total de pruebas, pasadas, fallidas y duración.
2. Tabla **Results**: filtrar por Passed / Failed.
3. Al expandir una fila fallida: traza del error y captura de pantalla.
4. Las capturas también quedan en `screenshots/`.

## Plantilla de resultados
| Caso del plan | Prueba automatizada | Esperado | Obtenido | Pasó/Falló | Evidencia |
|---|---|---|---|---|---|
| F1-01 | test_f1_01_login_valido_entra_al_dashboard | Entra al dashboard | | | |
| F1-02 | test_f1_02_clave_incorrecta_muestra_mensaje | Mensaje "Usuario o contraseña incorrectos" | | | |
| F1-03 | test_f1_03_usuario_inexistente_muestra_mismo_mensaje | Mismo mensaje genérico | | | |
| F1-04 | test_f1_04_campos_vacios_no_envia | No envía el formulario | | | |
| F1-05 | test_f1_05_bloqueo_tras_5_fallos | Mensaje de demasiados intentos | | | |
| F2-01 | test_f2_01_cliente_valido_aparece_en_tabla | Cliente en la tabla | | | |
| F2-02 | test_f2_02_nombre_obligatorio | No se crea; nombre requerido | | | |
| F2-03 | test_f2_03_email_invalido_rechazado | No se crea; email inválido | | | |
| F2-04 | test_f2_04_documento_duplicado_muestra_error | Error de documento duplicado | | | |
| F2-05 | test_f2_05_cliente_solo_nombre_se_crea | Cliente creado solo con nombre | | | |
| F3-01 | test_f3_01_total_con_descuento_e_iva | Total 107.100 | | | |
| F3-02 | test_f3_02_stock_baja_la_cantidad_vendida | Stock 10 → 8 | | | |
| F3-03 | test_f3_03_cantidad_mayor_al_stock_no_crea | Error y sin factura | | | |
| F3-05 | test_f3_05_sin_productos_no_crea | "Agrega al menos un producto" | | | |
| F3-08 | test_f3_08_cantidad_igual_al_stock_deja_stock_en_cero | Stock 0 | | | |

## Métricas
- Automatizados vs manuales: 15 / 25 = 60 %.
- % de pase = pasadas / ejecutadas × 100.
- Tiempo: duración del reporte vs. ejecución manual estimada.

## Notas
- Los datos usan prefijo "QA" y timestamp, así que se puede repetir la suite.
- Las facturas se anulan al terminar (el stock se repone). Los clientes y productos usados en facturas no se pueden borrar por diseño de la API y quedan identificables por el prefijo "QA".
- Si el reporte falla por `AttributeError: extras`, actualiza con `pip install -U pytest-html`.