from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime
from datetime import timedelta
from .helpers import send_otp
import random
from rest_framework.exceptions import ValidationError
from django.db import DatabaseError, transaction
from .exceptions import OTPSendingFailed


class PushToken(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="push_token"
    )
    active = models.BooleanField(default=True)
    token = models.CharField(max_length=50)

    def __str__(self):
        return f"Push Token for {self.user.username}"


class Profile(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, null=True)
    phone_number = models.IntegerField(unique=True, blank=True, null=True)
    balance = models.FloatField(default=0)
    ACCOUNT_TYPE_CHOICES = (
        ("b", "Business"),
        ("m", "Merchant"),
        ("u", "User"),
    )
    account_type = models.CharField(
        max_length=1, choices=ACCOUNT_TYPE_CHOICES, default="u"
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=50,
        choices=(("Male", "Male"), ("Female", "Female"), ("Other", "Other")),
    )
    Django_user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_valid = models.BooleanField(default=False)

    def get_today_sales(self):
        if self.account_type == "m":
            return sum(
                [
                    i.amount
                    for i in Transaction.objects.filter(
                        timing__gte=timezone.now().date()
                    ).filter(merchant_info__user=self.Django_user)
                ]
            )

    def get_total_sales(self):
        if self.account_type == "m":
            return sum(
                [
                    outlet.total_sales
                    for outlet in Outlet.objects.filter(user=self.Django_user)
                ]
            )
        else:
            return False

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name_plural = "Profile"


class NumberPlate(models.Model):
    def nameFile(instance, filename):
        return "/".join(["images", str(instance.value), filename])

    value = models.CharField(unique=True, max_length=200)
    blocked = models.BooleanField(default=False)
    stolen_timing = models.DateTimeField(
        default=datetime(2090, 1, 1, 0, 0, tzinfo=timezone.utc)
    )
    timing = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.value

    class Meta:
        verbose_name_plural = "NumberPlate"


class Documents(models.Model):
    def nameFile(instance, filename):
        return "/".join(["images", str(instance.numberplate), filename])

    numberplate = models.ForeignKey(
        NumberPlate, on_delete=models.CASCADE, related_name="documents"
    )
    registeration_certificate = models.FileField(
        upload_to=nameFile, null=True, blank=True
    )
    insurance = models.FileField(upload_to=nameFile, null=True, blank=True)
    puc = models.FileField(upload_to=nameFile, null=True, blank=True)
    additional_doc_1 = models.FileField(upload_to=nameFile, null=True, blank=True)
    additional_doc_2 = models.FileField(upload_to=nameFile, null=True, blank=True)

    def __str__(self):
        return str(self.numberplate)

    class Meta:
        verbose_name_plural = "Documents"


class Rewards(models.Model):
    coupon_code = models.CharField(unique=True, max_length=200)
    expiry_date = models.DateTimeField()
    link = models.URLField(max_length=200)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.coupon_code

    class Meta:
        verbose_name_plural = "Rewards"


class Outlet(models.Model):
    outlet_name = models.CharField(max_length=200)
    location = models.TextField()
    coordinates = models.CharField(
        max_length=200,
    )  # blank and null=true
    total_sales = models.FloatField(default=0)
    machine_status = models.BooleanField(default=True)  # default=true
    active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    device_id = models.PositiveBigIntegerField(unique=True)

    def __str__(self):
        return self.outlet_name

    class Meta:
        verbose_name_plural = "Outlet"


class TransactionStatus(models.IntegerChoices):
    FAILED = 0, "Failed"
    PENDING = 1, "Pending"
    SUCCESS = 2, "Success"


