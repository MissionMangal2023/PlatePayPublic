from typing import Any
from django.shortcuts import render
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from anpr_app.api.serializers import (
    TransactionSerializer,
    AdsSerializer,
    AdsUpdateSerializer,
)
from anpr_app.api.models import Transaction, Profile, Outlet, Ads
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .serializers import (
    MerchantOverviewSerializer,
    OutletOverviewSerializer,
    OutletGraphSerializer,
    AdSerializerForSingleAd,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework import permissions


class MerchantTransactionsPaginator(PageNumberPagination):
    page_size = 9


# /api/v1/merchant/
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_merchant_overview(request):
    merchant_profile = Profile.objects.get(Django_user=request.user)
    serializer = MerchantOverviewSerializer(merchant_profile)
    return Response(serializer.data, status=status.HTTP_200_OK)


# /api/v1/merchant/transactions
class GetAllMerchantTransactions(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MerchantTransactionsPaginator

    def get_queryset(self):
        return Transaction.objects.filter(merchant_info__user=self.request.user)


# api/v1/merchant/search?query=GA07L
class GetMerchantTransactionsSearchResults(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MerchantTransactionsPaginator

    def get_queryset(self):
        query = self.request.query_params.get("query")
        return Transaction.objects.filter(merchant_info__user=self.request.user).filter(
            number_plate__value__icontains=query
        )


class GetOutletTransactionsSearchResults(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MerchantTransactionsPaginator
    lookup_url_kwarg = "outlet_id"

    def get_queryset(self):
        query = self.request.query_params.get("query")
        return Transaction.objects.filter(
            merchant_info=self.kwargs.get(self.lookup_url_kwarg)
        ).filter(number_plate__value__icontains=query)


class GetAllOutletTransactions(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MerchantTransactionsPaginator
    lookup_url_kwarg = "outlet_id"

    def get_queryset(self):
        return Transaction.objects.filter(
            merchant_info=self.kwargs.get(self.lookup_url_kwarg)
        )


class ToggleMachineState(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OutletOverviewSerializer

    def put(self, request, outlet_id):
        print(request, outlet_id)
        outlet_obj = Outlet.objects.get(id=outlet_id)
        outlet_obj.machine_status = not outlet_obj.machine_status
        outlet_obj.save()
        return Response(
            self.serializer_class(outlet_obj).data, status=status.HTTP_200_OK
        )


# for /outlet requests, send basic data
class GetOutletInfo(generics.ListAPIView, generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OutletOverviewSerializer

    def get_queryset(self):
        return Outlet.objects.filter(user=self.request.user)


class GetDetailOutletInfo(generics.RetrieveAPIView):
    serializer_class = OutletGraphSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "outlet_id"
    queryset = Outlet.objects.all()


class UploadAds(generics.ListCreateAPIView):
    queryset = Ads.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return AdsSerializer
        else:
            return AdSerializerForSingleAd


class UpdateAds(generics.UpdateAPIView):
    serializer_class = AdsUpdateSerializer
    queryset = Ads.objects.all()


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.outlet.user == request.user


class IncrementClick(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    serializer_class = AdsSerializer

    def put(self, request, pk):
        ad_obj = get_object_or_404(Ads, id=pk)
        ad_obj.clicks += 1
        ad_obj.save()
        serializer = self.serializer_class(ad_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
