from rest_framework import serializers
from anpr_app.api.models import Profile, Transaction, Outlet, NumberPlate, Ads
from anpr_app.api.serializers import OutletSerializer
from django.utils import timezone
from django.db.models import Sum


class MerchantOverviewSerializer(serializers.ModelSerializer):
    no_of_outlets = serializers.SerializerMethodField()
    today_sale = serializers.SerializerMethodField()
    total_sale = serializers.SerializerMethodField()

    def get_no_of_outlets(self, obj):
        return Outlet.objects.filter(user=obj.Django_user).count()

    def get_total_sale(self, obj):
        return obj.get_total_sales()

    def get_today_sale(self, obj):
        return obj.get_today_sales()

    class Meta:
        model = Profile
        fields = ("name", "gender", "no_of_outlets", "today_sale", "total_sale")


# not currently in use
class MerchantInfoTransactionSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    merchant_info = OutletSerializer()
    number_plate = serializers.CharField(source="number_plate.value")

    class Meta:
        model = Transaction
        fields = (
            "merchant_info",
            "status",
            "amount",
            "mode_of_payment",
            "timing",
            "number_plate",
        )


class OutletOverviewSerializer(serializers.ModelSerializer):
    sales_today = serializers.SerializerMethodField()
    transactions_today = serializers.SerializerMethodField()

    def get_sales_today(self, obj):
        return sum(
            [
                i.amount
                for i in obj.transactions.filter(
                    timing__gte=timezone.now() - timezone.timedelta(days=1)
                )
            ]
        )

    def get_transactions_today(self, obj):
        return obj.transactions.filter(
            timing__gte=timezone.now() - timezone.timedelta(days=1)
        ).count()

    class Meta:
        model = Outlet
        fields = (
            "id",
            "outlet_name",
            "device_id",
            "total_sales",
            "machine_status",
            "active",
            "sales_today",
            "transactions_today",
            "coordinates",
            "location",
        )


class StolenNumberPlateSerializer(serializers.ModelSerializer):
    # user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = NumberPlate
        fields = (
            "value",
            "stolen_timing",
        )


class OutletGraphSerializer(serializers.ModelSerializer):
    graph_input = serializers.SerializerMethodField()
    stolen_vehicles = serializers.SerializerMethodField()

    def get_graph_input(self, obj):
        start_date = (timezone.now() - timezone.timedelta(days=6)).date()
        date_list = []
        day_list = []
        days_sales = []
        for i in range(1, 8):
            curr_date = start_date + timezone.timedelta(days=i)
            date_list.append(curr_date.strftime("%Y-%m-%d"))
            day_list.append(curr_date.strftime("%a"))
            sale = obj.transactions.filter(timing__date=curr_date).aggregate(
                total_amount=Sum("amount")
            )["total_amount"]
            days_sales.append(0 if sale is None else sale)

        return {"days": day_list, "amounts": days_sales}

    def get_stolen_vehicles(self, obj):
        stolen_plates = []
        res = []
        for transaction in obj.transactions.all():
            if (
                transaction.number_plate.stolen_timing < timezone.now()
                and transaction.number_plate.value not in stolen_plates
            ):
                res.append(
                    dict(
                        StolenNumberPlateSerializer(transaction.number_plate).data,
                        transaction={
                            "id": transaction.id,
                            "amount": transaction.amount,
                            "timing": transaction.timing,
                        },
                    )
                )
                stolen_plates.append(transaction.number_plate.value)

        return res[:10]
        # return [
        #     dict(
        #         StolenNumberPlateSerializer(transaction.number_plate).data,
        #         transaction={
        #             "amount": transaction.amount,
        #             "timing": transaction.timing,
        #         },
        #     )
        #     for transaction in obj.transactions.all()
        #     if transaction.number_plate.stolen_timing < timezone.now()
        # ][:5]

    class Meta:
        model = Outlet
        fields = ("graph_input", "stolen_vehicles")


class AdSerializerForSingleAd(serializers.ModelSerializer):
    class Meta:
        model = Ads
        fields = "__all__"
