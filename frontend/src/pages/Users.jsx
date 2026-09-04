import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  getUsers,
  updateUserStatus,
  createUser,
  updateUser,
} from '../services/userService'
import { getRoles } from '../services/roleService'


const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [selectedRoleIds, setSelectedRoleIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const [showForm, setShowForm] = useState(false)

const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
})

const [creating, setCreating] = useState(false)
const [editingUser, setEditingUser] = useState(null)

const [editFormData, setEditFormData] = useState({
  name: '',
  email: '',
})

const [editRoleIds, setEditRoleIds] = useState([])
const [updatingUser, setUpdatingUser] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const data = await getUsers()

      setUsers(data.users || data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load users',
      )
    } finally {
      setLoading(false)
    }
  }
  const fetchRoles = async () => {
  try {
    const data = await getRoles()
    setRoles(data.roles || [])
  } catch (err) {
    console.error('Failed to load roles:', err)
  }
}

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleStatusChange = async user => {
    try {
      setUpdatingId(user.id)
      setError('')

      const newStatus = !user.isActive

      await updateUserStatus(user.id, newStatus)

      // Update UI without reloading the page
      setUsers(currentUsers =>
        currentUsers.map(currentUser =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                isActive: newStatus,
              }
            : currentUser,
        ),
      )
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update user status',
      )
    } finally {
      setUpdatingId(null)
    }
  }
  const handleInputChange = event => {
  const { name, value } = event.target

  setFormData(currentData => ({
    ...currentData,
    [name]: value,
  }))
}

const handleCreateUser = async event => {
  event.preventDefault()

  try {
    setCreating(true)
    setError('')

    const data = await createUser({
    ...formData,
    roleIds: selectedRoleIds,
    })

    setUsers(currentUsers => [
      data.user,
      ...currentUsers,
    ])

    setFormData({
      name: '',
      email: '',
      password: '',
    })

    setSelectedRoleIds([])
    setFormData({
    name: '',
    email: '',
    password: '',
    })

setSelectedRoleIds([])

    setShowForm(false)
  } catch (err) {
    setError(
      err.response?.data?.message ||
        'Failed to create user',
    )
  } finally {
    setCreating(false)
  }
}

const handleRoleChange = event => {
  const roleId = event.target.value

  setSelectedRoleIds(currentRoleIds => {
    if (currentRoleIds.includes(roleId)) {
      return currentRoleIds.filter(id => id !== roleId)
    }

    return [...currentRoleIds, roleId]
  })
}

const handleEditInputChange = event => {
  const { name, value } = event.target

  setEditFormData(currentData => ({
    ...currentData,
    [name]: value,
  }))
}

const handleEditRoleChange = event => {
  const roleId = event.target.value

  setEditRoleIds(currentRoleIds => {
    if (currentRoleIds.includes(roleId)) {
      return currentRoleIds.filter(id => id !== roleId)
    }

    return [...currentRoleIds, roleId]
  })
}

const handleUpdateUser = async event => {
  event.preventDefault()

  try {
    setUpdatingUser(true)
    setError('')

    const data = await updateUser(
      editingUser.id,
      {
        ...editFormData,
        roleIds: editRoleIds,
      },
    )

    // Update the user directly in the UI
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === editingUser.id
          ? data.user
          : user,
      ),
    )

    setEditingUser(null)
  } catch (err) {
    setError(
      err.response?.data?.message ||
        'Failed to update user',
    )
  } finally {
    setUpdatingUser(false)
  }
}

  return (
    <DashboardLayout>
      <div className="users-page">
        <div className="users-header">
            <div className="page-title">
                <h2>User Management</h2>
                <p>Manage employee accounts and access</p>
            </div>

            <button
                className="add-user-button"
                onClick={() => setShowForm(true)}
            >
                + Add User
            </button>
        </div>

        {loading && <p>Loading users...</p>}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {editingUser && (
  <div className="user-form-container">
    <form
      className="user-form"
      onSubmit={handleUpdateUser}
    >
      <h3>Edit User</h3>

      <div className="form-group">
        <label>Name</label>

        <input
          type="text"
          name="name"
          value={editFormData.name}
          onChange={handleEditInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          name="email"
          value={editFormData.email}
          onChange={handleEditInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Roles</label>

        <div className="roles-selection">
          {roles.map(role => (
            <label
              key={role.id}
              className="role-checkbox"
            >
              <input
                type="checkbox"
                value={role.id}
                checked={editRoleIds.includes(role.id)}
                onChange={handleEditRoleChange}
              />

              <span>{role.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => setEditingUser(null)}
          disabled={updatingUser}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="create-user-button"
          disabled={updatingUser}
        >
          {updatingUser
            ? 'Updating...'
            : 'Update User'}
        </button>
      </div>
    </form>
  </div>
)}

        {showForm && (
  <div className="user-form-container">
    <form
      className="user-form"
      onSubmit={handleCreateUser}
    >
      <h3>Add New User</h3>

      <div className="form-group">
        <label>Name</label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
  <label>Assign Roles</label>

  <div className="roles-selection">
    {roles.length === 0 ? (
      <p>No roles available</p>
    ) : (
      roles.map(role => (
        <label
          key={role.id}
          className="role-checkbox"
        >
          <input
            type="checkbox"
            value={role.id}
            checked={selectedRoleIds.includes(role.id)}
            onChange={handleRoleChange}
          />

          <span>
            {role.name}
          </span>
        </label>
      ))
    )}
  </div>
</div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => setShowForm(false)}
          disabled={creating}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="create-user-button"
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  </div>
)}

        {!loading && !error && (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                        {user.roles && user.roles.length > 0
                        ? user.roles.map(role => role.name).join(', ')
                        : 'No Role'}
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive
                            ? 'status active'
                            : 'status inactive'
                        }
                      >
                        {user.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>

                    <td>
                        <button
  className="edit-button"
  onClick={() => {
    setEditingUser(user)

    setEditFormData({
      name: user.name,
      email: user.email,
    })

    setEditRoleIds(
      user.roles
        ? user.roles.map(role => role.id)
        : [],
    )
  }}
>
  Edit
</button>
                      <button
                        className={
                          user.isActive
                            ? 'action-button deactivate'
                            : 'action-button activate'
                        }
                        onClick={() =>
                          handleStatusChange(user)
                        }
                        disabled={
                          updatingId === user.id
                        }
                      >
                        {updatingId === user.id
                          ? 'Updating...'
                          : user.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="no-users">
                No users found.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Users