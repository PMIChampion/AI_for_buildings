import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import InputFile
from aiogram.utils import executor
from ultralytics import YOLO
import os
import cv2
import numpy as np

API_TOKEN = 'API'

logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

model = YOLO('yolo11m-seg.pt')

colors = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255),
    (255, 0, 255), (192, 192, 192), (128, 128, 128), (128, 0, 0), (128, 128, 0),
    (0, 128, 0), (128, 0, 128), (0, 128, 128), (0, 0, 128), (72, 61, 139),
    (47, 79, 79), (47, 79, 47), (0, 206, 209), (148, 0, 211), (255, 20, 147)
]

async def process_image(image_path):
    if not os.path.exists('results'):
        os.makedirs('results')

    image = cv2.imread(image_path)
    image_orig = image.copy()
    h_or, w_or = image.shape[:2]
    image = cv2.resize(image, (640, 640))
    results = model(image)[0]

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

        mask_filename = os.path.join('results', f"{class_name}_{i}.png")
        cv2.imwrite(mask_filename, color_mask)
        mask_paths.append(mask_filename)

        image_orig = cv2.addWeighted(image_orig, 1.0, color_mask, 0.5, 0)

    new_image_path = os.path.join(
        'results', os.path.splitext(os.path.basename(image_path))[0] + '_segmented' + os.path.splitext(image_path)[1]
    )
    cv2.imwrite(new_image_path, image_orig)

    report = f"Список объектов:\n"
    for obj, count in object_count.items():
        report += f"- {obj}: {count}\n"

    return report, new_image_path, mask_paths




@dp.message_handler(commands=['start'])
async def start_command(message: types.Message):
    await message.reply("Привет! Отправь мне изображение, и я попробую найти объекты.")

@dp.message_handler(content_types=['photo'])
async def handle_photo(message: types.Message):
    photo = message.photo[-1]
    photo_path = f"downloads/{photo.file_id}.jpg"
    await photo.download(destination=photo_path)

    report, segmented_image_path, mask_paths = await process_image(photo_path)

    result_image = InputFile(segmented_image_path)
    await message.reply_photo(result_image, caption="Объекты:")

    for mask_path in mask_paths:
        mask_image = InputFile(mask_path)
        await message.reply_photo(mask_image)

    await message.reply(report)


if __name__ == '__main__':
    os.makedirs("downloads", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    executor.start_polling(dp, skip_updates=True)
