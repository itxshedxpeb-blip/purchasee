import { z } from 'zod'

export const purchaseItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').trim().max(200, 'Item name must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required').trim().max(20, 'Unit must be less than 20 characters'),
  rate: z.number().nonnegative('Rate must be 0 or greater'),
})

export const createPurchaseSchema = z.object({
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  projectId: z.string().min(1, 'Project is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  deliveryLocation: z.string().min(1, 'Delivery location is required').trim().max(200, 'Delivery location must be less than 200 characters'),
  invoiceNumber: z.string().max(50, 'Invoice number must be less than 50 characters').optional(),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
})

export const updatePurchaseSchema = z.object({
  purchaseDate: z.string().min(1, 'Purchase date is required').optional(),
  projectId: z.string().min(1, 'Project is required').optional(),
  vendorId: z.string().min(1, 'Vendor is required').optional(),
  deliveryLocation: z.string().min(1, 'Delivery location is required').trim().max(200, 'Delivery location must be less than 200 characters').optional(),
  invoiceNumber: z.string().max(50, 'Invoice number must be less than 50 characters').optional(),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required').optional(),
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>
