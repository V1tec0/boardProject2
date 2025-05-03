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
import re
import time, logging
from requests_html import HTMLSession, AsyncHTMLSession
import nest_asyncio
import asyncio

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

def send_message_logic(pk, show_at, duration):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from .models import Message

    print(f'Запуск логики отправки сообщения: {pk}, {show_at=}, {duration=}')

    msg = Message.objects.get(pk_message=pk)
    msg.isshowing = True
    msg.save()

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "websocket_group",
        {
            "type": "send.message",
            "pk_message": msg.pk_message,
            "text": msg.text,
            "isprimary": msg.isprimary,
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
                    "type": "message_status",
                    "pk_message": msg.pk_message,
                    "isshowing": False
                }
            )
        threading.Thread(target=hide_later).start()


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

