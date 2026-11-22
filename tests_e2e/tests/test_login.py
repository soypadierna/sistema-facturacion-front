from pages.login_page import LoginPage

GENERIC_ERROR = "Usuario o contraseña incorrectos"
WRONG_PASS = "ClaveErronea123!"


def test_f1_01_login_valido_entra_al_dashboard(driver, base_url, credenciales):
    usuario, clave = credenciales
    page = LoginPage(driver, base_url).open()
    page.login(usuario, clave)
    page.wait_dashboard()
    assert not page.is_present("login-submit")


def test_f1_02_clave_incorrecta_muestra_mensaje(driver, base_url, credenciales):
    page = LoginPage(driver, base_url).open()
    page.login(credenciales[0], WRONG_PASS)
    page.wait_error_containing(GENERIC_ERROR)
    assert page.is_present("login-submit")


def test_f1_03_usuario_inexistente_muestra_mismo_mensaje(driver, base_url, uid):
    page = LoginPage(driver, base_url).open()
    page.login(f"noexiste_{uid}", WRONG_PASS)
    page.wait_error_containing(GENERIC_ERROR)


def test_f1_04_campos_vacios_no_envia(driver, base_url):
    page = LoginPage(driver, base_url).open()
    page.click("login-submit")
    assert page.validity("login-usuario")["valueMissing"] is True
    assert page.is_present("login-submit")
    assert not page.is_present("login-error")


def test_f1_05_bloqueo_tras_5_fallos(driver, base_url, uid):
    usuario = f"bloqueo_{uid}"
    page = LoginPage(driver, base_url).open()
    for _ in range(5):
        page.login(usuario, WRONG_PASS)
        page.wait_error_containing(GENERIC_ERROR)
    page.login(usuario, WRONG_PASS)
    page.wait_error_containing("Demasiados intentos")