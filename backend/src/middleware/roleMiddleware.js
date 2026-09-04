const prisma = require('../lib/prisma')

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          role: true,
        },
      })

      const roleNames = userRoles.map(
        userRole => userRole.role.name
      )

      const hasRequiredRole = allowedRoles.some(role =>
        roleNames.includes(role)
      )

      if (!hasRequiredRole) {
        return res.status(403).json({
          message: 'You do not have permission to access this resource',
        })
      }

      req.user.roles = roleNames

      next()
    } catch (error) {
      console.error('Role authorization error:', error)

      return res.status(500).json({
        message: 'Authorization failed',
      })
    }
  }
}

module.exports = {
  authorizeRoles,
}