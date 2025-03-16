from aiogram import Dispatcher, filters
from bot.handlers.user import commands, processing, web_app_handler


def setup(dp: Dispatcher):
    dp.register_message_handler(commands.start_command, filters.CommandStart())
    dp.register_message_handler(web_app_handler.handle_web_app_data, content_types=['web_app_data'])
    dp.register_message_handler(processing.handle_photo, content_types=['photo'])
    dp.register_message_handler(commands.yd_url, filters.Command("all"))
