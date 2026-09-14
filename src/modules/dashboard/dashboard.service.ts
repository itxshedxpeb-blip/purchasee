import { prisma } from '@/lib/prisma'

export class DashboardService {
  async getDashboardStats() {
    // Get summary stats
    const [totalPurchase, purchaseEntries, projectCount, vendorCount] = await Promise.all([
      prisma.purchase.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.purchase.count(),
      prisma.project.count(),
      prisma.vendor.count(),
    ])

    // Get project totals
    const projectTotals = await prisma.project.findMany({
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
        purchases: {
          _count: 'desc',
        },
      },
    })

    const projectStats = projectTotals.map((project) => ({
      id: project.id,
      name: project.name,
      purchaseCount: project._count.purchases,
      totalAmount: project.purchases.reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      ),
    }))

    // Get vendor totals
    const vendorTotals = await prisma.vendor.findMany({
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
        purchases: {
          _count: 'desc',
        },
      },
    })

    const vendorStats = vendorTotals.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      purchaseCount: vendor._count.purchases,
      totalAmount: vendor.purchases.reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      ),
    }))

    // Get recent purchases
    const recentPurchases = await prisma.purchase.findMany({
      include: {
        project: true,
        vendor: true,
      },
      orderBy: { purchaseDate: 'desc' },
      take: 10,
    })

    // Get monthly totals for the current year
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31)

    const monthlyPurchases = await prisma.purchase.findMany({
      where: {
        purchaseDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        purchaseDate: true,
        totalAmount: true,
      },
    })

    // Group by month
    const monthlyTotals = Array.from({ length: 12 }, (_, month) => {
      const monthPurchases = monthlyPurchases.filter(
        (purchase) => new Date(purchase.purchaseDate).getMonth() === month
      )
      const total = monthPurchases.reduce(
        (sum, purchase) => sum + Number(purchase.totalAmount),
        0
      )
      return {
        month: month + 1,
        monthName: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
        totalAmount: total,
      }
    })

    return {
      totalPurchase: Number(totalPurchase._sum.totalAmount) || 0,
      purchaseEntries,
      projectCount,
      vendorCount,
      projectTotals: projectStats,
      vendorTotals: vendorStats,
      recentPurchases: recentPurchases.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        project: purchase.project.name,
        vendor: purchase.vendor.name,
        totalAmount: purchase.totalAmount,
      })),
      monthlyTotals,
    }
  }
}
