from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from anpr_app.api.serializers import ProfileSerializer
from anpr_app.api.models import Profile, OtpWithPhone, PushToken
from rest_framework_simplejwt.state import token_backend


class OTPWithPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtpWithPhone
        fields = "__all__"


# class RegistrationDataSerializer(serializers.Serializer):
#     name = serializers.CharField(max_length=200)
#     address = serializers.CharField(max_length=30)
#     date_of_birth = serializers.DateField()
#     email = serializers.EmailField()
#     gender = serializers.CharField(
#         choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")],
#         max_length=50,
#     )

#     ACCOUNT_TYPE_CHOICES = (
#         ("b", "Business"),
#         ("m", "Merchant"),
#         ("u", "User"),
#     )
#     account_type = serializers.CharField(
#         max_length=1, choices=ACCOUNT_TYPE_CHOICES, default="u"
#     )
#     password = serializers.CharField(min_length=8, max_length=30)
#     phoneNumber = serializers.IntegerField(
#         unique=True, min=1000000000, max_length=9999999999
#     )
#     username = serializers.CharField(max_length=20)

#     def create(self, validated_data):
#         user = User.objects.create(**validated_data)
#         profile = Profile(**validated_data)
#         profile.Django_user = user
#         profile.save()


class RegisterationDataSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(min_length=8, max_length=30)
    email = serializers.EmailField()

    class Meta:
        model = Profile
        fields = "__all__"
        read_only_fields = ("Django_user",)

    def save(self, **kwargs):
        print(self.validated_data)
        user = User.objects.create_user(
            self.validated_data.get("username", None),
            self.validated_data.get("email", None),
            self.validated_data.get("password", None),
        )
        # create_user hashes the password internally, unlike create
        data_for_profile = {
            key: val
            for key, val in self.validated_data.items()
            if key not in ["username", "password", "email"]
        }
        profile = Profile(is_valid=True, **data_for_profile)
        profile.Django_user = user
        profile.save()
        return profile


class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def save(self):
        password = self.validated_data["password"]
        password2 = self.validated_data["password2"]

        if password != password2:
            raise serializers.ValidationError({"error": "P1 and P2 should be same!"})

        if User.objects.filter(email=self.validated_data["email"]).exists():
            raise serializers.ValidationError({"error": "Email already exists!"})

        account = User(
            email=self.validated_data["email"], username=self.validated_data["username"]
        )
        account.set_password(password)
        account.save()

        return account


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super(CustomTokenObtainPairSerializer, self).validate(attrs)

        profile = Profile.objects.get(Django_user=self.user)
        serialized_profile_data = ProfileSerializer(profile).data

        data.update({"profile": serialized_profile_data})

        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super(CustomTokenRefreshSerializer, self).validate(attrs)
        decoded_payload = token_backend.decode(data["access"], verify=True)
        user_uid = decoded_payload["user_id"]

        profile = Profile.objects.get(Django_user=User.objects.get(id=user_uid))
        serialized_profile_data = ProfileSerializer(profile).data

        data.update({"profile": serialized_profile_data})

        return data


class PushTokenSerializer(serializers.ModelSerializer):
    # def to_representation(self, instance):
    #     return super().to_representation(instance)

    # def to_internal_value(self, data):
    #     return super().to_internal_value(data)

    # user = serializers.CharField(source="user.username", read_only=True)
    user = serializers.SlugRelatedField(slug_field="username", read_only=True)

    class Meta:
        model = PushToken
        fields = ("token", "active", "user")
