'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Vendor {
  id: string
  name: string
}

interface PurchaseItem {
  id: string
  itemName: string
  quantity: number
  rate: number
  amount: number
}

export default function PurchaseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newVendorName, setNewVendorName] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    projectId: '',
    vendorId: '',
    deliveryLocation: '',
    notes: '',
  })

  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', itemName: '', quantity: 0, rate: 0, amount: 0 },
  ])

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
      { id: Date.now().toString(), itemName: '', quantity: 0, rate: 0, amount: 0 },
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

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      })

      const data = await response.json()

      if (data.success) {
        setProjects([...projects, data.data])
        setFormData({ ...formData, projectId: data.data.id })
        setNewProjectName('')
        setShowProjectDialog(false)
        setError('')
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
            quantity: item.quantity,
            rate: item.rate,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/purchases')
      } else {
        setError(data.message || 'Failed to create purchase')
      }
    } catch (error) {
      setError('Failed to create purchase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Purchase</h1>
        <p className="text-gray-500 mt-1">Record a new purchase entry</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purchase Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchase Date"
              type="date"
              id="purchaseDate"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowProjectDialog(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Create New Project
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                id="vendorId"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowVendorDialog(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Create New Vendor
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
          </div>

          <div className="mt-4">
            <Input
              label="Notes (Optional)"
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Purchase Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Item</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 w-40">Amount</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                        placeholder="Item name"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.001"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate || ''}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Save Purchase
          </Button>
        </div>
      </form>

      {/* Create Project Dialog */}
      {showProjectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Create Project</h3>
            <Input
              label="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowProjectDialog(false)
                  setNewProjectName('')
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Create Vendor</h3>
            <Input
              label="Vendor Name"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              placeholder="Enter vendor name"
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
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
