from typing import Sized
from machine import Pin, ADC
from micropython import const

from decorators import HttpError


relays = [
    [Pin(0, mode=Pin.OUT), False],
    [Pin(1, mode=Pin.OUT), False],
    [Pin(2, mode=Pin.OUT), False]
]

moisture_sensors = const([
    ADC(Pin(28)),
    ADC(Pin(27)),
    ADC(Pin(26))
])


min_moisture = const(0)
max_moisture = const(65535)


def read_moisture_sensors():
    try:
        data = map(read_moisture_sensor, moisture_sensors)
        return {
            "status": "success",
            "message": "Successfully read moisture sensors",
            "data": data
        }

    except:
        return HttpError(400, {"status": "error", "message": "Something went wrong!"})


def read_moisture_sensor(sensor: ADC):

    # Reads from sensor with the help of this tutorial: https://www.diyprojectslab.com/raspberry-pi-pico-with-moisture-sensor/
    return (max_moisture-sensor.read_u16())*100/(max_moisture-min_moisture)


def assert_index(array: Sized, index: int):
    return not (len(array) >= index or index < 0)


def try_switch_relay(relay_index: int, value: bool):
    if assert_index(relays, relay_index):
        raise HttpError(
            400, {"status": "error", "message": "Invalid Relay index"})

    for index in range(len(relays)):
        relay, state = relays[index]
        if index != relay_index:
            if state:
                raise HttpError(
                    400, {"status": "error", "message": f"Another Relay is already active, Please turn of {index} first"})
            # Continue if the index is incorrect
            continue
        state = value

        # Update the relay state
        relays[index][1] = state
        # Then set the pin
        relays[index][0].value()

    return {"status": "success", "message": "Successfully turned on relay", "data": map(lambda x: x[1], relays)}
