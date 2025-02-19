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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { ToolData } from "@/types/tool";

// ✅ Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ForecastingAndAlertsProps {
  data: ToolData[];
}

export default function ForecastingAndAlerts({ data }: ForecastingAndAlertsProps) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn("⚠️ No data available for forecasting!");
      return;
    }

    const newAlerts: string[] = [];
    const forecastDataset: any[] = [];

    data.forEach((tool, index) => {
      if (!tool?.limitations || typeof tool.limitations !== "object") {
        console.warn(`⚠️ Missing limitations data for CEID: ${tool?.CEID}`);
        return; // Skip invalid CEIDs
      }

      const limitations = Object.values(tool.limitations).map((val) => (val !== null ? val : 0));
      const latestLimitation = limitations[limitations.length - 1];

      // 🔹 Alert for CEIDs exceeding 80% limitation
      if (latestLimitation > 80) {
        newAlerts.push(`${tool.CEID} has exceeded 80% limitation (${latestLimitation}%)`);
      }

      // 🔹 Alert for CEIDs with consistent upward trend
      const isIncreasing = limitations.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
      if (isIncreasing && limitations[limitations.length - 1] - limitations[0] > 20) {
        newAlerts.push(`${tool.CEID} shows a consistent upward trend`);
      }

      // 🔹 Simple linear regression for forecasting
      const x = Object.keys(tool.limitations).map(Number);
      const y = limitations;
      const n = x.length;

      if (n > 1) {
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
        const sumXX = x.reduce((total, xi) => total + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const forecastedLimitations = [...y, slope * (Math.max(...x) + 30) + intercept];

        // 🔹 Generate dataset for chart
        forecastDataset.push({
          label: `${tool.CEID} Forecast`,
          data: forecastedLimitations,
          borderColor: `hsl(${index * 40}, 70%, 50%)`,
          backgroundColor: `hsl(${index * 40}, 70%, 70%)`,
          tension: 0.3,
          fill: false,
        });

        if (forecastedLimitations[forecastedLimitations.length - 1] > 90) {
          newAlerts.push(`${tool.CEID} is projected to exceed 90% limitation in the next 30 days`);
        }
      }
    });

    // ✅ Only update state when we have valid data
    if (forecastDataset.length > 0) {
      setForecastData({
        labels: [...(data[0]?.limitations ? Object.keys(data[0].limitations) : []), "Future (30 Days)"],
        datasets: forecastDataset,
      });
    }

    setAlerts(newAlerts);
  }, [data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "CEID Forecasting Trends",
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
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Forecasting & Alerts</h3>

      {alerts.length === 0 ? (
        <p>No critical alerts at this time.</p>
      ) : (
        alerts.map((alert, index) => (
          <Alert key={index} className="mb-4">
            <AlertTitle className="flex items-center">
              Critical Alert
              <Badge variant="destructive" className="ml-2">High Priority</Badge>
            </AlertTitle>
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        ))
      )}

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Forecasting Trends</h4>
        {forecastData.datasets.length > 0 ? (
          <Line data={forecastData} options={chartOptions} />
        ) : (
          <p className="text-gray-500">No sufficient data to generate forecasts.</p>
        )}
      </div>
    </div>
  );
}
