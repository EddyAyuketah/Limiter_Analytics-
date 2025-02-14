"use client"

import { useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import type { ToolData } from "@/types/tool"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TrendVisualizationProps {
  data: ToolData[]
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
]

export default function TrendVisualization({ data }: TrendVisualizationProps) {
  const [selectedCEIDs, setSelectedCEIDs] = useState<string[]>([])

  const chartData = {
    labels: Object.keys(data[0].limitations),
    datasets: selectedCEIDs.map((CEID, index) => {
      const tool = data.find((t) => t.CEID === CEID)
      return {
        label: CEID,
        data: Object.values(tool?.limitations || {}),
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length].replace("1)", "0.2)"),
        tension: 0.1,
        fill: true,
      }
    }),
  }

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
          text: "Limitation Count",
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
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {data.map((tool) => (
          <button
            key={tool.CEID}
            onClick={() =>
              setSelectedCEIDs((prev) =>
                prev.includes(tool.CEID) ? prev.filter((t) => t !== tool.CEID) : [...prev, tool.CEID],
              )
            }
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              selectedCEIDs.includes(tool.CEID)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tool.CEID}
          </button>
        ))}
      </div>
      <Line data={chartData} options={options} />
    </div>
  )
}

