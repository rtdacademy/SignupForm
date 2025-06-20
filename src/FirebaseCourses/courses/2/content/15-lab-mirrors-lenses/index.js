import React, { useState, useEffect, useRef } from 'react';

/**
 * Lab 2 - Mirrors and Lenses for Physics 30
 * Unit: Optics
 */

// Interactive Optics Simulation Component
const OpticsSimulation = ({ onDataCollected }) => {
  const canvasRef = useRef(null);
  const [currentPart, setCurrentPart] = useState('A');
  const [isRunning, setIsRunning] = useState(false);
  
  // Simulation state for different parts
  const [simulationState, setSimulationState] = useState({
    A: { // Index of Refraction
      incidentAngle: 30,
      refractedAngle: 22.1,
      trialCount: 0,
      trials: {}
    },
    B: { // Light Offset
      blockThickness: 2.0,
      incidentAngle: 45,
      displacement: 0.83
    },
    C: { // Reflection
      incidentAngle: 35,
      reflectedAngle: 35
    },
    D: { // Mirror Focal Length
      currentMirror: 'converging1',
      mirrors: {
        converging1: { type: 'converging', focal: 25.0, name: 'Converging Mirror 1' },
        converging2: { type: 'converging', focal: 35.0, name: 'Converging Mirror 2' },
        diverging1: { type: 'diverging', focal: -30.0, name: 'Diverging Mirror 1' },
        diverging2: { type: 'diverging', focal: -22.0, name: 'Diverging Mirror 2' }
      }
    },
    E: { // Lens Focal Length
      convergingFocal: 10.0,
      divergingFocal: -8.0,
      beamSpacing: 20
    }
  });
  
  // Canvas drawing functions
  const drawCanvas = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw simulation based on current part
    switch (currentPart) {
      case 'A':
        drawRefractionSimulation(ctx, width, height);
        break;
      case 'B':
        drawOffsetSimulation(ctx, width, height);
        break;
      case 'C':
        drawReflectionSimulation(ctx, width, height);
        break;
      case 'D':
        drawMirrorSimulation(ctx, width, height);
        break;
      case 'E':
        drawLensSimulation(ctx, width, height);
        break;
    }
    } catch (error) {
      console.error('Canvas drawing error:', error);
    }
  };
  
  // Draw refraction simulation (Part A)
  const drawRefractionSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 80;
    
    // Draw semicircular dish
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.stroke();
    
    // Draw flat surface
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    
    // Draw water
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI);
    ctx.fill();
    
    // Draw incident ray
    const incidentAngle = simulationState.A.incidentAngle * Math.PI / 180;
    const incidentLength = 60;
    const incidentStartX = centerX - Math.sin(incidentAngle) * incidentLength;
    const incidentStartY = centerY - Math.cos(incidentAngle) * incidentLength;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(incidentStartX, incidentStartY);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    
    // Draw refracted ray
    const refractedAngle = simulationState.A.refractedAngle * Math.PI / 180;
    const refractedEndX = centerX + Math.sin(refractedAngle) * 60;
    const refractedEndY = centerY + Math.cos(refractedAngle) * 60;
    
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(refractedEndX, refractedEndY);
    ctx.stroke();
    
    // Draw normal line
    ctx.strokeStyle = '#6b7280';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 80);
    ctx.lineTo(centerX, centerY + 80);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`θi = ${simulationState.A.incidentAngle.toFixed(1)}°`, incidentStartX - 30, incidentStartY - 10);
    ctx.fillText(`θr = ${simulationState.A.refractedAngle.toFixed(1)}°`, refractedEndX + 10, refractedEndY + 20);
  };
  
  // Draw offset simulation (Part B)
  const drawOffsetSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const blockWidth = 60;
    const blockHeight = 100;
    const blockThickness = simulationState.B.blockThickness; // in cm
    
    // Draw transparent block
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - blockWidth/2, centerY - blockHeight/2, blockWidth, blockHeight);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(centerX - blockWidth/2, centerY - blockHeight/2, blockWidth, blockHeight);
    
    const incidentAngle = simulationState.B.incidentAngle * Math.PI / 180;
    const refractedAngle = Math.asin(Math.sin(incidentAngle) / 1.5); // Glass n ≈ 1.5
    
    // Calculate entry point on left side of block
    const entryY = centerY - blockHeight/2 + 30; // Fixed entry point
    
    // Draw incident ray
    const incidentStartX = centerX - blockWidth/2 - 100;
    const incidentStartY = entryY - Math.tan(incidentAngle) * 100;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(incidentStartX, incidentStartY);
    ctx.lineTo(centerX - blockWidth/2, entryY);
    ctx.stroke();
    
    // Calculate path through block
    const horizontalDistance = blockWidth;
    const verticalDistance = horizontalDistance * Math.tan(refractedAngle);
    const exitY = entryY + verticalDistance;
    
    // Draw refracted ray inside block
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerX - blockWidth/2, entryY);
    ctx.lineTo(centerX + blockWidth/2, exitY);
    ctx.stroke();
    
    // Draw exit ray (parallel to incident)
    const exitEndX = centerX + blockWidth/2 + 100;
    const exitEndY = exitY + Math.tan(incidentAngle) * 100;
    
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(centerX + blockWidth/2, exitY);
    ctx.lineTo(exitEndX, exitEndY);
    ctx.stroke();
    
    // Draw extension of incident ray (dashed) to show offset
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(centerX - blockWidth/2, entryY);
    ctx.lineTo(centerX + blockWidth/2 + 100, entryY + Math.tan(incidentAngle) * (blockWidth + 100));
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.setLineDash([]);
    
    // Calculate actual displacement in cm
    // For a parallel-sided block: d = t * sin(θi - θr) / cos(θr)
    // where t = thickness, θi = incident angle, θr = refracted angle
    const actualDisplacement = blockThickness * Math.sin(incidentAngle - refractedAngle) / Math.cos(refractedAngle);
    
    // Update simulation state with calculated displacement
    if (Math.abs(actualDisplacement - simulationState.B.displacement) > 0.01) {
      setSimulationState(prev => ({
        ...prev,
        B: {
          ...prev.B,
          displacement: actualDisplacement
        }
      }));
      
      // Trigger data collection callback
      if (onDataCollected) {
        onDataCollected('B', { displacement: actualDisplacement.toFixed(2) });
      }
    }
    
    // Draw displacement measurement following the 4-step process
    const displacement = actualDisplacement;
    
    // Step 1: Select a point on the dotted ray extension
    const extensionPointX = centerX + blockWidth/2 + 50;
    const extensionPointY = entryY + Math.tan(incidentAngle) * (blockWidth + 50);
    const pointOnExtension = { x: extensionPointX, y: extensionPointY };
    
    // Step 2: Calculate the slope of the displacement (negative reciprocal of red line slope)
    const redLineSlope = Math.tan(incidentAngle);
    const displacementSlope = -1 / redLineSlope;
    
    // Step 3: Write equation of perpendicular line: y - y1 = m(x - x1)
    // y = displacementSlope * (x - pointOnExtension.x) + pointOnExtension.y
    
    // Step 4: Find intersection with the red emitted ray
    // Exit ray equation: y = exitY + Math.tan(incidentAngle) * (x - (centerX + blockWidth/2))
    // Setting perpendicular line equal to exit ray:
    // displacementSlope * (x - pointOnExtension.x) + pointOnExtension.y = exitY + Math.tan(incidentAngle) * (x - (centerX + blockWidth/2))
    
    // Solve for x:
    const exitRayStartX = centerX + blockWidth/2;
    const a = displacementSlope - Math.tan(incidentAngle);
    const b = pointOnExtension.y - displacementSlope * pointOnExtension.x - exitY + Math.tan(incidentAngle) * exitRayStartX;
    const intersectionX = -b / a;
    const intersectionY = displacementSlope * (intersectionX - pointOnExtension.x) + pointOnExtension.y;
    const intersectionPoint = { x: intersectionX, y: intersectionY };
    
    // Draw the purple dotted displacement line between the two calculated points
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pointOnExtension.x, pointOnExtension.y);
    ctx.lineTo(intersectionPoint.x, intersectionPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw arrows at both endpoints
    const arrowSize = 5;
    const lineAngle = Math.atan2(intersectionPoint.y - pointOnExtension.y, intersectionPoint.x - pointOnExtension.x);
    
    // Arrow at extension ray point
    ctx.beginPath();
    ctx.moveTo(pointOnExtension.x, pointOnExtension.y);
    ctx.lineTo(pointOnExtension.x + arrowSize * Math.cos(lineAngle + Math.PI - 0.4), pointOnExtension.y + arrowSize * Math.sin(lineAngle + Math.PI - 0.4));
    ctx.lineTo(pointOnExtension.x + arrowSize * Math.cos(lineAngle + Math.PI + 0.4), pointOnExtension.y + arrowSize * Math.sin(lineAngle + Math.PI + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    
    // Arrow at intersection point
    ctx.beginPath();
    ctx.moveTo(intersectionPoint.x, intersectionPoint.y);
    ctx.lineTo(intersectionPoint.x + arrowSize * Math.cos(lineAngle - 0.4), intersectionPoint.y + arrowSize * Math.sin(lineAngle - 0.4));
    ctx.lineTo(intersectionPoint.x + arrowSize * Math.cos(lineAngle + 0.4), intersectionPoint.y + arrowSize * Math.sin(lineAngle + 0.4));
    ctx.closePath();
    ctx.fill();
    
    // Draw displacement label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    const labelX = (pointOnExtension.x + intersectionPoint.x) / 2 + 10;
    const labelY = (pointOnExtension.y + intersectionPoint.y) / 2;
    ctx.fillText(`d = ${displacement.toFixed(2)} cm`, labelX, labelY);
  };
  
  // Draw reflection simulation (Part C)
  const drawReflectionSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw mirror
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.lineTo(centerX + 80, centerY);
    ctx.stroke();
    
    const incidentAngle = simulationState.C.incidentAngle * Math.PI / 180;
    
    // Draw incident ray
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - Math.sin(incidentAngle) * 60, centerY - Math.cos(incidentAngle) * 60);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    
    // Draw reflected ray
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.sin(incidentAngle) * 60, centerY - Math.cos(incidentAngle) * 60);
    ctx.stroke();
    
    // Draw normal
    ctx.strokeStyle = '#6b7280';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 80);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`θi = ${simulationState.C.incidentAngle.toFixed(1)}°`, centerX - 80, centerY - 70);
    ctx.fillText(`θr = ${simulationState.C.reflectedAngle.toFixed(1)}°`, centerX + 40, centerY - 70);
  };
  
  // Draw mirror simulation (Part D)
  const drawMirrorSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const currentMirror = simulationState.D.mirrors[simulationState.D.currentMirror];
    const focalLength = Math.abs(currentMirror.focal);
    const isConverging = currentMirror.type === 'converging';
    const mirrorHeight = 80;
    
    // Draw mirror surface
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    
    if (isConverging) {
      // Draw converging mirror (concave)
      ctx.beginPath();
      ctx.arc(centerX + focalLength * 1.8, centerY, focalLength * 1.8, Math.PI * 0.8, Math.PI * 1.2);
      ctx.stroke();
    } else {
      // Draw diverging mirror (convex)
      ctx.beginPath();
      ctx.arc(centerX - focalLength * 1.8, centerY, focalLength * 1.8, Math.PI * 1.8, Math.PI * 0.2);
      ctx.stroke();
    }
    
    // Draw rays that touch the top and bottom of the mirror
    const rayPositions = [centerY - mirrorHeight/2, centerY + mirrorHeight/2];
    
    rayPositions.forEach(rayY => {
      // Incident ray
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, rayY);
      ctx.lineTo(centerX, rayY);
      ctx.stroke();
      
      // Reflected ray
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(centerX, rayY);
      
      if (isConverging) {
        // For converging mirror: rays go to focal point
        ctx.lineTo(centerX + focalLength, centerY);
      } else {
        // For diverging mirror: rays appear to come from virtual focal point
        const raySlope = (rayY - centerY) / focalLength;
        ctx.lineTo(centerX + 80, rayY + 80 * raySlope);
      }
      ctx.stroke();
    });
    
    // Draw center ray
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    if (isConverging) {
      ctx.lineTo(centerX + focalLength, centerY);
    } else {
      ctx.lineTo(centerX + 80, centerY);
    }
    ctx.stroke();
    
    // Draw focal point
    ctx.fillStyle = isConverging ? '#ef4444' : '#8b5cf6';
    ctx.beginPath();
    const focalX = isConverging ? centerX + focalLength : centerX - focalLength;
    ctx.arc(focalX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw focal point label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`f = ${currentMirror.focal.toFixed(1)} cm`, focalX - 15, centerY + 20);
    ctx.fillText(currentMirror.name, centerX - 40, centerY - 60);
  };
  
  // Draw lens simulation (Part E)
  const drawLensSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const focalLength = simulationState.E.convergingFocal;
    
    // Draw converging lens
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY, 30, -Math.PI/3, Math.PI/3);
    ctx.arc(centerX + 30, centerY, 30, Math.PI*2/3, Math.PI*4/3);
    ctx.stroke();
    
    // Draw parallel rays
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const y = centerY + i * 15;
      
      // Incident ray
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 60, y);
      ctx.lineTo(centerX, y);
      ctx.stroke();
      
      // Refracted ray to focal point
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(centerX, y);
      ctx.lineTo(centerX + focalLength, centerY);
      ctx.stroke();
    }
    
    // Draw focal point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX + focalLength, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText(`f = ${focalLength.toFixed(1)} cm`, centerX + focalLength - 10, centerY + 20);
  };
  
  // Update simulation parameters
  const updateParameter = (part, parameter, value) => {
    setSimulationState(prev => ({
      ...prev,
      [part]: {
        ...prev[part],
        [parameter]: parseFloat(value)
      }
    }));
    
    // Auto-calculate dependent values
    if (part === 'A' && parameter === 'incidentAngle') {
      // Calculate theoretical refracted angle using Snell's law with water n=1.33
      const theoreticalRefracted = Math.asin(Math.sin(value * Math.PI / 180) / 1.33) * 180 / Math.PI;
      
      // Add small random variation (±0.3 degrees) to simulate measurement error
      const variation = (Math.random() - 0.5) * 0.6;
      const refracted = theoreticalRefracted + variation;
      
      setSimulationState(prev => ({
        ...prev,
        A: {
          ...prev.A,
          refractedAngle: refracted
        }
      }));
    } else if (part === 'C' && parameter === 'incidentAngle') {
      setSimulationState(prev => ({
        ...prev,
        C: {
          ...prev.C,
          reflectedAngle: parseFloat(value)
        }
      }));
    } else if (part === 'B' && parameter === 'incidentAngle') {
      // Calculate displacement for glass block
      const blockThickness = 60; // pixels, represents ~3cm
      const incidentAngleRad = value * Math.PI / 180;
      const refractedAngleRad = Math.asin(Math.sin(incidentAngleRad) / 1.5); // Glass n ≈ 1.5
      const displacement = blockThickness * Math.sin(incidentAngleRad - refractedAngleRad) / Math.cos(refractedAngleRad);
      const displacementCm = Math.abs(displacement) * 0.05; // Convert to cm scale
      
      setSimulationState(prev => ({
        ...prev,
        B: {
          ...prev.B,
          displacement: displacementCm
        }
      }));
    }
  };
  
  // Check if current angle combination already exists
  const isDuplicateAngle = (currentIncident) => {
    const existingTrials = Object.values(simulationState.A.trials);
    return existingTrials.some(trial => 
      Math.abs(parseFloat(trial.incidentAngle) - currentIncident) < 0.5
    );
  };

  // Collect trial data
  const collectTrialData = () => {
    const part = currentPart;
    
    if (part === 'A') {
      const trialNum = simulationState.A.trialCount + 1;
      const currentIncident = simulationState.A.incidentAngle;
      
      // Check for duplicate angles
      if (isDuplicateAngle(currentIncident)) {
        alert(`You have already collected data for an incident angle near ${currentIncident.toFixed(1)}°. Please use a different angle.`);
        return;
      }
      
      if (trialNum <= 5) {
        const newTrial = {
          incidentAngle: simulationState.A.incidentAngle.toFixed(1),
          refractedAngle: simulationState.A.refractedAngle.toFixed(1)
        };
        
        const updatedTrials = {
          ...simulationState.A.trials,
          [`trial${trialNum}`]: newTrial
        };
        
        setSimulationState(prev => ({
          ...prev,
          A: {
            ...prev.A,
            trialCount: trialNum,
            trials: updatedTrials
          }
        }));
        
        // Immediately update the observation table
        onDataCollected('A', updatedTrials);
      }
    } else {
      // Collect data for other parts
      let data = {};
      switch (part) {
        case 'B':
          data = { displacement: simulationState.B.displacement.toFixed(2) };
          break;
        case 'C':
          data = {
            incidentAngle: simulationState.C.incidentAngle.toFixed(1),
            reflectedAngle: simulationState.C.reflectedAngle.toFixed(1)
          };
          break;
        case 'D':
          const currentMirror = simulationState.D.mirrors[simulationState.D.currentMirror];
          data = {
            [currentMirror.type]: currentMirror.focal.toFixed(1)
          };
          break;
        case 'E':
          data = {
            converging: simulationState.E.convergingFocal.toFixed(1),
            diverging: simulationState.E.divergingFocal.toFixed(1)
          };
          break;
      }
      onDataCollected(part, data);
    }
  };
  
  // Animation loop
  useEffect(() => {
    try {
      if (isRunning) {
        const interval = setInterval(() => {
          drawCanvas();
        }, 50);
        return () => clearInterval(interval);
      } else {
        drawCanvas();
      }
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, [isRunning, currentPart, simulationState]);
  
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {/* Part Selection */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Select Experiment:</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'A', label: 'Index of Refraction' },
            { key: 'B', label: 'Light Offset' },
            { key: 'C', label: 'Reflection' },
            { key: 'D', label: 'Mirror Focal Length' },
            { key: 'E', label: 'Lens Focal Length' }
          ].map(part => (
            <button
              key={part.key}
              onClick={() => setCurrentPart(part.key)}
              className={`px-3 py-2 text-sm font-medium rounded border ${
                currentPart === part.key
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Part {part.key}: {part.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-gray-300 rounded bg-gray-50"
        />
      </div>
      
      {/* Controls */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Controls:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPart === 'A' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Incident Angle (°)</label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={simulationState.A.incidentAngle}
                  onChange={(e) => updateParameter('A', 'incidentAngle', e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{simulationState.A.incidentAngle.toFixed(1)}°</span>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Refracted Angle (°)</label>
                <span className="block text-sm text-gray-600">{simulationState.A.refractedAngle.toFixed(1)}° (calculated)</span>
              </div>
            </>
          )}
          
          {currentPart === 'B' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Incident Angle (°)</label>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={simulationState.B.incidentAngle}
                  onChange={(e) => updateParameter('B', 'incidentAngle', e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{simulationState.B.incidentAngle.toFixed(1)}°</span>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Displacement (cm)</label>
                <span className="block text-sm text-gray-600">{simulationState.B.displacement.toFixed(2)} cm</span>
              </div>
            </>
          )}
          
          {currentPart === 'C' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Incident Angle (°)</label>
              <input
                type="range"
                min="10"
                max="80"
                value={simulationState.C.incidentAngle}
                onChange={(e) => updateParameter('C', 'incidentAngle', e.target.value)}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{simulationState.C.incidentAngle.toFixed(1)}°</span>
            </div>
          )}
          
          {currentPart === 'D' && (
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Select Mirror:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(simulationState.D.mirrors).map(([key, mirror]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSimulationState(prev => ({
                        ...prev,
                        D: { ...prev.D, currentMirror: key }
                      }));
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                      simulationState.D.currentMirror === key
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mirror.name}
                    <br />
                    <span className="text-xs text-gray-500">f = {mirror.focal.toFixed(1)} cm</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Current: {simulationState.D.mirrors[simulationState.D.currentMirror].name} 
                (f = {simulationState.D.mirrors[simulationState.D.currentMirror].focal.toFixed(1)} cm)
              </div>
            </div>
          )}
          
          {currentPart === 'E' && (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Converging Lens Focal Length (cm)</label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={simulationState.E.convergingFocal}
                  onChange={(e) => updateParameter('E', 'convergingFocal', e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{simulationState.E.convergingFocal.toFixed(1)} cm</span>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Diverging Lens Focal Length (cm)</label>
                <input
                  type="range"
                  min="-20"
                  max="-5"
                  value={simulationState.E.divergingFocal}
                  onChange={(e) => updateParameter('E', 'divergingFocal', e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{simulationState.E.divergingFocal.toFixed(1)} cm</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Data Collection */}
      <div className="flex gap-4 items-center">
        <button
          onClick={collectTrialData}
          disabled={currentPart === 'A' && simulationState.A.trialCount >= 5}
          className={`px-4 py-2 font-medium rounded transition-colors ${
            currentPart === 'A' && simulationState.A.trialCount >= 5
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : currentPart === 'A' && isDuplicateAngle(simulationState.A.incidentAngle)
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentPart === 'A' 
            ? simulationState.A.trialCount >= 5 
              ? 'All Trials Complete'
              : isDuplicateAngle(simulationState.A.incidentAngle)
              ? `Change Angle (${simulationState.A.incidentAngle.toFixed(1)}° used)`
              : `Collect Trial ${simulationState.A.trialCount + 1}`
            : 'Collect Data'
          }
        </button>
        
        {currentPart === 'A' && (
          <div className="text-sm text-gray-600">
            <div>Trials collected: {simulationState.A.trialCount}/5</div>
            {simulationState.A.trialCount > 0 && (
              <div className="text-xs mt-1">
                Used angles: {Object.values(simulationState.A.trials).map(t => `${t.incidentAngle}°`).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const LabMirrorsLenses = () => {
  // Track lab started state
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track current section
  const [currentSection, setCurrentSection] = useState('introduction');
  
  // Track completion status for each section
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    equipment: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    postlab: 'not-started'
  });
  
  // Track equipment method selection
  const [equipmentMethod, setEquipmentMethod] = useState({
    simulation: false,
    physical: false
  });
  
  // Track procedure understanding confirmation
  const [procedureUnderstood, setProcedureUnderstood] = useState(false);
  
  // Track observation data
  const [observationData, setObservationData] = useState({
    // Part A: Index of Refraction
    indexRefraction: {
      trial1: { incidentAngle: '', refractedAngle: '', calculatedIndex: '' },
      trial2: { incidentAngle: '', refractedAngle: '', calculatedIndex: '' },
      trial3: { incidentAngle: '', refractedAngle: '', calculatedIndex: '' },
      trial4: { incidentAngle: '', refractedAngle: '', calculatedIndex: '' },
      trial5: { incidentAngle: '', refractedAngle: '', calculatedIndex: '' }
    },
    // Part B: Light Offset
    lightOffset: {
      displacement: ''
    },
    // Part C: Law of Reflection
    reflection: {
      incidentAngle: '',
      reflectedAngle: ''
    },
    // Part D: Mirror Focal Length
    mirrorFocalLength: {
      converging: '',
      diverging: ''
    },
    // Part E: Lens Focal Length
    lensFocalLength: {
      converging: '',
      diverging: ''
    }
  });
  
  // Track analysis values
  const [analysisData, setAnalysisData] = useState({
    averageRefractiveIndex: '',
    percentErrorWater: '',
    displacement: '',
    mirrorFocalLengths: { converging: '', diverging: '' },
    lensFocalLengths: { converging: '', diverging: '' }
  });
  
  
  // Track post-lab answers
  const [postLabAnswers, setPostLabAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: ''
  });
  
  // Track notifications
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  // Calculate completion counts
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = Object.keys(sectionStatus).length;
  
  // Helper function to start the lab
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('introduction');
    
    // Mark introduction as completed since they've read it
    setSectionStatus(prev => ({
      ...prev,
      introduction: 'completed'
    }));
  };
  
  // Helper function to save and end
  const saveAndEnd = () => {
    setLabStarted(false);
    setHasSavedProgress(true);
    showNotification('Progress saved successfully!', 'success');
  };
  
  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // Scroll to section
  const scrollToSection = (sectionName) => {
    setCurrentSection(sectionName);
    const element = document.getElementById(`section-${sectionName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Get section status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };
  
  // Update equipment method selection
  const updateEquipmentMethod = (method, checked) => {
    setEquipmentMethod(prev => ({
      ...prev,
      [method]: checked
    }));
    
    // Check if at least one method is selected
    const newMethodState = { ...equipmentMethod, [method]: checked };
    const anySelected = Object.values(newMethodState).some(val => val === true);
    
    setSectionStatus(prev => ({
      ...prev,
      equipment: anySelected ? 'completed' : 'not-started'
    }));
  };
  
  // Update procedure understanding
  const updateProcedureUnderstood = (checked) => {
    setProcedureUnderstood(checked);
    setSectionStatus(prev => ({
      ...prev,
      procedure: checked ? 'completed' : 'not-started'
    }));
  };
  
  // Update observation data
  const updateObservationData = (section, trial, field, value) => {
    if (section === 'indexRefraction') {
      setObservationData(prev => ({
        ...prev,
        indexRefraction: {
          ...prev.indexRefraction,
          [trial]: {
            ...prev.indexRefraction[trial],
            [field]: value
          }
        }
      }));
    } else {
      setObservationData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
    
    checkObservationCompletion();
  };
  
  // Check observation completion
  const checkObservationCompletion = () => {
    let totalFields = 0;
    let filledFields = 0;
    
    // Count index refraction fields
    Object.values(observationData.indexRefraction).forEach(trial => {
      totalFields += 3;
      if (trial.incidentAngle) filledFields++;
      if (trial.refractedAngle) filledFields++;
      if (trial.calculatedIndex) filledFields++;
    });
    
    // Count other observation fields
    totalFields += 6; // displacement, incident/reflected angles, 4 focal lengths
    if (observationData.lightOffset.displacement) filledFields++;
    if (observationData.reflection.incidentAngle) filledFields++;
    if (observationData.reflection.reflectedAngle) filledFields++;
    if (observationData.mirrorFocalLength.converging) filledFields++;
    if (observationData.mirrorFocalLength.diverging) filledFields++;
    if (observationData.lensFocalLength.converging) filledFields++;
    if (observationData.lensFocalLength.diverging) filledFields++;
    
    const percentage = (filledFields / totalFields) * 100;
    
    if (percentage === 0) {
      setSectionStatus(prev => ({ ...prev, observations: 'not-started' }));
    } else if (percentage === 100) {
      setSectionStatus(prev => ({ ...prev, observations: 'completed' }));
    } else {
      setSectionStatus(prev => ({ ...prev, observations: 'in-progress' }));
    }
  };
  
  // Calculate refractive index for a trial
  const calculateRefractiveIndex = (incidentAngle, refractedAngle) => {
    if (!incidentAngle || !refractedAngle) return '';
    
    const i = parseFloat(incidentAngle) * Math.PI / 180;
    const r = parseFloat(refractedAngle) * Math.PI / 180;
    
    const n = Math.sin(i) / Math.sin(r);
    return n.toFixed(3);
  };
  
  // Calculate average refractive index
  const calculateAverageRefractiveIndex = () => {
    const indices = [];
    Object.values(observationData.indexRefraction).forEach(trial => {
      if (trial.calculatedIndex) {
        indices.push(parseFloat(trial.calculatedIndex));
      }
    });
    
    if (indices.length === 0) return '';
    
    const average = indices.reduce((sum, val) => sum + val, 0) / indices.length;
    return average.toFixed(3);
  };
  
  // Calculate percent error
  const calculatePercentError = (experimental, accepted) => {
    if (!experimental || !accepted) return '';
    
    const error = Math.abs(parseFloat(experimental) - parseFloat(accepted)) / parseFloat(accepted) * 100;
    return error.toFixed(2);
  };
  
  // Check if calculated index is correct
  const isCalculatedIndexCorrect = (trial, studentAnswer) => {
    if (!studentAnswer) return false;
    
    const trialData = observationData.indexRefraction[`trial${trial}`];
    if (!trialData.incidentAngle || !trialData.refractedAngle) return false;
    
    const correctIndex = calculateRefractiveIndex(trialData.incidentAngle, trialData.refractedAngle);
    if (!correctIndex) return false;
    
    const studentValue = parseFloat(studentAnswer);
    const correctValue = parseFloat(correctIndex);
    
    return Math.abs(studentValue - correctValue) <= 0.01; // Within 2 decimal places
  };
  
  // Check if average is correct
  const isAverageCorrect = (studentAnswer) => {
    if (!studentAnswer) return false;
    
    const correctAverage = calculateAverageRefractiveIndex();
    if (!correctAverage) return false;
    
    const studentValue = parseFloat(studentAnswer);
    const correctValue = parseFloat(correctAverage);
    
    return Math.abs(studentValue - correctValue) <= 0.01;
  };
  
  // Check if percent error is correct
  const isPercentErrorCorrect = (studentAnswer) => {
    if (!studentAnswer || !analysisData.averageRefractiveIndex) return false;
    
    const correctError = calculatePercentError(analysisData.averageRefractiveIndex, '1.33');
    if (!correctError) return false;
    
    const studentValue = parseFloat(studentAnswer);
    const correctValue = parseFloat(correctError);
    
    return Math.abs(studentValue - correctValue) <= 0.1;
  };
  
  // Update analysis data
  const updateAnalysisData = (field, value) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }));
    
    checkAnalysisCompletion();
  };
  
  // Check analysis completion
  const checkAnalysisCompletion = () => {
    const fields = Object.values(analysisData);
    const filledFields = fields.filter(field => {
      if (typeof field === 'object') {
        return Object.values(field).every(val => val !== '');
      }
      return field !== '';
    }).length;
    
    if (filledFields === 0) {
      setSectionStatus(prev => ({ ...prev, analysis: 'not-started' }));
    } else if (filledFields === fields.length) {
      setSectionStatus(prev => ({ ...prev, analysis: 'completed' }));
    } else {
      setSectionStatus(prev => ({ ...prev, analysis: 'in-progress' }));
    }
  };
  
  
  // Update post-lab answers
  const updatePostLabAnswer = (question, value) => {
    setPostLabAnswers(prev => ({
      ...prev,
      [question]: value
    }));
    
    // Check completion based on all questions
    const updatedAnswers = { ...postLabAnswers, [question]: value };
    const answeredQuestions = Object.values(updatedAnswers).filter(answer => answer.trim().length > 20).length;
    const totalQuestions = Object.keys(updatedAnswers).length;
    
    setSectionStatus(prev => ({
      ...prev,
      postlab: answeredQuestions === totalQuestions ? 'completed' : answeredQuestions > 0 ? 'in-progress' : 'not-started'
    }));
  };
  
  // Show start lab screen if lab hasn't started
  if (!labStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Lab 2 - Mirrors and Lenses</h1>
        
        {/* Introduction Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Using a series of lenses, mirrors, and a light source we can examine several different optical effects. 
              This lab consists of five mini-experiments, each taking only about five minutes to complete.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 font-semibold mb-2">⚠️ Safety Precautions:</p>
              <ul className="list-disc list-inside text-amber-700 space-y-1">
                <li>Do not look directly into the light beam, especially when passing through a lens</li>
                <li>Be careful of electrical hazards when using water near the light source</li>
                <li>Handle optical equipment with care to avoid scratches or damage</li>
              </ul>
            </div>
          </div>
          
          {/* Objectives Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Objectives</h2>
            <p className="text-gray-700 mb-3">In this lab, you will:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Measure the index of refraction of water</li>
              <li>Observe light displacement through a solid block</li>
              <li>Confirm the law of reflection for plane mirrors</li>
              <li>Determine focal lengths of curved mirrors</li>
              <li>Determine focal lengths of converging and diverging lenses</li>
            </ul>
          </div>
        </div>
        
        {/* Start Lab Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {hasSavedProgress ? 'Welcome Back!' : 'Ready to Begin?'}
            </h2>
            <p className="text-gray-600 mb-4">
              {hasSavedProgress 
                ? 'Your progress has been saved. You can continue where you left off.'
                : 'This lab contains 5 mini-experiments with data collection and analysis. You can save your progress and return later if needed.'
              }
            </p>
            
            {/* Progress Summary for returning students */}
            {hasSavedProgress && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Progress:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(sectionStatus).map(([section, status]) => (
                    <div key={section} className="flex items-center gap-1">
                      <span className={`text-xs ${
                        status === 'completed' ? 'text-green-600' : 
                        status === 'in-progress' ? 'text-yellow-600' : 
                        'text-gray-400'
                      }`}>
                        {status === 'completed' ? '✓' : 
                         status === 'in-progress' ? '◐' : '○'}
                      </span>
                      <span className="text-xs text-gray-600 capitalize">
                        {section === 'postlab' ? 'Post-Lab' : section}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedCount} of {totalSections} sections completed
                </p>
              </div>
            )}
            
            <button
              onClick={startLab}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200 text-lg"
            >
              {hasSavedProgress ? 'Continue Lab' : 'Start Lab'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lab 2 - Mirrors and Lenses</h1>
      
      {/* Combined Navigation & Progress */}
      <div className="sticky top-0 z-10 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'introduction', label: 'Intro' },
                { key: 'equipment', label: 'Equipment' },
                { key: 'procedure', label: 'Procedure' },
                { key: 'simulation', label: 'Simulation' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'postlab', label: 'Post-Lab' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.key)}
                  className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                    sectionStatus[section.key] === 'completed'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : sectionStatus[section.key] === 'in-progress'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                      : currentSection === section.key 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{section.label}</span>
                  {sectionStatus[section.key] === 'completed' && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>
            
            {/* Save and End Button */}
            <button 
              onClick={saveAndEnd}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded border border-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Save and End
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Component */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-lg p-4 transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-800' 
            : 'bg-red-100 border border-red-400 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Introduction Section (Already shown, but kept for navigation) */}
      <div id="section-introduction" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.introduction)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Introduction</h2>
        <p className="text-gray-700">
          ✓ You have read the introduction and objectives for this lab.
        </p>
      </div>
      
      {/* Equipment Section */}
      <div id="section-equipment" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.equipment)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Equipment</h2>
        
        {/* Equipment List */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Required Equipment:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Single beam light source</li>
              <li>Multiple beam light source</li>
              <li>Semicircular dish</li>
              <li>Solid transparent block</li>
              <li>Plane mirror</li>
              <li>Curved mirror(s)</li>
            </ul>
            <ul className="list-disc list-inside space-y-1">
              <li>Converging/diverging lens(es)</li>
              <li>Protractor</li>
              <li>Ruler</li>
              <li>Blank paper sheets</li>
              <li>Water for semicircular dish</li>
            </ul>
          </div>
        </div>
        
        {/* Method Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">I will be completing this lab using:</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 text-gray-700">
              <input
                type="checkbox"
                checked={equipmentMethod.simulation}
                onChange={(e) => updateEquipmentMethod('simulation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Simulation</span>
            </label>
            <label className="flex items-center space-x-3 text-gray-700">
              <input
                type="checkbox"
                checked={equipmentMethod.physical}
                onChange={(e) => updateEquipmentMethod('physical', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Physical Equipment</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Procedure Section */}
      <div id="section-procedure" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.procedure)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Procedure</h2>
        
        {/* Part A: Index of Refraction */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part A: Index of Refraction of Water</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Place the dish on paper and trace around it. Mark a dot near the center of the flat side.</li>
            <li>Shine the single beam at an angle to strike the dot. Trace and mark as "Beam 1i".</li>
            <li>Mark where the refracted beam exits on the curved side as "Beam 1r".</li>
            <li>Repeat for several different incident angles with unique beam numbers.</li>
            <li>Remove dish, draw normal line, and measure all angles.</li>
          </ol>
        </div>
        
        {/* Part B: Light Offset */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part B: Offset of Light Through a Solid</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Place the block on blank paper and trace around it.</li>
            <li>Aim the beam at an angle to the surface of the block.</li>
            <li>Trace the incident ray and the exiting ray.</li>
            <li>Remove the block and extend both rays (should be parallel).</li>
            <li>Measure the perpendicular displacement between the beams.</li>
          </ol>
        </div>
        
        {/* Part C: Law of Reflection */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part C: Law of Reflection (Plane Mirror)</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Place the plane mirror on paper and trace its reflective surface.</li>
            <li>Aim the beam at an angle to the surface.</li>
            <li>Trace the incident and reflected rays.</li>
            <li>Remove mirror and draw the normal line.</li>
            <li>Measure the incident and reflected angles.</li>
          </ol>
        </div>
        
        {/* Part D: Mirror Focal Length */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part D: Focal Length (Curved Mirrors)</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Place the curved mirror on paper and trace its reflective surface.</li>
            <li>Aim multiple beams parallel to the principal axis.</li>
            <li>Trace the incident and reflected beams.</li>
            <li>Measure the focal length.</li>
          </ol>
        </div>
        
        {/* Part E: Lens Focal Length */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part E: Focal Length (Lenses)</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Place the lens on paper and trace its surface.</li>
            <li>Aim multiple beams parallel to the principal axis.</li>
            <li>Trace the incident and refracted beams.</li>
            <li>Measure the focal length.</li>
          </ol>
        </div>
        
        {/* Procedure Confirmation */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="flex items-start space-x-3 text-gray-700">
            <input
              type="checkbox"
              checked={procedureUnderstood}
              onChange={(e) => updateProcedureUnderstood(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <span className="font-semibold">I have read and understand the procedure for all parts of this lab.</span>
          </label>
        </div>
      </div>
      
      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Interactive Simulation</h2>
        <OpticsSimulation 
          onDataCollected={(part, data) => {
            // Handle data collection from simulation
            if (part === 'A') {
              // Index of refraction data - only populate angles, let students calculate index
              Object.keys(data).forEach(trial => {
                updateObservationData('indexRefraction', trial, 'incidentAngle', data[trial].incidentAngle);
                updateObservationData('indexRefraction', trial, 'refractedAngle', data[trial].refractedAngle);
                // Don't auto-populate calculatedIndex - student must calculate it
              });
            } else if (part === 'B') {
              // Light offset data
              updateObservationData('lightOffset', null, 'displacement', data.displacement);
            } else if (part === 'C') {
              // Reflection data
              updateObservationData('reflection', null, 'incidentAngle', data.incidentAngle);
              updateObservationData('reflection', null, 'reflectedAngle', data.reflectedAngle);
            } else if (part === 'D') {
              // Mirror focal length data
              if (data.converging) updateObservationData('mirrorFocalLength', null, 'converging', data.converging);
              if (data.diverging) updateObservationData('mirrorFocalLength', null, 'diverging', data.diverging);
            } else if (part === 'E') {
              // Lens focal length data
              if (data.converging) updateObservationData('lensFocalLength', null, 'converging', data.converging);
              if (data.diverging) updateObservationData('lensFocalLength', null, 'diverging', data.diverging);
            }
            
            // Mark simulation as completed
            setSectionStatus(prev => ({
              ...prev,
              simulation: 'completed'
            }));
          }}
        />
      </div>
      
      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Observations & Data Collection</h2>
        
        {/* Part A: Index of Refraction Data */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Part A: Index of Refraction of Water</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Trial</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Incident Angle (°)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Refracted Angle (°)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Calculated Index</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(trial => (
                  <tr key={trial}>
                    <td className="border border-gray-300 px-4 py-2">{trial}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={observationData.indexRefraction[`trial${trial}`].incidentAngle}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                        placeholder=""
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={observationData.indexRefraction[`trial${trial}`].refractedAngle}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                        placeholder=""
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={observationData.indexRefraction[`trial${trial}`].calculatedIndex}
                        onChange={(e) => {
                          updateObservationData('indexRefraction', `trial${trial}`, 'calculatedIndex', e.target.value);
                        }}
                        className={`w-full px-2 py-1 border border-gray-300 rounded ${
                          isCalculatedIndexCorrect(trial, observationData.indexRefraction[`trial${trial}`].calculatedIndex)
                            ? 'bg-green-100 border-green-400'
                            : 'bg-white'
                        }`}
                        placeholder=""
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Hint:</strong> Correct answers will turn green when entered to 2 decimal places.
            </p>
          </div>
        </div>
        
        {/* Part B: Light Offset */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Part B: Light Offset Through Solid</h3>
          <div className="flex items-center gap-3">
            <label className="text-gray-700">Displacement between beams:</label>
            <input
              type="number"
              step="0.01"
              value={observationData.lightOffset.displacement}
              readOnly
              className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
              placeholder="0.00"
            />
            <span className="text-gray-600">cm</span>
          </div>
        </div>
        
        {/* Part C: Reflection Angles */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Part C: Law of Reflection</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Incident Angle:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.reflection.incidentAngle}
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                placeholder="0.0"
              />
              <span className="text-gray-600">°</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Reflected Angle:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.reflection.reflectedAngle}
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                placeholder="0.0"
              />
              <span className="text-gray-600">°</span>
            </div>
          </div>
        </div>
        
        {/* Part D: Mirror Focal Lengths */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Part D: Mirror Focal Lengths</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Converging Mirror:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.mirrorFocalLength.converging}
                onChange={(e) => updateObservationData('mirrorFocalLength', null, 'converging', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="0.0"
              />
              <span className="text-gray-600">cm</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Diverging Mirror:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.mirrorFocalLength.diverging}
                onChange={(e) => updateObservationData('mirrorFocalLength', null, 'diverging', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="0.0"
              />
              <span className="text-gray-600">cm</span>
            </div>
          </div>
        </div>
        
        {/* Part E: Lens Focal Lengths */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Part E: Lens Focal Lengths</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Converging Lens:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.lensFocalLength.converging}
                onChange={(e) => updateObservationData('lensFocalLength', null, 'converging', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="0.0"
              />
              <span className="text-gray-600">cm</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-gray-700 w-40">Diverging Lens:</label>
              <input
                type="number"
                step="0.1"
                value={observationData.lensFocalLength.diverging}
                onChange={(e) => updateObservationData('lensFocalLength', null, 'diverging', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="0.0"
              />
              <span className="text-gray-600">cm</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Analysis</h2>
        
        {/* Part A Analysis */}
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Part A: Index of Refraction</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-gray-700">Average refractive index of water:</label>
              <input
                type="number"
                step="0.001"
                value={analysisData.averageRefractiveIndex}
                onChange={(e) => updateAnalysisData('averageRefractiveIndex', e.target.value)}
                className={`px-3 py-2 border rounded ${
                  isAverageCorrect(analysisData.averageRefractiveIndex)
                    ? 'bg-green-100 border-green-400'
                    : 'border-gray-300'
                }`}
                placeholder=""
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-gray-700">Percent error (accepted value = 1.33):</label>
              <input
                type="number"
                step="0.01"
                value={analysisData.percentErrorWater}
                onChange={(e) => updateAnalysisData('percentErrorWater', e.target.value)}
                className={`px-3 py-2 border rounded ${
                  isPercentErrorCorrect(analysisData.percentErrorWater)
                    ? 'bg-green-100 border-green-400'
                    : 'border-gray-300'
                }`}
                placeholder=""
              />
              <span className="text-gray-600">%</span>
            </div>
          </div>
        </div>
        
        
        {/* Part D & E Analysis */}
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Summary of Focal Lengths</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Mirrors:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Converging: {observationData.mirrorFocalLength.converging || '___'} cm</li>
                <li>Diverging: {observationData.mirrorFocalLength.diverging || '___'} cm</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Lenses:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Converging: {observationData.lensFocalLength.converging || '___'} cm</li>
                <li>Diverging: {observationData.lensFocalLength.diverging || '___'} cm</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Post-Lab Questions Section */}
      <div id="section-postlab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.postlab)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Post-Lab Questions</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              1. Explain the displacement between the incident and exit beams in Part B. Why do the beams appear parallel but offset?
            </label>
            <textarea
              value={postLabAnswers.question1}
              onChange={(e) => updatePostLabAnswer('question1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Explain the physics behind the beam displacement..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Hint: Consider what happens to light as it enters and exits materials with different refractive indices.
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              2. In Part C (Law of Reflection), what is the relationship between the incident angle and reflected angle? Why must this relationship always hold true?
            </label>
            <textarea
              value={postLabAnswers.question2}
              onChange={(e) => updatePostLabAnswer('question2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Describe the law of reflection and explain why it occurs..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Hint: Consider the principle of least time and how light behaves at smooth surfaces.
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              3. In Parts D and E (Focal Length Determination), why do the incoming rays need to be parallel to the principal axis to accurately determine the focal length?
            </label>
            <textarea
              value={postLabAnswers.question3}
              onChange={(e) => updatePostLabAnswer('question3', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Explain why parallel rays are essential for focal length measurements..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Hint: Think about the definition of focal point and how mirrors/lenses focus light.
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              4. Compare the behavior of converging versus diverging mirrors and lenses. How can you distinguish between them based on their focal lengths and ray diagrams?
            </label>
            <textarea
              value={postLabAnswers.question4}
              onChange={(e) => updatePostLabAnswer('question4', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Describe the differences between converging and diverging optical elements..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Hint: Consider positive vs. negative focal lengths and where the focal points are located.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabMirrorsLenses;
