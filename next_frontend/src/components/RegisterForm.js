'use client';

import { useState } from 'react';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          position,
          password,
          re_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/login'; 
      } else {
        setError(data?.detail || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      setError('Произошла ошибка при регистрации');
    }
  };

  return (
    <div className={styles.register}>
      <h2 className={styles.header}>Регистрация</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          className={styles.input}
        >
          <option value="" disabled>Выберите должность</option>
          <option value="Рабочий">Рабочий</option>
          <option value="Инженер">Инженер</option>
        </select>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Зарегистрироваться
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p className={styles.link}>
        Уже есть аккаунт? <a href="/login" style={{ color: '#4a5c8f' }}>Войти</a>
      </p>
    </div>
  );
}