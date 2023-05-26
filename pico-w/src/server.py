import socket
from config import led
from decorators import Endpoint, ServerHandler
from pin import read_moisture_sensors, try_switch_relay
import json


def initalize_app():

    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print('listening on', addr)

    # Listen for connections
    try:
        Handler(s)
    except any as e:
        print("Closing server because of crash", e)
        s.close()


class Handler(ServerHandler):

    @Endpoint('/moisture/read', 'GET')
    def read_moisture():
        return read_moisture_sensors()

    @Endpoint('/relay/activate', 'POST')
    def activate_relay(self, **kwargs):
        body: dict = json.loads(str(kwargs.get('body')))
        return try_switch_relay(int(body.get('relay')), True)

    @Endpoint('/relay/deactivate', 'POST')
    def deactivate_relay(self, **kwargs):
        body: dict = json.loads(str(kwargs.get('body')))
        return try_switch_relay(int(body.get('relay')), False)
