"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Search, Building, MapPin, ExternalLink, Briefcase, Users } from "lucide-react"

// Mock companies data
const mockCompanies = [
  {
    id: 1,
    name: "TechCorp Inc.",
    description:
      "Leading technology company focused on building innovative solutions that transform how businesses operate.",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    size: "500-1000 employees",
    industry: "Technology",
    jobCount: 12,
    logo: null,
  },
  {
    id: 2,
    name: "StartupXYZ",
    description: "Fast-growing startup revolutionizing the way people work and collaborate in the digital age.",
    location: "New York, NY",
    website: "https://startupxyz.com",
    size: "50-100 employees",
    industry: "Technology",
    jobCount: 8,
    logo: null,
  },
  {
    id: 3,
    name: "Design Studio",
    description: "Creative agency specializing in digital design and user experience for modern brands.",
    location: "Remote",
    website: "https://designstudio.com",
    size: "10-50 employees",
    industry: "Design",
    jobCount: 5,
    logo: null,
  },
  {
    id: 4,
    name: "Analytics Pro",
    description: "Data analytics company helping businesses make informed decisions through advanced analytics.",
    location: "Boston, MA",
    website: "https://analyticspro.com",
    size: "100-500 employees",
    industry: "Data & Analytics",
    jobCount: 15,
    logo: null,
  },
  {
    id: 5,
    name: "Growth Co",
    description: "Marketing and growth consultancy helping companies scale their customer acquisition.",
    location: "Austin, TX",
    website: "https://growthco.com",
    size: "20-50 employees",
    industry: "Marketing",
    jobCount: 6,
    logo: null,
  },
  {
    id: 6,
    name: "CloudTech",
    description: "Cloud infrastructure company providing scalable solutions for modern applications.",
    location: "Seattle, WA",
    website: "https://cloudtech.com",
    size: "200-500 employees",
    industry: "Technology",
    jobCount: 18,
    logo: null,
  },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(mockCompanies)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Companies</h1>
          <p className="text-muted-foreground">
            Discover companies that are hiring and learn more about potential employers
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{company.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {company.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{company.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{company.industry}</Badge>
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {company.size}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm font-medium text-primary">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {company.jobCount} open position{company.jobCount !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    </Button>
                    {company.jobCount > 0 && (
                      <Button size="sm" asChild className="flex-1">
                        <Link href={`/jobs?company=${encodeURIComponent(company.name)}`}>View Jobs</Link>
                      </Button>
                    )}
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
