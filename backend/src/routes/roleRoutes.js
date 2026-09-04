const express = require('express')

const {
  getRoles,
} = require('../controllers/roleController')

const authenticate = require('../middleware/authMiddleware')

const {
  authorizePermissions,
} = require('../middleware/permissionMiddleware')

const router = express.Router()

// GET ALL ROLES
router.get(
  '/',
  authenticate,
  authorizePermissions('users.read'),
  getRoles,
)

module.exports = router