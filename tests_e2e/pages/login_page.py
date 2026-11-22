from pages.base_page import BasePage


class LoginPage(BasePage):
    def open(self):
        self.driver.get(self.base_url)
        self.visible("login-usuario")
        return self

    def login(self, usuario, clave):
        self.type("login-usuario", usuario)
        self.type("login-clave", clave)
        self.click("login-submit")

    def _error_now(self):
        els = self.driver.find_elements(*self.loc("login-error"))
        return els[0].text if els else ""

    def wait_error_containing(self, text):
        self.wait().until(lambda d: text in self._error_now())

    def wait_dashboard(self):
        return self.visible("user-name")