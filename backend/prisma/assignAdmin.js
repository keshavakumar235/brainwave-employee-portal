require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'admin@brainwave.com',
    },
  })

  if (!user) {
    throw new Error('Admin user not found')
  }

  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'Admin',
    },
  })

  if (!adminRole) {
    throw new Error('Admin role not found')
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  })

  console.log('Admin role assigned successfully')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })