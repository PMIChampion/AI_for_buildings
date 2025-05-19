"use client"

import { User, FolderOpen, Grid, Upload, AlertCircle, LogOut } from "lucide-react"
import styles from "./sidebar.module.css"  
import { useRouter } from "next/navigation"

export default function Sidebar({ userData, onLogout }) {
  const router = useRouter()

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
            className={`${styles.navButton} ${router.pathname === "/groups" ? styles.active : ""}`}
            onClick={() => router.push("/groups")}
            >
            <FolderOpen size={18} />
            <span>Мои проекты</span>
            </button>
        )}
        {userData?.position === "Инженер" && (
            <button className={`${styles.navButton} ${router.pathname === "/view" ? styles.active : ""}`}
            onClick={() => router.push("/view")}
            >
            <Grid size={18} />
            <span>Все изображения</span>
            </button>
        )}

        <button
        className={`${styles.navButton} ${router.pathname === "/upload" ? styles.active : ""}`}
        onClick={() => router.push("/upload")}
        >
          <Upload size={18} />
          <span>Выгрузка изображений</span>
        </button>

        {userData?.position === "Инженер" && (
            <button
            className={`${styles.navButton} ${router.pathname === "/review" ? styles.active : ""}`}
            onClick={() => router.push("/review")}
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
