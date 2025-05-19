"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./image-upload.module.css"
import { LogOut, Upload, Grid, FolderOpen, User, AlertCircle } from "lucide-react"
import Sidebar from "../components/Sidebar"

export default function ImageUpload() {
  const [userData, setUserData] = useState(null)
  const [uploadMessage, setUploadMessage] = useState("")
  const [messageType, setMessageType] = useState("") // "success" or "error"
  const [comment, setComment] = useState("")
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState("")
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

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/users/me/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        throw new Error("Ошибка получения данных пользователя")
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
    }
  }

  const fetchProjects = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/projects/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Ошибка загрузки проектов:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFileName(file.name)
    } else {
      setSelectedFileName("")
    }
  }

  const handleUploadImage = async () => {
    const token = localStorage.getItem("authToken")
    const fileInput = document.getElementById("imageUpload")
    const file = fileInput.files[0]

    if (!file) {
      setMessageType("error")
      setUploadMessage("Выберите файл для загрузки")
      return
    }

    if (!selectedProjectId) {
      setMessageType("error")
      setUploadMessage("Выберите проект")
      return
    }

    setIsUploading(true)
    setUploadMessage("Загрузка изображения...")
    setMessageType("info")

    const formData = new FormData()
    formData.append("image", file)
    formData.append("comment", comment)
    formData.append("category", selectedProjectId)
    formData.append("status", "true");


    for (let pair of formData.entries()) {
       console.log(pair[0]+ ': ' + pair[1]);
    }


    try {
      const response = await fetch(`http://localhost:8000/api/image_processing/${selectedProjectId}/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setMessageType("success")
        setUploadMessage("Изображение успешно загружено!")
        setTimeout(() => setUploadMessage(""), 5000)
        fileInput.value = ""
        setSelectedFileName("")
        setComment("")
      } else {
        setMessageType("error")
        setUploadMessage("Ошибка загрузки изображения")
      }
    } catch (error) {
      setMessageType("error")
      setUploadMessage("Ошибка сети")
    } finally {
      setIsUploading(false)
    }
  }


  return (
    <div className={styles.container}>
      <Sidebar userData={userData} onLogout={handleLogout} />
      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Выгрузка изображения</h1>
        </header>

        <div className={styles.uploadContainer}>
          {userData ? (
            <div className={styles.uploadCard}>
              <h2 className={styles.uploadTitle}>Загрузить новое изображение</h2>

              <div className={styles.uploadForm}>
                <div className={styles.fileInputWrapper}>
                  <div className={styles.fileInputContainer}>
                    <input
                      type="file"
                      id="imageUpload"
                      className={styles.fileInput}
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={isUploading}
                    />
                    <label htmlFor="imageUpload" className={styles.fileInputLabel}>
                      <Upload size={20} />
                      <span>{selectedFileName || "Выберите файл"}</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="projectSelect" className={styles.inputLabel}>
                    Проект
                  </label>
                  <select
                    id="projectSelect"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className={styles.selectInput}
                    disabled={isUploading || projects.length === 0}
                  >
                    <option value="">Выберите проект</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="commentInput" className={styles.inputLabel}>
                    Комментарий
                  </label>
                  <textarea
                    id="commentInput"
                    placeholder="Напишите комментарий к изображению"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={styles.textareaInput}
                    disabled={isUploading}
                  />
                </div>

                <button
                  onClick={handleUploadImage}
                  disabled={isUploading || !selectedProjectId}
                  className={styles.uploadButton}
                >
                  {isUploading ? "Загрузка..." : "Загрузить изображение"}
                </button>

                {uploadMessage && <div className={`${styles.messageBox} ${styles[messageType]}`}>{uploadMessage}</div>}
              </div>
            </div>
          ) : (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Загрузка данных пользователя...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
