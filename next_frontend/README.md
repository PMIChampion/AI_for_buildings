# Руководство по запуску проекта

Этот проект состоит из фронтенда на Next.js и бэкенда на Django. В этом руководстве описано, как запустить обе части проекта на локальной машине в режиме разработки.

---

## Технологии

### Фронтенд
- **Фреймворк**: Next.js
- **Язык**: TypeScript/JavaScript
- **Менеджер пакетов**: npm или yarn

### Бэкенд
- **Фреймворк**: Django
- **Язык**: Python
- **База данных**: SPostgreSQL

---

## Предварительные требования

Перед началом убедитесь, что у вас установлены:
- [Node.js](https://nodejs.org/) (версия 16 или выше)
- [npm](https://www.npmjs.com/) или [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (версия 3.8 или выше)
- [pip](https://pip.pypa.io/) (менеджер пакетов Python)
- [PostgreSQL](https://www.postgresql.org/) (версия 12 или выше)
- 
---

## Установка и запуск фронтенда
1. Создайте пользователя:
```bash
CREATE USER ваш_пользователь WITH PASSWORD 'ваш_пароль';
```
2. Создайте базу данных:
```bash
CREATE DATABASE ваша_база_данных OWNER ваш_пользователь;
```
3. Перейдите в папку AI_for_buildings:
```bash
cd AI_for_buildings
```
4. Установите зависимости:
```
pip install -r requirements.txt
```
5. Настройте подключение к PostgreSQL в settings.py:
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ваша_база_данных',
        'USER': 'ваш_пользователь',
        'PASSWORD': 'ваш_пароль',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
6. Примените миграции:
```
python manage.py makemigrations
python manage.py migrate
```
7. Запустите сервер разработки:
```
python manage.py runserver
```
8. Перейдите в папку next-frontend:
```
cd next-frontend
```
9. Запустите сервер разработки:
```
npm run dev
```
или 
```
yarn dev
```
10. Откройте браузер и перейдите по адресу:
```
http://localhost:3000/login
```