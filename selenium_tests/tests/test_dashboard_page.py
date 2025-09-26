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
    logger.info("[TC_DASH_001] Verify dashboard page opens cleanly after login")
    page = DashboardPage(driver)
    page.login_and_open("thrilokvarunreddy1@gmail.com","Sweepingblade13@")

    WebDriverWait(driver, 10).until(
        EC.url_contains("dashboard")
    )

    assert "dashboard" in driver.current_url.lower(), "Dashboard link did not navigate correctly."


