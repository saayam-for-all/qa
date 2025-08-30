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

    page.enter_password("PASSWORD123")  
    time.sleep(1)
    status = page.get_lowercase_requirement_status()
    assert status == "red", "Lowercase requirement should be red when no lowercase letters"
    
    page.enter_password("Password123") 
    time.sleep(1)
    status = page.get_lowercase_requirement_status()
    assert status == "green", "Lowercase requirement should be green when lowercase letters are present"

    logger.info("[TC_LOGIN_007] ✅ Passed")
