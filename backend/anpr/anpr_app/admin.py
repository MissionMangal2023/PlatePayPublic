from django.contrib import admin
from anpr_app.api.models import (
    Documents,
    Rewards,
    NumberPlate,
    PreAuthorisedLimit,
    Profile,
    Outlet,
    Otp,
    Ads,
    Notification,
    Transaction,
    PushToken,
    OtpWithPhone,
)
from kioskapp.api.models import SuspiciousActivity


# class Usera(admin.ModelAdmin): #Changes done by Afaan
#     list_display = ('user_id','username')
#     list_display_links = ('username',)
#     # list_editable=('user_id',)


class AdminDocuments(admin.ModelAdmin):  # Changes done by Afaan
    list_display = ("id", "numberplate")

    # list_editable=('employee_id',)


# admin.site.register(User,Usera)
# admin.site.register(Employee1,Employeea)
admin.site.register(Documents, AdminDocuments)
admin.site.register(SuspiciousActivity)
admin.site.register(Rewards)
admin.site.register(NumberPlate)
admin.site.register(PreAuthorisedLimit)
admin.site.register(Profile)
admin.site.register(Outlet)
admin.site.register(Otp)
admin.site.register(OtpWithPhone)
admin.site.register(Ads)
admin.site.register(Notification)
admin.site.register(Transaction)
admin.site.register(PushToken)
