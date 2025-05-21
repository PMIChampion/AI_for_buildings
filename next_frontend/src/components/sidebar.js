"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, FolderOpen, Grid, Upload, AlertCircle, LogOut } from "lucide-react"
import styles from "./sidebar.module.css"

export default function Sidebar({ onLogout }) {
  const [userData, setUserData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/users/me/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        if (!res.ok) throw new Error("Ошибка загрузки профиля")
        const data = await res.json()
        setUserData(data)
      } catch (error) {
        console.error("Ошибка получения пользователя в Sidebar:", error)
      }
    }

    fetchUser()
  }, [])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          <User size={24} />
        </div>
        <div className={styles.userDetails}>
          <p className={styles.userName}>{userData ? `${userData.first_name} ${userData.last_name}` : ""}</p>
          <span className={styles.userPosition}>{userData?.position || ""}</span>
        </div>
      </div>

      <nav className={styles.navigation}>
        {userData?.position === "Инженер" && (
            <button
            className={`${styles.navButton} ${router.pathname === "/dashboard/groups" ? styles.active : ""}`}
            onClick={() => router.push("/dashboard/groups")}
            >
            <FolderOpen size={18} />
            <span>Мои проекты</span>
            </button>
        )}
        {userData?.position === "Инженер" && (
            <button className={`${styles.navButton} ${router.pathname === "/dashboard/view" ? styles.active : ""}`}
            onClick={() => router.push("/dashboard/view")}
            >
            <Grid size={18} />
            <span>Все изображения</span>
            </button>
        )}

        <button
        className={`${styles.navButton} ${router.pathname === "/dashboard/upload" ? styles.active : ""}`}
        onClick={() => router.push("/dashboard/upload")}
        >
          <Upload size={18} />
          <span>Выгрузка изображений</span>
        </button>

        {userData?.position === "Инженер" && (
            <button
            className={`${styles.navButton} ${router.pathname === "/dashboard/review" ? styles.active : ""}`}
            onClick={() => router.push("/dashboard/review")}
            >
            <AlertCircle size={18} />
            <span>Проверка изображений</span>
            </button>
        )}
      </nav>

      <button className={styles.logoutButton} onClick={onLogout}>
        <LogOut size={18} />
        <span>Выйти</span>
      </button>
    </aside>
  )
}
