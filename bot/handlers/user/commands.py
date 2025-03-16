from aiogram import types
from bot.config.loader import bot
from bot.config.config import YD_URL, URL
from bot.handlers.user.web_app_handler import engineer_users
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton


async def start_command(message: types.Message):
    # Создаем кнопку с Web App для авторизации
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    web_app_button = KeyboardButton("Войти", web_app=WebAppInfo(url=URL))
    keyboard.add(web_app_button)

    await bot.send_message(
        chat_id=message.from_user.id,
        text="Привет! Чтобы начать пользоваться ботом, войдите в аккаунт.",
        reply_markup=keyboard
    )

async def yd_url(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton("Тык", web_app=WebAppInfo(url=YD_URL))]
    ])
    if message.from_user.id in engineer_users:
        await bot.send_message(
            chat_id=message.from_user.id,
            text="Вот все изображения",
            reply_markup=keyboard
        )
    else:
        await bot.send_message(
            chat_id=message.from_user.id,
            text="К сожалению у вас нет прав для использования данной команды",
        )
