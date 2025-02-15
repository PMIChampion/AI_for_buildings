from django.urls import path
from .views import RegistrationView, LoginView, MainView

urlpatterns = [
    path('', MainView.as_view()),
    path('registration/', RegistrationView.as_view()),
    path('login/', LoginView.as_view()),
]