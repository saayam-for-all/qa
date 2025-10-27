import pytest
from logger import get_logger
from logger import get_logger
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from selenium import webdriver


logger = get_logger("TestDashboardPage")

@pytest.fixture
def driver():
    # Creates a new browser for each test
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture(autouse=True)
def login_before_each_test(driver):
    """
    This fixture will run before each test automatically.
    """
    page = DashboardPage(driver)
    page.login_and_open()
    page.reset_to_dashboard()
    return page

def test_dashboard_load(driver):
    logger.info("[TC_DASH_001] Verify dashboard page opens cleanly after login")
    page = DashboardPage(driver)
    page.login_and_open("saayamqa@yahoo.com","Saayamforall@123")
    time.sleep(5)
    assert "dashboard" in driver.current_url.lower(), "Dashboard link did not navigate correctly."
    assert page.is_loaded_cleanly(), "Dashboard did not load cleanly — found error banners or missing sections."

def test_create_help_request_button(login_before_each_test,driver):
    logger.info("[TC_DASH_002] Verify 'Create help request' button navigates correctly")
    page = login_before_each_test
    page.switch_to_dashboard()
    page.click_create_help()
    page.verify_error_message()
    driver.execute_script("window.scrollTo(0, 0);")
    page.switch_to_dashboard()
    page.click_create_help()
    assert "request" in driver.current_url.lower(), "Create Help Request navigation failed."

def test_become_volunteer_button(login_before_each_test,driver):
    logger.info("[TC_DASH_003] Verify 'Become a volunteer' button navigates correctly")
    page = login_before_each_test
    page.click_become_volunteer()
    page.verify_error_message()
    time.sleep(6)
    driver.execute_script("window.scrollTo(0, 0);")
    page.switch_to_dashboard()
    page.click_become_volunteer()
    assert "volunteer" in driver.current_url.lower(), "Volunteer signup navigation failed."

def test_tabs_switching(login_before_each_test,driver):
    logger.info("[TC_DASH_004] Validate switching between 'My Requests' and 'Other Requests'")
    page = login_before_each_test
    page.switch_to_otherrequest_tab()
    assert page.verify_table_data_loaded(), "Table did not refresh after tab switch."
    time.sleep(5)
    page.switch_to_myrequests()
    assert page.verify_table_data_loaded(), "Table did not refresh after tab switch."

def test_table_data_load(login_before_each_test, driver):
    logger.info("[TC_DASH_005] Verify request table loads correctly with valid data")
    page = login_before_each_test
    WebDriverWait(driver, 15).until(lambda d: page.verify_table_data_loaded())
    assert page.verify_table_data_loaded(), "No data rows loaded in table."

def test_table_columns_display(login_before_each_test, driver):
    logger.info("[TC_DASH_006] Verify all column headers are displayed correctly")
    page = login_before_each_test
    headers = page.get_table_headers()
    expected_headers = ["Id","Type", "Subject", "Creation Date↑", "Closed Date", "Status", "Category", "Priority", "Calamity"]
    for h in expected_headers:
        assert h in headers, f"Column '{h}' missing in table headers."

def test_search_functionality(login_before_each_test, driver):
    logger.info("[TC_DASH_007] Validate search filter works correctly by Subject")
    page = login_before_each_test
    page.search_by_keyword("clean")
    time.sleep(2)
    assert page.verify_filtered_results("clean"), "Search results do not match keyword."

def test_filter_and_search_combination(login_before_each_test, driver):
    logger.info("[TC_DASH_008] Verify filter by dropdown and search combination works")
    page = login_before_each_test
    page.apply_filter("All Categories")
    time.sleep(7)
    page.apply_filter("Health")
    time.sleep(7)
    page.search_by_keyword("Medicine")
    WebDriverWait(driver, 10).until(lambda d: page.verify_filtered_results("Medicine"))
    assert page.verify_filtered_results("Medicine"), "Combined filter + search failed."

def test_pagination_row_count(login_before_each_test, driver):
    logger.info("[TC_DASH_009] Validate pagination adjusts table rows (5,10,20)")
    page = login_before_each_test
    for rows in [5, 10, 20]:
        page.set_rows_per_page(rows)
        visible_rows = page.get_visible_row_count()
        assert visible_rows <= rows, f"Pagination failed for {rows} rows."

def test_table_page_navigation(login_before_each_test, driver):
    logger.info("[TC_DASH_010] Verify page navigation works in the table")
    page = login_before_each_test
    current = page.get_current_page_number()
    page.go_to_next_page()
    new_page = page.get_current_page_number()
    assert new_page == current + 1, "Next page navigation failed."

def test_role_based_access_dropdown(login_before_each_test, driver):
    logger.info("[TC_DASH_011] Verify role-based access dropdown options")
    page = login_before_each_test
    roles = page.get_role_dropdown_options()
    expected = ["Super Admin Dashboard", "Admin Dashboard", "Steward Dashboard", "Volunteer Dashboard", "Beneficiary Dashboard"]
    for r in expected:
        assert r in roles, f"Role '{r}' missing from dropdown options."

def test_ui_ux_consistency(login_before_each_test, driver):
    logger.info("[TC_DASH_012] Validate UI consistency and alignment across table elements")
    page = login_before_each_test
    assert page.verify_table_alignment(), "UI misalignment or truncation found."

def test_responsive_design(login_before_each_test, driver):
    logger.info("[TC_DASH_013] Validate responsive design across devices")
    page = login_before_each_test
    viewports = [(1920,1080), (1024,768), (414,896)]  # desktop, tablet, mobile
    for w,h in viewports:
        driver.set_window_size(w,h)
        assert page.verify_responsive_layout(), f"Layout broken on viewport {w}x{h}"

