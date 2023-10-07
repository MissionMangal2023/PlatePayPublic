from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)
from requests.exceptions import ConnectionError, HTTPError
from django.conf import settings
import requests
import json


TWO_FACTOR_API_KEY = settings.TWO_FACTOR_API_KEY  # get API key from settings


def send_push_message(token, message, extra=None):
    try:
        print(message)
        response = PushClient().publish(
            PushMessage(
                to=token,
                title=message["title"],
                body=message["body"],
                data=extra,
            )
        )

    except PushServerError as exc:
        # Encountered some likely formatting/validation error.
        print(
            {
                "token": token,
                "message": message,
                "extra": extra,
                "errors": exc.errors,
                "response_data": exc.response_data,
            }
        )
        raise

    except (ConnectionError, HTTPError) as exc:
        # Encountered some Connection or HTTP error - retry a few times in
        # case it is transient.
        print({"token": token, "message": message, "extra": extra})
        # rollbar.report_exc_info(
        #     extra_data={'token': token, 'message': message, 'extra': extra})
        raise self.retry(exc=exc)

    try:
        # We got a response back, but we don't know whether it's an error yet.
        # This call raises errors so we can handle them with normal exception
        # flows.
        response.validate_response()

    except DeviceNotRegisteredError:
        # Mark the push token as inactive
        print("Push token is not active!")
        from .models import PushToken

        PushToken.objects.filter(token=token).update(active=False)

    except PushTicketError as exc:
        # Encountered some other per-notification error.
        print(
            {
                "token": token,
                "message": message,
                "extra": extra,
                "push_response": exc.push_response._asdict(),
            }
        )
        raise self.retry(exc=exc)


def send_otp(phone_number, otp):
    # This if condition will simply print otp, return true.
    # In production, this will send an actual otp
    if settings.DEBUG:
        print(otp)
        return True

    url = "https://2factor.in/API/V1/{0}/SMS/{1}/{2}".format(
        TWO_FACTOR_API_KEY, phone_number, otp
    )
    response = requests.get(url)
    response_data = json.loads(response.content.decode("utf-8"))
    if response_data["Status"] == "Success":
        # OTP sent succesfully
        # Save OTP in database with expiry time, after this return
        return True

    else:
        # Return error response if OTP sending fails
        # There was some error, so OTP couldnt be sent
        return False
