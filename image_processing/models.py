
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Image(models.Model):
    image = models.ImageField(upload_to='uploads/images/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image uploaded by {self.uploaded_by} at {self.created_at}"

