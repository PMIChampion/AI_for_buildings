"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react"
import styles from "./image-gallery.module.css"
import { LogOut, Upload, Grid, FolderOpen, User } from "lucide-react"

export default function ImageGallery() {

  const [selectedImage, setSelectedImage] = useState(null)
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
      fetchProjects(token);
    }, []);
  
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
      router.push('/upload'); 
    };
  
    const handleLogout = () => {
      localStorage.removeItem('authToken');
      router.push('/login');
    };
  
    const handleGroup= () => {
      router.push('/groups'); 
    };
    
    const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={24} />
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{userData ? `${userData.first_name} ${userData.last_name}` : "Гость"}</p>
            <span className={styles.userPosition}>{userData?.position || ""}</span>
          </div>
        </div>

        <nav className={styles.navigation}>
          <button className={styles.navButton} onClick={handleGroup}>
            <FolderOpen size={18} />
            <span>Мои проекты</span>
          </button>

          <button className={`${styles.navButton} ${styles.active}`}>
            <Grid size={18} />
            <span>Все изображения</span>
          </button>

          {userData?.position === "Инженер" && (
            <button className={styles.navButton} onClick={handleUploadImages}>
              <Upload size={18} />
              <span>Выгрузка изображений</span>
            </button>
          )}
        </nav>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Выйти</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
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
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            <img
              src={`http://localhost:8000${selectedImage.image}`}
              alt={`Изображение ${selectedImage.id}`}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <p>ID: {selectedImage.id}</p>
              <p>Дата: {new Date(selectedImage.created_at).toLocaleString("ru-RU")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
