document.addEventListener("DOMContentLoaded", function() {
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("Telegram.WebApp инициализирован.");
        Telegram.WebApp.ready();
    } else {
        console.error("Telegram.WebApp не инициализирован.");
    }
});

emailjs.init('LBRlpbKBcDeugYBIC');
Template_ID_recovery = "template_vbiyu3l";
Template_ID_register = "template_uclulfi";
Service_ID = "service_5ufba1i";


// Валидация почты
function validateEmail(email) {
    const regex = /^[^\s@]+@(gmail\.com|yandex\.ru|mail\.ru)$/;
    return regex.test(email);
}

// Валидация пароля
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
}

// Отправка кода подтверждения
async function sendConfirmationCode() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');

    if (!validateEmail(email)) {
        emailError.textContent = "Некорректная почта. Используйте Gmail, Yandex или Mail.ru.";
        emailError.style.display = "block";
        return;
    }

    const code = Math.floor(100000 + Math.random() * 900000); // Генерация 6-значного кода

    try {
        const response = await emailjs.send(Service_ID, Template_ID_register, {
            to_email: email,
            code: code,
        });

        if (response.status === 200) {
            // Сохраняем код в localStorage для проверки
            localStorage.setItem('confirmationCode', code);
            emailError.style.display = "none";
            alert("Код подтверждения отправлен на вашу почту.");
        } else {
            alert("Ошибка при отправке кода.");
        }
    } catch (error) {
        console.error("Ошибка при отправке письма:", error);
        alert("Произошла ошибка при отправке кода. Проверьте консоль для подробностей.");
    }
}

// Переключение видимости пароля
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// Функция для отображения ошибки
function showError(message) {
    alert(message);
}

// Вход
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Пожалуйста, заполните все поля.');
        return;
    }

    const data = { email, password };
    console.log("Данные для входа:", data);  // Логируем данные

    if (Telegram.WebApp && Telegram.WebApp.sendData) {
        Telegram.WebApp.sendData(JSON.stringify(data));
        console.log("Данные отправлены в бота.");
    } else {
        console.error("Telegram.WebApp.sendData недоступен.");
    }

    Telegram.WebApp.close();
}

// Регистрация
function register() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmationCode = document.getElementById('confirmationCode').value;
    const position = document.getElementById('position').value;

    // Проверка на заполнение всех полей
    if (!firstName || !lastName || !email || !password || !confirmPassword || !confirmationCode || !position) {
        showError('Пожалуйста, заполните все поля.');
        return;
    }

    // Проверка валидности почты
    if (!validateEmail(email)) {
        showError('Некорректная почта. Используйте Gmail, Yandex или Mail.ru.');
        return;
    }

    // Проверка сложности пароля
    if (!validatePassword(password)) {
        showError('Пароль должен быть не менее 8 символов и содержать цифры и буквы.');
        return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        showError('Пароли не совпадают.');
        return;
    }

    // Проверка кода подтверждения
    const savedCode = localStorage.getItem('confirmationCode');
    if (confirmationCode !== savedCode) {
        showError('Неверный код подтверждения.');
        return;
    }

    // Все проверки пройдены, отправляем данные
    const data = { firstName, lastName, email, password, position };
    console.log("Данные для регистрации:", data);

    if (Telegram.WebApp && Telegram.WebApp.sendData) {
        Telegram.WebApp.sendData(JSON.stringify(data));
        console.log("Данные отправлены в бота.");
    } else {
        console.error("Telegram.WebApp.sendData недоступен.");
    }

    Telegram.WebApp.close();
    alert("Регистрация успешна!");
}

// Отправка кода восстановления
async function sendRecoveryCode() {
    const email = document.getElementById('recoveryEmail').value;
    const emailError = document.getElementById('emailError');

    if (!validateEmail(email)) {
        emailError.textContent = "Некорректная почта. Используйте Gmail, Yandex или Mail.ru.";
        emailError.style.display = "block";
        return;
    }

    const code = Math.floor(100000 + Math.random() * 900000); // Генерация 6-значного кода

    try {
        const response = await emailjs.send(Service_ID, Template_ID_recovery, {
            to_email: email,
            code: code,
        });

        if (response.status === 200) {
            // Сохраняем код в localStorage для проверки
            localStorage.setItem('recoveryCode', code);
            emailError.style.display = "none";
            alert("Код восстановления отправлен на вашу почту.");
        } else {
            alert("Ошибка при отправке кода.");
        }
    } catch (error) {
        console.error("Ошибка при отправке письма:", error);
        alert("Произошла ошибка при отправке кода. Проверьте консоль для подробностей.");
    }
}

// Сохранение нового пароля
async function saveNewPassword() {
    const email = document.getElementById('recoveryEmail').value;
    const code = document.getElementById('recoveryCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    // Проверка на заполнение всех полей
    if (!email || !code || !newPassword || !confirmNewPassword) {
        showError('Пожалуйста, заполните все поля.');
        return;
    }

    // Проверка валидности почты
    if (!validateEmail(email)) {
        showError('Некорректная почта. Используйте Gmail, Yandex или Mail.ru.');
        return;
    }

    // Проверка сложности пароля
    if (!validatePassword(newPassword)) {
        newPasswordError.textContent = 'Пароль должен быть не менее 8 символов и содержать цифры и буквы.';
        newPasswordError.style.display = "block";
        return;
    }

    // Проверка совпадения паролей
    if (newPassword !== confirmNewPassword) {
        confirmNewPasswordError.textContent = 'Пароли не совпадают.';
        confirmNewPasswordError.style.display = "block";
        return;
    }

    // Проверка кода подтверждения
    const savedCode = localStorage.getItem('recoveryCode');
    if (code !== savedCode) {
        showError('Неверный код подтверждения.');
        return;
    }

    // Все проверки пройдены, отправляем данные
    const data = { email, newPassword };
    console.log("Данные для восстановления пароля:", data);

    if (Telegram.WebApp && Telegram.WebApp.sendData) {
        Telegram.WebApp.sendData(JSON.stringify(data));
        console.log("Данные отправлены в бота.");
    } else {
        console.error("Telegram.WebApp.sendData недоступен.");
    }

    Telegram.WebApp.close();
    alert("Пароль успешно изменен! Теперь вы можете войти с новым паролем.");
}