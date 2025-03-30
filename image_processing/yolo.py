from pathlib import Path
from ultralytics import YOLO
import os

# Относительные пути
relative_path_for_model = Path("image_processing") / "models" / "best-3.pt"
relative_path_for_image = Path("..") / "AI_for_buildings"
relative_path_for_image_processed = Path("..") / "AI_for_buildings"

# Абсолютные пути
absolute_path_for_model = relative_path_for_model.resolve()
absolute_path_for_image = relative_path_for_image.resolve()
absolute_path_for_image_processed = relative_path_for_image_processed.resolve()


def get_result_yolo(file):
    """
    Processes an image using the YOLO model.

    This function loads a pre-trained YOLO model, applies it to the specified image, and saves the processed image
    to a designated folder. If the output folder does not exist, it is created automatically.

    Args:
        file (str): The relative path to the image file to be processed.

    Returns:
        str: A message "Изображение обработано" (Image processed) if the processing is successful.

    Raises:
        BaseException: Raised if an error occurs during the image processing.

    Notes:
        - The YOLO model is loaded from the specified checkpoint.
        - The processed image is saved to the folder "../DSKBuildings/media/processed".
        - If the output folder does not exist, it is created automatically.
    """
    # Удаляем начальный слэш, если он есть
    if file.startswith("/"):
        file = file[1:]

    # Полный путь к изображению
    # image_path = absolute_path_for_image / file
    image_path = '/' + file

    # Загрузка модели
    model = YOLO(str(absolute_path_for_model))

    # Обработка изображения
    results = model([str(image_path)])

    # Путь к папке для сохранения обработанных изображений
    output_folder = Path("") / "media" / "processed"
    output_folder.mkdir(parents=True, exist_ok=True)

    # Имя файла
    name = Path(file).name

    # Сохранение результата
    for result in results:
        result.show()
        result.save(filename=str(output_folder / name))
        return str(output_folder / name)

    else:
        raise BaseException("Ошибка")