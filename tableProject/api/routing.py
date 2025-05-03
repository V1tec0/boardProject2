from django.urls import re_path
from .consumers import MyWebSocketConsumer, NewsConsumer, VideoConsumer, LogConsumer

websocket_urlpatterns = [
    re_path(r'ws/msgs/', MyWebSocketConsumer.as_asgi()),
    re_path(r'ws/news/$', NewsConsumer.as_asgi()),
    re_path(r'ws/videos/$', VideoConsumer.as_asgi()),
    re_path(r'ws/logs/$', LogConsumer.as_asgi()),
]