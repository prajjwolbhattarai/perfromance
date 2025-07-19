
import React from 'react';
import { Kpi } from '../types';
import { InfoIcon } from './icons';

const KpiCard: React.FC<Kpi> = ({ title, value, change, changeType, description }) => {
  const changeColor = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  }[changeType];

  return (
    <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">{title}</h3>
        {description && (
          <div className="relative group">
            <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <div className="absolute bottom-full mb-2 -ml-20 w-48 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none text-center">
              {description}
            </div>
          </div>
        )}
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">{value}</p>
        <span className={`text-sm font-semibold ${changeColor}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

export default KpiCard;
