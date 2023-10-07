import json
from channels.generic.websocket import WebsocketConsumer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from dotenv import dotenv_values
import numpy as np
import string
import re
from ultralytics import YOLO
from anpr_app.api.models import NumberPlate
from kioskapp.api.serializers import SuspiciousActivity
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


config = dotenv_values()
yolo_model = YOLO(config["MODEL_PATH"])


class DataConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["outlet_id"]
        self.room_group_name = "anpr_%s" % self.room_name
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()
        self.send(text_data="Connected to websocket")

    def disconnect(self, code):
        pass

    def send_text_data(self, event):
        text_data = event["text_data"]
        print(text_data)
        self.send(text_data=json.dumps(text_data))


def send_messages(text_data, outlet_info):
    print(outlet_info)
    channel_layer = get_channel_layer()
    nameURL = "anpr_" + str(outlet_info)
    print(nameURL)
    async_to_sync(channel_layer.group_send)(
        nameURL, {"type": "send_text_data", "text_data": text_data}
    )


def char_to_no(item):
    if item == 0:
        return "O"
    elif item == 1:
        return "I"
    elif item == 2:
        return "Z"
    elif item == 3:
        return "S"
    elif item == 4:
        return "A"
    elif item == 5:
        return "S"
    elif item == 6:
        return "G"
    elif item == 7:
        return "T"
    elif item == 8:
        return "B"
    elif item == 9:
        return "Q"


def no_to_char(item):
    if item == "O":
        return 0
    elif item == "I":
        return 1
    elif item == "Z":
        return 2
    elif item == "S":
        return 3
    elif item == "A":
        return 4
    elif item == "S":
        return 5
    elif item == "G":
        return 6
    elif item == "T":
        return 7
    elif item == "B":
        return 8
    elif item == "Q":
        return 9
    elif item == "E":
        return 8


def normal_number_plate_pattern_check(number_plate):
    if re.search(r"[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}", number_plate):
        return True
    return False


def bh_number_plate_pattern_check(number_plate):
    if re.search(r"[0-9]{2}[A-Z]{2}[0-9]{4}[A-Z]{1}", number_plate):
        return True
    return False


def reconstruct_normal_number_plate(number_plate, number_plate_length):
    number_plate = list(number_plate)
    if number_plate_length == 9:
        for i in range(number_plate_length):
            if i == 0 or i == 1 or i == 4:
                if number_plate[i].isdigit():
                    number_plate[i] = char_to_no(int(number_plate[i]))
            if i == 2 or i == 3 or i == 5 or i == 6 or i == 7 or i == 8:
                if number_plate[i].isalpha():
                    number_plate[i] = no_to_char(number_plate[i])
    elif number_plate_length == 10:
        for i in range(number_plate_length):
            if i == 0 or i == 1 or i == 4 or i == 5:
                if number_plate[i].isdigit():
                    number_plate[i] = char_to_no(int(number_plate[i]))
            if i == 2 or i == 3 or i == 6 or i == 7 or i == 8 or i == 9:
                if number_plate[i].isalpha():
                    number_plate[i] = no_to_char(number_plate[i])

    number_plate_str = ""
    for i in number_plate:
        number_plate_str += str(i)

    return number_plate_str


def reconstruct_bh_number_plate(number_plate, number_plate_length):
    # Index 2, 3 not checked as this function is invoked only if its a BH number plate
    number_plate = list(number_plate)
    for i in range(number_plate_length):
        if i == 0 or i == 1 or i == 4 or i == 5 or i == 6 or i == 7:
            if number_plate[i].isalpha():
                number_plate[i] = no_to_char(number_plate[i])
        if i == 8:
            if number_plate[i].isdigit():
                number_plate[i] = char_to_no(int(number_plate[i]))
    number_plate_str = ""
    for i in number_plate:
        number_plate_str += str(i)
    return number_plate_str


def check_for_suspicious_activity(number_plate):
    fetch_number_plate = NumberPlate.objects.get(value=number_plate)
    if fetch_number_plate:
        sus_activity_for_num_plate = SuspiciousActivity.objects.filter(
            numberplate=fetch_number_plate, case_resolved=False
        )
        if sus_activity_for_num_plate:
            return True
        return False
    else:
        return True


@api_view(
    [
        "POST",
    ]
)
def receive_number_plate(
    request,
):  # Unconventional code doesn't return response    [ Code not tested yet ]
    try:
        number_plate = request.data["number_plate"]
        return Response(status=status.HTTP_204_NO_CONTENT)
    except:
        print("Error Occured")
    finally:
        allowedChar = list(string.ascii_uppercase) + [str(i) for i in range(10)]
        result = number_plate
        for ch in number_plate:
            if ch not in allowedChar:
                result = result.replace(ch, "")
        number_plate = result
        print(number_plate)
        if normal_number_plate_pattern_check(number_plate):
            print("Normal Number Plate")
            if check_for_suspicious_activity(number_plate):
                send_messages(
                    text_data={"error": "Number Plate Not In DB or Suspicious"},
                    outlet_info=0,
                )
            else:
                send_messages(
                    text_data={"number_plate": f"{number_plate}"}, outlet_info=0
                )
                print("Above Function Executed")

        elif bh_number_plate_pattern_check(number_plate):
            print("BH Number Plate")
            if check_for_suspicious_activity(number_plate):
                send_messages(
                    text_data={"error": "Number Plate Not In DB or Suspicious"},
                    outlet_info=0,
                )
            else:
                send_messages(
                    text_data={"number_plate": f"{number_plate}"}, outlet_info=0
                )
        else:
            print("Constructing")
            number_plate_length = len(number_plate)
            final_number_plate = None
            if number_plate[2:4] == "BH":
                final_number_plate = reconstruct_bh_number_plate(
                    number_plate, number_plate_length
                )
                if bh_number_plate_pattern_check(final_number_plate):
                    if check_for_suspicious_activity(final_number_plate):
                        send_messages(
                            text_data={"error": "Number Plate Not In DB or Suspicious"},
                            outlet_info=0,
                        )
                    else:
                        send_messages(
                            text_data={"number_plate": f"{number_plate}"}, outlet_info=0
                        )
            else:
                final_number_plate = reconstruct_normal_number_plate(
                    number_plate, number_plate_length
                )
                if normal_number_plate_pattern_check(final_number_plate):
                    if check_for_suspicious_activity(final_number_plate):
                        send_messages(
                            text_data={"error": "Number Plate Not In DB or Suspicious"},
                            outlet_info=0,
                        )
                    else:
                        send_messages(
                            text_data={"number_plate": f"{number_plate}"}, outlet_info=0
                        )
