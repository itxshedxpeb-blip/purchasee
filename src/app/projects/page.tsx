'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingState from '@/components/common/LoadingState'
import EmptyState from '@/components/common/EmptyState'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dialog from '@/components/common/Dialog'
import { Card, CardContent } from '@/components/common/Card'
import { useToast } from '@/components/common/ToastProvider'

interface Project {
  id: string
  siteCode: string
  name: string
  clientName: string
  _count: {
    purchases: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSiteCode, setNewProjectSiteCode] = useState('')
  const [newProjectClientName, setNewProjectClientName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()

        if (data.success) {
          setProjects(data.data)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required')
      return
    }
    if (!newProjectSiteCode.trim()) {
      setError('Site code is required')
      return
    }
    if (!newProjectClientName.trim()) {
      setError('Client name is required')
      return
    }

    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteCode: newProjectSiteCode,
          name: newProjectName,
          clientName: newProjectClientName
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProjects([...projects, data.data])
        setNewProjectName('')
        setNewProjectSiteCode('')
        setNewProjectClientName('')
        setShowCreateDialog(false)
        setSuccess('Project created successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create project')
      }
    } catch {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!projectToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/projects?id=${projectToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectToDelete.id))
        showToast('success', data.message || 'Project deleted successfully')
      } else {
        showToast('error', data.message || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showToast('error', 'Failed to delete project')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setProjectToDelete(null)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-2">Manage your projects and view purchase totals</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline ml-2">New Project</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project while entering your first purchase"
          actionLabel="Create Purchase"
          onAction={() => router.push('/new-purchase')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300 group"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(project, e)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 min-h-[36px] min-w-[36px]"
                    aria-label="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-blue-600 mb-1 truncate">{project.siteCode}</h3>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 truncate">{project.name}</h2>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{project.clientName}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Purchases</span>
                    <span className="font-medium text-gray-900">{project._count.purchases}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false)
          setNewProjectName('')
          setNewProjectSiteCode('')
          setNewProjectClientName('')
          setError('')
        }}
        title="Create Project"
        size="sm"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 bg-red-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-sm text-red-800 flex-1">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Site Code"
            value={newProjectSiteCode}
            onChange={(e) => setNewProjectSiteCode(e.target.value)}
            placeholder="e.g., ABC-001"
          />
          <Input
            label="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
          />
          <Input
            label="Client Name"
            value={newProjectClientName}
            onChange={(e) => setNewProjectClientName(e.target.value)}
            placeholder="Enter client name"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowCreateDialog(false)
              setNewProjectName('')
              setNewProjectSiteCode('')
              setNewProjectClientName('')
              setError('')
            }}
            disabled={creating}
            fullWidth
          >
            Cancel
          </Button>
          <Button onClick={handleCreateProject} isLoading={creating} fullWidth>
            Create Project
          </Button>
        </div>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setProjectToDelete(null)
        }}
        title="Delete Project"
        size="sm"
      >
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {projectToDelete && projectToDelete._count.purchases > 0
            ? `Are you sure you want to delete "${projectToDelete.name}"? This will also delete ${projectToDelete._count.purchases} associated purchase(s). This action cannot be undone.`
            : projectToDelete
            ? `Are you sure you want to delete "${projectToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this project? This action cannot be undone.'
          }
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteDialog(false)
              setProjectToDelete(null)
            }}
            disabled={deleting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </Dialog>

      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 shadow-lg page-transition">
          <div className="w-5 h-5 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-sm text-green-800 flex-1">{success}</p>
        </div>
      )}
    </div>
  )
}
