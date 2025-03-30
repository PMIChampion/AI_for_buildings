from rest_framework import serializers

from .models import Image
from projects.serializers import ProjectSerializer



class ImageSerializer(serializers.ModelSerializer):
    # category = ProjectSerializer(read_only=True)

    class Meta:
        model = Image
        fields = ['id', 'category', 'axis', 'image', 'processed_image', 'uploaded_by', 'comment', 'status',
                  'created_at']
        extra_kwargs = {'uploaded_by': {'read_only': True}}
