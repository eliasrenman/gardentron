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

            method, endpoint = split_request(request)
            if endpoint != self.path and self.path != '*' or method != self.method:
                return
            try:
                body = get_body(request)

                if isinstance(body, str) and body != "":
                    kwargs = dict(**kwargs, body=body)

                val = function(instance, *args, **kwargs)
                respond(cl, 200, val)
                return True
            except HttpError as e:
                respond(cl, e.status,
                        e.message)
                return True
            except Exception as e:
                print("Some other unkown error occured:", e)
                respond(cl, 500, {"status": "error", "message": e})
                return True

        return wrapper


"""
Please note that this only supports content-type 'application/json'
"""


def get_body(request: str):
    req = request.split("\r\n")
    content_length_index = 100
    out = ""
    for index in range(len(req)):
        item = req[index]

        if item.find("Content-Type") != -1:
            if not item.find("application/json"):
                return

        if item.find("Content-Length") != -1:
            content_length_index = index

        if index > content_length_index:
            out += item
    out = out.replace("\n", "")
    out = out.replace("\t", "")

    if out != "":
        return out


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
                for method in method_list:

                    if method.startswith('_') is True:
                        continue

                    func = getattr(self.__class__, method)

                    if not callable(func):
                        continue
                    if not is_decorated(func):
                        continue

                    result = func(self)
                    if result:
                        alreadyReturned = True
                        break
                if (not alreadyReturned):
                    for method in not_found_endpoints:
                        result = method()
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


def split_request(req: str):
    return req.split(' ')[:2]


def is_decorated(func):
    return hasattr(func, '__wrapped__') or func.__name__ not in globals()
