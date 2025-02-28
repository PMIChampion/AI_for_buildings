from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import Image
from users.models import User
from .serializers import ImageSerializer

from .MANIQA.predict_one_image import get_result_maniqa
from .resnet import get_result_resnet
from .yolo import get_result_yolo


class ApiImage(APIView):

    def get(self, request):
        authorization = request.headers.get('Authorization').split(' ')[1]
        user_id = Token.objects.get(key=authorization).user_id
        if User.objects.get(id=user_id).position == "Инженер":
            images = Image.objects.all()
            serializer = ImageSerializer(images, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "You don't have permission"}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=self.request.user)
            print(get_result_maniqa(serializer.data['image']))

            print(get_result_yolo(serializer.data['image']))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)