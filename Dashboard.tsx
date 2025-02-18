"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchToolData } from "@/lib/api";
import type { ToolData } from "@/types/tool";
import { AlertCircle, Table, BarChart3, Grid } from "lucide-react";
import DataTable from "./DataTable";
import TrendVisualization from "./TrendVisualization";
import Heatmap from "./Heatmap";
import ForecastingAndAlerts from "./ForecastingAndAlerts";

export default function Dashboard() {
  const [toolData, setToolData] = useState<ToolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data, isMockData, error } = await fetchToolData();
      
      console.log("🚀 API Response:", JSON.stringify(data, null, 2)); // ✅ Log full API response
      
      setToolData(data);
      setIsMockData(isMockData);
      setError(error);
      setIsLoading(false);
    };
    loadData();
  }, []);

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
    );
  }

  const avgLimitation = toolData.length
  ? (
      toolData.reduce((acc, tool) => {
        const limitations = tool.limitations || {};
        const values = Object.values(limitations)
          .filter(val => typeof val === "number" && !isNaN(val)) // Ensure valid numbers
          .map(val => val * 100); // Convert from decimal to percentage

        return acc + (values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0);
      }, 0) / toolData.length
    ).toFixed(2) + "%"
  : "0.00%";


console.log("Final Average Limitation:", avgLimitation);

  const criticalTools = toolData.filter((tool) => {
    const limitations = tool.limitations || {};
    return Object.values(limitations).some((val) => val > 80);
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-blue-900">
        <div className="container mx-auto py-6">
          <h1 className="text-4xl font-bold text-white">1278 Limiter Analytics Dashboard</h1>
          <p className="text-blue-200">Advanced insights for tool performance and bottleneck detection</p>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Alert for mock data */}
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total CEIDs */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolData.length}</div>
            </CardContent>
          </Card>

          {/* Average Limitation */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Limitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLimitation}</div>
            </CardContent>
          </Card>

          {/* Critical CEIDs */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalTools}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Data Table, Trends, Heatmap, and Forecasting */}
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
            <TabsTrigger value="forecasting" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <AlertCircle className="mr-2 h-4 w-4" />
              Forecasting & Alerts
            </TabsTrigger>
          </TabsList>

          {/* Data Table */}
          <TabsContent value="table">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">Interactive Data Table</CardTitle>
                <CardDescription className="text-blue-600">Sort, filter, and analyze CEID limitation data</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trend Visualization */}
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

          {/* Heatmap */}
          <TabsContent value="heatmap">
            <Card>
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">Limitation Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecasting & Alerts */}
          <TabsContent value="forecasting">
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">Forecasting & Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastingAndAlerts data={toolData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
