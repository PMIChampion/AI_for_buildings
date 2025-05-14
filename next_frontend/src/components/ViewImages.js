'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './ViewImages.module.css';

export default function ViewImages() {
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [groups, setGroups] = useState([]); // Mock данные для групп
  const [selectedGroup, setSelectedGroup] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    

    if (!token) {
      router.push('/login');
      return;
    } 

    fetchImages(token);
    fetchUserData(token);
    loadMockGroups();
  }, []);

  const loadMockGroups = () => {
    const mockGroups = [
      { id: 1, name: "Проект А", description: "Описание проекта А" },
      { id: 2, name: "Проект Б", description: "Описание проекта Б" },
      { id: 3, name: "Проект В", description: "Описание проекта В" },
    ];
    setGroups(mockGroups);
    setSelectedGroup(mockGroups[0]); // Выбираем первую группу по умолчанию
  };

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

  const fetchProjectImages = async (projectId) => {
    const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`, {
        headers: { Authorization: `Token ${token}` }
    });
    const data = await response.json();
    setSelectedProject(data);
    setProjectImages(data.images);
  };

  const handleUploadImages = () => {
    router.push('/main'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const handleGroup= () => {
    router.push('/groups'); 
  };
  
  return (
    <div className={styles.container}>
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
          <button onClick={handleGroup}>Мои проекты</button>
        )}
      </div>
      <div className={styles.rightSection}>
      <h1 className={styles.mainTitle}>Все изображения</h1>
      <div className={styles.mainContent}>
        <div className={styles.groupsColumn}>
          <h3>Проекты</h3>
          <div className={styles.scrollContainer}>
            <ul className={styles.groupList}>
              {groups.map(group => (
                <li 
                  key={group.id} 
                  className={selectedGroup?.id === group.id ? styles.activeGroup : ''}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group.name}
                  <span className={styles.groupDescription}>{group.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.imagesColumn}>
          <h3>Изображения {selectedGroup ? `в ${selectedGroup.name}` : ''}</h3>
          <div className={styles.scrollContainer}>
            {images.length > 0 ? (
              <div className={styles.imageGrid}>
                {images.map((image) => (
                  <div key={image.id} className={styles.imageItem}>
                    <img src={`http://localhost:8000${image.image}`} alt="Изображение" />
                    <p>ID: {image.id}</p>
                    <p>Дата: {new Date(image.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет изображений.</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
