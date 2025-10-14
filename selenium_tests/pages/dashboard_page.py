# pages/signup_page.py
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from pages.login_page import LoginPage


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
        main_section = self.driver.find_element(By.CSS_SELECTOR, "#root > div > div")
        return len(banners) == 0 and main_section.is_displayed()
    
    def click_create_help(self):
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[contains(text(),'Create Help')]"))
        )
        self.driver.find_element(By.XPATH,"//span[contains(text(),'Create Help')]").click()
    
    def verify_table_data_loaded(self):
        rows = self.driver.find_elements(By.XPATH,"//table//tr")
        return len(rows) > 1
    
    def switch_to_myrequests(self):
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'My Requests')]"))
        )
        self.driver.find_element(By.XPATH,"//button[contains(text(),'My Requests')]").click()
    
    def switch_to_otherrequest_tab(self):
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'Others Requests')]"))
        )
        self.driver.find_element(By.XPATH,"//button[contains(text(),'Others Requests')]").click()