import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
BOT_TOKEN = os.getenv("BOT_TOKEN")
YD_TOKEN = os.getenv("YD_TOKEN")
YD_URL = os.getenv("YD_URL")
URL = os.getenv("URL")
LOCAL_PATH = os.getenv("LOCAL_PATH")

