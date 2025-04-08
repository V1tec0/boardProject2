# # signals.py
# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync
# # from .models import DisplayedNews
# from .serializers import DisplayedNewsSerializer
#
# @receiver(post_save, sender=DisplayedNews)
# @receiver(post_delete, sender=DisplayedNews)
# def send_news_update(sender, instance, **kwargs):
#     channel_layer = get_channel_layer()
#     displayed_news = DisplayedNews.objects.all().order_by('-created_at')
#     serializer = DisplayedNewsSerializer(displayed_news, many=True)
#     async_to_sync(channel_layer.group_send)(
#         "news_updates",
#         {
#             "type": "news_update",
#             "data": serializer.data
#         }
#     )