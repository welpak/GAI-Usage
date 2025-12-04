import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  subLabel?: string;
  color?: string;
}

export const Gauge: React.FC<GaugeProps> = ({ value, max, label, subLabel, color = "#00ff88" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Create data for the chart
  const data = [{ name: 'val', value: percentage, fill: color }];

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="h-32 w-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#333' }}
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pt-8">
           <span className="text-2xl font-bold font-mono">{value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}</span>
        </div>
      </div>
      <div className="mt-[-20px] text-center">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        {subLabel && <p className="text-gray-500 text-[10px] mt-1">{subLabel}</p>}
      </div>
    </div>
  );
};