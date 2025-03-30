from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError

from .models import Image
from users.models import User
from .serializers import ImageSerializer

from .yolo import get_result_yolo
from .MANIQA.predict_one_image import get_result_maniqa
from .resnet import get_result_resnet

class ApiImage(APIView):
    permission_classes = [IsAuthenticated]

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

    def post(self, request):
        serializer = ImageSerializer(data=request.data)
        if not serializer.is_valid():
            image_instance = serializer.save(uploaded_by=request.user)

            if get_result_maniqa(image_instance.image.path) < 0.2:
                image_instance.delete()
                raise ValidationError("Низкое качество изображения")

            if get_result_resnet(image_instance.image.path) != "concrete":
                image_instance.delete()
                raise ValidationError("Не бетон")

            processed_image_path = get_result_yolo(image_instance.image.path)
            image_instance.processed_image = processed_image_path
            image_instance.save()

            return Response(ImageSerializer(image_instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, pk):
        image_instance = get_object_or_404(Image, pk=pk)

        serializer = ImageSerializer(image_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


