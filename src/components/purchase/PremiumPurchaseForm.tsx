'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  siteCode: string
  name: string
  clientName: string
}

interface Vendor {
  id: string
  name: string
}

interface PurchaseItem {
  id: string
  itemName: string
  description: string
  quantity: number
  unit: string
  rate: number
  amount: number
}

export default function PremiumPurchaseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSiteCode, setNewProjectSiteCode] = useState('')
  const [newProjectClientName, setNewProjectClientName] = useState('')
  const [newVendorName, setNewVendorName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    projectId: '',
    vendorId: '',
    deliveryLocation: '',
    invoiceNumber: '',
    remarks: '',
  })

  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', itemName: '', description: '', quantity: 0, unit: 'PCS', rate: 0, amount: 0 },
  ])

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, vendorsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/vendors'),
        ])

        const projectsData = await projectsRes.json()
        const vendorsData = await vendorsRes.json()

        if (projectsData.success) setProjects(projectsData.data)
        if (vendorsData.success) setVendors(vendorsData.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find(p => p.id === formData.projectId)
      setSelectedProject(project || null)
    } else {
      setSelectedProject(null)
    }
  }, [formData.projectId, projects])

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate)
          }
          return updatedItem
        }
        return item
      })
    )
  }

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), itemName: '', description: '', quantity: 0, unit: 'PCS', rate: 0, amount: 0 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) {
      setError('At least one item is required')
      return
    }
    setItems(items.filter((item) => item.id !== id))
  }

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
        setFormData({ ...formData, projectId: data.data.id })
        setNewProjectName('')
        setNewProjectSiteCode('')
        setNewProjectClientName('')
        setShowProjectDialog(false)
        setError('')
        setSuccess('Project created successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create project')
      }
    } catch (error) {
      setError('Failed to create project')
    }
  }

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) {
      setError('Vendor name is required')
      return
    }

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendorName }),
      })

      const data = await response.json()

      if (data.success) {
        setVendors([...vendors, data.data])
        setFormData({ ...formData, vendorId: data.data.id })
        setNewVendorName('')
        setShowVendorDialog(false)
        setError('')
        setSuccess('Vendor created successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create vendor')
      }
    } catch (error) {
      setError('Failed to create vendor')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.purchaseDate) {
      setError('Purchase date is required')
      return
    }
    if (!formData.projectId) {
      setError('Project is required')
      return
    }
    if (!formData.vendorId) {
      setError('Vendor is required')
      return
    }
    if (!formData.deliveryLocation.trim()) {
      setError('Delivery location is required')
      return
    }

    const validItems = items.filter((item) => item.itemName.trim() && item.quantity > 0 && item.rate >= 0)
    if (validItems.length === 0) {
      setError('At least one valid item is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: validItems.map((item) => ({
            itemName: item.itemName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Purchase created successfully!')
        setTimeout(() => router.push('/purchases'), 1500)
      } else {
        setError(data.message || 'Failed to create purchase')
      }
    } catch (error) {
      setError('Failed to create purchase')
    } finally {
      setLoading(false)
    }
  }

  const projectOptions = [
    { value: '', label: 'Select Project' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ]

  const vendorOptions = [
    { value: '', label: 'Select Vendor' },
    ...vendors.map((v) => ({ value: v.id, label: v.name })),
  ]

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Purchase</h1>
        <p className="text-gray-500 mt-2">Record a new purchase entry</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 bg-red-600 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <p className="text-sm text-red-800 flex-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-sm text-green-800 flex-1">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purchase Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Purchase Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Purchase Date"
              type="date"
              id="purchaseDate"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />

            <div>
              <Select
                label="Project"
                id="projectId"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                options={projectOptions}
                required
              />
              <button
                type="button"
                onClick={() => setShowProjectDialog(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </button>
            </div>

            <div>
              <Select
                label="Vendor"
                id="vendorId"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                options={vendorOptions}
                required
              />
              <button
                type="button"
                onClick={() => setShowVendorDialog(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Create New Vendor
              </button>
            </div>

            <Input
              label="Delivery Location"
              id="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
              placeholder="e.g., Ahmedabad Site"
              required
            />

            <Input
              label="Invoice Number (Optional)"
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="e.g., INV-001"
            />
          </div>

          {/* Project Auto-Fill Display */}
          {selectedProject && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 mb-1">Site Code</p>
                  <p className="font-medium text-blue-900">{selectedProject.siteCode}</p>
                </div>
                <div>
                  <p className="text-blue-700 mb-1">Project Name</p>
                  <p className="font-medium text-blue-900">{selectedProject.name}</p>
                </div>
                <div>
                  <p className="text-blue-700 mb-1">Client Name</p>
                  <p className="font-medium text-blue-900">{selectedProject.clientName}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Input
              label="Remarks (Optional)"
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Purchase Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Items</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl p-4 md:p-6 space-y-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      label="Item Name"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                      placeholder="Enter item name"
                      fullWidth
                    />

                    <Input
                      label="Description (Optional)"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Description or specification"
                      fullWidth
                    />

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <input
                          type="number"
                          step="0.001"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          placeholder="PCS"
                          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <div className="h-10 flex items-center px-4 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} size="lg">
            Save Purchase
          </Button>
        </div>
      </form>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            isLoading={loading}
            fullWidth
            size="lg"
          >
            Save Purchase
          </Button>
        </div>
      </div>

      {/* Desktop Total Summary */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Purchase Total</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</p>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      {showProjectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowProjectDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 page-transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Project</h3>
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
                  setShowProjectDialog(false)
                  setNewProjectName('')
                  setNewProjectSiteCode('')
                  setNewProjectClientName('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Vendor Dialog */}
      {showVendorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowVendorDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 page-transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Vendor</h3>
            <Input
              label="Vendor Name"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              placeholder="Enter vendor name"
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowVendorDialog(false)
                  setNewVendorName('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateVendor}>Create Vendor</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
