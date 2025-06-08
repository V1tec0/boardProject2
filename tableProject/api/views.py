import base64
import os, datetime, uuid, textract, tempfile, urllib3
import random
from mimetypes import guess_extension
from datetime import datetime, timedelta
from urllib.parse import urlparse

from PIL import UnidentifiedImageError, Image
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.tokens import default_token_generator
from django.db.migrations import serializer
from django.http import JsonResponse, Http404
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from api.models import Message, News, User, BellSchedule, BellTemplate, Client, LogEntry
from api.serializers import MessageSerializer, NewsSerializer, UserSerializer, \
    BellScheduleSerializer, BellTemplateSerializer, ClientSerializer, LogEntrySerializer
from api.utils import *

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class MessageListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        messages = Message.objects.all().order_by('-pk_message')  # Упорядочиваем по `pk_message`
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail':'Сообщение создано.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, id_message):
        try:
            return Message.objects.get(pk_message=id_message)
        except Message.DoesNotExist:
            raise Http404

    def get(self, request, id_message):
        try:
            with transaction.atomic():
                if id_message == 'reload':
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "websocket_group",
                        {
                            "type": "send.message",
                            "message": {
                                "pk_message": -1,
                                "text": "Перезагрузка клиентов...",
                                "isprimary": False,
                                "action": 'hide'
                            }
                        }
                    )
                    return Response({"status": "Перезагрузка отправлена"}, status=status.HTTP_200_OK)

                elif id_message == 'lesson':
                    message = self.get_object(4)
                    action = 'show' if message.isshowing == 1 else 'hide'
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "websocket_group",
                        {
                            "type": "send.message",
                            "message": {
                                "pk_message": message.pk_message,
                                "text": message.text,
                                "isprimary": message.isprimary,
                                "action": action
                            }
                        }
                    )
                    return Response({"status": "Звонок на урок"}, status=status.HTTP_200_OK)

                elif id_message == 'break':
                    message = self.get_object(3)
                    action = 'show' if message.isshowing == 1 else 'hide'
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "websocket_group",
                        {
                            "type": "send.message",
                            "message": {
                                "pk_message": message.pk_message,
                                "text": message.text,
                                "isprimary": message.isprimary,
                                "action": action
                            }
                        }
                    )
                    return Response({"status": "Звонок на перемену"}, status=status.HTTP_200_OK)

                id_message = int(id_message)
                message = self.get_object(id_message)

                # Если сообщение primary, отключаем все остальные
                # if message.isprimary == 1:
                #     Message.objects.exclude(pk_message=message.pk_message).update(isprimary=False, isshowing=0)
                #     Message.objects.filter(status='Обычное').update(disabled=True)

                message.isshowing = 1 if message.isshowing == 0 else 0
                message.save(update_fields=['isshowing'])

                action = 'show' if message.isshowing == 1 else 'hide'

                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "send.message",
                        "message": {
                            "pk_message": message.pk_message,
                            "text": message.text,
                            "isprimary": message.isprimary,
                            "action": action
                        }
                    }
                )

                # сразу после send.message
                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "message_status",
                        "pk_message": message.pk_message,
                        "isshowing": message.isshowing
                    }
                )

                return Response({
                    "status": "Сообщение показано" if message.isshowing == 1 else "Сообщение скрыто",
                    "isshowing": message.isshowing
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, id_message):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            message = Message.objects.get(pk_message=id_message)

            # Конвертируем isshowing в 0/1, если нужно
            if 'isshowing' in request.data:
                request.data['isshowing'] = 1 if request.data['isshowing'] else 0

            serializer = MessageSerializer(message, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                # Проверяем сохраненное значение
                message.refresh_from_db()
                print("Текущий isshowing:", message.isshowing)  # Для отладки
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Message.DoesNotExist:
            return Response({"error": "Сообщение не найдено"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, id_message):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized.'}, status=status.HTTP_401_UNAUTHORIZED)

        if id_message == '3' or id_message == '4':
            return Response({'detail': 'Forbidden to delete'}, status=status.HTTP_403_FORBIDDEN)

        message = self.get_object(id_message)

        # Деактивация перед удалением
        message.isshowing = 0
        message.save(update_fields=['isshowing'])

        # Уведомление фронта
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "send.message",
                "message": {
                    "action": "hide",
                    "pk_message": message.pk_message
                }
            }
        )

        message.delete()
        return Response({"status": "Сообщение удалено"}, status=status.HTTP_200_OK)

class PingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'pong ' + str(uuid.uuid4())}, status=status.HTTP_200_OK)


class NewsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        news = News.objects.all().order_by('-pk_news')
        serializer = NewsSerializer(news, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        text_content = ""  # Полный текст из файла
        parsed_data = {"title": None, "small_text": [], "main_text": []}  # Список для абзацев

        # Проверяем наличие текстового файла
        if 'file_text' in request.FILES:
            text_file = request.FILES.get('file_text')
            try:
                # Проверяем расширение файла
                allowed_extensions = ['.txt', '.docx']
                file_extension = os.path.splitext(text_file.name)[1].lower()

                if file_extension not in allowed_extensions:
                    return Response(
                        {"error": "Unsupported file format. Only .txt and .docx are allowed."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Обрабатываем файл
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                        for chunk in text_file.chunks():
                            temp_file.write(chunk)
                        temp_file_path = temp_file.name

                    # Для txt-файлов читаем напрямую
                    if file_extension == ".txt":
                        with open(temp_file_path, "r", encoding="utf-8") as f:
                            text_content = f.read()
                    else:
                        # Для docx и других - используем textract
                        text_content = textract.process(temp_file_path).decode("utf-8")
                        text_content = text_content.replace("¶", "\n").replace("⇇", "").strip()

                    os.remove(temp_file_path)

                except Exception as e:
                    return Response(
                        {"error": f"Failed to process the file: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Парсим текст с разметкой
                current_marker = None  # Текущий маркер
                for line in text_content.split("\n"):
                    line = line.strip()

                    # Проверяем маркеры
                    if line.startswith("#title:"):
                        current_marker = "title"
                        parsed_data["title"] = line.replace("#title:", "").strip()
                    elif line.startswith("#small_text:"):
                        current_marker = "small_text"
                        parsed_data["small_text"] = []  # Обнуляем список
                    elif line.startswith("#main_text:"):
                        current_marker = "main_text"
                        parsed_data["main_text"] = []  # Обнуляем список
                    elif current_marker:  # Если маркер уже был найден
                        if line:  # Добавляем непустые строки как абзацы
                            parsed_data[current_marker].append(line)

            except Exception as e:
                return Response(
                    {"error": f"Failed to process the file: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Формируем данные для сохранения
        news_data = {
            "title": parsed_data.get("title") or request.data.get("title", ""),
            "small_text": "\n".join(parsed_data.get("small_text", [])) or request.data.get("small_text", ""),
            "main_text": "\n".join(parsed_data.get("main_text", [])) or request.data.get("main_text", "")
        }

        # Сериализация и сохранение новости
        serializer = NewsSerializer(data=news_data)
        if serializer.is_valid():
            with transaction.atomic():
                news = serializer.save()

                # Обработка изображений
                image = request.FILES.get('image')
                if image:
                    if not image.content_type.startswith('image/'):
                        return JsonResponse({'error': 'Можно загружать только изображения'}, status=400)

                    extension = os.path.splitext(image.name)[-1]  # сохраняем оригинальное расширение
                    filename = f"news_{news.pk_news}{extension}"

                    news.image.save(filename, image, save=True)

                # Возвращаем успешный ответ
                return Response({'detail':"Новость добавлена успешно."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateDisplayedNewsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        news_ids = request.data.get('news_ids', [])

        try:
            with transaction.atomic():
                # Delete old entries
                # Сбрасываем старые флаги
                News.objects.update(is_displayed=False, display_order=None)

                # Устанавливаем новые
                for index, news_id in enumerate(news_ids):
                    try:
                        news = News.objects.get(pk=news_id)
                        news.is_displayed = True
                        news.display_order = index
                        news.save()
                    except News.DoesNotExist:
                        continue

                # Notify connected clients through WebSocket
                channel_layer = get_channel_layer()
                serialized_data = NewsSerializer(
                    News.objects.filter(is_displayed=True).order_by('display_order'),
                    many=True, context={'request': request}
                ).data

                async_to_sync(channel_layer.group_send)(
                    "news_updates",
                    {
                        "type": "news_update",
                        "data": serialized_data
                    }
                )

                return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to update displayed news: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetDisplayedNewsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        news = News.objects.filter(is_displayed=True).order_by('display_order')
        serializer = NewsSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)


class ParsedNewsView(APIView):
    permission_classes = [AllowAny]
    CACHE_KEY = 'maufk_news_cache'
    CACHE_TIMEOUT = 3600  # 1 час

    def get(self, request):
        parser = MaufkParser()
        news = parser.parse_news_page()

        return JsonResponse({
            'status': 'success',
            'count': len(news),
            'news': [{
                'title': item.title,
                'url': item.url,
                'image_url': item.image_url,
                'text': item.text,
                'date': item.date
            } for item in news]
        })


class NewsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id_news):
        news = News.objects.get(pk=id_news)
        serializer = NewsSerializer(news, request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_news):
        news = News.objects.get(pk=id_news)
        if news.image:
            file_path = os.path.join(settings.MEDIA_ROOT, news.image.name)
            if os.path.exists(file_path):
                os.remove(file_path)
        news.delete()
        return Response({'detail':"Новость удалена успешно."}, status=status.HTTP_204_NO_CONTENT)


class ScheduleView(APIView):
    permission_classes = [AllowAny]
    VALID_SCHEDULE_TYPES = ['s', 'p', 'z']
    MAX_AGE_DAYS = 3  # Максимальный возраст файлов для хранения

    def get_next_available_date(self, schedule_type):
        """Находит следующую доступную дату без файлов данного типа"""
        current_date = datetime.now().date()
        while True:
            date_str = current_date.strftime("%Y.%m.%d")
            existing_files = default_storage.listdir('schedule')[1]
            pattern = f"{date_str}_{schedule_type}_"
            exists = any(filename.startswith(pattern) for filename in existing_files)

            if not exists:
                return current_date
            current_date += timedelta(days=1)

    def cleanup_old_schedules(self):
        """Удаляет все расписания старше MAX_AGE_DAYS дней"""
        now = datetime.now().date()
        try:
            _, filenames = default_storage.listdir('schedule')
            for filename in filenames:
                try:
                    # Парсим дату из имени файла (первые 10 символов)
                    file_date_str = filename[:10]
                    file_date = datetime.strptime(file_date_str, "%Y.%m.%d").date()

                    if (now - file_date).days >= self.MAX_AGE_DAYS:
                        default_storage.delete(f"schedule/{filename}")
                except (ValueError, IndexError):
                    continue  # Пропускаем файлы с некорректным форматом имени
        except FileNotFoundError:
            pass  # Папка schedule не существует - нечего удалять

    def get(self, request):
        """Возвращает расписания за последние MAX_AGE_DAYS дней"""
        now = datetime.now().date()
        files = []

        try:
            _, filenames = default_storage.listdir('schedule')
            for filename in filenames:
                try:
                    # Извлекаем данные из имени файла
                    parts = filename.split('_')
                    if len(parts) < 3 or not parts[2].endswith('.png'):
                        continue

                    file_date = datetime.strptime(parts[0], "%Y.%m.%d").date()
                    schedule_type = parts[1]

                    # Проверяем актуальность даты
                    if (now - file_date).days > self.MAX_AGE_DAYS:
                        continue

                    files.append({
                        "type": schedule_type,
                        "date": parts[0],
                        "url": f"/media/schedule/{filename}",
                        "filename": filename
                    })
                except (ValueError, IndexError):
                    continue

        except FileNotFoundError:
            pass

        # Сортируем по дате (новые сначала)
        files.sort(key=lambda x: x['date'], reverse=True)
        return Response({"schedules": files}, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        """Загрузка нового расписания"""
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES.get('file')
        schedule_type = request.data.get('type')

        if schedule_type not in self.VALID_SCHEDULE_TYPES:
            return Response(
                {"error": f"Invalid schedule type. Valid types: {', '.join(self.VALID_SCHEDULE_TYPES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Очищаем старые файлы перед загрузкой новых
        self.cleanup_old_schedules()

        # Определяем целевую дату
        target_date = self.get_next_available_date(schedule_type)
        date_str = target_date.strftime('%Y.%m.%d')

        # Удаляем старые файлы с этой датой и типом
        existing_files = default_storage.listdir('schedule')[1]
        pattern = f"{date_str}_{schedule_type}_"
        for filename in existing_files:
            if filename.startswith(pattern):
                default_storage.delete(f"schedule/{filename}")

        # Генерируем уникальное имя файла
        unique_code = uuid.uuid4().hex[:6]
        file_name = f"schedule/{date_str}_{schedule_type}_{unique_code}.png"

        try:
            default_storage.save(file_name, ContentFile(uploaded_file.read()))
            return Response({
                "message": "File uploaded successfully",
                "path": file_name,
                "date": date_str
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Failed to save file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        """Обновление существующего расписания"""
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES.get('file')
        schedule_type = request.data.get('type')
        date = request.data.get('date')

        if schedule_type not in self.VALID_SCHEDULE_TYPES:
            return Response(
                {"error": f"Invalid schedule type. Valid types: {', '.join(self.VALID_SCHEDULE_TYPES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_date = datetime.strptime(date, "%Y.%m.%d").date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY.MM.DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Удаляем все файлы с указанной датой и типом
        existing_files = default_storage.listdir('schedule')[1]
        pattern = f"{date}_{schedule_type}_"
        found_files = [f for f in existing_files if f.startswith(pattern)]

        if not found_files:
            return Response({"error": "Schedule does not exist"}, status=status.HTTP_404_NOT_FOUND)

        for filename in found_files:
            default_storage.delete(f"schedule/{filename}")

        # Создаем новый файл с обновленным UUID
        unique_code = uuid.uuid4().hex[:6]
        file_name = f"schedule/{date}_{schedule_type}_{unique_code}.png"

        try:
            default_storage.save(file_name, ContentFile(uploaded_file.read()))
            return Response({
                "message": "Schedule updated successfully",
                "path": file_name,
                "date": date
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to update file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        """Удаление файла существующего расписания"""

        schedule_type = request.data.get('type')
        date = request.data.get('date')

        if schedule_type not in self.VALID_SCHEDULE_TYPES:
            return Response(
                {"error": f"Invalid schedule type. Valid types: {', '.join(self.VALID_SCHEDULE_TYPES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_date = datetime.strptime(date, "%Y.%m.%d").date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid date format. Use YYYY.MM.DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Удаляем все файлы с указанной датой и типом
        existing_files = default_storage.listdir('schedule')[1]
        pattern = f"{date}_{schedule_type}_"
        found_files = [f for f in existing_files if f.startswith(pattern)]

        if not found_files:
            return Response({"error": "Schedule does not exist"}, status=status.HTTP_404_NOT_FOUND)

        for filename in found_files:
            default_storage.delete(f"schedule/{filename}")

        return Response({"message": "File deleted successfully"}, status=status.HTTP_200_OK)

class BellTemplateListView(APIView):
    """
    Получение списка всех шаблонов расписаний.
    """
    def get(self, request):
        templates = BellTemplate.objects.all().order_by('id')
        serializer = BellTemplateSerializer(templates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BellTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SwitchActiveTemplateView(APIView):
    """
    Устанавливает активный шаблон звонков.
    """
    def post(self, request):
        template_id = request.data.get('template_id')
        if not template_id:
            return Response({"error": "Необходим template_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            template = BellTemplate.objects.get(pk=template_id)
        except BellTemplate.DoesNotExist:
            return Response({"error": "Шаблон не найден"}, status=status.HTTP_404_NOT_FOUND)

        # Сбрасываем активность у всех шаблонов и активируем выбранный
        BellTemplate.objects.update(is_active=False)
        template.is_active = True
        template.save()

        # Деактивируем все звонки и активируем звонки только для этого шаблона
        BellSchedule.objects.update(active=False)
        BellSchedule.objects.filter(template=template).update(active=True)

        return Response({"detail": "Активный шаблон обновлён"}, status=status.HTTP_200_OK)

class ActiveScheduleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        active_template = BellTemplate.objects.filter(is_active=True).first()
        if not active_template:
            return Response({"error": "Активное расписание не найдено"}, status=status.HTTP_404_NOT_FOUND)

        schedules = BellSchedule.objects.filter(template=active_template).order_by('scheduled_time')
        serializer = BellScheduleSerializer(schedules, many=True)

        return Response({
            "active_template": active_template.id,  # <-- Возвращай здесь ID, а не имя
            "active_template_name": active_template.name,  # <-- имя (опционально, но полезно)
            "schedules": serializer.data
        }, status=status.HTTP_200_OK)


class BellScheduleView(APIView):
    """
    Управление звонками в активном расписании.
    """
    def post(self, request):
        """
        Добавление нового звонка в активное расписание.
        """
        active_template = BellTemplate.objects.filter(is_active=True).first()
        if not active_template:
            return Response({"error": "Нет активного расписания"}, status=status.HTTP_400_BAD_REQUEST)

        request.data['template'] = active_template.id
        serializer = BellScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, schedule_id):
        """
        Редактирование звонка.
        """
        try:
            schedule = BellSchedule.objects.get(pk=schedule_id)
        except BellSchedule.DoesNotExist:
            return Response({"error": "Звонок не найден"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BellScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, schedule_id):
        """
        Удаление звонка.
        """
        try:
            schedule = BellSchedule.objects.get(pk=schedule_id)
        except BellSchedule.DoesNotExist:
            return Response({"error": "Звонок не найден"}, status=status.HTTP_404_NOT_FOUND)

        schedule.delete()
        return Response({"detail": "Звонок удалён"}, status=status.HTTP_204_NO_CONTENT)

class MediaBroadcastView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]  # Меняй при необходимости

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Файл обязателен'}, status=400)

        # Проверка MIME-типа
        content_type = file.content_type
        if not (content_type.startswith('image/') or content_type.startswith('video/')):
            return Response({'error': 'Допустимы только изображения и видео'}, status=400)

        # Генерация пути
        ext = file.name.split('.')[-1].lower()
        media_type = 'images' if content_type.startswith('image/') else 'videos'
        filename = f"{uuid.uuid4()}.{ext}"
        relative_path = os.path.join(media_type, filename)

        # Сохраняем файл
        saved_path = default_storage.save(relative_path, file)
        media_url = request.build_absolute_uri(default_storage.url(saved_path))
        cache.set(f"current_media_{media_type}", media_url, timeout=None)
        print(media_type)

        # WebSocket-рассылка
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "media.broadcast",
                "media_url": media_url,
                "media_type": "image" if content_type.startswith('image/') else "video"
            }
        )

        return Response({"status": "OK", "url": media_url}, status=200)

    def delete(self, request):
        channel_layer = get_channel_layer()

        media_type = request.data.get("media_type")
        if media_type not in ["images", "videos"]:
            return Response({"error": "Неверный тип медиа"}, status=400)

        cache_key = f"current_media_{media_type}"
        media_url = cache.get(cache_key)
        print(media_url)

        if media_url:
            parsed = urlparse(media_url)
            relative_path = parsed.path.replace(settings.MEDIA_URL, "").lstrip("/")
            if default_storage.exists(relative_path):
                default_storage.delete(relative_path)
            cache.delete(cache_key)

        # Отправляем команду скрытия
        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "media_hide",
                "media_url": None,
                "media_type": media_type,
                "action": "hide"
            }
        )

        return Response({"status": f"{media_type} скрыто и удалено"}, status=200)


class ClientView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.GET.get('token')

        if not token:
            client = Client.objects.all()
            serializer = ClientSerializer(client, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        client = Client.objects.get(token=token)
        serializer = ClientSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('name')
        token = uuid.uuid4().hex[:10]
        floor = request.data.get('floor')
        building = request.data.get('building')
        serializer = ClientSerializer(data={'name': name, 'token': token, 'floor': floor, 'building': building})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        token = request.data.get('token')
        Client.objects.get(token=token).delete()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "delete.client",
                'client': token
            }
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

class ChangeBackgroundView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        channel_layer = get_channel_layer()

        # Загрузка по ориентации
        orientation = request.data.get("orientation")
        if orientation not in ["horizontal", "vertical"]:
            return Response({"error": "Ориентация обязательна"}, status=400)

        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"error": "Файл обязателен"}, status=400)

        try:
            img = Image.open(image_file)
            img.verify()
        except UnidentifiedImageError:
            return Response({"error": "Неверное изображение"}, status=400)

        filename = f"{uuid.uuid4()}.{image_file.name.split('.')[-1]}"
        path = os.path.join("backgrounds", orientation, filename)
        saved_path = default_storage.save(path, image_file)
        image_url = request.build_absolute_uri(default_storage.url(saved_path))

        cache.set(f"background_{orientation}", image_url, timeout=None)

        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "change.background",
                "image_url": image_url,
                "orientation": orientation,
            }
        )

        return Response({"status": f"Фон для {orientation} установлен", "url": image_url}, status=200)

    def delete(self, request):
        reset = request.data.get("reset")
        channel_layer = get_channel_layer()

        if reset:

            for orientation in ["horizontal", "vertical"]:
                url = cache.get(f"background_{orientation}")
                if url:
                    # Преобразуем абсолютный URL в относительный путь
                    parsed = urlparse(url)
                    relative_path = parsed.path.replace(settings.MEDIA_URL, "").lstrip("/")
                    print("Удаляем:", relative_path)
                    if default_storage.exists(relative_path):
                        default_storage.delete(relative_path)
                cache.delete(f"background_{orientation}")

                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "change.background",
                        "image_url": None,
                        "orientation": orientation,
                    }
                )

            return Response({"status": "Оба фона сброшены"}, status=200)

class LogEntryListView(ListAPIView):
    queryset = LogEntry.objects.all().order_by('-timestamp')
    serializer_class = LogEntrySerializer
    permission_classes = [IsAdminUser]  # только для админов
    pagination_class = None  # можешь подключить свою пагинацию, если нужно

class AdminUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, user_id):
        if not request.user.is_admin:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        user = self.get_user(user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        if not request.user.is_admin:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        user = self.get_user(user_id)
        # Явно указываем частичное обновление
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        if not request.user.is_admin:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        user = self.get_user(user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CSRFToken(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = JsonResponse({'detail': 'CSRF token set'})
        response["X-CSRFToken"] = get_token(request)
        response["Access-Control-Expose-Headers"] = "X-CSRFToken"  # Добавить
        return response

@method_decorator(csrf_protect, name='dispatch')
class UsersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_admin or not request.user.is_authenticated:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.create(serializer.validated_data)
            activation_code = f"{random.randint(100000, 999999)}"
            user.activation_code = activation_code
            user.is_active = False
            user.save()

            subject = 'Код активации на сайте ' + settings.SITE_NAME
            template = 'activation_email.html'
            send_email(
                recepient_email=user.email,
                email_url=activation_code,  # используем код вместо ссылки
                subject=subject,
                template=template
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'User is not authorized!'}, status=status.HTTP_401_UNAUTHORIZED)

        email = request.data.get('email')
        if not User.objects.filter(email=email).exists():
            return Response({'detail':'Пользователя с таким email не существует!'}, \
                            status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(email=email)
        uid_encode = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = request.build_absolute_uri(
            reverse('reset_password', kwargs={'uid_encode':uid_encode, 'token':token})
        )
        subject = 'Сброс пароля на сайте' + settings.SITE_NAME
        template = 'reset_password.html'
        send_email(recepient_email=user.email, email_url=reset_url, \
                       subject=subject, template=template)
        return Response({'detail':'Письмо со сбросом пароля отправлено!'}, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        if not request.user.is_admin or not request.user.is_authenticated:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_protect, name='dispatch')
class UserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({'detail': 'Пользователь не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)

    def patch(self, request):
        old_password = request.data.get('old_password', None)
        new_password = request.data.get('new_password', None)
        firstname = request.data.get('firstname', None)
        lastname = request.data.get('lastname', None)
        email = request.data.get('email', None)
        is_active = request.data.get('is_active', None)
        is_admin = request.data.get('is_admin', None)

        if old_password and new_password:
            user = request.user
            if not user.check_password(old_password):
                return Response({'detail':'Неверный старый пароль!'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            return Response({'detail':'Смена пароля прошла успешно!'}, status=status.HTTP_200_OK)

        if firstname and lastname and email and is_active and is_admin:
            user = request.user
            user.firstname = firstname
            user.lastname = lastname
            user.email = email
            user.is_active = is_active
            user.is_admin = is_admin
            user.save()

        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.update(request.user, serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        user.delete()
        auth.logout(request)
        return Response({'detail': 'У тебя больше нет аккаунта (и дома, мы его продали).'}, status=status.HTTP_204_NO_CONTENT)

@method_decorator(csrf_protect, name='dispatch')
class SessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = auth.authenticate(request, email=email, password=password)
        if user:
            if user.is_active:
                auth.login(request, user)
                return Response(data={'detail':'Авторизация прошла успешно!'}, status=status.HTTP_200_OK)
            else:
                return Response(data={'detail':'Ваша почта не активирована!'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={'detail':'Неправильный логин или пароль!'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        auth.logout(request)
        return Response(data={'detail':'Вы вышли из учетки!'}, status=status.HTTP_200_OK)


class ActivateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        activation_code = request.data.get('activation_code')

        try:
            user = User.objects.get(email=email)
            if user.activation_code == activation_code:
                user.is_active = True
                user.activation_code = ""
                user.save()
                return Response({'detail': 'Аккаунт активирован успешно!'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Неверный код активации!'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'detail': 'Пользователь не найден!'}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_protect, name='dispatch')
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    # Отправка кода сброса на email
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()

        if user:
            reset_code = f"{random.randint(100000, 999999)}"
            user.reset_code = reset_code
            user.save()

            subject = 'Сброс пароля на сайте ' + settings.SITE_NAME
            template = 'reset_password.html'
            send_email(
                recepient_email=email,
                email_url=reset_code,
                subject=subject,
                template=template
            )

            return Response({'detail': 'Код для сброса пароля отправлен на ваш email.'}, status=200)
        return Response({'detail': 'Пользователь не найден.'}, status=400)

    # Установка нового пароля по коду
    def patch(self, request):
        email = request.data.get('email')
        reset_code = request.data.get('reset_code')
        new_password = request.data.get('new_password')

        user = User.objects.filter(email=email, reset_code=reset_code).first()

        if user:
            user.password = make_password(new_password)
            user.reset_code = None  # очищаем код после сброса пароля
            user.save()
            return Response({'detail': 'Пароль успешно изменён.'}, status=200)

        return Response({'detail': 'Неверный код сброса пароля.'}, status=400)