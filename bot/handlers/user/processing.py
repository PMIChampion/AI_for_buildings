import yadisk
from aiogram import types
from bot.handlers.user.web_app_handler import authorized_users
from bot.config.loader import bot
from bot.config.config import YD_TOKEN, LOCAL_PATH as LP
from aiogram.types import InputFile
from ultralytics import YOLO
import os
import cv2
import numpy as np
import aiohttp
import asyncio
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from bot.models.MANIQA.predict_one_image import get_result_maniqa


# YOLO_model = YOLO('models/yolo11m-seg.pt')
YOLO_model = YOLO('models/best-5.pt')
RESNET_MODEL = 'models/best_model.pth'
CLASS_NAMES = ['concrete', 'other']  # Порядок должен совпадать с обучением
INPUT_SIZE = 600  # Должно соответствовать размеру при обучении
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

colors = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255),
    (255, 0, 255), (192, 192, 192), (128, 128, 128), (128, 0, 0), (128, 128, 0),
    (0, 128, 0), (128, 0, 128), (0, 128, 128), (0, 0, 128), (72, 61, 139),
    (47, 79, 79), (47, 79, 47), (0, 206, 209), (148, 0, 211), (255, 20, 147)
]


def load_model():
    # Инициализация модели (архитектура должна совпадать с обучением)
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features

    # Модифицируйте архитектуру как при обучении
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, len(CLASS_NAMES))
    )

    # Загрузка весов
    model.load_state_dict(torch.load(RESNET_MODEL, map_location=DEVICE))
    model = model.to(DEVICE)
    model.eval()  # Переключение в режим оценки
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


async def process_with_resnet(image_path):
    model = load_model()
    transform = get_transform()

    # print("Single image prediction:")
    single_result = predict_single_image(model, image_path, transform)
    # print(f"Class: {single_result['class']}")
    # print(f"Probability: {single_result['probability']:.4f}")
    # print(f"All probabilities: {dict(zip(CLASS_NAMES, single_result['all_probabilities']))}")
    return single_result

async def upload_file(session, file_path, disk_path):
    with open(file_path, 'rb') as f:
        y = yadisk.YaDisk(token=YD_TOKEN)
        list_path = disk_path.split("/")
        seg = "segmented.jpg"
        if "downloads" not in list_path:
            try:
                path = '/'.join(list_path[:-1])
                try:
                    info = y.get_meta(path)
                except:
                    y.mkdir(path)
                    print(f"Папка {path} успешно создана на Яндекс Диске.")
            except Exception as e:
                print(f"Не удалось создать папку: {e}")
        y.upload(f, disk_path)
        print(f"Файл {f} успешно загружен на Яндекс Диск.")


async def upload(local_file_path, disk_file_path):
    async with aiohttp.ClientSession() as session:
        await upload_file(session, local_file_path, disk_file_path)


async def handle_photo(message: types.Message):
    if message.chat.id not in authorized_users:
        await bot.send_message(chat_id=message.from_user.id,
                               text="Сначала авторизуйтесь с помощью /start")
        return

    photo = message.photo[-1]
    local_file_path = f"{LP}/downloads/{photo.file_id}.jpg"
    await photo.download(destination=local_file_path)

    is_clear = await get_result_maniqa(local_file_path)
    await bot.send_message(chat_id=message.from_user.id,
                               text=is_clear)
    if "низкое" in is_clear.split():
        return

    resnet_result = await process_with_resnet(local_file_path)
    if resnet_result['class'] not in CLASS_NAMES or resnet_result['probability'] < 0.7:
        await bot.send_message(chat_id=message.from_user.id,
                               text=f"Изображение относится к классу {resnet_result['class']} "
                                    f"с точностью {resnet_result['probability']:.4f}, так что оно не подходит")
        return

    await bot.send_message(chat_id=message.from_user.id,
                           text=f"Изображение относится к классу {resnet_result['class']} "
                                f"с точностью {resnet_result['probability']:.4f}")

    upload_file_yd(local_file_path)

    report, segmented_image_path, mask_paths = await process_image(local_file_path, photo.file_id)

    if segmented_image_path is not None and mask_paths is not None:

        result_image = InputFile(segmented_image_path)

        upload_file_yd(segmented_image_path)

        await bot.send_photo(chat_id=message.from_user.id,
                             photo=result_image,
                             caption="Объекты:")

        for mask_path in mask_paths:
            mask_image = InputFile(mask_path)
            upload_file_yd(mask_path)
            await bot.send_photo(chat_id=message.from_user.id,
                                 photo=mask_image)

    await bot.send_message(chat_id=message.from_user.id,
                           text=report)


async def process_image(image_path, id):
    try:
        image = cv2.imread(image_path)
        image_orig = image.copy()
        h_or, w_or = image.shape[:2]
        image = cv2.resize(image, (640, 640))
        results = YOLO_model(image)[0]

        classes_names = results.names
        classes = results.boxes.cls.cpu().numpy()
        masks = results.masks.data.cpu().numpy()

        object_count = {}
        mask_paths = []

        for i, mask in enumerate(masks):
            class_id = int(classes[i])
            class_name = classes_names[class_id]
            object_count[class_name] = object_count.get(class_name, 0) + 1

            color = colors[class_id % len(colors)]

            mask_resized = cv2.resize(mask, (w_or, h_or))

            color_mask = np.zeros((h_or, w_or, 3), dtype=np.uint8)
            color_mask[mask_resized > 0] = color
            if not os.path.exists(f'{LP}/results/{id}'):
                os.makedirs(f'{LP}/results/{id}')
            mask_filename = f'{LP}/results/{id}/{class_name}_{i}.png'
            cv2.imwrite(mask_filename, color_mask)
            mask_paths.append(mask_filename)

            image_orig = cv2.addWeighted(image_orig, 1.0, color_mask, 0.5, 0)

        new_image_path = os.path.join(

            'results', os.path.splitext(os.path.basename(image_path))[0] + '_segmented' + os.path.splitext(image_path)[1]
        )
        new_image_path = f"{LP}/" + new_image_path.replace('\\', '/')
        new_image_path = new_image_path.split("/")
        new_image_path.append(new_image_path[-1])
        new_image_path[-2] = id
        new_image_path = '/'.join(new_image_path)

        cv2.imwrite(new_image_path, image_orig)

        report = f"Список объектов:\n"
        for obj, count in object_count.items():
            report += f"- {obj}: {count}\n"

    except AttributeError:
        report = "Я не могу разобрать тут объекты"
        new_image_path = None
        mask_paths = None

    return report, new_image_path, mask_paths


def upload_file_yd(local_path):
    disk_file_path = f"/DSK_bot/{local_path}"
    y = yadisk.YaDisk(token=YD_TOKEN)
    if y.check_token():
        print("Токен действителен, можно приступать к работе с файлами на Яндекс Диске.")
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(upload(local_path, disk_file_path))
        except Exception as e:
            print(f"Не удалось загрузить файл: {e}")
    else:
        print("Токен недействителен, попробуйте получить его заново.")