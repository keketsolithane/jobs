"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Plus, Tag, Trash2, Edit, Briefcase } from "lucide-react"

// Mock admin user
const mockUser = {
  id: 1,
  name: "Admin User",
  email: "admin@jobfinder.com",
  type: "admin" as const,
}

// Mock categories data
const mockCategories = [
  {
    id: 1,
    name: "Technology",
    description: "Software development, IT, and tech-related positions",
    jobCount: 45,
  },
  {
    id: 2,
    name: "Design",
    description: "UI/UX design, graphic design, and creative roles",
    jobCount: 23,
  },
  {
    id: 3,
    name: "Marketing",
    description: "Digital marketing, content, and growth positions",
    jobCount: 18,
  },
  {
    id: 4,
    name: "Sales",
    description: "Sales representatives, account management, and business development",
    jobCount: 15,
  },
  {
    id: 5,
    name: "Data Science",
    description: "Data analysis, machine learning, and analytics roles",
    jobCount: 12,
  },
  {
    id: 6,
    name: "Product",
    description: "Product management and strategy positions",
    jobCount: 8,
  },
]

export default function AdminCategoriesPage() {
  const [user, setUser] = useState(mockUser)
  const [categories, setCategories] = useState(mockCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (!formData.name.trim()) {
      setMessage("Category name is required")
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingId) {
        // Update existing category
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId ? { ...cat, name: formData.name, description: formData.description } : cat,
          ),
        )
        setMessage("Category updated successfully!")
        setEditingId(null)
      } else {
        // Add new category
        const newCategory = {
          id: Math.max(...categories.map((c) => c.id)) + 1,
          name: formData.name,
          description: formData.description,
          jobCount: 0,
        }
        setCategories((prev) => [...prev, newCategory])
        setMessage("Category added successfully!")
        setIsAdding(false)
      }

      setFormData({ name: "", description: "" })
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to save category. Please try again.")
    }
  }

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description,
    })
    setEditingId(category.id)
    setIsAdding(true)
  }

  const handleDelete = async (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category && category.jobCount > 0) {
      if (!confirm(`This category has ${category.jobCount} jobs. Are you sure you want to delete it?`)) {
        return
      }
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      setMessage("Category deleted successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to delete category. Please try again.")
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: "", description: "" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Categories</h1>
          <p className="text-muted-foreground">Organize jobs by creating and managing categories</p>
        </div>

        {message && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Add/Edit Category Form */}
        {isAdding && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                {editingId ? "Edit Category" : "Add New Category"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Technology"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this category"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">{editingId ? "Update Category" : "Add Category"}</Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Categories ({categories.length})</CardTitle>
              <CardDescription>Manage job categories and their descriptions</CardDescription>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-muted-foreground mb-4">Create your first category to organize jobs</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {category.jobCount} jobs
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground ml-11">{category.description}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
