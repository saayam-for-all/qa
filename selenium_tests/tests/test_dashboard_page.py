import pytest
from logger import get_logger
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage


logger = get_logger("TestDashboardPage")

def test_dashboard_load(driver):
    logger.info("[TC_LOGIN_001] Verify dashboard page opens cleanly after login")
    page = DashboardPage(driver)
    page.login_and_open("","")
    assert "dashboard" in driver.current_url.lower(), "Dashboard link did not navigate correctly."


