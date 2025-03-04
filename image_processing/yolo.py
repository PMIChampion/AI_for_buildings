from ultralytics import YOLO
import os

relative_path_for_model = "image_processing/models/best-3.pt"
relative_path_for_image = "../DSKBuildings"
relative_path_for_image_processed = "../DskBuildings"

absolute_path_for_model = os.path.abspath(relative_path_for_model)
absolute_path_for_image = os.path.abspath(relative_path_for_image)
absolute_path_for_image_processed = os.path.abspath(relative_path_for_image_processed)


def get_result_yolo(file):
    model = YOLO(f"{absolute_path_for_model}")
    results = model([f"{absolute_path_for_image}{file}"])
    output_folder = "../DSKBuildings/media/processed"
    name = file.split("/")[-1]
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for result in results:
        result.show()
        result.save(filename=os.path.join(output_folder, f"{name}"))
        return "Изображение обработано"

    else:
        raise BaseException("Ошибка")