from django.db import models

class Project(models.Model):
    name = models.TextField()
    blueprint_image = models.ImageField(upload_to='uploads/blueprints/', null=True, blank=True)

    def __str__(self):
        return self.name
