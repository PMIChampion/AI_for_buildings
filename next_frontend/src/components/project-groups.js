"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./project-groups.module.css"
import {Plus, X, FileImage} from "lucide-react"

export default function ProjectGroups() {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    blueprint_image: null,
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [userData, setUserData] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null);

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")

    if (!token) {
      router.push("/login")
      return
    }
    fetchProjects(token)
    fetchUserData(token)

    // Cleanup preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/users/me/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error)
    }
  }

  const fetchProjects = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/projects/", {
        headers: { Authorization: `Token ${token}` },
      })
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Ошибка загрузки проектов:", error)
    }
  }

  const handleCreateProject = async () => {
    const token = localStorage.getItem("authToken")
    const formData = new FormData()
    formData.append("name", newProject.name)
    formData.append("description", newProject.description)
    if (newProject.blueprint_image) {
      formData.append("blueprint_image", newProject.blueprint_image)
    }

    try {
      const response = await fetch("http://localhost:8000/api/projects/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      })

      if (response.ok) {
        fetchProjects(token)
        setNewProject({ name: "", description: "", blueprint_image: null })
        setPreviewUrl(null)
        setIsCreating(false)
      }
    } catch (error) {
      console.error("Ошибка создания проекта:", error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewProject({
        ...newProject,
        blueprint_image: file,
      })

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleViewProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handleNavigateToImages = (projectId) => {
    router.push(`/view?project=${projectId}`)
  };
    //const handleViewProject = (projectId) => {
      //router.push(`/view?project=${projectId}`)
    //}

  const handleDeleteProject = async (projectId) => {
    await deleteProjectById(projectId);
    setProjects(projects.filter(p => p.id !== projectId));
    closeModal();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }


  const toggleCreateForm = () => {
    setIsCreating(!isCreating)
    if (isCreating) {
      setNewProject({ name: "", description: "", blueprint_image: null })
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }

  return (
      <>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Мои проекты</h1>
        </header>

        {/* Project Content */}
        <div className={styles.projectContainer}>
          {/* Create Project Button */}
          {userData?.position === "Инженер" && (
            <button onClick={toggleCreateForm} className={styles.createProjectButton}>
              {isCreating ? (
                <>
                  <X size={18} />
                  <span>Отмена</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Создать проект</span>
                </>
              )}
            </button>
          )}

          {/* Create Project Form */}
          {isCreating && (
            <div className={styles.createFormWrapper}>
              <div className={styles.createForm}>
                <h2 className={styles.formTitle}>Новый проект</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="projectName" className={styles.formLabel}>
                    Название проекта
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    placeholder="Введите название проекта"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="projectDescription" className={styles.formLabel}>
                    Описание проекта
                  </label>
                  <textarea
                    id="projectDescription"
                    placeholder="Введите описание проекта"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Чертеж проекта (опционально)</label>
                  <div className={styles.fileUploadContainer}>
                    <input
                      type="file"
                      id="blueprintUpload"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={styles.fileInput}
                    />
                    <label htmlFor="blueprintUpload" className={styles.fileInputLabel}>
                      <FileImage size={20} />
                      <span>{newProject.blueprint_image ? newProject.blueprint_image.name : "Выберите файл"}</span>
                    </label>
                  </div>

                  {previewUrl && (
                    <div className={styles.previewContainer}>
                      <img src={previewUrl || "/placeholder.svg"} alt="Предпросмотр" className={styles.previewImage} />
                    </div>
                  )}
                </div>

                <button onClick={handleCreateProject} className={styles.submitButton}>
                  Создать проект
                </button>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className={styles.projectsList}>
            <h2 className={styles.sectionTitle}>Список проектов</h2>

            {projects.length > 0 ? (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <div key={project.id} className={styles.projectCard} onClick={() => handleViewProject(project.id)}>
                    <div className={styles.projectCardContent}>
                      <h3 className={styles.projectName}>{project.name}</h3>
                    </div>
                    {project.blueprint_image && (
                      <div className={styles.blueprintContainer}>
                        <img
                          src={`http://localhost:8000${project.blueprint_image}`}
                          alt="Чертеж проекта"
                          className={styles.blueprintImage}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noProjects}>
                <p>Нет доступных проектов</p>
                {userData?.position === "Инженер" && !isCreating && (
                  <button onClick={toggleCreateForm} className={styles.createFirstButton}>
                    <Plus size={18} />
                    <span>Создать первый проект</span>
                  </button>
                )}
              </div>
            )}
          </div>
          {selectedProject && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={closeModal}>×</button>

                {selectedProject.blueprint_image && (
                  <img
                    src={`http://localhost:8000${selectedProject.blueprint_image}`}
                    alt="Чертеж проекта"
                    className={styles.modalImage}
                  />
                )}

                <div className={styles.modalInfo}>
                  <h2>{selectedProject.name}</h2>
                  <p><strong>Описание:</strong> {selectedProject.description || "Нет описания"}</p>
                  <p><strong>Изображений:</strong> {selectedProject.image_count || 0}</p>

                  <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                    {userData?.position === "Инженер" && (
                      <button
                        onClick={() => handleNavigateToImages(selectedProject.id)}
                        className={styles.submitButton}
                      >
                        Перейти к изображениям
                      </button>
                    )}

                    {userData?.position === "Инженер" && (
                      <button
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        className={styles.logoutButton}
                      >
                        Удалить проект
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </>
  )
}
