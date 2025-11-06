"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Check } from "lucide-react"

const mockNotifications = [
  {
    id: 1,
    title: "Interview Scheduled",
    message: "Your interview for Senior Frontend Developer at TechCorp has been scheduled for tomorrow at 2 PM.",
    time: "2 hours ago",
    read: false,
    type: "interview",
  },
  {
    id: 2,
    title: "Application Status Update",
    message: "Your application for Product Manager at StartupXYZ has been reviewed.",
    time: "1 day ago",
    read: false,
    type: "status",
  },
  {
    id: 3,
    title: "New Message",
    message: "Sarah Johnson from TechCorp sent you a message.",
    time: "2 days ago",
    read: true,
    type: "message",
  },
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${!notification.read ? "text-slate-900" : "text-slate-600"}`}>
                        {notification.title}
                      </span>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                    <span className="text-xs text-slate-400 mt-1">{notification.time}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
