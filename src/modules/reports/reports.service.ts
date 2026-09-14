import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class ReportsService {
  async getProjectReports() {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { purchases: true },
        },
        purchases: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      purchaseCount: project._count.purchases,
      totalAmount: project.purchases.reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      ),
    }))
  }

  async getVendorReports() {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { purchases: true },
        },
        purchases: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      purchaseCount: vendor._count.purchases,
      totalAmount: vendor.purchases.reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      ),
    }))
  }

  async getPurchaseReports(filters: {
    projectId?: string
    vendorId?: string
    fromDate?: string
    toDate?: string
  }) {
    const { projectId, vendorId, fromDate, toDate } = filters

    const where: Prisma.PurchaseWhereInput = {}

    if (projectId) {
      where.projectId = projectId
    }

    if (vendorId) {
      where.vendorId = vendorId
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

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        project: true,
        vendor: true,
        items: true,
      },
      orderBy: { purchaseDate: 'desc' },
    })

    return purchases.map((purchase) => ({
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      purchaseDate: purchase.purchaseDate,
      project: purchase.project.name,
      vendor: purchase.vendor.name,
      deliveryLocation: purchase.deliveryLocation,
      subtotal: purchase.subtotal,
      totalAmount: purchase.totalAmount,
      itemCount: purchase.items.length,
    }))
  }
}
