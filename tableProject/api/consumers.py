import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async, async_to_sync
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import News, Message
from channels.db import database_sync_to_async
from .serializers import NewsSerializer
from .utils import send_message_logic


class NewsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add to news updates group
        await self.channel_layer.group_add("news_updates", self.channel_name)
        await self.accept()

        # Send initial data
        initial_data = await self.get_initial_data()
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': initial_data
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("news_updates", self.channel_name)

    async def news_update(self, event):
        # Broadcast update to all connected clients
        await self.send(text_data=json.dumps({
            'type': 'news_update',
            'data': event["data"]
        }))

    @sync_to_async
    def get_initial_data(self):
        news = News.objects.filter(is_displayed=True).order_by('display_order', '-created_at')
        return NewsSerializer(news, many=True).data

    @database_sync_to_async  # Используем специальный декоратор для ORM
    def get_and_serialize_data(self):
        # Загружаем данные и сериализуем их синхронно
        news = News.objects.filter(is_displayed=True).order_by('display_order', '-created_at')
        serializer = NewsSerializer(news, many=True)
        return serializer.data

class WebSocketCORSMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope['headers'] = [
            (b'access-control-allow-origin', b'*'),
            (b'access-control-allow-methods', b'GET,POST,OPTIONS'),
            (b'access-control-allow-headers', b'*'),
        ]
        return await super().__call__(scope, receive, send)

class MyWebSocketConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def get_all_message_statuses(self):
        return [
            {'pk_message': m.pk_message, 'isshowing': m.isshowing}
            for m in Message.objects.all()
        ]


    async def connect(self):
        # Подключаемся к группе WebSocket
        await self.channel_layer.group_add("websocket_group", self.channel_name)
        print(f"Added {self.channel_name} to websocket_group")

        # Принимаем WebSocket-соединение
        await self.accept()

        # Отправляем подтверждение подключения
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'WebSocket connection established'
        }))

        horizontal = cache.get("background_horizontal")
        vertical = cache.get("background_vertical")

        if horizontal:
            await self.send(text_data=json.dumps({
                "type": "background_change",
                "image_url": horizontal,
                "orientation": "horizontal"
            }))
        if vertical:
            await self.send(text_data=json.dumps({
                "type": "background_change",
                "image_url": vertical,
                "orientation": "vertical"
            }))

        messages = await self.get_all_message_statuses()
        await self.send(text_data=json.dumps({
            'type': 'all_statuses',
            'data': messages
        }))

    async def disconnect(self, close_code):
        # Удаляем канал из группы при отключении
        await self.channel_layer.group_discard("websocket_group", self.channel_name)
        print(f"Removed {self.channel_name} from websocket_group")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')

        print('WS receive:', text_data)

        if msg_type == 'send_message':
            await self.handle_send_message(data)

        if msg_type == "reload":
            await self.send_reload()

    async def send_reload(self):
        await self.channel_layer.group_send(
            "websocket_group",
            {
                "type": "send.message",
                "pk_message": -1,
                "text": "reload",
                "isprimary": False,
                "action": "hide"
            }
        )

    async def handle_send_message(self, data):
        pk = data.get('message_id')
        show_at = data.get('show_at')  # в ISO формате или None
        duration = data.get('duration')  # int или None
        action = data.get('action')

        await self.send_to_view(pk, show_at, duration, action)
    @database_sync_to_async
    def send_to_view(self, pk, show_at, duration, action):
        # Имитируем вызов логики из views.py (можно перенести её в утилиту)
        send_message_logic(pk, show_at, duration, action)

    async def reload_clients(self, event):
        """Отправляем команду перезагрузки всем подключенным клиентам"""
        await self.send(text_data=json.dumps({"type": "reload"}))

    async def delete_client(self, event):
        """Отправляем команду перезагрузки всем подключенным клиентам"""
        await self.send(text_data=json.dumps({"type": "delete", 'client': event['client']}))

    async def message_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'data': {
                'pk_message': event['pk_message'],
                'isshowing': event['isshowing'],
            }
        }))

    async def change_background(self, event):
        await self.send(text_data=json.dumps({
            "type": "background_change",
            "image_url": event.get("image_url"),
            "orientation": event.get("orientation")
        }))

    async def media_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "media.broadcast",
            "media_url": event.get("media_url"),
            "media_type": event.get("media_type")
        }))

    async def media_hide(self, event):
        await self.send(text_data=json.dumps({
            "type": "media.hide"
        }))

    async def send_message(self, event):
        print('Обработка group_send send_message:', event)
        action = event.get('action')  # ← исправлено

        if action == 'show':
            await self.send(text_data=json.dumps({
                'type': 'message',
                'data': {
                    'pk_message': event['pk_message'],
                    'text': event['text'],
                    'isprimary': event['isprimary'],
                    'action': 'show'
                }
            }))
        elif action == 'hide':
            await self.send(text_data=json.dumps({
                'type': 'control',
                'action': 'hide',
                'pk_message': event['pk_message']
            }))


class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("video_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("video_updates", self.channel_name)

    async def video_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'video_update',
            'data': event["data"]
        }))

class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('logs', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('logs', self.channel_name)

    async def new_log(self, event):
        await self.send(text_data=json.dumps(event['log']))
