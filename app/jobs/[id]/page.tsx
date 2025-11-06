"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Building, MapPin, DollarSign, Clock, Briefcase, ArrowLeft, CheckCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Job type
interface Job {
  id: string
  title: string
  company: string
  location: string
  job_type: string
  category: string
  salary_min: number | null
  salary_max: number | null
  description: string
  requirements: string | null
  company_website: string | null
  company_description: string | null
  is_active: boolean
  created_at: string
  employer_id: string
}

export default function JobDetailsPage() {
  const params = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [user, setUser] = useState<any>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)

  // Fetch job details - first try sessionStorage, then fallback to database
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const jobId = params.id as string
        
        // First, try to get job from sessionStorage (passed from jobs page)
        const storedJob = sessionStorage.getItem('currentJob')
        if (storedJob) {
          const parsedJob = JSON.parse(storedJob)
          // Verify the job ID matches the current route
          if (parsedJob.id === jobId) {
            console.log("Using job data from sessionStorage")
            setJob(parsedJob)
            // Clear the stored job after use to avoid stale data
            sessionStorage.removeItem('currentJob')
            setIsLoading(false)
            return
          }
        }

        // If not in sessionStorage, fetch from database
        console.log("Fetching job data from database")
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .eq("is_active", true)
          .single()
        
        if (jobError) throw jobError
        if (!jobData) throw new Error("Job not found")
        setJob(jobData)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) fetchJob()
  }, [params.id])

  // Track logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      // First check localStorage for non-auth users
      const storedUserType = localStorage.getItem('userType')
      const storedUserId = localStorage.getItem('userId')
      
      if (storedUserId && storedUserType) {
        // Get user data from users table using stored ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", storedUserId)
          .single()
        
        if (!userError && userData) {
          setUser(userData)
          return
        } else {
          // Clear invalid stored session
          localStorage.removeItem('userType')
          localStorage.removeItem('userId')
        }
      }

      // If no localStorage session, check Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch user info from users table
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setUser(userData || null)
      }
    }
    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setUser(data || null))
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Check if user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (user && job) {
        const { data } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', job.id)
          .eq('job_seeker_id', user.id)
          .single()

        if (data) {
          setHasApplied(true)
        }
      }
    }

    if (user && job) {
      checkApplication()
    }
  }, [user, job])

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salary not specified"
    const formatNumber = (num: number) => (num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`)
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`
    if (min) return `From ${formatNumber(min)}`
    return `Up to ${formatNumber(max!)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getJobTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      full_time: "Full Time",
      part_time: "Part Time",
      contract: "Contract",
      internship: "Internship",
    }
    return types[type] || type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Submit job application
  const submitApplication = async () => {
    if (!user) {
      alert("You must be logged in to apply.")
      return
    }
    
    if (user.user_type !== 'job_seeker') {
      alert("Only job seekers can apply for jobs.")
      return
    }
    
    if (!job) return
    if (!coverLetter.trim()) {
      alert("Please enter a cover letter.")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("job_applications").insert([
        {
          job_id: job.id,
          job_seeker_id: user.id,
          job_title: job.title,
          company_name: job.company,
          job_location: job.location,
          cover_letter: coverLetter,
          status: "pending",
          applied_at: new Date().toISOString(),
        },
      ])
      if (error) throw error
      alert("✅ Job application submitted successfully!")
      setCoverLetter("")
      setHasApplied(true)
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit job application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">{error || "Job not found"}</h2>
            <Button asChild>
              <Link href="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl lg:text-3xl mb-3">{job.title}</CardTitle>
                    <div className="flex items-center mb-2">
                      <Building className="h-5 w-5 mr-2" />
                      <span className="text-lg font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{getJobTypeLabel(job.job_type)}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {job.category}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Posted {formatDate(job.created_at)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {job.description.split("\n").map((p, i) => (
                    <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements (if available) */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {job.requirements.split("\n").map((p, i) => (
                      <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{p}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
              </CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Application Submitted</h3>
                    <p className="text-muted-foreground mb-4">You have already applied for this position.</p>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">View My Applications</Link>
                    </Button>
                  </div>
                ) : !user ? (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-semibold mb-2">Login to Apply</h3>
                    <p className="text-muted-foreground mb-4">You need to be logged in to apply for this job.</p>
                    <Button asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                  </div>
                ) : user.user_type !== 'job_seeker' ? (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-semibold mb-2">Employer Account</h3>
                    <p className="text-muted-foreground mb-4">Employer accounts cannot apply for jobs.</p>
                  </div>
                ) : (
                  <>
                    <Label htmlFor="coverLetter">Write a short cover letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Explain why you are a great fit for this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      className="mt-2 mb-4"
                    />
                    <Button
                      type="button"
                      onClick={submitApplication}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Job Application"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Salary</div>
                    <div className="font-semibold">{formatSalary(job.salary_min, job.salary_max)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Job Type</div>
                    <div className="font-semibold">{getJobTypeLabel(job.job_type)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Category</div>
                    <div className="font-semibold">{job.category}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Posted</div>
                    <div className="font-semibold">{formatDate(job.created_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                {job.company_description ? (
                  <p className="text-muted-foreground text-sm">{job.company_description}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">No company description available.</p>
                )}
                
                {job.company_website && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <a href={job.company_website} target="_blank" rel="noopener noreferrer">
                      Visit Company Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}