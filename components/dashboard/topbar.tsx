"use client"

import { Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PageType } from "./sidebar"

interface TopbarProps {
  currentPage: PageType
  sidebarCollapsed: boolean
}

const pageTitles: Record<PageType, string> = {
  dashboard: "Dashboard",
  appointments: "Appointments",
  "live-calls": "Live Calls",
  reminders: "Reminders",
  "past-appointments": "Past Appointments",
  settings: "Settings",
}

export function Topbar({ currentPage, sidebarCollapsed }: TopbarProps) {
  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 h-16 bg-[#12131a] border-b border-[#2a2b35] flex items-center justify-between px-6 transition-all duration-300 ${
          sidebarCollapsed ? "left-20" : "left-64"
        }`}
      >
        {/* Left: Page title */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{pageTitles[currentPage]}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-64 h-10 pl-10 pr-4 bg-[#1a1b23] border border-[#2a2b35] rounded-[6px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 transition-colors"
            />
          </div>

          {/* System status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1a1b23] border border-[#2a2b35] rounded-full">
            <span className="w-2 h-2 bg-teal rounded-full animate-pulse-dot" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-[6px] bg-[#1a1b23] border border-[#2a2b35] text-muted-foreground hover:text-foreground hover:bg-[#2a2b35]"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-coral text-white text-[10px] border-0 rounded-full">
              3
            </Badge>
          </Button>
        </div>
      </header>
    </>
  )
}
