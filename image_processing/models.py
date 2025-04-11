from django.db import models
from django.contrib.auth import get_user_model
from storages.backends.s3boto3 import S3Boto3Storage

from projects.models import Project

User = get_user_model()

class Image(models.Model):
    category = models.ForeignKey(Project, on_delete=models.CASCADE)
    axis = models.CharField(max_length=20, default='')
    image = models.ImageField(storage=S3Boto3Storage(), upload_to='images/')
    processed_image = models.ImageField(storage=S3Boto3Storage(), upload_to='processed/', default='')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField(default='')
    status = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image uploaded by {self.uploaded_by} at {self.created_at}"
