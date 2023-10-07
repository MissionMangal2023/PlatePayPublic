import threading
from .helpers import send_push_message
from .models import PushToken, Transaction
from django.dispatch import receiver
from django.db.models.signals import post_save


class SendPushNotif(threading.Thread):
    def __init__(self, user, message, extra=None):
        self.user = user
        self.message = message
        self.extra = extra
        threading.Thread.__init__(self)

    def run(self):
        try:
            res = send_push_message(
                PushToken.objects.get(user=self.user).token, self.message, self.extra
            )
        except:
            print("There was an error sending push notif")


@receiver(post_save, sender=Transaction)
def send_confirmation(sender, instance, created, **kwargs):
    print("Signal to send push notif triggered....")
    try:
        if created:
            """EXECUTING THREAD TO SEND PUSH NOTIF"""
            print(instance.status, instance)
            statusMap = {0: "Failed", 1: "Pending", 2: "Success"}

            if statusMap[instance.status] == "Pending":
                # Transaction started in Pending status.
                # Send Push notif to redirect to transaction approval page
                message = {
                    "title": "You've got a new Transaction Request!",
                    "body": "Approve or Reject it by clicking here",
                }
                extra = {"transactionId": instance.id, "amount": instance.amount}

            elif statusMap[instance.status] == "Failed":
                # Transaction Failed
                # Some validation error occured, notify the user the same
                message = {
                    "title": "Transaction Failed!",
                    "body": f"Your transaction of Rs. {instance.amount} failed due to {instance.error_message.lower()}",
                }
                extra = {"transactionId": instance.id, "amount": instance.amount}

            else:
                # Transaction Success on Creation (preauth)
                # print(instance.preauth)
                message = {
                    "title": "Hurray! Transaction Success!",
                    "body": f"Rs. {instance.amount} debited from your account!",
                }
                extra = {"transactionId": instance.id, "amount": instance.amount}

            new_thread = SendPushNotif(
                user=instance.user,
                message=message,
                extra=extra,
            )
            new_thread.start()
            return instance

    except SystemError as e:
        print(e)
