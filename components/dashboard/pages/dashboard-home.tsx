"use client"

import { CheckCircle2, Clock, Calendar, XCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockDashboardStats, mockTodaySchedule, mockLiveCalls, type CallOutcome } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string
  value: number
  icon: typeof CheckCircle2
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const variantStyles = {
    default: "bg-coral/20 text-coral border-coral/30",
    success: "bg-teal/20 text-teal border-teal/30",
    warning: "bg-amber/20 text-amber border-amber/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <div className="bg-[#1a1b23] rounded-[10px] p-6 border border-[#2a2b35]">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-[10px] flex items-center justify-center border", variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )
}

function TodaySchedule() {
  return (
    <div className="bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2b35]">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h3>
          <Badge variant="outline" className="bg-coral/20 text-coral border-coral/30 rounded-[6px] text-xs">
            {mockTodaySchedule.length} appointments
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {mockTodaySchedule.map((item, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-[10px] border transition-colors",
                item.status === "completed"
                  ? "bg-teal/5 border-teal/20"
                  : "bg-[#12131a] border-[#2a2b35]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{item.time}</span>
                  {item.status === "completed" ? (
                    <Badge variant="outline" className="bg-teal/20 text-teal border-teal/30 rounded-[6px] text-xs">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber/20 text-amber border-amber/30 rounded-[6px] text-xs">
                      Upcoming
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">{item.patientName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.condition}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function LiveCallFeed() {
  const outcomeConfig: Record<CallOutcome, { label: string; className: string }> = {
    booked: { label: "Booked", className: "bg-teal/20 text-teal border-teal/30" },
    rescheduled: { label: "Rescheduled", className: "bg-amber/20 text-amber border-amber/30" },
    cancelled: { label: "Cancelled", className: "bg-coral/20 text-coral border-coral/30" },
  }

  return (
    <div className="bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2b35]">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Live Call Feed</h3>
          <Badge variant="outline" className="bg-teal/20 text-teal border-teal/30 rounded-[6px] text-xs">
            <span className="w-1.5 h-1.5 bg-teal rounded-full mr-1.5 animate-pulse-dot" />
            Live
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {mockLiveCalls.length > 0 ? (
          <div className="space-y-3">
            {mockLiveCalls.map((call) => (
              <div
                key={call.id}
                className="p-3 bg-[#12131a] rounded-[10px] border border-[#2a2b35]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{call.callerPhone}</span>
                  <span className="text-xs text-muted-foreground">{call.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{call.description}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-normal rounded-[6px]",
                    outcomeConfig[call.outcome].className
                  )}
                >
                  {outcomeConfig[call.outcome].label}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Phone className="w-12 h-12 text-muted mb-3" />
            <p className="text-muted-foreground">No active calls right now</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Appointments Attended Today"
          value={mockDashboardStats.appointmentsAttended}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Appointments Remaining Today"
          value={mockDashboardStats.appointmentsRemaining}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Total Appointments Today"
          value={mockDashboardStats.totalAppointments}
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Cancelled / Rescheduled Today"
          value={mockDashboardStats.cancelledToday}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Today's Schedule + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[400px]">
          <TodaySchedule />
        </div>
        <div className="min-h-[400px]">
          <LiveCallFeed />
        </div>
      </div>
    </div>
  )
}
