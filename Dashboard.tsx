"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import DataTable from "./DataTable"
import { fetchToolData } from "@/lib/api" // ✅ Import the API function
import type { ToolData } from "@/types/tool"
import { AlertCircle, Table, BarChart3, Grid, ArrowUp  } from "lucide-react"
import TrendVisualization from "./TrendVisualization"
import Heatmap from "./Heatmap"
import ForecastingAndAlerts from "./ForecastingAndAlerts"

export default function Dashboard() {
  const [toolData, setToolData] = useState<ToolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMockData, setIsMockData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const { data, isMockData, error } = await fetchToolData() // ✅ Fetch Data
      setToolData(data)
      setIsMockData(isMockData)
      setError(error)
      setIsLoading(false)
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

  const avgLimitation = toolData.length
    ? (
        toolData.reduce((acc, tool) => {
          // trying to ensure limitations exist and is an object before reducing 
          const limitations = tool.limitations || {};
          const values = Object.values(limitations);
          return acc + (values.length ? values.reduce ((sum, val) => sum + val, 0) / values.length : 0);
        }, 0) / toolData.length
      ).toFixed(2)
    : "0.00";

  const criticalTools = toolData.filter((tool) => {
    const limitations = tool.limitations || {};
    return Object.values(limitations).some((val) => val > 80);
  }).length;

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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolData.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Limitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLimitation}%</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalTools}</div>
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
              Trend Visualizationn
            </TabsTrigger>

            <TabsTrigger value="heatmap" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Grid className="mr-2 h-4 w-4" />
              Heat Map
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
                <DataTable data={toolData} /> {/* ✅ Pass API data to DataTable */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          <Tabs defaultValue="table" className="space-y-4">
            <TabsList className="bg-blue-100 p-1 rounded-lg">
              <TabsTrigger value="trend" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Trend Visualization
              </TabsTrigger>
            </TabsList>

            {/* ✅ Ensure this section exists for Data Table */}
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

            {/* ✅ FIX: Add this missing section for Trend Visualization */}
            <TabsContent value="trend">
              <Card>
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800">Trend Visualization</CardTitle>
                  <CardDescription className="text-green-600">
                    Visualize CEID limitation trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendVisualization data={toolData} />
                </CardContent>
              </Card>
            </TabsContent>









            <Tabs defaultValue="table" className="space-y-4">
              <TabsList className="bg-blue-100 p-1 rounded-lg">
                <TabsTrigger value="table" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Table className="mr-2 h-4 w-4" />
                  Data Table
                </TabsTrigger>
                <TabsTrigger value="trend" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Trend Visualization
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <Grid className="mr-2 h-4 w-4" />
                  Heatmap
                </TabsTrigger>
              </TabsList>

              {/* ✅ Ensure this section exists for Data Table */}
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

              {/* ✅ Ensure Trend Visualization is correctly displayed */}
              <TabsContent value="trend">
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-800">Trend Visualization</CardTitle>
                    <CardDescription className="text-green-600">
                      Visualize CEID limitation trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TrendVisualization data={toolData} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ✅ FIX: Add this missing section for Heatmap */}
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
            </Tabs>












          <TabsContent value="forecasting">
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">
                  Forcasting & Anomaly Detection
                </CardTitle>
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
