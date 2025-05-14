from django.urls import path
from .views import ApiProject

urlpatterns = [
    path('projects/', ApiProject.as_view()),
]