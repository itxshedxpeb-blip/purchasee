'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingState from '@/components/common/LoadingState'
import EmptyState from '@/components/common/EmptyState'
import { FolderOpen, Plus } from 'lucide-react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Card, CardContent } from '@/components/common/Card'

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
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSiteCode, setNewProjectSiteCode] = useState('')
  const [newProjectClientName, setNewProjectClientName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)

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
    } catch (error) {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-blue-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-blue-600 mb-1">{project.siteCode}</h3>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{project.name}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium text-gray-900">{project.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
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
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 page-transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Project</h3>
            
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
            
            <div className="flex justify-end gap-4 mt-6">
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
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject} isLoading={creating}>
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}

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
