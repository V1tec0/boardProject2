from django.urls import re_path
from .consumers import MyWebSocketConsumer, NewsConsumer, VideoConsumer

websocket_urlpatterns = [
    re_path(r'ws/msgs/', MyWebSocketConsumer.as_asgi()),
    re_path(r'ws/news/$', NewsConsumer.as_asgi()),
    re_path(r'ws/videos/$', VideoConsumer.as_asgi()),
]