# pages/signup_page.py
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


class SignUpPage:
    def __init__(self, driver):
        self.driver = driver
        self.url = "https://test-saayam.netlify.app/signup"

    def go_to(self):
        self.driver.get(self.url)

    def click_tnc_link(self):
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.text-blue-500.underline"))
        )
        self.driver.find_element(By.CSS_SELECTOR, "a.text-blue-500.underline").click()

    def click_signin_link(self):
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.mx-2.text-left.underline"))
        )
        self.driver.find_element(By.CSS_SELECTOR, "button.mx-2.text-left.underline").click()

    def signup_button_disabled(self) -> bool:
        button = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Sign up']"))
        )
        disabled_attr = button.get_attribute("disabled") is not None
        disabled_class = "cursor-not-allowed" in button.get_attribute("class")
        return disabled_attr or disabled_class

    def click_tnc_checkbox(self):
        checkbox = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='checkbox']"))
        )
        checkbox.click()

    def click_signup_button(self):
        signup_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((
                By.CSS_SELECTOR,
                "button.my-4.py-2.bg-blue-400.text-white.rounded-xl.hover\\:bg-blue-500"
            ))
        )
        signup_button.click()
        

    def invalid_name_fields(self, invalid_fn, invalid_ln):
        email_input = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "firstName"))
        )
        email_input.clear()
        email_input.send_keys(invalid_fn)

        password_input = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "lastName"))
        )
        password_input.clear()
        password_input.send_keys(invalid_ln)
        
        self.click_tnc_checkbox()
        self.click_signup_button()


    def firstname_invalid_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'First name must contain only alphabets and spaces')]").text
    
    def firstname_blank_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'First name is required')]").text

    def lastname_blank_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Last name is required')]").text
    
    def email_blank_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Email is required')]").text
    
    def phonenumber_blank_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Phone number is required')]").text
    
    def phonenumber_invalid_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Please enter a valid phone number')]").text
    
    def confirmpassword_blank_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Confirm password is required')]").text

    def lastname_invalid_error(self):
        return self.driver.find_element(By.XPATH, "//p[contains(text(),'Last name must contain only alphabets and spaces')]").text

    def firstname_maxlen_error(self):
        return WebDriverWait(self.driver, 5).until( EC.visibility_of_element_located(
                (By.XPATH, "//p[contains(text(),'String must contain at most 50 character(s)')]"))).text

    def lastname_maxlen_error(self):
        return WebDriverWait(self.driver, 5).until( EC.visibility_of_element_located(
                (By.XPATH, "//p[contains(text(),'String must contain at most 50 character(s)')]"))).text


    def fill_passwords(self, password, confirm_password):
        password_input = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "password"))  
        )
        password_input.clear()
        password_input.send_keys(password)

        confirm_input = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "confirmPassword"))  
        )
        confirm_input.clear()
        confirm_input.send_keys(confirm_password)

        self.click_tnc_checkbox()
        self.click_signup_button()


    def password_mismatch_error(self):
        return WebDriverWait(self.driver, 5).until( EC.visibility_of_element_located(
                (By.XPATH, "//p[contains(text(),'Passwords do not match')]"))).text


    def enter_textfield_value(self, Id, text_value):
        """Method to enter the text value in the text field"""
        text_input = WebDriverWait(self.driver, 10).until( EC.visibility_of_element_located((By.ID, Id)))
        text_input.send_keys(text_value)

    def get_password_requirement_status(self,element):
        """Return password requirement status"""
        classes = element.get_attribute("class")
        if "text-red-500" in classes:
            return "red"
        elif "text-green-500" in classes:
            return "green"
        return "unknown"

    def get_lowercase_requirement_status(self):
        """Return 'red' or 'green' depending on the lowercase requirement color."""
        elem = WebDriverWait(self.driver, 5).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(text(),'Password must contain at least 1 lowercase letter.')]")))
        return self.get_password_requirement_status(elem)
        
    
    def get_uppercase_requirement_status(self):
        """Return 'red' or 'green' depending on the uppercase requirement color."""
        elem = WebDriverWait(self.driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'uppercase')]")))
        return self.get_password_requirement_status(elem)
    
    def get_password_min_length_status(self):
        """Return 'red' or 'green' depending on the password length atleast 8 characters requirement color."""
        elem = WebDriverWait(self.driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'at least 8 characters.')]"))
        )
        return self.get_password_requirement_status(elem)

    def get_password_number_status(self):
        """Return 'red' or 'green' depending on the password contain atleast 1 number requirement color."""
        elem = WebDriverWait(self.driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'Password must contain at least 1 number.')]"))
        )
        return self.get_password_requirement_status(elem)

    def get_password_specialcharacter_status(self):
        """Return 'red' or 'green' depending on the password contain atleast 1 special character requirement color."""
        elem = WebDriverWait(self.driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'at least 1 special character.')]"))
        )
        return self.get_password_requirement_status(elem)
        
    def get_invalid_email_format_error(self):
        """Get the invalid email address error message."""
        return WebDriverWait(self.driver, 5).until( EC.visibility_of_element_located(
                (By.XPATH, "//p[contains(text(),'Invalid email address')]"))).text