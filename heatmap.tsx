"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ToolData } from "@/types/tool";

interface HeatmapProps {
  data: ToolData[];
}

export default function Heatmap({ data }: HeatmapProps) {
  if (data.length === 0) {
    return <p className="text-center text-gray-600">No data available</p>;
  }

  // ✅ Ensure correct period selection
  const availablePeriods = Object.keys(data[0].limitations || {}).map((key) => key.trim()); // Trim spaces
  const [selectedPeriod, setSelectedPeriod] = useState<string>(availablePeriods[0] || "3");

  // ✅ Function to get color dynamically
  const getColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return "bg-gray-300"; // No Data
    if (value >= 90) return "bg-red-600"; // High Risk
    if (value >= 75) return "bg-orange-500"; // Medium Risk
    if (value >= 50) return "bg-yellow-400"; // Warning
    return "bg-green-500"; // Safe
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* 🔹 Header & Selector */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">🔥 CEID Heatmap</h3>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period} Days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 🔹 Heatmap Grid */}
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 p-4 border rounded-lg bg-gray-100">
          {data.map((tool) => {
            const limitationValue = tool.limitations?.[selectedPeriod]; // ✅ Match API key exactly
            return (
              <Tooltip key={tool.CEID}>
                <TooltipTrigger>
                  <div
                    className={`w-16 h-16 text-xs font-semibold flex items-center justify-center rounded-lg shadow-md cursor-pointer ${getColor(
                      limitationValue
                    )}`}
                  >
                    {tool.CEID}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>{tool.CEID}</strong>:{" "}
                    {limitationValue !== undefined ? `${limitationValue.toFixed(2)}%` : "No Data"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* 🔹 Legend */}
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div> Safe (0-49%)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400"></div> Warning (50-74%)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500"></div> Medium Risk (75-89%)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600"></div> High Risk (90%+)
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
