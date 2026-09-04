import Sidebar from './Sidebar'
import Header from './Header'

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout