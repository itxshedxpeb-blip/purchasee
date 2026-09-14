import { z } from 'zod'

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').trim().max(100, 'Vendor name must be less than 100 characters'),
})

export const updateVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').trim().max(100, 'Vendor name must be less than 100 characters'),
})

export type CreateVendorInput = z.infer<typeof createVendorSchema>
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>
