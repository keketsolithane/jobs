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
  User,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  IdCard,
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
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())

  // Toggle job expansion
  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedJobs(newExpanded)
  }

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
          await fetchEmployerData(userData.id)
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

  // Fetch job seeker applications - Only applications for the logged-in job seeker
  const fetchJobSeekerApplications = async (userId: string) => {
    try {
      console.log("Fetching applications for job seeker:", userId)
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_seeker_id', userId)
        .order('applied_at', { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
        return
      }

      console.log("Found job seeker applications:", data)
      setApplications(data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  // Fetch all employer data (jobs and applications)
  const fetchEmployerData = async (employerId: string) => {
    try {
      console.log("Fetching all data for employer:", employerId)
      
      // Get all jobs by this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
        return
      }

      console.log("Found jobs:", jobsData)

      if (!jobsData || jobsData.length === 0) {
        setJobs([])
        setApplications([])
        return
      }

      // Get all job IDs for this employer
      const jobIds = jobsData.map(job => job.id)
      console.log("Job IDs to search for applications:", jobIds)

      // First, get applications without user data
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false })

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError)
        // Set empty applications and continue
        setApplications([])
        const jobsWithEmptyApplications = jobsData.map(job => ({
          ...job,
          applications: [],
          application_count: 0
        }))
        setJobs(jobsWithEmptyApplications)
        return
      }

      console.log("Found applications:", applicationsData)

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([])
        const jobsWithEmptyApplications = jobsData.map(job => ({
          ...job,
          applications: [],
          application_count: 0
        }))
        setJobs(jobsWithEmptyApplications)
        return
      }

      // Now get user details for each application
      const jobSeekerIds = [...new Set(applicationsData.map(app => app.job_seeker_id))]
      console.log("Job seeker IDs to fetch:", jobSeekerIds)

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, phone')
        .in('id', jobSeekerIds)

      if (usersError) {
        console.error("Error fetching users:", usersError)
        // Continue with applications without user data
        setApplications(applicationsData)
        
        // Group applications by job_id without user data
        const applicationsByJobId: { [key: string]: any[] } = {}
        applicationsData.forEach(application => {
          if (!applicationsByJobId[application.job_id]) {
            applicationsByJobId[application.job_id] = []
          }
          applicationsByJobId[application.job_id].push({
            ...application,
            job_seeker: {
              full_name: 'Unknown User',
              email: 'N/A',
              phone: 'N/A'
            }
          })
        })

        const jobsWithApplications = jobsData.map(job => {
          const jobApplications = applicationsByJobId[job.id] || []
          return {
            ...job,
            applications: jobApplications,
            application_count: jobApplications.length
          }
        })

        setJobs(jobsWithApplications)
        return
      }

      console.log("Found users:", usersData)

      // Create a map of user ID to user data
      const userMap: { [key: string]: any } = {}
      if (usersData) {
        usersData.forEach(user => {
          userMap[user.id] = user
        })
      }

      // Combine applications with user data
      const applicationsWithUserData = applicationsData.map(application => ({
        ...application,
        job_seeker: userMap[application.job_seeker_id] || {
          full_name: 'Unknown User',
          email: 'N/A',
          phone: 'N/A'
        }
      }))

      console.log("Applications with user data:", applicationsWithUserData)

      // Set applications for the applications tab
      setApplications(applicationsWithUserData)

      // Group applications by job_id and combine with jobs
      const applicationsByJobId: { [key: string]: any[] } = {}
      applicationsWithUserData.forEach(application => {
        if (!applicationsByJobId[application.job_id]) {
          applicationsByJobId[application.job_id] = []
        }
        applicationsByJobId[application.job_id].push(application)
      })

      console.log("Applications grouped by job ID:", applicationsByJobId)

      // Combine jobs with their applications
      const jobsWithApplications = jobsData.map(job => {
        const jobApplications = applicationsByJobId[job.id] || []
        console.log(`Job ${job.id} has ${jobApplications.length} applications`)
        
        return {
          ...job,
          applications: jobApplications,
          application_count: jobApplications.length
        }
      })

      console.log("Final jobs with applications:", jobsWithApplications)
      setJobs(jobsWithApplications)

    } catch (error) {
      console.error("Error fetching employer data:", error)
      // Set empty arrays to prevent loading state
      setApplications([])
      setJobs(jobsData?.map(job => ({
        ...job,
        applications: [],
        application_count: 0
      })) || [])
    }
  }

  // Update application status (approve/reject)
  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setUpdatingStatus(applicationId)
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) {
        console.error("Error updating application status:", error)
        alert("Failed to update application status")
        return
      }

      // Update local state for both jobs and applications
      setJobs(prev => 
        prev.map(job => ({
          ...job,
          applications: job.applications.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        }))
      )

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      )

      alert(`Application ${status === 'accepted' ? 'approved' : 'rejected'} successfully!`)
    } catch (error) {
      console.error("Error updating application status:", error)
      alert("Failed to update application status")
    } finally {
      setUpdatingStatus(null)
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  // Job Seeker Dashboard - Shows only applications for the logged-in job seeker
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
                        {application.cover_letter && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              <strong>Cover Letter:</strong> {application.cover_letter}
                            </p>
                          </div>
                        )}
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

  // Employer Dashboard - Shows applications for the employer's jobs
  if (user.user_type === "employer") {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter((job) => job.is_active).length
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
                    <p className="text-sm font-medium text-white/80">Pending Review</p>
                    <p className="text-2xl font-bold text-white">{pendingApplications}</p>
                  </div>
                  <Clock className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b">
            <Button
              variant={activeTab === 'jobs' ? "default" : "ghost"}
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'jobs' ? 'border-b-2 border-primary' : ''
              }`}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              My Job Postings ({totalJobs})
            </Button>
            <Button
              variant={activeTab === 'applications' ? "default" : "ghost"}
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'applications' ? 'border-b-2 border-primary' : ''
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              All Applications ({totalApplications})
            </Button>
          </div>

          {/* Jobs Tab - Shows jobs with their applications */}
          {activeTab === 'jobs' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Job Postings</CardTitle>
                  <CardDescription>Manage your job listings and view applications for each job</CardDescription>
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
                  <div className="space-y-6">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        {/* Job Header */}
                        <div 
                          className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                          onClick={() => toggleJobExpansion(job.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                                  <Badge variant="outline">
                                    {job.category}
                                  </Badge>
                                  <span>Posted {formatDate(job.created_at)}</span>
                                  <span>•</span>
                                  <span className="font-medium">{job.application_count} applications</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={job.is_active ? "default" : "secondary"}>
                                  {job.is_active ? "Active" : "Inactive"}
                                </Badge>
                                {expandedJobs.has(job.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Applications Section - Collapsible */}
                        {expandedJobs.has(job.id) && (
                          <div className="p-4 border-t">
                            <h5 className="font-semibold mb-4 flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Applications for this job ({job.application_count})
                            </h5>
                            
                            {job.applications.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <FileText className="h-8 w-8 mx-auto mb-2" />
                                <p>No applications yet for this job</p>
                                <p className="text-sm">Applications will appear here when candidates apply</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {job.applications.map((application: any) => (
                                  <div
                                    key={application.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          {/* Applicant Details */}
                                          <div className="mb-3">
                                            <h6 className="font-medium text-lg flex items-center">
                                              <User className="h-4 w-4 mr-2" />
                                              {application.job_seeker?.full_name || 'Applicant'}
                                            </h6>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                              <div className="flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {application.job_seeker?.email || 'Email not available'}
                                              </div>
                                              <div className="flex items-center">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {application.job_seeker?.phone || 'Phone not available'}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center space-x-2 mb-2">
                                            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                              {getStatusIcon(application.status)}
                                              <span className="ml-1 capitalize">{application.status}</span>
                                            </div>
                                          </div>
                                          <div className="text-sm text-muted-foreground mb-2">
                                            <strong>Job:</strong> {application.job_title}
                                          </div>
                                          <div className="text-sm text-muted-foreground mb-2">
                                            <strong>Company:</strong> {application.company_name}
                                          </div>
                                          <div className="text-sm text-muted-foreground mb-2">
                                            <strong>Location:</strong> {application.job_location}
                                          </div>
                                          {application.cover_letter && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                              <strong>Cover Letter:</strong> {application.cover_letter}
                                            </p>
                                          )}
                                          <p className="text-xs text-muted-foreground">
                                            Applied {formatDate(application.applied_at)}
                                          </p>
                                        </div>
                                        <div className="ml-4 flex flex-col space-y-2">
                                          <Button 
                                            size="sm" 
                                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                            disabled={updatingStatus === application.id || application.status === 'accepted'}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                                          >
                                            {updatingStatus === application.id ? (
                                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                            ) : (
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {application.status === 'accepted' ? 'Approved' : 'Approve'}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                            disabled={updatingStatus === application.id || application.status === 'rejected'}
                                            className="border-red-300 text-red-700 hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-500"
                                          >
                                            {updatingStatus === application.id ? (
                                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1"></div>
                                            ) : (
                                              <XCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {application.status === 'rejected' ? 'Rejected' : 'Reject'}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Job Actions */}
                        <div className="p-4 border-t bg-muted/30">
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/jobs/${job.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View Job
                              </Link>
                            </Button>
                            <div className="text-sm text-muted-foreground">
                              {job.applications.filter((app: any) => app.status === 'pending').length} pending applications
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Applications Tab - Shows ALL applications with applicant details */}
          {activeTab === 'applications' && (
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>Showing all applications with applicant details</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Applications will appear here when candidates apply to your jobs
                    </p>
                    <Button asChild>
                      <Link href="/post-job">Post a Job</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application) => (
                      <Card key={application.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Applicant Details */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2 flex items-center">
                              <User className="h-5 w-5 mr-2" />
                              Applicant Details
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  Full Name:
                                </span>
                                <span className="text-muted-foreground">{application.job_seeker?.full_name || 'N/A'}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  Email:
                                </span>
                                <span className="text-muted-foreground">{application.job_seeker?.email || 'N/A'}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  Phone:
                                </span>
                                <span className="text-muted-foreground">{application.job_seeker?.phone || 'N/A'}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Application ID:</span>
                                <span className="text-muted-foreground">{application.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Application Details */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Application Details</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Job Title:</span>
                                <span className="text-muted-foreground">{application.job_title}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Company Name:</span>
                                <span className="text-muted-foreground">{application.company_name}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Job Location:</span>
                                <span className="text-muted-foreground">{application.job_location}</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Status:</span>
                                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                  {getStatusIcon(application.status)}
                                  <span className="ml-1 capitalize">{application.status}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-medium">Applied At:</span>
                                <span className="text-muted-foreground text-sm">{formatDateTime(application.applied_at)}</span>
                              </div>
                            </div>

                            {/* Cover Letter */}
                            {application.cover_letter && (
                              <div>
                                <h5 className="font-medium mb-2">Cover Letter:</h5>
                                <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                                  <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2">
                              <h5 className="font-medium">Manage Application:</h5>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                  disabled={updatingStatus === application.id || application.status === 'accepted'}
                                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300"
                                >
                                  {updatingStatus === application.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  ) : (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {application.status === 'accepted' ? 'Approved' : 'Approve'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  disabled={updatingStatus === application.id || application.status === 'rejected'}
                                  className="border-red-300 text-red-700 hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-500"
                                >
                                  {updatingStatus === application.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1"></div>
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {application.status === 'rejected' ? 'Rejected' : 'Reject'}
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/jobs/${application.job_id}`}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Job
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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