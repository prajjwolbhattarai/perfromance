
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';

// --- Chart 1: Spend vs. Revenue Bar Chart ---
export const SpendRevenueBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis type="number" stroke="rgb(160 174 192)" fontSize={12} />
        <YAxis type="category" dataKey="name" stroke="rgb(160 174 192)" fontSize={12} width={80} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderColor: 'rgba(74, 85, 104, 0.8)', borderRadius: '0.5rem' }}
          cursor={{ fill: 'rgba(74, 85, 104, 0.2)' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
        <Bar dataKey="spend" fill="#38b2ac" name="Spend" />
        <Bar dataKey="revenue" fill="#4299e1" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Chart 2: Conversion Funnel Chart ---
const COLORS = ['#4299e1', '#38b2ac', '#ed8936'];
export const ConversionFunnelChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip
            contentStyle={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderColor: 'rgba(74, 85, 104, 0.8)', borderRadius: '0.5rem' }}
        />
        <Funnel dataKey="value" data={data} isAnimationActive>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList position="right" fill="#fff" dataKey="name" formatter={(value: string) => value} />
            <LabelList position="center" fill="#000" formatter={(value: number) => value.toLocaleString()} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
};

// --- Chart 3: Spend Distribution Pie Chart ---
const PIE_COLORS = ['#4299e1', '#38b2ac', '#ed8936', '#9f7aea', '#fbbf24', '#f87171'];
export const SpendDistributionPieChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderColor: 'rgba(74, 85, 104, 0.8)', borderRadius: '0.5rem' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Chart 4: Performance (ROAS) Trend Line Chart ---
export const PerformanceTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="date" stroke="rgb(160 174 192)" fontSize={12} />
        <YAxis stroke="rgb(160 174 192)" fontSize={12} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderColor: 'rgba(74, 85, 104, 0.8)', borderRadius: '0.5rem' }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
        <Line type="monotone" dataKey="ROAS" stroke="#4299e1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- Chart 5: Forecast Chart ---
export const ForecastChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" stroke="rgb(160 174 192)" fontSize={12} />
            <YAxis stroke="rgb(160 174 192)" fontSize={12} />
            <Tooltip
                contentStyle={{ backgroundColor: 'rgba(45, 55, 72, 0.9)', borderColor: 'rgba(74, 85, 104, 0.8)', borderRadius: '0.5rem' }}
                cursor={{ fill: 'rgba(74, 85, 104, 0.2)' }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Bar dataKey="current" fill="#a0aec0" name="Current" />
            <Bar dataKey="forecast" fill="#4299e1" name="Forecast" />
        </BarChart>
    </ResponsiveContainer>
  );
};
