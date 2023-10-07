import os
import json
from channels.generic.websocket import WebsocketConsumer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from cryptography.fernet import Fernet
from haversine import haversine, Unit

vehicle_data = None


class DataConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['vehicle_number']
        self.room_group_name = 'anpr_%s' % self.room_name
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        # self.send(text_data="Connected to websocket")
    
    def receive(self, text_data):
        global vehicle_data
        vehicle_data = text_data
        # vehicle_data = data_list['extra_info']
        


    def disconnect(self, code):
        pass

    def send_text_data(self, event):
        text_data = event['text_data']
        self.send(text_data=json.dumps(text_data))
    
def send_messages(text_data, vehicle_number):
    print("Sent")
    channel_layer = get_channel_layer()
    nameURL = 'anpr_' + str(vehicle_number)
    async_to_sync(channel_layer.group_send)(
        nameURL,
        {
            "type": "send_text_data",
            "text_data": text_data
        }
    )


def verify_location(vehicle_lat, vehicle_lon, device_lat, device_lon):
    vehicle_location = (vehicle_lat, vehicle_lon)
    device_location = (device_lat, device_lon)
    distance = haversine(device_location, vehicle_location, unit=Unit.METERS)
    if distance <= 100:
        return True
    return False

class ReceiveLocationRequest(APIView):
    http_method_names = ['post']
    ENCRYPTION_KEY = os.environ['ENCRYPTION_KEY']
    DECRYPTION_KEY = os.environ['DECRYPTION_KEY']

    def post(self, request):
        vehicle_number = request.data['vehicle_number']
        outlet_id = request.data['outlet_id']
        outlet_latitude = request.data['outlet_latitude']
        outlet_longitude = request.data['outlet_longitude']
        try:
            outlet_id = int(outlet_id)
        except:
            return Response({'error': "Data was tampered"}, status=status.HTTP_406_NOT_ACCEPTABLE)


        # Edit this from here
        data_string = f"{outlet_id}~|~{outlet_latitude}~|~{outlet_longitude}~|~{vehicle_number}"
        encrypt_obj = Fernet(self.ENCRYPTION_KEY)
        encrypted_data = encrypt_obj.encrypt(data_string.encode('utf-8'))
        
        # Send location request to active device
        send_messages(text_data={'request': 'extra_data', 'extra_info': encrypted_data.decode('utf-8')}, vehicle_number=vehicle_number)
        global vehicle_data
        while vehicle_data is None:
            pass
        # Add timeout

        decrypt_obj = Fernet(self.DECRYPTION_KEY)
        byte_data = bytes(vehicle_data, 'utf-8')
        vehicle_data = decrypt_obj.decrypt(byte_data).decode('utf-8')
        if vehicle_data == "Data was tampered" and type(vehicle_data) == str:
            return Response({'message': "Data was tampered"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        outlet_id_1, vehicle_latitude_1, vehicle_longitude_1, vehicle_number_1 = vehicle_data.split('~')
        try:
            outlet_id_1 = int(outlet_id_1)
        except:
            return Response({'error': "Data was tampered"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        if type(outlet_id_1) == int:
            if outlet_id_1 == outlet_id and vehicle_number == vehicle_number_1 and type(vehicle_number_1) == str:
                return Response({'message': "Data is correct"}, status=status.HTTP_200_OK)
            else:
                return Response({'message': "Data was tampered"}, status=status.HTTP_406_NOT_ACCEPTABLE)    
        vehicle_data = None
        return Response({'message': "Lot of time taken"}, status=status.HTTP_408_REQUEST_TIMEOUT)