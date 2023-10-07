from django.urls import path
from .views import (
    GetAllMerchantTransactions,
    get_merchant_overview,
    GetMerchantTransactionsSearchResults,
    GetOutletTransactionsSearchResults,
    GetAllOutletTransactions,
    GetOutletInfo,
    GetDetailOutletInfo,
    UploadAds,
    UpdateAds,
    IncrementClick,
    ToggleMachineState,
)

urlpatterns = [
    # General Merchant Info
    path("", get_merchant_overview, name="overview"),
    path(
        "transactions/search",
        GetMerchantTransactionsSearchResults.as_view(),
        name="search_merchant_transactions",
    ),
    path(
        "transactions",
        GetAllMerchantTransactions.as_view(),
        name="get_all_merchant_transactions",
    ),
    # Outlet Specific Info
    path(
        "outlet/",
        GetOutletInfo.as_view(),
        name="get_all_outlets",
    ),
    path(
        "outlet/<int:outlet_id>",
        GetDetailOutletInfo.as_view(),
        name="get_specific_outlet",
    ),
    path(
        "outlet/<int:outlet_id>/transactions/search",
        GetOutletTransactionsSearchResults.as_view(),
        name="search_outlet_transactions",
    ),
    path(
        "outlet/<int:outlet_id>/transactions",
        GetAllOutletTransactions.as_view(),
        name="get_all_outlet_transactions",
    ),
    path(
        "outlet/<int:outlet_id>/togglestate/",
        ToggleMachineState.as_view(),
        name="get_all_outlet_transactions",
    ),
    # List all ads, and Upload(create) ADs
    path(
        "ads/",
        UploadAds.as_view(),
        name="Upload Ads",
    ),
    path(
        "ads/<int:pk>",
        UpdateAds.as_view(),
        name="Update Ads",
    ),
    path(
        "ads/<int:pk>/click",
        IncrementClick.as_view(),
        name="Click on an Ad",
    ),
]
