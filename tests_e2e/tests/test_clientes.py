from pages.clientes_page import ClientesPage


def test_f2_01_cliente_valido_aparece_en_tabla(logged_in, base_url, uid, clientes_a_limpiar):
    nombre = f"Cliente QA {uid}"
    clientes_a_limpiar.append(nombre)
    page = ClientesPage(logged_in, base_url).open()
    page.open_new_form()
    page.fill(nombre, uid, f"qa{uid}@test.com")
    page.submit()
    page.wait_toast("Cliente creado")
    page.search(nombre)
    page.wait_row(nombre)


def test_f2_02_nombre_obligatorio(logged_in, base_url, uid, api):
    page = ClientesPage(logged_in, base_url).open()
    page.open_new_form()
    page.fill(documento=uid, email=f"qa{uid}@test.com")
    page.submit()
    assert page.validity("cliente-nombre")["valueMissing"] is True
    assert page.form_is_open()
    assert not page.toast_contains("Cliente creado")


def test_f2_03_email_invalido_rechazado(logged_in, base_url, uid, api, clientes_a_limpiar):
    nombre = f"Cliente QA {uid}"
    clientes_a_limpiar.append(nombre)
    page = ClientesPage(logged_in, base_url).open()
    page.open_new_form()
    page.fill(nombre, uid, "correo-sin-arroba")
    page.submit()
    assert page.validity("cliente-email")["typeMismatch"] is True
    assert page.form_is_open()
    assert api.buscar_cliente_por_nombre(nombre) is None


def test_f2_04_documento_duplicado_muestra_error(logged_in, base_url, uid, api, clientes_a_limpiar):
    existente = api.crear_cliente(f"Cliente QA {uid}", documento=int(uid))
    nuevo = f"Cliente QA dup {uid}"
    clientes_a_limpiar.extend([existente["nombre"], nuevo])
    page = ClientesPage(logged_in, base_url).open()
    page.open_new_form()
    page.fill(nuevo, uid, f"dup{uid}@test.com")
    page.submit()
    page.wait_toast("Ya existe un cliente con ese documento")
    assert api.buscar_cliente_por_nombre(nuevo) is None


def test_f2_05_cliente_solo_nombre_se_crea(logged_in, base_url, uid, clientes_a_limpiar):
    nombre = f"Cliente QA {uid}"
    clientes_a_limpiar.append(nombre)
    page = ClientesPage(logged_in, base_url).open()
    page.open_new_form()
    page.fill(nombre)
    page.submit()
    page.wait_toast("Cliente creado")
    page.search(nombre)
    page.wait_row(nombre)