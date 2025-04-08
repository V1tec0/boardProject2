from django.core.management.base import BaseCommand
from api.utils import check_and_trigger_bells

class Command(BaseCommand):
    help = "Проверяет расписание звонков и отправляет уведомления"

    def handle(self, *args, **kwargs):
        result = check_and_trigger_bells()
        self.stdout.write(self.style.SUCCESS(result))
