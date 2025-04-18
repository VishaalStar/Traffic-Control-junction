"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { jsonService, type ControlModeSettings } from "@/lib/json-service"
import Link from "next/link"
import { Home, Activity, FileJson, Radio } from "lucide-react"

export default function ControlSettingsPage() {
  const [settings, setSettings] = useState<ControlModeSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load settings from the JSON service
    const controlModeSettings = jsonService.getControlModeSettings()
    setSettings(controlModeSettings)
  }, [])

  const handleSave = () => {
    if (!settings) return

    setIsSaving(true)

    try {
      // Update settings in the JSON service
      jsonService.updateControlModeSettings(settings)

      toast({
        title: "Settings Saved",
        description: "Control mode settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save control mode settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!settings) {
    return <div>Loading settings...</div>
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Control Mode Settings</h1>
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
          <Link href="/json-viewer">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON Data</span>
            </Button>
          </Link>
          <Link href="/control-settings">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Radio className="h-4 w-4" />
              <span className="hidden sm:inline">Control Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="auto">
        <TabsList className="mb-4">
          <TabsTrigger value="auto">Auto Control</TabsTrigger>
          <TabsTrigger value="manual">Manual Control</TabsTrigger>
          <TabsTrigger value="semi">Semi Control</TabsTrigger>
        </TabsList>

        <TabsContent value="auto">
          <Card>
            <CardHeader>
              <CardTitle>Auto Control Mode Settings</CardTitle>
              <CardDescription>Configure how the system behaves when in automatic control mode.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-enabled"
                  checked={settings.auto.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      auto: {
                        ...settings.auto,
                        enabled: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="auto-enabled">Enable Auto Control Mode</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-description">Description</Label>
                <Textarea
                  id="auto-description"
                  value={settings.auto.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      auto: {
                        ...settings.auto,
                        description: e.target.value,
                      },
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-cycle-time">Cycle Time (seconds)</Label>
                <Input
                  id="auto-cycle-time"
                  type="number"
                  value={settings.auto.cycleTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      auto: {
                        ...settings.auto,
                        cycleTime: Number(e.target.value),
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  The time in seconds for a complete cycle through all routes in the sequence.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-default-sequence">Default Sequence</Label>
                <Input
                  id="auto-default-sequence"
                  value={settings.auto.defaultSequence}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      auto: {
                        ...settings.auto,
                        defaultSequence: e.target.value,
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Enter route numbers separated by commas (e.g., 1,2,3,4,5).
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Auto Control Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Control Mode Settings</CardTitle>
              <CardDescription>Configure how the system behaves when in manual control mode.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-enabled"
                  checked={settings.manual.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      manual: {
                        ...settings.manual,
                        enabled: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="manual-enabled">Enable Manual Control Mode</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-description">Description</Label>
                <Textarea
                  id="manual-description"
                  value={settings.manual.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      manual: {
                        ...settings.manual,
                        description: e.target.value,
                      },
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-default-pole">Default Pole</Label>
                <Select
                  value={settings.manual.defaultPole}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      manual: {
                        ...settings.manual,
                        defaultPole: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="manual-default-pole">
                    <SelectValue placeholder="Select a pole" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1</SelectItem>
                    <SelectItem value="P2">P2</SelectItem>
                    <SelectItem value="P3">P3</SelectItem>
                    <SelectItem value="P4">P4</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The pole that will be selected by default when entering manual mode.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-require-confirmation"
                  checked={settings.manual.requireConfirmation}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      manual: {
                        ...settings.manual,
                        requireConfirmation: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="manual-require-confirmation">Require Confirmation for Changes</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Manual Control Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="semi">
          <Card>
            <CardHeader>
              <CardTitle>Semi-Automatic Control Mode Settings</CardTitle>
              <CardDescription>Configure how the system behaves when in semi-automatic control mode.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="semi-enabled"
                  checked={settings.semi.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      semi: {
                        ...settings.semi,
                        enabled: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="semi-enabled">Enable Semi-Automatic Control Mode</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semi-description">Description</Label>
                <Textarea
                  id="semi-description"
                  value={settings.semi.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      semi: {
                        ...settings.semi,
                        description: e.target.value,
                      },
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semi-assist-level">Assist Level</Label>
                <Select
                  value={settings.semi.assistLevel}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setSettings({
                      ...settings,
                      semi: {
                        ...settings.semi,
                        assistLevel: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="semi-assist-level">
                    <SelectValue placeholder="Select assist level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The level of assistance provided by the system in semi-automatic mode.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semi-override-timeout">Override Timeout (seconds)</Label>
                <Input
                  id="semi-override-timeout"
                  type="number"
                  value={settings.semi.overrideTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      semi: {
                        ...settings.semi,
                        overrideTimeout: Number(e.target.value),
                      },
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  The time in seconds before the system returns to automatic control after a manual override.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Semi-Automatic Control Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Control Modes Overview</CardTitle>
            <CardDescription>
              Understanding the different control modes available in the traffic junction system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Auto Control Mode</h3>
                <p>
                  In Auto Control mode, the system automatically cycles through predefined sequences of traffic light
                  patterns based on configured time zones. This mode requires minimal operator intervention and is ideal
                  for normal traffic conditions.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>System follows predefined timing sequences</li>
                  <li>Automatically adjusts based on time of day settings</li>
                  <li>Cycles through routes in the sequence defined for each time zone</li>
                  <li>No manual intervention required</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Manual Control Mode</h3>
                <p>
                  Manual Control mode gives operators complete control over all traffic signals. This mode is useful
                  during special events, emergencies, or when traffic patterns require direct human intervention.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full control over individual signals</li>
                  <li>Ability to override normal sequences</li>
                  <li>Useful for handling unusual traffic situations</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Semi-Automatic Control Mode</h3>
                <p>
                  Semi-Automatic Control mode combines aspects of both automatic and manual control. The system follows
                  automatic sequences but allows operators to make temporary adjustments when needed.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Automatic operation with manual override capability</li>
                  <li>System returns to automatic mode after a set timeout</li>
                  <li>Balances efficiency with flexibility</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
