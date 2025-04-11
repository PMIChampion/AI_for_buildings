import os
from pathlib import Path

from django.core.files.base import ContentFile
from drf_yasg import openapi
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from django.core.files.storage import default_storage

from .models import Image
from users.models import User
from .serializers import ImageSerializer

from .yolo import get_result_yolo
from .MANIQA.predict_one_image import get_result_maniqa
from .resnet import get_result_resnet

class ApiImage(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, pk):
        try:
            authorization = request.headers.get('Authorization', "").split(' ')[1]
            token = Token.objects.select_related('user').get(key=authorization)
            user = token.user
        except (IndexError, ObjectDoesNotExist):
            return Response({"message": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.position != "Инженер":
            return Response({"message": "You don't have permission"}, status=status.HTTP_403_FORBIDDEN)

        images = Image.objects.filter(category=pk)
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Загрузить изображение для обработки",
        manual_parameters=[
            openapi.Parameter(
                name="image",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="Изображение для анализа (JPG/PNG)"
            ),
            openapi.Parameter(
                name="category",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID категории (проекта)"
            ),
            openapi.Parameter(
                name="axis",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description="Ось (например, 'X', 'Y', 'Z')"
            ),
            openapi.Parameter(
                name="comment",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=False,
                description="Комментарий к изображению"
            ),
        ],
        responses={
            201: ImageSerializer(),
            400: "Некорректные данные",
            401: "Не авторизован",
            403: "Нет прав доступа"
        }
    )
    def post(self, request):
        serializer = ImageSerializer(data=request.data)


            #     image_instance.save()
        #
            # if get_result_maniqa('/home/andrew/PycharmProjects/AI_for_buildings/tmp/photo.jpg') < 0.2:
            #     image_instance.delete()
            #     raise ValidationError("Низкое качество изображения")

            # if get_result_resnet(image_instance.image.path) != "concrete":
            #     image_instance.delete()
            #     raise ValidationError("Не бетон")
        #
        #     file_key = image_instance.image.name
        #     get_result_yolo(file_key)
        #
        if serializer.is_valid():
            image_instance = serializer.save(uploaded_by=request.user)
            image_file = image_instance.image

            image_file.seek(0)
            image_bytes = image_file.read()

            temp_path = f'tmp/{Path(image_file.name).name}'
            default_storage.save(temp_path, ContentFile(image_bytes))

            # YOLO
            processed_image_path = get_result_yolo(temp_path)

            with open(processed_image_path, 'rb') as processed_file:
                processed_content = processed_file.read()
                processed_filename = Path(image_file.name).name
                image_instance.processed_image.save(processed_filename, ContentFile(processed_content))

            image_instance.save()

            try:
                default_storage.delete(temp_path)
                os.remove(processed_image_path)
                os.remove(temp_path)
            except Exception as e:
                print(f"Cleanup failed: {e}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, pk):
        image_instance = get_object_or_404(Image, pk=pk)

        serializer = ImageSerializer(image_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


