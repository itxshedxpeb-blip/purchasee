import { NextRequest, NextResponse } from 'next/server'
import { ReportsService } from './reports.service'

const reportsService = new ReportsService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'projects') {
      const report = await reportsService.getProjectReports()
      return NextResponse.json({ success: true, data: report })
    }

    if (type === 'vendors') {
      const report = await reportsService.getVendorReports()
      return NextResponse.json({ success: true, data: report })
    }

    if (type === 'purchases') {
      const filters = {
        projectId: searchParams.get('projectId') || undefined,
        vendorId: searchParams.get('vendorId') || undefined,
        fromDate: searchParams.get('fromDate') || undefined,
        toDate: searchParams.get('toDate') || undefined,
      }
      const report = await reportsService.getPurchaseReports(filters)
      return NextResponse.json({ success: true, data: report })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid report type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to generate report' },
      { status: 500 }
    )
  }
}
