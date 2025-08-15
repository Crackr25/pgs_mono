import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon,
  color = 'blue',
  subtitle = ''
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${colors.bg} p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-semibold text-secondary-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-secondary-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center">
          {changeType === 'increase' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`ml-1 text-sm font-medium ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
          <span className="ml-1 text-sm text-secondary-500">from last month</span>
        </div>
      )}
    </div>
  );
}
