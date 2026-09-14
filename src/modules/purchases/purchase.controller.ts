import { NextRequest, NextResponse } from 'next/server'
import { PurchaseService } from './purchase.service'
import { createPurchaseSchema, updatePurchaseSchema } from './purchase.validation'

const purchaseService = new PurchaseService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const purchase = await purchaseService.getPurchaseById(id)
      if (!purchase) {
        return NextResponse.json(
          { success: false, message: 'Purchase not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: purchase })
    }

    // Parse filters
    const filters = {
      projectId: searchParams.get('projectId') || undefined,
      vendorId: searchParams.get('vendorId') || undefined,
      search: searchParams.get('search') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    const result = await purchaseService.getAllPurchases(filters)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load purchases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPurchaseSchema.parse(body)

    const purchase = await purchaseService.createPurchase(validatedData)

    return NextResponse.json(
      { success: true, data: purchase },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating purchase:', error)

    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: (error as any).errors,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Purchase could not be created' },
      { status: 400 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Purchase ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updatePurchaseSchema.parse(body)

    const purchase = await purchaseService.updatePurchase(id, validatedData)

    return NextResponse.json({ success: true, data: purchase })
  } catch (error: unknown) {
    console.error('Error updating purchase:', error)

    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: (error as any).errors,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Purchase could not be updated' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Purchase ID is required' },
        { status: 400 }
      )
    }

    await purchaseService.deletePurchase(id)

    return NextResponse.json({ success: true, message: 'Purchase deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting purchase:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Purchase could not be deleted' },
      { status: 400 }
    )
  }
}
