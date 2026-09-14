import { z } from 'zod'

export const createProjectSchema = z.object({
  siteCode: z.string().min(1, 'Site code is required').trim().max(20, 'Site code must be less than 20 characters'),
  name: z.string().min(1, 'Project name is required').trim().max(100, 'Project name must be less than 100 characters'),
  clientName: z.string().min(1, 'Client name is required').trim().max(100, 'Client name must be less than 100 characters'),
})

export const updateProjectSchema = z.object({
  siteCode: z.string().min(1, 'Site code is required').trim().max(20, 'Site code must be less than 20 characters'),
  name: z.string().min(1, 'Project name is required').trim().max(100, 'Project name must be less than 100 characters'),
  clientName: z.string().min(1, 'Client name is required').trim().max(100, 'Client name must be less than 100 characters'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
