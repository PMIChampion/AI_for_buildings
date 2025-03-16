from aiogram import Dispatcher, types
from aiogram.types import Message
from bot.config.loader import bot
import json
import hashlib
import psycopg2

authorized_users = set()
engineer_users = set()


def get_db_connection():
    return psycopg2.connect(
        dbname="dump",
        user="postgres",
        password="8636",
        host="localhost",
        port=5432
    )


def hash_password(password):
    return hashlib.pbkdf2_hmac('sha256', password.encode(), b'salt', 100000).hex()



def check_credentials(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(password)
    cursor.execute("SELECT id, first_name, last_name, position FROM users_user WHERE email = %s AND password = %s", (email, password_hash))
    user = cursor.fetchone()
    conn.close()
    if user:
        return {
            "id": user[0],
            "first_name": user[1],
            "last_name": user[2],
            "position": user[3]
        }
    return None


def register_user(user_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(user_data['password'])
    cursor.execute("""
        INSERT INTO users_user (first_name, last_name, email, password, position, is_superuser, is_active, is_staff)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_data['firstName'],
        user_data['lastName'],
        user_data['email'],
        password_hash,
        user_data['position'],
        False,  # is_superuser
        True,  # is_active
        False  # is_staff
    ))
    conn.commit()
    conn.close()



async def handle_web_app_data(message: types.Message):
    try:
        data = message.web_app_data.data
        user_data = json.loads(data)

        if 'email' in user_data and 'newPassword' in user_data:
            email = user_data['email']
            new_password = user_data['newPassword']

            if update_password(email, new_password):
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text="Пароль успешно изменен! Теперь вы можете войти с новым паролем."
                )
            else:
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text="Ошибка: Аккаунт с указанной почтой не найден."
                )

        elif 'firstName' in user_data and 'lastName' in user_data:
            try:
                register_user(user_data)
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text="Регистрация успешна! Теперь вы можете авторизоваться."
                )
            except psycopg2.IntegrityError:
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text="Ошибка: Почта уже занята. Используйте другую почту."
                )

        elif 'email' in user_data and 'password' in user_data:
            email = user_data['email']
            password = user_data['password']

            user_info = check_credentials(email, password)
            if user_info:
                authorized_users.add(message.chat.id)
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text=f"Авторизация пройдена успешно, "
                         f"добро пожаловать, {user_info['first_name']} {user_info['last_name']}! "
                         f"Теперь можно отправлять изображения."
                )
                print(user_info)
                if user_info['position'].lower() == 'инженер':
                    engineer_users.add(message.chat.id)
            else:
                await bot.send_message(
                    chat_id=message.from_user.id,
                    text="Неверный логин или пароль."
                )

    except Exception as e:
        print("Ошибка при обработке данных:", e)
        await bot.send_message(
            chat_id=message.from_user.id,
            text=f"Произошла ошибка: {str(e)}"
        )


def update_password(email, new_password):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users_user WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user is None:
        conn.close()
        return False

    password_hash = hash_password(new_password)
    cursor.execute("UPDATE users_user SET password = %s WHERE email = %s", (password_hash, email))
    conn.commit()
    conn.close()
    return True  
