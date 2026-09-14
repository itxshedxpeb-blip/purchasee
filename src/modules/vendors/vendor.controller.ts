import { NextRequest, NextResponse } from 'next/server'
import { VendorService } from './vendor.service'
import { createVendorSchema, updateVendorSchema } from './vendor.validation'
import { ZodError } from 'zod'

const vendorService = new VendorService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const vendor = await vendorService.getVendorById(id)
      if (!vendor) {
        return NextResponse.json(
          { success: false, message: 'Vendor not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: vendor })
    }

    const vendors = await vendorService.getAllVendors()
    return NextResponse.json({ success: true, data: vendors })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVendorSchema.parse(body)

    const vendor = await vendorService.createVendor(validatedData)

    return NextResponse.json(
      { success: true, data: vendor },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating vendor:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Vendor could not be created' },
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
        { success: false, message: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateVendorSchema.parse(body)

    const vendor = await vendorService.updateVendor(id, validatedData)

    return NextResponse.json({ success: true, data: vendor })
  } catch (error: unknown) {
    console.error('Error updating vendor:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Vendor could not be updated' },
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
        { success: false, message: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    await vendorService.deleteVendor(id)

    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Vendor could not be deleted' },
      { status: 400 }
    )
  }
}
