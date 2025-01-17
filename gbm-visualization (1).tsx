import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

const generateGBM = (steps, initialPrice, mu, sigma) => {
  const dt = 1.0 / steps;
  const path = new Array(steps + 1);
  path[0] = { t: 0, price: initialPrice };
  
  let currentPrice = initialPrice;
  
  for (let i = 1; i <= steps; i++) {
    const randomNormal = Math.sqrt(-2.0 * Math.log(Math.random())) * 
                        Math.cos(2.0 * Math.PI * Math.random());
    
    const drift = (mu - 0.5 * sigma * sigma) * dt;
    const diffusion = sigma * Math.sqrt(dt) * randomNormal;
    
    currentPrice *= Math.exp(drift + diffusion);
    path[i] = { t: i * dt, price: currentPrice };
  }
  
  return path;
};

const createHistogramData = (endpoints, bins = 20) => {
  const min = Math.min(...endpoints);
  const max = Math.max(...endpoints);
  const binWidth = (max - min) / bins;
  
  const histogramData = new Array(bins).fill(0).map((_, i) => ({
    binStart: min + i * binWidth,
    count: 0
  }));
  
  endpoints.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      bins - 1
    );
    histogramData[binIndex].count++;
  });
  
  return histogramData;
};

const BrownianMotionChart = () => {
  const [numPaths, setNumPaths] = useState(100);
  const [steps, setSteps] = useState(100);
  const [initialPrice] = useState(100);
  const [mu, setMu] = useState(0.1); // drift
  const [sigma, setSigma] = useState(0.3); // volatility

  const { paths, data, endpointHistogram } = useMemo(() => {
    const paths = Array.from({ length: numPaths }, () => 
      generateGBM(steps, initialPrice, mu, sigma)
    );

    const data = Array(steps + 1).fill(0).map((_, i) => {
      const point = { time: i / steps };
      paths.forEach((path, pathIndex) => {
        point[`path${pathIndex}`] = path[i].price;
      });
      return point;
    });

    const endpoints = paths.map(path => path[path.length - 1].price);
    const endpointHistogram = createHistogramData(endpoints);

    return { paths, data, endpointHistogram };
  }, [numPaths, steps, initialPrice, mu, sigma]);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex gap-4">
          <label className="block">
            Number of Paths:
            <input 
              type="range" 
              min="50" 
              max="500" 
              step="50"
              value={numPaths} 
              onChange={(e) => setNumPaths(parseInt(e.target.value))}
              className="ml-2"
            />
            <span className="ml-2">{numPaths}</span>
          </label>
        </div>
        <div className="flex gap-4">
          <label className="block">
            Drift (μ):
            <input 
              type="range" 
              min="-0.5" 
              max="0.5" 
              step="0.1" 
              value={mu} 
              onChange={(e) => setMu(parseFloat(e.target.value))}
              className="ml-2"
            />
            <span className="ml-2">{mu}</span>
          </label>
          <label className="block">
            Volatility (σ):
            <input 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.1" 
              value={sigma} 
              onChange={(e) => setSigma(parseFloat(e.target.value))}
              className="ml-2"
            />
            <span className="ml-2">{sigma}</span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <LineChart width={800} height={400} data={data} className="bg-white">
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'bottom' }} 
          />
          <YAxis 
            label={{ value: 'Price', angle: -90, position: 'left' }} 
          />
          <Tooltip />
          {paths.map((_, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={`path${i}`}
              stroke="rgba(72, 118, 255, 0.2)"
              dot={false}
            />
          ))}
        </LineChart>

        <BarChart width={800} height={200} data={endpointHistogram} className="bg-white">
          <XAxis 
            dataKey="binStart"
            label={{ value: 'Final Price', position: 'bottom' }}
          />
          <YAxis 
            label={{ value: 'Frequency', angle: -90, position: 'left' }}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#4876FF" />
        </BarChart>
      </div>
    </div>
  );
};

export default BrownianMotionChart;
