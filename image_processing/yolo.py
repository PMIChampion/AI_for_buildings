from ultralytics import YOLO
import os

def get_result_yolo(file):
    model = YOLO("/home/andrew/Рабочий стол/ЦК/DSKBuildings/image_processing/best-3.pt")
    results = model([f"/home/andrew/Рабочий стол/ЦК/DSKBuildings/{file}"])
    output_folder = "/home/andrew/Рабочий стол/ЦК/DSKBuildings/media/processed/"
    name = file.split("/")[-1]
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for result in results:
        result.show()
        result.save(filename=os.path.join(output_folder, f"{name}"))
        return "Изображение обработано"

    else:
        raise BaseException("Ошибка")