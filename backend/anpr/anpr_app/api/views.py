from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework import viewsets
from anpr_app.api.models import (
    Documents,
    Profile,
    Notification,
    Rewards,
    NumberPlate,
    PreAuthorisedLimit,
    Otp,
    Ads,
    Transaction,
    Outlet,
)
from anpr_app.api.serializers import (
    BalanceSerializer,
    DocumentSerializer,
    ProfileSerializer,
    NotificationSerializer,
    RewardSerializer,
    NumberPlateSerializer,
    PreAuthorisedLimitSerializer,
    OutletSerializer,
    OtpSerializer,
    AdsSerializer,
    TransactionSerializer,
    PreAuthorisedLimitSerializerNormal,
    GetPreAuthOutletSerializer,
    UpdateProfileSerializer,
)
from django.contrib.auth.models import User
import os
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, generics
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from django.http import Http404
from django.utils import timezone
import logging
import pandas as pd
import pandas as pd
import stripe
from dotenv import dotenv_values
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError, NotFound
import requests


class OutletPagination(PageNumberPagination):
    page_size = 1


logger = logging.getLogger(__name__)


# PROFILE
# Get Profile
class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_queryset(self):
        django_user = self.request.user
        return Profile.objects.filter(Django_user=django_user)


class ProfileUpdateView(generics.UpdateAPIView, generics.ListAPIView):
    serializer_class = UpdateProfileSerializer
    queryset = Profile.objects.all()

    def get_object(self):
        return Profile.objects.get(Django_user=self.request.user)


# UPDATE PROFILE
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        profile = Profile.objects.get(Django_user=user)
        data = request.data

        # Update the profile fields with the new values
        profile.name = data.get("name", profile.name)
        profile.address = data.get("address", profile.address)
        profile.phone_number = data.get("phone_number", profile.phone_number)
        profile.balance = data.get("balance", profile.balance)
        profile.account_type = data.get("account_type", profile.account_type)
        profile.date_of_birth = data.get("date_of_birth", profile.date_of_birth)
        profile.gender = data.get("gender", profile.gender)
        profile.is_valid = data.get("is_valid", profile.is_valid)

        # Save the updated profile object
        profile.save()

        # Return a JSON response with the updated profile data
        response_data = {
            "id": profile.id,
            "name": profile.name,
            "address": profile.address,
            "phone_number": profile.phone_number,
            "balance": profile.balance,
            "account_type": profile.account_type,
            "date_of_birth": profile.date_of_birth,
            "gender": profile.gender,
            "is_valid": profile.is_valid,
        }
        return JsonResponse(response_data)
    except Profile.DoesNotExist:
        return JsonResponse({"error": "Profile not found."})
    except Exception as e:
        return JsonResponse({"error": str(e)})


# Blocked Profile
class ProfileBlockedView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        profile = get_object_or_404(Profile, Django_user=user)
        profile.is_valid = False
        profile.save()
        response_data = {"is_valid": profile.is_valid}
        return Response(data=response_data, status=status.HTTP_200_OK)


# Get Balance of Profile
class BalanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = BalanceSerializer

    def get_queryset(self):
        django_user = self.request.user
        return Profile.objects.filter(Django_user=django_user)


# NumberPlate
# Get NumberPlate
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_number_plates(request):
    user = request.user
    number_plates = NumberPlate.objects.filter(user=user)
    serializer = NumberPlateSerializer(number_plates, many=True)
    return Response(serializer.data)


