"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ToolData } from "@/types/tool"

interface HeatmapProps {
  data: ToolData[]
}

export default function Heatmap({ data }: HeatmapProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("91")

  const getColor = (value: number) => {
    const hue = ((100 - value) * 120) / 100
    return `hsl(${hue}, 100%, 50%)`
  }

  return (
    <div>
      <div className="mb-4">
        <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(data[0].limitations).map((period) => (
              <SelectItem key={period} value={period}>
                {period} days
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {data.map((tool) => (
          <div
            key={tool.CEID}
            className="aspect-square p-2 text-xs font-semibold text-white flex items-center justify-center"
            style={{
              backgroundColor: getColor(tool.limitations[selectedPeriod]),
            }}
            title={`${tool.CEID}: ${tool.limitations[selectedPeriod]}`}
          >
            {tool.CEID.slice(0, 2)}
          </div>
        ))}
      </div>
    </div>
  )
}

