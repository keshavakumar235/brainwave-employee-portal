const prisma = require('../lib/prisma')

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      totalPermissions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          isActive: true,
        },
      }),
      prisma.role.count(),
      prisma.permission.count(),
    ])

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalRoles,
        totalPermissions,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    })
  }
}

module.exports = {
  getDashboardStats,
}