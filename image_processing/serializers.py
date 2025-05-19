from rest_framework import serializers

from .models import Image
from projects.serializers import ProjectSerializer

from users.models import User

class UploadedByUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']


class ImageSerializer(serializers.ModelSerializer):
    # category = ProjectSerializer(read_only=True)
    uploaded_by = UploadedByUserSerializer(read_only=True)
    
    class Meta:
        model = Image
        fields = ['id', 'category', 'axis', 'image', 'processed_image', 'uploaded_by', 'comment', 'status',
                  'created_at']
        extra_kwargs = {'uploaded_by': {'read_only': True}}
