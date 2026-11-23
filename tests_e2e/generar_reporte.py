import xml.etree.ElementTree as ET
import re

ESPERADOS = {
 "f1_01": "Entra al dashboard",
 "f1_02": "Mensaje “Usuario o contraseña incorrectos”",
 "f1_03": "Mismo mensaje genérico",
 "f1_04": "No envía el formulario",
 "f1_05": "Mensaje de demasiados intentos",
 "f2_01": "Cliente visible en la tabla",
 "f2_02": "No se crea; nombre requerido",
 "f2_03": "No se crea; email inválido",
 "f2_04": "Error de documento duplicado",
 "f2_05": "Cliente creado",
 "f3_01": "Total 107.100",
 "f3_02": "Stock de 10 a 8",
 "f3_03": "Error y sin factura",
 "f3_05": "“Agrega al menos un producto”",
 "f3_08": "Stock en 0",
}

tree = ET.parse("resultados.xml")
suite = tree.getroot()
if suite.tag == "testsuites":
    suite = suite[0]

filas, total_t = [], 0.0
for tc in suite.iter("testcase"):
    nombre = tc.get("name")
    m = re.match(r"test_(f\d_\d\d)", nombre)
    if not m:
        continue
    clave = m.group(1)
    t = float(tc.get("time", 0))
    total_t += t
    falla = tc.find("failure") if tc.find("failure") is not None else tc.find("error")
    if falla is not None:
        estado = "❌ Fallido"
        obtenido = (falla.get("message") or "")[:80].replace("\n", " ")
        evidencia = f"screenshots/{nombre}.png"
    else:
        estado = "✅ Pasó"
        obtenido = ESPERADOS.get(clave, "") + " (coincide)"
        evidencia = "reporte.html"
    filas.append((clave.upper().replace("_", "-"), nombre,
                  ESPERADOS.get(clave, ""), obtenido, estado, evidencia))

filas.sort()
print("| Caso | Prueba automatizada | Resultado esperado | Resultado obtenido | Estado | Evidencia |")
print("|---|---|---|---|---|---|")
for f in filas:
    print("| " + " | ".join(f) + " |")

total = len(filas)
pasadas = sum(1 for f in filas if "Pasó" in f[4])
print(f"\nEjecutadas: {total} | Pasadas: {pasadas} | Fallidas: {total-pasadas} "
      f"| % de pase: {pasadas/total*100:.1f} % | Tiempo: {total_t:.1f} s")