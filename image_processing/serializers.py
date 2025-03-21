from rest_framework import serializers
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_by', 'created_at']
        extra_kwargs = {'uploaded_by': {'read_only': True}}