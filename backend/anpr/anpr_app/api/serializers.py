from rest_framework import serializers
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
from django.contrib.auth.models import User
from django.utils import timezone


class NotificationSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Notification
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        #   fields = ['id', 'username', 'email', 'profile']
        fields = "__all__"


class RewardSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Rewards
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):
    total_sales = serializers.SerializerMethodField()
    notification = NotificationSerializer(many=False, read_only=True)
    reward = RewardSerializer(many=False, read_only=True)
    Django_user = UserSerializer(many=False, read_only=True)
    # read only field is_valid=

    def get_total_sales(self, obj):
        return obj.get_total_sales()

    class Meta:
        model = Profile
        fields = "__all__"


class UpdateProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="Django_user.email")

    def __init__(self, instance=None, data=..., **kwargs):
        kwargs["partial"] = True
        super().__init__(instance, data, **kwargs)

    def update(self, instance, validated_data):
        if validated_data.get("Django_user") and validated_data.get("Django_user").get(
            "email", False
        ):
            instance.Django_user.email = validated_data.get("Django_user").get(
                "email", instance.Django_user.email
            )
            instance.Django_user.save()

        instance.name = validated_data.get("name", instance.name)
        instance.address = validated_data.get("address", instance.address)
        instance.gender = validated_data.get("gender", instance.gender)
        instance.balance = validated_data.get("balance", instance.balance)
        instance.date_of_birth = validated_data.get(
            "date_of_birth", instance.date_of_birth
        )
        instance.save()
        return instance

    class Meta:
        model = Profile
        partial = True
        fields = (
            "email",
            "name",
            "address",
            "phone_number",
            "date_of_birth",
            "gender",
            "balance",
        )


class NumberPlateSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = NumberPlate
        fields = "__all__"


class DocumentSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Documents
        fields = "__all__"


class PucDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documents
        fields = ["puc"]


class OutletSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Outlet
        fields = "__all__"


class OtpSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Otp
        fields = "__all__"


class AdsSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    outlet = OutletSerializer()

    class Meta:
        model = Ads
        fields = "__all__"


# This can be used for partial PUT requests
class AdsUpdateSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    outlet = OutletSerializer()

    def __init__(self, instance=None, data=..., **kwargs):
        kwargs["partial"] = True
        super().__init__(instance, data, **kwargs)

    class Meta:
        model = Ads
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    merchant_info = OutletSerializer()

    # Added later on for merchant_info
    number_plate = serializers.CharField(source="number_plate.value")
    number_plate_stolen = serializers.SerializerMethodField()

    def get_number_plate_stolen(self, obj):
        return obj.number_plate.stolen_timing < timezone.now()

    class Meta:
        model = Transaction
        fields = "__all__"


class PreAuthorisedLimitSerializerNormal(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    numberplate_obj = serializers.SlugRelatedField(
        slug_field="value", queryset=NumberPlate.objects.all()
    )

    class Meta:
        model = PreAuthorisedLimit
        fields = "__all__"


class PreAuthorisedLimitSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = PreAuthorisedLimit
        fields = "__all__"


class GetPreAuthOutletSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    preAuthLimit = serializers.IntegerField(source="amount")
    coordinate = serializers.SerializerMethodField()
    title = serializers.CharField(source="merchant_obj.outlet_name", read_only=True)
    last_transaction = serializers.SerializerMethodField()
    outlet_id = serializers.IntegerField(source="merchant_obj.id", read_only=True)

    def get_last_transaction(self, obj):
        if obj.last_preauthorized:
            return {
                "date": obj.last_preauthorized.timing,
                "amount": obj.last_preauthorized.amount,
            }
        else:
            return None

    def get_coordinate(self, obj):
        return {
            "latitude": float(obj.merchant_obj.coordinates.split(",")[0].strip()),
            "longitude": float(obj.merchant_obj.coordinates.split(",")[1].strip()),
        }

    def create(self, validated_data):
        print(validated_data)
        return super().create(validated_data)

    class Meta:
        model = PreAuthorisedLimit
        fields = (
            "id",
            "last_updated",
            "coordinate",
            "preAuthLimit",
            "title",
            "last_transaction",
            "outlet_id",
        )


class BalanceSerializer(serializers.ModelSerializer):
    balance = serializers.FloatField()

    class Meta:
        model = Profile
        fields = ["balance"]
