/* My aCTUAL COADE */

/* My aCTUAL COADE */

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

// Register necessary chart components
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
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedProcess, setSelectedProcess] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"CEID" | "Area">("CEID"); // Toggle between CEID and Area
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]); // Stores selected areas in Area mode
  



  // Dynamically extract time periods from the data
  const sampleTool = data.length > 0 ? data[0] : null;
  const timePeriods = sampleTool
    ? Object.keys(sampleTool).filter((key) => key.includes("ABA_PERCENT_FLAGED"))
    : [];

  // 🔍 Get unique AREA values for the dropdown filter
  const uniqueAreas = useMemo(() => {
    const areas = new Set(data.map((tool) => tool.AREA));
    return ["All", ...Array.from(areas)];
  }, [data]);

  // 🔍 Define available PROCESS values for filtering
  const availableProcesses = ["All", "1274", "1278", "5053"];

  // 🔍 Filter CEIDs based on AREA and PROCESS selection
  const filteredData = useMemo(() => {
    return data.filter((tool) => {
      const areaMatch =
        viewMode === "CEID"
          ? selectedArea === "All" || tool.AREA === selectedArea
          : selectedAreas.includes(tool.AREA);
      const processMatch = selectedProcess === "All" || tool.PROCESS.toString() === selectedProcess;
      return areaMatch && processMatch;
    });
  }, [data, selectedArea, selectedProcess, selectedAreas, viewMode]);

  // ✅ Prepare chart data dynamically
  const chartData = useMemo(() => {
    if (viewMode === "CEID") {
      return {
        labels: timePeriods.map((key) => key.replace("ABA_PERCENT_FLAGED_", "").replace("DAYS", " Days")),
        datasets: selectedCEIDs.map((CEID, index) => {
          const tool = filteredData.find((t) => t.CEID === CEID);
          return {
            label: CEID,
            data: timePeriods.map((key) => ((tool as any)?.[key] ?? 0) * 100),
            borderColor: colorPalette[index % colorPalette.length],
            backgroundColor: colorPalette[index % colorPalette.length].replace("1)", "0.2)"),
            tension: 0.1,
            fill: true,
          };
        }),
      };
    } else {
      // Aggregate all CEIDs under each selected area
      const areaPerformanceData: { [area: string]: number[] } = {};
  
      selectedAreas.forEach((area) => {
        const toolsInArea = filteredData.filter((tool) => tool.AREA === area);
  
        // Compute the average performance for all tools in the area
        const averageValues = timePeriods.map((key) => {
          const totalValue = toolsInArea.reduce((sum, tool) => sum + ((tool as any)?.[key] ?? 0), 0);
          return toolsInArea.length > 0 ? (totalValue / toolsInArea.length) * 100 : 0; // Compute average
        });
  
        areaPerformanceData[area] = averageValues;
      });
  
      return {
        labels: timePeriods.map((key) => key.replace("ABA_PERCENT_FLAGED_", "").replace("DAYS", " Days")),
        datasets: Object.keys(areaPerformanceData).map((area, index) => ({
          label: `${area} (Overall)`, // Label as "Overall Performance"
          data: areaPerformanceData[area],
          borderColor: colorPalette[index % colorPalette.length],
          backgroundColor: colorPalette[index % colorPalette.length].replace("1)", "0.2)"),
          tension: 0.1,
          fill: true,
        })),
      };
    }
  }, [selectedCEIDs, filteredData, timePeriods, viewMode, selectedAreas]);
  // ✅ Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `CEID Limitation Trends ${selectedArea !== "All" ? ` - ${selectedArea}` : ""} ${selectedProcess !== "All" ? ` - Process ${selectedProcess}` : ""}`,
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

  // 🔍 Filter CEIDs based on search term and selected filters
  const filteredCEIDs = filteredData
    .map((tool) => tool.CEID)
    .filter((ceid) => ceid.toLowerCase().includes(searchTerm.toLowerCase()));

  return (

    
    <div className="w-full p-4">
      <div className="mb-4 flex items-center gap-4">
  <span className="text-sm font-medium">View By:</span>
  <button
    className={`px-3 py-1 rounded-md ${viewMode === "CEID" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
    onClick={() => setViewMode("CEID")}
  >
    CEID
  </button>
  <button
    className={`px-3 py-1 rounded-md ${viewMode === "Area" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
    onClick={() => setViewMode("Area")}
  >
    Area
  </button>
</div>
      {/* Filters Row: Area & Process on the same line */}
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        
        
        {/* Process Filter */}

        <div className="flex-1">
          <label htmlFor="processFilter" className="block text-sm font-medium text-gray-700">
            Filter by Process:
          </label>
          <select
            id="processFilter"
            value={selectedProcess}
            onChange={(e) => {
              setSelectedProcess(e.target.value);
              setSelectedCEIDs([]); // Reset selected CEIDs on process change
            }}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            {availableProcesses.map((process) => (
              <option key={process} value={process}>
                {process}
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div className="flex-1">
          <label htmlFor="areaFilter" className="block text-sm font-medium text-gray-700">
            Filter by Area:
          </label>
          {viewMode === "CEID" ? (
            <select
              id="areaFilter"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedCEIDs([]);
              }}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          ) : (
            <div className="max-h-40 overflow-y-auto border border-gray-300 p-2 rounded-md">
              {uniqueAreas.filter(area => area !== "All").map((area) => (
                <div key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() =>
                    setSelectedAreas((prev) =>
                      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
                    )}
                  />
                  <label>{area}</label>
                </div>
              ))}
            </div>
          )}
        </div>



      </div>

      {/* CEID Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search CEIDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* CEID Selection Buttons */}
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

      {/* Trend Chart Display */}
      {selectedCEIDs.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">Select a CEID to view trends.</p>
      )}
    </div>
  );
}
