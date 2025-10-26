# pages/dashboard_page.py
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from pages.login_page import LoginPage


class DashboardPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "https://test-saayam.netlify.app/dashboard"
    
    def go_to(self):
        self.driver.get(self.url)
        time.sleep(5)

    def login_and_open(self):
        """Logs in and navigates to dashboard"""
        login_page = LoginPage(self.driver)
        login_page.go_to()
        login_page.login("saayamqa@yahoo.com","Saayamforall@123")
        WebDriverWait(self.driver, 20).until(
            EC.url_contains("/dashboard")
        )
        WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'My Requests')]"))
        )

    def is_loaded_cleanly(self):
        """Check dashboard loaded with no error banners or half-loaded sections"""
        banners = self.driver.find_elements(By.CSS_SELECTOR, ".error-banner")
        main_section = self.driver.find_element(By.CSS_SELECTOR, "#root > div > div")
        return len(banners) == 0 and main_section.is_displayed()
    
    def click_create_help(self):
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//a[@href='/request']"))
        )
        self.driver.find_element(By.XPATH,"//a[@href='/request']").click()
    
    def verify_table_data_loaded(self):
        rows = self.driver.find_elements(By.XPATH,"//table//tr")
        time.sleep(6)
        return len(rows) > 1
    
    def verify_error_message(self):
        """Get the error text"""
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//p[@class='text-red-600 mb-2']"))
        )
        error_message=self.driver.find_element(By.XPATH,"//p[@class='text-red-600 mb-2']").text
        time.sleep(5)
        if "add your address" in error_message:
            print("Error message present. Updating profile...")
            self.update_profile()
        else:
            print("Error message present but text does not match.")
    
    def update_profile(self):
        WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,"//a[text()='Edit profile']")))
        self.driver.find_element(By.XPATH,"//a[text()='Edit profile']").click()
        street_address=WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,"//input[@name='streetAddress']")))
        street_address.send_keys('United States')
        input_box = WebDriverWait(self.driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "div#react-select-4-placeholder + div input")))
        input_box.click()
        input_box.send_keys('Arizona')
        input_box.send_keys(Keys.ENTER)
        zipcode=WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,"//input[@name='zipCode']")))
        zipcode.send_keys('67829')
        WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,"//button[text()='Save']")))
        self.driver.find_element(By.XPATH,"//button[text()='Save']").click()
    
    def reset_to_dashboard(self):
        """Ensure dashboard is fully loaded and ready."""
        try:
            self.switch_to_dashboard()
            WebDriverWait(self.driver, 15).until(lambda d: self.is_loaded_cleanly())
        except Exception:
            self.go_to()
            WebDriverWait(self.driver, 15).until(lambda d: self.is_loaded_cleanly())
    
    def switch_to_dashboard(self):
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//button[text()='Dashboard']"))
        )
        self.driver.find_element(By.XPATH,"//button[text()='Dashboard']").click()
        

    def switch_to_myrequests(self):
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'My Requests')]"))
        )
        self.driver.find_element(By.XPATH,"//button[contains(text(),'My Requests')]").click()
    
    def switch_to_otherrequest_tab(self):
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'Others Requests')]"))
        )
        self.driver.find_element(By.XPATH,"//button[contains(text(),'Others Requests')]").click()
    
    def click_become_volunteer(self):
        """Method to click on become volunteer"""
        WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.XPATH,"//span[contains(text(),'Become a Volunteer')]"))
        )
        self.driver.find_element(By.XPATH, "//span[contains(text(),'Become a Volunteer')]").click()
    
    def get_table_headers(self):
        headers = self.driver.find_elements(By.XPATH, "//table//th")
        return [h.text.strip() for h in headers]

    def search_by_keyword(self, keyword):
        search_box = WebDriverWait(self.driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Search...']")))
        search_box.click()
        search_box.send_keys(keyword)

    def verify_filtered_results(self, keyword):
        rows = self.driver.find_elements(By.XPATH, "//table//tr/td[3]")
        return all(keyword.lower() in r.text.lower() for r in rows)
    
    def apply_filter(self, value):
        driver = self.driver
        WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR,
            "#root > div > div > main > div > div.border > div.mb-4.flex.gap-2.px-10 > div:nth-child(3) > div > button")))
        trigger=driver.find_element(
            By.CSS_SELECTOR,
            "#root > div > div > main > div > div.border > div.mb-4.flex.gap-2.px-10 > div:nth-child(3) > div > button"
        )
        trigger.click()
        time.sleep(0.5) 
        visible_elements = [
            elem for elem in driver.find_elements(By.XPATH, "//*")
            if elem.is_displayed() and elem.text.strip()
        ]
        option_to_click = None
        for elem in visible_elements:
            if elem.text.strip() == value:
                option_to_click = elem
                break

        if not option_to_click:
            raise Exception(f"Option '{value}' not found in dropdown!")

        option_to_click.click()
        try:
            if trigger.is_displayed():
                trigger.click()
        except:
            pass
    
    def set_rows_per_page(self, count):
        
        dropdown = WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,"//select[@id='rowsPerPage']")))
        dropdown.click()
        option = WebDriverWait(self.driver,15).until(EC.presence_of_element_located((By.XPATH,f"//option[@value='{count}']")))
        option.click()

    def get_visible_row_count(self):
        return len(self.driver.find_elements(By.XPATH, "//table//tr[position()>1]"))

    def get_current_page_number(self):
        return int(self.driver.find_element(By.XPATH, "//button[contains(@class,'hover:bg-blue-500')]").text)

    def go_to_next_page(self):
        self.driver.find_element(By.XPATH, "//button[contains(@class,'hover:bg-gray-500 false')]").click()

    def get_role_dropdown_options(self):
        self.driver.find_element(By.XPATH, "//div[@class='flex ml-auto gap-2 items-center']/select").click()
        options = self.driver.find_elements(By.XPATH, "//select[@class='text-blue-500 font-semibold underline italic py-2']/option")
        return [opt.text.strip() for opt in options]

    def verify_table_alignment(self):
        # basic check: all row columns visible (no truncation)
        rows = self.driver.find_elements(By.XPATH, "//table//tr")
        return all(r.is_displayed() for r in rows)

    def verify_responsive_layout(self):
        # Check if main elements visible after resize
        try:
            self.driver.find_element(By.TAG_NAME, "table").is_displayed()
            return True
        except:
            return False