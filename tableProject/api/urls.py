from django.urls import path

from api.views import NewsView, ScheduleView, NewsListView, MessageListView, MessageView, SessionView, \
    ActivateView, CSRFToken, UserView, ResetPasswordView, \
    UpdateDisplayedNewsView, GetDisplayedNewsView, ParsedNewsView, UsersView, AdminUserView, BellTemplateListView, \
    SwitchActiveTemplateView, ActiveScheduleView, BellScheduleView, ClientView, LogEntryListView, \
    ChangeBackgroundView, MediaBroadcastView

urlpatterns = [
    path('news/', NewsListView.as_view(), name='news'),
    path('news/<int:id_news>/', NewsView.as_view(), name='new'),
    path('schedule/', ScheduleView.as_view(), name='schedule'),
    path('messages/', MessageListView.as_view(), name='messages'),
    path('messages/<id_message>/', MessageView.as_view(), name='message'),
    path('users/', UsersView.as_view(), name='users'),
    path('activate/', ActivateView.as_view(), name='activate'),
    path('reset_password/', ResetPasswordView.as_view(), name='reset_password'),
    path('user/', UserView.as_view(), name='user'),
    path('admin/users/<int:user_id>/', AdminUserView.as_view(), name='admin-user'),
    path('csrf/', CSRFToken.as_view(), name='csrf'),
    path('session/', SessionView.as_view(), name='session'),
    path('update-displayed-news/', UpdateDisplayedNewsView.as_view(), name='update-displayed-news'),
    path('displayed-news/', GetDisplayedNewsView.as_view(), name='get-displayed-news'),
    path('parse-news/', ParsedNewsView.as_view(), name='parse-news'),
    path('bell-templates/', BellTemplateListView.as_view(), name='bell-templates'),
    path('switch-template/', SwitchActiveTemplateView.as_view(), name='switch-template'),
    path('active-schedule/', ActiveScheduleView.as_view(), name='active-schedule'),
    path('bell-schedules/', BellScheduleView.as_view(), name='bell-schedules'),
    path('bell-schedules/<int:schedule_id>/', BellScheduleView.as_view(), name='bell-schedule-detail'),
    path('client/', ClientView.as_view(), name='client'),
    path('logs/', LogEntryListView.as_view(), name='log-list'),
    path('change-background/', ChangeBackgroundView.as_view(), name='change-background'),
    path('media-broadcast/', MediaBroadcastView.as_view(), name='media-broadcast'),

]