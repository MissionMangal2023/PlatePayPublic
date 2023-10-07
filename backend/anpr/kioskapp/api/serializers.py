from rest_framework import serializers
from .models import SuspiciousActivity
from anpr_app.api.models import Transaction


class SuspiciousActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuspiciousActivity
        exclude = ["numberplate"]


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
