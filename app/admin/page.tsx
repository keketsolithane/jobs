"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Users, Briefcase, Building, FileText, Activity, Settings, BarChart3 } from "lucide-react"

// Mock admin user
const mockUser = {
  id: 1,
  name: "Admin User",
  email: "admin@jobfinder.com",
  type: "admin" as const,
}

// Mock statistics
const mockStats = {
  totalUsers: 1247,
  jobSeekers: 892,
  employers: 355,
  totalJobs: 156,
  activeJobs: 134,
  closedJobs: 22,
  totalApplications: 2341,
  pendingApplications: 456,
  totalCompanies: 89,
  newUsersThisWeek: 23,
  newJobsThisWeek: 12,
  applicationsThisWeek: 187,
}

// Mock recent activities
const mockActivities = [
  {
    id: 1,
    type: "job_posted",
    title: "New job posted: Senior React Developer",
    user: "TechCorp Inc.",
    timestamp: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    type: "user_registered",
    title: "New job seeker registered",
    user: "Alice Johnson",
    timestamp: "2024-01-15T09:30:00Z",
  },
  {
    id: 3,
    type: "application_submitted",
    title: "Application submitted for Product Manager",
    user: "Bob Smith",
    timestamp: "2024-01-15T09:15:00Z",
  },
  {
    id: 4,
    type: "company_registered",
    title: "New employer registered",
    user: "StartupXYZ",
    timestamp: "2024-01-15T08:45:00Z",
  },
  {
    id: 5,
    type: "job_closed",
    title: "Job closed: Marketing Specialist",
    user: "Growth Co",
    timestamp: "2024-01-14T16:20:00Z",
  },
]

export default function AdminPage() {
  const [user, setUser] = useState(mockUser)
  const [stats, setStats] = useState(mockStats)
  const [activities, setActivities] = useState(mockActivities)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.ceil(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return `${Math.ceil(diffDays / 7)}w ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_posted":
        return <Briefcase className="h-4 w-4 text-blue-500" />
      case "user_registered":
        return <Users className="h-4 w-4 text-green-500" />
      case "application_submitted":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "company_registered":
        return <Building className="h-4 w-4 text-orange-500" />
      case "job_closed":
        return <Briefcase className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the JobFinder platform</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">Total Users</p>
                  <p className="text-2xl font-bold text-primary-foreground">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-primary-foreground/60 mt-1">+{stats.newUsersThisWeek} this week</p>
                </div>
                <Users className="h-8 w-8 text-primary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                  <p className="text-xs text-white/60 mt-1">+{stats.newJobsThisWeek} this week</p>
                </div>
                <Briefcase className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Applications</p>
                  <p className="text-2xl font-bold text-white">{stats.totalApplications.toLocaleString()}</p>
                  <p className="text-xs text-white/60 mt-1">+{stats.applicationsThisWeek} this week</p>
                </div>
                <FileText className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Companies</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
                  <p className="text-xs text-white/60 mt-1">Registered employers</p>
                </div>
                <Building className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Job Seekers</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.jobSeekers}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.jobSeekers / stats.totalUsers) * 100)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Employers</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.employers}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.employers / stats.totalUsers) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Active</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.activeJobs}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.activeJobs / stats.totalJobs) * 100)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm">Closed</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.closedJobs}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.closedJobs / stats.totalJobs) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.pendingApplications}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((stats.pendingApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Processed</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.totalApplications - stats.pendingApplications}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(
                      ((stats.totalApplications - stats.pendingApplications) / stats.totalApplications) * 100,
                    )}
                    %
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Jobs
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/categories">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Categories
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
