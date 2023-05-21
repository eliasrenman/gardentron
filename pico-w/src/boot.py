import network
import time
from config import ssid, password

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

max_wait = 10
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    print('Attempting to connect to Wifi...')
    time.sleep(1)

if wlan.status() != 3:
    raise RuntimeError('Wifi connection failed')
else:
    print('Wifi connection established')
    status = wlan.ifconfig()
    print('ip:' + status[0])
