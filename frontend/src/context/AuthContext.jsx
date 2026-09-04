import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser } from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore login session when the page refreshes
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await loginUser(email, password)

    // IMPORTANT:
    // Adjust these fields if your backend login response uses
    // different property names.
    const token = data.token
    const loggedInUser = data.user

    localStorage.setItem('token', token)
    localStorage.setItem(
      'user',
      JSON.stringify(loggedInUser)
    )

    setUser(loggedInUser)

    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}