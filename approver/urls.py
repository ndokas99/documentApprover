from django.urls import path
from approver import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login'),
    path('approvers', views.approvers, name='approvers'),
    path('tasks', views.tasks, name='tasks'),
    path('notifications', views.notifications, name='notifications'),
    path('approve/<str:doc_name>', views.approve, name='approve'),
    path('process', views.process_email, name='process'),
]
