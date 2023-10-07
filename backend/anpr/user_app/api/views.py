from user_app.api.serializers import (
    CustomTokenObtainPairSerializer,
    CustomTokenRefreshSerializer,
    RegistrationSerializer,
    OTPWithPhoneSerializer,
    RegisterationDataSerializer,
    PushTokenSerializer,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from anpr_app.api.models import Profile, Otp, OtpWithPhone, Outlet
from rest_framework.permissions import IsAuthenticated
from anpr_app.api.models import PushToken
from anpr_app.api.serializers import ProfileSerializer

# from anpr_app.api.permissions import IsReviewUserOrReadOnly
import requests
import json
import random
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework import generics


TWO_FACTOR_API_KEY = settings.TWO_FACTOR_API_KEY  # get API key from settings


class OTPListCreateView(generics.ListCreateAPIView):
    queryset = OtpWithPhone.objects.all()
    serializer_class = OTPWithPhoneSerializer

    def create(self, request, *args, **kwargs):
        phone_number = int(request.data["phone_number"])
        print(phone_number)

        try:
            if Profile.objects.filter(phone_number=phone_number).exists():
                # if a profile with same phone number exists
                return Response(
                    "A user with the same phone number already exists",
                    status=status.HTTP_409_CONFLICT,
                )

            obj = [
                i
                for i in OtpWithPhone.objects.filter(phone_number=phone_number)
                if i.is_open() == True
            ][0]
            print(
                "OTP for this number was already sent. Please try after some time: "
                + str(obj)
            )
            return Response(
                "OTP was resent. Try after some time", status=status.HTTP_425_TOO_EARLY
            )
        except IndexError:
            # an active OTP for the given phone number does not exist
            # converts to resend otp here
            print("(Re)Sending OTP...")
            return super().create(request, *args, **kwargs)


class OTPDetailDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = OtpWithPhone.objects.all()
    serializer_class = OTPWithPhoneSerializer


class VerifyOTP(APIView):
    def post(self, request, format=None):
        phone_number = int(request.data["phone_number"])
        otp = int(request.data["otp"])
        print(phone_number, otp)
        try:
            obj = OtpWithPhone.objects.get(phone_number=phone_number, otp_value=otp)
            # if not obj.is_open():
            #     # OTP is valid, but it expired
            #     raise

            # valid and active otp here
            obj.delete()
            return Response("OTP validated succesfully", status=status.HTTP_200_OK)
        except:
            return Response("Invalid OTP", status=status.HTTP_400_BAD_REQUEST)


@api_view(
    [
        "POST",
    ]
)
def logout_view(request):
    if request.method == "POST":
        # request.user.auth_token.delete()
        # JWT is stateless, to logout a user, we need to maintain a cache of all blacklisted token, and blacklist a token manually,
        # This is Too much effort, so for now, we dont do this.

        # Next, we need to delete the push token for a user,
        # so that any future transaction related notifs dont go to that device
        # This step is important
        push_token_obj = request.user.push_token
        push_token_obj.delete()
        return Response(status=status.HTTP_200_OK)


@api_view(["POST"])
def block_account_handler(request):
    permission_classes = [
        IsAuthenticated,
    ]
    if request.method == "POST":
        user = request.user
        user.is_active = False
        user.save()
        return Response("Account Blocked Succesfully!", status=status.HTTP_200_OK)


class RegisterationView(APIView):
    serializer_class = RegisterationDataSerializer

    def post(self, request, format=None):
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            profileInstance = serializer.save()
            return Response(
                {"message": "user created succesfully! You may login now."},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def registration_view(request):
    if request.method == "POST":
        serializer = RegistrationSerializer(data=request.data)
        data = {}
        if serializer.is_valid():
            # Check if all required fields are present in the request
            if all(
                key in request.data
                for key in [
                    "name",
                    "address",
                    "phone_number",
                    "balance",
                    "account_type",
                    "date_of_birth",
                    "gender",
                    "is_valid",
                ]
            ):
                account = serializer.save()
                # Create a new Profile object associated with the user
                profile = Profile.objects.create(
                    Django_user=account,
                    name=request.data.get("name"),
                    address=request.data.get("address"),
                    phone_number=request.data.get("phone_number"),
                    balance=request.data.get("balance"),
                    account_type=request.data.get("account_type"),
                    date_of_birth=request.data.get("date_of_birth"),
                    gender=request.data.get("gender"),
                    is_valid=request.data.get("is_valid"),
                )
                # Send OTP using 2Factor.in API
                otp = str(random.randint(1000, 9999))
                url = "https://2factor.in/API/V1/{0}/SMS/{1}/{2}".format(
                    TWO_FACTOR_API_KEY, profile.phone_number, otp
                )
                response = requests.get(url)
                response_data = json.loads(response.content.decode("utf-8"))
                if response_data["Status"] == "Success":
                    # Save OTP in database with expiry time
                    expiry_time = timezone.now() + timezone.timedelta(minutes=10)
                    otp_obj = Otp.objects.create(
                        user=profile, otp_value=otp, expiry_time=expiry_time
                    )
                    otp_obj.expiry_time = expiry_time
                    otp_obj.save()
                    data[
                        "response"
                    ] = "Registration Successful! OTP sent to your mobile number"
                    data["username"] = account.username
                    data["email"] = account.email
                    data[
                        "otp_id"
                    ] = otp_obj.id  # save OTP id in response for verification
                    # refresh = RefreshToken.for_user(account)
                    # data['token'] = {
                    #     'refresh': str(refresh),
                    #     'access': str(refresh.access_token),
                    # }
                    return Response(data, status=status.HTTP_201_CREATED)
                else:
                    # Return error response if OTP sending fails
                    data["error"] = "OTP sending failed. Please try again later"
                    return Response(
                        data, status=status.HTTP_400_BAD_REQUEST
                    )  # 500 Internal Server Error
            else:
                data["error"] = "All required fields are not present in the request"
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
        else:
            data = serializer.errors
        return Response(data, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_otp_view(request):
    if request.method == "POST":
        otp_id = request.data.get("otp_id")
        otp_value = request.data.get("otp_value")
        data = {}
        try:
            otp_obj = Otp.objects.get(id=otp_id)
        except Otp.DoesNotExist:
            data["error"] = "Invalid OTP ID"
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
        if otp_obj.expiry_time < timezone.now():
            # OTP has expired
            data["error"] = "OTP has expired"
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        if otp_obj.otp_value == otp_value:
            # OTP is valid
            # otp_obj.delete()
            profile = otp_obj.user
            profile.is_valid = True  # set is_valid flag to True
            profile.save()  # save the changes
            data["response"] = "OTP verification successful"
            return Response(data, status=status.HTTP_200_OK)
        else:
            # OTP is invalid
            data["error"] = "Invalid OTP"
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def regenerate_otp_view(request):
    user = request.user
    data = {}
    try:
        profile = Profile.objects.get(Django_user=user)
        # for admin user
    except Profile.DoesNotExist:
        data["error"] = "User profile not found"
        return Response(data, status=status.HTTP_404_NOT_FOUND)
    phone_number = request.data.get("phone_number")
    if profile.phone_number != phone_number:
        data["error"] = "Phone number does not match user profile"
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    # Delete any existing OTPs for the user
    Otp.objects.filter(user=profile).delete()
    # Generate a new OTP and save it to the database with an expiry time of 10 minutes
    otp_value = str(random.randint(1000, 9999))
    expiry_time = timezone.now() + timezone.timedelta(minutes=10)
    otp_obj = Otp.objects.create(
        user=profile, otp_value=otp_value, expiry_time=expiry_time
    )
    otp_obj.save()
    # Send the new OTP to the user's mobile number using the 2factor API
    url = "https://2factor.in/API/V1/{0}/SMS/{1}/{2}".format(
        settings.TWO_FACTOR_API_KEY, phone_number, otp_value
    )
    response = requests.get(url)
    response_data = json.loads(response.content.decode("utf-8"))
    if response_data["Status"] == "Success":
        # Return the new OTP and expiry time in the response
        data["otp_id"] = otp_obj.id
        data["otp_value"] = otp_value
        data["expiry_time"] = expiry_time
        data["response"] = "OTP sent to your mobile number"
        return Response(data, status=status.HTTP_200_OK)
    else:
        data["error"] = "OTP sending failed. Please try again later"
        return Response(data, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshPairView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer


class PushTokenUpdateCreateView(APIView):
    serializer_class = PushTokenSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, format=None):
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data)
            try:
                p1 = PushToken.objects.get(user=request.user)
                p1.token = serializer.validated_data.get("token")
                p1.save()
                return Response(
                    self.serializer_class(p1).data, status=status.HTTP_201_CREATED
                )
            except PushToken.DoesNotExist:
                p1 = PushToken.objects.create(
                    **serializer.validated_data, user=request.user
                )
                return Response(
                    self.serializer_class(p1).data, status=status.HTTP_200_OK
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Kiosk App


class KioskLogin(APIView): # This needs re-working
    http_method_names = ["post"]

    def post(self, request):
        device_id = request.data.get("device_id")
        # For encryption logic here
        try:
            outlet_obj = Outlet.objects.get(device_id=device_id)
            merchant_django_user = outlet_obj.user
        except Outlet.DoesNotExist:
            print("Outlet does not exist")

        if not outlet_obj.machine_status:
            return Response(
                {"message": "Unauthorized! Machine was turned off by admin."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh_token = RefreshToken.for_user(merchant_django_user)
        response_data = {
            "refresh": str(refresh_token),
            "access": str(refresh_token.access_token),
            "device_id": outlet_obj.device_id,
            "outlet_name": outlet_obj.outlet_name,
            "machine_status": outlet_obj.machine_status,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class GetUserProfile(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(Django_user=self.request.user)
