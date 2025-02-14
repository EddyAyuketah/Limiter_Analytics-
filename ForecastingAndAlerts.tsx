"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { ToolData } from "@/types/tool"

interface ForecastingAndAlertsProps {
  data: ToolData[]
}

export default function ForecastingAndAlerts({ data }: ForecastingAndAlertsProps) {
  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {
    const newAlerts: string[] = []

    data.forEach((tool) => {
      const limitations = Object.values(tool.limitations)
      const latestLimitation = limitations[limitations.length - 1]

      // Alert for CEIDs exceeding 80% limitation
      if (latestLimitation > 80) {
        newAlerts.push(`${tool.CEID} has exceeded 80% limitation (${latestLimitation})`)
      }

      // Alert for CEIDs with consistent upward trend
      const isIncreasing = limitations.every((val, i, arr) => i === 0 || val >= arr[i - 1])
      if (isIncreasing && limitations[limitations.length - 1] - limitations[0] > 20) {
        newAlerts.push(`${tool.CEID} shows a consistent upward trend`)
      }

      // Simple linear regression for forecasting
      const x = Object.keys(tool.limitations).map(Number)
      const y = limitations
      const n = x.length

      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
      const sumXX = x.reduce((total, xi) => total + xi * xi, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      const forecast = slope * (Math.max(...x) + 30) + intercept

      if (forecast > 90) {
        newAlerts.push(`${tool.CEID} is projected to exceed 90% limitation in the next 30 days`)
      }
    })

    setAlerts(newAlerts)
  }, [data])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Alerts</h3>
      {alerts.length === 0 ? (
        <p>No critical alerts at this time.</p>
      ) : (
        alerts.map((alert, index) => (
          <Alert key={index} className="mb-4">
            <AlertTitle className="flex items-center">
              Critical Alert
              <Badge variant="destructive" className="ml-2">
                High Priority
              </Badge>
            </AlertTitle>
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        ))
      )}
    </div>
  )
}

