import { Menu, User } from 'lucide-react'

const Header = () => {
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null

  return (
    <header className="header">
      <div className="header-left">
        <Menu size={24} />
        <h1>Dashboard</h1>
      </div>

      <div className="header-user">
        <div className="user-avatar">
          <User size={20} />
        </div>

        <div>
          <p className="user-name">
            {user?.name || 'User'}
          </p>

          <span className="user-email">
            {user?.email || ''}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header