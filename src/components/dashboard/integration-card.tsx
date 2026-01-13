"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RefreshCw, Link2 } from "lucide-react"

type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING"

interface IntegrationCardProps {
  name: string
  icon: React.ReactNode
  description: string
  status: ConnectionStatus
  lastSync?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onSync?: () => void
  isMock?: boolean
}

export function IntegrationCard({
  name,
  icon,
  description,
  status,
  lastSync,
  onConnect,
  onDisconnect,
  onSync,
  isMock,
}: IntegrationCardProps) {
  const isConnected = status === "CONNECTED"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{name}</h3>
              {isMock && (
                <Badge variant="secondary" className="text-xs">
                  Demo
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>

            {/* Status */}
            <div className="mt-3 flex items-center gap-2">
              {status === "CONNECTED" && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              )}
              {status === "DISCONNECTED" && (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
              {status === "ERROR" && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Error
                </Badge>
              )}
              {status === "PENDING" && (
                <Badge variant="warning" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Connecting...
                </Badge>
              )}

              {lastSync && isConnected && (
                <span className="text-xs text-muted-foreground">
                  Last sync: {lastSync}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="text-muted-foreground"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onConnect} className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
