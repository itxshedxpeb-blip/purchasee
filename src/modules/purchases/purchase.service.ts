import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CreatePurchaseInput, UpdatePurchaseInput, PurchaseItemInput } from './purchase.validation'

export class PurchaseService {
  async generatePurchaseNumber(): Promise<string> {
    // Get the latest purchase number
    const latestPurchase = await prisma.purchase.findFirst({
      orderBy: { purchaseNumber: 'desc' },
      select: { purchaseNumber: true },
    })

    if (!latestPurchase) {
      return 'PUR-000001'
    }

    // Extract the numeric part and increment
    const currentNumber = parseInt(latestPurchase.purchaseNumber.replace('PUR-', ''), 10)
    const nextNumber = currentNumber + 1
    return `PUR-${String(nextNumber).padStart(6, '0')}`
  }

  async getAllPurchases(filters: {
    projectId?: string
    vendorId?: string
    search?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }) {
    const { projectId, vendorId, search, fromDate, toDate, page = 1, limit = 20 } = filters

    const where: Prisma.PurchaseWhereInput = {}

    if (projectId) {
      where.projectId = projectId
    }

    if (vendorId) {
      where.vendorId = vendorId
    }

    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search, mode: 'insensitive' } },
        { deliveryLocation: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (fromDate || toDate) {
      where.purchaseDate = {}
      if (fromDate) {
        where.purchaseDate.gte = new Date(fromDate)
      }
      if (toDate) {
        where.purchaseDate.lte = new Date(toDate)
      }
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          project: true,
          vendor: true,
          items: true,
        },
        orderBy: { purchaseDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchase.count({ where }),
    ])

    return {
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getPurchaseById(id: string) {
    return await prisma.purchase.findUnique({
      where: { id },
      include: {
        project: true,
        vendor: true,
        items: true,
      },
    })
  }

  async createPurchase(data: CreatePurchaseInput) {
    const purchaseNumber = await this.generatePurchaseNumber()

    // Calculate amounts
    const itemsWithAmounts = data.items.map((item) => ({
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.quantity * item.rate,
    }))

    const subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0)
    const totalAmount = subtotal

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // Verify project and vendor exist
      const project = await tx.project.findUnique({
        where: { id: data.projectId },
      })

      if (!project) {
        throw new Error('Project not found')
      }

      const vendor = await tx.vendor.findUnique({
        where: { id: data.vendorId },
      })

      if (!vendor) {
        throw new Error('Vendor not found')
      }

      // Create purchase with items
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          purchaseDate: new Date(data.purchaseDate),
          projectId: data.projectId,
          vendorId: data.vendorId,
          deliveryLocation: data.deliveryLocation,
          invoiceNumber: data.invoiceNumber,
          remarks: data.remarks,
          subtotal,
          totalAmount,
          items: {
            create: itemsWithAmounts,
          },
        },
        include: {
          project: true,
          vendor: true,
          items: true,
        },
      })

      return purchase
    })
  }

  async updatePurchase(id: string, data: UpdatePurchaseInput) {
    // Calculate amounts if items are provided
    let subtotal = 0
    let itemsWithAmounts: Prisma.PurchaseItemCreateWithoutPurchaseInput[] = []

    if (data.items) {
      itemsWithAmounts = data.items.map((item) => ({
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.quantity * item.rate,
      }))
      subtotal = itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0)
    }

    const totalAmount = subtotal

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // Verify purchase exists
      const existingPurchase = await tx.purchase.findUnique({
        where: { id },
      })

      if (!existingPurchase) {
        throw new Error('Purchase not found')
      }

      // Verify project and vendor exist if provided
      if (data.projectId) {
        const project = await tx.project.findUnique({
          where: { id: data.projectId },
        })

        if (!project) {
          throw new Error('Project not found')
        }
      }

      if (data.vendorId) {
        const vendor = await tx.vendor.findUnique({
          where: { id: data.vendorId },
        })

        if (!vendor) {
          throw new Error('Vendor not found')
        }
      }

      // Delete existing items if new items are provided
      if (data.items) {
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: id },
        })
      }

      // Update purchase
      const purchase = await tx.purchase.update({
        where: { id },
        data: {
          ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
          ...(data.projectId && { projectId: data.projectId }),
          ...(data.vendorId && { vendorId: data.vendorId }),
          ...(data.deliveryLocation && { deliveryLocation: data.deliveryLocation }),
          ...(data.invoiceNumber !== undefined && { invoiceNumber: data.invoiceNumber }),
          ...(data.remarks !== undefined && { remarks: data.remarks }),
          ...(data.items && { subtotal, totalAmount }),
          ...(data.items && {
            items: {
              create: itemsWithAmounts,
            },
          }),
        },
        include: {
          project: true,
          vendor: true,
          items: true,
        },
      })

      return purchase
    })
  }

  async deletePurchase(id: string) {
    // Verify purchase exists
    const purchase = await prisma.purchase.findUnique({
      where: { id },
    })

    if (!purchase) {
      throw new Error('Purchase not found')
    }

    // Delete purchase (items will be cascade deleted)
    await prisma.purchase.delete({
      where: { id },
    })

    return { success: true }
  }
}
