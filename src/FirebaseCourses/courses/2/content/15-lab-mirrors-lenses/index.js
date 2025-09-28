import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, set, update, onValue, serverTimestamp } from 'firebase/database';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';

/**
 * Lab 2 - Mirrors and Lenses for Physics 30
 * Item ID: assignment_1747283296777_955
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
      currentMirror: 'converging',
      mirrors: {
        converging: { type: 'converging', focal: 30.0, name: 'Converging Mirror' },
        diverging: { type: 'diverging', focal: -25.0, name: 'Diverging Mirror' }
      }
    },
    E: { // Lens Focal Length
      currentLens: 'converging',
      lenses: {
        converging: { type: 'converging', focal: 10.0, name: 'Converging Lens' },
        diverging: { type: 'diverging', focal: -8.0, name: 'Diverging Lens' }
      }
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
    const focalLength = Math.abs(currentMirror.focal) * 2; // Scale up for better visualization
    const isConverging = currentMirror.type === 'converging';
    const mirrorHeight = 140; // Increased mirror size
    
    // Draw principal axis
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Mirror surface parameters
    const mirrorStartY = centerY - mirrorHeight / 2;
    const mirrorEndY = centerY + mirrorHeight / 2;
    const mirrorX = isConverging ? centerX + 100 : centerX + 50; // Position converging mirror further right
    
    // Draw mirror surface (larger and more visible)
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 6;
    
    if (isConverging) {
      // Draw converging mirror (concave) - curved surface facing left
      const radius = focalLength * 2;
      const centerOfCurvature = mirrorX - radius;
      ctx.beginPath();
      const startAngle = Math.asin(mirrorHeight / 2 / radius);
      ctx.arc(centerOfCurvature, centerY, radius, -startAngle, startAngle);
      ctx.stroke();
    } else {
      // Draw diverging mirror (convex) - curved surface facing right
      const radius = focalLength * 2;
      const centerOfCurvature = mirrorX + radius;
      ctx.beginPath();
      const startAngle = Math.asin(mirrorHeight / 2 / radius);
      ctx.arc(centerOfCurvature, centerY, radius, Math.PI - startAngle, Math.PI + startAngle);
      ctx.stroke();
    }
    
    // Draw multiple parallel incident rays (solid lines)
    const rayYPositions = [
      centerY - mirrorHeight / 3,
      centerY,
      centerY + mirrorHeight / 3
    ];
    
    rayYPositions.forEach((rayY, index) => {
      // Calculate intersection point with mirror first
      let intersectionX = mirrorX;
      let intersectionY = rayY;
      
      if (isConverging) {
        // For concave mirror, adjust intersection based on curvature
        const radius = focalLength * 2;
        const centerOfCurvature = mirrorX - radius;
        const distFromAxis = Math.abs(rayY - centerY);
        intersectionX = centerOfCurvature + Math.sqrt(radius * radius - distFromAxis * distFromAxis);
      } else {
        // For convex mirror, adjust intersection based on curvature
        const radius = focalLength * 2;
        const centerOfCurvature = mirrorX + radius;
        const distFromAxis = Math.abs(rayY - centerY);
        intersectionX = centerOfCurvature - Math.sqrt(radius * radius - distFromAxis * distFromAxis);
      }
      
      // Incident ray (solid line) - make shorter for converging mirror
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      const incidentStartX = isConverging ? Math.max(20, intersectionX - 150) : 50;
      ctx.moveTo(incidentStartX, rayY);
      ctx.lineTo(intersectionX, intersectionY);
      ctx.stroke();
      
      // Reflected ray (dotted line)
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(intersectionX, intersectionY);
      
      if (isConverging) {
        // For converging mirror: all rays converge to focal point
        const focalX = mirrorX - focalLength;
        ctx.lineTo(focalX, centerY);
        
        // Extend beyond focal point (shorter for top/bottom rays)
        const isOffAxis = Math.abs(rayY - centerY) > 5; // Check if it's top or bottom ray
        const extensionLength = isOffAxis ? 40 : 60; // Shorter extension for off-axis rays
        const extendedX = focalX - extensionLength;
        const slope = (centerY - intersectionY) / (focalX - intersectionX);
        const extendedY = centerY + slope * (extendedX - focalX);
        ctx.lineTo(extendedX, extendedY);
      } else {
        // For diverging mirror: rays appear to diverge from virtual focal point
        const virtualFocalX = mirrorX + focalLength;
        const slope = (intersectionY - centerY) / (intersectionX - virtualFocalX);
        const endX = width - 50;
        const endY = intersectionY + slope * (endX - intersectionX);
        ctx.lineTo(endX, endY);
        
        // Draw virtual rays (lighter dotted lines) showing where they appear to come from
        ctx.strokeStyle = '#a7f3d0';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(virtualFocalX, centerY);
        ctx.lineTo(intersectionX, intersectionY);
        ctx.stroke();
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // Draw center ray (along principal axis) for converging mirror
    if (isConverging) {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(50, centerY);
      ctx.lineTo(mirrorX, centerY);
      ctx.stroke();
      
      // Extend center ray to the right (reflects back on itself)
      ctx.strokeStyle = '#059669';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mirrorX, centerY);
      ctx.lineTo(width - 50, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw focal point
    const focalX = isConverging ? mirrorX - focalLength : mirrorX + focalLength;
    ctx.fillStyle = isConverging ? '#dc2626' : '#7c3aed';
    ctx.beginPath();
    ctx.arc(focalX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw focal point label
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText('F', focalX - 5, centerY - 10);
    ctx.fillText(`f = ${currentMirror.focal.toFixed(1)} cm`, focalX - 25, centerY + 25);
    
    // Draw mirror type label
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(currentMirror.name, centerX - 60, centerY - 80);
    
    // Add legend
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('Legend:', 20, 30);
    
    // Incident ray legend
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(20, 45);
    ctx.lineTo(60, 45);
    ctx.stroke();
    ctx.fillText('Incident rays', 70, 49);
    
    // Reflected ray legend
    ctx.strokeStyle = '#059669';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, 65);
    ctx.lineTo(60, 65);
    ctx.stroke();
    ctx.fillText('Reflected rays', 70, 69);
    ctx.setLineDash([]);
  };
  
  // Draw lens simulation (Part E)
  const drawLensSimulation = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const currentLens = simulationState.E.currentLens || 'converging';
    const lensData = simulationState.E.lenses[currentLens];
    const focalLength = Math.abs(lensData.focal) * 2; // Scale up for better visualization
    const isConverging = currentLens === 'converging';
    const lensHeight = 140; // Same as mirror height
    
    // Draw principal axis
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Lens position
    const lensX = centerX + 50;
    
    // Draw lens
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    
    if (isConverging) {
      // Draw converging lens (biconvex) - surfaces touch at top and bottom
      ctx.arc(lensX - 70, centerY, 100, -Math.PI/4, Math.PI/4);
      ctx.arc(lensX + 70, centerY, 100, Math.PI*3/4, Math.PI*5/4);
    } else {
      // Draw diverging lens (biconcave) - longer
      ctx.arc(lensX + 110, centerY, 100, Math.PI*3/4, Math.PI*5/4);
      ctx.arc(lensX - 110, centerY, 100, -Math.PI/4, Math.PI/4);
    }
    ctx.stroke();
    
    // Draw multiple parallel incident rays
    const rayYPositions = [
      centerY - lensHeight / 3,
      centerY,
      centerY + lensHeight / 3
    ];
    
    rayYPositions.forEach((rayY, index) => {
      // Incident ray (solid line)
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(20, rayY);
      ctx.lineTo(lensX, rayY);
      ctx.stroke();
      
      // Refracted ray (dotted line)
      ctx.strokeStyle = '#047857'; // Darker green
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lensX, rayY);
      
      if (isConverging) {
        // For converging lens: all rays converge to focal point
        const focalX = lensX + focalLength + 60; // Match the focal point position
        ctx.lineTo(focalX, centerY);
        
        // Extend beyond focal point (shorter for top/bottom rays)
        const isOffAxis = Math.abs(rayY - centerY) > 5;
        const extensionLength = isOffAxis ? 40 : 60;
        const extendedX = focalX + extensionLength;
        const slope = (centerY - rayY) / (focalX - lensX);
        const extendedY = centerY + slope * extensionLength;
        ctx.lineTo(extendedX, extendedY);
      } else {
        // For diverging lens: rays appear to diverge from virtual focal point
        const virtualFocalX = lensX - focalLength - 80; // Match the focal point position
        const slope = (rayY - centerY) / (lensX - virtualFocalX);
        const endX = width - 15; // Extended even further to the right for all rays
        const endY = rayY + slope * (endX - lensX);
        ctx.lineTo(endX, endY);
        
        // Draw virtual rays (lighter dotted lines) showing where they appear to come from
        ctx.strokeStyle = '#86efac'; // Lighter version of darker green
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(virtualFocalX, centerY);
        ctx.lineTo(lensX, rayY);
        ctx.stroke();
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // Draw center ray (along principal axis)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(20, centerY);
    ctx.lineTo(lensX, centerY);
    ctx.stroke();
    
    // Center ray passes through lens unchanged
    ctx.strokeStyle = '#047857'; // Darker green
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(lensX, centerY);
    ctx.lineTo(width - 20, centerY); // Extended further to the right
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw focal point
    const focalX = isConverging ? lensX + focalLength + 60 : lensX - focalLength - 80;
    ctx.fillStyle = isConverging ? '#dc2626' : '#7c3aed';
    ctx.beginPath();
    ctx.arc(focalX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw focal point label
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText('F', focalX - 5, centerY - 10);
    const actualFocalLength = lensData.focal;
    ctx.fillText(`f = ${actualFocalLength.toFixed(1)} cm`, focalX - 25, centerY + 25);
    
    // Draw lens type label
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#3b82f6';
    const lensName = isConverging ? 'Converging Lens' : 'Diverging Lens';
    ctx.fillText(lensName, centerX - 60, centerY - 80);
    
    // Add legend
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.fillText('Legend:', 20, 30);
    
    // Incident ray legend
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(20, 45);
    ctx.lineTo(60, 45);
    ctx.stroke();
    ctx.fillText('Incident rays', 70, 49);
    
    // Refracted ray legend
    ctx.strokeStyle = '#059669';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, 65);
    ctx.lineTo(60, 65);
    ctx.stroke();
    ctx.fillText('Refracted rays', 70, 69);
    ctx.setLineDash([]);
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
          const currentLens = simulationState.E.lenses[simulationState.E.currentLens];
          data = {
            [currentLens.type]: currentLens.focal.toFixed(1)
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
              <label className="block text-sm text-gray-700 mb-2">Select Mirror Type:</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(simulationState.D.mirrors).map(([key, mirror]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSimulationState(prev => ({
                        ...prev,
                        D: { ...prev.D, currentMirror: key }
                      }));
                    }}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      simulationState.D.currentMirror === key
                        ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{mirror.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      f = {mirror.focal.toFixed(1)} cm
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {mirror.type === 'converging' ? '(Concave)' : '(Convex)'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  Current: {simulationState.D.mirrors[simulationState.D.currentMirror].name}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Focal Length: {simulationState.D.mirrors[simulationState.D.currentMirror].focal.toFixed(1)} cm
                  {simulationState.D.mirrors[simulationState.D.currentMirror].type === 'converging' 
                    ? ' (positive - real focus)' 
                    : ' (negative - virtual focus)'}
                </div>
              </div>
            </div>
          )}
          
          {currentPart === 'E' && (
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Select Lens Type:</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(simulationState.E.lenses).map(([key, lens]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSimulationState(prev => ({
                        ...prev,
                        E: { ...prev.E, currentLens: key }
                      }));
                    }}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      simulationState.E.currentLens === key
                        ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{lens.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      f = {lens.focal.toFixed(1)} cm
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {lens.type === 'converging' ? '(Biconvex)' : '(Biconcave)'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  Current: {simulationState.E.lenses[simulationState.E.currentLens].name}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Focal Length: {simulationState.E.lenses[simulationState.E.currentLens].focal.toFixed(1)} cm
                  {simulationState.E.lenses[simulationState.E.currentLens].type === 'converging' 
                    ? ' (positive - real focus)' 
                    : ' (negative - virtual focus)'}
                </div>
              </div>
            </div>
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
const LabMirrorsLenses = ({
  courseId = '2',
  course,
  isStaffView = false,
  devMode = false,
  isViewingSubmission = false,
  submissionStudentKey = null,
  submissionData = null
}) => {
  const { currentUser } = useAuth();
  const database = getDatabase();

  // Debug render
  console.log('🔄 LabMirrorsLenses render', {
    isViewingSubmission,
    submissionStudentKey,
    hasSubmissionData: !!submissionData
  });

  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_mirrors_lenses']?.questions?.[0]?.questionId || 'course2_lab_mirrors_lenses';
  console.log('📋 Lab questionId:', questionId);

  // Create database reference for this lab using questionId - memoized to prevent re-creation
  // Use submission path if viewing submitted work, otherwise use regular path
  const labDataRef = React.useMemo(() => {
    if (isViewingSubmission && submissionStudentKey) {
      // Teacher viewing submitted work - use assessment path
      const path = `students/${submissionStudentKey}/courses/${courseId}/Assessments/${questionId}`;
      console.log('📂 Using submission path:', path);
      return ref(database, path);
    } else if (currentUser?.uid) {
      // Normal path for student working on lab
      const path = `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`;
      console.log('📂 Using working path:', path);
      return ref(database, path);
    }
    return null;
  }, [currentUser?.uid, database, courseId, questionId, isViewingSubmission, submissionStudentKey]);
  
  // Ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  
  // Track lab started state
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track saving state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Check if lab has been submitted
  const isSubmitted = course?.Assessments?.[questionId] !== undefined;
  
  // Overlay state
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  
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
  
  
  // Calculate completion counts
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = Object.keys(sectionStatus).length;

  // Save specific data to Firebase
  const saveToFirebase = useCallback(async (dataToUpdate) => {
    // Disable saving when viewing submissions
    if (isViewingSubmission) {
      console.log('🚫 Save blocked: viewing submission in read-only mode');
      return;
    }

    if (!currentUser?.uid || !labDataRef) {
      console.log('🚫 Save blocked: no user or ref');
      return;
    }

    try {
      console.log('💾 Saving to Firebase:', dataToUpdate);

      // Create the complete data object to save
      const dataToSave = {
        ...dataToUpdate,
        lastModified: serverTimestamp(),
        courseId: courseId,
        labId: '15-lab-mirrors-lenses'
      };

      // Use update instead of set to only update specific fields
      await update(labDataRef, dataToSave);
      console.log('✅ Save successful!');

      setHasSavedProgress(true);

    } catch (error) {
      console.error('❌ Save failed:', error);
      toast.error('Failed to save data. Please try again.');
    }
  }, [currentUser?.uid, labDataRef, courseId, isViewingSubmission]);
  
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
  
  // Load lab data from Firebase on component mount
  useEffect(() => {
    // For viewing submission, use the submissionData prop directly
    if (isViewingSubmission && submissionData) {
      console.log('📖 Loading submitted lab data from prop:', submissionData);
      setIsLoading(true);

      // Restore saved state from submissionData
      if (submissionData.sectionStatus) setSectionStatus(submissionData.sectionStatus);
      if (submissionData.equipmentMethod) setEquipmentMethod(submissionData.equipmentMethod);
      if (submissionData.procedureUnderstood !== undefined) setProcedureUnderstood(submissionData.procedureUnderstood);
      if (submissionData.observationData) {
        console.log('📊 Loading observation data:', submissionData.observationData);
        setObservationData(submissionData.observationData);
      }
      if (submissionData.analysisData) setAnalysisData(submissionData.analysisData);
      if (submissionData.postLabAnswers) setPostLabAnswers(submissionData.postLabAnswers);
      if (submissionData.currentSection) setCurrentSection(submissionData.currentSection);

      // Always show as started when viewing submission
      setLabStarted(true);
      setHasSavedProgress(true);
      setIsLoading(false);

      return; // Exit early, no need to set up Firebase listener
    }

    // Normal loading for non-submission viewing
    if (!currentUser?.uid || !labDataRef) return;

    setIsLoading(true);

    // Use a one-time listener that auto-unsubscribes
    let hasLoaded = false;
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      if (hasLoaded) return; // Prevent multiple loads
      hasLoaded = true;

      console.log('📡 Firebase data fetched:', snapshot.exists());

      if (snapshot.exists()) {
        const savedData = snapshot.val();
        console.log('📖 Loading saved lab data:', savedData);

        // Restore saved state
        if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
        if (savedData.equipmentMethod) setEquipmentMethod(savedData.equipmentMethod);
        if (savedData.procedureUnderstood !== undefined) setProcedureUnderstood(savedData.procedureUnderstood);
        if (savedData.observationData) {
          console.log('📊 Loading observation data:', savedData.observationData);
          setObservationData(savedData.observationData);
        }
        if (savedData.analysisData) setAnalysisData(savedData.analysisData);
        if (savedData.postLabAnswers) setPostLabAnswers(savedData.postLabAnswers);
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);

        setHasSavedProgress(true);
      } else {
        console.log('📝 No previous lab data found, starting fresh');
      }
      
      setIsLoading(false);
      
      // Unsubscribe after first load
      unsubscribe();
    }, (error) => {
      if (hasLoaded) return;
      hasLoaded = true;
      
      console.error('❌ Firebase load error:', error);
      setIsLoading(false);
      
      // Unsubscribe on error
      unsubscribe();
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid, courseId, questionId, isViewingSubmission, submissionData]);

  // Auto-start lab for staff view
  useEffect(() => {
    if (isStaffView && !labStarted) {
      setLabStarted(true);
      setCurrentSection('introduction');
      setSectionStatus(prev => ({
        ...prev,
        introduction: 'completed'
      }));
    }
  }, [isStaffView, labStarted]);

  // Helper function to save and end
  const saveAndEnd = async () => {
    await saveToFirebase({
      sectionStatus,
      equipmentMethod,
      procedureUnderstood,
      observationData,
      analysisData,
      postLabAnswers,
      currentSection,
      labStarted: false
    });
    setLabStarted(false);
  };
  
  // Submit lab for teacher review
  const submitLab = async () => {
    if (!currentUser) {
      toast.error('Please log in to submit your lab');
      return;
    }

    try {
      setIsSaving(true);
      
      // First save current progress
      await saveToFirebase({
        sectionStatus,
        equipmentMethod,
        procedureUnderstood,
        observationData,
        analysisData,
        postLabAnswers,
        currentSection,
        labStarted
      });

      // Then submit using the universal lab submission function
      const functions = getFunctions();
      const submitFunction = httpsCallable(functions, 'course2_lab_submit');
      
      const result = await submitFunction({
        questionId: questionId,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        courseId: courseId,
        isStaff: isStaffView
      });

      if (result.data.success) {
        setShowSubmissionOverlay(true);
        toast.success('Lab submitted successfully for teacher review!');
      } else {
        throw new Error(result.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Lab submission error:', error);
      toast.error(`Failed to submit lab: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Print PDF function
  const handlePrintPDF = async () => {
    try {
      // Dynamically import jsPDF to avoid bundle size issues
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      let yPosition = 20;
      
      // Helper function to check if we need a new page
      const checkNewPage = (additionalSpace = 20) => {
        if (yPosition > 270 - additionalSpace) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Helper function to add wrapped text
      const addText = (text, fontSize = 12, fontStyle = 'normal', maxWidth = 170) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        checkNewPage(lines.length * 5);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
      };
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Lab 2 - Mirrors and Lenses', 20, yPosition);
      yPosition += 25;
      
      // Add student info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student: ${currentUser?.email || 'Unknown'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;
      
      // Introduction Section
      addText('Introduction', 16, 'bold');
      addText('In this lab, you will investigate the properties of light as it interacts with different optical elements including water, mirrors, and lenses.');
      addText('Lab Objectives:', 14, 'bold');
      addText('• Measure the index of refraction of water');
      addText('• Observe light displacement through a solid block');
      addText('• Confirm the law of reflection for plane mirrors');
      addText('• Determine focal lengths of curved mirrors');
      addText('• Determine focal lengths of converging and diverging lenses');
      yPosition += 10;
      
      // Equipment Section
      checkNewPage(30);
      addText('Equipment and Materials', 16, 'bold');
      addText(`Method: ${equipmentMethod || 'Not specified'}`);
      yPosition += 10;
      
      // Procedure Section
      checkNewPage(30);
      addText('Procedure', 16, 'bold');
      addText('This lab consists of five parts, each investigating different optical phenomena:');
      addText('Part A: Index of Refraction - Using Snell\'s law to determine the refractive index of water');
      addText('Part B: Light Offset - Observing lateral displacement of light through a transparent block');
      addText('Part C: Law of Reflection - Verifying that the angle of incidence equals the angle of reflection');
      addText('Part D: Mirror Focal Length - Measuring focal lengths of converging and diverging mirrors');
      addText('Part E: Lens Focal Length - Determining focal lengths of different types of lenses');
      addText(`Procedure understood: ${procedureUnderstood ? 'Yes' : 'No'}`);
      yPosition += 15;
      
      // Simulation Section
      checkNewPage(40);
      addText('Interactive Simulation', 16, 'bold');
      addText('An interactive optics simulation was used to collect data for each part of the experiment.');
      
      // Add simulation placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition, 170, 60, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Interactive Optics Simulation', 105, yPosition + 20, { align: 'center' });
      doc.text('(Simulation interface used to collect experimental data)', 105, yPosition + 35, { align: 'center' });
      doc.text('Data collected for Parts A-E using virtual optical equipment', 105, yPosition + 50, { align: 'center' });
      yPosition += 75;
      
      // Observations & Data Collection
      checkNewPage(40);
      addText('Observations & Data Collection', 16, 'bold');
      
      // Part A: Index of Refraction Data
      if (observationData.indexRefraction) {
        checkNewPage(80);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Part A: Index of Refraction of Water', 20, yPosition);
        yPosition += 15;
        
        // Create table data for Part A
        const tableData = [];
        for (let i = 1; i <= 5; i++) {
          const trial = observationData.indexRefraction[`trial${i}`];
          tableData.push([
            i.toString(),
            trial?.incidentAngle || '',
            trial?.refractedAngle || '',
            trial?.calculatedIndex || ''
          ]);
        }
        
        // Add table
        doc.autoTable({
          startY: yPosition,
          head: [['Trial', 'Incident Angle (°)', 'Refracted Angle (°)', 'Calculated Index']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          margin: { left: 20, right: 20 },
          styles: { fontSize: 10 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Other Parts Data
      const otherParts = [
        { 
          key: 'lightOffset', 
          title: 'Part B: Light Offset',
          description: 'Measuring lateral displacement of light through a transparent block'
        },
        { 
          key: 'reflection', 
          title: 'Part C: Law of Reflection',
          description: 'Verifying the law of reflection using plane mirrors'
        },
        { 
          key: 'mirrorFocalLength', 
          title: 'Part D: Mirror Focal Length',
          description: 'Determining focal lengths of curved mirrors'
        },
        { 
          key: 'lensFocalLength', 
          title: 'Part E: Lens Focal Length',
          description: 'Measuring focal lengths of converging and diverging lenses'
        }
      ];
      
      otherParts.forEach(part => {
        const data = observationData[part.key];
        if (data && Object.values(data).some(val => val !== '')) {
          checkNewPage(40);
          addText(part.title, 14, 'bold');
          addText(part.description, 10, 'normal');
          
          Object.entries(data).forEach(([key, value]) => {
            if (value) {
              const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              addText(`${label}: ${value}`, 11, 'normal');
            }
          });
          yPosition += 10;
        }
      });
      
      // Analysis Section
      checkNewPage(40);
      addText('Analysis', 16, 'bold');
      
      if (analysisData.averageRefractiveIndex || analysisData.percentErrorWater) {
        addText('Part A Analysis:', 14, 'bold');
        if (analysisData.averageRefractiveIndex) {
          addText(`Average Refractive Index of Water: ${analysisData.averageRefractiveIndex}`);
        }
        if (analysisData.percentErrorWater) {
          addText(`Percent Error (accepted value = 1.33): ${analysisData.percentErrorWater}%`);
        }
        yPosition += 10;
      }
      
      // Post-lab Questions
      if (Object.values(postLabAnswers).some(answer => answer.trim() !== '')) {
        checkNewPage(40);
        addText('Post-Lab Questions', 16, 'bold');
        
        const questions = [
          'What factors could contribute to experimental error in measuring the refractive index?',
          'How does the thickness of a transparent material affect light displacement?',
          'Why is the law of reflection important in optical instrument design?',
          'Compare the behavior of converging and diverging optical elements.'
        ];
        
        Object.entries(postLabAnswers).forEach(([question, answer], index) => {
          if (answer.trim()) {
            checkNewPage(30);
            addText(`Question ${index + 1}: ${questions[index] || 'Post-lab question'}`, 12, 'bold');
            addText(`Answer: ${answer.trim()}`, 11, 'normal');
            yPosition += 10;
          }
        });
      }
      
      // Conclusion
      checkNewPage(30);
      addText('Lab Completion Summary', 16, 'bold');
      const completedSections = Object.values(sectionStatus).filter(status => status === 'completed').length;
      const totalSections = Object.keys(sectionStatus).length;
      addText(`Sections Completed: ${completedSections}/${totalSections}`);
      addText(`Lab Status: ${isSubmitted ? 'Submitted for Review' : 'In Progress'}`);
      if (isSubmitted) {
        addText(`Submission Date: ${new Date().toLocaleDateString()}`);
      }
      
      // Save the PDF
      doc.save('Lab_2_Mirrors_and_Lenses.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
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
    const newEquipmentMethod = {
      ...equipmentMethod,
      [method]: checked
    };
    setEquipmentMethod(newEquipmentMethod);
    
    // Check if at least one method is selected
    const anySelected = Object.values(newEquipmentMethod).some(val => val === true);
    
    const newSectionStatus = {
      ...sectionStatus,
      equipment: anySelected ? 'completed' : 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      equipmentMethod: newEquipmentMethod,
      sectionStatus: newSectionStatus
    });
  };
  
  // Update procedure understanding
  const updateProcedureUnderstood = (checked) => {
    setProcedureUnderstood(checked);
    
    const newSectionStatus = {
      ...sectionStatus,
      procedure: checked ? 'completed' : 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      procedureUnderstood: checked,
      sectionStatus: newSectionStatus
    });
  };
  
  // Update multiple observation data fields in a single call (to avoid race conditions)
  const updateObservationDataBoth = (section, trial, fields) => {
    console.log(`🔧 updateObservationDataBoth: section=${section}, trial=${trial}, fields=`, fields);
    let newObservationData;
    
    if (section === 'indexRefraction') {
      newObservationData = {
        ...observationData,
        indexRefraction: {
          ...observationData.indexRefraction,
          [trial]: {
            ...observationData.indexRefraction[trial],
            ...fields
          }
        }
      };
    } else {
      newObservationData = {
        ...observationData,
        [section]: {
          ...observationData[section],
          ...fields
        }
      };
    }
    
    setObservationData(newObservationData);
    
    // Check completion with new data
    let totalFields = 0;
    let filledFields = 0;
    
    if (section === 'indexRefraction') {
      // Count all trial fields
      Object.values(newObservationData.indexRefraction).forEach(trial => {
        if (trial.incidentAngle !== undefined) totalFields++;
        if (trial.refractedAngle !== undefined) totalFields++;
        if (trial.calculatedIndex !== undefined) totalFields++;
        
        if (trial.incidentAngle !== '') filledFields++;
        if (trial.refractedAngle !== '') filledFields++;
        if (trial.calculatedIndex !== '') filledFields++;
      });
    } else {
      // Count section fields
      Object.values(newObservationData[section]).forEach(value => {
        totalFields++;
        if (value !== '') filledFields++;
      });
    }
    
    const completionRatio = totalFields > 0 ? filledFields / totalFields : 0;
    
    let newSectionStatus = {
      ...sectionStatus,
      observations: completionRatio >= 0.75 ? 'completed' : 
                    completionRatio > 0 ? 'in-progress' : 'not-started'
    };
    
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: newSectionStatus
    });
  };

  // Update observation data
  const updateObservationData = (section, trial, field, value) => {
    console.log(`🔧 updateObservationData: section=${section}, trial=${trial}, field=${field}, value=${value}`);
    let newObservationData;
    
    if (section === 'indexRefraction') {
      newObservationData = {
        ...observationData,
        indexRefraction: {
          ...observationData.indexRefraction,
          [trial]: {
            ...observationData.indexRefraction[trial],
            [field]: value
          }
        }
      };
    } else {
      newObservationData = {
        ...observationData,
        [section]: {
          ...observationData[section],
          [field]: value
        }
      };
    }
    
    setObservationData(newObservationData);
    
    // Check completion with new data
    let totalFields = 0;
    let filledFields = 0;
    
    // Count index refraction fields
    Object.values(newObservationData.indexRefraction).forEach(trial => {
      totalFields += 3;
      if (trial.incidentAngle) filledFields++;
      if (trial.refractedAngle) filledFields++;
      if (trial.calculatedIndex) filledFields++;
    });
    
    // Count other observation fields
    totalFields += 6; // displacement, incident/reflected angles, 4 focal lengths
    if (newObservationData.lightOffset.displacement) filledFields++;
    if (newObservationData.reflection.incidentAngle) filledFields++;
    if (newObservationData.reflection.reflectedAngle) filledFields++;
    if (newObservationData.mirrorFocalLength.converging) filledFields++;
    if (newObservationData.mirrorFocalLength.diverging) filledFields++;
    if (newObservationData.lensFocalLength.converging) filledFields++;
    if (newObservationData.lensFocalLength.diverging) filledFields++;
    
    const percentage = (filledFields / totalFields) * 100;
    
    let newStatus = 'not-started';
    if (percentage > 0 && percentage < 100) {
      newStatus = 'in-progress';
    } else if (percentage === 100) {
      newStatus = 'completed';
    }
    
    const newSectionStatus = {
      ...sectionStatus,
      observations: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: newSectionStatus
    });
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
    if (!trialData?.incidentAngle || !trialData?.refractedAngle) return false;
    
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
    const newAnalysisData = {
      ...analysisData,
      [field]: value
    };
    setAnalysisData(newAnalysisData);
    
    // Check completion with new data
    const requiredFields = [
      newAnalysisData.averageRefractiveIndex,
      newAnalysisData.percentErrorWater
    ];
    
    const filledFields = requiredFields.filter(field => field !== '').length;
    let newStatus = 'not-started';
    if (filledFields > 0 && filledFields < requiredFields.length) {
      newStatus = 'in-progress';
    } else if (filledFields === requiredFields.length) {
      newStatus = 'completed';
    }
    
    const newSectionStatus = {
      ...sectionStatus,
      analysis: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      analysisData: newAnalysisData,
      sectionStatus: newSectionStatus
    });
  };
  
  
  // Update post-lab answers
  const updatePostLabAnswer = (question, value) => {
    const newPostLabAnswers = {
      ...postLabAnswers,
      [question]: value
    };
    setPostLabAnswers(newPostLabAnswers);
    
    // Check completion based on all questions
    const answeredQuestions = Object.values(newPostLabAnswers).filter(answer => answer.trim().length > 20).length;
    const totalQuestions = Object.keys(newPostLabAnswers).length;
    
    const newStatus = answeredQuestions === totalQuestions ? 'completed' : answeredQuestions > 0 ? 'in-progress' : 'not-started';
    
    const newSectionStatus = {
      ...sectionStatus,
      postlab: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      postLabAnswers: newPostLabAnswers,
      sectionStatus: newSectionStatus
    });
  };
  
  // Show start lab screen if lab hasn't started (but not for staff view or when viewing submission)
  if (!labStarted && !isStaffView && !isViewingSubmission) {
    return (
      <div id="lab-content" className="space-y-6">
        
        
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
    <div id="lab-content" className={`space-y-6 relative ${(isSubmitted && !isStaffView) || isViewingSubmission ? 'lab-input-disabled' : ''}`}>
      {/* Read-only banner when viewing submission */}
      {isViewingSubmission && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Viewing Submitted Lab - Read Only
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This is the student's submitted work. All inputs are disabled.
              </p>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        /* Disable inputs for submitted labs (student view only) OR when viewing submissions */
        .lab-input-disabled input,
        .lab-input-disabled textarea,
        .lab-input-disabled button:not(.staff-only):not(.print-button),
        .lab-input-disabled select {
          pointer-events: none !important;
          opacity: 0.7 !important;
          cursor: not-allowed !important;
          background-color: #f9fafb !important;
        }

        /* Keep certain elements interactive for staff and print button */
        .lab-input-disabled .staff-only,
        .lab-input-disabled .print-button {
          pointer-events: auto !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }
      `}} />
      
      
      {/* Combined Navigation & Progress */}
      <div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'introduction', label: 'Introduction' },
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
                  className={`px-3 py-1 text-xs font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
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
                  {sectionStatus[section.key] === 'completed' && <span className="text-green-600"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Indicators - Hide when submitted */}
      {autoSaveEnabled && !isSubmitted && currentUser && labStarted && (
        <div className="fixed top-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Auto-save enabled
          </div>
        </div>
      )}

      {/* Print PDF Button */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={handlePrintPDF}
          className="print-button px-4 py-2 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          Print PDF
        </button>
      </div>
      
      {/* Notification Component */}
      
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
              console.log('🔬 Collecting Part A data:', data);
              Object.keys(data).forEach(trial => {
                console.log(`📝 Updating ${trial}: incident=${data[trial].incidentAngle}, refracted=${data[trial].refractedAngle}`);
                // Update both angles in a single call to avoid race conditions
                updateObservationDataBoth('indexRefraction', trial, {
                  incidentAngle: data[trial].incidentAngle,
                  refractedAngle: data[trial].refractedAngle
                });
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
                        value={observationData.indexRefraction[`trial${trial}`]?.incidentAngle || ''}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                        placeholder=""
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={observationData.indexRefraction[`trial${trial}`]?.refractedAngle || ''}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                        placeholder=""
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={observationData.indexRefraction[`trial${trial}`]?.calculatedIndex || ''}
                        onChange={(e) => {
                          updateObservationData('indexRefraction', `trial${trial}`, 'calculatedIndex', e.target.value);
                        }}
                        className={`w-full px-2 py-1 border border-gray-300 rounded ${
                          isCalculatedIndexCorrect(trial, observationData.indexRefraction[`trial${trial}`]?.calculatedIndex)
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
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
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
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
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
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
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
                readOnly
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
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

      {/* Lab Submission Section */}
      <div className="border rounded-lg shadow-sm p-6 scroll-mt-32 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Submit Lab for Review</h2>
        
        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Lab Progress Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(sectionStatus).map(([section, status]) => (
                <div key={section} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                  status === 'completed'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : status === 'in-progress'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'completed' ? 'bg-green-500' : status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="capitalize font-medium">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Instructions */}
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Before Submitting:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc ml-5">
              <li>Complete all sections of your lab report</li>
              <li>Review your observation data and calculations for accuracy</li>
              <li>Ensure your analysis answers are complete and well-written</li>
              <li>Check that you've answered all post-lab questions thoroughly</li>
            </ul>
            <p className="mt-2 text-sm text-blue-600 italic">
              Once submitted, your teacher will be able to review and grade your work.
            </p>
          </div>

          {/* Submit Button - Only show if not submitted */}
          {!isSubmitted && (
            <>
              <div className="flex justify-center">
                <button
                  onClick={submitLab}
                  disabled={isSaving || completedCount < totalSections}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                    isSaving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : completedCount >= totalSections
                      ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Lab for Review'
                  )}
                </button>
              </div>
              
              {completedCount < totalSections && (
                <p className="text-center text-sm text-gray-500">
                  Complete all {totalSections} sections to enable submission
                </p>
              )}
            </>
          )}
          
          {/* Submitted status message */}
          {isSubmitted && (
            <div className="flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">Lab Successfully Submitted</h3>
                    <p className="text-xs text-green-700">Your lab has been submitted and is being reviewed by your teacher.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post-Submission Overlay */}
      <PostSubmissionOverlay
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Mirrors and Lenses Lab',
          completionPercentage: Object.values(sectionStatus).filter(status => status === 'completed').length * (100 / 7), // 7 sections total
          status: isSubmitted ? 'completed' : 'in-progress',
          timestamp: course?.Assessments?.[questionId]?.timestamp || new Date().toISOString()
        }}
        onContinue={() => {}} // You can add navigation logic here if needed
        onViewGradebook={() => {}} // You can add gradebook logic here if needed
        onClose={() => setShowSubmissionOverlay(false)}
      />
      
    </div>
  );
};

export default LabMirrorsLenses;
