from django.urls import path

from user_app.api.views import (
    logout_view,
    OTPListCreateView,
    OTPDetailDelete,
    CustomTokenObtainPairView,
    VerifyOTP,
    RegisterationView,
    PushTokenUpdateCreateView,
    KioskLogin,
    GetUserProfile,
    CustomTokenRefreshPairView,
    block_account_handler,
)


urlpatterns = [
    path("register/", RegisterationView.as_view(), name="create-new-account"),
    path("logout/", logout_view, name="logout"),
    path("block-account/", block_account_handler, name="block-account"),
    path("otp/", OTPListCreateView.as_view(), name="send-list-otp"),
    path("otp/<int:pk>", OTPDetailDelete.as_view(), name="get-delete-otp"),
    path("otp/verify", VerifyOTP.as_view(), name="verify-otp"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "api/token/refresh/", CustomTokenRefreshPairView.as_view(), name="token_refresh"
    ),
    path(
        "pushtoken/",
        PushTokenUpdateCreateView.as_view(),
        name="get_create_user_push_token",
    ),
    path("kiosklogin/", KioskLogin.as_view(), name="kiosklogin"),
    path("profile", GetUserProfile.as_view(), name="Get User Profile"),
]
