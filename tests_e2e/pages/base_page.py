from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

TIMEOUT = 10


class BasePage:
    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url

    @staticmethod
    def loc(testid):
        return (By.CSS_SELECTOR, f'[data-testid="{testid}"]')

    def wait(self, timeout=TIMEOUT):
        return WebDriverWait(self.driver, timeout, ignored_exceptions=(StaleElementReferenceException,))

    def visible(self, testid):
        return self.wait().until(EC.visibility_of_element_located(self.loc(testid)))

    def is_present(self, testid):
        return len(self.driver.find_elements(*self.loc(testid))) > 0

    def click(self, testid):
        self.wait().until(EC.element_to_be_clickable(self.loc(testid))).click()

    def type(self, testid, text):
        el = self.visible(testid)
        el.click()
        el.send_keys(Keys.CONTROL, "a")
        el.send_keys(text if text else Keys.BACKSPACE)

    def select_value(self, testid, value):
        el = self.visible(testid)
        self.wait().until(lambda d: any(o.get_attribute("value") == str(value) for o in Select(el).options))
        Select(el).select_by_value(str(value))

    def validity(self, testid):
        return self.driver.execute_script(
            "const e = arguments[0];"
            "return {valueMissing: e.validity.valueMissing, typeMismatch: e.validity.typeMismatch, valid: e.validity.valid};",
            self.visible(testid),
        )

    def toast_texts(self):
        return [t.text for t in self.driver.find_elements(*self.loc("toast"))]

    def toast_contains(self, text):
        return any(text in t for t in self.toast_texts())

    def wait_toast(self, text):
        self.wait().until(lambda d: self.toast_contains(text))

    def go_to(self, section):
        self.click(f"nav-{section}")