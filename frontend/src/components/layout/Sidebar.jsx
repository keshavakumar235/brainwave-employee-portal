import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <h2>BrainWave</h2>
          <span>Employee Portal</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Users size={20} />
            Users
          </NavLink>

          <NavLink
            to="/roles"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <ShieldCheck size={20} />
            Roles & Permissions
          </NavLink>
        </nav>
      </div>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  )
}

export default Sidebar