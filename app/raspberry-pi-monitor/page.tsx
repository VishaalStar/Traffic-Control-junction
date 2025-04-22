import RaspberryPiMonitor from "@/components/raspberry-pi-monitor"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Settings, Activity, Cpu, FileJson, Radio, Monitor } from "lucide-react"

export default function RaspberryPiMonitorPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Raspberry Pi Monitor</h1>
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
          <Link href="/raspberry-pi-monitor">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Pi Monitor</span>
            </Button>
          </Link>
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
      <RaspberryPiMonitor />
    </main>
  )
}
