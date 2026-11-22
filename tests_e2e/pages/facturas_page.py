from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class FacturasPage(BasePage):
    def open(self):
        self.go_to("facturas")
        self.visible("factura-new-button")
        return self

    def open_new_form(self):
        self.click("factura-new-button")
        self.visible("factura-form")
        self.wait().until(
            lambda d: d.find_element(*self.loc("factura-form")).get_attribute("data-catalog-ready") == "true"
        )

    def select_cliente(self, id_cliente):
        self.select_value("factura-cliente", id_cliente)

    def add_line(self, id_producto, cantidad):
        index = len(self.driver.find_elements(By.CSS_SELECTOR, '[data-testid^="factura-line-producto-"]'))
        self.click("factura-add-line")
        self.select_value(f"factura-line-producto-{index}", id_producto)
        self.type(f"factura-line-cantidad-{index}", str(cantidad))

    def set_descuento(self, porcentaje):
        self.type("factura-descuento", str(porcentaje))

    def preview_total(self):
        return float(self.visible("factura-preview-total").get_attribute("data-value"))

    def submit(self):
        self.click("factura-submit")

    def detail_total(self):
        return float(self.visible("factura-detail-total").get_attribute("data-value"))

    def detail_visible(self):
        return self.is_present("factura-detail-total")