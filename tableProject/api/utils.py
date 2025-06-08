import logging
from urllib.parse import urljoin
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from bs4 import BeautifulSoup
from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime
import requests, shutil, time, logging
from requests_html import HTMLSession, AsyncHTMLSession
import nest_asyncio
import asyncio, pyzmail, os
from PIL import Image

import zipfile
import rarfile

from django.conf import settings
from imapclient import IMAPClient

logger = logging.getLogger(__name__)


@dataclass
class ParsedNews:
    title: str
    url: str
    image_url: Optional[str]
    text: Optional[str]
    date: Optional[str]


nest_asyncio.apply()


class MaufkParser:
    def __init__(self):
        self.base_url = "https://maufk.ru"
        self.session = HTMLSession()
        self.session.verify = False
        self.async_session = AsyncHTMLSession()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    async def _async_render(self, url):
        response = await self.async_session.get(url)
        await response.html.arender(sleep=2, scrolldown=2)
        return response.html

    def parse_news_page(self):
        try:
            # Синхронный запрос базовой страницы
            response = self.session.get(
                f"{self.base_url}/novosti/novosti.html",
                headers=self.headers,
                verify=False
            )

            # Асинхронный рендеринг с явным циклом событий
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            html = loop.run_until_complete(self._async_render(response.url))

            # Дальнейший парсинг
            return self._parse_html(html)

        except Exception as e:
            print(f"Error: {e}")
            return []
    def _parse_html(self, html) -> List[ParsedNews]:
        news_items = []

        # Новостные блоки
        news_blocks = html.find('div#novosti > div.row > div.col-md-12.col-lg-12')
        logger.info(f"Найдено блоков: {len(news_blocks)}")

        for block in news_blocks:
            try:
                # Заголовок
                title_elem = block.find('h2.zagolovok-b a', first=True)
                if not title_elem:
                    continue

                title = title_elem.text.strip()
                relative_url = title_elem.attrs.get('href', '')

                # URL
                absolute_url = urljoin(self.base_url, relative_url)

                # Изображение
                img_elem = block.find('img.novosti-risunok', first=True)
                img_url = urljoin(self.base_url, img_elem.attrs.get('src', '')) if img_elem else None

                # Текст и дата
                text_elem = block.find('p.novosti-tekst', first=True)
                text_content = ""
                date = None

                if text_elem:
                    # Извлекаем дату из текста
                    text = text_elem.text.replace('\n', ' ').strip()
                    date_part = text.split()[0] if text else ""

                    if any(c.isdigit() for c in date_part):
                        date = date_part
                        text_content = text[len(date_part):].strip()

                    # Обрезаем до "Подробнее"
                    if 'Подробнее' in text_content:
                        text_content = text_content.split('Подробнее')[0].strip()

                news_items.append(ParsedNews(
                    title=title,
                    url=absolute_url,
                    image_url=img_url,
                    text=text_content,
                    date=date
                ))

            except Exception as e:
                logger.warning(f"Ошибка обработки блока: {e}")

        return news_items

def send_message_logic(pk, show_at=None, duration=None, action="show"):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from .models import Message

    msg = Message.objects.get(pk_message=pk)
    channel_layer = get_channel_layer()

    if action == "show":
        if duration:
            import threading
            def hide_later():
                import time
                time.sleep(duration)
                msg.isshowing = False
                msg.save()

                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "send.message",
                        "pk_message": msg.pk_message,
                        "action": "hide"
                    }
                )
                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "message_status",
                        "pk_message": msg.pk_message,
                        "isshowing": False
                    }
                )

            threading.Thread(target=hide_later).start()

        msg.isshowing = True
        msg.save()

        if show_at:
            import datetime
            import time
            import threading

            now = datetime.datetime.now().time()
            target = datetime.datetime.strptime(show_at, "%H:%M:%S").time()

            now_seconds = now.hour * 3600 + now.minute * 60 + now.second
            target_seconds = target.hour * 3600 + target.minute * 60 + target.second

            delay = target_seconds - now_seconds
            if delay < 0:
                delay += 86400  # на случай, если указано время на следующий день

            def send_later():
                msg.isshowing = True
                msg.save()

                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "send.message",
                        "pk_message": msg.pk_message,
                        "text": msg.text,
                        "isprimary": msg.isprimary,
                        "action": "show",
                        "duration": duration  # важно передать!
                    }
                )

                async_to_sync(channel_layer.group_send)(
                    "websocket_group",
                    {
                        "type": "message_status",
                        "pk_message": msg.pk_message,
                        "isshowing": True
                    }
                )

                # если задана длительность — сразу планируем скрытие
                if duration:
                    def hide_later():
                        time.sleep(duration)
                        msg.isshowing = False
                        msg.save()
                        async_to_sync(channel_layer.group_send)(
                            "websocket_group",
                            {
                                "type": "send.message",
                                "pk_message": msg.pk_message,
                                "action": "hide"
                            }
                        )
                        async_to_sync(channel_layer.group_send)(
                            "websocket_group",
                            {
                                "type": "message_status",
                                "pk_message": msg.pk_message,
                                "isshowing": False
                            }
                        )

                    threading.Thread(target=hide_later).start()

            threading.Timer(delay, send_later).start()
            return

        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "send.message",
                "pk_message": msg.pk_message,
                "text": msg.text,
                "isprimary": msg.isprimary,
                "action": "show",
                "duration": duration
            }
        )

        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "message_status",
                "pk_message": msg.pk_message,
                "isshowing": True
            }
        )


    elif action == "hide":
        msg.isshowing = False
        msg.save()

        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "send.message",
                "pk_message": msg.pk_message,
                "action": "hide"
            }
        )

        async_to_sync(channel_layer.group_send)(
            "websocket_group",
            {
                "type": "message_status",
                "pk_message": msg.pk_message,
                "isshowing": False
            }
        )

