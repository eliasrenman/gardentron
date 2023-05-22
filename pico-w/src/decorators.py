import socket
import json
from codes import codes


def respond(cl: socket.socket, status: int, response: dict | list):

    stringified = json.dumps(response, separators=(',', ':'))
    cl.send(
        f'HTTP/1.0 {status} {codes.get(status)}\r\nContent-type: text/json\r\n\r\n')
    cl.send(stringified)
    cl.close()


class HttpError(Exception):
    def __init__(self, status: int, message: dict | list):

        super().__init__(message)

        self.status = status
        self.message = message


class Endpoint:
    def __init__(self, path: str, method='GET'):
        if method not in ('GET', 'POST', 'PATCH', 'PUT', 'DELETE'):
            raise ValueError(
                'Valid values are GET, POST, PATCH, PUT', 'DELETE')
        self.method = method
        self.path = path

    def __call__(self, function):
        def wrapper(instance, *args, **kwargs):

            request: str = instance.__request  # type: ignore
            cl: socket.socket = instance.__cl  # type: ignore
            # TODO: Improve find checker here to be more precise when dealing with requests.
            if request.find(self.path) == -1 and self.path != '*' or request.find(self.method) == -1:
                return
            try:
                val = function(instance, *args, **kwargs)
                respond(cl, 200, val)
                return val
            except HttpError as e:
                respond(cl, e.status,
                        e.message)

        return wrapper


class ServerHandler(object):
    def __init__(self, s: socket.socket):
        not_found_endpoints = (self.__post_not_found,
                               self.__get_not_found, self.__patch_not_found, self.__put_not_found, self.__delete_not_found)

        while True:
            try:

                cl, addr = s.accept()
                print('client connected from', addr)
                request: bytes = cl.recv(1024)
                print(f"{request} \n")

                self.__request = request.decode('utf-8')
                self.__cl = cl
                method_list = dir(self.__class__)
                alreadyReturned = False
                for endpoint in method_list:

                    if endpoint.startswith('_') is True:
                        continue

                    func = getattr(self.__class__, endpoint)

                    if not callable(func):
                        continue

                    result = func(self)
                    if result:
                        alreadyReturned = True
                        break
                if (not alreadyReturned):
                    for endpoint in not_found_endpoints:
                        result = endpoint()
                        if result:
                            break

            except OSError as e:
                print(e)
                self.__cl.close()
                s.close()

                print('connection closed')
                break

    @Endpoint('*', 'POST')
    def __post_not_found(self):
        raise HttpError(404, {'status': 'Not Found'})

    @Endpoint('*', 'GET')
    def __get_not_found(self):
        raise HttpError(404, {'status': 'Not Found'})

    @Endpoint('*', 'PATCH')
    def __patch_not_found(self):
        raise HttpError(404, {'status': 'Not Found'})

    @Endpoint('*', 'PUT')
    def __put_not_found(self):
        raise HttpError(404, {'status': 'Not Found'})

    @Endpoint('*', 'DELETE')
    def __delete_not_found(self):
        raise HttpError(404, {'status': 'Not Found'})
