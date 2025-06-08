from django.apps import AppConfig
import threading

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from api.utils import imap_idle_worker

        if threading.active_count() < 5:  # защита от двойного запуска в Django shell
            t = threading.Thread(target=imap_idle_worker, daemon=True)
            t.start()