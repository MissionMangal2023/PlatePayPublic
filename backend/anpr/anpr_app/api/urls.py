from django.urls import path, include
from anpr_app.api.views import (
    upload_registeration_certificate_document,
    upload_insurance_document,
    upload_puc_document,
)
from anpr_app.api.views import (
    upload_additional_doc_1_document,
    upload_additional_doc_2_document,
)
from anpr_app.api.views import (
    BalanceViewSet,
)

from anpr_app.api.views import (
    TransactionViewSet,
    check_user_exists,
    check_useremail_exists,
    TakeTransactionAction,
    ProfileUpdateView,
)
from anpr_app.api.views import (
    ProfileBlockedView,
    get_all_number_plates,
    add_number_plate,
    update_numberplate,
    delete_number_plate,
    block_number_plate,
    get_transactions_byfromtodate,
    get_transactions_using_numberplate,
    get_transaction_by_id,
    get_outlet_transactions,
    fetchcoordinatesofthetransaction,
    recharge,
    outlet_list,
    update_balance,
    LastWeekTransactions,
    GetPreauthSuggestions,
    PreAuthObjectsList,
    AddPreauth,
    PreAuthObjectsUpdateDestroy,
)

from rest_framework import routers

router = routers.DefaultRouter()

router.register(r"getbalance", BalanceViewSet)

# router.register(r"suspicious-activity", SuspiciousActivityViewSet)
router.register(r"transaction", TransactionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    # NumberPlate
    path("getnumberplates/", get_all_number_plates, name="numberplates"),
    path("add_number_plate/", add_number_plate, name="add_number_plate"),
    path("numberplate/<str:value>", update_numberplate, name="update_number_plate"),
    path("number_plate/<str:value>", delete_number_plate, name="delete_number_plate"),
    path(
        "numberplate/<str:value>/block/", block_number_plate, name="block_number_plate"
    ),
    path(
        "<str:number_plate>/uploadrc/",
        upload_registeration_certificate_document,
        name="upload_registeration_certificate_document",
    ),
    path(
        "<str:number_plate>/uploadinsurance/",
        upload_insurance_document,
        name="upload_insurance_document",
    ),
    path(
        "<str:number_plate>/uploadpuc/", upload_puc_document, name="upload_puc_document"
    ),
    path(
        "<str:number_plate>/uploadad1/",
        upload_additional_doc_1_document,
        name="upload_additional_doc_1_document",
    ),
    path(
        "<str:number_plate>/uploadad2/",
        upload_additional_doc_2_document,
        name="upload_additional_doc_2_document",
    ),
    path("<str:username>/exist/", check_user_exists, name="check_user_exists"),
    path(
        "<str:email>/emailexist/", check_useremail_exists, name="check_useremail_exists"
    ),
    path(
        "lastweektransactions/",
        LastWeekTransactions.as_view(),
        name="LastWeekTransactions",
    ),
    path("blockaccount/", ProfileBlockedView.as_view(), name="api_profile_update"),
    path("update/profile/", ProfileUpdateView.as_view(), name="update-profile-beta"),
    path("user/transaction", get_transactions_byfromtodate, name="get_transactions"),
    path("user/<str:no_plate>/transactions/", get_transactions_using_numberplate),
    path(
        "user/<str:no_plate>/transactions/locations", fetchcoordinatesofthetransaction
    ),
    path(
        "user/transaction/<str:transactionId>/",
        get_transaction_by_id,
        name="get-single-transaction",
    ),
    path(
        "user/transaction/<str:transactionId>/confirm/",
        TakeTransactionAction.as_view(),
        name="approve-reject-transaction",
    ),
    # payments
    path("payment-sheet/", recharge, name="payment"),
    path("update_balance/", update_balance, name="update_balance"),
    path("outlets/", outlet_list, name="outlet_list"),
    path(
        "outlets/<int:outlet_id>/transactions/",
        get_outlet_transactions,
        name="outlet_transactions",
    ),
    # PreAuth
    path(
        "preauth/suggestions/<str:lp>",
        GetPreauthSuggestions.as_view(),
        name="preauth_suggestions",
    ),
    path(
        "preauth/<str:numberplate>",
        PreAuthObjectsList.as_view(),
        name="preauthorize_list_outlet",
    ),
    path(
        "preauth/<str:numberplate>/<int:outlet_id>",
        PreAuthObjectsUpdateDestroy.as_view(),
        name="preauthorize_update_delete_outlet",
    ),
    path(
        "preauth/<str:numberplate>/add",
        AddPreauth.as_view(),
        name="add_preauth",
    ),
]
