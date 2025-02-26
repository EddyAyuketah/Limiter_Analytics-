"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchToolData } from "@/lib/api";
import type { ToolData } from "@/types/tool";
import { AlertCircle, Table, BarChart3, Grid, User } from "lucide-react";
import DataTable from "./DataTable";
import TrendVisualization from "./TrendVisualization";
import Heatmap from "./Heatmap";
import ForecastingAndAlerts from "./ForecastingAndAlerts";
import TrendChart from "./Trendchart";
import WikiHow from "./WikiHow"; 

export default function Dashboard() {
  const [toolData, setToolData] = useState<ToolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWiki, setShowWiki] = useState(false); // State to show/hide Wiki section
  const [showCriticalDropdown , setShowCriticalDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data, isMockData, error } = await fetchToolData();
      console.log("🚀 API Response:", JSON.stringify(data, null, 2)); // Debugging
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

  // ✅ Calculate Average Limitation
  const validLimitations = toolData.flatMap((tool) =>
    Object.entries(tool)
      .filter(([key, value]) => key.startsWith("ABA_PERCENT_FLAGED_") && typeof value === "number" && !isNaN(value))
      .map(([_, value]) => value * 100)
  );

  const avgLimitation = validLimitations.length
    ? (validLimitations.reduce((sum, value) => sum + value, 0) / validLimitations.length).toFixed(2) + "%"
    : "0.00%";

  // ✅ Count Critical CEIDs (Any limitation > 81.00%)
  const criticalCEIDs = toolData
  const criticalTools = toolData.filter((tool) =>
    Object.entries(tool).some(
      ([key, value]) => key.startsWith("ABA_PERCENT_FLAGED_") && typeof value === "number" && value > 0.8100
    )
  ).length;

  const criticalCount = criticalCEIDs.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-blue-900">
        <div className="container mx-auto py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">1274 Limiter Analytics Dashboard</h1>
            <p className="text-blue-200">Advanced insights for tool performance and bottleneck detection</p>
          </div>

          {/* 👩‍✈️ Wiki-How Button (Top Right Corner) */}
          <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowWiki(!showWiki)}>
            <span className="text-3xl">👩‍✈️</span>
            <span className="text-white text-sm font-semibold">Wiki-How</span>
          </div>
        </div>
      </header>

      {/* Wiki-How Section */}
      {showWiki && <WikiHow />}

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
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white cusor-pointer"
          onClick={() => setShowCriticalDropdown(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalTools}</div>
            </CardContent>
          </Card>
        </div>

        {/* Critical CEIDs Dropdown (Only appears when clicked) */}
        {showCriticalDropdown && (
          <div className="absolute top-20 right-10 bg-white shadow-lg border p-4 rounded-lg max-w-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">🚨 Critical CEIDs</h3>
              <button
                onClick={() => setShowCriticalDropdown(false)}
                className="text-gray-600 hover:text-red-600 font-bold text-lg"
              >
                ❌
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {criticalCEIDs.map((ceid, index) => (
                <li key={index} className="text-gray-800 border-b pb-2">
                  {ceid}
                </li>
              ))}
            </ul>
          </div>
        )}


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
            <TabsTrigger value="trendchart" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <AlertCircle className="mr-2 h-4 w-4" />
              14 day trend chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table"><DataTable data={toolData} /></TabsContent>
          <TabsContent value="trends"><TrendVisualization data={toolData} /></TabsContent>
          <TabsContent value="heatmap"><Heatmap data={toolData} /></TabsContent>
          <TabsContent value="forecasting"><ForecastingAndAlerts data={toolData} /></TabsContent>
          <TabsContent value="trendchart"><TrendChart data={toolData} /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
