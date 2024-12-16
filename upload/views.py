from django.shortcuts import render
from django.http import HttpResponse
from .segmentation import process_image
from django.core.files.storage import FileSystemStorage

def upload_image(request):
    if request.method == "POST" and request.FILES["image"]:
        image = request.FILES["image"]
        fs = FileSystemStorage()
        input_path = fs.save(f"uploads/{image.name}", image)
        output_path = process_image(fs.path(input_path))

        return render(request, "result.html", {"output_image": fs.url(output_path)})

    return render(request, "upload.html")
