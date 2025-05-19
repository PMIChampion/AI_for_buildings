"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./image-review.module.css"
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react"
import Sidebar from "../components/Sidebar"

export default function ImageReview() {
  const [userData, setUserData] = useState(null)
  const [pendingImages, setPendingImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")

    if (!token) {
      router.push("/login")
      return
    }

    fetchUserData(token)
    fetchPendingImages(token)
  }, [])

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/users/me/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setUserData(data)

      // Redirect if not an engineer
      if (data.position !== "Инженер") {
        router.push("/view")
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
    }
  }

  const fetchPendingImages = async (token) => {
    setIsLoading(true)
    try {
      // Assuming there's an API endpoint to fetch pending images (status=false)
      const response = await fetch("http://localhost:8000/api/pending_images/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setPendingImages(data)
    } catch (error) {
      console.error("Ошибка загрузки изображений:", error)
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
      const response = await fetch(`http://localhost:8000/api/images/${imageId}/approve/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      // Remove the approved image from the list
      setPendingImages(pendingImages.filter((img) => img.id !== imageId))
      setMessage({
        type: "success",
        text: "Изображение успешно подтверждено",
      })

      // Close modal if the approved image was selected
      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null)
      }
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
      const response = await fetch(`http://localhost:8000/api/images/${imageId}/reject/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      // Remove the rejected image from the list
      setPendingImages(pendingImages.filter((img) => img.id !== imageId))
      setMessage({
        type: "success",
        text: "Изображение отклонено и удалено",
      })

      // Close modal if the rejected image was selected
      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null)
      }
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

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  return (
    <div className={styles.container}>
      <Sidebar userData={userData} onLogout={handleLogout} />
      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Проверка изображений</h1>
        </header>

        <div className={styles.contentGrid}>
          {/* Message display */}
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Images Panel */}
          <section className={styles.imagesPanel}>
            <h2 className={styles.panelTitle}>Изображения на проверке</h2>

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
                          src={`http://localhost:8000${image.image}`}
                          alt={`Изображение ${image.id}`}
                          className={styles.image}
                        />
                        {image.comment && (
                          <div className={styles.commentIndicator}>
                            <MessageSquare size={16} />
                          </div>
                        )}
                      </div>
                      <div className={styles.imageInfo}>
                        <div className={styles.imageDetails}>
                          <p className={styles.imageProject}>Проект: {image.category.name}</p>
                          <p className={styles.imageUploader}>
                            Загрузил: {image.uploaded_by.first_name} {image.uploaded_by.last_name}
                          </p>
                          <p className={styles.imageDate}>
                            {new Date(image.created_at).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
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
                  <p className={styles.noImagesSubtext}>
                    Все изображения проверены. Когда работники загрузят новые изображения, они появятся здесь.
                  </p>
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
                >
                  <XCircle size={20} />
                  <span>Отклонить</span>
                </button>
              </div>
            </div>
            <div className={styles.modalImageContainer}>
              <img
                src={`http://localhost:8000${selectedImage.image}`}
                alt={`Изображение ${selectedImage.id}`}
                className={styles.modalImage}
              />
            </div>
            <div className={styles.modalInfo}>
              <div className={styles.modalInfoItem}>
                <strong>Проект:</strong> {selectedImage.category.name}
              </div>
              <div className={styles.modalInfoItem}>
                <strong>Ось:</strong> {selectedImage.axis || "Не указана"}
              </div>
              <div className={styles.modalInfoItem}>
                <strong>Загрузил:</strong> {selectedImage.uploaded_by.first_name} {selectedImage.uploaded_by.last_name}
              </div>
              <div className={styles.modalInfoItem}>
                <strong>Дата загрузки:</strong>{" "}
                {new Date(selectedImage.created_at).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {selectedImage.comment && (
                <div className={styles.modalComment}>
                  <strong>Комментарий:</strong>
                  <p>{selectedImage.comment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
