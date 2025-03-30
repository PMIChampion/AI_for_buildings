from django.core.exceptions import ObjectDoesNotExist
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from projects.models import Project
from projects.serializers import ProjectSerializer


class ApiProject(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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