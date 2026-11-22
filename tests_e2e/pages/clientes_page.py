from pages.base_page import BasePage


class ClientesPage(BasePage):
    def open(self):
        self.go_to("clientes")
        self.visible("cliente-new-button")
        return self

    def open_new_form(self):
        self.click("cliente-new-button")
        self.visible("cliente-form")

    def fill(self, nombre=None, documento=None, email=None):
        if nombre is not None:
            self.type("cliente-nombre", nombre)
        if documento is not None:
            self.type("cliente-documento", str(documento))
        if email is not None:
            self.type("cliente-email", email)

    def submit(self):
        self.click("cliente-submit")

    def form_is_open(self):
        return self.is_present("cliente-form")

    def search(self, text):
        self.type("cliente-search", text)

    def row_names(self):
        return [e.text for e in self.driver.find_elements(*self.loc("cliente-nombre-cell"))]

    def wait_row(self, nombre):
        self.wait().until(lambda d: nombre in self.row_names())