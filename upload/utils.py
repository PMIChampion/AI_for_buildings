import cv2
import numpy as np
import os

def preprocess_image(image_path, output_size=(640, 640)):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Невозможно открыть изображение")

    resized = cv2.resize(image, output_size)
    normalized = resized / 255.0
    transposed = np.transpose(normalized, (2, 0, 1))
    tensor = np.expand_dims(transposed, axis=0).astype(np.float32)
    return tensor