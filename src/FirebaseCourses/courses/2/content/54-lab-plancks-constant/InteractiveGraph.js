import React, { useEffect, useRef, useState } from 'react';

const InteractiveGraph = ({ measurements, xAxis, yAxis, onPointClick }) => {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  
  // LED colors for data points
  const ledColors = {
    red: '#ff0000',
    amber: '#ffbf00', 
    yellow: '#ffff00',
    green: '#00ff00',
    blue: '#0080ff'
  };
  
  // Get data for plotting
  const getPlotData = () => {
    return measurements
      .filter(m => m.voltage !== null && m.voltage !== undefined)
      .map(m => {
        let x, y;
        
        if (xAxis === 'frequency') {
          x = m.frequency;
        } else if (xAxis === 'voltage') {
          x = m.voltage;
        }
        
        if (yAxis === 'voltage') {
          y = m.voltage;
        } else if (yAxis === 'frequency') {
          y = m.frequency;
        }
        
        return {
          x,
          y,
          color: m.color.toLowerCase(),
          label: m.color
        };
      });
  };
  
  const plotData = getPlotData();
  
  // Calculate graph bounds
  const getBounds = () => {
    if (plotData.length === 0) return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    
    const xValues = plotData.map(p => p.x);
    const yValues = plotData.map(p => p.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    // Add padding
    const xPadding = (maxX - minX) * 0.1;
    const yPadding = (maxY - minY) * 0.1;
    
    return {
      minX: Math.max(0, minX - xPadding),
      maxX: maxX + xPadding,
      minY: Math.max(0, minY - yPadding),
      maxY: maxY + yPadding
    };
  };
  
  const bounds = getBounds();
  
  // Convert data coordinates to canvas coordinates
  const dataToCanvas = (dataX, dataY, canvasWidth, canvasHeight) => {
    const margin = 60;
    const plotWidth = canvasWidth - 2 * margin;
    const plotHeight = canvasHeight - 2 * margin;
    
    const x = margin + ((dataX - bounds.minX) / (bounds.maxX - bounds.minX)) * plotWidth;
    const y = canvasHeight - margin - ((dataY - bounds.minY) / (bounds.maxY - bounds.minY)) * plotHeight;
    
    return { x, y };
  };
  
  // Convert canvas coordinates to data coordinates
  const canvasToData = (canvasX, canvasY, canvasWidth, canvasHeight) => {
    const margin = 60;
    const plotWidth = canvasWidth - 2 * margin;
    const plotHeight = canvasHeight - 2 * margin;
    
    const dataX = bounds.minX + ((canvasX - margin) / plotWidth) * (bounds.maxX - bounds.minX);
    const dataY = bounds.minY + ((canvasHeight - margin - canvasY) / plotHeight) * (bounds.maxY - bounds.minY);
    
    return { x: dataX, y: dataY };
  };
  
  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || plotData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const margin = 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = margin + (i / 10) * (width - 2 * margin);
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = margin + (i / 10) * (height - 2 * margin);
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // X-axis label
    const xLabel = xAxis === 'frequency' ? 'Frequency (×10¹⁴ Hz)' : 'Threshold Voltage (V)';
    ctx.fillText(xLabel, width / 2, height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    const yLabel = yAxis === 'voltage' ? 'Threshold Voltage (V)' : 'Frequency (×10¹⁴ Hz)';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    
    // Draw tick marks and values
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis ticks
    for (let i = 0; i <= 5; i++) {
      const dataX = bounds.minX + (i / 5) * (bounds.maxX - bounds.minX);
      const canvasPos = dataToCanvas(dataX, bounds.minY, width, height);
      
      ctx.beginPath();
      ctx.moveTo(canvasPos.x, height - margin);
      ctx.lineTo(canvasPos.x, height - margin + 5);
      ctx.stroke();
      
      const value = xAxis === 'frequency' ? (dataX / 1e14).toFixed(1) : dataX.toFixed(1);
      ctx.fillText(value, canvasPos.x, height - margin + 20);
    }
    
    // Y-axis ticks
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const dataY = bounds.minY + (i / 5) * (bounds.maxY - bounds.minY);
      const canvasPos = dataToCanvas(bounds.minX, dataY, width, height);
      
      ctx.beginPath();
      ctx.moveTo(margin - 5, canvasPos.y);
      ctx.lineTo(margin, canvasPos.y);
      ctx.stroke();
      
      const value = yAxis === 'frequency' ? (dataY / 1e14).toFixed(1) : dataY.toFixed(1);
      ctx.fillText(value, margin - 10, canvasPos.y + 4);
    }
    
    // Draw data points
    plotData.forEach((point, index) => {
      const canvasPos = dataToCanvas(point.x, point.y, width, height);
      const isSelected = selectedPoints.includes(index);
      const isHovered = hoveredPoint === index;
      
      // Point shadow/glow effect for selection
      if (isSelected || isHovered) {
        ctx.shadowColor = ledColors[point.color];
        ctx.shadowBlur = isSelected ? 15 : 10;
      } else {
        ctx.shadowBlur = 0;
      }
      
      // Draw point
      ctx.fillStyle = ledColors[point.color];
      ctx.beginPath();
      ctx.arc(canvasPos.x, canvasPos.y, isSelected ? 8 : 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Point border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Label point
      ctx.fillStyle = '#333';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, canvasPos.x, canvasPos.y - 15);
    });
    
    // Draw hover tooltip
    if (hoveredPoint !== null && plotData[hoveredPoint]) {
      const point = plotData[hoveredPoint];
      const canvasPos = dataToCanvas(point.x, point.y, width, height);
      
      const xValue = xAxis === 'frequency' ? `${(point.x / 1e14).toFixed(2)} ×10¹⁴ Hz` : `${point.x.toFixed(2)} V`;
      const yValue = yAxis === 'frequency' ? `${(point.y / 1e14).toFixed(2)} ×10¹⁴ Hz` : `${point.y.toFixed(2)} V`;
      
      const tooltip = `(${xValue}, ${yValue})`;
      
      // Tooltip background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      const textWidth = ctx.measureText(tooltip).width;
      ctx.fillRect(canvasPos.x - textWidth/2 - 5, canvasPos.y - 35, textWidth + 10, 20);
      
      // Tooltip text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tooltip, canvasPos.x, canvasPos.y - 20);
    }
    
  }, [plotData, bounds, xAxis, yAxis, selectedPoints, hoveredPoint]);
  
  // Handle mouse events
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over a data point
    let foundPoint = null;
    plotData.forEach((point, index) => {
      const canvasPos = dataToCanvas(point.x, point.y, canvas.width, canvas.height);
      const distance = Math.sqrt((x - canvasPos.x) ** 2 + (y - canvasPos.y) ** 2);
      if (distance <= 10) {
        foundPoint = index;
      }
    });
    
    setHoveredPoint(foundPoint);
    canvas.style.cursor = foundPoint !== null ? 'pointer' : 'default';
  };
  
  const handleMouseClick = (e) => {
    if (hoveredPoint !== null) {
      const point = plotData[hoveredPoint];
      setSelectedPoints(prev => {
        if (prev.includes(hoveredPoint)) {
          return prev.filter(i => i !== hoveredPoint);
        } else {
          return [...prev, hoveredPoint];
        }
      });
      
      if (onPointClick) {
        onPointClick(point, hoveredPoint);
      }
    }
  };
  
  const clearSelection = () => {
    setSelectedPoints([]);
  };
  
  if (plotData.length === 0) {
    return (
      <div className="interactive-graph bg-white p-6 rounded-lg border">
        <p className="text-gray-500 text-center">No data available for plotting. Complete measurements first.</p>
      </div>
    );
  }
  
  return (
    <div className="interactive-graph bg-white p-6 rounded-lg border">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Data Graph</h3>
        {selectedPoints.length > 0 && (
          <button
            onClick={clearSelection}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      <div className="graph-container">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-gray-300 rounded cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Hover over points to see exact values</p>
        <p>• Click on points to select them for slope calculation</p>
        <p>• Selected points: {selectedPoints.length}</p>
      </div>
    </div>
  );
};

export default InteractiveGraph;