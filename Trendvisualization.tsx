"use client";

import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ToolData } from "@/types/tool";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TrendVisualizationProps {
  data: ToolData[];
}

const colorPalette = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(0, 204, 150, 1)",
  "rgba(255, 0, 255, 1)",
  "rgba(0, 255, 255, 1)",
  "rgba(128, 0, 0, 1)",
];

export default function TrendVisualization({ data }: TrendVisualizationProps) {
  const [selectedCEIDs, setSelectedCEIDs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Extract time period keys dynamically
  const sampleTool = data.length > 0 ? data[0] : null;
  const timePeriods = sampleTool
    ? Object.keys(sampleTool).filter((key) => key.includes("ABA_PERCENT_FLAGED"))
    : [];

  // Prepare chart data with useMemo to optimize performance
  const chartData = useMemo(() => ({
    labels: timePeriods.map((key) => key.replace("ABA_PERCENT_FLAGED_", "").replace("DAYS", " Days")),
    datasets: selectedCEIDs.map((CEID, index) => {
      const tool = data.find((t) => t.CEID === CEID);
      return {
        label: CEID,
        data: timePeriods.map((key) => ((tool as any)?.[key] ?? 0) * 100), // Convert to percentage
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length].replace("1)", "0.2)"),
        tension: 0.1,
        fill: true,
      };
    }),
  }), [selectedCEIDs, data, timePeriods]);

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "CEID Limitation Trends",
        font: {
          size: 18,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Percentage (%)",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Time Period (days)",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
    },
  };

  // Filtered CEIDs based on search term
  const filteredCEIDs = data
    .map((tool) => tool.CEID)
    .filter((ceid) => ceid.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search CEIDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2 overflow-y-auto max-h-40 border border-gray-300 p-2 rounded-md">
        {filteredCEIDs.length > 0 ? (
          filteredCEIDs.map((CEID) => (
            <button
              key={CEID}
              onClick={() =>
                setSelectedCEIDs((prev) =>
                  prev.includes(CEID) ? prev.filter((t) => t !== CEID) : [...prev, CEID]
                )
              }
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                selectedCEIDs.includes(CEID)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {CEID}
            </button>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No matching CEIDs found.</p>
        )}
      </div>

      {selectedCEIDs.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">Select a CEID to view trends.</p>
      )}
    </div>
  );
}
