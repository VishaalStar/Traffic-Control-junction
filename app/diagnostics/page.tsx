"use client"

import DiagnosticsPanel from "@/components/diagnostics-panel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Settings, Activity, Cpu, FileJson, Radio, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { jsonService } from "@/lib/json-service"

export default function DiagnosticsPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Traffic Control Board Diagnostics</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          <Link href="/test">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Sequence Control</span>
            </Button>
          </Link>
          <Link href="/diagnostics">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">Diagnostics</span>
            </Button>
          </Link>
          <Link href="/config">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">IP Config</span>
            </Button>
          </Link>
          <Link href="/control-settings">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Control Settings</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={async () => {
              try {
                // Show loading toast
                toast({
                  title: "Sending to Raspberry Pi...",
                  description: "Sending configuration data to Raspberry Pi",
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
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Update</span>
          </Button>
          <Link href="/json-viewer">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 border border-blue-300"
            >
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON Data</span>
            </Button>
          </Link>
        </div>
      </div>
      <DiagnosticsPanel />
    </main>
  )
}
