"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Briefcase, DollarSign, MapPin, Building, FileText, Tag } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = [
  "Technology",
  "Product",
  "Design",
  "Data Science",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Customer Success",
  "Human Resources",
]

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

export default function PostJobPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [authLoading, setAuthLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    category: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    companyWebsite: "",
    companyDescription: "",
  })

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

        // Check if user is an employer
        if (userData.user_type !== 'employer') {
          console.log("User is not an employer, redirecting to dashboard...")
          window.location.href = '/dashboard'
          return
        }

        console.log("Employer authenticated:", userData)
        setUser(userData)

      } catch (error) {
        console.error("Auth check error:", error)
        window.location.href = '/login'
      } finally {
        setAuthLoading(false)
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Basic validation
    if (!formData.title || !formData.company || !formData.location || !formData.jobType || !formData.category || !formData.description) {
      setError("Please fill in all required fields.")
      setIsLoading(false)
      return
    }

    if (formData.salaryMin && formData.salaryMax) {
      const minSalary = Number.parseInt(formData.salaryMin)
      const maxSalary = Number.parseInt(formData.salaryMax)
      if (minSalary >= maxSalary) {
        setError("Maximum salary must be greater than minimum salary.")
        setIsLoading(false)
        return
      }
    }

    try {
      // Insert job into Supabase with the employer's ID
      const { data, error: supabaseError } = await supabase
        .from('jobs')
        .insert([
          {
            employer_id: user.id, // Use the actual logged-in employer's ID
            title: formData.title,
            company: formData.company,
            location: formData.location,
            job_type: formData.jobType,
            category: formData.category,
            salary_min: formData.salaryMin ? Number.parseInt(formData.salaryMin) : null,
            salary_max: formData.salaryMax ? Number.parseInt(formData.salaryMax) : null,
            description: formData.description,
            requirements: formData.requirements || null,
            company_website: formData.companyWebsite || null,
            company_description: formData.companyDescription || null,
            is_active: true, // Set job as active by default
          }
        ])
        .select()

      if (supabaseError) {
        console.error("Supabase error:", supabaseError)
        
        if (supabaseError.code === '42501') {
          throw new Error("Permission denied. Please check your database permissions.")
        } else {
          throw new Error(supabaseError.message || "Failed to post job.")
        }
      }

      console.log("Job posted successfully:", data)
      setSuccess("Job posted successfully! Redirecting to dashboard...")

      // Redirect to employer dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (err: any) {
      console.error("Job posting error:", err)
      setError(err.message || "Failed to post job. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
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
            <h2 className="text-xl font-semibold mb-4">Please log in to post a job</h2>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (user.user_type !== 'employer') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Employer Access Required</h2>
            <p className="text-muted-foreground mb-4">Only employer accounts can post jobs.</p>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
            <p className="text-muted-foreground">Find the perfect candidate for your open position</p>
          </div>

          {error && (
            <Alert className="mb-6 border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Job Details
                </CardTitle>
                <CardDescription>Provide basic information about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Senior Frontend Developer"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Your company name"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA or Remote"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type *</Label>
                    <Select value={formData.jobType} onValueChange={(value) => handleChange("jobType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Min Salary</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salaryMin"
                        type="number"
                        placeholder="50000"
                        value={formData.salaryMin}
                        onChange={(e) => handleChange("salaryMin", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max Salary</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salaryMax"
                        type="number"
                        placeholder="80000"
                        value={formData.salaryMax}
                        onChange={(e) => handleChange("salaryMax", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Job Description & Requirements
                </CardTitle>
                <CardDescription>Describe the role and what you're looking for in a candidate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the required skills, experience, and qualifications..."
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
                <CardDescription>Help candidates learn more about your company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.companyWebsite}
                    onChange={(e) => handleChange("companyWebsite", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="Tell candidates about your company, culture, and mission..."
                    value={formData.companyDescription}
                    onChange={(e) => handleChange("companyDescription", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}