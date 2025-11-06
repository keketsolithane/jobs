"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  Download,
} from "lucide-react"
import Link from "next/link"

const mockApplication = {
  id: 1,
  jobTitle: "Senior Frontend Developer",
  company: "TechCorp Inc.",
  location: "San Francisco, CA",
  appliedDate: "2024-01-15",
  status: "interview",
  salary: "$120,000 - $150,000",
  type: "Full-time",
  logo: "/tech-company-logo.jpg",
  description: "We are looking for a Senior Frontend Developer to join our growing team...",
  requirements: [
    "5+ years of React experience",
    "Strong TypeScript skills",
    "Experience with Next.js",
    "Knowledge of modern CSS frameworks",
  ],
  timeline: [
    { date: "2024-01-15", event: "Application Submitted", status: "completed" },
    { date: "2024-01-18", event: "Application Reviewed", status: "completed" },
    { date: "2024-01-22", event: "Phone Interview Scheduled", status: "current" },
    { date: "TBD", event: "Technical Interview", status: "pending" },
    { date: "TBD", event: "Final Decision", status: "pending" },
  ],
  recruiter: {
    name: "Sarah Johnson",
    title: "Senior Recruiter",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 123-4567",
    avatar: "/professional-woman-diverse.png",
  },
  documents: [
    { name: "Resume.pdf", uploadDate: "2024-01-15", size: "245 KB" },
    { name: "Cover Letter.pdf", uploadDate: "2024-01-15", size: "128 KB" },
    { name: "Portfolio.pdf", uploadDate: "2024-01-15", size: "1.2 MB" },
  ],
}

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

const getTimelineStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "current":
      return "bg-blue-500"
    case "pending":
      return "bg-gray-300"
    default:
      return "bg-gray-300"
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const [message, setMessage] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/applications">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>

          <div className="flex items-start gap-4">
            <img
              src={mockApplication.logo || "/placeholder.svg"}
              alt={`${mockApplication.company} logo`}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{mockApplication.jobTitle}</h1>
              <div className="flex items-center gap-4 text-slate-600 mb-3">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{mockApplication.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{mockApplication.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{mockApplication.salary}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(mockApplication.status)}>Interview Scheduled</Badge>
                <span className="text-slate-600">{mockApplication.type}</span>
                <span className="text-slate-600">Applied {mockApplication.appliedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700">{mockApplication.description}</p>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {mockApplication.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockApplication.timeline.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getTimelineStatusColor(item.status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900">{item.event}</span>
                              <span className="text-sm text-slate-500">{item.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">{doc.name}</div>
                              <div className="text-sm text-slate-500">
                                Uploaded {doc.uploadDate} • {doc.size}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mockApplication.recruiter.avatar || "/placeholder.svg"} />
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-slate-100 rounded-lg p-3">
                            <p className="text-sm">
                              Hi! Thank you for your application. We'd like to schedule a phone interview for next week.
                              Are you available?
                            </p>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">2 days ago</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mb-3"
                      />
                      <Button>Send Message</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recruiter Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Recruiter Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={mockApplication.recruiter.avatar || "/placeholder.svg"} />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-slate-900">{mockApplication.recruiter.name}</div>
                    <div className="text-sm text-slate-500">{mockApplication.recruiter.title}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    {mockApplication.recruiter.email}
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    {mockApplication.recruiter.phone}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Update Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
