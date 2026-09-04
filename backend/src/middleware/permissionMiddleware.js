const prisma = require('../lib/prisma')

const authorizePermissions = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      })

      // Collect all permissions from all user roles
      const userPermissions = userRoles.flatMap(userRole =>
        userRole.role.rolePermissions.map(
          rolePermission => rolePermission.permission.name
        )
      )

      // Remove duplicate permissions
      const uniquePermissions = [...new Set(userPermissions)]

      // Check whether user has every required permission
      const hasRequiredPermissions = requiredPermissions.every(
        permission => uniquePermissions.includes(permission)
      )

      if (!hasRequiredPermissions) {
        return res.status(403).json({
          message: 'You do not have the required permission',
        })
      }

      // Attach permissions for later use
      req.user.permissions = uniquePermissions

      next()
    } catch (error) {
      console.error('Permission authorization error:', error)

      return res.status(500).json({
        message: 'Permission authorization failed',
      })
    }
  }
}

module.exports = {
  authorizePermissions,
}