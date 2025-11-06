"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Briefcase,
  FileText,
  Building,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  BarChart3,
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get user data from either Supabase auth OR localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        let userData = null
        
        // First try: Check Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log("Found Supabase Auth session:", session.user)
          
          // Get user data from users table using auth ID
          const { data: authUserData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!userError && authUserData) {
            userData = authUserData
            console.log("User data from Auth:", userData)
          }
        }

        // Second try: Check for temporary session (non-auth users)
        if (!userData) {
          console.log("No Auth session, checking localStorage...")
          const storedUserType = localStorage.getItem('userType')
          const storedUserId = localStorage.getItem('userId')
          
          if (storedUserId && storedUserType) {
            // Get user data from users table using stored ID
            const { data: tempUserData, error: tempError } = await supabase
              .from('users')
              .select('*')
              .eq('id', storedUserId)
              .single()

            if (!tempError && tempUserData) {
              userData = tempUserData
              console.log("User data from localStorage:", userData)
            } else {
              console.log("User not found in database, clearing stored session")
              localStorage.removeItem('userType')
              localStorage.removeItem('userId')
              window.location.href = '/login'
              return
            }
          }
        }

        // If no user found, redirect to login
        if (!userData) {
          console.log("No user found, redirecting to login...")
          window.location.href = '/login'
          return
        }

        console.log("User authenticated:", userData)
        setUser(userData)

        // Fetch user-specific data based on user type
        if (userData.user_type === 'job_seeker') {
          await fetchJobSeekerApplications(userData.id)
        } else if (userData.user_type === 'employer') {
          await fetchEmployerJobs(userData.id)
        }

      } catch (error) {
        console.error("Auth check error:", error)
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes (only for Auth users)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)
      
      if (event === 'SIGNED_OUT') {
        // Clear both Auth and temporary sessions
        localStorage.removeItem('userType')
        localStorage.removeItem('userId')
        window.location.href = '/login'
      } else if (session?.user) {
        // Update user data if Auth session is restored
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(userData)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch job seeker applications
  const fetchJobSeekerApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_seeker_id', userId)
        .order('applied_at', { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  // Fetch employer jobs with application counts
  const fetchEmployerJobs = async (employerId: string) => {
    try {
      // First get all jobs by this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
        return
      }

      if (!jobsData) {
        setJobs([])
        return
      }

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        jobsData.map(async (job) => {
          const { count, error: countError } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id)

          if (countError) {
            console.error("Error counting applications:", countError)
            return { ...job, application_count: 0 }
          }

          return {
            ...job,
            application_count: count || 0
          }
        })
      )

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error("Error fetching employer jobs:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewed":
        return <Eye className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Please log in to view your dashboard</h2>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Job Seeker Dashboard
  if (user.user_type === "job_seeker") {
    const totalApplications = applications.length
    const pendingApplications = applications.filter((app) => app.status === "pending").length
    const acceptedApplications = applications.filter((app) => app.status === "accepted").length
    const rejectedApplications = applications.filter((app) => app.status === "rejected").length

    return (
      <div className="min-h-screen flex flex-col">
        <Navigation user={user} />

        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name || user.email}!</h1>
            <p className="text-muted-foreground">Track your job applications and discover new opportunities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/80">Total Applications</p>
                    <p className="text-2xl font-bold text-primary-foreground">{totalApplications}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Pending</p>
                    <p className="text-2xl font-bold text-white">{pendingApplications}</p>
                  </div>
                  <Clock className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Accepted</p>
                    <p className="text-2xl font-bold text-white">{acceptedApplications}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Rejected</p>
                    <p className="text-2xl font-bold text-white">{rejectedApplications}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </div>
              <Button asChild>
                <Link href="/jobs">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                  <Button asChild>
                    <Link href="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h4 className="font-semibold">{application.job_title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Building className="h-3 w-3 mr-1" />
                              {application.company_name}
                              <span className="mx-2">•</span>
                              {application.job_location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied {formatDate(application.applied_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${application.job_id}`}>View Job</Link>
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

  // Employer Dashboard
  if (user.user_type === "employer") {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter((job) => job.status === "active").length
    const totalApplications = jobs.reduce((sum, job) => sum + job.application_count, 0)
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0

    return (
      <div className="min-h-screen flex flex-col">
        <Navigation user={user} />

        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name || user.email}!</h1>
            <p className="text-muted-foreground">Manage your job postings and review applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/80">Total Jobs</p>
                    <p className="text-2xl font-bold text-primary-foreground">{totalJobs}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Active Jobs</p>
                    <p className="text-2xl font-bold text-white">{activeJobs}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Total Applications</p>
                    <p className="text-2xl font-bold text-white">{totalApplications}</p>
                  </div>
                  <Users className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Avg per Job</p>
                    <p className="text-2xl font-bold text-white">{avgApplicationsPerJob}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Job Postings</CardTitle>
                <CardDescription>Manage your job listings and track applications</CardDescription>
              </div>
              <Button asChild>
                <Link href="/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground mb-4">Start posting jobs to attract candidates</p>
                  <Button asChild>
                    <Link href="/post-job">Post Your First Job</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h4 className="font-semibold">{job.title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Badge variant="outline" className="mr-2">
                                {job.category}
                              </Badge>
                              <span>Posted {formatDate(job.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant={job.status === "active" ? "default" : "secondary"}>
                                {job.status === "active" ? "Active" : "Closed"}
                              </Badge>
                              <Badge variant="outline">{job.application_count} applications</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${job.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/manage-applications?job_id=${job.id}`}>
                            <Users className="h-3 w-3 mr-1" />
                            Applications
                          </Link>
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

  // Fallback for unknown user types
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} />
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Account type not recognized</h2>
          <p className="text-muted-foreground mb-4">Please contact support for assistance.</p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}