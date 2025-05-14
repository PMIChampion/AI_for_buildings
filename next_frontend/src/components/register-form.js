"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./register-form.module.css"
import { User, Mail, Briefcase, Lock, ArrowRight } from "lucide-react"

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/auth/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          position,
          password,
          re_password: confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = "/login"
      } else {
        if (data.email) {
          setError(`Email: ${data.email.join(", ")}`)
        } else if (data.password) {
          setError(`Пароль: ${data.password.join(", ")}`)
        } else {
          setError(data?.detail || "Ошибка регистрации. Пожалуйста, проверьте введенные данные.")
        }
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error)
      setError("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <div className={styles.registerForm}>
        <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Регистрация</h2>
            <p className={styles.formSubtitle}>Создайте новую учетную запись</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
            <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.inputLabel}>
                Имя
                </label>
                <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                    id="firstName"
                    type="text"
                    placeholder="Введите имя"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={styles.input}
                />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.inputLabel}>
                Фамилия
                </label>
                <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                    id="lastName"
                    type="text"
                    placeholder="Введите фамилию"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={styles.input}
                />
                </div>
            </div>
            </div>

            <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
                Email
            </label>
            <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                id="email"
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                />
            </div>
            </div>

            <div className={styles.inputGroup}>
            <label htmlFor="position" className={styles.inputLabel}>
                Должность
            </label>
            <div className={styles.inputWrapper}>
                <Briefcase size={18} className={styles.inputIcon} />
                <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className={`${styles.input} ${styles.select}`}
                >
                <option value="" disabled>
                    Выберите должность
                </option>
                <option value="Рабочий">Рабочий</option>
                <option value="Инженер">Инженер</option>
                </select>
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
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                />
            </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                    Подтверждение пароля
                </label>
                <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={styles.input}
                    />
                </div>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                {!isLoading && <ArrowRight size={18} className={styles.buttonIcon} />}
                </button>
            </form>

            <div className={styles.formFooter}>
                <p className={styles.loginText}>
                Уже есть аккаунт?{" "}
                <Link href="/login" className={styles.loginLink}>
                    Войти
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
