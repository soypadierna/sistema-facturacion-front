import pytest

from pages.facturas_page import FacturasPage


def abrir_formulario(driver, base_url, cliente):
    page = FacturasPage(driver, base_url).open()
    page.open_new_form()
    page.select_cliente(cliente["idCliente"])
    return page


def test_f3_01_total_con_descuento_e_iva(logged_in, base_url, cliente_qa, producto_qa, facturas_cleanup):
    page = abrir_formulario(logged_in, base_url, cliente_qa)
    page.add_line(producto_qa["idProducto"], 1)
    page.set_descuento(10)
    assert page.preview_total() == pytest.approx(107100)
    page.submit()
    assert page.detail_total() == pytest.approx(107100)


def test_f3_02_stock_baja_la_cantidad_vendida(logged_in, base_url, api, cliente_qa, producto_qa, facturas_cleanup):
    page = abrir_formulario(logged_in, base_url, cliente_qa)
    page.add_line(producto_qa["idProducto"], 2)
    page.submit()
    page.detail_total()
    assert api.obtener_producto(producto_qa["idProducto"])["stock"] == 8


def test_f3_03_cantidad_mayor_al_stock_no_crea(logged_in, base_url, api, cliente_qa, producto_qa, facturas_cleanup):
    page = abrir_formulario(logged_in, base_url, cliente_qa)
    page.add_line(producto_qa["idProducto"], 11)
    page.submit()
    page.wait_toast("Stock insuficiente")
    assert not page.detail_visible()
    assert api.facturas_de_cliente(cliente_qa["idCliente"]) == []
    assert api.obtener_producto(producto_qa["idProducto"])["stock"] == 10


def test_f3_05_sin_productos_no_crea(logged_in, base_url, api, cliente_qa, producto_qa, facturas_cleanup):
    page = abrir_formulario(logged_in, base_url, cliente_qa)
    page.submit()
    page.wait_toast("Agrega al menos un producto")
    assert api.facturas_de_cliente(cliente_qa["idCliente"]) == []


def test_f3_08_cantidad_igual_al_stock_deja_stock_en_cero(logged_in, base_url, api, cliente_qa, producto_qa, facturas_cleanup):
    page = abrir_formulario(logged_in, base_url, cliente_qa)
    page.add_line(producto_qa["idProducto"], 10)
    page.submit()
    page.detail_total()
    assert api.obtener_producto(producto_qa["idProducto"])["stock"] == 0