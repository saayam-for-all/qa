# pages/signup_page.py
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from login_page import LoginPage


class DashboardPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "https://test-saayam.netlify.app/signup"
    
    def go_to(self):
        self.driver.get(self.url)

    def login_and_open(self, username, password):
        """Logs in and navigates to dashboard"""
        login_page = LoginPage(self.driver)
        login_page.go_to()
        login_page.login(username, password)

    def is_loaded_cleanly(self):
        """Check dashboard loaded with no error banners or half-loaded sections"""
        banners = self.driver.find_elements(By.CSS_SELECTOR, ".error-banner")
        main_section = self.driver.find_element(By.CSS_SELECTOR, "#main-dashboard")
        return len(banners) == 0 and main_section.is_displayed()