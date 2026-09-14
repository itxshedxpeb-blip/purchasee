import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from './project.service'
import { createProjectSchema, updateProjectSchema } from './project.validation'
import { ZodError } from 'zod'

const projectService = new ProjectService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const project = await projectService.getProjectById(id)
      if (!project) {
        return NextResponse.json(
          { success: false, message: 'Project not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: project })
    }

    const projects = await projectService.getAllProjects()
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await projectService.createProject(validatedData)

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating project:', error)

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
      { success: false, message: error instanceof Error ? error.message : 'Project could not be created' },
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
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const project = await projectService.updateProject(id, validatedData)

    return NextResponse.json({ success: true, data: project })
  } catch (error: unknown) {
    console.error('Error updating project:', error)

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
      { success: false, message: error instanceof Error ? error.message : 'Project could not be updated' },
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
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      )
    }

    await projectService.deleteProject(id)

    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Project could not be deleted' },
      { status: 400 }
    )
  }
}