def is_valid_image(file_path: str) -> bool:
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def process_schedule_image(file_path: str, schedule_type: str):
    try:
        # Подставь сюда актуальный URL своего API
        url = 'http://localhost:8000/api/schedule/'  # например: http://localhost:8000/api/schedules/
        files = {'image': open(file_path, 'rb')}
        data = {'type': schedule_type}
        response = requests.post(url, files=files, data=data)
        if response.status_code == 201:
            print(f"[upload] Успешно отправлено: {file_path}")
        else:
            print(f"[upload] Ошибка {response.status_code} при отправке {file_path}: {response.text}")
    except Exception as e:
        print(f"[upload] Исключение при отправке {file_path}: {e}")

def process_new_emails():
    print("[imap] Обработка новых писем...")

    try:
        with IMAPClient(settings.IMAP_HOST, ssl=settings.IMAP_USE_SSL) as client:
            client.login(settings.IMAP_EMAIL, settings.IMAP_PASSWORD)
            client.select_folder(settings.IMAP_FOLDER)

            messages = client.search(['UNSEEN', 'FROM', 'manp80519@gmail.com'])
            print(f"[imap] Найдено новых писем: {len(messages)}")

            for uid in messages:
                client.add_flags(uid, ['\\Seen'])
                raw_message = client.fetch([uid], ['BODY[]', 'FLAGS'])[uid][b'BODY[]']
                message = pyzmail.PyzMessage.factory(raw_message)

                print("----- Новое письмо -----")
                print(f"От кого: {message.get_address('from')[1]}")
                print(f"Тема: {message.get_subject()}")
                print(f"Дата: {message.get_decoded_header('date')}")

                save_dir = os.path.join(settings.MEDIA_ROOT, 'mail')
                os.makedirs(save_dir, exist_ok=True)

                for part in message.mailparts:
                    if not part.filename:
                        continue

                    filename = part.filename
                    if not filename.lower().endswith(('.zip', '.rar')):
                        continue  # Пропускаем неархивы

                    file_path = os.path.join(save_dir, filename)
                    with open(file_path, "wb") as f:
                        f.write(part.get_payload())

                    print(f"[imap] Архив получен: {file_path}")


                    # Распаковка
                    extract_path = os.path.join(settings.MEDIA_ROOT, 'processed_schedule',
                                                os.path.splitext(filename)[0])
                    os.makedirs(extract_path, exist_ok=True)

                    try:
                        if zipfile.is_zipfile(file_path):
                            shutil.unpack_archive(file_path, extract_path)
                        elif rarfile.is_rarfile(file_path):
                            with rarfile.RarFile(file_path) as rf:
                                rf.extractall(extract_path)
                        else:
                            raise ValueError("Неподдерживаемый тип архива")
                    except Exception as e:
                        print(f"[unpack] Ошибка распаковки {filename}: {e}")
                        continue

                    # Обработка изображений
                    for root, _, files in os.walk(extract_path):
                        for fname in files:
                            if not fname.lower().endswith(".png"):
                                continue
                            fpath = os.path.join(root, fname)

                            if not is_valid_image(fpath):
                                print(f"[validate] Файл не является валидным изображением: {fpath}")
                                continue

                            # определяем тип
                            lower = fname.lower()
                            if "_s" in lower:
                                schedule_type = "s"
                            elif "_p" in lower:
                                schedule_type = "p"
                            elif "_z" in lower:
                                schedule_type = "z"
                            else:
                                schedule_type = "unknown"

                            process_schedule_image(fpath, schedule_type)

                print("-------------------------")

    except Exception as e:
        print(f"[imap] Ошибка при обработке писем: {e}")

def imap_idle_worker():
    while True:
        try:
            print("[imap] Подключение к:", settings.IMAP_HOST)
            with IMAPClient(settings.IMAP_HOST, ssl=settings.IMAP_USE_SSL) as client:
                client.login(settings.IMAP_EMAIL, settings.IMAP_PASSWORD)
                client.select_folder(settings.IMAP_FOLDER)
                start_time = time.time()

                while time.time() - start_time < settings.IMAP_RECONNECT_INTERVAL:
                    print("[imap] IDLE-сессия началась...")
                    client.idle()
                    try:
                        responses = client.idle_check(timeout=settings.IMAP_IDLE_TIMEOUT)
                        if responses:
                            print("[imap] Найдены новые события:", responses)
                            process_new_emails()
                    finally:
                        client.idle_done()


        except Exception as e:
            print(f"[imap] Ошибка: {e}")

        print("[imap] Переподключение через 5 секунд...")
        time.sleep(5)

def send_email(recepient_email, email_url, subject, template):
    # subject = 'Активация с сайта ' + settings.SITE_NAME
    from_email = settings.EMAIL_HOST_USER
    to = [recepient_email]
    html_content = render_to_string(template, {
        'email_url': email_url,
    })
    text_content = strip_tags(html_content)
    message = EmailMultiAlternatives(subject=subject, \
                                     body=text_content, \
                                     from_email=from_email, \
                                     to=to)
    message.attach_alternative(html_content, 'text/html')
    message.send()

