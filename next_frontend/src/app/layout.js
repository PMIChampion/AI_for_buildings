import "./globals.css"
import Sidebar from "../components/sidebar"

export const metadata = {
  title: "Приложение",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ marginLeft: "240px", padding: "20px", flex: 1 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
