import pytest
from pages.signup_page import SignUpPage
from logger import get_logger
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


logger = get_logger("TestSignUpPage")


def test_tnc_link(driver):
    logger.info("[TC_LOGIN_001] Verify Terms and Condition link is clickable")

    page = SignUpPage(driver)
    page.go_to()
    page.click_tnc_link()

    assert "/terms-and-conditions" in driver.current_url.lower(), "Terms and Condition link did not navigate correctly."
    time.sleep(1)
    logger.info("[TC_LOGIN_001] ✅ Passed")


def test_signin_link(driver):
    logger.info("[TC_LOGIN_002] Verify Sign In link is clickable")

    page = SignUpPage(driver)
    page.go_to()
    page.click_signin_link()

    assert "/login" in driver.current_url.lower(), "Sign In link did not navigate correctly."
    time.sleep(1)
    logger.info("[TC_LOGIN_002] ✅ Passed")


def test_tnc_checkbox(driver):
    logger.info("[TC_LOGIN_003] Verify Sign Up button is disabled until T&C checkbox is selected")

    page = SignUpPage(driver)
    page.go_to()

    assert page.signup_button_disabled(), "Sign Up button should be disabled before T&C is checked"

    page.click_tnc_checkbox()
    
    WebDriverWait(driver, 10).until(lambda d: not page.signup_button_disabled())
    assert not page.signup_button_disabled(), "Sign Up button should be enabled after T&C is checked"

    logger.info("[TC_LOGIN_003] ✅ Passed")


def test_invalid_name_fields(driver):
    logger.info("[TC_LOGIN_004] Verify error messages for invalid first and last names")

    page = SignUpPage(driver)
    page.go_to()
    
    page.invalid_name_fields(12345, 12345)

    time.sleep(1)
    firstname_error = page.firstname_invalid_error()
    lastname_error = page.lastname_invalid_error()

    assert "First name must contain only alphabets and spaces" in firstname_error, "First name invalid error not shown"
    assert "Last name must contain only alphabets and spaces" in lastname_error, "Last name invalid error not shown"
    logger.info("[TC_LOGIN_004] ✅ Passed")
    time.sleep(1)


def test_name_fields_max_length(driver):
    logger.info("[TC_LOGIN_005] Verify error messages for names longer than 50 characters")

    page = SignUpPage(driver)
    page.go_to()

    long_name = "A" * 51
    page.invalid_name_fields(long_name, long_name)

    firstname_error = page.firstname_maxlen_error()
    lastname_error = page.lastname_maxlen_error()

    assert "String must contain at most 50 character(s)" in firstname_error, "First name max-length error not shown"
    assert "String must contain at most 50 character(s)" in lastname_error, "Last name max-length error not shown"

    logger.info("[TC_LOGIN_005] ✅ Passed")


def test_password_mismatch_error(driver):
    logger.info("[TC_LOGIN_006] Verify error message for passwords that do not match")

    page = SignUpPage(driver)
    page.go_to()

    page.fill_passwords("Qwerty@12345", "Invalid")

    error_text = page.password_mismatch_error()
    assert "Passwords do not match" in error_text, "Password mismatch error not shown"

    logger.info("[TC_LOGIN_006] ✅ Passed")


def test_password_lowercase_requirement(driver):
    logger.info("[TC_LOGIN_007] Verify password lowercase letter requirement")

    page = SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("password","PASSWORD123")  
    time.sleep(1)
    status = page.get_lowercase_requirement_status()
    assert status == "red", "Lowercase requirement should be red when no lowercase letters"
    
    page.enter_textfield_value("password","Password123") 
    time.sleep(1)
    status = page.get_lowercase_requirement_status()
    assert status == "green", "Lowercase requirement should be green when lowercase letters are present"

    logger.info("[TC_LOGIN_007] ✅ Passed")

