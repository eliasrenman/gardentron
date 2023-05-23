import socket
from config import led
from decorators import Endpoint, ServerHandler


def initalize_app():

    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print('listening on', addr)

    # Listen for connections
    Handler(s)


class Handler(ServerHandler):

    @Endpoint('/light/on', 'POST')
    def light_on(self):
        print("led on")
        led.value(1)
        return {"led": "on"}

    @Endpoint('/light/off', 'POST')
    def light_off(self):
        print("led off")
        led.value(0)
        return {"led": "off"}