class Transaction(models.Model):
    merchant_info = models.ForeignKey(
        Outlet, on_delete=models.DO_NOTHING, related_name="transactions"
    )
    status = models.IntegerField(
        default=TransactionStatus.PENDING, choices=TransactionStatus.choices
    )
    amount = models.FloatField(default=0)
    MODE_OF_PAYMENT_CHOICES = (
        (1, "ANPR"),
        (2, "Cash"),
        (3, "UPI"),
        (4, "Card"),
        (5, "Other"),
    )
    mode_of_payment = models.IntegerField(choices=MODE_OF_PAYMENT_CHOICES, default=1)
    timing = models.DateTimeField(auto_now_add=True)
    number_plate = models.ForeignKey(
        NumberPlate, on_delete=models.DO_NOTHING, related_name="+"
    )
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    error_message = models.CharField(
        max_length=50, null=True, blank=True, editable=False
    )

    def __str__(self):
        return f"{self.merchant_info} - {self.amount} - {self.timing}"

    def save(self, *args, **kwargs):
        try:  # Check if profile exists
            profile = Profile.objects.get(Django_user=self.user)
        except Profile.DoesNotExist:
            raise ValidationError("User does not exist")
        try:  # Check if merchant profile exists
            merchant_profile = Profile.objects.get(Django_user=self.merchant_info.user)
        except Profile.DoesNotExist:
            raise ValidationError("Merchant does not exist")
        # Check if balance is sufficient
        if profile.balance <= 0 or profile.balance < self.amount:
            self.status = 0
            self.error_message = "Insufficient Balance"
            return super().save(*args, **kwargs)
        preauthorized_limit = PreAuthorisedLimit.objects.filter(
            numberplate_obj=self.number_plate, merchant_obj=self.merchant_info
        ).first()
        if preauthorized_limit:
            try:
                with transaction.atomic():
                    if float(preauthorized_limit.amount) >= float(self.amount):
                        profile.balance = float(profile.balance) - float(self.amount)
                        profile.save()
                        merchant_profile.balance = float(
                            merchant_profile.balance
                        ) + float(self.amount)
                        merchant_profile.save()
                        # merchant_info is the outlet
                        self.merchant_info.total_sales = float(
                            self.merchant_info.total_sales
                        ) + float(self.amount)
                        self.merchant_info.save()
                        self.status = 2
                        self.preauth = True
                        return super().save(*args, **kwargs)
                    else:
                        self.status = 0
                        self.error_message = "Preauthorized Limit Exceeded"
                        self.preauth = True
                        return super().save(*args, **kwargs)
            except DatabaseError:
                self.status = 0
                self.error_message = "Internal Server Error"
                self.preauth = True
                return super().save(*args, **kwargs)
        else:
            return super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Transaction"
        ordering = ("-timing",)


class PreAuthorisedLimit(models.Model):
    merchant_obj = models.ForeignKey(
        Outlet, on_delete=models.CASCADE, related_name="preauthorizedlimit"
    )
    amount = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    numberplate_obj = models.ForeignKey(
        NumberPlate, on_delete=models.CASCADE, related_name="preauthorizedlimit"
    )
    last_preauthorized = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="preauthorizedlimit",
        editable=False,
    )  # blank and null =true

    def save(self, *args, **kwargs):
        last_transaction = Transaction.objects.filter(
            user=self.numberplate_obj.user, merchant_info=self.merchant_obj
        ).first()
        self.last_preauthorized = last_transaction
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.merchant_obj.outlet_name

    class Meta:
        verbose_name_plural = "Pre Authorized Limit"
        unique_together = ("merchant_obj", "numberplate_obj")


class Otp(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    expiry_time = models.DateTimeField()
    otp_value = models.IntegerField()

    def __str__(self):
        return str(self.otp_value)

    class Meta:
        verbose_name_plural = "Otp"


class OtpWithPhone(models.Model):
    phone_number = models.IntegerField()
    expiry_time = models.DateTimeField(default=(timezone.now() + timedelta(minutes=10)))
    otp_value = models.IntegerField(default=random.randint(1000, 9999))

    def __str__(self):
        return f"OTP {self.otp_value} generated for {self.phone_number} and its expiry is {self.expiry_time}"

    def is_open(self):
        return self.expiry_time > timezone.now()

    def save(self, *args, **kwargs):
        if self.pk is None:
            # object created for the first time
            # send otp action here
            if not send_otp(self.phone_number, self.otp_value):
                print("OTP sending failed! Retry")
                raise OTPSendingFailed()
        # Either the OTP object was just updated, or the OTP was new and was sent sucesfully
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "OtpWithPhone"


class Ads(models.Model):
    def nameFile(instance, filename):
        return "/".join(["images", str(instance.clicks), filename])

    ad_image = models.FileField(upload_to=nameFile, null=True, blank=True)
    link = models.URLField(max_length=200)
    clicks = models.IntegerField(default=0)
    outlet = models.ForeignKey(
        Outlet, on_delete=models.CASCADE, related_name="ads", null=True, blank=True
    )

    def __str__(self):
        return self.link

    class Meta:
        verbose_name_plural = "Ads"


class Notification(models.Model):
    timing = models.DateTimeField(auto_now=True)
    message = models.CharField(max_length=200)
    link = models.URLField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="+")

    def __str__(self):
        return self.message

    class Meta:
        verbose_name_plural = "Notification"
