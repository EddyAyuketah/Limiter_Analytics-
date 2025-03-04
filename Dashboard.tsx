"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"; // Importing Toggle Switch UI
import { fetchToolData } from "@/lib/api";
import type { ToolData } from "@/types/tool";
import { Table, BarChart3, Grid, AlertCircle, Sun, Moon } from "lucide-react";
import DataTable from "./DataTable";
import TrendVisualization from "./TrendVisualization";
import Heatmap from "./Heatmap";
import ForecastingAndAlerts from "./ForecastingAndAlerts";
import TrendChart from "./Trendchart";
import WikiHow from "./WikiHow";

export default function Dashboard() {
  const [toolData, setToolData] = useState<ToolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWiki, setShowWiki] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark"; // Default theme
  });
  const [showCriticalDropdown, setShowCriticalDropdown] = useState(false);

  // Position state for the draggable popup
  const [popupPosition, setPopupPosition] = useState({ x: 200, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data } = await fetchToolData();
      setToolData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);
  

   // ✅ Calculate Average Limitation
   const validLimitations = toolData.flatMap((tool) =>
    Object.entries(tool)
      .filter(([key, value]) => key.startsWith("ABA_PERCENT_FLAGED_") && typeof value === "number" && !isNaN(value))
      .map(([_, value]) => value * 100)
  );

  const avgLimitation = validLimitations.length
    ? (validLimitations.reduce((sum, value) => sum + value, 0) / validLimitations.length).toFixed(2) + "%"
    : "0.00%";

  // ✅ Filter **only Critical CEIDs** (Any limitation > 81.00%)
  const criticalCEIDs = toolData
    .filter((tool) =>
      Object.entries(tool).some(
        ([key, value]) => key.startsWith("ABA_PERCENT_FLAGED_") && typeof value === "number" && value > 0.8100
      )
    )
    .map((tool) => tool.CEID);

  const criticalCount = criticalCEIDs.length;

  // ✅ Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setOffset({
      x: e.clientX - popupPosition.x,
      y: e.clientY - popupPosition.y,
    });
  };

  // ✅ Handle Dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPopupPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  // ✅ Handle Drag End
  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Header */}
      <header className="border-b bg-blue-900 dark:bg-blue-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white">OTF LAD</h1>
            <p className="text-blue-200">Advanced insights for tool performance and bottleneck detection</p>
          </div>

          {/* 👩‍✈️ Wiki-How Button & Theme Toggle */}
          <div className="flex items-center space-x-6">
            {/* Theme Toggle Switch */}
            <div className="flex items-center space-x-2">
              <Sun className="h-5 w-5 text-yellow-400" />
              <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
              <Moon className="h-5 w-5 text-gray-300" />
            </div>

            {/* Wiki-How Button */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowWiki(!showWiki)}>
              <span className="text-3xl">👩‍✈️</span>
              <span className="text-white text-sm font-semibold">Wiki-How</span>
            </div>
          </div>
        </div>
      </header>

      {/* Wiki-How Section */}
      {showWiki && <WikiHow />}

      <main className="container mx-auto py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total CEIDs */}
          <Card className="bg-blue-500 text-white dark:bg-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toolData.length}</div>
            </CardContent>
          </Card>

          {/* Average Limitation */}
          <Card className="bg-green-500 text-white dark:bg-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Limitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLimitation}</div>
            </CardContent>
          </Card>

          {/* Critical CEIDs (Clickable) */}
          <Card
          className="bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer"
          onClick={() => setShowCriticalDropdown(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical CEIDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalCount}</div>
            </CardContent>
          </Card>
        </div>


        {/* Critical CEIDs Popup (Draggable) */}
        {showCriticalDropdown && (
          <div
            className="absolute bg-white shadow-lg border p-4 rounded-lg max-w-sm cursor-move"
            style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px`, position: "absolute" }}
            onMouseDown={handleMouseDown}
          >
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
              {criticalCEIDs.length > 0 ? (
                criticalCEIDs.map((ceid, index) => (
                  <li key={index} className="text-gray-800 border-b pb-2">
                    {ceid}
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No critical CEIDs found.</p>
              )}
            </ul>
          </div>
        )}

        {/* Tabs for Data Table, Trends, Heatmap, and Forecasting */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList className="bg-blue-100 dark:bg-gray-700 p-1 rounded-lg">
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
          <TabsContent value="trends"><TrendVisualization data={toolData} theme={theme}/></TabsContent>
          <TabsContent value="heatmap"><Heatmap data={toolData} /></TabsContent>
          <TabsContent value="forecasting"><ForecastingAndAlerts data={toolData} theme={theme}/></TabsContent>
          <TabsContent value="trendchart"><TrendChart data={toolData} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
