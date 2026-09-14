import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { CreateProjectInput, UpdateProjectInput } from './project.validation'

export class ProjectService {
  async getAllProjects() {
    return await prisma.project.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    })
  }

  async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            vendor: true,
          },
          orderBy: { purchaseDate: 'desc' },
        },
      },
    })
  }

  async createProject(data: CreateProjectInput) {
    try {
      return await prisma.project.create({
        data: { 
          siteCode: data.siteCode,
          name: data.name,
          clientName: data.clientName
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A project with this site code or name already exists')
        }
      }
      throw error
    }
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    try {
      return await prisma.project.update({
        where: { id },
        data: { 
          siteCode: data.siteCode,
          name: data.name,
          clientName: data.clientName
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A project with this site code or name already exists')
        }
        if (error.code === 'P2025') {
          throw new Error('Project not found')
        }
      }
      throw error
    }
  }

  async deleteProject(id: string) {
    // Check if project has purchases
    const projectWithPurchases = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    })

    if (!projectWithPurchases) {
      throw new Error('Project not found')
    }

    if (projectWithPurchases._count.purchases > 0) {
      throw new Error('Cannot delete project with existing purchases')
    }

    try {
      return await prisma.project.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Project not found')
        }
      }
      throw error
    }
  }

  async getProjectStats(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const totalAmount = project.purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount),
      0
    )

    return {
      id: project.id,
      siteCode: project.siteCode,
      name: project.name,
      clientName: project.clientName,
      purchaseCount: project.purchases.length,
      totalAmount,
      purchases: project.purchases.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        vendor: purchase.vendor.name,
        deliveryLocation: purchase.deliveryLocation,
        totalAmount: purchase.totalAmount,
      })),
    }
  }
}
