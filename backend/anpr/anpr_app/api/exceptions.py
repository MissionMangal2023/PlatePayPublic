from rest_framework.exceptions import APIException


class OTPSendingFailed(APIException):
    status_code = 503
    default_detail = "OTP sending service is down. Please try later"
    default_code = "otp_sending_failed"
