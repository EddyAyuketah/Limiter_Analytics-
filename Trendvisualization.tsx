// components/CeidTable.js
import React from 'react';
import { Database, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { getColor } from '../utils/theme';

const DAY_RANGES = [3, 7, 14, 21, 28, 42, 56, 91];

const CeidTable = ({
  data,
  loading,
  sortConfig,
  requestSort,
  filterValue,
  setFilterValue,
  darkMode
}) => {
  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'} overflow-hidden transition-shadow duration-300 hover:shadow-xl`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Database className="mr-2 h-5 w-5" />
          CEID Limitation Data
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter CEIDs or Areas..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className={`p-2 pl-8 rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border w-48 transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          />
          <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${darkMode ? 'border-blue-400' : 'border-blue-600'}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Loading</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} sticky top-0 z-10`}>
              <tr>
                {['CEID', 'AREA'].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80"
                    onClick={() => requestSort(col)}
                  >
                    <div className="flex items-center">
                      {col}
                      {sortConfig.key === col && (
                        sortConfig.direction === 'ascending'
                          ? <ChevronUp className="h-4 w-4 ml-1" />
                          : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
                {DAY_RANGES.map(days => (
                  <th
                    key={days}
                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80"
                    onClick={() => requestSort(`ABA_PERCENT_FLAGED_${days}DAYS`)}
                  >
                    <div className="flex items-center">
                      {days}d %
                      {sortConfig.key === `ABA_PERCENT_FLAGED_${days}DAYS` && (
                        sortConfig.direction === 'ascending'
                          ? <ChevronUp className="h-4 w-4 ml-1" />
                          : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {data.map((row, index) => (
                <tr
                  key={`${row.CEID}-${index}`}
                  className={`${index % 2 === 0
                    ? (darkMode ? 'bg-gray-800' : 'bg-white')
                    : (darkMode ? 'bg-gray-900' : 'bg-gray-50')
                  } hover:bg-opacity-80 transition-colors duration-150`}
                >
                  <td className="px-3 py-2 whitespace-nowrap font-medium">{row.CEID}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.AREA}</td>
                  {DAY_RANGES.map(days => {
                    const value = parseFloat(row[`ABA_PERCENT_FLAGED_${days}DAYS`] || '0');
                    return (
                      <td key={days} className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${value * 100}%`,
                                backgroundColor: getColor(value, darkMode)
                              }}
                            />
                          </div>
                          <span>{(value * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CeidTable;
