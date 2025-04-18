"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { jsonService } from "@/lib/json-service"
import { InfoIcon } from "lucide-react"

// Initial signal sequence data structure based on the chart
const initialSignalSequences = {
  1: {
    P1A: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "1", yellow: "", greenLeft: "1", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  2: {
    P1A: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "2", yellow: "", greenLeft: "2", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  3: {
    P1A: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "1" },
    P2B: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "1" },
    P3A: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "3", yellow: "", greenLeft: "3", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  4: {
    P1A: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "4", yellow: "", greenLeft: "4", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  5: {
    P1A: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "5", yellow: "", greenLeft: "5", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  6: {
    P1A: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "6", yellow: "", greenLeft: "6", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  7: {
    P1A: { red: "7", yellow: "", greenLeft: "7", greenStraight: "1", greenRight: "0", greenAll: "" },
    P1B: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P2A: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P2B: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P3A: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P3B: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P4A: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
    P4B: { red: "7", yellow: "", greenLeft: "7", greenStraight: "0", greenRight: "1", greenAll: "" },
  },
  8: {
    P1A: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P1B: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P2A: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P2B: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P3A: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P3B: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P4A: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
    P4B: { red: "8", yellow: "", greenLeft: "8", greenStraight: "", greenRight: "", greenAll: "A" },
  },
  9: {
    P1A: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "9", yellow: "", greenLeft: "9", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  10: {
    P1A: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "10", yellow: "", greenLeft: "10", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  11: {
    P1A: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P1B: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P2A: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P2B: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P3A: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P3B: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P4A: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
    P4B: { red: "11", yellow: "", greenLeft: "11", greenStraight: "", greenRight: "", greenAll: "A" },
  },
  12: {
    P1A: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "12", yellow: "", greenLeft: "12", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  13: {
    P1A: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "13", yellow: "", greenLeft: "13", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
  14: {
    P1A: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P1B: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2A: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P2B: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3A: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P3B: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4A: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
    P4B: { red: "14", yellow: "", greenLeft: "14", greenStraight: "1", greenRight: "1", greenAll: "" },
  },
}

export default function SequenceControl() {
  const [signalSequences, setSignalSequences] = useState(initialSignalSequences)
  const [activeRoute, setActiveRoute] = useState<number | null>(null)
  const [poleStates, setPoleStates] = useState({
    P1A: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P1B: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P2A: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P2B: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P3A: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P3B: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P4A: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
    P4B: { red: false, yellow: false, greenLeft: false, greenStraight: false, greenRight: false, greenAll: false },
  })

  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationSequence, setSimulationSequence] = useState<number[]>([])
  const [simulationSpeed, setSimulationSpeed] = useState(3000) // Default 3 seconds
  const [simulateOnHardware, setSimulateOnHardware] = useState(false)
  const [reflectMode, setReflectMode] = useState(false)
  const [controlMode, setControlMode] = useState<"auto" | "manual" | "semi">("auto")
  const [blinkMode, setBlinkMode] = useState(false)
  const [yellowBlinkRate, setYellowBlinkRate] = useState(1000) // Default 1 second
  const [isYellowBlinkMode, setIsYellowBlinkMode] = useState(false)
  const [isAllLightBlinkMode, setIsAllLightBlinkMode] = useState(false)
  const [blinkState, setBlinkState] = useState(false)
  const [userTimingDialogOpen, setUserTimingDialogOpen] = useState(false)
  const [userTimingValue, setUserTimingValue] = useState(3000)
  const [overrideTimeoutDuration, setOverrideTimeoutDuration] = useState(10000) // 10 seconds default

  // For editing sequence values
  const [editingCell, setEditingCell] = useState<{
    route: number
    pole: string
    signal: string
  } | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // For confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    route: number
    pole: string
    signal: string
    value: string
  } | null>(null)

  // For server status
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected")

  // For validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [timeZones, setTimeZones] = useState([
    {
      id: 1,
      name: "TIME ZONE 1",
      startTime: "22:30",
      endTime: "05:59",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
    {
      id: 2,
      name: "TIME ZONE 2",
      startTime: "06:00",
      endTime: "09:29",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
    {
      id: 3,
      name: "TIME ZONE 3",
      startTime: "09:30",
      endTime: "16:29",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
    {
      id: 4,
      name: "TIME ZONE 4",
      startTime: "16:30",
      endTime: "19:30",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
    {
      id: 5,
      name: "TIME ZONE 5",
      startTime: "19:31",
      endTime: "21:29",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
    {
      id: 6,
      name: "TIME ZONE 6",
      startTime: "22:30",
      endTime: "05:59",
      sequence: "1,2,3,6,7,8,4,5,9,10,14,12,11,13",
      timePeriods: {
        P1A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P1B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P2B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P3B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4A: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
        P4B: { red: 10, yellow: 5, greenLeft: 15, greenStraight: 15, greenRight: 15, yellowBlink: 1 },
      },
    },
  ])

  const [manualOverrideActive, setManualOverrideActive] = useState(false)
  const [manualOverrideTimer, setManualOverrideTimer] = useState<NodeJS.Timeout | null>(null)

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = jsonService.onStatusChange((status) => {
      setConnectionStatus(status as "connected" | "disconnected" | "error")
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Update pole states when a route is selected
  useEffect(() => {
    if (activeRoute) {
      const sequence = signalSequences[activeRoute as keyof typeof signalSequences]

      // Reset all states
      const newStates = {
        P1A: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P1B: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P2A: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P2B: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P3A: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P3B: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P4A: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
        P4B: {
          red: false,
          yellow: false,
          greenLeft: false,
          greenStraight: false,
          greenRight: false,
          greenAll: false,
        },
      }

      // Set states based on the sequence
      Object.keys(sequence).forEach((pole) => {
        const poleKey = pole as keyof typeof sequence
        const signals = sequence[poleKey]

        Object.keys(signals).forEach((signal) => {
          const signalKey = signal as keyof typeof signals
          const value = signals[signalKey]

          if (value === "1" || value === "D") {
            newStates[poleKey][signalKey] = true
          } else if (value === "A") {
            newStates[poleKey].greenAll = true
            // When All Green is on, turn on all green signals
            newStates[poleKey].greenLeft = true
            newStates[poleKey].greenStraight = true
            newStates[poleKey].greenRight = true
          } else if (value === "0" || value === "C") {
            // Explicitly set to false
            newStates[poleKey][signalKey] = false
          }
        })
      })

      setPoleStates(newStates)

      // Send the route selection to the JSON service
      jsonService.sendCommand({
        command: "select_route",
        target: "system",
        action: "select_route",
        value: { route: activeRoute },
      })

      toast({
        title: `Route ${activeRoute} Activated`,
        description: `Signal sequence for route ${activeRoute} has been applied.`,
      })
    }
  }, [activeRoute, signalSequences])

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

    const newStates = { ...poleStates }

    Object.keys(newStates).forEach((pole) => {
      const poleKey = pole as keyof typeof newStates

      if (isYellowBlinkMode || blinkMode) {
        // Yellow blink mode
        newStates[poleKey].yellow = blinkState
        newStates[poleKey].red = false
        newStates[poleKey].greenLeft = false
        newStates[poleKey].greenStraight = false
        newStates[poleKey].greenRight = false
        newStates[poleKey].greenAll = false
      } else if (isAllLightBlinkMode) {
        // All lights blink mode
        newStates[poleKey].red = blinkState
        newStates[poleKey].yellow = blinkState
        newStates[poleKey].greenLeft = blinkState
        newStates[poleKey].greenStraight = blinkState
        newStates[poleKey].greenRight = blinkState
      }
    })

    setPoleStates(newStates)

    // Only send commands to hardware if simulating on hardware
    // This is moved outside the component to prevent infinite loops
    if (simulateOnHardware) {
      const sendCommands = async () => {
        for (const pole of Object.keys(newStates)) {
          if (isYellowBlinkMode || blinkMode) {
            await jsonService.sendCommand({
              command: "blink_control",
              target: pole,
              action: blinkState ? "yel_on" : "yel_off",
              value: blinkState ? "1" : "0",
            })
          } else if (isAllLightBlinkMode) {
            if (blinkState) {
              await jsonService.sendCommand({
                command: "blink_control",
                target: pole,
                action: "all_on",
                value: "1",
              })
            } else {
              await jsonService.sendCommand({
                command: "blink_control",
                target: pole,
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
  }, [blinkState, isYellowBlinkMode, isAllLightBlinkMode, blinkMode, simulateOnHardware, poleStates])

  // Handle simulation steps with yellow light behavior
  useEffect(() => {
    if (controlMode === "semi" && manualOverrideActive) {
      return // Don't run auto sequence while manual override is active
    }

    if (!isSimulating || simulationSequence.length === 0 || isYellowBlinkMode || isAllLightBlinkMode || blinkMode) {
      return // Don't run simulation if not simulating or if any blink mode is active
    }

    const timer = setTimeout(() => {
      const nextRoute = simulationSequence[currentStep]
      const prevRoute =
        currentStep === 0 ? simulationSequence[simulationSequence.length - 1] : simulationSequence[currentStep - 1]

      // Check if we need to show yellow lights based on the transition
      if (prevRoute !== nextRoute) {
        // Create a copy of the current pole states
        const yellowStates = { ...poleStates }

        // Determine which poles are transitioning from green to red or between different green signals
        Object.keys(yellowStates).forEach((pole) => {
          const poleKey = pole as keyof typeof yellowStates
          const prevSequence = signalSequences[prevRoute][poleKey]
          const nextSequence = signalSequences[nextRoute][poleKey]

          // Case 1: Transitioning from any green to red
          const wasGreen =
            prevSequence.greenLeft === "1" ||
            prevSequence.greenStraight === "1" ||
            prevSequence.greenRight === "1" ||
            prevSequence.greenAll === "A"

          const willBeRed = nextSequence.red === "1"

          // Case 2: Transitioning from second green to third green
          const isTransitioningToThirdGreen =
            (prevSequence.greenStraight === "1" && nextSequence.greenRight === "1") ||
            (prevSequence.greenLeft === "1" && prevSequence.greenStraight !== "1" && nextSequence.greenRight === "1")

          if ((wasGreen && willBeRed) || isTransitioningToThirdGreen) {
            yellowStates[poleKey].yellow = true
            yellowStates[poleKey].greenLeft = false
            yellowStates[poleKey].greenStraight = false
            yellowStates[poleKey].greenRight = false
            yellowStates[poleKey].greenAll = false

            // If simulating on hardware, send the yellow light command
            if (simulateOnHardware) {
              jsonService.sendCommand({
                command: "signal_control",
                target: pole,
                action: "yel_on",
                value: "1",
              })

              // Turn off all green lights
              jsonService.sendCommand({
                command: "signal_control",
                target: pole,
                action: "grnL_off",
                value: "0",
              })

              jsonService.sendCommand({
                command: "signal_control",
                target: pole,
                action: "grnS_off",
                value: "0",
              })

              jsonService.sendCommand({
                command: "signal_control",
                target: pole,
                action: "grnR_off",
                value: "0",
              })
            }
          }
        })

        // Apply yellow states briefly
        setPoleStates(yellowStates)

        // After a short delay, apply the next route
        setTimeout(() => {
          setActiveRoute(nextRoute)

          // If simulating on hardware, send commands for the new route
          if (simulateOnHardware) {
            const sequence = signalSequences[nextRoute]
            Object.keys(sequence).forEach((pole) => {
              const signals = sequence[pole]
              Object.keys(signals).forEach((signal) => {
                const value = signals[signal]
                let command = ""

                if (value === "1" || value === "A") {
                  switch (signal) {
                    case "red":
                      command = "red_on"
                      break
                    case "yellow":
                      command = "yel_on"
                      break
                    case "greenLeft":
                      command = "grnL_on"
                      break
                    case "greenStraight":
                      command = "grnS_on"
                      break
                    case "greenRight":
                      command = "grnR_on"
                      break
                    case "greenAll":
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: pole,
                        action: "grnL_on",
                        value: "1",
                      })
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: pole,
                        action: "grnS_on",
                        value: "1",
                      })
                      jsonService.sendCommand({
                        command: "signal_control",
                        target: pole,
                        action: "grnR_on",
                        value: "1",
                      })
                      break
                  }

                  if (command) {
                    jsonService.sendCommand({
                      command: "signal_control",
                      target: pole,
                      action: command,
                      value: value === "A" ? "A" : "1",
                    })
                  }
                } else if (value === "0" || value === "C") {
                  switch (signal) {
                    case "red":
                      command = "red_off"
                      break
                    case "yellow":
                      command = "yel_off"
                      break
                    case "greenLeft":
                      command = "grnL_off"
                      break
                    case "greenStraight":
                      command = "grnS_off"
                      break
                    case "greenRight":
                      command = "grnR_off"
                      break
                  }

                  if (command) {
                    jsonService.sendCommand({
                      command: "signal_control",
                      target: pole,
                      action: command,
                      value: "0",
                    })
                  }
                }
              })
            })
          }

          const nextStep = (currentStep + 1) % simulationSequence.length
          setCurrentStep(nextStep)
        }, 1000) // Yellow light duration
      } else {
        // If it's the same route, just move to the next step
        setActiveRoute(nextRoute)
        const nextStep = (currentStep + 1) % simulationSequence.length
        setCurrentStep(nextStep)
      }
    }, simulationSpeed)

    return () => clearTimeout(timer)
  }, [
    isSimulating,
    currentStep,
    simulationSequence,
    simulationSpeed,
    poleStates,
    signalSequences,
    simulateOnHardware,
    isYellowBlinkMode,
    isAllLightBlinkMode,
    blinkMode,
    controlMode,
    manualOverrideActive,
  ])

  const handleRouteSelect = (route: number) => {
    if (controlMode === "semi") {
      handleSemiControlRouteSelect(route)
    } else {
      setActiveRoute(route)
    }
  }

  const handleSemiControlRouteSelect = (route: number) => {
    // Clear any existing timeout
    if (manualOverrideTimer) {
      clearTimeout(manualOverrideTimer)
    }

    // Set the route
    setActiveRoute(route)
    setManualOverrideActive(true)

    // Set a timeout to return to auto sequence
    const timer = setTimeout(() => {
      setManualOverrideActive(false)
      toast({
        title: "Manual Override Expired",
        description: "Returning to automatic sequence.",
      })
    }, overrideTimeoutDuration)

    setManualOverrideTimer(timer)

    // Send command to JSON service
    jsonService.sendCommand({
      command: "semi_control_override",
      target: "system",
      action: "manual_override",
      value: {
        route,
        timeout: overrideTimeoutDuration,
      },
    })

    toast({
      title: "Manual Override Active",
      description: `Route ${route} manually selected. Will return to auto sequence in ${overrideTimeoutDuration / 1000} seconds.`,
    })
  }

  const startSimulation = () => {
    // Example sequence: routes 1 through 14 in order
    setSimulationSequence([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    setCurrentStep(0)
    setIsSimulating(true)

    // Send simulation start command to JSON service
    jsonService.sendCommand({
      command: "start_simulation",
      target: "system",
      action: "start_simulation",
      value: {
        sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        speed: simulationSpeed,
        isSemiMode: controlMode === "semi",
      },
    })

    toast({
      title: "Simulation Started",
      description:
        controlMode === "semi"
          ? "The traffic light sequence simulation has started in semi-automatic mode. You can manually override routes."
          : "The traffic light sequence simulation has started.",
    })
  }

  const stopSimulation = () => {
    setIsSimulating(false)

    // Clear any manual override timeout
    if (manualOverrideTimer) {
      clearTimeout(manualOverrideTimer)
      setManualOverrideTimer(null)
    }

    // Send simulation stop command to JSON service
    jsonService.sendCommand({
      command: "stop_simulation",
      target: "system",
      action: "stop_simulation",
      value: {
        isSemiMode: controlMode === "semi",
      },
    })

    toast({
      title: "Simulation Stopped",
      description: "The traffic light sequence simulation has been stopped.",
    })
  }

  const changeSimulationSpeed = (speed: number) => {
    setSimulationSpeed(speed)

    // Send simulation speed change command to JSON service
    jsonService.sendCommand({
      command: "change_simulation_speed",
      target: "system",
      action: "change_simulation_speed",
      value: { speed },
    })

    toast({
      title: "Simulation Speed Changed",
      description: `Speed set to ${speed / 1000} seconds per step.`,
    })
  }

  const handleCellClick = (route: number, pole: string, signal: string) => {
    if (isSimulating) return // Don't allow editing during simulation

    setEditingCell({ route, pole, signal })
    setEditDialogOpen(true)
  }

  const handleCellValueChange = (value: string) => {
    if (!editingCell) return

    const { route, pole, signal } = editingCell

    // Store the pending change and show confirmation dialog
    setPendingChange({ route, pole, signal, value })
    setEditDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const validateSequence = (newSequences: any, route: number) => {
    const errors: Record<string, string> = {}

    // Check for time duration consistency across poles
    const poleDurations: Record<string, number> = {}

    Object.keys(newSequences[route]).forEach((pole) => {
      const signals = newSequences[route][pole]
      let totalDuration = 0

      // Calculate total duration for this pole
      if (signals.red === "1") totalDuration += 60 // Example duration
      if (signals.yellow === "1") totalDuration += 5
      if (signals.greenLeft === "1") totalDuration += 30
      if (signals.greenStraight === "1") totalDuration += 25
      if (signals.greenRight === "1") totalDuration += 20
      if (signals.greenAll === "A") totalDuration += 75 // Sum of all green durations

      poleDurations[pole] = totalDuration
    })

    // Check if all poles have the same duration
    const durations = Object.values(poleDurations).filter((d) => d > 0) // Only consider poles with signals
    if (durations.length > 1) {
      const firstDuration = durations[0]
      for (let i = 1; i < durations.length; i++) {
        if (durations[i] !== firstDuration) {
          errors["duration"] =
            "Time durations across poles do not match. All poles should start and end at the same time."
          break
        }
      }
    }

    return errors
  }

  const confirmChange = async () => {
    if (!pendingChange) return

    const { route, pole, signal, value } = pendingChange

    // Create a deep copy of the signalSequences
    const newSequences = JSON.parse(JSON.stringify(signalSequences))

    // Update the value
    newSequences[route][pole][signal] = value

    // If reflect mode is enabled, update the corresponding pole
    if (reflectMode && pole.length === 3) {
      const basePoleName = pole.substring(0, 2) // Get P1, P2, P3, P4
      const poleType = pole.charAt(2) // Get A or B
      const correspondingPole = `${basePoleName}${poleType === "A" ? "B" : "A"}`

      // Check if the corresponding pole exists in the sequence
      if (newSequences[route][correspondingPole]) {
        newSequences[route][correspondingPole][signal] = value
      }
    }

    // Validate the sequence
    const validationErrors = validateSequence(newSequences, route)

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors)

      // Show toast with validation errors
      Object.values(validationErrors).forEach((error) => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        })
      })

      // Close the confirmation dialog but don't apply changes
      setConfirmDialogOpen(false)
      setPendingChange(null)
      setEditingCell(null)
      return
    }

    setSignalSequences(newSequences)
    setConfirmDialogOpen(false)
    setPendingChange(null)
    setEditingCell(null)
    setValidationErrors({})

    // Send the updated sequence to the JSON service
    jsonService.sendCommand({
      command: "update_sequence_cell",
      target: "system",
      action: "update_sequence_cell",
      value: {
        route,
        pole,
        signal,
        value,
        reflectMode: reflectMode, // Include reflect mode in the command
      },
    })

    toast({
      title: "JSON Data Updated",
      description: `Updated ${signal} for ${pole}${reflectMode ? " and its corresponding pole" : ""} in Route ${route} to ${value || "empty"} in JSON data.`,
    })

    // If the active route was modified, update the display
    if (activeRoute === route) {
      setActiveRoute(null)
      setTimeout(() => setActiveRoute(route), 10)
    }
  }

  const cancelChange = () => {
    setConfirmDialogOpen(false)
    setPendingChange(null)
    setEditingCell(null)
    setValidationErrors({})
  }

  const handleControlModeChange = (mode: "auto" | "manual" | "semi") => {
    setControlMode(mode)

    // If switching to semi-control mode, start the auto sequence
    if (mode === "semi") {
      handleSemiControlMode()
    } else if (mode === "manual") {
      // Stop simulation when switching to manual mode
      setIsSimulating(false)
    }

    // Send control mode change to JSON service
    jsonService.sendCommand({
      command: "set_control_mode",
      target: "system",
      action: "set_control_mode",
      value: mode,
    })

    toast({
      title: `Control Mode Changed`,
      description: `Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Control mode.`,
    })
  }

  const handleSemiControlMode = () => {
    // Start auto control sequence if not already running
    if (controlMode === "semi" && !isSimulating) {
      // Use the current time to determine which time zone to use
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

      // Find the active time zone based on current time
      const activeTimeZone = timeZones.find((zone) => {
        // Handle time zones that span across midnight
        if (zone.startTime > zone.endTime) {
          return currentTime >= zone.startTime || currentTime < zone.endTime
        }
        return currentTime >= zone.startTime && currentTime < zone.endTime
      })

      if (activeTimeZone) {
        // Parse the sequence from the active time zone
        const sequence = activeTimeZone.sequence.split(",").map(Number)
        setSimulationSequence(sequence)
        setCurrentStep(0)
        setIsSimulating(true)

        toast({
          title: "Semi-Control Mode Activated",
          description: `Auto sequence from ${activeTimeZone.name} is running. Manual overrides will be temporary.`,
        })
      } else {
        // Default sequence if no time zone is active
        setSimulationSequence([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
        setCurrentStep(0)
        setIsSimulating(true)

        toast({
          title: "Semi-Control Mode Activated",
          description: "Default auto sequence is running. Manual overrides will be temporary.",
        })
      }
    }
  }

  const handleYellowBlinkMode = () => {
    const newMode = !isYellowBlinkMode
    setIsYellowBlinkMode(newMode)

    // Turn off other modes
    if (newMode) {
      setIsAllLightBlinkMode(false)
      setIsSimulating(false)
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
      setIsSimulating(false)
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
    setSimulationSpeed(userTimingValue)
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

  const routes = Array.from({ length: 14 }, (_, i) => i + 1)
  const poles = ["P1A", "P1B", "P2A", "P2B", "P3A", "P3B", "P4A", "P4B"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Traffic Light Sequence Control</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">Controller Status:</span>
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              ></span>
              <span className="text-sm font-normal">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "error"
                    ? "Error"
                    : "Disconnected"}
              </span>

              {/* Yellow Blink Mode Button */}
              <Button
                variant={isYellowBlinkMode ? "default" : "outline"}
                size="sm"
                onClick={handleYellowBlinkMode}
                className="ml-2"
              >
                Yellow Blink Mode
              </Button>

              {/* All Light Blink Button */}
              <Button variant={isAllLightBlinkMode ? "default" : "outline"} size="sm" onClick={handleAllLightBlinkMode}>
                All Light Blink
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
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

          {controlMode === "semi" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-700 mb-2">Semi-Control Mode Active</h4>
              <p className="text-sm text-blue-600 mb-3">
                Auto sequence is running in the background. Manual selections will override for a limited time.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="override-timeout" className="text-sm">
                  Override Timeout (seconds):
                </Label>
                <Input
                  id="override-timeout"
                  type="number"
                  min="1"
                  max="60"
                  value={overrideTimeoutDuration / 1000}
                  onChange={(e) => setOverrideTimeoutDuration(Number(e.target.value) * 1000)}
                  className="w-20 h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    jsonService.sendCommand({
                      command: "set_override_timeout",
                      target: "system",
                      action: "set_override_timeout",
                      value: { timeout: overrideTimeoutDuration },
                    })
                    toast({
                      title: "Override Timeout Updated",
                      description: `Manual override will expire after ${overrideTimeoutDuration / 1000} seconds.`,
                    })
                  }}
                >
                  Apply
                </Button>
              </div>
              {manualOverrideActive && (
                <div className="text-sm font-medium text-orange-600">
                  Manual override active. Auto sequence will resume in {Math.ceil(overrideTimeoutDuration / 1000)}{" "}
                  seconds.
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Display poles in a grid */}
            {poles.map((pole) => (
              <div key={pole} className="border rounded-lg p-4">
                <h3 className="font-bold text-center mb-2">{pole}</h3>
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full ${poleStates[pole as keyof typeof poleStates].red ? "bg-red-500" : "bg-red-200"}`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full ${poleStates[pole as keyof typeof poleStates].yellow ? "bg-yellow-500" : "bg-yellow-200"}`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full ${poleStates[pole as keyof typeof poleStates].greenLeft ? "bg-green-500" : "bg-green-200"}`}
                  >
                    {poleStates[pole as keyof typeof poleStates].greenLeft && (
                      <span className="flex justify-center">←</span>
                    )}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full ${poleStates[pole as keyof typeof poleStates].greenStraight ? "bg-green-500" : "bg-green-200"}`}
                  >
                    {poleStates[pole as keyof typeof poleStates].greenStraight && (
                      <span className="flex justify-center">↑</span>
                    )}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full ${poleStates[pole as keyof typeof poleStates].greenRight ? "bg-green-500" : "bg-green-200"}`}
                  >
                    {poleStates[pole as keyof typeof poleStates].greenRight && (
                      <span className="flex justify-center">→</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Route Selection</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1">
                {routes.map((route) => (
                  <Button
                    key={route}
                    variant={activeRoute === route ? "default" : "outline"}
                    onClick={() => {
                      if (controlMode === "semi") {
                        handleRouteSelect(route)
                      } else {
                        handleRouteSelect(route)
                      }
                    }}
                    disabled={(isSimulating && controlMode !== "semi") || isYellowBlinkMode || isAllLightBlinkMode}
                    size="sm"
                    className="text-xs"
                  >
                    Route {route}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Simulation Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div className="flex gap-2">
                  {!isSimulating ? (
                    <Button
                      onClick={startSimulation}
                      className="flex-1"
                      disabled={isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    >
                      Start Simulation
                    </Button>
                  ) : (
                    <Button onClick={stopSimulation} variant="destructive" className="flex-1">
                      Stop Simulation
                    </Button>
                  )}

                  {/* Set User Configured Timings Button */}
                  <Button onClick={handleSetUserConfiguredTimings} variant="outline" disabled={isSimulating}>
                    Set User Configured Timings
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeSimulationSpeed(1000)}
                    disabled={isSimulating || isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    className="text-xs"
                  >
                    1s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeSimulationSpeed(2000)}
                    disabled={isSimulating || isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    className="text-xs"
                  >
                    2s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeSimulationSpeed(3000)}
                    disabled={isSimulating || isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    className="text-xs"
                  >
                    3s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeSimulationSpeed(5000)}
                    disabled={isSimulating || isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    className="text-xs"
                  >
                    5s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeSimulationSpeed(10000)}
                    disabled={isSimulating || isYellowBlinkMode || isAllLightBlinkMode || blinkMode}
                    className="text-xs"
                  >
                    10s
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="simulate-hardware" className="cursor-pointer">
                    Simulate on Hardware
                  </Label>
                  <Switch id="simulate-hardware" checked={simulateOnHardware} onCheckedChange={setSimulateOnHardware} />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="reflect-mode" className="cursor-pointer">
                    Reflect Mode (Mirror A/B Poles)
                  </Label>
                  <Switch id="reflect-mode" checked={reflectMode} onCheckedChange={setReflectMode} />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="blink-mode" className="cursor-pointer">
                    BLINK MODE
                  </Label>
                  <Switch id="blink-mode" checked={blinkMode} onCheckedChange={handleBlinkModeToggle} />
                </div>
              </div>

              {blinkMode && (
                <div className="mt-2">
                  <Label htmlFor="yellow-blink-rate">Yellow Blink Rate (ms)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="yellow-blink-rate"
                      type="number"
                      min="100"
                      max="5000"
                      step="100"
                      value={yellowBlinkRate}
                      onChange={(e) => setYellowBlinkRate(Number(e.target.value))}
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
                          description: `Yellow blink rate set to ${yellowBlinkRate}ms.`,
                        })
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              {controlMode === "semi" && (
                <div className="mt-4">
                  <Label htmlFor="override-timeout">Manual Override Timeout (seconds)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="override-timeout"
                      type="number"
                      min="1"
                      max="60"
                      value={overrideTimeoutDuration / 1000}
                      onChange={(e) => setOverrideTimeoutDuration(Number(e.target.value) * 1000)}
                      className="w-32"
                    />
                    <Button
                      onClick={() => {
                        jsonService.sendCommand({
                          command: "set_override_timeout",
                          target: "system",
                          action: "set_override_timeout",
                          value: { timeout: overrideTimeoutDuration },
                        })

                        toast({
                          title: "Override Timeout Updated",
                          description: `Manual override will expire after ${overrideTimeoutDuration / 1000} seconds.`,
                        })
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In Semi Control mode, manual route selections will return to auto sequence after this timeout.
                  </p>
                </div>
              )}

              {isSimulating && (
                <p className="text-sm mt-2">
                  Currently simulating Route {simulationSequence[currentStep]}. Step {currentStep + 1} of{" "}
                  {simulationSequence.length}. Speed: {simulationSpeed / 1000}s per step.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {controlMode === "auto" && (
        <Card className="p-4 mt-4">
          <h3 className="font-bold mb-2">Auto Control Mode Active</h3>
          <p className="text-sm mb-2">
            The system is running in automatic mode based on the configured time zones and sequences.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
            <p className="text-sm text-blue-700">
              <strong>Current Time Zone:</strong>{" "}
              {timeZones.find((zone) => {
                const now = new Date()
                const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
                if (zone.startTime > zone.endTime) {
                  return currentTime >= zone.startTime || currentTime < zone.endTime
                }
                return currentTime >= zone.startTime && currentTime < zone.endTime
              })?.name || "Default"}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Signal Sequence Chart</span>
            <span className="text-sm font-normal text-muted-foreground">
              Click on any cell to edit and apply to traffic controller
            </span>
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <span>
              All poles must have matching time durations. Both GA (All Green) and individual green signals (GL, GS, GR)
              can coexist legally. When Reflect Mode is enabled, changes to one pole will be mirrored to its
              corresponding pole (A↔B).
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                {poles.map((pole) => (
                  <TableHead key={pole} colSpan={6}>
                    {pole}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                {poles.map((pole, index) => (
                  <React.Fragment key={index}>
                    <TableHead>R</TableHead>
                    <TableHead>Y</TableHead>
                    <TableHead>G&lt;</TableHead>
                    <TableHead>GS</TableHead>
                    <TableHead>G&gt;</TableHead>
                    <TableHead>GA</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => {
                const sequence = signalSequences[route as keyof typeof signalSequences]
                const hasError = validationErrors[`${route}`] || validationErrors["duration"]

                return (
                  <TableRow
                    key={route}
                    className={`
                      ${activeRoute === route ? "bg-muted" : ""}
                      ${hasError ? "bg-red-50" : ""}
                    `}
                  >
                    <TableCell className="font-medium">{route}</TableCell>

                    {poles.map((pole) => {
                      const poleError = validationErrors[`${route}-${pole}`]

                      return (
                        <React.Fragment key={`${route}-${pole}`}>
                          <TableCell
                            className={`${
                              sequence[pole]?.red === "1"
                                ? "bg-red-100"
                                : sequence[pole]?.red === "C" || sequence[pole]?.red === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "red")}
                          >
                            {sequence[pole]?.red}
                          </TableCell>
                          <TableCell
                            className={`${
                              sequence[pole]?.yellow === "1"
                                ? "bg-yellow-100"
                                : sequence[pole]?.yellow === "C" || sequence[pole]?.yellow === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "yellow")}
                          >
                            {sequence[pole]?.yellow}
                          </TableCell>
                          <TableCell
                            className={`${
                              sequence[pole]?.greenLeft === "1"
                                ? "bg-green-100"
                                : sequence[pole]?.greenLeft === "C" || sequence[pole]?.greenLeft === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "greenLeft")}
                          >
                            {sequence[pole]?.greenLeft}
                          </TableCell>
                          <TableCell
                            className={`${
                              sequence[pole]?.greenStraight === "1"
                                ? "bg-green-100"
                                : sequence[pole]?.greenStraight === "C" || sequence[pole]?.greenStraight === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "greenStraight")}
                          >
                            {sequence[pole]?.greenStraight}
                          </TableCell>
                          <TableCell
                            className={`${
                              sequence[pole]?.greenRight === "1"
                                ? "bg-green-100"
                                : sequence[pole]?.greenRight === "C" || sequence[pole]?.greenRight === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "greenRight")}
                          >
                            {sequence[pole]?.greenRight}
                          </TableCell>
                          <TableCell
                            className={`${
                              sequence[pole]?.greenAll === "A"
                                ? "bg-green-100"
                                : sequence[pole]?.greenAll === "C" || sequence[pole]?.greenAll === "D"
                                  ? "bg-orange-100"
                                  : ""
                            } cursor-pointer hover:bg-gray-100 ${poleError ? "border-2 border-red-500" : ""}`}
                            onClick={() => handleCellClick(route, pole, "greenAll")}
                          >
                            {sequence[pole]?.greenAll}
                          </TableCell>
                        </React.Fragment>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Edit Signal Value
              {editingCell && (
                <span className="font-normal text-sm text-muted-foreground ml-2">
                  (Route {editingCell.route}, {editingCell.pole}, {editingCell.signal})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup defaultValue="" className="space-y-2" onValueChange={handleCellValueChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="empty" />
                <Label htmlFor="empty">Empty (No value)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="on" />
                <Label htmlFor="on" className="text-green-600 font-medium">
                  ON (1) - Signal is active
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="off" />
                <Label htmlFor="off">OFF (0) - Signal is explicitly turned off</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="all-green" />
                <Label htmlFor="all-green" className="text-green-600 font-medium">
                  ALL GREEN ON (A) - Can coexist with individual green signals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="X" id="not-used" />
                <Label htmlFor="not-used" className="text-orange-600">
                  Light Not Used (X)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="C" id="compulsory-off" />
                <Label htmlFor="compulsory-off" className="text-orange-600 font-medium">
                  COMPULSORY OFF (C)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="D" id="compulsory-on" />
                <Label htmlFor="compulsory-on" className="text-orange-600 font-medium">
                  COMPULSORY ON (D)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Signal Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange && (
                <>
                  You are about to change {pendingChange.signal} for {pendingChange.pole}
                  in Route {pendingChange.route} to {pendingChange.value || "empty"}.
                  <br />
                  <br />
                  <strong className="text-blue-600">This change will be updated in the JSON data.</strong>
                  <br />
                  <br />
                  {Object.keys(validationErrors).length > 0 ? (
                    <div className="bg-red-50 p-2 rounded border border-red-200 mb-2">
                      <strong className="text-red-600">Validation Errors:</strong>
                      <ul className="list-disc pl-5 mt-1 text-red-600">
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                      <p className="mt-1 text-sm">Please correct these issues before proceeding.</p>
                    </div>
                  ) : null}
                  Are you sure you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelChange} disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange} disabled={isLoading || Object.keys(validationErrors).length > 0}>
              {isLoading ? "Updating..." : "Yes, Update JSON Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