# Post Numberplate
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_number_plate(request):
    data = request.data
    data["user"] = request.user.id
    serializer = NumberPlateSerializer(data=data)
    if serializer.is_valid():
        number_plate = serializer.save(user=request.user)
        return Response(
            NumberPlateSerializer(number_plate).data, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Update NumberPlate
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_numberplate(request, value):
    try:
        numberplate = NumberPlate.objects.get(value=value, user=request.user)
        data = request.data

        # Update the numberplate fields with the new values
        numberplate.blocked = data.get("blocked", numberplate.blocked)
        numberplate.stolen_timing = data.get("stolen_timing", numberplate.stolen_timing)
        numberplate.timing = data.get("timing", numberplate.timing)
        numberplate.location = data.get("location", numberplate.location)

        # Save the updated numberplate object
        numberplate.save()

        # Return a JSON response with the updated numberplate data
        response_data = {
            "id": numberplate.id,
            "value": numberplate.value,
            "blocked": numberplate.blocked,
            "stolen_timing": numberplate.stolen_timing,
            "timing": numberplate.timing,
            "location": numberplate.location,
            "user": numberplate.user.id,
        }
        return JsonResponse(response_data)
    except NumberPlate.DoesNotExist:
        return JsonResponse({"error": "NumberPlate not found."})
    except Exception as e:
        return JsonResponse({"error": str(e)})


# Delete NumberPlate
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_number_plate(request, value):
    try:
        number_plate = NumberPlate.objects.get(value=value)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate does not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    # check if the user making the request owns the number plate
    if request.user != number_plate.user:
        return Response(
            {"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
        )

    # check if the number plate is blocked or stolen
    if number_plate.blocked:
        return Response(
            {"message": "Number plate is blocked"}, status=status.HTTP_400_BAD_REQUEST
        )

    if number_plate.stolen_timing < timezone.now():
        return Response(
            {"message": "Number plate is reported stolen"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # delete the number plate
    number_plate.delete()

    return Response(
        {"message": "Number plate deleted successfully"}, status=status.HTTP_200_OK
    )


# Block Numberplate
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def block_number_plate(request, value):
    # print(request, value)
    try:
        number_plate = NumberPlate.objects.get(value=value)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate does not exist"}, status=status.HTTP_404_NOT_FOUND
        )

    # check if the user making the request owns the number plate
    if request.user != number_plate.user:
        return Response(
            {"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
        )

    # update the number plate's blocked field
    number_plate.blocked = not number_plate.blocked
    number_plate.save()

    return Response(
        {
            "message": "Number plate blocked successfully"
            if number_plate.blocked
            else "Number Plate unblocked succesfully"
        },
        status=status.HTTP_200_OK,
    )


# Transactions
class IsTransactionUser(permissions.BasePermission):
    """
    Custom permission to only allow the user associated with a transaction to access it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTransactionUser])
def get_transaction_by_id(request, transactionId):
    user = request.user
    transaction = get_object_or_404(Transaction, id=transactionId)
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTransactionUser])
def get_transactions_byfromtodate(request):
    user = request.user
    data = request.data
    from_date_str = data.get("from_date")
    if from_date_str is None:
        return Response(
            {"message": "from_date is missing", "error_code": "missing_parameter"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    from_date = datetime.strptime(from_date_str, "%Y-%m-%d").replace(
        tzinfo=timezone.utc
    )
    to_date = data.get("to_date")
    if to_date is None:
        to_date = timezone.now()
    else:
        to_date = datetime.strptime(to_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    transactions = Transaction.objects.filter(
        user=user, timing__range=(from_date, to_date)
    )
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_transactions_using_numberplate(request, no_plate):
    try:
        user = request.user
        number_plate = get_object_or_404(NumberPlate, value=no_plate, user=user)
        transactions = Transaction.objects.filter(user=user, number_plate=number_plate)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except NumberPlate.DoesNotExist:
        return Response(
            {"error": "Number plate does not exist"}, status=status.HTTP_404_NOT_FOUND
        )
    except Transaction.DoesNotExist:
        return Response(
            {"error": "No transactions found for the given number plate"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fetchcoordinatesofthetransaction(request, no_plate):
    user = request.user
    if no_plate == "default":
        number_plate = NumberPlate.objects.filter(user=user).first()
    else:
        number_plate = get_object_or_404(NumberPlate, value=no_plate, user=user)

    transactions = Transaction.objects.filter(number_plate=number_plate, user=user)
    location_info = []
    for transaction in transactions:
        info = {
            "transactionId": transaction.id,
            "coordinates": transaction.merchant_info.coordinates,
            "name": transaction.merchant_info.outlet_name,
            "timing": transaction.timing,
        }
        location_info.append(info)

        # If you want to remove duplicates, use
        # if info["coordinates"] not in list(map(lambda x: x["coordinates"], location_info)):

    if number_plate:
        number_plate_value = number_plate.value
    else:
        number_plate_value = None

    return JsonResponse(
        {"number_plate": number_plate_value, "location_info": location_info}, safe=False
    )


# Documents Upload
# registeration_certificate
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_registeration_certificate_document(request, number_plate):
    try:
        numberplate = NumberPlate.objects.get(user=request.user, value=number_plate)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate not found for this user."}, status=400
        )

    try:
        documents = Documents.objects.get(numberplate=numberplate)
    except Documents.DoesNotExist:
        documents = Documents(numberplate=numberplate)

    registeration_certificate = request.FILES.get("file")
    if not registeration_certificate:
        return Response(
            {"message": "No Registration Certificate document was provided."},
            status=400,
        )

    documents.registeration_certificate = registeration_certificate
    documents.save()

    return Response(
        {"message": "Registration Certificate document uploaded successfully."},
        status=200,
    )


# insurance
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_insurance_document(request, number_plate):
    try:
        numberplate = NumberPlate.objects.get(user=request.user, value=number_plate)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate not found for this user."}, status=400
        )

    try:
        documents = Documents.objects.get(numberplate=numberplate)
    except Documents.DoesNotExist:
        documents = Documents(numberplate=numberplate)

    insurance = request.FILES.get("file")
    if not insurance:
        return Response({"message": "No Insurance document was provided."}, status=400)

    documents.insurance = insurance
    documents.save()

    return Response(
        {"message": "Insurance document uploaded successfully."}, status=200
    )


# puc
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_puc_document(request, number_plate):
    try:
        numberplate = NumberPlate.objects.get(user=request.user, value=number_plate)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate not found for this user."}, status=400
        )

    try:
        documents = Documents.objects.get(numberplate=numberplate)
    except Documents.DoesNotExist:
        documents = Documents(numberplate=numberplate)

    puc = request.FILES.get("file")
    if not puc:
        return Response({"message": "No PUC document was provided."}, status=400)

    documents.puc = puc
    documents.save()

    return Response({"message": "PUC document uploaded successfully."}, status=200)


# additional_doc_1
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_additional_doc_1_document(request, number_plate):
    try:
        numberplate = NumberPlate.objects.get(user=request.user, value=number_plate)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate not found for this user."}, status=400
        )

    try:
        documents = Documents.objects.get(numberplate=numberplate)
    except Documents.DoesNotExist:
        documents = Documents(numberplate=numberplate)

    additional_doc_1 = request.FILES.get("file")
    if not additional_doc_1:
        return Response({"message": "No Additional document was provided."}, status=400)

    documents.additional_doc_1 = additional_doc_1
    documents.save()

    return Response(
        {"message": "Additional document uploaded successfully."}, status=200
    )


# additional_doc_2
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_additional_doc_2_document(request, number_plate):
    try:
        numberplate = NumberPlate.objects.get(user=request.user, value=number_plate)
    except NumberPlate.DoesNotExist:
        return Response(
            {"message": "Number plate not found for this user."}, status=400
        )

    try:
        documents = Documents.objects.get(numberplate=numberplate)
    except Documents.DoesNotExist:
        documents = Documents(numberplate=numberplate)

    additional_doc_2 = request.FILES.get("file")
    if not additional_doc_2:
        return Response({"message": "No Additional document was provided."}, status=400)

    documents.additional_doc_2 = additional_doc_2
    documents.save()

    return Response(
        {"message": "Additional document uploaded successfully."}, status=200
    )


@require_http_methods(["GET"])
def check_user_exists(request, username):
    """
    Check if a user exists with the given username.
    Returns a JSON response indicating whether the user exists or not.
    """
    try:
        user = User.objects.get(username=username)
        exists = True
    except User.DoesNotExist:
        exists = False

    response = {"exists": exists}
    return JsonResponse(response)


@api_view(["GET"])
def check_user_exists(request, username):
    """
    Check if a user exists with the given username.
    Returns a JSON response indicating whether the user exists or not.
    """
    try:
        user = User.objects.get(username=username)
        return JsonResponse({"exists": True})
    except User.DoesNotExist:
        return JsonResponse({"exists": False})


@api_view(["GET"])
def check_useremail_exists(request, email):
    """
    Check if a user exists with the given username.
    Returns a JSON response indicating whether the user exists or not.
    """
    try:
        user = User.objects.get(email=email)
        return JsonResponse({"exists": True})
    except User.DoesNotExist:
        return JsonResponse({"exists": False})


class RewardViewSet(viewsets.ModelViewSet):
    queryset = Rewards.objects.all()
    serializer_class = RewardSerializer


class NumberplateViewSet(viewsets.ModelViewSet):
    queryset = NumberPlate.objects.all()
    serializer_class = NumberPlateSerializer

    def get_queryset(self):
        user = self.request.user
        return NumberPlate.objects.filter(user=user)


class PreauthorizedlimitViewSet(viewsets.ModelViewSet):
    queryset = PreAuthorisedLimit.objects.all()
    serializer_class = PreAuthorisedLimitSerializer


class OutletViewSet(viewsets.ModelViewSet):
    queryset = Outlet.objects.all()
    serializer_class = OutletSerializer


class OtpViewSet(viewsets.ModelViewSet):
    queryset = Otp.objects.all()
    serializer_class = OtpSerializer


class AdsViewSet(viewsets.ModelViewSet):
    queryset = Ads.objects.all()
    serializer_class = AdsSerializer


# Get Profile
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(user=user)

    def perform_create(self, serializer):
        outlet_name = self.request.data.get("merchant_info")
        outlet = Outlet.objects.get(outlet_name=outlet_name)
        serializer.save(user=self.request.user, merchant_info=outlet)

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()

        # Convert merchant_info and number_plate to instances of related models
        merchant_info_name = data.get("merchant_info")
        number_plate_name = data.get("number_plate")
        merchant_info = get_object_or_404(Outlet, outlet_name=merchant_info_name)

        try:
            number_plate = NumberPlate.objects.get(value=number_plate_name)
        except NumberPlate.DoesNotExist:
            raise Http404(
                "NumberPlate with value '{}' does not exist".format(number_plate_name)
            )

        # Set the user and related models in the data dictionary
        data["user"] = user.id
        data["merchant_info"] = merchant_info.id
        data["number_plate"] = number_plate.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


config = dotenv_values()


@api_view(
    [
        "POST",
    ]
)
def recharge(request):
    stripe.api_key = config["STRIPE_SECRET_KEY"]

    amount = request.data.get("amount", 100)

    customer = stripe.Customer.create()
    ephemeralKey = stripe.EphemeralKey.create(
        customer=customer["id"],
        stripe_version="2022-11-15",
    )
    paymentIntent = stripe.PaymentIntent.create(
        amount=amount,
        currency="inr",
        automatic_payment_methods={
            "enabled": True,
        },
    )

    return JsonResponse(
        data={
            "paymentIntent": paymentIntent.client_secret,
            "ephemeralKey": ephemeralKey.secret,
            "customer": customer.id,
            "publishableKey": os.environ['STRIPE_PUBLISHABLE_KEY']
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_balance(request):
    user = request.user
    try:
        profile = Profile.objects.get(Django_user=user)
        amount_to_add = request.data.get("amount")
        if amount_to_add is not None:
            profile.balance += amount_to_add
            profile.save()
            return Response({"message": "Balance updated successfully."})
        else:
            return Response(
                {"error": "Invalid request. Amount not provided."}, status=400
            )
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found."}, status=404)


# Merchant
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def outlet_list(request):
    try:
        merchant_profile = request.user
        outlets = Outlet.objects.filter(user=merchant_profile)

        paginator = OutletPagination()
        paginated_outlets = paginator.paginate_queryset(outlets, request)

        outlet_data = []
        for outlet in paginated_outlets:
            outlet_data.append(
                {
                    "outlet_name": outlet.outlet_name,
                    "location": outlet.location,
                    "coordinates": outlet.coordinates,
                    "total_sales": outlet.total_sales,
                    "machine_status": outlet.machine_status,
                    "active": outlet.active,
                    "device_id": outlet.device_id,
                }
            )

        return paginator.get_paginated_response(outlet_data)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_outlet_transactions(request, outlet_id):
    user = request.user
    try:
        profile = Profile.objects.get(
            Django_user=user, account_type="m"
        )  # Restrict to account_type='m'
        merchant_name = profile.name
        transactions = Transaction.objects.filter(
            merchant_info__user=user, merchant_info_id=outlet_id
        ).order_by("-timing")
        paginator = PageNumberPagination()
        paginator.page_size = 1
        paginated_transactions = paginator.paginate_queryset(transactions, request)
        serializer = TransactionSerializer(paginated_transactions, many=True)
        return paginator.get_paginated_response(
            {"merchant_name": merchant_name, "transactions": serializer.data}
        )
    except Profile.DoesNotExist:
        return Response({"error": "Merchant profile not found."}, status=404)


class LastWeekTransactions(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["post"]

    def post(self, request):
        todays_date = datetime.now().date()
        last_week_date = todays_date - timezone.timedelta(days=6)
        transaction_list = Transaction.objects.filter(
            user=request.user,
            timing__range=[last_week_date, todays_date],
            status=2,
        ).order_by("timing")
        date_list = pd.date_range(start=last_week_date, end=todays_date).tolist()
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
                amount_list.append(total_amount)

        else:
            for date in date_list:
                day_list.append(datetime.strptime(date, "%Y-%m-%d").strftime("%a"))
                amount_list.append(0)
        return Response(
            {"days": day_list, "amounts": amount_list}, status=status.HTTP_200_OK
        )


from .permissions import IsOwner


class TakeTransactionAction(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def post(self, request, format=None, **kwargs):
        transactionId = kwargs["transactionId"]
        transactionObj = get_object_or_404(Transaction, id=transactionId)
        timeLapsed = timezone.now() - transactionObj.timing
        if timeLapsed.seconds > 300:
            # Fail the transaction
            transactionObj.status = 0
            transactionObj.save()
            res = Response(
                {"message": f"Transaction {transactionId} request has expired!"}
            )
        elif int(transactionObj.status) == 1:
            if request.data.get("approve", None):
                transactionObj.status = 2

                # Deduct balance from user's wallet
                try:
                    profile = Profile.objects.get(Django_user=transactionObj.user)
                except Profile.DoesNotExist:
                    raise ValidationError("User does not exist")
                profile.balance -= transactionObj.amount
                profile.save()

                res = Response({"message": f"Transaction {transactionId} approved!"})
            else:
                transactionObj.status = 0
                res = Response({"message": f"Transaction {transactionId} cancelled!"})
            transactionObj.save()
        else:
            res = Response(
                {"message": f"Transaction {transactionId} request has expired!"}
            )
        return res


class GetPreauthSuggestions(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OutletSerializer

    def get(self, request, format=None, **kwargs):
        lp = kwargs["lp"]
        try:
            already_preauthorized_outlets = [
                i.merchant_obj
                for i in PreAuthorisedLimit.objects.filter(
                    numberplate_obj=NumberPlate.objects.get(value=lp),
                )
            ]

            last_5_transactions_of_user = request.user.transaction_set.filter(
                number_plate=NumberPlate.objects.get(value=lp).id
            )

            suggestions = list(
                set(
                    [
                        transaction.merchant_info
                        for transaction in last_5_transactions_of_user
                        if transaction.merchant_info
                        not in already_preauthorized_outlets
                    ]
                )
            )[:5]
        except NumberPlate.DoesNotExist:
            raise NotFound(detail=f"Number Plate {lp} not found")

        for i in range(len(suggestions)):
            item = suggestions[i]
            transaction = Transaction.objects.filter(
                user=request.user, merchant_info=item
            ).first()

            suggestions[i] = {
                "outlet": self.serializer_class(item).data,
                "date": timezone.localtime(transaction.timing).date(),
                "amount": transaction.amount,
            }

        return Response(suggestions, status=status.HTTP_200_OK)


class AddPreauth(generics.CreateAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    serializer_class = PreAuthorisedLimitSerializerNormal
    queryset = PreAuthorisedLimit.objects.all()


class PreAuthObjectsList(generics.ListAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    queryset = PreAuthorisedLimit.objects.all()
    serializer_class = GetPreAuthOutletSerializer
    lookup_url_kwarg = "numberplate"

    def get_queryset(self):
        try:
            return PreAuthorisedLimit.objects.filter(
                numberplate_obj=NumberPlate.objects.get(
                    value=self.kwargs.get(self.lookup_url_kwarg)
                ),
            )
        except NumberPlate.DoesNotExist:
            raise NotFound(
                detail=f"Number Plate {self.kwargs.get(self.lookup_url_kwarg)} not found"
            )


class PreAuthObjectsUpdateDestroy(generics.UpdateAPIView, generics.DestroyAPIView):
    permission_classes = [
        IsAuthenticated,
    ]
    queryset = PreAuthorisedLimit.objects.all()
    serializer_class = GetPreAuthOutletSerializer
    lookup_url_kwarg = "numberplate"

    def get_object(self):
        return PreAuthorisedLimit.objects.get(
            numberplate_obj=NumberPlate.objects.get(
                value=self.kwargs.get(self.lookup_url_kwarg)
            ),
            merchant_obj__id=self.kwargs.get("outlet_id"),
        )
