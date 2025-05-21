"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./login-page.module.css"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/auth/token/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", data.auth_token)
        window.location.href = "/dashboard/upload"
      } else {
        setError(data?.detail || "Неверный email или пароль")
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error)
      setError("Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Авторизация</h1>
            <p className={styles.formSubtitle}>Войдите в свою учетную запись</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="Введите ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Пароль
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  placeholder="Введите ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
              {!isLoading && <ArrowRight size={18} className={styles.buttonIcon} />}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p className={styles.registerText}>
              Нет учетной записи?{" "}
              <Link href="/register" className={styles.registerLink}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageContent}>
          <h2 className={styles.imageTitle}>Выявление дефектов в бетонных конструкциях</h2>
          <p className={styles.imageSubtitle}>
            Данный сайт поможет эффективно определить дефекты, обеспечивая при этом скорость и точность работы
          </p>
        </div>
      </div>
    </div>
  )
}
