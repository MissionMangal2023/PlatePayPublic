from django.urls import path
from prediction_app.api.views import (
    # verify_number_plate,
    new_number_plate,
    VerifyUser,
    TransactionPieChart,
    LastWeekTransactionStatistics,
    LastWeekBalance,
)
from prediction_app.consumers import receive_number_plate


urlpatterns = [
    path("verifynumplate/", VerifyUser.as_view(), name="verifynumplate"),
    path("numberplatetext/", new_number_plate, name="numberplatetext"),
    path("receivenumberplate/", receive_number_plate, name="receivenumberplate"),
    path(
        "transaction/piechart/",
        TransactionPieChart.as_view(),
        name="transaction_pie_chart",
    ),
    path(
        "transaction/lastweekstatistics/",
        LastWeekTransactionStatistics.as_view(),
        name="last_week_transaction_statistics",
    ),
    path(
        "transaction/lastweekbalance/",
        LastWeekBalance.as_view(),
        name="last_week_balance",
    ),
]
