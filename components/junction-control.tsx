"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { jsonService } from "@/lib/json-service"
import { AlertCircle } from "lucide-react"

export default function JunctionControl() {
  const [selectedPole, setSelectedPole] = useState<string | null>(null)

  // All 8 poles
  const allPoles = ["P1A", "P1B", "P2A", "P2B", "P3A", "P3B", "P4A", "P4B"]
  const [selectedTimeZone, setSelectedTimeZone] = useState<number | null>(null)

  // Simplified pole names for display
  const poles = ["P1", "P2", "P3", "P4"]

  // Update the Time Zones state to include all 8 poles
  const [timeZones, setTimeZones] = useState([
    {
      id: 1,
      name: "Time Zone 1",
      startTime: "08:00",
      endTime: "10:00",
      sequence: "1,2,3,4,5,6,7",
      blinkEnabled: false,
      timePeriods: {
        P1A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P1B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P2A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P2B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P3A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P3B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P4A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P4B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
      },
    },
    {
      id: 2,
      name: "Time Zone 2",
      startTime: "16:00",
      endTime: "19:00",
      sequence: "8,9,10,11,12,13,14",
      blinkEnabled: false,
      timePeriods: {
        P1A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P1B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P2A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P2B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P3A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P3B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P4A: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
        P4B: { red: 60, yellow: 5, greenLeft: 30, greenStraight: 25, greenRight: 20, yellowBlink: 1 },
      },
    },
  ])

  // State for time zone validation errors
  const [timeZoneErrors, setTimeZoneErrors] = useState<string[]>([])

  // Update the priorities state to use all 8 poles instead of simplified pole names
  const [priorities, setPriorities] = useState({
    P1A: { greenLeft: 1, greenStraight: 2, greenRight: 3 },
    P1B: { greenLeft: 1, greenStraight: 2, greenRight: 3 },
    P2A: { greenLeft: 3, greenStraight: 1, greenRight: 2 },
    P2B: { greenLeft: 3, greenStraight: 1, greenRight: 2 },
    P3A: { greenLeft: 3, greenStraight: 2, greenRight: 1 },
    P3B: { greenLeft: 3, greenStraight: 2, greenRight: 1 },
    P4A: { greenLeft: 2, greenStraight: 3, greenRight: 1 },
    P4B: { greenLeft: 2, greenStraight: 3, greenRight: 1 },
  })

  // Update the signalStatus state to use simplified pole names
  const [signalStatus, setSignalStatus] = useState<Record<string, string>>({
    P1A: "red",
    P1B: "red",
    P2A: "red",
    P2B: "red",
    P3A: "red",
    P3B: "red",
    P4A: "red",
    P4B: "red",
  })

  const [controlMode, setControlMode] = useState<"auto" | "manual" | "semi">("auto")
  const [blinkMode, setBlinkMode] = useState(false)
  const [yellowBlinkRate, setYellowBlinkRate] = useState(1000) // Default 1 second
  const [isYellowBlinkMode, setIsYellowBlinkMode] = useState(false)
  const [isAllLightBlinkMode, setIsAllLightBlinkMode] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [simulateOnHardware, setSimulateOnHardware] = useState(false)
  const [userTimingDialogOpen, setUserTimingDialogOpen] = useState(false)
  const [userTimingValue, setUserTimingValue] = useState(3000)
  const [activeControlButton, setActiveControlButton] = useState<string | null>(null)

  // Add a new state for connection status
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")

  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTimeZone, setActiveTimeZone] = useState<number | null>(null)

  // Function to validate time zones
  const validateTimeZones = () => {
    const errors: string[] = []

    // Calculate total time for each pole in each time zone
    const totalTimes: Record<string, number> = {}
    const yellowTimes: Record<string, number> = {}
    const timeZoneTotals: number[] = []

    timeZones.forEach((zone, zoneIndex) => {
      // Track yellow times for this zone
      const zoneYellowTimes: number[] = []
      let zoneTotal = 0

      allPoles.forEach((pole) => {
        const periods = zone.timePeriods[pole]
        if (!periods) {
          errors.push(`Time Zone ${zone.id}: Missing data for pole ${pole}`)
          return
        }

        // Calculate total time (excluding yellowBlink)
        const total = periods.red + periods.yellow + periods.greenLeft + periods.greenStraight + periods.greenRight

        // Store the total time with a key that includes zone and pole
        const key = `${zoneIndex}-${pole}`
        totalTimes[key] = total

        // Use the first pole's total for the zone total
        if (pole === allPoles[0]) {
          zoneTotal = total
        }

        // Track yellow time for validation
        zoneYellowTimes.push(periods.yellow)
      })

      // Add this zone's total to the array
      timeZoneTotals.push(zoneTotal)

      // Check if all yellow times in this zone are the same
      const firstYellowTime = zoneYellowTimes[0]
      for (let i = 1; i < zoneYellowTimes.length; i++) {
        if (zoneYellowTimes[i] !== firstYellowTime) {
          errors.push(
            `Invalid Settings: Time Zone ${zone.id}, Yellow time must be the same for all poles (${zoneYellowTimes[i]}s vs ${firstYellowTime}s)`,
          )
          break
        }
      }
    })

    // Check if all poles in all time zones have the same total time
    const firstTotal = Object.values(totalTimes)[0]

    for (const [key, total] of Object.entries(totalTimes)) {
      if (total !== firstTotal) {
        const [zoneIndex, pole] = key.split("-")
        errors.push(
          `Invalid Settings: Time Zone ${Number(zoneIndex) + 1}, Pole ${pole} has different total time (${total}s vs ${firstTotal}s)`,
        )
      }
    }

    // Check if all time zones have the same total time
    const firstZoneTotal = timeZoneTotals[0]
    for (let i = 1; i < timeZoneTotals.length; i++) {
      if (timeZoneTotals[i] !== firstZoneTotal) {
        errors.push(
          `Invalid Settings: Time Zone ${i + 1} has different total time (${timeZoneTotals[i]}s) than Time Zone 1 (${firstZoneTotal}s). All time zones must have the same total time.`,
        )
      }
    }

    setTimeZoneErrors(errors)
    return errors.length === 0
  }

  // Add useEffect to subscribe to connection status changes
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = jsonService.onStatusChange((status) => {
      setConnectionStatus(status)
    })

    // Validate time zones on component mount
    validateTimeZones()

    return () => {
      unsubscribe()
    }
  }, [])

  // Validate time zones whenever they change
  useEffect(() => {
    validateTimeZones()
  }, [timeZones])

  // Handle blink modes
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isYellowBlinkMode || isAllLightBlinkMode || blinkMode) {
      intervalId = setInterval(() => {
        setBlinkState((prev) => !prev)
      }, yellowBlinkRate)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isYellowBlinkMode, isAllLightBlinkMode, blinkMode, yellowBlinkRate])

  // Apply blink states to poles
  useEffect(() => {
    if (!isYellowBlinkMode && !isAllLightBlinkMode && !blinkMode) {
      return // Don't do anything if no blink mode is active
    }

    const newStatus = { ...signalStatus }

    Object.keys(newStatus).forEach((pole) => {
      if (isYellowBlinkMode || blinkMode) {
        // Yellow blink mode
        newStatus[pole] = blinkState ? "yellow" : "off"
      } else if (isAllLightBlinkMode) {
        // All lights blink mode
        newStatus[pole] = blinkState ? "allOn" : "off"
      }
    })

    setSignalStatus(newStatus)

    // Only send commands to hardware if simulating on hardware
    // This is moved outside the component to prevent infinite loops
    if (simulateOnHardware) {
      const sendCommands = async () => {
        for (const pole of Object.keys(newStatus)) {
          if (isYellowBlinkMode || blinkMode) {
            // For both A and B poles
            await jsonService.sendCommand({
              command: "blink_control",
              target: `${pole}A`,
              action: blinkState ? "yel_on" : "yel_off",
              value: blinkState ? "1" : "0",
            })

            await jsonService.sendCommand({
              command: "blink_control",
              target: `${pole}B`,
              action: blinkState ? "yel_on" : "yel_off",
              value: blinkState ? "1" : "0",
            })
          } else if (isAllLightBlinkMode) {
            if (blinkState) {
              // Turn on all lights
              await jsonService.sendCommand({
                command: "blink_control",
                target: `${pole}A`,
                action: "all_on",
                value: "1",
              })

              await jsonService.sendCommand({
                command: "blink_control",
                target: `${pole}B`,
                action: "all_on",
                value: "1",
              })
            } else {
              // Turn off all lights
              await jsonService.sendCommand({
                command: "blink_control",
                target: `${pole}A`,
                action: "all_off",
                value: "0",
              })

              await jsonService.sendCommand({
                command: "blink_control",
                target: `${pole}B`,
                action: "all_off",
                value: "0",
              })
            }
          }
        }
      }

      // Use setTimeout to break the render cycle
      setTimeout(sendCommands, 0)
    }
  }, [blinkState, isYellowBlinkMode, isAllLightBlinkMode, blinkMode])

  // Add real-time clock and time zone monitoring
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)

      // Check which time zone is currently active
      const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      let foundActiveZone = false
      timeZones.forEach((zone) => {
        // Check if current time falls within this time zone
        if (zone.startTime <= zone.endTime) {
          // Simple case: start time is before end time (same day)
          if (currentTimeStr >= zone.startTime && currentTimeStr < zone.endTime) {
            setActiveTimeZone(zone.id)
            foundActiveZone = true
          }
        } else {
          // Complex case: start time is after end time (overnight)
          if (currentTimeStr >= zone.startTime || currentTimeStr < zone.endTime) {
            setActiveTimeZone(zone.id)
            foundActiveZone = true
          }
        }
      })

      if (!foundActiveZone) {
        setActiveTimeZone(null)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeZones])

  const handlePoleSelect = (poleName: string) => {
    setSelectedPole(poleName)

    // Create and send JSON for pole selection
    jsonService.sendCommand({
      command: "select_pole",
      target: "system",
      action: "select_pole",
      value: poleName,
    })

    toast({
      title: `${poleName} selected`,
      description: "You can now update the signals for this pole.",
    })
  }

  const handleTimeUpdate = async (timeZoneId: number) => {
    // Validate time zones before updating
    if (!validateTimeZones()) {
      toast({
        title: "Validation Error",
        description: "Cannot update time zone with invalid settings. Please fix the errors first.",
        variant: "destructive",
      })
      return
    }

    // Get the time zone data
    const timeZone = timeZones.find((tz) => tz.id === timeZoneId)
    if (!timeZone) return

    // Create and send JSON for time zone update
    jsonService.sendCommand({
      command: "update_time_zone",
      target: "system",
      action: "update_time_zone",
      value: timeZone,
    })

    toast({
      title: "Time values updated",
      description: `Updated timing values for ${selectedTimeZone ? `Time Zone ${timeZoneId}` : "all time zones"} in JSON data.`,
    })
  }

  const handleSequenceUpdate = async () => {
    // Create and send JSON for sequence update
    jsonService.sendCommand({
      command: "update_sequence",
      target: "system",
      action: "update_sequence",
      value: signalStatus,
    })

    toast({
      title: "Sequence updated",
      description: "The signal sequence has been updated and sent to the junction controller.",
    })
  }

  const handleControlModeChange = async (mode: "auto" | "manual" | "semi") => {
    setControlMode(mode)

    // Create and send JSON for control mode change
    jsonService.sendCommand({
      command: "set_control_mode",
      target: "system",
      action: "set_control_mode",
      value: mode,
    })

    // If manual mode is selected, automatically show pole selection
    if (mode === "manual") {
      // If no pole is selected, select the first one by default
      if (!selectedPole) {
        handlePoleSelect("P1")
      }
    }

    toast({
      title: `Control Mode Changed`,
      description: `Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Control mode.`,
    })
  }

  const handleAllLights = async (color: string) => {
    // Create and send JSON for all lights control
    jsonService.sendCommand({
      command: "all_lights_control",
      target: "system",
      action: "all_lights",
      value: color,
    })

    if (color === "off") {
      toast({
        title: `All Lights Turned Off`,
        description: `All lights have been turned off.`,
      })
    } else {
      toast({
        title: `All Lights Changed`,
        description: `All lights switched to ${color}.`,
      })
    }
  }

  const handleTimeZoneNameChange = (index: number, newName: string) => {
    const newZones = [...timeZones]
    newZones[index].name = newName
    setTimeZones(newZones)

    // Create and send JSON for time zone name change
    jsonService.sendCommand({
      command: "update_timezone_name",
      target: "system",
      action: "update_timezone_name",
      value: {
        timeZoneId: timeZones[index].id,
        name: newName,
      },
    })
  }

  const handleTimePeriodChange = (timeZoneId: number, pole: string, period: string, value: number) => {
    const newZones = [...timeZones]
    const zoneIndex = newZones.findIndex((zone) => zone.id === timeZoneId)
    if (zoneIndex === -1) return

    // Initialize the pole object if it doesn't exist yet
    if (!newZones[zoneIndex].timePeriods[pole]) {
      newZones[zoneIndex].timePeriods[pole] = {
        red: 60,
        yellow: 5,
        greenLeft: 30,
        greenStraight: 25,
        greenRight: 20,
        yellowBlink: 1,
      }
    }

    // Now we can safely update the period
    newZones[zoneIndex].timePeriods[pole][period] = value
    setTimeZones(newZones)

    // Create and send JSON for time period change
    jsonService.sendCommand({
      command: "update_time_period",
      target: "system",
      action: "update_time_period",
      value: {
        timeZoneId: timeZoneId,
        pole: pole,
        period: period,
        value: value,
      },
    })
  }

  const handlePriorityChange = (pole: string, signal: string, priority: number) => {
    setPriorities((prevPriorities) => ({
      ...prevPriorities,
      [pole]: {
        ...prevPriorities[pole],
        [signal]: priority,
      },
    }))

    // Create and send JSON for priority change
    jsonService.sendCommand({
      command: "update_priority",
      target: "system",
      action: "update_priority",
      value: {
        pole: pole,
        signal: signal,
        priority: priority,
      },
    })
  }

  const handleYellowBlinkMode = () => {
    const newMode = !isYellowBlinkMode
    setIsYellowBlinkMode(newMode)

    // Turn off other modes
    if (newMode) {
      setIsAllLightBlinkMode(false)
    }

    // Send command to JSON service
    jsonService.sendCommand({
      command: "yellow_blink_mode",
      target: "system",
      action: "yellow_blink_mode",
      value: newMode,
    })

    toast({
      title: `Yellow Blink Mode ${newMode ? "Activated" : "Deactivated"}`,
      description: `Yellow blink mode has been ${newMode ? "turned on" : "turned off"}.`,
    })
  }

  const handleAllLightBlinkMode = () => {
    const newMode = !isAllLightBlinkMode
    setIsAllLightBlinkMode(newMode)

    // Turn off other modes
    if (newMode) {
      setIsYellowBlinkMode(false)
    }

    // Send command to JSON service
    jsonService.sendCommand({
      command: "all_light_blink_mode",
      target: "system",
      action: "all_light_blink_mode",
      value: newMode,
    })

    toast({
      title: `All Light Blink Mode ${newMode ? "Activated" : "Deactivated"}`,
      description: `All light blink mode has been ${newMode ? "turned on" : "turned off"}.`,
    })
  }

  const handleBlinkModeToggle = () => {
    const newMode = !blinkMode
    setBlinkMode(newMode)

    // Send command to JSON service
    jsonService.sendCommand({
      command: "blink_mode",
      target: "system",
      action: "blink_mode",
      value: newMode,
    })

    toast({
      title: `Blink Mode ${newMode ? "Activated" : "Deactivated"}`,
      description: `Blink mode has been ${newMode ? "turned on" : "turned off"}.`,
    })
  }

  const handleSetUserConfiguredTimings = () => {
    setUserTimingDialogOpen(true)
  }

  const applyUserTimings = () => {
    setUserTimingDialogOpen(false)

    // Send command to JSON service
    jsonService.sendCommand({
      command: "set_user_timings",
      target: "system",
      action: "set_user_timings",
      value: { speed: userTimingValue },
    })

    toast({
      title: "User Timings Applied",
      description: `Custom timing of ${userTimingValue / 1000} seconds has been applied.`,
    })
  }

  // Add a function to handle blink mode toggle for time zones
  const handleTimeZoneBlinkToggle = (timeZoneId: number, enabled: boolean) => {
    const newZones = [...timeZones]
    const zoneIndex = newZones.findIndex((zone) => zone.id === timeZoneId)
    if (zoneIndex === -1) return

    newZones[zoneIndex].blinkEnabled = enabled
    setTimeZones(newZones)

    // Create and send JSON for time zone blink mode change
    jsonService.sendCommand({
      command: "update_timezone_blink",
      target: "system",
      action: "update_timezone_blink",
      value: {
        timeZoneId: timeZoneId,
        blinkEnabled: enabled,
      },
    })

    toast({
      title: `Blink Mode ${enabled ? "Enabled" : "Disabled"}`,
      description: `Blink mode has been ${enabled ? "enabled" : "disabled"} for ${newZones[zoneIndex].name}.`,
    })
  }

  // Replace the junction map display section with the new image
  // Update the pole markers to use the simplified naming
  const routes = [
    "Route 1",
    "Route 2",
    "Route 3",
    "Route 4",
    "Route 5",
    "Route 6",
    "Route 7",
    "Route 8",
    "Route 9",
    "Route 10",
    "Route 11",
    "Route 12",
    "Route 13",
    "Route 14",
  ]
  const [activeRoute, setActiveRoute] = useState<string | null>(null)
  const [signalSequences, setSignalSequences] = useState<any>({})

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4">
      <div className="flex-1 flex justify-center items-center border rounded-lg p-4 bg-gray-100">
        <div className="relative">
          {/* Display the new image */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Signal_Layout_31_3_2025-ObbmyjWhgnTvmwMWjGgs8NxIqcxxOJ.png"
            alt="Traffic Junction Map"
            className="max-w-full h-auto"
          />

          {/* Connection status indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-xs font-medium capitalize">{connectionStatus}</span>
          </div>

          {/* Time and Active Time Zone Display */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <div className="bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium">{currentTime.toLocaleTimeString()}</span>
            </div>
            {activeTimeZone !== null ? (
              <div className="bg-white px-3 py-1 rounded-full shadow-md">
                <span className="text-xs font-medium">
                  Active: {timeZones.find((zone) => zone.id === activeTimeZone)?.name || `Time Zone ${activeTimeZone}`}
                </span>
              </div>
            ) : (
              <div className="bg-white px-3 py-1 rounded-full shadow-md">
                <span className="text-xs font-medium text-gray-500">No active time zone</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-4">
        <Tabs defaultValue="poles">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="poles" className="text-xs sm:text-sm">
              Poles
            </TabsTrigger>
            <TabsTrigger value="timezones" className="text-xs sm:text-sm">
              Time Zones
            </TabsTrigger>
            <TabsTrigger value="priorities" className="text-xs sm:text-sm">
              Priorities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poles" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-2">Control Mode</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={controlMode === "manual" ? "default" : "outline"}
                  onClick={() => handleControlModeChange("manual")}
                  className="w-full text-xs sm:text-sm"
                  size="sm"
                >
                  Manual Control
                </Button>
                <Button
                  variant={controlMode === "auto" ? "default" : "outline"}
                  onClick={() => handleControlModeChange("auto")}
                  className="w-full text-xs sm:text-sm"
                  size="sm"
                >
                  Auto Control
                </Button>
                <Button
                  variant={controlMode === "semi" ? "default" : "outline"}
                  onClick={() => handleControlModeChange("semi")}
                  className="w-full text-xs sm:text-sm"
                  size="sm"
                >
                  Semi Control
                </Button>
              </div>

              {controlMode === "auto" && (
                <Card className="p-4 mt-4">
                  <h3 className="font-bold mb-2">Auto Control Information</h3>
                  <p className="text-sm mb-2">
                    System is running in automatic mode based on configured time zones and sequences.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-sm text-blue-700">
                      <strong>Current Time:</strong> {currentTime.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Current Time Zone:</strong>{" "}
                      {activeTimeZone !== null
                        ? timeZones.find((zone) => zone.id === activeTimeZone)?.name || `Time Zone ${activeTimeZone}`
                        : "Default"}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Active Sequence:</strong>{" "}
                      {activeTimeZone !== null
                        ? timeZones.find((zone) => zone.id === activeTimeZone)?.sequence || "Default Sequence"
                        : "Default Sequence"}
                    </p>
                  </div>
                </Card>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="blink-mode" className="cursor-pointer font-bold">
                    BLINK MODE
                  </Label>
                  <Switch id="blink-mode" checked={blinkMode} onCheckedChange={handleBlinkModeToggle} />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="simulate-hardware" className="cursor-pointer">
                    Simulate on Hardware
                  </Label>
                  <Switch id="simulate-hardware" checked={simulateOnHardware} onCheckedChange={setSimulateOnHardware} />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button onClick={handleSetUserConfiguredTimings} className="flex-1">
                  Set User Configured Timings
                </Button>
              </div>

              {blinkMode && (
                <div className="mb-4">
                  <Label htmlFor="yellow-blink-rate">Yellow Blink Rate (seconds)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="yellow-blink-rate"
                      type="number"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={yellowBlinkRate / 1000}
                      onChange={(e) => setYellowBlinkRate(Number(e.target.value) * 1000)}
                      className="w-32"
                    />
                    <Button
                      onClick={() => {
                        jsonService.sendCommand({
                          command: "set_blink_rate",
                          target: "system",
                          action: "set_blink_rate",
                          value: { rate: yellowBlinkRate },
                        })

                        toast({
                          title: "Blink Rate Updated",
                          description: `Yellow blink rate set to ${yellowBlinkRate / 1000} seconds.`,
                        })
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              {controlMode === "manual" && (
                <>
                  <h3 className="font-bold mb-2">Pole Selection</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {allPoles.map((pole) => (
                      <Button
                        key={pole}
                        variant={selectedPole === pole ? "default" : "outline"}
                        onClick={() => handlePoleSelect(pole)}
                        size="sm"
                        className="text-xs"
                      >
                        {pole}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {controlMode === "manual" && selectedPole && (
              <Card className="p-4 mt-4">
                <h3 className="font-bold mb-2">Direct Signal Control</h3>
                <p className="text-sm mb-2">
                  {selectedPole ? `Controlling signals for ${selectedPole}` : "Select a pole first"}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the green left signal
                      const action = signalStatus[selectedPole] === "greenLeft" ? "grnL_off" : "grnL_on"
                      const newStatus = signalStatus[selectedPole] === "greenLeft" ? "red" : "greenLeft"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "greenLeft" ? "1" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "greenLeft" ? "1" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `Green Left signal has been ${newStatus === "greenLeft" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "greenLeft" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "greenLeft" ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Green Left
                  </Button>

                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the green straight signal
                      const action = signalStatus[selectedPole] === "greenStraight" ? "grnS_off" : "grnS_on"
                      const newStatus = signalStatus[selectedPole] === "greenStraight" ? "red" : "greenStraight"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "greenStraight" ? "1" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "greenStraight" ? "1" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `Green Straight signal has been ${newStatus === "greenStraight" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "greenStraight" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "greenStraight" ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Green Straight
                  </Button>

                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the green right signal
                      const action = signalStatus[selectedPole] === "greenRight" ? "grnR_off" : "grnR_on"
                      const newStatus = signalStatus[selectedPole] === "greenRight" ? "red" : "greenRight"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "greenRight" ? "1" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "greenRight" ? "1" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `Green Right signal has been ${newStatus === "greenRight" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "greenRight" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "greenRight" ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Green Right
                  </Button>

                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the all green signal
                      const action = signalStatus[selectedPole] === "allGreen" ? "all_off" : "all_green"
                      const newStatus = signalStatus[selectedPole] === "allGreen" ? "red" : "allGreen"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "allGreen" ? "A" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "allGreen" ? "A" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `All Green signals have been ${newStatus === "allGreen" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "allGreen" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "allGreen" ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    All Green
                  </Button>

                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the red signal
                      const action = signalStatus[selectedPole] === "red" ? "red_off" : "red_on"
                      const newStatus = signalStatus[selectedPole] === "red" ? "off" : "red"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "red" ? "1" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "red" ? "1" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `Red signal has been ${newStatus === "red" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "red" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "red" ? "bg-red-500 hover:bg-red-600 text-white" : "border-red-500 text-red-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Red
                  </Button>

                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the yellow signal
                      const action = signalStatus[selectedPole] === "yellow" ? "yel_off" : "yel_on"
                      const newStatus = signalStatus[selectedPole] === "yellow" ? "red" : "yellow"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send to both A and B poles
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}A`,
                        action,
                        value: newStatus === "yellow" ? "1" : "0",
                      })

                      jsonService.sendCommand({
                        command: "signal_control",
                        target: `${selectedPole}B`,
                        action,
                        value: newStatus === "yellow" ? "1" : "0",
                      })

                      toast({
                        title: `Signal updated`,
                        description: `Yellow signal has been ${newStatus === "yellow" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "yellow" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "yellow" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "border-yellow-500 text-yellow-700"} h-auto py-1 text-xs sm:text-sm`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Yellow
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedPole) return

                      // Toggle the yellow blink mode for this pole
                      const newStatus = signalStatus[selectedPole] === "yellowBlink" ? "red" : "yellowBlink"

                      setSignalStatus((prev) => ({
                        ...prev,
                        [selectedPole]: newStatus,
                      }))

                      // Send command to the selected pole
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: selectedPole,
                        action: newStatus === "yellowBlink" ? "yellow_blink_on" : "yellow_blink_off",
                        value: newStatus === "yellowBlink" ? "1" : "0",
                      })

                      toast({
                        title: `Yellow Blink ${newStatus === "yellowBlink" ? "Activated" : "Deactivated"}`,
                        description: `Yellow blink mode has been ${newStatus === "yellowBlink" ? "turned ON" : "turned OFF"} for ${selectedPole}.`,
                      })
                    }}
                    variant={selectedPole && signalStatus[selectedPole] === "yellowBlink" ? "default" : "outline"}
                    className={`${selectedPole && signalStatus[selectedPole] === "yellowBlink" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "border-yellow-500 text-yellow-700"} h-auto py-1 text-xs sm:text-sm col-span-2`}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Yellow Blink
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    className="text-xs sm:text-sm"
                    onClick={() => {
                      // Create and send JSON for signal status update
                      jsonService.sendCommand({
                        command: "update_signal_status",
                        target: "system",
                        action: "update_signal_status",
                        value: {
                          pole: selectedPole,
                          status: signalStatus[selectedPole],
                        },
                      })

                      toast({
                        title: "Signal Status Updated",
                        description: `Signal status for ${selectedPole} has been updated in JSON data.`,
                      })
                    }}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Update JSON Data
                  </Button>
                  <Button
                    className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      try {
                        // Show loading toast
                        toast({
                          title: "Sending to Raspberry Pi...",
                          description: "Sending current configuration to Raspberry Pi",
                        })

                        // Send the update
                        const success = await jsonService.sendJsonToRaspberryPi()

                        if (success) {
                          toast({
                            title: "Update Successful",
                            description: "All settings have been sent to the Raspberry Pi",
                          })
                        } else {
                          toast({
                            title: "Update Failed",
                            description: "Failed to send settings to the Raspberry Pi",
                            variant: "destructive",
                          })
                        }
                      } catch (error) {
                        console.error("Error updating Raspberry Pi:", error)
                        toast({
                          title: "Update Error",
                          description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                          variant: "destructive",
                        })
                      }
                    }}
                    disabled={!selectedPole}
                    size="sm"
                  >
                    Update
                  </Button>
                  <Button
                    className="col-span-2 w-full text-xs sm:text-sm"
                    variant="outline"
                    disabled={!selectedPole}
                    size="sm"
                    onClick={() => {
                      // Create and send JSON for overlap route control
                      jsonService.sendCommand({
                        command: "overlap_route_control",
                        target: selectedPole || "system",
                        action: "overlap_route",
                        value: { pole: selectedPole },
                      })

                      toast({
                        title: "Overlap Route Control",
                        description: `Overlap route control data updated for ${selectedPole}`,
                      })
                    }}
                  >
                    Update Overlap Route
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-4 mt-4">
              <h4 className="font-medium mb-2">Control All Signals</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  onClick={() => {
                    if (activeControlButton === "green") {
                      // If already active, deactivate it
                      setActiveControlButton(null)
                      handleAllLights("off")
                    } else {
                      // Activate this button and deactivate others
                      setActiveControlButton("green")
                      handleAllLights("green")
                    }
                  }}
                  className={`w-full ${
                    activeControlButton === "green"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-green-700 border border-green-300"
                  } font-medium text-xs sm:text-sm shadow-md`}
                  size="sm"
                >
                  All Green
                </Button>
                <Button
                  onClick={() => {
                    if (activeControlButton === "yellow") {
                      // If already active, deactivate it
                      setActiveControlButton(null)
                      handleAllLights("off")
                    } else {
                      // Activate this button and deactivate others
                      setActiveControlButton("yellow")
                      handleAllLights("yellow")
                    }
                  }}
                  className={`w-full ${
                    activeControlButton === "yellow"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-gray-100 hover:bg-gray-200 text-yellow-700 border border-yellow-300"
                  } font-medium text-xs sm:text-sm shadow-md`}
                  size="sm"
                >
                  All Yellow
                </Button>
                <Button
                  onClick={() => {
                    if (activeControlButton === "red") {
                      // If already active, deactivate it
                      setActiveControlButton(null)
                      handleAllLights("off")
                    } else {
                      // Activate this button and deactivate others
                      setActiveControlButton("red")
                      handleAllLights("red")
                    }
                  }}
                  className={`w-full ${
                    activeControlButton === "red"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-red-700 border border-red-300"
                  } font-medium text-xs sm:text-sm shadow-md`}
                  size="sm"
                >
                  All Red
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={isYellowBlinkMode ? "default" : "outline"}
                  onClick={handleYellowBlinkMode}
                  className="w-full text-xs sm:text-sm bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 font-medium shadow-md"
                  size="sm"
                >
                  Yellow Blink Mode
                  <span className="text-xs ml-1">(All Poles)</span>
                </Button>
                <Button
                  variant={isAllLightBlinkMode ? "default" : "outline"}
                  onClick={handleAllLightBlinkMode}
                  className="w-full text-xs sm:text-sm bg-blue-100 hover:bg-blue-200 border border-blue-300 font-medium shadow-md"
                  size="sm"
                >
                  All Light Blink
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="timezones" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-2">Time Zone Configuration</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Set time zones and pole sequence for each time period.
              </p>

              {/* Display validation errors */}
              {timeZoneErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Validation Errors</span>
                  </div>
                  <ul className="text-sm text-red-600 list-disc pl-5">
                    {timeZoneErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {timeZones.map((zone, index) => (
                <div key={zone.id} className="border p-2 rounded mb-4">
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <Label htmlFor={`zoneName-${zone.id}`}>Zone Name:</Label>
                      <Input
                        id={`zoneName-${zone.id}`}
                        value={zone.name}
                        onChange={(e) => handleTimeZoneNameChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div>
                      <Label htmlFor={`startTime-${zone.id}`}>Start Time:</Label>
                      <Input
                        id={`startTime-${zone.id}`}
                        type="time"
                        value={zone.startTime}
                        onChange={(e) => {
                          const newZones = [...timeZones]
                          newZones[index].startTime = e.target.value
                          setTimeZones(newZones)

                          // Create and send JSON for start time change
                          jsonService.sendCommand({
                            command: "update_timezone_start",
                            target: "system",
                            action: "update_timezone_start",
                            value: {
                              timeZoneId: zone.id,
                              startTime: e.target.value,
                            },
                          })
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`endTime-${zone.id}`}>End Time:</Label>
                      <Input
                        id={`endTime-${zone.id}`}
                        type="time"
                        value={zone.endTime}
                        onChange={(e) => {
                          const newZones = [...timeZones]
                          newZones[index].endTime = e.target.value
                          setTimeZones(newZones)

                          // Create and send JSON for end time change
                          jsonService.sendCommand({
                            command: "update_timezone_end",
                            target: "system",
                            action: "update_timezone_end",
                            value: {
                              timeZoneId: zone.id,
                              endTime: e.target.value,
                            },
                          })
                        }}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <Label htmlFor={`sequence-${zone.id}`}>Route Sequence:</Label>
                    <Input
                      id={`sequence-${zone.id}`}
                      value={zone.sequence}
                      onChange={(e) => {
                        const newZones = [...timeZones]
                        newZones[index].sequence = e.target.value
                        setTimeZones(newZones)

                        // Create and send JSON for sequence change
                        jsonService.sendCommand({
                          command: "update_timezone_sequence",
                          target: "system",
                          action: "update_timezone_sequence",
                          value: {
                            timeZoneId: zone.id,
                            sequence: e.target.value,
                          },
                        })
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter route numbers 1-14 separated by commas</p>
                  </div>

                  {/* Add blink mode toggle */}
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <Switch
                      id={`blink-mode-${zone.id}`}
                      checked={zone.blinkEnabled}
                      onCheckedChange={(checked) => handleTimeZoneBlinkToggle(zone.id, checked)}
                    />
                    <Label htmlFor={`blink-mode-${zone.id}`} className="font-medium text-yellow-800">
                      Enable Blink Mode for this Time Zone
                    </Label>
                    <div className="text-xs text-yellow-700 ml-2">
                      {zone.blinkEnabled ? "(Will override route sequence)" : "(Normal route sequence active)"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Time Periods</h4>
                    <Select value={selectedPole || allPoles[0]} onValueChange={(value) => setSelectedPole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pole" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPoles.map((pole) => (
                          <SelectItem key={pole} value={pole}>
                            {pole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedPole && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`red-${zone.id}-${selectedPole}`} className="w-24">
                            Red Time:
                          </Label>
                          <Input
                            id={`red-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.red || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(zone.id, selectedPole, "red", Number.parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`yellow-${zone.id}-${selectedPole}`} className="w-24">
                            Yellow Time:
                          </Label>
                          <Input
                            id={`yellow-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.yellow || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(zone.id, selectedPole, "yellow", Number.parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`greenLeft-${zone.id}-${selectedPole}`} className="w-24">
                            Green Left:
                          </Label>
                          <Input
                            id={`greenLeft-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.greenLeft || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(
                                zone.id,
                                selectedPole,
                                "greenLeft",
                                Number.parseInt(e.target.value),
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`greenStraight-${zone.id}-${selectedPole}`} className="w-24">
                            Green Straight:
                          </Label>
                          <Input
                            id={`greenStraight-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.greenStraight || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(
                                zone.id,
                                selectedPole,
                                "greenStraight",
                                Number.parseInt(e.target.value),
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`greenRight-${zone.id}-${selectedPole}`} className="w-24">
                            Green Right:
                          </Label>
                          <Input
                            id={`greenRight-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.greenRight || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(
                                zone.id,
                                selectedPole,
                                "greenRight",
                                Number.parseInt(e.target.value),
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`yellowBlink-${zone.id}-${selectedPole}`} className="w-24">
                            Yellow Blink:
                          </Label>
                          <Input
                            id={`yellowBlink-${zone.id}-${selectedPole}`}
                            type="number"
                            value={zone.timePeriods[selectedPole]?.yellowBlink || 0}
                            onChange={(e) =>
                              handleTimePeriodChange(
                                zone.id,
                                selectedPole,
                                "yellowBlink",
                                Number.parseInt(e.target.value),
                              )
                            }
                            className="flex-1"
                          />
                          <span className="text-sm">sec</span>
                        </div>

                        {/* Display total time for this pole */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                          <Label className="w-24 font-bold">Total Time:</Label>
                          <div className="flex-1 font-bold">
                            {zone.timePeriods[selectedPole]
                              ? zone.timePeriods[selectedPole].red +
                                zone.timePeriods[selectedPole].yellow +
                                zone.timePeriods[selectedPole].greenLeft +
                                zone.timePeriods[selectedPole].greenStraight +
                                zone.timePeriods[selectedPole].greenRight
                              : 0}
                            <span className="text-sm ml-1">sec</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full mt-2"
                      onClick={() => handleTimeUpdate(zone.id)}
                      disabled={timeZoneErrors.length > 0}
                    >
                      Update Time Periods JSON Data
                    </Button>
                  </div>
                </div>
              ))}

              {timeZones.length < 8 && (
                <Button
                  variant="outline"
                  className="mb-2"
                  onClick={() => {
                    const newId = timeZones.length + 1
                    if (newId > 8) {
                      toast({
                        title: "Maximum Time Zones Reached",
                        description: "You can only create up to 8 time zones.",
                        variant: "destructive",
                      })
                      return
                    }

                    // Create a new time zone with the same timing values as the first one
                    // to ensure consistency
                    const firstZoneTimePeriods = timeZones[0].timePeriods

                    const newTimeZone = {
                      id: newId,
                      name: `Time Zone ${newId}`,
                      startTime: "00:00",
                      endTime: "00:00",
                      sequence: "1,2,3,4,5,6,7,8,9,10,11,12,13,14",
                      blinkEnabled: false,
                      timePeriods: { ...firstZoneTimePeriods },
                    }

                    setTimeZones([...timeZones, newTimeZone])

                    // Create and send JSON for adding time zone
                    jsonService.sendCommand({
                      command: "add_timezone",
                      target: "system",
                      action: "add_timezone",
                      value: newTimeZone,
                    })
                  }}
                >
                  Add Time Zone
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Validate time zones before updating
                    if (!validateTimeZones()) {
                      toast({
                        title: "Validation Error",
                        description: "Cannot update time zones with invalid settings. Please fix the errors first.",
                        variant: "destructive",
                      })
                      return
                    }

                    // Create and send JSON for updating all time zones
                    jsonService.sendCommand({
                      command: "update_all_time_zones",
                      target: "system",
                      action: "update_all_time_zones",
                      value: timeZones,
                    })

                    toast({
                      title: "Time Zones Updated",
                      description: "Time zone configurations have been updated in JSON data.",
                    })
                  }}
                  disabled={timeZoneErrors.length > 0}
                >
                  Update Time Zones JSON Data
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    try {
                      // Validate time zones before updating
                      if (!validateTimeZones()) {
                        toast({
                          title: "Validation Error",
                          description: "Cannot update time zones with invalid settings. Please fix the errors first.",
                          variant: "destructive",
                        })
                        return
                      }

                      // Show loading toast
                      toast({
                        title: "Sending to Raspberry Pi...",
                        description: "Sending time zone configuration to Raspberry Pi",
                      })

                      // Send the update
                      const success = await jsonService.sendJsonToRaspberryPi()

                      if (success) {
                        toast({
                          title: "Update Successful",
                          description: "Time zone settings have been sent to the Raspberry Pi",
                        })
                      } else {
                        toast({
                          title: "Update Failed",
                          description: "Failed to send time zone settings to the Raspberry Pi",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      console.error("Error updating Raspberry Pi:", error)
                      toast({
                        title: "Update Error",
                        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Update
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="priorities" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-2">Green Signal Priorities</h3>
              <p className="text-sm text-muted-foreground mb-2">Set priorities for green signals for each pole.</p>

              <div className="space-y-4">
                {allPoles.map((pole) => (
                  <div key={pole} className="border p-3 rounded">
                    <h4 className="font-medium mb-2">{pole}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="w-32">GREEN LEFT:</Label>
                        <Select
                          value={priorities[pole as keyof typeof priorities]?.greenLeft.toString() || "1"}
                          onValueChange={(value) => handlePriorityChange(pole, "greenLeft", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="w-32">GREEN STRAIGHT:</Label>
                        <Select
                          value={priorities[pole as keyof typeof priorities]?.greenStraight.toString() || "1"}
                          onValueChange={(value) => handlePriorityChange(pole, "greenStraight", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="w-32">GREEN RIGHT:</Label>
                        <Select
                          value={priorities[pole as keyof typeof priorities]?.greenRight.toString() || "1"}
                          onValueChange={(value) => handlePriorityChange(pole, "greenRight", Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Create and send JSON for updating all priorities
                    jsonService.sendCommand({
                      command: "update_all_priorities",
                      target: "system",
                      action: "update_all_priorities",
                      value: priorities,
                    })

                    toast({
                      title: "Priorities Updated",
                      description: "Green signal priorities have been updated in JSON data.",
                    })
                  }}
                >
                  Update Priorities JSON Data
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={async () => {
                    try {
                      // Show loading toast
                      toast({
                        title: "Sending to Raspberry Pi...",
                        description: "Sending priority configuration to Raspberry Pi",
                      })

                      // Send the update
                      const success = await jsonService.sendJsonToRaspberryPi()

                      if (success) {
                        toast({
                          title: "Update Successful",
                          description: "Priority settings have been sent to the Raspberry Pi",
                        })
                      } else {
                        toast({
                          title: "Update Failed",
                          description: "Failed to send priority settings to the Raspberry Pi",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      console.error("Error updating Raspberry Pi:", error)
                      toast({
                        title: "Update Error",
                        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Update
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Timing Dialog */}
      <Dialog open={userTimingDialogOpen} onOpenChange={setUserTimingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set User Configured Timings</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="user-timing">Timing Value (milliseconds)</Label>
            <Input
              id="user-timing"
              type="number"
              min="100"
              max="10000"
              step="100"
              value={userTimingValue}
              onChange={(e) => setUserTimingValue(Number(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Enter the timing value in milliseconds (e.g., 3000 for 3 seconds)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserTimingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyUserTimings}>Apply Timing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
