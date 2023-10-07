from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import SuspiciousActivitySerializer
from .models import SuspiciousActivity
from anpr_app.api.models import Profile, NumberPlate, Outlet, Transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from anpr_app.api.serializers import (
    TransactionSerializer,
    OutletSerializer,
)
from .serializers import TransactionCreateSerializer
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum
from django.contrib.auth.models import User
import requests
from datetime import datetime

# Create your views here.


def location_confirmation(
    numberplate, device_object_id, outlet_latitude, outlet_longitude
):
    data = {
        "vehicle_number": numberplate,
        "outlet_id": device_object_id,
        "outlet_latitude": outlet_latitude,
        "outlet_longitude": outlet_longitude,
    }
    try:
        response = requests.post(
            # Change the below ip address and port number according to the active device websocket server
            "http://192.168.1.11:8080/sendlocreq/", data=data, timeout=10
        )
        if response.status_code == 200:
            return True
    except requests.exceptions.Timeout:
        return False


class SuspiciousActivityUser(APIView):
    serializer_class = SuspiciousActivitySerializer
    queryset = SuspiciousActivity.objects.all()
    http_method_names = ["post"]

    def post(self, request, number_plate):
        reporter_profile = Profile.objects.get(Django_user=request.user)
        try:
            number_plate_object = NumberPlate.objects.get(value=number_plate)
            sus_activity_serializer = SuspiciousActivitySerializer(data=request.data)
            if sus_activity_serializer.is_valid():
                created_sus_activity = sus_activity_serializer.save(
                    numberplate=number_plate_object, reporter_profile=reporter_profile
                )
                # Return the newly created object
                return Response(
                    SuspiciousActivitySerializer(created_sus_activity).data,
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    sus_activity_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
        except NumberPlate.DoesNotExist:
            return Response(
                {"error": "NumberPlate not found."}, status=status.HTTP_404_NOT_FOUND
            )


class SuspiciousActivityOutlet(APIView):
    queryset = SuspiciousActivity.objects.all()
    serializer_class = SuspiciousActivitySerializer
    http_method_names = ["post"]

    def post(self, request, number_plate, device_id):
        reporter_outlet = Outlet.objects.get(device_id=device_id)
        try:
            number_plate_object = NumberPlate.objects.get(value=number_plate)
            sus_activity_serializer = SuspiciousActivitySerializer(data=request.data)
            if sus_activity_serializer.is_valid():
                created_sus_activity = sus_activity_serializer.save(
                    numberplate=number_plate_object, reporter_outlet=reporter_outlet
                )
                # Return the newly created object
                return Response(
                    SuspiciousActivitySerializer(created_sus_activity).data,
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    sus_activity_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
        except NumberPlate.DoesNotExist:
            return Response(
                {"error": "NumberPlate not found."}, status=status.HTTP_404_NOT_FOUND
            )


class SuspiciousActivityViewSet(viewsets.ModelViewSet):  # Resolve AnonymousUser issue
    serializer_class = SuspiciousActivitySerializer
    queryset = SuspiciousActivity.objects.all()

    def get_queryset(self):
        try:
            profile_object = Profile.objects.get(Django_user=self.request.user)
            suspicious_activities = SuspiciousActivity.objects.filter(
                reporter_profile=profile_object
            )
            if suspicious_activities:
                return suspicious_activities
            return Response(
                {"error": "No suspicious activities found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )


class NewTransaction(APIView):  # Code without mode of payment logic
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all()
    http_method_names = ["post"]
    serializer_class = TransactionSerializer

    def post(self, request):
        try:
            numberplate = NumberPlate.objects.get(value=request.data["number_plate"])
            client = numberplate.user
        except NumberPlate.DoesNotExist:
            return Response(
                {
                    "error": f"Number Plate {request.data['number_plate']} does not exist"
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        if numberplate.blocked == True:
            return Response(
                {"error": f"Number Plate {request.data['number_plate']} is blocked"},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )
        try:
            device_object = Outlet.objects.get(device_id=request.data["device_id"])
            outlet_user = device_object.user
        except Outlet.DoesNotExist:
            return Response(
                {"error": f"Device ID {request.data['device_id']} does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if device_object.active == False or device_object.machine_status == False:
            return Response(
                {
                    "error": f"Device ID {request.data['device_id']} is not active or is turned off"
                },
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )
        try:
            client_profile = Profile.objects.get(Django_user=client)
            merchant_profile = Profile.objects.get(Django_user=outlet_user)
        except Profile.DoesNotExist:
            return Response(
                {"error": "Either Merchant or Client Profile does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Comment below code if you don't want to use active device
        outlet_location = device_object.coordinates
        outlet_latitude, outlet_longitude = outlet_location.split(",")
        if not location_confirmation(
            numberplate.value,
            device_object.device_id,
            outlet_latitude,
            outlet_longitude,
        ):
            return Response(
                {"error": "Data was tampered or server took too long to respond"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            print("Data was received from vehicle")
        # Comment till here

        amount = request.data["amount"]
        mode_of_payment = request.data["mode_of_payment"]
        print(amount, mode_of_payment, numberplate, device_object)
        serializer = TransactionCreateSerializer(
            data={
                "merchant_info": device_object.id,
                "amount": amount,
                "mode_of_payment": mode_of_payment,
                "number_plate": numberplate.id,
                "user": client.id,
            }
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_device_id(request):
    try:
        # Get user from access token
        user = User.objects.get(username=request.user.username)

        # Get outlet associated with user
        outlet = Outlet.objects.get(user=user)

        # Return device ID
        return Response(
            {"device_id": outlet.device_id, "device_location": outlet.location},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_outlet_active(request):
    try:
        outlet = Outlet.objects.get(user=request.user)
        outlet.active = True
        outlet.save()
        serializer = OutletSerializer(outlet)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Outlet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_last_three_transactions(request):
    try:
        user_transactions = Transaction.objects.filter(user=request.user).order_by(
            "-timing"
        )[:3]
        serializer = TransactionSerializer(user_transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


class GetLastThreeTransactions(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get"]

    def get(self, request, device_id):
        outlet_user = Outlet.objects.get(user=request.user, device_id=device_id)
        user_transactions_last_3 = Transaction.objects.filter(
            merchant_info=outlet_user
        ).order_by("-timing")[:3]
        if not user_transactions_last_3:
            return Response(
                {"notransactions": f"No Transactions Found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        todays_sales = Transaction.objects.filter(
            merchant_info=outlet_user, timing__date=datetime.now().date()
        )
        todays_total_sales = 0
        if todays_sales.aggregate(Sum("amount"))["amount__sum"]:
            todays_total_sales = todays_sales.aggregate(Sum("amount"))["amount__sum"]
        mode_of_payments = [1, 2, 3, 4]
        individual_sales = {}

        sale_anpr = todays_sales.filter(mode_of_payment=1).aggregate(Sum("amount"))[
            "amount__sum"
        ]
        if sale_anpr:
            individual_sales["ANPR"] = sale_anpr
        else:
            individual_sales["ANPR"] = 0

        response_list = []
        response_list.append(
            {
                "todays_total_sales": todays_total_sales,
                "individual_sales": individual_sales,
            }
        )

        lasttransactionlist = []

        for transaction in user_transactions_last_3:
            if transaction.mode_of_payment == 1:
                mode_of_payment_str = "ANPR"
            elif transaction.mode_of_payment == 2:
                mode_of_payment_str = "CASH"
            elif transaction.mode_of_payment == 3:
                mode_of_payment_str = "UPI"
            elif transaction.mode_of_payment == 4:
                mode_of_payment_str = "CARD"
            lasttransactionlist.append(
                {
                    "amount": float(transaction.amount),
                    "number_plate": str(
                        NumberPlate.objects.get(id=transaction.number_plate.id).value
                    ),
                    "timing": transaction.timing,
                    "status": int(transaction.status),
                }
            )

        print(type(lasttransactionlist[0]))

        response_list.append({"last_three_transactions": lasttransactionlist})
        return Response(response_list, status=status.HTTP_200_OK)
