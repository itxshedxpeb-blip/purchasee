import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from './dashboard.service'

const dashboardService = new DashboardService()

export async function GET(request: NextRequest) {
  try {
    const stats = await dashboardService.getDashboardStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load dashboard data' },
      { status: 500 }
    )
  }
}
