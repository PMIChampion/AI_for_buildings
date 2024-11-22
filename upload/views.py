from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import os
import numpy as np
from .utils import preprocess_image

def index(request):
    return render(request, 'index.html')

def upload_file(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)

    if 'file' not in request.FILES:
        return JsonResponse({"error": "Файл не найден"}, status=400)

    file = request.FILES['file']
    filename = file.name
    filepath = os.path.join(settings.UPLOAD_FOLDER, filename)

    with open(filepath, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    try:
        tensor = preprocess_image(filepath)

        filename_wo_ext = os.path.splitext(filename)[0]

        processed_path = os.path.join(settings.PROCESSED_FOLDER, f"{filename_wo_ext}.npy")
        np.save(processed_path, tensor)

        return JsonResponse({
            "message": "Изображение успешно загружено и обработано",
            "shape": tensor.shape
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
