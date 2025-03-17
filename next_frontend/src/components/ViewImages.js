'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ViewImages.module.css';

export default function ViewImages() {
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    

    if (!token) {
      router.push('/login');
      return;
    } 

    fetchImages(token);
    fetchUserData(token);
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/users/me/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        throw new Error('Ошибка получения данных пользователя');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  const fetchImages = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/image_processing/', {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
    }
  };

  const handleUploadImages = () => {
    router.push('/main'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };
  
  return (
    <div className={styles.сontainer}>
      <div className={styles.sidebar}>
        <p>Добро пожаловать, {userData ? `${userData.first_name} ${userData.last_name}` : ''}</p>
        <button onClick={handleLogout}>Выйти</button>
        {userData?.position === 'Инженер' && (
          <button onClick={handleUploadImages}>Выгрузка изображения</button>
        )}
        {userData?.position === 'Инженер' && (
          <button style={{backgroundColor: '#2077cd'}}>Посмотреть все изображения</button>
        )}
        {userData?.position === 'Инженер' && (
          <button>Мои проекты</button>
          
        )}
      </div>
      <div className={styles.rightSection}>
        <h1 className={styles.mainTitle}>Все изображения</h1>
        <div className={styles.mainContent}>
        {images.length > 0 ? (
          <>
            {images.map((image) => (
              <div key={image.id} className={styles.imageItem}>
                <img src={`http://localhost:8000${image.image}`} alt="Изображение" />
                <p>ID: {image.id}</p>
                <p>Дата: {new Date(image.created_at).toLocaleString()}</p>
              </div>
            ))}
          </>
        ) : (
          <p>Нет изображений.</p>
        )}
        </div>
      </div>
    </div>
  );
}
