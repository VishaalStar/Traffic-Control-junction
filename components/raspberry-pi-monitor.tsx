"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { jsonService } from "@/lib/json-service"
import { AlertCircle, RefreshCw, Play, Pause, Terminal, Send, Download, FileJson } from "lucide-react"

export default function RaspberryPiMonitor() {
  const [raspberryPiUrl, setRaspberryPiUrl] = useState("http://localhost:8080")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected")
  const [isPolling, setIsPolling] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(5000)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [jsonData, setJsonData] = useState<any>(null)
  const [pythonScript, setPythonScript] = useState(`#!/usr/bin/env python3
"""
Traffic Junction JSON Monitor

This script continuously monitors for JSON configuration updates from the web frontend
and processes them on the Raspberry Pi. It prints relevant variable values to demonstrate
real-time updates when the web interface changes.

Usage:
python3 traffic_json_monitor.py
"""

import json
import time
import os
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("traffic_monitor.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Import initial variables
try:
    from traffic_start_variables import *
    logging.info("Successfully imported initial variables")
except ImportError:
    logging.error("Failed to import traffic_start_variables.py")
    # Define default values for essential variables
    manualcontrol_mode = False
    autocontrol_mode = True
    semicontrol_mode = False
    route_matrix = []
    all_pole_yellow_blink = False
    time_zone_number = 1

# Configuration
JSON_FILE_PATH = "traffic_config.json"
BACKUP_DIR = "backups"
SERVER_PORT = 8080

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

# Global variables to track state
last_update_time = None
current_config = {}

class ConfigState:
    """Class to store and manage the current configuration state"""
    def __init__(self):
        self.manualcontrol_mode = manualcontrol_mode
        self.autocontrol_mode = autocontrol_mode
        self.semicontrol_mode = semicontrol_mode
        self.all_pole_yellow_blink = all_pole_yellow_blink
        self.selected_pole = None
        self.active_route = None
        self.time_zone_number = time_zone_number
        self.last_command = None
        
    def update_from_json(self, config_data):
        """Update state from JSON configuration data"""
        if 'controlMode' in config_data:
            mode = config_data['controlMode']
            self.manualcontrol_mode = (mode == 'manual')
            self.autocontrol_mode = (mode == 'auto')
            self.semicontrol_mode = (mode == 'semi')
            logging.info(f"Control mode updated to: {mode}")
        
        if 'selectedPole' in config_data:
            self.selected_pole = config_data['selectedPole']
            logging.info(f"Selected pole updated to: {self.selected_pole}")
            
        if 'activeRoute' in config_data:
            self.active_route = config_data['activeRoute']
            logging.info(f"Active route updated to: {self.active_route}")
            
        if 'yellowBlink' in config_data:
            self.all_pole_yellow_blink = config_data['yellowBlink']
            logging.info(f"Yellow blink mode: {'Enabled' if self.all_pole_yellow_blink else 'Disabled'}")
            
        if 'timeZone' in config_data:
            self.time_zone_number = config_data['timeZone']
            logging.info(f"Time zone updated to: {self.time_zone_number}")
            
        if 'command' in config_data:
            self.last_command = config_data['command']
            logging.info(f"Received command: {self.last_command}")
            
        # Print current state after update
        self.print_current_state()
    
    def print_current_state(self):
        """Print the current state of the traffic controller"""
        print("\\n" + "="*50)
        print("TRAFFIC JUNCTION CONTROLLER - CURRENT STATE")
        print("="*50)
        print(f"Control Mode: {'Manual' if self.manualcontrol_mode else 'Auto' if self.autocontrol_mode else 'Semi'}")
        print(f"Selected Pole: {self.selected_pole or 'None'}")
        print(f"Active Route: {self.active_route or 'None'}")
        print(f"Yellow Blink Mode: {'Enabled' if self.all_pole_yellow_blink else 'Disabled'}")
        print(f"Current Time Zone: {self.time_zone_number}")
        print(f"Last Command: {self.last_command or 'None'}")
        print("="*50)

# Initialize config state
config_state = ConfigState()

class WebhookHandler(BaseHTTPRequestHandler):
    """HTTP request handler for receiving JSON updates from the web frontend"""
    
    def _set_response(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow CORS
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight"""
        self._set_response()
    
    def do_POST(self):
        """Handle POST requests with JSON configuration updates"""
        global last_update_time, current_config
        
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                config = json.loads(post_data.decode())
                logging.info(f"Received JSON configuration update: {json.dumps(config, indent=2)}")
            except json.JSONDecodeError as e:
                logging.error(f"Invalid JSON received: {e}")
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                return
            
            # Save to file
            with open(JSON_FILE_PATH, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Create a backup with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(BACKUP_DIR, f"config_{timestamp}.json")
            with open(backup_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Update last update time and current config
            last_update_time = datetime.now()
            current_config = config
            
            # Update the config state
            config_state.update_from_json(config)
            
            # Send success response
            self._set_response()
            self.wfile.write(json.dumps({"status": "success", "timestamp": timestamp}).encode())
            
        except Exception as e:
            logging.error(f"Error processing webhook: {e}")
            self._set_response(500)
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        """Handle GET requests for health check and status"""
        if self.path == '/health':
            # Health check endpoint
            self._set_response()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "lastUpdate": last_update_time.isoformat() if last_update_time else None
            }).encode())
        elif self.path == '/status':
            # Status endpoint
            self._set_response()
            status_data = {
                "controlMode": "manual" if config_state.manualcontrol_mode else "auto" if config_state.autocontrol_mode else "semi",
                "selectedPole": config_state.selected_pole,
                "activeRoute": config_state.active_route,
                "yellowBlink": config_state.all_pole_yellow_blink,
                "timeZone": config_state.time_zone_number,
                "lastCommand": config_state.last_command,
                "lastUpdate": last_update_time.isoformat() if last_update_time else None
            }
            self.wfile.write(json.dumps(status_data).encode())
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

def run_server():
    """Run the webhook server to receive JSON updates"""
    server_address = ('', SERVER_PORT)
    httpd = HTTPServer(server_address, WebhookHandler)
    logging.info(f"Starting webhook server on port {SERVER_PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server error: {e}")
    finally:
        httpd.server_close()
        logging.info("Server stopped")

def process_json_file():
    """Process the JSON configuration file if it exists"""
    if os.path.exists(JSON_FILE_PATH):
        try:
            with open(JSON_FILE_PATH, 'r') as f:
                config = json.load(f)
                config_state.update_from_json(config)
                logging.info("Loaded configuration from file")
        except Exception as e:
            logging.error(f"Error loading configuration from file: {e}")

def main():
    """Main function to run the JSON receiver"""
    logging.info("Starting Traffic Junction JSON Monitor")
    
    # Process existing JSON file if available
    process_json_file()
    
    # Print initial state
    config_state.print_current_state()
    
    # Run the webhook server
    run_server()

if __name__ == "__main__":
    main()
`)

  const consoleEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to check connection to Raspberry Pi
  const checkConnection = async () => {
    try {
      const response = await fetch(`${raspberryPiUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConnectionStatus("connected")
        if (data.lastUpdate) {
          setLastUpdate(new Date(data.lastUpdate).toLocaleString())
        }
        addToConsole(`Connection successful to ${raspberryPiUrl}`)
        return true
      } else {
        setConnectionStatus("error")
        addToConsole(`Error connecting to ${raspberryPiUrl}: ${response.status} ${response.statusText}`)
        return false
      }
    } catch (error) {
      setConnectionStatus("error")
      addToConsole(
        `Network error connecting to ${raspberryPiUrl}: ${error instanceof Error ? error.message : String(error)}`,
      )
      return false
    }
  }

  // Function to get status from Raspberry Pi
  const getStatus = async () => {
    try {
      const response = await fetch(`${raspberryPiUrl}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setJsonData(data)
        if (data.lastUpdate) {
          setLastUpdate(new Date(data.lastUpdate).toLocaleString())
        }
        addToConsole(`Received status update from ${raspberryPiUrl}`)
        return data
      } else {
        addToConsole(`Error getting status from ${raspberryPiUrl}: ${response.status} ${response.statusText}`)
        return null
      }
    } catch (error) {
      addToConsole(
        `Network error getting status from ${raspberryPiUrl}: ${error instanceof Error ? error.message : String(error)}`,
      )
      return null
    }
  }

  // Function to send JSON data to Raspberry Pi
  const sendJsonData = async () => {
    try {
      // Get the current state from jsonService
      const currentState = {
        controlMode: jsonService.getLastState()?.controlMode || "auto",
        selectedPole: jsonService.getLastState()?.selectedPole || null,
        activeRoute: jsonService.getLastState()?.activeRoute || null,
        yellowBlink: jsonService.getLastState()?.yellowBlink || false,
        timeZone: jsonService.getLastState()?.timeZone || 1,
        command: jsonService.getLastCommand()?.command || null,
        timestamp: Date.now(),
      }

      const response = await fetch(`${raspberryPiUrl}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentState),
      })

      if (response.ok) {
        const data = await response.json()
        addToConsole(`Successfully sent JSON data to ${raspberryPiUrl}`)
        toast({
          title: "JSON Data Sent",
          description: "Successfully sent JSON data to Raspberry Pi",
        })
        return true
      } else {
        addToConsole(`Error sending JSON data to ${raspberryPiUrl}: ${response.status} ${response.statusText}`)
        toast({
          title: "Error Sending JSON Data",
          description: `Error: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      addToConsole(
        `Network error sending JSON data to ${raspberryPiUrl}: ${error instanceof Error ? error.message : String(error)}`,
      )
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
      return false
    }
  }

  // Function to add message to console
  const addToConsole = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleOutput((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  // Function to clear console
  const clearConsole = () => {
    setConsoleOutput([])
  }

  // Function to start polling
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    setIsPolling(true)
    addToConsole(`Started polling at ${pollingInterval}ms intervals`)

    // Initial check
    getStatus()

    pollingIntervalRef.current = setInterval(() => {
      getStatus()
    }, pollingInterval)
  }

  // Function to stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    setIsPolling(false)
    addToConsole("Stopped polling")
  }

  // Function to download Python script
  const downloadPythonScript = () => {
    const blob = new Blob([pythonScript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "traffic_json_monitor.py"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Python Script Downloaded",
      description: "The traffic_json_monitor.py script has been downloaded",
    })
  }

  // Auto-scroll console when new messages are added
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [consoleOutput, autoScroll])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Raspberry Pi Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="raspberry-pi-url">Raspberry Pi URL</Label>
                <Input
                  id="raspberry-pi-url"
                  value={raspberryPiUrl}
                  onChange={(e) => setRaspberryPiUrl(e.target.value)}
                  placeholder="http://localhost:8080"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={checkConnection}>Check Connection</Button>
                <Button onClick={sendJsonData} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send JSON
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <span className="font-medium capitalize">{connectionStatus}</span>
              </div>
              {lastUpdate && <div className="text-sm text-muted-foreground">Last Update: {lastUpdate}</div>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="polling-interval">Polling Interval (ms)</Label>
                  <Input
                    id="polling-interval"
                    type="number"
                    min="1000"
                    step="1000"
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
                <div className="flex items-end gap-2">
                  {!isPolling ? (
                    <Button onClick={startPolling} disabled={connectionStatus !== "connected"}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Polling
                    </Button>
                  ) : (
                    <Button onClick={stopPolling} variant="destructive">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Polling
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-scroll" className="cursor-pointer">
                  Auto-scroll Console
                </Label>
                <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="console">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="console">Console Output</TabsTrigger>
          <TabsTrigger value="json">JSON Data</TabsTrigger>
          <TabsTrigger value="script">Python Script</TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  Console Output
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearConsole}>
                  Clear Console
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 font-mono p-4 rounded-md h-[400px] overflow-y-auto">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500 italic">No console output yet...</div>
                ) : (
                  consoleOutput.map((line, index) => <div key={index}>{line}</div>)
                )}
                <div ref={consoleEndRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <FileJson className="h-5 w-5 mr-2" />
                  JSON Data
                </CardTitle>
                <Button variant="outline" size="sm" onClick={getStatus}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 font-mono p-4 rounded-md h-[400px] overflow-y-auto">
                {jsonData ? (
                  <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                ) : (
                  <div className="text-gray-500 italic">No JSON data available. Click Refresh to fetch data.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <FileJson className="h-5 w-5 mr-2" />
                  Python Script for Raspberry Pi
                </CardTitle>
                <Button variant="outline" size="sm" onClick={downloadPythonScript}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Script
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 font-mono p-4 rounded-md h-[400px] overflow-y-auto">
                <pre>{pythonScript}</pre>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-blue-800 font-medium mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  How to Use This Script
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-blue-700">
                  <li>Download the script to your Raspberry Pi</li>
                  <li>
                    Make it executable:{" "}
                    <code className="bg-blue-100 px-2 py-1 rounded">chmod +x traffic_json_monitor.py</code>
                  </li>
                  <li>
                    Run the script:{" "}
                    <code className="bg-blue-100 px-2 py-1 rounded">python3 traffic_json_monitor.py</code>
                  </li>
                  <li>The script will start a webhook server on port 8080</li>
                  <li>Use this monitor page to send JSON updates to the Raspberry Pi</li>
                  <li>The script will print updates to the console when it receives new data</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
