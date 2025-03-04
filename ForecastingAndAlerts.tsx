import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ToolData } from "@/types/tool";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to calculate Exponential Moving Average (EMA)
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
  const [criticalData, setCriticalData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [futureAlertThreshold, setFutureAlertThreshold] = useState<number>(90);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const newAlerts: string[] = [];
    const criticalLabels: string[] = [];
    const criticalValues: number[] = [];

    // Extract limitation keys from the first available tool
    const firstToolWithData = data.find((tool) =>
      tool && Object.keys(tool).some((key) => key.includes("ABA_PERCENT_FLAGED"))
    );
    const limitationKeys: string[] = firstToolWithData
      ? Object.keys(firstToolWithData).filter((key) => key.includes("ABA_PERCENT_FLAGED"))
      : [];

    // Identify the Top 10 Most Critical CEIDs
    const sortedCriticalCEIDs = [...data]
      .map((tool) => ({
        ceid: tool.CEID,
        currentMax: Math.max(...limitationKeys.map((key) => ((tool as any)[key] ?? 0) * 100)),
      }))
      .sort((a, b) => b.currentMax - a.currentMax)
      .slice(0, 10);

    sortedCriticalCEIDs.forEach(({ ceid, currentMax }) => {
      criticalLabels.push(ceid);
      criticalValues.push(currentMax);

      // Trigger Immediate Alert
      if (currentMax > alertThreshold) {
        newAlerts.push(
          `⚠️ **Critical:** ${ceid} exceeded ${alertThreshold}% (Current: ${currentMax.toFixed(2)}%)`
        );
      }

      // Predict future risk using EMA
      const toolData = data.find((t) => t.CEID === ceid);
      const limitations = limitationKeys.map((key) => ((toolData as any)[key] ?? 0) * 100);
      const forecastedLimitations = calculateEMA(limitations);
      const futurePrediction = forecastedLimitations[forecastedLimitations.length - 1] * 1.1;

      if (futurePrediction > futureAlertThreshold) {
        newAlerts.push(
          `🔮 **Prediction:** ${ceid} will likely exceed ${futureAlertThreshold}% soon!`
        );
      }
    });

    setCriticalData({ labels: criticalLabels, values: criticalValues });
    setAlerts(newAlerts);
  }, [data, alertThreshold, futureAlertThreshold]);

  // Bar Chart for Critical CEIDs
  const barChartData = {
    labels: criticalData.labels,
    datasets: [
      {
        label: "Current Limitation (%)",
        data: criticalData.values,
        backgroundColor: criticalData.values.map((value) =>
          value > futureAlertThreshold
            ? "rgba(255, 0, 0, 0.9)" // Red for future threshold exceeded
            : value > alertThreshold
            ? "rgba(255, 165, 0, 0.9)" // Orange for nearing the threshold
            : "rgba(75, 192, 192, 0.9)" // Green for safe
        ),
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white", // 🔥 Enhanced Label Visibility
        },
      },
      title: {
        display: true,
        text: "🚨 Top 10 Critical CEIDs by Limitation",
        font: {
          size: 18,
        },
        color: "white", // 🔥 Axis Titles Enhanced
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Limitation (%)",
          color: "white",
        },
        ticks: {
          color: "white", // 🔥 Enhanced Tick Label Color
        },
      },
      x: {
        ticks: {
          color: "white", // 🔥 X-axis labels improved
        },
      },
    },
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-white">📊 Forecasting & Alerts</h3>

      {/* Alert Threshold Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex flex-col">
          Alert Threshold (%)
          <input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            className="border p-2 w-20 rounded-md"
          />
        </label>
        <label className="flex flex-col">
          Future Alert Threshold (%)
          <input
            type="number"
            value={futureAlertThreshold}
            onChange={(e) => setFutureAlertThreshold(Number(e.target.value))}
            className="border p-2 w-20 rounded-md"
          />
        </label>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            className={`p-4 rounded-md ${
              alert.includes("⚠️ **Critical:**")
                ? "bg-red-500 text-white"
                : "bg-orange-400 text-black"
            }`}
          >
            <AlertTitle className="text-md font-semibold">⚠️ Alert</AlertTitle>
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[500px]">
        {criticalData.labels.length > 0 ? (
          <Bar data={barChartData} options={barChartOptions} />
        ) : (
          <p className="text-white">No critical data available for visualization.</p>
        )}
      </div>
    </div>
  );
}
