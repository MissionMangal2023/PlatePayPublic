import pytesseract
from PIL import Image
from ultralytics import YOLO
import re
from anpr_app.api.models import NumberPlate, Profile, Transaction
from rest_framework.response import Response
from prediction_app.api.serializers import ImageSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from dotenv import dotenv_values
import string
from datetime import datetime
from django.utils import timezone
from django.db.models import Avg, Sum
from random import randint
import pandas as pd
from kioskapp.api.views import SuspiciousActivity


config = dotenv_values()
yolo_model = YOLO(config["MODEL_PATH"])

# yolo_model = YOLO('C:/Users/afaan/Documents/GitHub/Mission2023/yolo/Colab/detect/train2/weights/best.pt')


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
    if re.search(r"[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}", number_plate):
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


def check_for_suspicious_activity(number_plate, confidence):
    if number_plate:
        fetch_number_plate = NumberPlate.objects.get(value=number_plate)
        user_name = Profile.objects.get(Django_user=fetch_number_plate.user)
        if fetch_number_plate:
            sus_activity_for_num_plate = SuspiciousActivity.objects.filter(
                numberplate=fetch_number_plate
            )
            if sus_activity_for_num_plate:
                return Response(
                    "Number Plate is not clean",
                    status=status.HTTP_424_FAILED_DEPENDENCY,
                )
            else:
                # return True
                correct_response = {
                    "numberplate": number_plate,
                    "confidence": round(float(confidence * 100), 2),
                    "message": f"Number Plate is clean",
                    "user_name": user_name.name,
                }
                return Response(correct_response, status=status.HTTP_200_OK)
        else:
            return Response(
                f"Number Plate: {number_plate} not found in database",
                status=status.HTTP_404_NOT_FOUND,
            )
    else:
        return Response("No number plate received", status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def new_number_plate(request):
    serializer = ImageSerializer(data=request.data)
    if serializer.is_valid():
        image_received = serializer.validated_data["photo"]
        constructed_image = Image.open(image_received)

        results = yolo_model.predict(constructed_image)
        for num_plate in results[0]:
            box_list = list(num_plate.boxes)
            for item in box_list:
                tensor_xyxy = (item.xyxy).tolist()[0]
                confidence_level = float((item.conf).tolist()[0])
                if confidence_level < 0.5:
                    continue
                cropped_image = constructed_image.crop(tensor_xyxy)
                allowedChar = list(string.ascii_uppercase) + [str(i) for i in range(10)]
                cropped_image = cropped_image.convert("L")
                # cropped_image.save("cropped_image.png")
                number_plate = str(
                    pytesseract.image_to_string(
                        cropped_image,
                        config="--psm 8 tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 tessedit_char_blacklist=abcdefghijklmnopqrstuvwxyz.|`~,\n",
                    )
                )
                result = number_plate
                for ch in number_plate:
                    if ch not in allowedChar:
                        result = result.replace(ch, "")
                number_plate = result
                # print(number_plate)
                if normal_number_plate_pattern_check(number_plate):
                    return Response(number_plate, status=status.HTTP_200_OK)
                elif bh_number_plate_pattern_check(number_plate):
                    return Response(number_plate, status=status.HTTP_200_OK)
                else:
                    number_plate_length = len(number_plate)
                    final_number_plate = None
                    if number_plate[2:4] == "BH":
                        final_number_plate = reconstruct_bh_number_plate(
                            number_plate, number_plate_length
                        )
                        if bh_number_plate_pattern_check(final_number_plate):
                            return Response(
                                final_number_plate, status=status.HTTP_200_OK
                            )
                    else:
                        final_number_plate = reconstruct_normal_number_plate(
                            number_plate, number_plate_length
                        )
                        if normal_number_plate_pattern_check(final_number_plate):
                            return Response(
                                final_number_plate, status=status.HTTP_200_OK
                            )
                    return Response(
                        {"error": "Number Plate Cannot Be Verified"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyUser(APIView):
    http_method_names = ["post"]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        number_plate = request.data.get("number_plate")
        print(number_plate)
        if number_plate:
            try:
                fetch_number_plate = NumberPlate.objects.get(value=number_plate)
            except NumberPlate.DoesNotExist:
                return Response(
                    f"Number Plate: {number_plate} not found in database",
                    status=status.HTTP_404_NOT_FOUND,
                )
            if fetch_number_plate.stolen_timing != datetime(
                2090, 1, 1, 0, 0, tzinfo=timezone.utc
            ):
                wrong_response = {
                    "message": f"Number Plate is stolen",
                    "user_name": user_name.name,
                }
                return Response(
                    wrong_response,
                    status=status.HTTP_424_FAILED_DEPENDENCY,
                )

            user_name = Profile.objects.get(Django_user=fetch_number_plate.user)

            sus_activity_for_num_plate = SuspiciousActivity.objects.filter(
                numberplate=fetch_number_plate
            )
            if sus_activity_for_num_plate:
                wrong_response = {
                    "message": f"Number Plate is not clean",
                    "user_name": user_name.name,
                }
                return Response(
                    wrong_response, status=status.HTTP_424_FAILED_DEPENDENCY
                )
            else:
                # return True
                correct_response = {
                    "numberplate": number_plate,
                    "message": f"Number Plate is clean",
                    "user_name": user_name.name,
                }
                print(correct_response)
                return Response(correct_response, status=status.HTTP_200_OK)
        else:
            return Response(
                "No number plate received", status=status.HTTP_400_BAD_REQUEST
            )


class TransactionPieChart(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get"]

    def get(self, request):
        number_plate_list = NumberPlate.objects.filter(user=request.user)
        if number_plate_list.count() == 0:
            return Response(
                {"error": "No number plates found"}, status=status.HTTP_404_NOT_FOUND
            )
        number_plate_transaction_list = Transaction.objects.filter(
            number_plate__in=number_plate_list
        )
        if number_plate_transaction_list.count() == 0:
            return Response(
                {"error": "No transactions found"}, status=status.HTTP_404_NOT_FOUND
            )
        total_transactions = number_plate_transaction_list.count()
        random_colour_list = []
        for i in range(number_plate_list.count()):
            random_colour_list.append("#%06X" % randint(0, 0xFFFFFF))
        output_list = []
        colour_count = 0
        for number_plate_l in number_plate_list:
            # print((user_transaction_list.filter(number_plate=number_plate_l)).count())
            output_list.append(
                {
                    "name": number_plate_l.value,
                    "transactions": round(
                        (
                            (
                                (
                                    number_plate_transaction_list.filter(
                                        number_plate=number_plate_l
                                    )
                                ).count()
                            )
                            / total_transactions
                        )
                        * 100,
                        2,
                    ),
                    "color": random_colour_list[colour_count],
                    "legendFontColor": "#7F7F7F",
                    "legendFontSize": 15,
                }
            )
            colour_count += 1
        return Response(output_list, status=status.HTTP_200_OK)


class LastWeekTransactionStatistics(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get"]

    def get(self, request):
        todays_date = timezone.now().date() + timezone.timedelta(days=1)
        last_week_date = todays_date - timezone.timedelta(days=6)
        user_transactions = Transaction.objects.filter(
            user=request.user, timing__range=[last_week_date, todays_date], status=2
        )
        print(user_transactions, last_week_date, todays_date)
        if user_transactions.count() == 0:
            return Response(
                {"error": "No transactions found"}, status=status.HTTP_404_NOT_FOUND
            )
        output_dict = {}
        output_dict["total_transactions"] = user_transactions.count()
        output_dict["total_amount"] = user_transactions.aggregate(
            total_amount=Sum("amount")
        )["total_amount"]
        output_dict["max_transaction"] = user_transactions.order_by("-amount")[0].amount
        output_dict["min_transaction"] = user_transactions.order_by("amount")[0].amount
        output_dict["average_transaction"] = round(
            user_transactions.aggregate(Avg("amount"))["amount__avg"], 2
        )
        return Response(output_dict, status=status.HTTP_200_OK)


class LastWeekBalance(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get"]

    def get(self, request):
        try:
            todays_user_balance = Profile.objects.get(Django_user=request.user).balance
        except Profile.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        todays_date = timezone.now().date() + timezone.timedelta(days=1)
        last_week_date = todays_date - timezone.timedelta(days=6)
        transaction_list = Transaction.objects.filter(
            user=request.user,
            timing__range=[last_week_date, todays_date],
            status=2,
        ).order_by("timing")
        date_list = pd.date_range(start=last_week_date, end=todays_date).tolist()
        date_list = reversed(date_list)
        date_list = [date.strftime("%Y-%m-%d") for date in date_list]
        day_list = []
        amount_list = []
        if transaction_list:
            for date in date_list:
                daily_transaction = transaction_list.filter(timing__date=date)
                total_amount = 0
                day_list.append(datetime.strptime(date, "%Y-%m-%d").strftime("%a"))
                for transaction in daily_transaction:
                    total_amount += transaction.amount
                todays_user_balance += total_amount
                amount_list.append(todays_user_balance)

        else:
            for date in date_list:
                day_list.append(datetime.strptime(date, "%Y-%m-%d").strftime("%a"))
                amount_list.append(todays_user_balance)
        day_list = reversed(day_list)
        amount_list = reversed(amount_list)
        return Response(
            {"days": day_list, "amounts": amount_list}, status=status.HTTP_200_OK
        )
