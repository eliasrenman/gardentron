import socket
from utime import sleep_ms
from machine import Pin
from config import ssid, password

led = Pin("LED", Pin.OUT)

led.value(1)
sleep_ms(200)
led.value(0)

print("Successfully started pico...")

addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

s = socket.socket()
s.bind(addr)
s.listen(1)

print('listening on', addr)


def respond(cl, status, response):
    cl.send(f'HTTP/1.0 {status} OK\r\nContent-type: text/html\r\n\r\n')
    cl.send(response)
    cl.close()


# Listen for connections
while True:
    try:
        cl, addr = s.accept()
        print('client connected from', addr)
        request = cl.recv(1024)
        print(request)

        request = str(request)
        led_on = request.find('/light/on')
        led_off = request.find('/light/off')
        print('led on = ' + str(led_on))
        print('led off = ' + str(led_off))

        if led_on == 6:
            print("led on")
            led.value(1)
            respond(cl, 200, '{"led": "on"}')

        if led_off == 6:
            print("led off")
            led.value(0)
            respond(cl, 200, '{"led": "off"}')

    except OSError as e:
        cl.close()
        s.close()

        print('connection closed')
