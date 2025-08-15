export default function PerformanceChart({ title, data, type = 'bar' }) {
  // Mock chart component - in a real app, you'd use a library like Chart.js or Recharts
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h3 className="text-lg font-medium text-secondary-900 mb-4">{title}</h3>
      
      {type === 'bar' && (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-secondary-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 bg-secondary-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-secondary-900 text-right">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {type === 'line' && (
        <div className="h-48 flex items-end justify-between space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary-600 rounded-t transition-all duration-300"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <div className="text-xs text-secondary-600 mt-2 text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {type === 'donut' && (
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {data.map((item, index) => {
                const offset = data.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
                const total = data.reduce((acc, curr) => acc + curr.value, 0);
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = -offset / total * 100;
                
                return (
                  <circle
                    key={index}
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-secondary-900">
                  {data.reduce((acc, curr) => acc + curr.value, 0)}
                </div>
                <div className="text-xs text-secondary-500">Total</div>
              </div>
            </div>
          </div>
          <div className="ml-6 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-sm text-secondary-600">{item.label}</span>
                <span className="text-sm font-medium text-secondary-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
