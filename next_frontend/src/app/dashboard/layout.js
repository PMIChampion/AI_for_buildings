import Sidebar from "../../components/sidebar"

export const metadata = {
  title: "Приложение",
}

export default function WithSidebarLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#1a202c",
      color: "#e2e8f0",
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
    }}>
      <Sidebar />
      <main style={{ flex: "1",
        marginLeft: "240px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"}}>
        {children}
      </main>
    </div>
  )
}