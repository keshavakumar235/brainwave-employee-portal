const prisma = require('../lib/prisma')

// GET ALL ROLES
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,

        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    })

    const formattedRoles = roles.map(role => ({
      ...role,

      permissions: role.rolePermissions.map(
        rolePermission => rolePermission.permission,
      ),

      rolePermissions: undefined,
    }))

    return res.status(200).json({
      success: true,
      count: formattedRoles.length,
      roles: formattedRoles,
    })
  } catch (error) {
    console.error('Get roles error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
    })
  }
}

module.exports = {
  getRoles,
}