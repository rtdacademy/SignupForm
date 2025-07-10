import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play } from 'lucide-react';

const PithBallDemo = ({ observationData, selectedGroup }) => {
  const [pithPosition, setPithPosition] = useState({ x: 400, y: 250 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef();
  
  const initialPosition = { x: 400, y: 250 };
  const metalPosition = { x: 200, y: 250 };
  const stringAttach = { x: 420, y: 150 };
  const stringLength = 100;

  // Physics constants
  const attraction = 0.3;
  const damping = 0.95;

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        setPithPosition(currentPos => {
          setVelocity(currentVel => {
            // Calculate attraction force
            const dx = metalPosition.x - currentPos.x;
            const dy = metalPosition.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Prevent division by zero and excessive force
            const minDistance = 60;
            const effectiveDistance = Math.max(distance, minDistance);
            
            // Calculate force components
            const forceX = (dx / effectiveDistance) * attraction;
            const forceY = (dy / effectiveDistance) * attraction;
            
            // Update velocity
            const newVel = {
              x: (currentVel.x + forceX) * damping,
              y: (currentVel.y + forceY) * damping
            };
            
            return newVel;
          });
          
          // Update position
          const newPos = {
            x: currentPos.x + velocity.x,
            y: currentPos.y + velocity.y
          };
          
          // Apply string constraint
          const dx = newPos.x - stringAttach.x;
          const dy = newPos.y - stringAttach.y;
          const currentLength = Math.sqrt(dx * dx + dy * dy);
          
          if (currentLength > stringLength) {
            const ratio = stringLength / currentLength;
            return {
              x: stringAttach.x + dx * ratio,
              y: stringAttach.y + dy * ratio
            };
          }
          
          return newPos;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, velocity.x, velocity.y]);

  const reset = () => {
    setIsRunning(false);
    setPithPosition(initialPosition);
    setVelocity({ x: 0, y: 0 });
  };

  const start = () => {
    setIsRunning(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-800 mb-1">Experimental Setup Visualization</h3>
          <p className="text-sm text-gray-600">Interactive demonstration of electrostatic force measurement</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
          >
            <Play size={16} />
            Start
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg border p-4 mb-4">
        <svg width="600" height="400" className="w-full border border-gray-200 rounded">
          {/* String */}
          <line
            x1={stringAttach.x}
            y1={stringAttach.y}
            x2={pithPosition.x}
            y2={pithPosition.y}
            stroke="#8B4513"
            strokeWidth="3"
          />
          
          {/* String attachment point */}
          <circle cx={stringAttach.x} cy={stringAttach.y} r="4" fill="#333" />
          
          {/* Metal Sphere */}
          <circle
            cx={metalPosition.x}
            cy={metalPosition.y}
            r="45"
            fill="#6B7280"
            stroke="#374151"
            strokeWidth="3"
          />
          
          {/* Pith Ball */}
          <circle
            cx={pithPosition.x}
            cy={pithPosition.y}
            r="18"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="3"
          />
          
          {/* Simple labels */}
          <text x={metalPosition.x} y={metalPosition.y + 75} textAnchor="middle" className="text-lg font-bold">
            Metal Sphere
          </text>
          <text x={metalPosition.x} y={metalPosition.y + 95} textAnchor="middle" className="text-sm text-gray-600">
            q = -3.59 × 10⁻⁷ C
          </text>
          
          <text x={pithPosition.x} y={pithPosition.y + 45} textAnchor="middle" className="text-sm font-bold">
            Pith Ball
          </text>
          <text x={pithPosition.x} y={pithPosition.y + 60} textAnchor="middle" className="text-xs text-gray-600">
            q = ?
          </text>
          
          {/* Distance indicator */}
          {!isRunning && (
            <>
              <line
                x1={metalPosition.x + 45}
                y1={metalPosition.y + 110}
                x2={pithPosition.x - 18}
                y2={pithPosition.y + 110}
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowhead-right)"
                markerStart="url(#arrowhead-left)"
              />
              <text 
                x={(metalPosition.x + 45 + pithPosition.x - 18) / 2} 
                y={pithPosition.y + 125} 
                textAnchor="middle" 
                className="text-sm font-medium text-blue-600"
              >
                r
              </text>
              
              {/* Arrow markers */}
              <defs>
                <marker
                  id="arrowhead-right"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#3b82f6"
                  />
                </marker>
                <marker
                  id="arrowhead-left"
                  markerWidth="10"
                  markerHeight="7"
                  refX="1"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="10 0, 0 3.5, 10 7"
                    fill="#3b82f6"
                  />
                </marker>
              </defs>
            </>
          )}
        </svg>
        
        {/* Show selected data group info if available */}
        {selectedGroup && observationData[`group${selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)}`] && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            <strong>Selected Data:</strong> Group {selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)} - {observationData[`group${selectedGroup.charAt(0).toUpperCase() + selectedGroup.slice(1)}`].length} measurements
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 text-center">
        The metal sphere has a known charge and the pith ball charge is to be determined through force measurements
      </p>
    </div>
  );
};

export default PithBallDemo;