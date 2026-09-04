require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const permissions = [
  {
    name: 'users.read',
    description: 'View users',
  },
  {
    name: 'users.create',
    description: 'Create users',
  },
  {
    name: 'users.update',
    description: 'Update users',
  },
  {
    name: 'users.delete',
    description: 'Delete users',
  },
  {
    name: 'roles.read',
    description: 'View roles',
  },
  {
    name: 'roles.manage',
    description: 'Create and manage roles',
  },
  {
    name: 'employees.read',
    description: 'View employee information',
  },
  {
    name: 'employees.manage',
    description: 'Manage employee information',
  },
  {
    name: 'audit.read',
    description: 'View audit logs',
  },
]

const roleDefinitions = [
  {
    name: 'Admin',
    description: 'Full system access',
    permissions: [
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'roles.read',
      'roles.manage',
      'employees.read',
      'employees.manage',
      'audit.read',
    ],
  },
  {
    name: 'HR',
    description: 'Manage employee information',
    permissions: [
      'employees.read',
      'employees.manage',
      'users.read',
    ],
  },
  {
    name: 'Sales',
    description: 'Sales department access',
    permissions: [
      'employees.read',
    ],
  },
  {
    name: 'Support',
    description: 'Support department access',
    permissions: [
      'employees.read',
    ],
  },
  {
    name: 'Finance',
    description: 'Finance department access',
    permissions: [
      'employees.read',
    ],
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Create permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    })
  }

  console.log(`✓ ${permissions.length} permissions created`)

  // Create roles and assign permissions
  for (const roleDefinition of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDefinition.name },
      update: {
        description: roleDefinition.description,
      },
      create: {
        name: roleDefinition.name,
        description: roleDefinition.description,
      },
    })

    for (const permissionName of roleDefinition.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      })

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      }
    }
  }

  console.log(`✓ ${roleDefinitions.length} roles created`)
  console.log('🎉 Database seeding completed successfully')
}

main()
  .catch(error => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })