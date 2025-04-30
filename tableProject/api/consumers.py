import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async, async_to_sync
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import DisplayedNews
from channels.db import database_sync_to_async
from .serializers import DisplayedNewsSerializer

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
        displayed_news = DisplayedNews.objects.select_related('fk_news').all().order_by('-created_at')
        return DisplayedNewsSerializer(displayed_news, many=True).data

    @database_sync_to_async  # Используем специальный декоратор для ORM
    def get_and_serialize_data(self):
        # Загружаем данные и сериализуем их синхронно
        displayed_news = DisplayedNews.objects.select_related('fk_news').all().order_by('-created_at')
        serializer = DisplayedNewsSerializer(displayed_news, many=True)
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

    async def disconnect(self, close_code):
        # Удаляем канал из группы при отключении
        await self.channel_layer.group_discard("websocket_group", self.channel_name)
        print(f"Removed {self.channel_name} from websocket_group")

    async def receive(self, text_data):
        # Обработка входящих сообщений (можно добавить логику)
        try:
            data = json.loads(text_data)
            print(f"Received data: {data}")
            # Здесь можно добавить логику обработки входящих сообщений
        except json.JSONDecodeError:
            print("Received invalid JSON")

    async def reload_clients(self, event):
        """Отправляем команду перезагрузки всем подключенным клиентам"""
        await self.send(text_data=json.dumps({"type": "reload"}))

    async def delete_client(self, event):
        """Отправляем команду перезагрузки всем подключенным клиентам"""
        await self.send(text_data=json.dumps({"type": "delete", 'client': event['client']}))

    async def send_message(self, event):
        action = event['message'].get('action')

        if action == 'show':
            await self.send(text_data=json.dumps({
                'type': 'message',
                'data': {
                    'pk_message': event['message']['pk_message'],
                    'text': event['message']['text'],
                    'isprimary': event['message']['isprimary'],
                    'action': 'show'
                }
            }))
        elif action == 'hide':
            await self.send(text_data=json.dumps({
                'type': 'control',
                'action': 'hide',
                'pk_message': event['message']['pk_message']
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
