import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Supported device emulations
DEVICES = {
    "desktop": None,
    "iphone": "iPhone 12 Pro",
    "pixel": "Pixel 2",
    "samsung": "Galaxy S5"
}

def create_driver(device=None):
    options = webdriver.ChromeOptions()

    if device and DEVICES[device] is not None:
        # Enable mobile emulation
        mobile_emulation = {"deviceName": DEVICES[device]}
        options.add_experimental_option("mobileEmulation", mobile_emulation)
    else:
        # Maximize browser window for desktop
        options.add_argument("--start-maximized")

    # Headless mode and stability options
    #options.add_argument("--headless=new")
    #options.add_argument("--disable-gpu")
    #options.add_argument("--no-sandbox")
    #options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def pytest_addoption(parser):
    parser.addoption(
        "--device", action="store", default="desktop",
        help="Run tests on a specific device: desktop, iphone, pixel, samsung"
    )

@pytest.fixture(scope="session")
def driver(request):
    device = request.config.getoption("--device").lower()
    if device not in DEVICES:
        raise ValueError(f"Unsupported device: {device}")
    driver = create_driver(device)
    yield driver
    driver.quit()
