import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw } from 'lucide-react';

const ParticleAccelerationSimulationV2 = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [voltage, setVoltage] = useState(25);
  const [particles, setParticles] = useState([]);
  const [nextParticleId, setNextParticleId] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // Physics constants
  const FIELD_WIDTH = 500; // Distance between plates in pixels (extended)
  const FIELD_HEIGHT = 200;
  const PLATE_SEPARATION = 0.015; // 1.5 cm in meters (real physics)
  const PARTICLE_CHARGE = 1.6e-19; // Elementary charge (C)
  const PARTICLE_MASS = 9.1e-31; // Electron mass (kg) - can be adjusted
  const SCALE_FACTOR = 1e6; // Scale physics to pixels for visualization
  
  // Animation settings
  const ANIMATION_SPEED = 60; // fps target (smooth animation)

  // Calculate real physics
  const calculatePhysics = useCallback((voltage) => {
    // Electric field strength: E = V/d
    const electricField = voltage / PLATE_SEPARATION; // V/m
    
    // Force on particle: F = qE
    const force = PARTICLE_CHARGE * electricField; // N
    
    // Acceleration: a = F/m
    const acceleration = force / PARTICLE_MASS; // m/s²
    
    // Time to cross field (assuming small initial velocity)
    // Using x = v₀t + ½at², solve for t when x = plate_separation
    const initialVelocity = 1e5; // Small initial velocity in m/s
    const timeToTraverse = (-initialVelocity + Math.sqrt(initialVelocity * initialVelocity + 2 * acceleration * PLATE_SEPARATION)) / acceleration;
    
    // Final velocity: v = v₀ + at
    const finalVelocity = initialVelocity + acceleration * timeToTraverse;
    
    return {
      electricField,
      acceleration,
      timeToTraverse,
      finalVelocity,
      initialVelocity
    };
  }, []);

  // Create a new particle
  const createParticle = useCallback(() => {
    const physics = calculatePhysics(voltage);
    const id = nextParticleId;
    setNextParticleId(prev => prev + 1);

    return {
      id,
      startTime: Date.now(),
      physics,
      // Visual properties
      x: 50, // Starting x position
      y: 150 + (Math.random() - 0.5) * 40, // Slight y variation
      vx: physics.initialVelocity * SCALE_FACTOR / 1e8, // Scaled for animation
      vy: 0,
      trail: [],
      active: true
    };
  }, [voltage, nextParticleId, calculatePhysics]);

  // Update particle position
  const updateParticle = useCallback((particle) => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - particle.startTime) / 1000; // seconds
    
    // Real physics calculation
    const physics = particle.physics;
    const realAcceleration = physics.acceleration;
    
    // Scale acceleration for visual animation
    const visualAcceleration = realAcceleration * SCALE_FACTOR / 1e12;
    
    // Update position using kinematic equations
    const newVx = particle.physics.initialVelocity * SCALE_FACTOR / 1e8 + visualAcceleration * deltaTime;
    const newX = 50 + (particle.physics.initialVelocity * SCALE_FACTOR / 1e8) * deltaTime + 0.5 * visualAcceleration * deltaTime * deltaTime;
    
    // Check if particle has reached the detector
    const hasReachedDetector = newX >= 450;
    
    // Update trail
    const newTrail = [...particle.trail, { x: newX, y: particle.y }];
    if (newTrail.length > 20) newTrail.shift(); // Limit trail length

    return {
      ...particle,
      x: newX,
      vx: newVx,
      trail: newTrail,
      active: !hasReachedDetector
    };
  }, []);

  // Manual particle firing
  const fireParticle = () => {
    console.log('🔫 Firing particle manually');
    const physics = calculatePhysics(voltage);
    const newParticle = {
      id: Date.now() + Math.random(),
      startTime: Date.now(),
      physics,
      x: 50,
      y: 150 + (Math.random() - 0.5) * 20, // Less y variation
      vx: physics.initialVelocity * SCALE_FACTOR / 1e8,
      vy: 0,
      trail: [],
      active: true
    };
    
    // Replace any existing particles with this new one
    setParticles([newParticle]);
  };

  // Animation loop - only updates existing particles, doesn't create new ones
  useEffect(() => {
    if (isRunning) {
      const animationInterval = setInterval(() => {
        setParticles(currentParticles => {
          return currentParticles.map(particle => {
            const currentTime = Date.now();
            const deltaTime = (currentTime - particle.startTime) / 1000;
            
            // Realistic acceleration physics
            const initialVelocity = 50; // pixels/second (small initial velocity)
            const acceleration = voltage * 5; // acceleration proportional to voltage
            
            // Kinematic equation: x = x₀ + v₀t + ½at²
            const newX = 50 + initialVelocity * deltaTime + 0.5 * acceleration * deltaTime * deltaTime;
            
            // Current velocity: v = v₀ + at
            const currentVelocity = initialVelocity + acceleration * deltaTime;
            
            const hasReachedDetector = newX >= 570; // Match detector position
            
            // Only add to trail if particle hasn't reached detector
            let newTrail = particle.trail;
            if (!hasReachedDetector) {
              newTrail = [...particle.trail, { x: Math.min(newX, 570), y: particle.y }];
              if (newTrail.length > 15) newTrail.shift();
            }
            
            return {
              ...particle,
              x: Math.min(newX, 570), // Clamp particle position to detector
              y: particle.y,
              velocity: currentVelocity,
              trail: newTrail,
              active: !hasReachedDetector
            };
          }).filter(p => p.active || (Date.now() - p.startTime) < 2000); // Clean up after 2s
        });
      }, 1000 / ANIMATION_SPEED);

      return () => {
        clearInterval(animationInterval);
      };
    }
  }, [isRunning, voltage]);

  // Control functions
  const startSimulation = () => {
    console.log('🚀 Starting particle simulation');
    setIsRunning(true);
  };

  const stopSimulation = () => {
    console.log('⏹️ Stopping particle simulation');
    setIsRunning(false);
  };

  const clearParticles = () => {
    console.log('🧹 Clearing all particles');
    setParticles([]);
    setNextParticleId(0);
  };

  const resetSimulation = () => {
    stopSimulation();
    clearParticles();
  };

  // Get current physics info for display
  const currentPhysics = calculatePhysics(voltage);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            Particle Acceleration Simulation
          </h1>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              if (!isRunning) setIsRunning(true);
              fireParticle();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              pointerEvents: 'auto', // Force enable
              opacity: 1 // Force full opacity
            }}
          >
            <Play size={16} />
            Fire Particle
          </button>
          
        </div>
      </div>

      {/* Voltage Control */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: '60px' }}>
            Voltage:
          </label>
          <input
            type="range"
            min="10"
            max="75"
            step="5"
            value={voltage}
            onChange={(e) => setVoltage(parseInt(e.target.value))}
            style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              appearance: 'none',
              cursor: 'pointer',
              pointerEvents: 'auto', // Force enable
              opacity: 1 // Force full opacity
            }}
          />
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', minWidth: '50px' }}>
            {voltage}V
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
          <span>10V</span>
          <span>75V</span>
        </div>
      </div>

      {/* Simulation Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Electric Field Region */}
        <div style={{
          position: 'absolute',
          left: '60px',
          top: '50px',
          width: `${FIELD_WIDTH}px`,
          height: `${FIELD_HEIGHT}px`,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '4px'
        }} />

        {/* Voltage Labels */}
        <div style={{
          position: 'absolute',
          left: '40px',
          top: '35px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          +{voltage}V
        </div>
        <div style={{
          position: 'absolute',
          left: '580px',
          top: '35px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          0V
        </div>

        {/* Particle Source */}
        <div style={{
          position: 'absolute',
          left: '25px',
          top: '135px',
          width: '30px',
          height: '30px',
          backgroundColor: '#f59e0b',
          border: '3px solid #d97706',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '175px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          width: '60px'
        }}>
          Particle Source
        </div>

        {/* Velocity Detector */}
        <div style={{
          position: 'absolute',
          left: '570px',
          top: '100px',
          width: '20px',
          height: '100px',
          backgroundColor: '#7c3aed',
          border: '2px solid #6d28d9'
        }} />
        <div style={{
          position: 'absolute',
          left: '555px',
          top: '220px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          width: '55px'
        }}>
          Velocity Detector
        </div>

        {/* Physics Textbook Style Electric Field Lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <defs>
            <marker
              id="fieldArrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0,0 8,3 0,6" fill="#10b981" />
            </marker>
          </defs>
          
          {/* Uniform horizontal field lines with proper spacing */}
          {Array.from({ length: 7 }, (_, i) => {
            const y = 80 + i * 25;
            const lineLength = 420; // Extended field lines
            const numArrows = 5; // More arrows for longer lines
            const arrowSpacing = lineLength / (numArrows + 1);
            
            return (
              <g key={i}>
                {/* Main field line */}
                <line
                  x1={90} 
                  y1={y}
                  x2={90 + lineLength}
                  y2={y}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                
                {/* Arrow markers along the line */}
                {Array.from({ length: numArrows }, (_, j) => (
                  <line
                    key={j}
                    x1={90 + (j + 1) * arrowSpacing - 5}
                    y1={y}
                    x2={90 + (j + 1) * arrowSpacing + 5}
                    y2={y}
                    stroke="#10b981"
                    strokeWidth="2"
                    markerEnd="url(#fieldArrowhead)"
                    opacity="0.8"
                  />
                ))}
              </g>
            );
          })}
          
          {/* Field intensity visualization - denser lines near higher voltage */}
          {voltage > 50 && Array.from({ length: 3 }, (_, i) => {
            const y = 95 + i * 35;
            return (
              <line
                key={`dense-${i}`}
                x1={95}
                y1={y}
                x2={505}
                y2={y}
                stroke="#10b981"
                strokeWidth="1"
                opacity="0.4"
                strokeDasharray="3,3"
              />
            );
          })}
        </svg>

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <React.Fragment key={particle.id}>
              {/* Particle Trail */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
                <polyline
                  points={particle.trail.map(point => `${point.x},${point.y}`).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>
              
              {/* Fixed-size particle */}
              {particle.active && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#ef4444',
                    border: '2px solid #dc2626',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ParticleAccelerationSimulationV2;