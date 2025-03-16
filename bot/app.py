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

# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import secrets
#
# # Генерация кода подтверждения
# def generate_verification_code():
#     return ''.join(secrets.choice('0123456789') for _ in range(6))
#
# # Отправка письма
# def send_verification_email(email, code):
#     # Настройки SMTP
#     smtp_server = 'smtp.gmail.com'  # Например, для Gmail
#     smtp_port = 587  # Порт для TLS
#     sender_email = 'kotka19062004@gmail.com'  # Ваша почта
#     sender_password = 'nmfe wfdq cici lbcp'  # Пароль от почты
#
#     # Создание сообщения
#     message = MIMEMultipart()
#     message['From'] = sender_email
#     message['To'] = email
#     message['Subject'] = 'Подтверждение почты'
#
#     # Текст письма
#     body = f'Ваш код подтверждения: {code}'
#     message.attach(MIMEText(body, 'plain'))
#
#     # Отправка через SMTP
#     try:
#         with smtplib.SMTP(smtp_server, smtp_port) as server:
#             server.starttls()  # Включаем шифрование TLS
#             server.login(sender_email, sender_password)
#             server.sendmail(sender_email, email, message.as_string())
#         print('Письмо успешно отправлено!')
#     except Exception as e:
#         print(f'Ошибка при отправке письма: {e}')
#
#
# # Пример использования
# if __name__ == '__main__':
#     user_email = 'romanovserg2004@yandex.ru'  # Почта пользователя
#     verification_code = generate_verification_code()
#     print(f'Сгенерированный код: {verification_code}')
#     send_verification_email(user_email, verification_code)
