from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from . import views
from . views import QuestionsListView


urlpatterns = [
    path('', include('django.contrib.auth.urls')),
    path('signup/', views.SignUp.as_view(), name='signup'),
    path('home/', QuestionsListView.as_view(), name='home'),
    path('home/<int:qid>', views.answer_view, name='answer'),
    path('',views.HomePage_view,name='homepage'),
    path('fetch/',views.fetch_results,name='fetch_results'),

]