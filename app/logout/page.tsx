"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate logout process
    const logout = async () => {
      // Clear any stored user data, tokens, etc.
      localStorage.removeItem("user")
      sessionStorage.clear()

      // Redirect to home page after a brief delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Logging you out...</h1>
          <p className="text-slate-600">Thank you for using JobFinder. You'll be redirected shortly.</p>
        </CardContent>
      </Card>
    </div>
  )
}
