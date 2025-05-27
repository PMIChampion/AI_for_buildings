"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./image-review.module.css"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"


export default function ImageReview() {
  const [userData, setUserData] = useState(null)
  const [pendingImages, setPendingImages] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [imageToDelete, setImageToDelete] = useState(null);
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")

    if (!token) {
      router.push("/login")
      return
    }

    fetchUserData(token)
    fetchProjects(token)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (selectedGroup && token) {
      fetchPendingImagesByProject(selectedGroup.id, token)
    }
  }, [selectedGroup])

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/users/me/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setUserData(data)

      if (data.position !== "Инженер") {
        router.push("/view")
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
    }
  }

  const fetchProjects = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/projects/", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data)
        if (data.length > 0) {
          setSelectedGroup(data[0]) 
        }
      } else {
        console.error("Ошибка при загрузке проектов")
        setGroups([])
      }
    } catch (error) {
      console.error("Ошибка при запросе проектов:", error)
    }
  }


 const fetchPendingImagesByProject = async (projectId, token) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/image_processing/${projectId}/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json();
      const pendingOnly = data.filter(img => img.status === null);
      setPendingImages(pendingOnly);
    } catch (error) {
      console.error("Ошибка загрузки изображений проекта:", error)
      setPendingImages([])
      setMessage({
        type: "error",
        text: "Не удалось загрузить изображения. Пожалуйста, попробуйте позже.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveImage = async (imageId) => {
    const token = localStorage.getItem("authToken")
    try {
      const formData = new FormData();
      formData.append('status', 'true');

      const response = await fetch(`http://localhost:8000/api/image_processing/${imageId}/`, {
          method: "PATCH",
          headers: {
              Authorization: `Token ${token}`,
          },
          body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      setPendingImages(pendingImages.filter((img) => img.id !== imageId))
      setMessage({
        type: "success",
        text: "Изображение успешно подтверждено",
      })

      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null)
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      console.error("Ошибка при подтверждении изображения:", error)
      setMessage({
        type: "error",
        text: "Не удалось подтвердить изображение. Пожалуйста, попробуйте снова.",
      })
    }
  }

  const handleRejectImage = async (imageId) => {
    const token = localStorage.getItem("authToken")
    try {
      const formData = new FormData();
      formData.append('status', 'false');

      const response = await fetch(`http://localhost:8000/api/image_processing/${imageId}/`, {
          method: "PATCH",
          headers: {
              Authorization: `Token ${token}`,
          },
          body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)


      setPendingImages(pendingImages.filter((img) => img.id !== imageId))
      setMessage({
        type: "success",
        text: "Изображение отклонено",
      })

      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null)
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 3000)
    } catch (error) {
      console.error("Ошибка при отклонении изображения:", error)
      setMessage({
        type: "error",
        text: "Не удалось отклонить изображение. Пожалуйста, попробуйте снова.",
      })
    }
  }

  const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  return (
      <>
          {/* Main Content */}
        <main className={styles.mainContent}>
          <header className={styles.header}>
            <h1 className={styles.pageTitle}>Проверка изображений</h1>
            {/* Message display */}
            {message.text && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}
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
              <h2 className={styles.panelTitle}>
                Изображения на проверке {selectedGroup ? `в ${selectedGroup.name}` : ""}
              </h2>

              <div className={styles.imagesContainer}>
                {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Загрузка изображений...</p>
                  </div>
                ) : pendingImages.length > 0 ? (
                  <div className={styles.imagesGrid}>
                    {pendingImages.map((image) => (
                      <div key={image.id} className={styles.imageCard}>
                        <div className={styles.imageWrapper} onClick={() => handleImageClick(image)}>
                          <img
                            src={image.processed_image}
                            alt={`Изображение ${image.id}`}
                            className={styles.image}
                          />
                        </div>
                        <div className={styles.imageInfo}>
                          <div className={styles.imageDetails}>
                            <p className={styles.imageId}>ID: {image.id}</p>
                            <p className={styles.imageUploader}>
                              Загрузил: {image.uploaded_by.first_name} {image.uploaded_by.last_name}
                            </p>
                            <p className={styles.imageDate}>{new Date(image.created_at).toLocaleDateString("ru-RU")}</p>
                          </div>
                          <div className={styles.imageActions}>
                            <button
                              className={`${styles.actionButton} ${styles.approveButton}`}
                              onClick={() => handleApproveImage(image.id)}
                              title="Подтвердить"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.rejectButton}`}
                              onClick={() => handleRejectImage(image.id)}
                              title="Отклонить"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noImages}>
                    <AlertCircle size={48} className={styles.noImagesIcon} />
                    <p>Нет изображений, требующих проверки</p>
                    {!selectedGroup && (
                      <p className={styles.selectProjectHint}>Выберите проект для просмотра изображений</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Image Modal */}
          {selectedImage && (
            <div className={styles.modal} onClick={closeModal}>
              <button className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Изображение #{selectedImage.id}</h3>
                  <div className={styles.modalActions}>
                    <button
                      className={`${styles.modalActionButton} ${styles.approveButton}`}
                      onClick={() => handleApproveImage(selectedImage.id)}
                    >
                      <CheckCircle size={20} />
                      <span>Подтвердить</span>
                    </button>
                    <button
                      className={`${styles.modalActionButton} ${styles.rejectButton}`}
                      onClick={() => handleRejectImage(selectedImage.id)}
                      title="Отклонить"
                    >
                      <XCircle size={20} />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
                <img
                  src={selectedImage.processed_image}
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
                  {selectedImage.comment && <p>Описание: {selectedImage.comment}</p>}
                </div>
              </div>
            </div>
          )}
        
        </main>
    </>
  )
}
