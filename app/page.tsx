import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Search, MapPin, Briefcase, Building, Users, TrendingUp } from "lucide-react"

// Mock data for demonstration
const recentJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full Time",
    salary: "$120k - $160k",
    description: "Join our team to build cutting-edge web applications using React and TypeScript...",
    postedAt: "2 days ago",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full Time",
    salary: "$100k - $140k",
    description: "Lead product strategy and work with cross-functional teams to deliver amazing products...",
    postedAt: "1 day ago",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Design Studio",
    location: "Remote",
    type: "Contract",
    salary: "$80k - $100k",
    description: "Create beautiful and intuitive user experiences for our digital products...",
    postedAt: "3 days ago",
  },
]

const stats = {
  totalJobs: 12547,
  totalCompanies: 2341,
  totalApplications: 45623,
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance">Find Your Dream Career Today</h1>
              <p className="text-xl mb-8 text-blue-100 text-pretty">
                Discover thousands of job opportunities from top companies. Start your career journey with us and
                connect with the best employers.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalJobs.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalCompanies.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalApplications.toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Applications</div>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <div>
              <Card className="shadow-2xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Find Your Next Job</CardTitle>
                  <CardDescription className="text-center">Search from thousands of opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Job title, keywords, or company" className="pl-10 h-12" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Location" className="pl-10 h-12" />
                  </div>
                  <Button asChild className="w-full h-12 text-base font-medium">
                    <Link href="/jobs">
                      <Search className="mr-2 h-4 w-4" />
                      Search Jobs
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Job Opportunities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the newest job postings from top companies across various industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recentJobs.map((job) => (
              <Card key={job.id} className="job-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    {job.company}
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{job.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-primary">{job.salary}</div>
                    <div className="text-xs text-muted-foreground">{job.postedAt}</div>
                  </div>
                  <Button asChild className="w-full mt-4 bg-transparent" variant="outline">
                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                View All Jobs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose JobFinder?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We connect talented professionals with amazing opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Top Companies</h3>
              <p className="text-muted-foreground">Connect with leading companies and startups across all industries</p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-muted-foreground">Find opportunities that match your skills and career aspirations</p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
              <p className="text-muted-foreground">
                Apply to multiple jobs with just a few clicks and track your progress
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
