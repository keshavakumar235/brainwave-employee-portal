import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { getDashboardStats } from '../services/dashboardService'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await getDashboardStats()

        setStats(data.stats)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to load dashboard statistics',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="page-title">
          <h2>Dashboard Overview</h2>
          <p>Welcome to the BrainWave Employee Portal</p>
        </div>

        {loading && <p>Loading dashboard...</p>}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">
                {stats.totalUsers}
              </p>
            </div>

            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-number">
                {stats.activeUsers}
              </p>
            </div>

            <div className="stat-card">
              <h3>Roles</h3>
              <p className="stat-number">
                {stats.totalRoles}
              </p>
            </div>

            <div className="stat-card">
              <h3>Permissions</h3>
              <p className="stat-number">
                {stats.totalPermissions}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard