"""
ASGI config for anpr project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "activeproject.settings")
django_asgi_app = get_asgi_application()

from locserver.consumers import DataConsumer

application = ProtocolTypeRouter({
    'http':django_asgi_app,
    'websocket': AuthMiddlewareStack(URLRouter([
        re_path('ws/receive/(?P<vehicle_number>\w+)/$', DataConsumer.as_asgi()),
    ]))
})
