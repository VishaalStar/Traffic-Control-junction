"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { jsonService } from "@/lib/json-service"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function RaspberryPiConfig() {
  const [raspberryPiUrl, setRaspberryPiUrl] = useState("http://192.168.1.100")
  const [isTesting, setIsTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")

  useEffect(() => {
    // Get the stored URL if available
    const storedUrl = localStorage.getItem("raspberryPiUrl")
    if (storedUrl) {
      setRaspberryPiUrl(storedUrl)
      jsonService.setRaspberryPiBaseUrl(storedUrl)
    }

    // Subscribe to connection status changes
    const unsubscribe = jsonService.onStatusChange((status) => {
      setConnectionStatus(status)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleSave = () => {
    // Save the URL to local storage
    localStorage.setItem("raspberryPiUrl", raspberryPiUrl)

    // Update the JSON service
    jsonService.setRaspberryPiBaseUrl(raspberryPiUrl)

    toast({
      title: "Configuration Saved",
      description: `Raspberry Pi URL set to: ${raspberryPiUrl}`,
    })
  }

  const testConnection = async () => {
    setIsTesting(true)

    try {
      const success = await jsonService.testConnection()

      if (success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the Raspberry Pi.",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to the Raspberry Pi. Check the URL and make sure the Pi is online.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Raspberry Pi Connection</span>
          <Badge
            className={
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }
          >
            <div className="flex items-center gap-1">
              {connectionStatus === "connected" ? (
                <CheckCircle className="h-3 w-3" />
              ) : connectionStatus === "error" ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raspberryPiUrl">Raspberry Pi URL</Label>
            <Input
              id="raspberryPiUrl"
              value={raspberryPiUrl}
              onChange={(e) => setRaspberryPiUrl(e.target.value)}
              placeholder="http://192.168.1.100"
            />
            <p className="text-xs text-muted-foreground">
              Enter the base URL of your Raspberry Pi (e.g., http://192.168.1.100)
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={testConnection} disabled={isTesting} className="flex items-center gap-2">
          {isTesting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
        <Button onClick={handleSave}>Save Configuration</Button>
      </CardFooter>
    </Card>
  )
}
