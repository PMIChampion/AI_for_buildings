'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Groups.module.css';

export default function Groups() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    blueprint_image: null
  });
  const [isCreating, setIsCreating] = useState(false);
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
        headers: { Authorization: `Token ${token}` }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  const fetchProjects = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/projects/', {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
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

  const handleCreateProject = async () => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('name', newProject.name);
    formData.append('description', newProject.description);
    if (newProject.blueprint_image) {
      formData.append('blueprint_image', newProject.blueprint_image);
    }

    try {
      const response = await fetch('http://localhost:8000/api/projects/', {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchProjects(token);
        setNewProject({ name: '', description: '', blueprint_image: null });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
    }
  };

  const handleFileChange = (e) => {
    setNewProject({
      ...newProject,
      blueprint_image: e.target.files[0]
    });
  };

  const handleViewProject = (projectId) => {
    router.push(`/view?project=${projectId}`);
  };

  const handleViewImages = () => {
    router.push('/view'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const handleUploadImages = () => {
    router.push('/main'); 
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
            <button onClick={handleViewImages}>Посмотреть все изображения</button>
            )}
            {userData?.position === 'Инженер' && (
            <button style={{backgroundColor: '#2077cd'}}>Мои проекты</button>
            
            )}
        </div>
        <div className={styles.rightSection}>
        <h1 className={styles.mainTitle}>Мои проекты</h1>
        <div className={styles.mainContent}>
          {userData?.position === 'Инженер' && (
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className={styles.createButton}
            >
              {isCreating ? 'Отмена' : '+ Создать проект'}
            </button>
          )}

          {isCreating && (
            <div className={styles.createForm}>
              <h3>Новый проект</h3>
              <input
                type="text"
                placeholder="Название проекта"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
              <textarea
                placeholder="Описание проекта"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <div className={styles.fileUpload}>
                <label>
                  Чертеж проекта (опционально):
                  <input type="file" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <button onClick={handleCreateProject} className={styles.createButton}>Создать</button>
            </div>
          )}

          <div className={styles.projectsList}>
            <h3>Список проектов</h3>
            {projects.length > 0 ? (
              <ul>
                {projects.map(project => (
                  <li key={project.id} onClick={() => handleViewProject(project.id)}>
                    <div className={styles.projectCard}>
                      <h4>{project.name}</h4>
                      <p>{project.description || 'Нет описания'}</p>
                      {project.blueprint_image && (
                        <img 
                          src={`http://localhost:8000${project.blueprint_image}`} 
                          alt="Чертеж проекта" 
                          className={styles.blueprintThumb}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Нет доступных проектов</p>
            )}
          </div>
        </div>
    </div>
  </div>
  );
}
