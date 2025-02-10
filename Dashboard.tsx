"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import DataTable from "./DataTable"
import TrendVisualization from "./TrendVisualization"
import Heatmap from "./Heatmap"
import ForecastingAndAlerts from "./ForecastingAndAlerts"
import { fetchToolData } from "@/lib/api"
import type { ToolData } from "@/types/tool"
import { AlertCircle, BarChart3, Grid, Table, ArrowUp } from "lucide-react"

export default function Dashboard() {
  const [toolData, setToolData] = useState<ToolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMockData, setIsMockData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const { data, isMockData, error } = await fetchToolData()
        setToolData(data)
        setIsMockData(isMockData)
        if (error) {
          setError(error)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setIsMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  const avgLimitation = (
    toolData.reduce(
      (acc, tool) =>
        acc + Object.values(tool.limitations).reduce((sum, val) => sum + val, 0) / Object.keys(tool.limitations).length,
      0,
    ) / toolData.length
  ).toFixed(2)
  const criticalTools = toolData.filter((tool) => Object.values(tool.limitations).some((val) => val > 80)).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-blue-900">
        <div className="container mx-auto py-6">
          <h1 className="text-4xl font-bold text-white">1278 Limiter Analytics Dashboard</h1>
          <p className="text-blue-200">Advanced insights for tool performance and bottleneck detection</p>
        </div>
      </header>
      <main className="container mx-auto py-8">
        {isMockData && (
          <Alert className="mb-8 border-orange-500 bg-orange-100 text-orange-900">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertTitle className="text-orange-700">Demo Mode</AlertTitle>
            <AlertDescription className="text-orange-600">
              {error
                ? `Unable to access the database: ${error}. Using mock data for demonstration.`
                : "Unable to access the database. This dashboard is currently using mock data for demonstration purposes."}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CEIDs</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-blue-200"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolData.length}</div>
              <p className="text-xs text-blue-200">
                <ArrowUp className="inline mr-1 h-4 w-4" />
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Limitation</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-green-200"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLimitation}%</div>
              <p className="text-xs text-green-200">
                <ArrowUp className="inline mr-1 h-4 w-4" />
                +1.2% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical CEIDs</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalTools}</div>
              <p className="text-xs text-orange-200">
                <ArrowUp className="inline mr-1 h-4 w-4" />
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-purple-200"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.5</div>
              <p className="text-xs text-purple-200">
                <ArrowUp className="inline mr-1 h-4 w-4" />
                +0.3 points from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="bg-blue-100 p-1 rounded-lg">
            <TabsTrigger value="table" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Table className="mr-2 h-4 w-4" />
              Data Table
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <BarChart3 className="mr-2 h-4 w-4" />
              Trend Visualization
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Grid className="mr-2 h-4 w-4" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger
              value="forecasting"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Forecasting & Alerts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">Interactive Data Table</CardTitle>
                <CardDescription className="text-blue-600">
                  Sort, filter, and analyze CEID limitation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trends">
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">Trend Visualization</CardTitle>
                <CardDescription className="text-green-600">Visualize CEID limitation trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendVisualization data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="heatmap">
            <Card>
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">Limitation Heatmap</CardTitle>
                <CardDescription className="text-orange-600">
                  Quickly identify critical CEIDs and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heatmap data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="forecasting">
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">Forecasting & Anomaly Detection</CardTitle>
                <CardDescription className="text-purple-600">
                  Predict future bottlenecks and detect anomalies for CEIDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForecastingAndAlerts data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

