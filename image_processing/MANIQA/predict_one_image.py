from pathlib import Path
import torch
import numpy as np
import random
import cv2

from torchvision import transforms
from .models.maniqa import MANIQA
from torch.utils.data import DataLoader
from .config import Config
from .utils.inference_process import ToTensor, Normalize
from tqdm import tqdm

# Относительные пути
relative_path_for_model = Path("..") / "AI_for_buildings" / "image_processing" / "models" / "ckpt_koniq10k.pt"
relative_path_for_image = Path("..")

# Абсолютные пути
absolute_path_for_model = relative_path_for_model.resolve()
absolute_path_for_image = relative_path_for_image.resolve()

# Отключаем все GPU
torch.cuda.is_available = lambda: False
torch.backends.cudnn.enabled = False  # Отключаем cudnn

# Принудительно используем CPU
device = torch.device('cpu')

def setup_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True


class Image(torch.utils.data.Dataset):
    def __init__(self, image_path, transform, num_crops=20):
        super(Image, self).__init__()
        self.img_name = Path(image_path).name  # Получаем имя файла
        self.img = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
        self.img = cv2.cvtColor(self.img, cv2.COLOR_BGR2RGB)
        self.img = np.array(self.img).astype('float32') / 255
        self.img = np.transpose(self.img, (2, 0, 1))

        self.transform = transform

        c, h, w = self.img.shape
        print(self.img.shape)
        new_h = 224
        new_w = 224

        self.img_patches = []
        for i in range(num_crops):
            top = np.random.randint(0, h - new_h)
            left = np.random.randint(0, w - new_w)
            patch = self.img[:, top: top + new_h, left: left + new_w]
            self.img_patches.append(patch)

        self.img_patches = np.array(self.img_patches)

    def get_patch(self, idx):
        patch = self.img_patches[idx]
        sample = {'d_img_org': patch, 'score': 0, 'd_name': self.img_name}
        if self.transform:
            sample = self.transform(sample)
        return sample


def get_result_maniqa(file_path):
    cpu_num = 1
    torch.set_num_threads(cpu_num)

    setup_seed(20)

    # Удаляем начальный слэш, если он есть
    file_path = file_path.lstrip("/\\")

    # Полный путь к изображению
    image_path = absolute_path_for_image / "AI_for_buildings" / file_path

    if not image_path.exists():
        raise FileNotFoundError(f"Файл не найден: {image_path}")

    # config file
    config = Config({
        "image_path": str(image_path),
        "num_crops": 20,
        "patch_size": 8,
        "img_size": 224,
        "embed_dim": 768,
        "dim_mlp": 768,
        "num_heads": [4, 4],
        "window_size": 4,
        "depths": [2, 2],
        "num_outputs": 1,
        "num_tab": 2,
        "scale": 0.8,
        "ckpt_path": str(absolute_path_for_model),
    })

    # data load
    Img = Image(image_path=config.image_path,
                transform=transforms.Compose([Normalize(0.5, 0.5), ToTensor()]),
                num_crops=config.num_crops)

    # model definition
    net = MANIQA(embed_dim=config.embed_dim, num_outputs=config.num_outputs, dim_mlp=config.dim_mlp,
                 patch_size=config.patch_size, img_size=config.img_size, window_size=config.window_size,
                 depths=config.depths, num_heads=config.num_heads, num_tab=config.num_tab, scale=config.scale)

    # Загрузка модели на CPU
    net.load_state_dict(torch.load(config.ckpt_path, map_location=device), strict=False)
    net.to(device)

    avg_score = 0
    for i in tqdm(range(config.num_crops)):
        with torch.no_grad():
            net.eval()
            patch_sample = Img.get_patch(i)
            patch = patch_sample['d_img_org']
            patch = torch.tensor(patch).unsqueeze(0).to(device)  # Преобразование в Tensor
            score = net(patch)
            avg_score += score

    avg_score /= config.num_crops
    return f"Image {Img.img_name} score: {avg_score}" if avg_score > 0 else "Качество изображения низкое"
