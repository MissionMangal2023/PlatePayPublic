from django.db import models
from anpr_app.api.models import Profile, Outlet, Transaction, NumberPlate


class SuspiciousActivity(models.Model):
    timing = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    reporter_profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="suspiciousactivity",
    )  # null=true, remove default
    reporter_outlet = models.ForeignKey(
        Outlet,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="suspiciousactivity",
    )  # null=true, remove default
    transaction_details = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="suspiciousactivity",
    )  # null=true, remove default,blank=true
    numberplate = models.ForeignKey(
        NumberPlate, on_delete=models.CASCADE, related_name="suspiciousactivity"
    )  # required field
    case_resolved = models.BooleanField(default=False)

    def __str__(self):
        return self.reason

    class Meta:
        verbose_name_plural = "Suspicious Activity"
