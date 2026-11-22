import os
import random
import time
from pathlib import Path

import pytest
import requests
from pytest_html import extras
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")
API_URL = os.getenv("API_URL", "http://localhost:8000")
QA_USER = os.getenv("QA_USER")
QA_PASS = os.getenv("QA_PASS")
HEADLESS = os.getenv("HEADLESS", "0") == "1"
SCREENSHOT_DIR = Path(__file__).parent / "screenshots"
TIMEOUT = 10


def unique_suffix() -> str:
    return f"{int(time.time() * 1000)}{random.randint(10, 99)}"


class ApiClient:
    """Cliente HTTP para preparar y limpiar datos de prueba."""

    def __init__(self, base_url: str, usuario: str, clave: str):
        self.base_url = base_url.rstrip("/")
        self.http = requests.Session()
        r = self.http.post(f"{self.base_url}/auth/login", json={"usuario": usuario, "clave": clave}, timeout=TIMEOUT)
        r.raise_for_status()
        self.token = r.json()["accessToken"]
        self.http.headers["Authorization"] = f"Bearer {self.token}"

    def _req(self, method: str, path: str, **kwargs):
        return self.http.request(method, f"{self.base_url}{path}", timeout=TIMEOUT, **kwargs)

    # --- clientes ---
    def crear_cliente(self, nombre, documento=None, email=None):
        r = self._req("POST", "/clientes", json={"nombre": nombre, "documento": documento, "direccion": None, "telefono": None, "email": email})
        r.raise_for_status()
        return r.json()

    def buscar_cliente_por_nombre(self, nombre):
        r = self._req("GET", "/clientes")
        r.raise_for_status()
        return next((c for c in r.json() if c["nombre"] == nombre), None)

    def borrar_cliente(self, id_cliente):
        self._req("DELETE", f"/clientes/{id_cliente}")

    def borrar_clientes_por_nombre(self, nombres):
        for nombre in nombres:
            c = self.buscar_cliente_por_nombre(nombre)
            if c:
                self.borrar_cliente(c["idCliente"])

    # --- productos ---
    def _categoria_qa(self):
        r = self._req("GET", "/categorias")
        r.raise_for_status()
        existente = next((c for c in r.json() if c["descripcion"] == "QA Categoria"), None)
        if existente:
            return existente["id"]
        r = self._req("POST", "/categorias", json={"descripcion": "QA Categoria"})
        r.raise_for_status()
        return r.json()["id"]

    def crear_producto(self, nombre, codigo, precio_venta, stock):
        r = self._req("POST", "/productos", json={
            "nombre": nombre, "codigo": codigo, "precioCompra": precio_venta / 2,
            "precioVenta": precio_venta, "idCategoria": self._categoria_qa(),
            "detalle": None, "stock": stock,
        })
        r.raise_for_status()
        return r.json()

    def obtener_producto(self, id_producto):
        r = self._req("GET", "/productos")
        r.raise_for_status()
        return next(p for p in r.json() if p["idProducto"] == id_producto)

    def borrar_producto(self, id_producto):
        self._req("DELETE", f"/productos/{id_producto}")

    # --- facturas ---
    def facturas_de_cliente(self, id_cliente):
        r = self._req("GET", "/facturas?limit=500")
        r.raise_for_status()
        return [f for f in r.json() if f["cliente"]["id"] == id_cliente]

    def anular_facturas_de_cliente(self, id_cliente):
        for f in self.facturas_de_cliente(id_cliente):
            if 3 in f["estadosPermitidos"]:
                self._req("PATCH", f"/facturas/{f['idFactura']}/estado", json={"idEstado": 3})


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def credenciales():
    if not QA_USER or not QA_PASS:
        pytest.exit("Define las variables de entorno QA_USER y QA_PASS", returncode=2)
    return QA_USER, QA_PASS


@pytest.fixture(scope="session")
def api(credenciales):
    return ApiClient(API_URL, *credenciales)


@pytest.fixture(scope="session")
def chromedriver_path():
    return ChromeDriverManager().install()


@pytest.fixture
def driver(chromedriver_path):
    options = Options()
    options.add_argument("--window-size=1366,900")
    if HEADLESS:
        options.add_argument("--headless=new")
    drv = webdriver.Chrome(service=Service(chromedriver_path), options=options)
    yield drv
    drv.quit()


@pytest.fixture
def uid():
    return unique_suffix()


@pytest.fixture
def logged_in(driver, api, credenciales):
    """Sesión iniciada inyectando el token (evita repetir el login por UI)."""
    driver.get(BASE_URL)
    driver.execute_script(
        "localStorage.setItem('dbfacturas_token', arguments[0]);"
        "localStorage.setItem('dbfacturas_usuario', arguments[1]);",
        api.token, credenciales[0],
    )
    driver.get(BASE_URL)
    WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="user-name"]'))
    )
    return driver


@pytest.fixture
def clientes_a_limpiar(api):
    nombres = []
    yield nombres
    api.borrar_clientes_por_nombre(nombres)


@pytest.fixture
def cliente_qa(api, uid):
    cliente = api.crear_cliente(f"Cliente QA {uid}", documento=int(uid))
    yield cliente
    api.borrar_cliente(cliente["idCliente"])


@pytest.fixture
def producto_qa(api, uid):
    producto = api.crear_producto(f"Producto QA {uid}", f"QA{uid}", 100000, 10)
    yield producto
    api.borrar_producto(producto["idProducto"])


@pytest.fixture
def facturas_cleanup(api, cliente_qa, producto_qa):
    """Anula las facturas del test (repone stock) antes de borrar cliente y producto."""
    yield
    api.anular_facturas_de_cliente(cliente_qa["idCliente"])


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when != "call" or not report.failed:
        return
    drv = item.funcargs.get("driver")
    if drv is None:
        return
    SCREENSHOT_DIR.mkdir(exist_ok=True)
    drv.save_screenshot(str(SCREENSHOT_DIR / f"{item.name}.png"))
    report.extras = getattr(report, "extras", []) + [extras.png(drv.get_screenshot_as_base64())]