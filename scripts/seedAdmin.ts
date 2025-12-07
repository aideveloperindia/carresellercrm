import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function seedAdmin() {
  // Default admin credentials
  const email = process.env.ADMIN_EMAIL || 'admin@carresellercrm.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Admin User'

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    })

    if (existingAdmin) {
      console.log(`✅ Admin with email ${email} already exists.`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔑 Password: ${password}`)
      return
    }

    // Create admin
    const passwordHash = await hashPassword(password)
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name,
      },
    })

    console.log(`✅ Default Admin created successfully!`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 Name: ${name}`)
    console.log(`🆔 Admin ID: ${admin.id}`)
    console.log(`\n⚠️  Please change the default password after first login!`)
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()

