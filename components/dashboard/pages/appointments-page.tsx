"use client"

import { useState } from "react"
import { Calendar, Search, Download, X, RefreshCw, Check, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockAppointments, type Appointment } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// Default medical specialties - these would typically come from settings
const DEFAULT_SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Dentistry",
  "Ophthalmology",
  "Physiotherapy",
  "Neurology",
  "ENT",
]

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const config = {
    confirmed: { label: "Confirmed", className: "bg-teal/20 text-teal border-teal/30" },
    pending: { label: "Pending", className: "bg-amber/20 text-amber border-amber/30" },
    cancelled: { label: "Cancelled", className: "bg-coral/20 text-coral border-coral/30" },
  }

  return (
    <Badge variant="outline" className={cn("rounded-[6px] font-normal border", config[status].className)}>
      {config[status].label}
    </Badge>
  )
}

export function AppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeError, setTimeError] = useState<string | null>(null)
  const { toast } = useToast()

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    phone: "",
    condition: "",
    doctor: "",
    date: "",
    time: "",
  })

  const resetForm = () => {
    setNewAppointment({
      patientName: "",
      phone: "",
      condition: "",
      doctor: "",
      date: "",
      time: "",
    })
    setTimeError(null)
  }

  const checkDuplicateTimeSlot = (date: string, time: string) => {
    return appointments.some(
      apt => apt.date === date && apt.time === time && apt.status !== "cancelled"
    )
  }

  const handleAddAppointment = () => {
    // Validate required fields
    if (!newAppointment.patientName || !newAppointment.phone || !newAppointment.condition || 
        !newAppointment.doctor || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Format the date for display
    const dateObj = new Date(newAppointment.date)
    const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" })

    // Check for duplicate time slot
    if (checkDuplicateTimeSlot(formattedDate, newAppointment.time)) {
      setTimeError("An appointment already exists at this date and time")
      return
    }

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: newAppointment.patientName,
      phone: newAppointment.phone,
      condition: newAppointment.condition,
      doctor: newAppointment.doctor,
      date: formattedDate,
      time: newAppointment.time,
      status: "pending",
      reminded: false,
    }

    setAppointments(prev => [...prev, appointment])
    setIsDialogOpen(false)
    resetForm()
    toast({
      title: "Appointment added",
      description: `Appointment for ${appointment.patientName} has been scheduled`,
    })
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    const matchesCondition = conditionFilter === "all" || apt.condition.toLowerCase().includes(conditionFilter.toLowerCase())
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery)
    return matchesStatus && matchesCondition && matchesSearch
  })

  const handleSendReminder = (apt: Appointment) => {
    setAppointments(prev =>
      prev.map(a => a.id === apt.id ? { ...a, reminded: true } : a)
    )
    toast({
      title: "Reminder sent",
      description: `Reminder sent to ${apt.patientName}`,
    })
  }

  const handleRemoveAppointment = (apt: Appointment) => {
    setAppointments(prev => prev.filter(a => a.id !== apt.id))
    toast({
      title: "Appointment removed",
      description: `Appointment for ${apt.patientName} has been removed`,
    })
  }

  const handleRefreshAppointment = (apt: Appointment) => {
    // Simulate refreshing - only reset reminded status, preserve the current status
    setAppointments(prev =>
      prev.map(a => a.id === apt.id ? { ...a, reminded: false } : a)
    )
    toast({
      title: "Appointment refreshed",
      description: `Reminder status for ${apt.patientName} has been reset`,
    })
  }

  const handleRefreshAll = () => {
    setAppointments(mockAppointments)
    toast({
      title: "Appointments refreshed",
      description: "All appointments have been restored to their original state",
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-[#1a1b23] rounded-[10px] p-4 border border-[#2a2b35]">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#12131a] border border-[#2a2b35] rounded-[6px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-coral/50 transition-colors"
            />
          </div>

          {/* Date Range - placeholder for date picker */}
          <Button variant="outline" className="h-10 bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] hover:text-foreground rounded-[6px]">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10 bg-[#12131a] border-[#2a2b35] text-muted-foreground rounded-[6px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Medical Specialty Filter */}
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-[180px] h-10 bg-[#12131a] border-[#2a2b35] text-muted-foreground rounded-[6px]">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
              <SelectItem value="all">All Specialties</SelectItem>
              {DEFAULT_SPECIALTIES.map((specialty) => (
                <SelectItem key={specialty} value={specialty.toLowerCase()}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh All */}
          <Button 
            variant="outline" 
            onClick={handleRefreshAll}
            className="h-10 bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] hover:text-foreground rounded-[6px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>

          {/* Export */}
          <Button variant="outline" className="h-10 bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] hover:text-foreground rounded-[6px]">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          {/* New Appointment */}
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="h-10 bg-coral hover:bg-coral/90 text-white rounded-[6px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Appointment</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details to schedule a new appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-foreground">Patient Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient name"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                  className="bg-[#12131a] border-[#2a2b35] text-foreground placeholder:text-muted-foreground focus:border-coral/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+91 98XXXXXXXX"
                  value={newAppointment.phone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-[#12131a] border-[#2a2b35] text-foreground placeholder:text-muted-foreground focus:border-coral/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-foreground">Medical Specialty *</Label>
                <Select 
                  value={newAppointment.condition} 
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="bg-[#12131a] border-[#2a2b35] text-foreground">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground">
                    {DEFAULT_SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-foreground">Doctor Name *</Label>
                <Input
                  id="doctor"
                  placeholder="Dr. Name"
                  value={newAppointment.doctor}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor: e.target.value }))}
                  className="bg-[#12131a] border-[#2a2b35] text-foreground placeholder:text-muted-foreground focus:border-coral/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => {
                    setNewAppointment(prev => ({ ...prev, date: e.target.value }))
                    setTimeError(null)
                  }}
                  className="bg-[#12131a] border-[#2a2b35] text-foreground focus:border-coral/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-foreground">Time *</Label>
                <Select 
                  value={newAppointment.time} 
                  onValueChange={(value) => {
                    setNewAppointment(prev => ({ ...prev, time: value }))
                    setTimeError(null)
                  }}
                >
                  <SelectTrigger className={cn(
                    "bg-[#12131a] border-[#2a2b35] text-foreground",
                    timeError && "border-coral"
                  )}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b23] border-[#2a2b35] text-foreground max-h-[200px]">
                    {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
                      "12:00 PM", "12:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", 
                      "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {timeError && (
                  <p className="text-xs text-coral mt-1">{timeError}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
              className="bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAppointment}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              Add Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-[#1a1b23] rounded-[10px] border border-[#2a2b35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2b35] bg-[#12131a]">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Medical Specialty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Doctor Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reminder Sent</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt, index) => (
                <tr
                  key={apt.id}
                  className={cn(
                    "transition-colors hover:bg-[#12131a]",
                    index % 2 === 0 ? "bg-[#1a1b23]" : "bg-[#16171f]"
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{apt.patientName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{apt.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{apt.condition}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{apt.doctor}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{apt.date}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{apt.time}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-4 py-3">
                    {apt.reminded ? (
                      <div className="flex items-center gap-1 text-teal">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Yes</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(apt)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="text-sm">No</span>
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRefreshAppointment(apt)}
                        title="Reset reminder status"
                        aria-label={`Refresh appointment for ${apt.patientName}`}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-[#2a2b35]"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveAppointment(apt)}
                        title="Remove appointment"
                        aria-label={`Remove appointment for ${apt.patientName}`}
                        className="h-8 w-8 text-muted-foreground hover:text-coral hover:bg-coral/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#2a2b35] flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] rounded-[6px]">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-[#12131a] border-[#2a2b35] text-muted-foreground hover:bg-[#2a2b35] rounded-[6px]">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
