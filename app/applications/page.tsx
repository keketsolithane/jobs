"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, MapPin, Building2, Eye, MessageSquare, FileText } from "lucide-react"

const mockApplications = [
  {
    id: 1,
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    appliedDate: "2024-01-15",
    status: "interview",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    logo: "/tech-company-logo.jpg",
  },
  {
    id: 2,
    jobTitle: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    appliedDate: "2024-01-12",
    status: "pending",
    salary: "$100,000 - $130,000",
    type: "Full-time",
    logo: "/abstract-startup-logo.png",
  },
  {
    id: 3,
    jobTitle: "UX Designer",
    company: "Design Studio",
    location: "Remote",
    appliedDate: "2024-01-10",
    status: "rejected",
    salary: "$80,000 - $100,000",
    type: "Contract",
    logo: "/design-studio-logo.png",
  },
  {
    id: 4,
    jobTitle: "Full Stack Engineer",
    company: "InnovateLab",
    location: "Austin, TX",
    appliedDate: "2024-01-08",
    status: "accepted",
    salary: "$110,000 - $140,000",
    type: "Full-time",
    logo: "/innovation-lab-logo.png",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "interview":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "accepted":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Under Review"
    case "interview":
      return "Interview Scheduled"
    case "accepted":
      return "Offer Received"
    case "rejected":
      return "Not Selected"
    default:
      return status
  }
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesTab = activeTab === "all" || app.status === activeTab
    return matchesSearch && matchesStatus && matchesTab
  })

  const getTabCount = (status: string) => {
    if (status === "all") return mockApplications.length
    return mockApplications.filter((app) => app.status === status).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track and manage your job applications</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getTabCount("pending")})</TabsTrigger>
            <TabsTrigger value="interview">Interview ({getTabCount("interview")})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({getTabCount("accepted")})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getTabCount("rejected")})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Applications Grid */}
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={application.logo || "/placeholder.svg"}
                      alt={`${application.company} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{application.jobTitle}</h3>
                      <div className="flex items-center gap-4 text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{application.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {application.appliedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        <span className="text-slate-600">{application.type}</span>
                        <span className="text-slate-900 font-medium">{application.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Job
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
