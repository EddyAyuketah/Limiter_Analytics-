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

// Register Chart.js components
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

export default function ForecastingAndAlerts({ data, theme }: { data: ToolData[], theme: string }) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [criticalData, setCriticalData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [futureAlertThreshold, setFutureAlertThreshold] = useState<number>(90);

  const isDarkMode = theme === "dark";

  useEffect(() => {
    if (!data || data.length === 0) return;

    const newAlerts: string[] = [];
    const criticalLabels: string[] = [];
    const criticalValues: number[] = [];

// extract limitation keys from the first available tool
    const firstToolWithData = data.find((tool) =>
      tool && Object.keys(tool).some((key) => key.includes("ABA_PERCENT_FLAGED"))
    );
    const limitationKeys: string[] = firstToolWithData
      ? Object.keys(firstToolWithData).filter((key) => key.includes("ABA_PERCENT_FLAGED"))
      : [];

      // identify the top 10 critical CEIDS

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

      if (currentMax > alertThreshold) {
        newAlerts.push(
          `⚠️ **Critical:** ${ceid} exceeded ${alertThreshold}% (Current: ${currentMax.toFixed(2)}%)`
        );
      }

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

  // Ensures all chart elements change with theme
  const textColor = isDarkMode ? "#ffffff" : "#000000"; // White in dark mode, black in light mode
  const gridColor = isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";

  const barChartData = {
    labels: criticalData.labels,
    datasets: [
      {
        label: "Current Limitation (%)",
        data: criticalData.values,
        backgroundColor: criticalData.values.map((value) =>
          value > futureAlertThreshold
            ? "rgba(255, 0, 0, 0.9)"
            : value > alertThreshold
            ? "rgba(255, 165, 0, 0.9)"
            : "rgba(75, 192, 192, 0.9)"
        ),
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor, // ✅ Fix legend text color
        },
      },
      title: {
        display: true,
        text: "🚨 Top 10 Critical CEIDs by Limitation",
        font: { size: 18 },
        color: textColor, // ✅ Fix title text color
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)", // ✅ Fix tooltip color
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Limitation (%)",
          color: textColor, // ✅ Fix Y-axis text
        },
        ticks: {
          color: textColor, // ✅ Fix Y-axis labels
        },
        grid: {
          color: gridColor, // ✅ Fix grid lines
        },
      },
      x: {
        ticks: {
          color: textColor, // ✅ Fix X-axis labels
        },
        grid: {
          color: gridColor, // ✅ Fix grid lines
        },
      },
    },
  };

  return (
    <div key={theme}> {/* ✅ Forces component to fully refresh on theme switch */}
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
        📊 Forecasting & Alerts
      </h3>

      {/* Alert Threshold Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex flex-col">
          Alert Threshold (%)
          <input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            className={`border p-2 w-20 rounded-md ${
              theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
            }`}
          />
        </label>
        <label className="flex flex-col">
          Future Alert Threshold (%)
          <input
            type="number"
            value={futureAlertThreshold}
            onChange={(e) => setFutureAlertThreshold(Number(e.target.value))}
            className={`border p-2 w-20 rounded-md ${
              theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
            }`}
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
          <p className={isDarkMode ? "text-white" : "text-black"}>No critical data available for visualization.</p>
        )}
      </div>
    </div>
  );
}
