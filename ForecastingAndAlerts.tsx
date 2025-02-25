"use client";

import { useState, useEffect } from "react";
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
import zoomPlugin from "chartjs-plugin-zoom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ToolData } from "@/types/tool";

// ✅ Register ChartJS & Zoom Plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// ✅ Function to calculate Exponential Moving Average (EMA) for forecasting
// EMA = (smoothing faxtor * current factor )  + ((1 - smoothing factor ) * previouse EMA)
const calculateEMA = (values: number[], smoothingFactor = 0.2): number[] => {
  return values.reduce((emaArr, value, index) => {
    if (index === 0) return [value];
    const previousEMA = emaArr[index - 1];
    const newEMA = smoothingFactor * value + (1 - smoothingFactor) * previousEMA;
    return [...emaArr, newEMA];
  }, [] as number[]);
};

export default function ForecastingAndAlerts({ data }: { data: ToolData[] }) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [futureAlertThreshold, setFutureAlertThreshold] = useState<number>(90);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const newAlerts: string[] = [];
    const forecastDataset: any[] = [];

    // ✅ Extract limitation keys from the first available tool
    const firstToolWithData = data.find((tool) => tool && Object.keys(tool).some((key) => key.includes("ABA_PERCENT_FLAGED")));
    const limitationKeys: string[] = firstToolWithData
      ? Object.keys(firstToolWithData).filter((key) => key.includes("ABA_PERCENT_FLAGED"))
      : [];

    // ✅ Identify the Top 20 Most Critical CEIDs (by highest limitation)
    const sortedCriticalCEIDs = [...data]
      .map((tool) => ({
        ceid: tool.CEID,
        currentMax: Math.max(...limitationKeys.map((key) => ((tool as any)[key] ?? 0) * 100)),
      }))
      .sort((a, b) => b.currentMax - a.currentMax)
      .slice(0, 20)
      .map((entry) => entry.ceid);

    data.forEach((tool, index) => {
      if (!tool || !tool.CEID) return;

      const limitations: number[] = limitationKeys.map((key: string) => ((tool as any)[key] ?? 0) * 100);
      if (limitations.length === 0) return;

      const latestLimitation = limitations[limitations.length - 1];

      // ✅ Detect high limitation values (Immediate Alert)
      if (latestLimitation > alertThreshold) {
        newAlerts.unshift( // 🔥 Puts the most critical alerts at the top
          `⚠️ **Critical:** ${tool.CEID} exceeded ${alertThreshold}% (Current: ${latestLimitation.toFixed(2)}%)`
        );
      }

      // ✅ Detect trends (Consistently increasing over time)
      const isIncreasing = limitations.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
      if (isIncreasing && latestLimitation - limitations[0] > 15) {
        newAlerts.push(
          `📈 **Trend Alert:** ${tool.CEID} has been rising steadily for weeks!`
        );
      }

      // ✅ Detect future risk predictions
      const forecastedLimitations = calculateEMA(limitations);
      const futurePrediction = forecastedLimitations[forecastedLimitations.length - 1] * 1.1;
      const estimatedDaysToBreach = futureAlertThreshold / (futurePrediction / 30);

      if (futurePrediction > futureAlertThreshold) {
        newAlerts.push(
          `🔮 **Prediction:** ${tool.CEID} will likely exceed ${futureAlertThreshold}% in ~${Math.round(estimatedDaysToBreach)} days!`
        );
      }

      // ✅ Add forecast dataset for Top 20 CEIDs
      if (sortedCriticalCEIDs.includes(tool.CEID)) {
        forecastDataset.push({
          label: `${tool.CEID} Forecast`,
          data: [...forecastedLimitations, Math.min(futurePrediction, 100)],
          borderColor: sortedCriticalCEIDs[0] === tool.CEID ? "red" : `hsl(${index * 40}, 70%, 50%)`,
          backgroundColor: `hsl(${index * 40}, 70%, 70%)`,
          tension: 0.3,
          fill: false,
        });
      }
    });

    if (forecastDataset.length > 0) {
      setForecastData({
        labels: [...limitationKeys.map((key) => key.replace("ABA_PERCENT_FLAGED_", "").replace("DAYS", " Days")), "Future"],
        datasets: forecastDataset,
      });
    }

    setAlerts(newAlerts);
  }, [data, alertThreshold, futureAlertThreshold]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📊 Forecasting & Alerts</h3>

      {/* 🔹 Alert Threshold Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex flex-col">
          Alert Threshold (%)
          <input type="number" value={alertThreshold} onChange={(e) => setAlertThreshold(Number(e.target.value))} className="border p-2 w-20 rounded-md" />
        </label>
        <label className="flex flex-col">
          Future Alert Threshold (%)
          <input type="number" value={futureAlertThreshold} onChange={(e) => setFutureAlertThreshold(Number(e.target.value))} className="border p-2 w-20 rounded-md" />
        </label>
      </div>

      {/* 🔹 Alerts Section (4 per row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {alerts.map((alert, index) => (
          <Alert key={index} className={`p-4 rounded-md ${alert.includes("⚠️ **Critical:**") ? "bg-red-400 text-white" : "bg-orange-300"}`}>
            <AlertTitle className="text-md font-semibold">⚠️ Alert</AlertTitle>
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* 🔹 Forecasting Trends */}
      <div className="w-full h-[500px]">
        {forecastData.datasets.length > 0 ? <Line data={forecastData} options={{ responsive: true }} /> : <p>No data for predictions.</p>}
      </div>
    </div>
  );
}
