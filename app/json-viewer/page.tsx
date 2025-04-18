"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jsonService } from "@/lib/json-service"
import Link from "next/link"
import { Home, FileJson, Activity, Cpu, Settings, Download, RefreshCw, Radio, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function JsonViewerPage() {
  const [lastCommand, setLastCommand] = useState<any>(null)
  const [lastState, setLastState] = useState<any>(null)
  const [commandHistory, setCommandHistory] = useState<any[]>([])
  const [jsonString, setJsonString] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Function to refresh data from the JSON service
  const refreshData = () => {
    setIsRefreshing(true)

    try {
      // Get the last command, state, and command history
      const command = jsonService.getLastCommand()
      const state = jsonService.getLastState()
      const history = jsonService.getCommandHistory()

      setLastCommand(command)
      setLastState(state)
      setCommandHistory(history)

      // Set the initial JSON string to show the latest data
      if (command && command.command === "set_control_mode") {
        // If the last command was a control mode change, show it in the raw JSON view
        setJsonString(JSON.stringify(command, null, 2))
      } else if (state) {
        // Otherwise show the current system state which includes the control mode
        setJsonString(JSON.stringify(state, null, 2))
      } else if (command) {
        // Fallback to showing the last command
        setJsonString(JSON.stringify(command, null, 2))
      }

      if (history.length > 0 && history.length % 10 === 0) {
        toast({
          title: "Command History Growing",
          description: `There are now ${history.length} commands in history. Consider creating an update file to clear history.`,
        })
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh JSON data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial data load
    refreshData()

    // Set up an interval to refresh data every 5 seconds if autoRefresh is enabled
    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      intervalId = setInterval(refreshData, 5000)
    }

    // Clean up the interval on component unmount or when autoRefresh changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh])

  const handleDownload = () => {
    try {
      const data = {
        timestamp: Date.now(),
        lastCommand,
        lastState,
        commandHistory,
      }

      jsonService.downloadJsonFile(data, `traffic_junction_data_${Date.now()}.json`)

      toast({
        title: "JSON Downloaded",
        description: "The JSON data has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading JSON:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download JSON data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateUpdateFile = () => {
    try {
      jsonService.createUpdateJsonFile()

      toast({
        title: "Update File Created",
        description: "A comprehensive JSON file with all commands and current state has been created and downloaded.",
      })

      // Refresh data after creating the update file
      setTimeout(refreshData, 500)
    } catch (error) {
      console.error("Error creating update file:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create update JSON file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(jsonString)
      toast({
        title: "JSON Copied",
        description: "The JSON data has been copied to clipboard.",
      })
    } catch (error) {
      console.error("Error copying JSON:", error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy JSON data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearHistory = () => {
    try {
      jsonService.clearCommandHistory()
      refreshData()
      toast({
        title: "History Cleared",
        description: "Command history has been cleared successfully.",
      })
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Clear Failed",
        description: "Failed to clear command history. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">JSON Data Viewer</h1>
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
            <Button variant="outline" size="sm" className="flex items-center gap-1">
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
          <Link href="/json-viewer">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON Data</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>JSON Data Controls</span>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                size="sm"
                variant="outline"
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh Data</span>
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="sm"
                variant={autoRefresh ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                <span>{autoRefresh ? "Auto Refresh: ON" : "Auto Refresh: OFF"}</span>
              </Button>
              <Button onClick={handleDownload} size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Download JSON</span>
              </Button>
              <Button
                onClick={handleCreateUpdateFile}
                size="sm"
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 border border-blue-300"
              >
                <FileJson className="h-4 w-4" />
                <span>Create Update File</span>
              </Button>
              <Button onClick={handleClearHistory} size="sm" variant="destructive" className="flex items-center gap-1">
                <span>Clear History</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Data Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList className="mb-4">
              <TabsTrigger value="view">Raw JSON</TabsTrigger>
              <TabsTrigger value="history">Command History</TabsTrigger>
              <TabsTrigger value="command">Last Command</TabsTrigger>
              <TabsTrigger value="state">System State</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Command
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commandHistory.length > 0 ? (
                      commandHistory.map((cmd, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 ${cmd.command === "set_control_mode" ? "bg-blue-50" : ""}`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(cmd.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {cmd.command === "set_control_mode" ? (
                              <span className="font-bold text-blue-600">{cmd.command}</span>
                            ) : (
                              cmd.command
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm">{cmd.target}</td>
                          <td className="px-4 py-2 text-sm">
                            {cmd.command === "set_control_mode" ? (
                              <span className="font-bold text-blue-600">
                                {cmd.action} ({cmd.value})
                              </span>
                            ) : (
                              cmd.action
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setJsonString(JSON.stringify(cmd, null, 2))
                                // Switch to the raw JSON view
                                document.querySelector('[value="view"]')?.click()
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                          No command history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="command">
              {lastCommand ? (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">Command:</p>
                      <p>{lastCommand.command}</p>
                    </div>
                    <div>
                      <p className="font-medium">Target:</p>
                      <p>{lastCommand.target}</p>
                    </div>
                    <div>
                      <p className="font-medium">Action:</p>
                      <p>{lastCommand.action}</p>
                    </div>
                    <div>
                      <p className="font-medium">Timestamp:</p>
                      <p>{new Date(lastCommand.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Value:</p>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px] text-sm">
                      {JSON.stringify(lastCommand.value, null, 2)}
                    </pre>
                  </div>

                  <Button
                    onClick={() => {
                      setJsonString(JSON.stringify(lastCommand, null, 2))
                    }}
                    className="mt-4"
                  >
                    View Full JSON
                  </Button>
                </div>
              ) : (
                <p className="text-center py-4">No command data available</p>
              )}
            </TabsContent>

            <TabsContent value="state">
              {lastState ? (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium">Control Mode:</p>
                      <p className="font-bold text-blue-600">{lastState.controlMode}</p>
                    </div>
                    <div>
                      <p className="font-medium">Timestamp:</p>
                      <p>{new Date(lastState.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium">Poles:</p>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
                      {JSON.stringify(lastState.poles, null, 2)}
                    </pre>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium">Priorities:</p>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[200px] text-sm">
                      {JSON.stringify(lastState.priorities, null, 2)}
                    </pre>
                  </div>

                  <Button
                    onClick={() => {
                      setJsonString(JSON.stringify(lastState, null, 2))
                    }}
                    className="mt-4"
                  >
                    View Full JSON
                  </Button>
                </div>
              ) : (
                <p className="text-center py-4">No state data available</p>
              )}
            </TabsContent>

            <TabsContent value="view">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Raw JSON Data</h3>
                <Button onClick={handleCopyJson} size="sm" className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span>Copy JSON</span>
                </Button>
              </div>
              <div className="border rounded-md p-4 bg-gray-50">
                <pre className="overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-words">
                  {jsonString}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
