from django.shortcuts import render
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView


class MainView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return render(request, 'main.html')
class RegistrationView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        return render(request, 'registration.html')

class LoginView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return render(request, 'login.html')
