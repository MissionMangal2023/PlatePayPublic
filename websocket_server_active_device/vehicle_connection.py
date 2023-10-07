import socket
import websockets
from cryptography.fernet import Fernet
import asyncio
import json
import serial
import pynmea2
from haversine import haversine, Unit
import os

# This code is present on raspbery pi installed inside the vehicle

sock = socket.socket()

def get_location():
    while True:
        port = "/dev/ttyAMA0"
        ser = serial.Serial(port, baudrate=9600)
        dataout = pynmea2.NMEAStreamReader()
        newdata = ser.readline().decode('latin-1')

        if newdata[0:6] == "$GNRMC": # Check format and change later
            locdata = pynmea2.parse(newdata)
            lat = locdata.latitude
            lon = locdata.longitude
            print(lat,lon)
            return lat, lon

def verify_location(lat, lon):
    device_location = (float(lat), float(lon))
    user_lat, user_lon = get_location()
    user_location = (float(user_lat), float(user_lon))
    print(device_location)
    print(user_location)
    distance = haversine(device_location, user_location, unit=Unit.METERS)
   
    if distance <= 100:
        return True
    return False
        

# Active device needs configuration before installation
async def vehicle():
    DECRYPTION_KEY = os.environ['DECRYPTION_KEY']
    ENCRYPTION_KEY = os.environ['ENCRYPTION_KEY']
    vehicle_number = "Vehicle Number Plate Value"  # This data is hard coded in the active device and is unique to each device
    # Edit IP and PORT to the websocket server IP and Port Number
    url_string = f"ws://IP:PORT/ws/receive/{vehicle_number}/"

    ws = await websockets.connect(url_string)
    decrypt_obj = Fernet(DECRYPTION_KEY)
    encrypt_obj = Fernet(ENCRYPTION_KEY)
    print("Connected")

    try:
        while True:
            message = await ws.recv()
            jsonData = json.loads(message)
            if jsonData['request'] == "extra_data":
                byte_data = bytes(jsonData['extra_info'], 'utf-8')
                message = decrypt_obj.decrypt(byte_data).decode('utf-8')
                outlet_id, outlet_latitude, outlet_longitude, vehicle_number_received = message.split('~|~')
                new_data = "Data was tampered"
                print(message)
                try:
                    outlet_id = int(outlet_id)
                except:
                    encrypted_data = encrypt_obj.encrypt(new_data.encode('utf-8'))
                    await ws.send(encrypted_data.decode('utf-8'))
                if vehicle_number_received != vehicle_number:
                    encrypted_data = encrypt_obj.encrypt(new_data.encode('utf-8'))
                    await ws.send(encrypted_data.decode('utf-8'))
                if type(outlet_id) == int and verify_location(outlet_latitude, outlet_longitude):
                    new_data = f"{outlet_id}~{outlet_latitude}~{outlet_longitude}~{vehicle_number}"
                    encrypted_data = encrypt_obj.encrypt(new_data.encode('utf-8'))
                    await ws.send(encrypted_data.decode('utf-8'))
                else:
                    encrypted_data = encrypt_obj.encrypt(new_data.encode('utf-8'))
                    await ws.send(encrypted_data.decode('utf-8'))
    except Exception as e:
        print(e)



def xmit_Loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(vehicle())       

while True:     # This should allow thr code to be in continuous loop allowing connection every time the device disconnects 
    xmit_Loop()