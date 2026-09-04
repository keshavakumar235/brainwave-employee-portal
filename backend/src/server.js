require('dotenv').config()

const {
  authorizePermissions,
} = require('./middleware/permissionMiddleware')
const userRoutes = require('./routes/userRoutes')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const authenticate = require('./middleware/authMiddleware')
const { authorizeRoles } = require('./middleware/roleMiddleware')
const dashboardRoutes = require('./routes/dashboardRoutes')
const roleRoutes = require('./routes/roleRoutes')

const authRoutes = require('./routes/authRoutes')

const app = express()

// Security headers
app.use(helmet())

// Allow requests from our React frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

// Parse JSON request bodies
app.use(express.json())

// Log API requests in development
app.use(morgan('dev'))

// Authentication routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/roles', roleRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BrainWave Employee Portal API is running',
  })
})

// Temporary root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to BrainWave Employee Portal API',
  })
})

// Temporary protected route for testing JWT authentication
app.get('/api/profile', authenticate, (req, res) => {
  res.status(200).json({
    message: 'Protected route accessed successfully',
    user: req.user,
  })
})

app.get(
  '/api/admin',
  authenticate,
  authorizeRoles('Admin'),
  (req, res) => {
    res.status(200).json({
      message: 'Welcome, Admin!',
      user: req.user,
    })
  }
)

app.get(
  '/api/users-test',
  authenticate,
  authorizePermissions('users.read'),
  (req, res) => {
    res.status(200).json({
      message: 'You have permission to view users',
      user: req.user,
    })
  }
)


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})