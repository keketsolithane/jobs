"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, User, Menu, X } from "lucide-react"
import { NotificationBell } from "./notification-bell"

interface NavigationProps {
  user?: {
    id: string
    name: string
    email: string
    type: "job_seeker" | "employer" | "admin"
  } | null
}

export function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
            <Briefcase className="h-6 w-6" />
            <span>JobFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/jobs" className="hover:text-accent transition-colors">
              Browse Jobs
            </Link>
            <Link href="/companies" className="hover:text-accent transition-colors">
              Companies
            </Link>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-primary-foreground hover:text-accent"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    {user.type === "job_seeker" && (
                      <DropdownMenuItem asChild>
                        <Link href="/applications">My Applications</Link>
                      </DropdownMenuItem>
                    )}
                    {(user.type === "employer" || user.type === "admin") && (
                      <DropdownMenuItem asChild>
                        <Link href="/post-job">Post Job</Link>
                      </DropdownMenuItem>
                    )}
                    {user.type === "employer" && (
                      <DropdownMenuItem asChild>
                        <Link href="/manage-applications">Manage Applications</Link>
                      </DropdownMenuItem>
                    )}
                    {user.type === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/logout">Logout</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="text-primary-foreground hover:text-accent">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-2 py-1 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/jobs"
                className="px-2 py-1 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link
                href="/companies"
                className="px-2 py-1 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Companies
              </Link>

              {user ? (
                <>
                  <div className="border-t border-primary-foreground/20 my-2"></div>
                  <NotificationBell />
                  <Link
                    href="/dashboard"
                    className="px-2 py-1 hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.type === "job_seeker" && (
                    <Link
                      href="/applications"
                      className="px-2 py-1 hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  )}
                  {(user.type === "employer" || user.type === "admin") && (
                    <Link
                      href="/post-job"
                      className="px-2 py-1 hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  {user.type === "employer" && (
                    <Link
                      href="/manage-applications"
                      className="px-2 py-1 hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Manage Applications
                    </Link>
                  )}
                  {user.type === "admin" && (
                    <Link
                      href="/admin"
                      className="px-2 py-1 hover:text-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="border-t border-primary-foreground/20 my-2"></div>
                  <Link
                    href="/login"
                    className="px-2 py-1 hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-2 py-1 hover:text-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
