// app/login/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, Mail, Lock } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Login attempt for:", formData.email)

      // First, try to find the user in our database by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, user_type, full_name, auth_user_id')
        .eq('email', formData.email)
        .single()

      if (userError || !userData) {
        throw new Error("Invalid email or password")
      }

      console.log("Found user in database:", userData)

      // If user has an auth_user_id, try Supabase authentication
      if (userData.auth_user_id) {
        console.log("User has auth ID, trying Supabase Auth...")
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (authError) {
          console.warn("Supabase Auth failed:", authError.message)
          throw new Error("Invalid email or password")
        }

        console.log("Supabase Auth successful:", authData.user)
      } else {
        // User doesn't have auth_user_id (created during Auth outage)
        console.log("User created without Auth, bypassing password check for development")
        
        // Simple password check
        if (!formData.password) {
          throw new Error("Password is required")
        }
      }

      console.log("Login successful - user type:", userData.user_type)

      // Store minimal session info
      localStorage.setItem('userType', userData.user_type)
      localStorage.setItem('userId', userData.id)

      // Immediate redirect based on user type
      if (userData.user_type === 'employer') {
        console.log("Redirecting employer to /post-job")
        window.location.href = "/employer"
      } else {
        console.log("Redirecting job seeker to /dashboard")
        window.location.href = "/dashboard"
      }

    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to your JobFinder account</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-accent font-medium transition-colors">
                  Register here
                </Link>
              </p>
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}