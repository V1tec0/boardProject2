import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import LogEntry
from .serializers import LogEntrySerializer


class LogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated and request.method in ('POST', 'PATCH', 'DELETE'):
            if request.method != 'GET' and request.path.startswith('/api/'):
                try:
                    body_data = json.loads(request.body.decode('utf-8'))
                except Exception:
                    body_data = None

                log = LogEntry.objects.create(
                    user=request.user,
                    method=request.method,
                    path=request.path,
                    action=f"{request.method} {request.path}",
                    data=body_data
                )

                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'logs',
                    {
                        'type': 'new.log',
                        'log': LogEntrySerializer(log).data
                    }
                )

        return response
