from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from projects.models import Project
from projects.serializers import ProjectSerializer


class ApiProject(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Создать новый проект с чертежом",
        manual_parameters=[
            openapi.Parameter(
                name='name',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description='Название проекта'
            ),
            openapi.Parameter(
                name='blueprint_image',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description='Изображение чертежа (JPG/PNG)'
            )
        ],
        responses={
            201: ProjectSerializer(),
            400: "Неверные данные",
            401: "Не авторизован",
            403: "Нет прав доступа"
        }
    )
    def post(self, request):
        try:
            authorization = request.headers.get('Authorization', "").split(' ')[1]
            token = Token.objects.select_related('user').get(key=authorization)
            user = token.user
        except (IndexError, ObjectDoesNotExist):
            return Response({"message": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.position != "Инженер":
            return Response({"message": "You don't have permission"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)