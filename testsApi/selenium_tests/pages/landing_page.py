from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


class LandingPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "http://localhost:5173/"

    def go_to(self):
        self.driver.get(self.url)

    def get_main_heading(self):
        # This finds <h1> with exact text
        return self.driver.find_element(
            By.XPATH,
            "//h1[contains(text(), 'Need help? Here to help?')]"
        ).text
        WebDriverWait(self.driver, 10)
    
    def get_role_titles(self):
        return [e.text for e in self.driver.find_elements(By.TAG_NAME, "h3")]

    def get_video_frame(self):
        return self.driver.find_element(By.TAG_NAME, "iframe")

    def our_mission(self):
        self.driver.find_element(By.XPATH, "/html/body/div/div/footer/footer/div/div[1]/div/nav/a[2]").click()

    
