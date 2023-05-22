from utime import sleep_ms
from server import initalize_app
from config import led


led.value(1)
sleep_ms(200)
led.value(0)

print("Successfully started pico...")

initalize_app()
