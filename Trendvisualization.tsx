import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TrendChart = ({ data, loading, darkMode }) => {
  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'} transition-shadow duration-300 hover:shadow-xl`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Limitation Trend Over Time
        </h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Loading</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLimitation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={darkMode ? "#3182CE" : "#3B82F6"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={darkMode ? "#3182CE" : "#3B82F6"} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={darkMode ? "#E53E3E" : "#DC2626"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={darkMode ? "#E53E3E" : "#DC2626"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ddd'} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: darkMode ? '#ccc' : '#333' }}
                tickLine={{ stroke: darkMode ? '#888' : '#aaa' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: darkMode ? '#ccc' : '#333' }}
                tickLine={{ stroke: darkMode ? '#888' : '#aaa' }}
                tickFormatter={value => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: darkMode ? '#ccc' : '#333' }}
                tickLine={{ stroke: darkMode ? '#888' : '#aaa' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#2d3748' : '#fff',
                  borderColor: darkMode ? '#4a5568' : '#e2e8f0',
                  color: darkMode ? '#fff' : '#000'
                }} 
                formatter={(value, name) => {
                  if (name === "Avg. Limitation %") {
                    return [`${(value * 100).toFixed(2)}%`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avgLimitation" 
                name="Avg. Limitation %" 
                yAxisId="left"
                stroke={darkMode ? '#3182CE' : '#3B82F6'} 
                fillOpacity={1}
                fill="url(#colorLimitation)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Area 
                type="monotone" 
                dataKey="criticalCount" 
                name="Critical CEIDs" 
                yAxisId="right"
                stroke={darkMode ? '#E53E3E' : '#DC2626'} 
                fillOpacity={1}
                fill="url(#colorCritical)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
