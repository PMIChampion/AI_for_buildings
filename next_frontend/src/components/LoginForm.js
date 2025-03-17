'use client';

import { useState } from 'react';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.auth_token);
        window.location.href = '/main';
      } else {
        setError(data?.detail || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
      setError('Произошла ошибка при авторизации');
    }
  };

  return (
    <div className={styles.loginform}>
      <h2 className={styles.header}>Авторизация</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Войти
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p style={{ margin: '10px', textAlign: 'center', fontSize: '14px' }}>
        <a href="/register" style={{ color: '#4a5c8f' }}>Зарегистрироваться</a>
      </p>
    </div>
  );
}