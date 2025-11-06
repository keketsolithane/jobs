"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, User, CheckCircle } from "lucide-react"

// Mock user data
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  type: "employer" as const,
}

// Mock job data
const mockJob = {
  id: 1,
  title: "Senior Frontend Developer",
  company: "TechCorp Inc.",
  location: "San Francisco, CA",
}

// Mock applications data
const mockApplications = [
  {
    id: 1,
    jobId: 1,
    applicant: {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
    },
    coverLetter:
      "I am excited to apply for the Senior Frontend Developer position at TechCorp Inc. With over 6 years of experience in React and TypeScript, I have successfully led multiple projects from conception to deployment. My passion for creating exceptional user experiences aligns perfectly with your company's mission.",
    appliedAt: "2024-01-15T10:00:00Z",
    status: "pending" as const,
  },
  {
    id: 2,
    jobId: 1,
    applicant: {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "+1 (555) 987-6543",
      location: "Oakland, CA",
    },
    coverLetter:
      "As a frontend developer with 4 years of experience, I am thrilled about the opportunity to join TechCorp Inc. I have extensive experience with modern JavaScript frameworks and have contributed to several open-source projects.",
    appliedAt: "2024-01-14T14:30:00Z",
    status: "reviewed" as const,
  },
  {
    id: 3,
    jobId: 1,
    applicant: {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      phone: "+1 (555) 456-7890",
      location: "San Jose, CA",
    },
    coverLetter:
      "I am writing to express my strong interest in the Senior Frontend Developer role. My background in computer science and 5 years of hands-on experience with React, Vue.js, and modern web technologies make me an ideal candidate for this position.",
    appliedAt: "2024-01-13T09:15:00Z",
    status: "accepted" as const,
  },
  {
    id: 4,
    jobId: 1,
    applicant: {
      id: 4,
      name: "David Wilson",
      email: "david@example.com",
      phone: "+1 (555) 321-0987",
      location: "Berkeley, CA",
    },
    coverLetter:
      "Hello! I am very interested in the Senior Frontend Developer position. I have been working with React for the past 3 years and have experience building scalable web applications. I would love to bring my skills to your team.",
    appliedAt: "2024-01-12T16:45:00Z",
    status: "rejected" as const,
  },
]

const statusOptions = [
  { value: "pending", label: "Pending", color: "status-pending" },
  { value: "reviewed", label: "Reviewed", color: "status-reviewed" },
  { value: "accepted", label: "Accepted", color: "status-accepted" },
  { value: "rejected", label: "Rejected", color: "status-rejected" },
]

export default function ManageApplicationsPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job_id")

  const [user, setUser] = useState(mockUser)
  const [job, setJob] = useState(mockJob)
  const [applications, setApplications] = useState(mockApplications)
  const [updateMessage, setUpdateMessage] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus as any } : app)),
      )

      setUpdateMessage("Application status updated successfully!")
      setTimeout(() => setUpdateMessage(""), 3000)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return statusOption ? statusOption.color : "status-pending"
  }

  const getStatusCounts = () => {
    const counts = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: applications.length,
      pending: counts.pending || 0,
      reviewed: counts.reviewed || 0,
      accepted: counts.accepted || 0,
      rejected: counts.rejected || 0,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Applications</h1>
          <p className="text-muted-foreground">
            Review and manage applications for: <span className="font-medium">{job.title}</span>
          </p>
        </div>

        {updateMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {updateMessage}
            </div>
          </div>
        )}

        {/* Job Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>
              {job.company} • {job.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{statusCounts.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</div>
                <div className="text-sm text-muted-foreground">Reviewed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">Applications will appear here when candidates apply for this job</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{application.applicant.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {application.applicant.email}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {application.applicant.phone && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-2" />
                        {application.applicant.phone}
                      </div>
                    )}
                    {application.applicant.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-2" />
                        {application.applicant.location}
                      </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      Applied on {formatDate(application.appliedAt)}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Cover Letter
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Label htmlFor={`status-${application.id}`} className="text-sm font-medium">
                      Update Status
                    </Label>
                    <Select
                      value={application.status}
                      onValueChange={(value) => handleStatusUpdate(application.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
