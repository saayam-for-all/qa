# conftest.py
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

# Dispositivos soportados solo para Chrome
DEVICES = {
    "desktop": None,
    "iphone": "iPhone 12 Pro",
    "pixel": "Pixel 2",
    "samsung": "Galaxy S5",
}

def pytest_addoption(parser):
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser: chrome | firefox | edge",
    )
    parser.addoption(
        "--device",
        action="store",
        default="desktop",
        help="Device for mobile emulation (Chrome only): desktop | iphone | pixel | samsung",
    )

@pytest.fixture(scope="session")
def driver(request):
    browser = request.config.getoption("--browser").lower()
    device = request.config.getoption("--device").lower()

    if browser == "chrome":
        options = webdriver.ChromeOptions()

        # Emulación móvil solo si no es 'desktop'
        if device not in DEVICES:
            raise ValueError(f"Unsupported device: {device}")
        if DEVICES[device]:
            options.add_experimental_option(
                "mobileEmulation", {"deviceName": DEVICES[device]}
            )
        else:
            options.add_argument("--start-maximized")

        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        service = ChromeService(ChromeDriverManager().install())
        drv = webdriver.Chrome(service=service, options=options)

    elif browser == "firefox":
        options = webdriver.FirefoxOptions()
        options.add_argument("--headless")
        service = FirefoxService(GeckoDriverManager().install(), log_path="-")
        drv = webdriver.Firefox(service=service, options=options)

    elif browser == "edge":
        options = webdriver.EdgeOptions()
        options.add_argument("--headless")
        service = EdgeService(EdgeChromiumDriverManager().install())
        drv = webdriver.Edge(service=service, options=options)

    else:
        raise ValueError(f"❌ Browser '{browser}' not supported!")

    yield drv
    drv.quit()
