"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Search, Users, Mail, Calendar, MoreHorizontal, Shield, Ban, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock admin user
const mockUser = {
  id: 1,
  name: "Admin User",
  email: "admin@jobfinder.com",
  type: "admin" as const,
}

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    type: "job_seeker",
    status: "active",
    location: "San Francisco, CA",
    joinedAt: "2024-01-10T10:00:00Z",
    lastActive: "2024-01-15T14:30:00Z",
    applicationCount: 12,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    type: "job_seeker",
    status: "active",
    location: "New York, NY",
    joinedAt: "2024-01-08T15:20:00Z",
    lastActive: "2024-01-14T09:15:00Z",
    applicationCount: 8,
  },
  {
    id: 3,
    name: "TechCorp Inc.",
    email: "hr@techcorp.com",
    type: "employer",
    status: "active",
    location: "San Francisco, CA",
    joinedAt: "2024-01-05T11:45:00Z",
    lastActive: "2024-01-15T16:20:00Z",
    jobCount: 5,
  },
  {
    id: 4,
    name: "Carol Davis",
    email: "carol@example.com",
    type: "job_seeker",
    status: "suspended",
    location: "Los Angeles, CA",
    joinedAt: "2024-01-03T09:30:00Z",
    lastActive: "2024-01-12T11:00:00Z",
    applicationCount: 3,
  },
  {
    id: 5,
    name: "StartupXYZ",
    email: "contact@startupxyz.com",
    type: "employer",
    status: "active",
    location: "Austin, TX",
    joinedAt: "2024-01-01T14:15:00Z",
    lastActive: "2024-01-13T10:45:00Z",
    jobCount: 3,
  },
]

export default function AdminUsersPage() {
  const [user, setUser] = useState(mockUser)
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || user.type === filterType
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleUserAction = async (userId: number, action: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (action === "suspend") {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u)))
      } else if (action === "activate") {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u)))
      }

      // In a real app, you'd show a toast notification
      console.log(`User ${action}d successfully`)
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "job_seeker":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "employer":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
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
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All User Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All User Types</SelectItem>
                  <SelectItem value="job_seeker">Job Seekers</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-foreground" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{userData.name}</h4>
                          <Badge className={getUserTypeColor(userData.type)}>{userData.type.replace("_", " ")}</Badge>
                          <Badge className={getStatusColor(userData.status)}>{userData.status}</Badge>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {userData.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {formatDate(userData.joinedAt)}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          {userData.location && `${userData.location} • `}
                          Last active {formatDate(userData.lastActive)}
                          {userData.type === "job_seeker" && ` • ${userData.applicationCount} applications`}
                          {userData.type === "employer" && ` • ${userData.jobCount} jobs posted`}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        {userData.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleUserAction(userData.id, "suspend")}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUserAction(userData.id, "activate")}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
