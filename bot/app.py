from aiogram.utils import executor
import handlers
from config.loader import dp
import os
import nest_asyncio

if __name__ == '__main__':
    os.makedirs("images/downloads", exist_ok=True)
    os.makedirs("images/results", exist_ok=True)
    nest_asyncio.apply()
    handlers.setup(dp)
    executor.start_polling(dp)

