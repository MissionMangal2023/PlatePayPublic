from django.urls import path
from .views import (
    SuspiciousActivityUser,
    SuspiciousActivityOutlet,
    get_device_id,
    update_outlet_active,
    GetLastThreeTransactions,
    NewTransaction,
)


urlpatterns = [
    path(
        "<str:number_plate>/addsusactivityuser/",
        SuspiciousActivityUser.as_view(),
        name="add_sus_activity_user",
    ),
    path(
        "<str:number_plate>/<int:device_id>/addsusactivityoutlet/",
        SuspiciousActivityOutlet.as_view(),
        name="addsus_activity_outlet",
    ),
    path("getdeviceid/", get_device_id, name="get_device_id"),
    path("update_outlet_active/", update_outlet_active, name="update_outlet_active"),
    path(
        "outlet/<int:device_id>/getlastthreetransaction/",
        GetLastThreeTransactions.as_view(),
        name="get_last_three_transactions",
    ),
    path("newtransaction/", NewTransaction.as_view(), name="newtransaction"),
]
