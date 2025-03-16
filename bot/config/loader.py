from aiogram import Bot, Dispatcher
from bot.config.config import BOT_TOKEN
from aiogram.contrib.fsm_storage.memory import MemoryStorage
#  from config.config import BOT_TOKEN


# Для сервера
# proxy_url = 'http://proxy.server:3128'
# bot = Bot(token=BOT_TOKEN, proxy=proxy_url)
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())
user_data = {

}
