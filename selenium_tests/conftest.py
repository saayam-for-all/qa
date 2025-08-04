import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

def pytest_addoption(parser):
    parser.addoption("--browser_name", action="store", default="chrome")

@pytest.fixture(scope="class")
def driver(request):
    browser_name = request.config.getoption("browser_name")

    if browser_name == "chrome":
        options = webdriver.ChromeOptions()
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
        print("Chrome Browser is opened")
    elif browser_name == "firefox":
        options = webdriver.FirefoxOptions()
        driver = webdriver.Firefox(executable_path=GeckoDriverManager().install(), options=options)
        print("Firefox Browser is opened")
    elif browser_name == "edge":
        options = webdriver.EdgeOptions()
        driver = webdriver.Edge(EdgeChromiumDriverManager().install(), options=options)
        print("Edge Browser is opened")
    else:
        raise Exception("No valid browser selected")

    driver.get("https://opensource-demo.orangehrmlive.com/")
    driver.maximize_window()
    driver.implicitly_wait(5)
    yield driver
    driver.quit()
