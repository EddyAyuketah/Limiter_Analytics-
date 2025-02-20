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

  // ✅ Extract available time periods dynamically
  const availablePeriods = Object.keys(data[0]).filter((key) => key.includes("ABA_PERCENT_FLAGED"));
  const [selectedPeriod, setSelectedPeriod] = useState<string>(availablePeriods[0] || "ABA_PERCENT_FLAGED_3DAYS");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Function to get dynamic color scale based on risk level
  const getColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return "bg-gray-300"; // No Data
    if (value >= 90) return "bg-red-600"; // High Risk
    if (value >= 75) return "bg-orange-500"; // Medium Risk
    if (value >= 50) return "bg-yellow-400"; // Warning
    return "bg-green-500"; // Safe
  };

  // ✅ Filter CEIDs dynamically based on search input
  const filteredData = data.filter((tool) => tool.CEID.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* 🔹 Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold">🔥 CEID Heatmap</h3>

          {/* 🔹 Period Selector */}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period.replace("ABA_PERCENT_FLAGED_", "").replace("DAYS", " Days")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 🔹 Search CEID Input */}
          <input
            type="text"
            placeholder="Search CEID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px] p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* 🔹 Heatmap Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 p-4 border rounded-lg bg-gray-100">
          {filteredData.length > 0 ? (
            filteredData.map((tool) => {
              const limitationValue = (tool as any)?.[selectedPeriod] ?? 0; // ✅ Extract correct value
              return (
                <Tooltip key={tool.CEID}>
                  <TooltipTrigger>
                    <div
                      className={`w-16 h-16 text-xs font-semibold flex items-center justify-center rounded-lg shadow-md cursor-pointer ${getColor(
                        limitationValue * 100 // ✅ Convert decimal to percentage
                      )}`}
                    >
                      {tool.CEID}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <strong>{tool.CEID}</strong>: {limitationValue !== undefined ? `${(limitationValue * 100).toFixed(2)}%` : "No Data"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })
          ) : (
            <p className="col-span-full text-gray-500 text-center">No matching CEIDs found.</p>
          )}
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
