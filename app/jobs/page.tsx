"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Search, MapPin, Building, Clock, DollarSign, Filter, X } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = ["Technology", "Product", "Design", "Data Science", "Marketing", "Sales", "Finance", "Operations"]

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

// Type for job data from database
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    category: "",
    jobType: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const jobsPerPage = 6

  // Fetch jobs from database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (jobsError) {
          throw jobsError
        }

        setJobs(jobsData || [])
        setFilteredJobs(jobsData || [])
      } catch (err: any) {
        console.error("Error fetching jobs:", err)
        setError("Failed to load jobs. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Filter jobs based on current filters
  useEffect(() => {
    let filtered = jobs

    if (filters.search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          (job.requirements && job.requirements.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    if (filters.location) {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.category) {
      filtered = filtered.filter((job) => job.category === filters.category)
    }

    if (filters.jobType) {
      filtered = filtered.filter((job) => job.job_type === filters.jobType)
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }, [filters, jobs])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      category: "",
      jobType: "",
    })
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salary not specified"
    
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`
      }
      return `$${num.toLocaleString()}`
    }
    
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)}`
    } else if (min) {
      return `From ${formatNumber(min)}`
    } else {
      return `Up to ${formatNumber(max!)}`
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

  const getJobTypeLabel = (type: string) => {
    const jobType = jobTypes.find((jt) => jt.value === type)
    return jobType ? jobType.label : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Function to handle view details click
  const handleViewDetails = (job: Job) => {
    // Store the job data in sessionStorage to pass to the details page
    sessionStorage.setItem('currentJob', JSON.stringify(job))
    
    // Navigate to the job details page
    window.location.href = `/jobs/${job.id}`
  }

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = startIndex + jobsPerPage
  const currentJobs = filteredJobs.slice(startIndex, endIndex)

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "")

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading jobs...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover your next career opportunity from {jobs.length} available positions
          </p>
        </div>

        {error && (
          <Card className="mb-8 border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-destructive text-center">
                <p>{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title or company"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.jobType} onValueChange={(value) => handleFilterChange("jobType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Results */}
        {filteredJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {jobs.length === 0 ? "No jobs available" : "No jobs found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0 
                  ? "Check back later for new job postings" 
                  : "Try adjusting your search criteria or clearing filters"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {currentJobs.map((job) => (
                <Card key={job.id} className="job-card hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 line-clamp-2">{job.title}</CardTitle>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Building className="h-4 w-4 mr-2" />
                          <span className="font-medium">{job.company}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {getJobTypeLabel(job.job_type)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{job.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{job.description}</p>

                    {job.requirements && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        <strong>Requirements:</strong> {job.requirements}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(job.created_at)}
                      </div>
                      <Button onClick={() => handleViewDetails(job)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}