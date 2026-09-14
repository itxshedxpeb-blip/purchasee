import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CreateVendorInput, UpdateVendorInput } from './vendor.validation'

export class VendorService {
  async getAllVendors() {
    return await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    })
  }

  async getVendorById(id: string) {
    return await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            project: true,
          },
          orderBy: { purchaseDate: 'desc' },
        },
      },
    })
  }

  async createVendor(data: CreateVendorInput) {
    try {
      return await prisma.vendor.create({
        data: { name: data.name },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A vendor with this name already exists')
        }
      }
      throw error
    }
  }

  async updateVendor(id: string, data: UpdateVendorInput) {
    try {
      return await prisma.vendor.update({
        where: { id },
        data: { name: data.name },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A vendor with this name already exists')
        }
        if (error.code === 'P2025') {
          throw new Error('Vendor not found')
        }
      }
      throw error
    }
  }

  async deleteVendor(id: string) {
    // Check if vendor has purchases
    const vendorWithPurchases = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    })

    if (!vendorWithPurchases) {
      throw new Error('Vendor not found')
    }

    if (vendorWithPurchases._count.purchases > 0) {
      throw new Error('Cannot delete vendor with existing purchases')
    }

    try {
      return await prisma.vendor.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Vendor not found')
        }
      }
      throw error
    }
  }

  async getVendorStats(id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!vendor) {
      throw new Error('Vendor not found')
    }

    const totalAmount = vendor.purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount),
      0
    )

    return {
      id: vendor.id,
      name: vendor.name,
      purchaseCount: vendor.purchases.length,
      totalAmount,
      purchases: vendor.purchases.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        project: purchase.project.name,
        deliveryLocation: purchase.deliveryLocation,
        totalAmount: purchase.totalAmount,
      })),
    }
  }
}
