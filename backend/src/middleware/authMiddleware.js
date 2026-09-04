const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // Check whether Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required',
      })
    }

    // Extract token
    const token = authHeader.split(' ')[1]

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify that user still exists
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      })
    }

    // Block inactive users
    if (!user.isActive) {
      return res.status(403).json({
        message: 'User account is inactive',
      })
    }

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    console.error('Authentication error:', error)

    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}

module.exports = authenticate