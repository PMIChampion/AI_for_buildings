from pathlib import Path
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np

# Относительные пути
relative_path_for_image = Path("..") / "AI_for_buildings"
relative_path_for_model = Path("image_processing") / "models" / "best_model.pth"

# Абсолютные пути
absolute_path_for_image = relative_path_for_image.resolve()
absolute_path_for_model = relative_path_for_model.resolve()

MODEL_PATH = absolute_path_for_model
CLASS_NAMES = ['concrete', 'other']
INPUT_SIZE = 600
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


# Загрузка модели
def load_model():
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features

    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, len(CLASS_NAMES))
    )

    # Загрузка весов
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()
    return model


def get_transform():
    return transforms.Compose([
        transforms.Resize(INPUT_SIZE + 50),
        transforms.CenterCrop(INPUT_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])


def predict_single_image(model, image_path, transform):
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        _, preds = torch.max(outputs, 1)

    return {
        'class': CLASS_NAMES[preds[0].item()],
        'probability': probabilities[0][preds[0]].item(),
        'all_probabilities': probabilities.cpu().numpy()[0]
    }


def get_result_resnet(file_path):
    """
    Predicts the class of an image using a pre-trained ResNet18 model.
    """
    model = load_model()
    transform = get_transform()

    # Удаляем начальный слэш, если он есть
    file_path = file_path.lstrip("/\\")

    # Полный путь к изображению
    image_path = absolute_path_for_image / file_path

    # Проверяем существование файла
    if not image_path.exists():
        raise FileNotFoundError(f"Файл не найден: {image_path}")

    # Предсказание
    single_result = predict_single_image(model, image_path, transform)
    if single_result['class'] == 'concrete':
        return single_result['class']
    else:
        raise TypeError("Не бетон")
