import pytest
from logger import get_logger
from logger import get_logger
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage


logger = get_logger("TestDashboardPage")

def test_dashboard_load(driver):
    logger.info("[TC_DASH_001] Verify dashboard page opens cleanly after login")
    page = DashboardPage(driver)
    page.login_and_open("saayamqa@yahoo.com","Saayamforall@123")
    time.sleep(5)
    assert "dashboard" in driver.current_url.lower(), "Dashboard link did not navigate correctly."
    assert page.is_loaded_cleanly(), "Dashboard did not load cleanly — found error banners or missing sections."

def test_create_help_request_button(driver):
    logger.info("[TC_DASH_002] Verify 'Create help request' button navigates correctly")
    page = DashboardPage(driver)
    page.login_and_open("saayamqa@yahoo.com", "Saayamforall@123")
    page.click_create_help()
    time.sleep(2)
    assert "request" in driver.current_url.lower(), "Create Help Request navigation failed."

def test_tabs_switching(driver):
    logger.info("[TC_DASH_004] Validate switching between 'My Requests' and 'Other Requests'")
    page = DashboardPage(driver)
    page.login_and_open("saayamqa@yahoo.com", "Saayamforall@123")
    time.sleep(5)
    page.switch_to_otherrequest_tab()
    assert page.verify_table_data_loaded(), "Table did not refresh after tab switch."
    time.sleep(5)
    page.switch_to_myrequests()
    assert page.verify_table_data_loaded(), "Table did not refresh after tab switch."
