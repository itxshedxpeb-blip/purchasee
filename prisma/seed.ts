import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample projects
  await prisma.project.upsert({
    where: { siteCode: 'ABC-001' },
    update: {},
    create: { 
      siteCode: 'ABC-001',
      name: 'ABC Warehouse',
      clientName: 'ABC Corporation'
    },
  })

  await prisma.project.upsert({
    where: { siteCode: 'XYZ-002' },
    update: {},
    create: { 
      siteCode: 'XYZ-002',
      name: 'XYZ Factory',
      clientName: 'XYZ Industries'
    },
  })

  await prisma.project.upsert({
    where: { siteCode: 'PQR-003' },
    update: {},
    create: { 
      siteCode: 'PQR-003',
      name: 'PQR Shed',
      clientName: 'PQR Logistics'
    },
  })

  // Create sample vendors
  await prisma.vendor.upsert({
    where: { name: 'XYZ Steel' },
    update: {},
    create: { name: 'XYZ Steel' },
  })

  await prisma.vendor.upsert({
    where: { name: 'ABC Cement' },
    update: {},
    create: { name: 'ABC Cement' },
  })

  await prisma.vendor.upsert({
    where: { name: 'PQR Hardware' },
    update: {},
    create: { name: 'PQR Hardware' },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
