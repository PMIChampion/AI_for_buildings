from django.urls import path
from .views import ApiImage

urlpatterns = [
    path('image_processing/<int:pk>/', ApiImage.as_view()),
]