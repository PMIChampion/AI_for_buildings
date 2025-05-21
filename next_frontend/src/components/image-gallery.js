"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react"
import styles from "./image-gallery.module.css"


export default function ImageGallery() {

  const [selectedImage, setSelectedImage] = useState(null)
  const [images, setImages] = useState([]);
    const [userData, setUserData] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const router = useRouter();
  
      useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        fetchUserData(token);
        fetchProjects(token);
      }, []);

      useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (selectedGroup && token) {
          fetchImagesByProject(selectedGroup.id, token);
        }
      }, [selectedGroup]);
  
    const fetchProjects = async (token) => {
      try {
        const response = await fetch('http://localhost:8000/api/projects/', {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroups(data); // данные по проектам
          if (data.length > 0) {
            setSelectedGroup(data[0]); // выбрать первый проект по умолчанию
          }
        } else {
          console.error('Ошибка при загрузке проектов');
          setGroups([]);
        }
      } catch (error) {
        console.error('Ошибка при запросе проектов:', error);
      }
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
  
    
    const fetchImagesByProject = async (projectId, token) => {
      try {
        const response = await fetch(`http://localhost:8000/api/image_processing/${projectId}/`, {
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
        console.error('Ошибка загрузки изображений проекта:', error);
        setImages([]);
      }
    };
  
    const handleLogout = () => {
      localStorage.removeItem('authToken');
      router.push('/login');
    };
    
    const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Все изображения</h1>
      </header>

      <div className={styles.contentGrid}>
        {/* Projects Column */}
        <section className={styles.projectsPanel}>
          <h2 className={styles.panelTitle}>Проекты</h2>
          <div className={styles.projectsList}>
            {groups.map((group) => (
              <div
                key={group.id}
                className={`${styles.projectCard} ${selectedGroup?.id === group.id ? styles.activeProject : ""}`}
                onClick={() => setSelectedGroup(group)}
              >
                <h3 className={styles.projectName}>{group.name}</h3>
                {group.description && <p className={styles.projectDescription}>{group.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Images Column */}
        <section className={styles.imagesPanel}>
          <h2 className={styles.panelTitle}>Изображения {selectedGroup ? `в ${selectedGroup.name}` : ""}</h2>

          <div className={styles.imagesContainer}>
            {images.length > 0 ? (
              <div className={styles.imagesGrid}>
                {images.map((image) => (
                  <div key={image.id} className={styles.imageCard} onClick={() => handleImageClick(image)}>
                    <div className={styles.imageWrapper}>
                      <img
                        src={`http://localhost:8000${image.image}`}
                        alt={`Изображение ${image.id}`}
                        className={styles.image}
                      />
                    </div>
                    <div className={styles.imageInfo}>
                      <p className={styles.imageId}>ID: {image.id}</p>
                      <p className={styles.imageDate}>{new Date(image.created_at).toLocaleDateString("ru-RU")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noImages}>
                <p>Нет доступных изображений</p>
                {!selectedGroup && (
                  <p className={styles.selectProjectHint}>Выберите проект для просмотра изображений</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

    {selectedImage && (
      <div className={styles.modal} onClick={closeModal}>
        <button className={styles.closeButton} onClick={closeModal}>
            ×
          </button>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <img
            src={`http://localhost:8000${selectedImage.image}`}
            alt={`Изображение ${selectedImage.id}`}
            className={styles.modalImage}
          />
          <div className={styles.modalInfo}>
            <p>ID: {selectedImage.id}</p>
            <p>Дата: {new Date(selectedImage.created_at).toLocaleString("ru-RU")}</p>
            {selectedImage.uploaded_by && (
              <p>
                Загрузил: {selectedImage.uploaded_by.first_name} {selectedImage.uploaded_by.last_name}
              </p>
            )}
            {selectedImage.comment && (
              <p>Описание: {selectedImage.comment}</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
