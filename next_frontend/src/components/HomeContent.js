'use client';

import { useEffect, useState } from 'react';
import styles from './HomeContent.module.css';
import { useRouter } from 'next/navigation';

export default function HomeContent() {
  const [userData, setUserData] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [comment, setComment] = useState('');
  const [folder, setFolder] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      router.push('/login');
      return;
    }

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const handleUploadImage = async () => {
    const token = localStorage.getItem('authToken');
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
      setUploadMessage('Выберите файл для загрузки');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('comment', comment);
    /*formData.append('folder', folder);*/

    try {
      const response = await fetch('http://localhost:8000/api/image_processing/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadMessage('Изображение успешно загружено!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        setUploadMessage('Ошибка загрузки изображения');
      }
    } catch (error) {
      setUploadMessage('Ошибка сети');
    }
  };

  const handleViewImages = () => {
    router.push('/view'); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <p>Добро пожаловать, {userData ? `${userData.first_name} ${userData.last_name}` : ''}</p>
        <button onClick={handleLogout}>Выйти</button>
        {userData?.position === 'Инженер' && (
          <button style={{backgroundColor: '#2077cd'}}>Выгрузка изображения</button>
        )}
        {userData?.position === 'Инженер' && (
          <button onClick={handleViewImages}>Посмотреть все изображения</button>
          
        )}
        {userData?.position === 'Инженер' && (
          <button>Мои проекты</button>
          
        )}
      </div>

      <div className={styles.rightSection}>
        <h1 className={styles.mainTitle}>Выгрузка изображения</h1>
        <div className={styles.mainContent}>
          {userData ? (
            <>
              <div className={styles.uploadSection}>
                <input type="file" id="imageUpload" />
                <select
                  className={styles.selectGroup}
                >
                  <option value="">Выберите группу</option> 
                </select>
                <textarea
                  placeholder="Напишите комментарий"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button onClick={handleUploadImage}>Загрузить изображение</button>
              </div>

              {uploadMessage && <p>{uploadMessage}</p>}
            </>
          ) : (
            <p>Загрузка...</p>
          )}
          
        </div>
      </div>
    </div>
  );
}