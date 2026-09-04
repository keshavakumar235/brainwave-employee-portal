const bcrypt = require('bcrypt')
const prisma = require('../lib/prisma')

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedUsers = users.map(user => ({
      ...user,
      roles: user.userRoles.map(userRole => userRole.role),
      userRoles: undefined,
    }))

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    })
  } catch (error) {
    console.error('Get users error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    })
  }
}

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },

      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        roles: user.userRoles.map(userRole => userRole.role),
        userRoles: undefined,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    })
  }
}

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password, roleIds = [] } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      })
    }

    // Validate roles before creating the user
    if (roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      })

      if (roles.length !== roleIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected roles are invalid',
        })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        userRoles: {
          create: roleIds.map(roleId => ({
            roleId,
          })),
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,

        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'User created successfully',

      user: {
        ...user,
        roles: user.userRoles.map(userRole => userRole.role),
        userRoles: undefined,
      },
    })
  } catch (error) {
    console.error('Create user error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    })
  }
}

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, roleIds } = req.body

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Validate role IDs if roles are being updated
    if (roleIds !== undefined) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      })

      if (roles.length !== roleIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected roles are invalid',
        })
      }
    }

    const user = await prisma.$transaction(async tx => {
      // Update basic user information
      await tx.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
        },
      })

      // Replace roles only if roleIds were provided
      if (roleIds !== undefined) {
        await tx.userRole.deleteMany({
          where: { userId: id },
        })

        if (roleIds.length > 0) {
          await tx.userRole.createMany({
            data: roleIds.map(roleId => ({
              userId: id,
              roleId,
            })),
          })
        }
      }

      return tx.user.findUnique({
        where: { id },

        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          updatedAt: true,

          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })
    })

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',

      user: {
        ...user,
        roles: user.userRoles.map(userRole => userRole.role),
        userRoles: undefined,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)

    // Email uniqueness error
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email is already in use',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    })
  }
}

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false',
      })
    }

    const user = await prisma.user.update({
      where: { id },

      data: {
        isActive,
      },

      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    })
  } catch (error) {
    console.error('Update status error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
}