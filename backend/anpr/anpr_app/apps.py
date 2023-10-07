from django.apps import AppConfig


class AnprAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "anpr_app"

    def ready(self) -> None:
        from .api import thread

        # return super().ready()