def test_empty_fields_error(driver):
    logger.info("[TC_LOGIN_008] Verify empty or blank field Error")

    page=SignUpPage(driver);
    page.go_to()

    page.click_tnc_checkbox()
    page.click_signup_button()
    time.sleep(1)

    firstname_blank_err = page.firstname_blank_error()
    lastname_blank_err = page.lastname_blank_error()
    email_blank_err = page.email_blank_error()
    phonenumber_blank_err = page.phonenumber_blank_error()
    password_blank_err = page.confirmpassword_blank_error()
    time.sleep(3)

    assert "First name is required" in firstname_blank_err, "First name required error not displayed"
    assert "Last name is required" in lastname_blank_err, "Last name required error not displayed"
    assert "Email is required" in email_blank_err, "Email required error not displayed"
    assert "Phone number is required" in phonenumber_blank_err, "Phone number required error not displayed"
    assert "Confirm password is required" in password_blank_err, "Confirm password required error not displayed"

    logger.info("[TC_LOGIN_008] ✅ Passed")

def test_password_uppercase_requirement(driver):
    logger.info("[TC_LOGIN_009] Verify password uppercase letter requirement")
    page = SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("password","password")  
    time.sleep(2)
    status = page.get_uppercase_requirement_status()
    assert status == "red", "Uppercase requirement should be red when no uppercase letters"
    
    page.enter_textfield_value("password","Password") 
    time.sleep(2)
    status = page.get_uppercase_requirement_status()
    assert status == "green", "Uppercase requirement should be green when uppercase letters are present"

    logger.info("[TC_LOGIN_009] ✅ Passed")

def test_invalid_email_format(driver):
    logger.info("[TC_LOGIN_010] Verify invalid email format error message")

    page=SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("email","test@wrong")
    page.click_tnc_checkbox()
    page.click_signup_button()
    time.sleep(1)

    email_error = page.get_invalid_email_format_error()
    assert "Invalid email address" in email_error, "Invalid email format error not displayed"
    
    logger.info("[TC_LOGIN_010] ✅ Passed")

def test_invalid_phonenumber(driver):
    logger.info("[TC_LOGIN_011] Verify invalid phone number error message")

    page=SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("phone","1234567")
    time.sleep(1)
    page.click_tnc_checkbox()

    phonenumber_error = page.phonenumber_invalid_error()
    assert "Please enter a valid phone number" in phonenumber_error, "Invalid phone number error not displayed"
    
    logger.info("[TC_LOGIN_011] ✅ Passed")

def test_password_minlength(driver):
    logger.info("[TC_LOGIN_012] Verify password minimum allowed length")

    page=SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("password","Pass12")
    time.sleep(1)
    status = page.get_password_min_length_status()
    assert status == "red", "Password length requirement should be red when length is less than 8 characters"

    page.enter_textfield_value("password","Password1")
    time.sleep(1)
    status = page.get_password_min_length_status()
    assert status == "green", "Password length requirement should be green when length is greater than or equal to 8 characters"
    
    logger.info("[TC_LOGIN_012] ✅ Passed")

def test_password_number_requirement(driver):
    logger.info("[TC_LOGIN_013] Verify password contains atleast one number requirement")

    page=SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("password","Password")
    time.sleep(1)
    status = page.get_password_number_status()
    assert status == "red", "Password number requirement should be red when numbers are not present"

    page.enter_textfield_value("password","Password1")
    time.sleep(1)
    status = page.get_password_number_status()
    assert status == "green", "Password number requirement should be green when number is present"
    
    logger.info("[TC_LOGIN_013] ✅ Passed")

def test_password_special_character_requirement(driver):
    logger.info("[TC_LOGIN_014] Verify password contains atleast one special character requirement")

    page=SignUpPage(driver)
    page.go_to()

    page.enter_textfield_value("password","Password")
    time.sleep(1)
    status = page.get_password_specialcharacter_status()
    assert status == "red", "Password requirement should be red when special characters are not present"

    page.enter_textfield_value("password","Password@")
    time.sleep(1)
    status = page.get_password_specialcharacter_status()
    assert status == "green", "Password requirement should be green when special character is present"
    
    logger.info("[TC_LOGIN_014] ✅ Passed")



