from django.urls import path
from .views import ApiImage

urlpatterns = [
    path('image_processing/', ApiImage.as_view()),
]