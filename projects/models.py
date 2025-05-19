from django.db import models
from storages.backends.s3boto3 import S3Boto3Storage

class Project(models.Model):
    name = models.TextField()
    #blueprint_image = models.ImageField(storage=S3Boto3Storage(), upload_to='uploads/blueprints/', null=True, blank=True)
    blueprint_image = models.ImageField(upload_to='uploads/blueprints/', null=True, blank=True)
    def __str__(self):
        return self.name
