"use client"

import RaspberryPiConfig from "@/components/raspberry-pi-config"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Activity, FileJson, Server, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { jsonService } from "@/lib/json-service"

export default function RaspberryPiPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Raspberry Pi Configuration</h1>
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
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON Viewer</span>
            </Button>
          </Link>
          <Link href="/raspberry-pi">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Raspberry Pi</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <RaspberryPiConfig />

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Raspberry Pi Setup Instructions</h2>
          <p className="text-yellow-700 mb-2">
            To receive commands from this application, your Raspberry Pi needs to be running a server that can handle
            the JSON commands. Follow these steps:
          </p>
          <ol className="list-decimal pl-5 text-yellow-700 space-y-1">
            <li>Make sure your Raspberry Pi is connected to the same network as this device</li>
            <li>Install a web server on your Raspberry Pi (like Flask for Python or Express for Node.js)</li>
            <li>
              Set up endpoints to handle the following routes:
              <ul className="list-disc pl-5 mt-1">
                <li>
                  <code>/ping</code> - For connection testing
                </li>
                <li>
                  <code>/command</code> - For individual commands
                </li>
                <li>
                  <code>/system</code> - For system-wide commands
                </li>
                <li>
                  <code>/system/state</code> - For full system state updates
                </li>
              </ul>
            </li>
            <li>Configure your Raspberry Pi to process the JSON commands and control the traffic lights</li>
            <li>Enter your Raspberry Pi's IP address or hostname in the configuration above</li>
          </ol>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Example Raspberry Pi Server Code (Python)</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {`from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok", "message": "Raspberry Pi is online"})

@app.route('/command', methods=['POST'])
def handle_command():
    data = request.json
    print(f"Received command: {json.dumps(data, indent=2)}")
    
    # Process the command here
    # Example: control GPIO pins based on the command
    
    return jsonify({"status": "ok", "message": "Command received"})

@app.route('/system', methods=['POST'])
def handle_system_command():
    data = request.json
    print(f"Received system command: {json.dumps(data, indent=2)}")
    
    # Process the system command here
    
    return jsonify({"status": "ok", "message": "System command received"})

@app.route('/system/state', methods=['POST'])
def handle_system_state():
    data = request.json
    print(f"Received system state: {json.dumps(data, indent=2)}")
    
    # Process the system state here
    
    return jsonify({"status": "ok", "message": "System state received"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
`}
          </pre>
        </div>
      </div>
    </main>
  )
}
