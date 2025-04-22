import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const DAY_RANGES = [3, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84];

const TrendChart = ({ data, loading, darkMode }) => {
  const [selectedArea, setSelectedArea] = useState(localStorage.getItem('trend_area') || '');
  const [selectedCeids, setSelectedCeids] = useState(() => {
    const stored = localStorage.getItem('trend_ceids');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique areas and CEIDs
  const areaOptions = useMemo(() => [...new Set(data.map(item => item.AREA))], [data]);
  const ceidOptions = useMemo(() => {
    return data
      .filter(item => item.AREA === selectedArea)
      .map(item => item.CEID)
      .filter(ceid => ceid.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, selectedArea, searchQuery]);

  // Save filters
  useEffect(() => {
    localStorage.setItem('trend_area', selectedArea);
    localStorage.setItem('trend_ceids', JSON.stringify(selectedCeids));
  }, [selectedArea, selectedCeids]);

  // Chart Data
  const chartData = useMemo(() => {
    if (!selectedArea || selectedCeids.length === 0) return [];

    return DAY_RANGES.map(days => {
      const label = `${days}d`;
      const point = { name: label };

      selectedCeids.forEach(ceid => {
        const item = data.find(d => d.CEID === ceid);
        if (item) {
          const val = parseFloat(item[`ABA_PERCENT_FLAGED_${days}DAYS`] || '0');
          point[ceid] = isNaN(val) ? 0 : val;
        }
      });

      return point;
    });
  }, [selectedCeids, data]);

  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'} p-4`}>
      <h2 className="text-xl font-bold flex items-center mb-4">
        <TrendingUp className="mr-2 h-5 w-5" />
        Trend Visualization
      </h2>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Area Selector */}
        <select
          value={selectedArea}
          onChange={(e) => {
            setSelectedArea(e.target.value);
            setSelectedCeids([]);
            setSearchQuery('');
          }}
          className={`p-2 border rounded w-60 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
        >
          <option value="">Select Area</option>
          {areaOptions.map((area, i) => (
            <option key={i} value={area}>{area}</option>
          ))}
        </select>

        {/* CEID Search + Checkboxes */}
        {selectedArea && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search CEID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`p-2 border rounded w-full md:w-96 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            />
            <div className="max-h-32 overflow-y-auto flex flex-wrap gap-3">
              {ceidOptions.map(ceid => (
                <label key={ceid} className="flex items-center text-sm space-x-1">
                  <input
                    type="checkbox"
                    checked={selectedCeids.includes(ceid)}
                    onChange={() => {
                      setSelectedCeids(prev => {
                        if (prev.includes(ceid)) {
                          return prev.filter(c => c !== ceid);
                        } else if (prev.length < 10) {
                          return [...prev, ceid];
                        }
                        return prev;
                      });
                    }}
                  />
                  <span>{ceid}</span>
                </label>
              ))}
            </div>
            {selectedCeids.length >= 10 && (
              <p className="text-xs text-red-400">Max 10 CEIDs selected</p>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex justify-center items-center text-sm text-blue-500">Loading...</div>
      ) : selectedCeids.length === 0 ? (
        <div className="h-64 flex justify-center items-center text-sm text-gray-400">Select CEIDs to display chart</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
            <XAxis dataKey="name" tick={{ fill: darkMode ? '#ccc' : '#000' }} />
            <YAxis
              tick={{ fill: darkMode ? '#ccc' : '#000' }}
              tickFormatter={val => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#2d3748' : '#fff',
                borderColor: darkMode ? '#4a5568' : '#e2e8f0',
                color: darkMode ? '#fff' : '#000',
              }}
              formatter={(val, name) => [`${(val * 100).toFixed(2)}%`, name]}
            />
            <Legend />
            {selectedCeids.map((ceid, i) => (
              <Area
                key={ceid}
                type="monotone"
                dataKey={ceid}
                stroke={`hsl(${(i * 37) % 360}, 70%, 50%)`}
                fillOpacity={0.3}
                fill={`hsl(${(i * 37) % 360}, 70%, 70%)`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendChart;
