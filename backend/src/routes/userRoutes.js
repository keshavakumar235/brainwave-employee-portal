const express = require('express')

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
} = require('../controllers/userController')

const authenticate = require('../middleware/authMiddleware')

const {
  authorizePermissions,
} = require('../middleware/permissionMiddleware')

const router = express.Router()

// GET ALL USERS
router.get(
  '/',
  authenticate,
  authorizePermissions('users.read'),
  getUsers
)

// GET SINGLE USER
router.get(
  '/:id',
  authenticate,
  authorizePermissions('users.read'),
  getUserById
)

// CREATE USER
router.post(
  '/',
  authenticate,
  authorizePermissions('users.create'),
  createUser
)

// UPDATE USER
router.patch(
  '/:id',
  authenticate,
  authorizePermissions('users.update'),
  updateUser
)

// ACTIVATE / DEACTIVATE USER
router.patch(
  '/:id/status',
  authenticate,
  authorizePermissions('users.update'),
  updateUserStatus
)

module.exports = router