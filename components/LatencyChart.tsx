import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LatencyPoint } from '../types';

interface LatencyChartProps {
  data: LatencyPoint[];
}

export const LatencyChart: React.FC<LatencyChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full p-4 bg-[#1c1c1c] rounded-xl border border-[#333]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-300 text-sm font-medium uppercase tracking-widest">Latency (ms)</h3>
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second: '2-digit' })}
            stroke="#666"
            tick={{fontSize: 10}}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666" 
            tick={{fontSize: 10}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
            labelStyle={{ color: '#888' }}
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />
          <Line 
            type="monotone" 
            dataKey="latency" 
            stroke="#00ff88" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};