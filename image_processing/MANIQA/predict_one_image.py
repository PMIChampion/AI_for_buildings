import os
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

# Отключаем все GPU
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# Убедимся, что PyTorch не пытается использовать CUDA
torch.cuda.is_available = lambda: False
torch.backends.cudnn.enabled = False  # Отключаем cudnn

# Принудительно используем CPU
device = torch.device('cpu')

def setup_seed(seed):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    # Не используем cuda.manual_seed, так как не используем GPU
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True


class Image(torch.utils.data.Dataset):
    def __init__(self, image_path, transform, num_crops=20):
        super(Image, self).__init__()
        self.img_name = image_path.split('/')[-1]
        self.img = cv2.imread(image_path, cv2.IMREAD_COLOR)
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
    os.environ['OMP_NUM_THREADS'] = str(cpu_num)
    os.environ['OPENBLAS_NUM_THREADS'] = str(cpu_num)
    os.environ['MKL_NUM_THREADS'] = str(cpu_num)
    os.environ['VECLIB_MAXIMUM_THREADS'] = str(cpu_num)
    os.environ['NUMEXPR_NUM_THREADS'] = str(cpu_num)
    torch.set_num_threads(cpu_num)

    setup_seed(20)

    # config file
    config = Config({
        "image_path": f"/home/andrew/Рабочий стол/ЦК/DSKBuildings{file_path}",
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
        "ckpt_path": "/home/andrew/Рабочий стол/ЦК/DSKBuildings/image_processing/MANIQA/ckpt_koniq10k.pt",
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
    net.to(device)  # Перемещаем модель на CPU

    avg_score = 0
    for i in tqdm(range(config.num_crops)):
        with torch.no_grad():
            net.eval()
            patch_sample = Img.get_patch(i)
            patch = patch_sample['d_img_org']  # Данные на CPU
            patch = patch.unsqueeze(0)  # Добавление измерения для батча
            patch = patch.to(device)  # Убедитесь, что данные на CPU
            score = net(patch)  # Прогон через модель
            avg_score += score

    if avg_score / config.num_crops > 0:
        return "Image {} score: {}".format(Img.img_name, avg_score / config.num_crops)

    else:
        return "Качество изображения низкое"

