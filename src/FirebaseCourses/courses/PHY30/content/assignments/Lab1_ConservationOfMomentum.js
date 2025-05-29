import React, { useState } from 'react';

/**
 * Lab 1 - Conservation of Momentum for Physics 30
 * Item ID: assignment_1747283296776_954
 * Unit: Momentum and Energy
 */
const Lab1_ConservationOfMomentum = () => {  // Track completion status for each section
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started', // 'not-started', 'in-progress', 'completed'
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    error: 'not-started',
    conclusion: 'not-started'  });
  // Track section content
  const [sectionContent, setSectionContent] = useState({
    hypothesis: ''
  });
  // Track procedure confirmation
  const [procedureRead, setProcedureRead] = useState(false);

  // Track notifications
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });  // Track trial data for observations - completely separate storage for 1D and 2D collision modes
  // Clean separation: Each collision type only stores data relevant to that type
  const [trialData, setTrialData] = useState({
    '1D': {
      trial1: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        userMomentum: {
          beforeCollision: { puck1: '', puck2: '' },
          afterCollision: { puck1: '', puck2: '' }
        },
        totalMomentum: {
          before: '',
          after: ''
        }
      },
      trial2: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        userMomentum: {
          beforeCollision: { puck1: '', puck2: '' },
          afterCollision: { puck1: '', puck2: '' }
        },
        totalMomentum: {
          before: '',
          after: ''
        }
      },
      trial3: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', momentum: '' }, 
          puck2: { spacing: '', time: '', momentum: '' } 
        },
        userMomentum: {
          beforeCollision: { puck1: '', puck2: '' },
          afterCollision: { puck1: '', puck2: '' }
        },
        totalMomentum: {
          before: '',
          after: ''
        }
      }
    },
    '2D': {
      trial1: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        userMomentum2D: {
          beforeCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          },
          afterCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          }
        },
        totalMomentum2D: {
          beforeX: '', beforeY: '',
          afterX: '', afterY: ''
        }
      },
      trial2: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        userMomentum2D: {
          beforeCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          },
          afterCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          }
        },
        totalMomentum2D: {
          beforeX: '', beforeY: '',
          afterX: '', afterY: ''
        }
      },
      trial3: { 
        beforeCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        afterCollision: { 
          puck1: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' }, 
          puck2: { spacing: '', time: '', angle: '', momentumX: '', momentumY: '' } 
        },
        userMomentum2D: {
          beforeCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          },
          afterCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          }
        },
        totalMomentum2D: {
          beforeX: '', beforeY: '',
          afterX: '', afterY: ''
        }
      }
    }
  });

  const [showTrialSelector, setShowTrialSelector] = useState(false);
    // Simulation state
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    hasBeenStarted: false, // Track if simulation has been started (even after it finishes)
    showTrails: true,    collisionType: '1D', // '1D' or '2D'
    puck1: { x: 120, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 }, // Initial position on left side of puck2
    puck2: { x: 300, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 },
    hasCollided: false,
    trials: [],
    launchAngle: 0, // angle in degrees for puck 1 trajectory
    launchSpeed: 4, // speed setting for puck 1 (default to middle value)
    sparkTrail: [], // array of position dots
    frameCounter: 0, // to track frames for spark dots
    pucksVisible: true,
    simulationEndTime: null,
    dataUsedForTrial: null, // Track if collision data has been used for a trial
    // Data tracking for before/after collision analysis
    beforeCollision: {
      puck1: { vx: 0, vy: 0, mass: 505 },
      puck2: { vx: 0, vy: 0, mass: 505 }
    },
    afterCollision: {
      puck1: { vx: 0, vy: 0, mass: 505 },
      puck2: { vx: 0, vy: 0, mass: 505 }
    }
  });
  
  const [animationId, setAnimationId] = useState(null);
  const [currentSection, setCurrentSection] = useState('hypothesis');
  const [labStarted, setLabStarted] = useState(false);
  const startLab = () => {
    setLabStarted(true);
    // Scroll to hypothesis section after a brief delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById('section-hypothesis');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  const saveAndEnd = () => {
    setLabStarted(false);
    // Here you could also save progress to database
  };
  const updateSectionContent = (section, content) => {
    setSectionContent(prev => ({
      ...prev,
      [section]: content
    }));
    
    // Update status based on content
    if (content.trim().length > 0) {
      let isCompleted = false;
      
      if (section === 'hypothesis') {
        // Check for required words: if, then, because
        const lowerContent = content.toLowerCase();
        const hasIf = lowerContent.includes('if');
        const hasThen = lowerContent.includes('then');
        const hasBecause = lowerContent.includes('because');
        isCompleted = hasIf && hasThen && hasBecause && content.trim().length > 20;
      } else {
        isCompleted = content.trim().length > 20;
      }
      
      setSectionStatus(prev => ({
        ...prev,
        [section]: isCompleted ? 'completed' : 'in-progress'
      }));
    } else {
      setSectionStatus(prev => ({
        ...prev,
        [section]: 'not-started'
      }));
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'in-progress':
        return <span className="text-yellow-500">⚠</span>;
      default:
        return <span className="text-gray-300">○</span>;
    }
  };
  // Handle procedure read confirmation
  const handleProcedureReadChange = (checked) => {
    setProcedureRead(checked);
    setSectionStatus(prev => ({
      ...prev,
      procedure: checked ? 'completed' : 'not-started'
    }));
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000); // Hide after 3 seconds
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }  };

  // Helper functions for data analysis
  const calculateSpeed = (vx, vy) => {
    return Math.sqrt(vx * vx + vy * vy);
  };

  const calculateAngleFromHorizontal = (vx, vy) => {
    if (vx === 0 && vy === 0) return 0;
    const angleRad = Math.atan2(vy, vx);
    const angleDeg = angleRad * (180 / Math.PI);
    return Math.abs(angleDeg);
  };  // Scale conversion: Define how many pixels equal 1 cm
  // This creates a realistic physics lab scale where the 500px wide canvas represents about 50cm
  const PIXELS_PER_CM = 10; // 10 pixels = 1 cm
    const calculateSparkDotSpacing = (vx, vy) => {
    // Spark dots are placed every 6 frames at 60fps (1/10 second intervals)
    // Distance = speed × frames between dots
    const speed = calculateSpeed(vx, vy);
    return speed * 6; // Distance between spark dots in pixels (6 frames apart)
  };  const calculateSparkDotSpacingCm = (vx, vy) => {
    // Calculate spacing in pixels first, then convert to centimeters
    const spacingPx = calculateSparkDotSpacing(vx, vy);
    return spacingPx / PIXELS_PER_CM; // Convert pixels to centimeters
  };  // Calculate momentum in kg⋅cm/s (using grams and cm/s, then convert)
  const calculateMomentum = (mass, vx, vy) => {
    const speed = calculateSpeed(vx, vy); // pixels/frame
    const speedCmPerSec = (speed * 60) / PIXELS_PER_CM; // cm/s (60 fps)
    const massKg = mass / 1000; // Convert grams to kg
    return massKg * speedCmPerSec; // kg⋅cm/s
  };

  // Calculate X and Y momentum components for 2D analysis
  const calculateMomentumX = (mass, vx, vy) => {
    const speedXCmPerSec = (vx * 60) / PIXELS_PER_CM; // X velocity in cm/s
    const massKg = mass / 1000; // Convert grams to kg
    return massKg * speedXCmPerSec; // X momentum in kg⋅cm/s
  };

  const calculateMomentumY = (mass, vx, vy) => {
    const speedYCmPerSec = (vy * 60) / PIXELS_PER_CM; // Y velocity in cm/s
    const massKg = mass / 1000; // Convert grams to kg
    return massKg * speedYCmPerSec; // Y momentum in kg⋅cm/s
  };

  // Momentum validation functions
  const validateMomentum = (userInput, correctValue) => {
    if (!userInput || !correctValue) return false;
    const userValue = parseFloat(userInput);
    const correct = parseFloat(correctValue);
    if (isNaN(userValue) || isNaN(correct)) return false;
    
    // Allow 5% tolerance
    const tolerance = Math.abs(correct * 0.05);
    return Math.abs(userValue - correct) <= tolerance;
  };  // Function to check observations section progress based on filled input boxes
  const checkObservationsProgress = (updatedTrialData) => {
    let totalInputBoxes = 0;
    let filledInputBoxes = 0;

    // Count input boxes for 1D collisions (3 trials × 4 input boxes per trial = 12 total)
    ['trial1', 'trial2', 'trial3'].forEach(trialKey => {
      const trial = updatedTrialData['1D'][trialKey];
      
      // Before collision: puck1 and puck2 momentum (2 boxes)
      totalInputBoxes += 2;
      if (trial?.userMomentum?.beforeCollision?.puck1?.trim()) filledInputBoxes++;
      if (trial?.userMomentum?.beforeCollision?.puck2?.trim()) filledInputBoxes++;
      
      // After collision: puck1 and puck2 momentum (2 boxes)
      totalInputBoxes += 2;
      if (trial?.userMomentum?.afterCollision?.puck1?.trim()) filledInputBoxes++;
      if (trial?.userMomentum?.afterCollision?.puck2?.trim()) filledInputBoxes++;
    });

    // Count input boxes for 2D collisions (3 trials × 8 input boxes per trial = 24 total)
    ['trial1', 'trial2', 'trial3'].forEach(trialKey => {
      const trial = updatedTrialData['2D'][trialKey];
      
      // Before collision: puck1 and puck2 momentum X and Y components (4 boxes)
      totalInputBoxes += 4;
      if (trial?.userMomentum2D?.beforeCollision?.puck1?.x?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.beforeCollision?.puck1?.y?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.beforeCollision?.puck2?.x?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.beforeCollision?.puck2?.y?.trim()) filledInputBoxes++;
      
      // After collision: puck1 and puck2 momentum X and Y components (4 boxes)
      totalInputBoxes += 4;
      if (trial?.userMomentum2D?.afterCollision?.puck1?.x?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.afterCollision?.puck1?.y?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.afterCollision?.puck2?.x?.trim()) filledInputBoxes++;
      if (trial?.userMomentum2D?.afterCollision?.puck2?.y?.trim()) filledInputBoxes++;
    });

    const completionPercentage = totalInputBoxes > 0 ? (filledInputBoxes / totalInputBoxes) * 100 : 0;
    
    // Update section status based on completion percentage
    let newStatus = 'not-started';
    if (completionPercentage > 0 && completionPercentage < 100) {
      newStatus = 'in-progress';
    } else if (completionPercentage === 100) {
      newStatus = 'completed';
    }

    setSectionStatus(prev => ({
      ...prev,
      observations: newStatus
    }));

    return {
      totalInputBoxes,
      filledInputBoxes,
      completionPercentage,
      status: newStatus
    };
  };  const updateUserMomentum = (trial, phase, puck, value) => {
    const trialKey = `trial${trial}`;
    // Always update 1D data when called from 1D table
    const collisionType = '1D';
    setTrialData(prev => {
      const updatedData = {
        ...prev,
        [collisionType]: {
          ...prev[collisionType],
          [trialKey]: {
            ...prev[collisionType][trialKey],
            userMomentum: {
              ...prev[collisionType][trialKey]?.userMomentum,
              [phase]: {
                ...prev[collisionType][trialKey]?.userMomentum?.[phase],
                [puck]: value
              }
            }
          }
        }
      };
      
      // Check observations progress after updating data
      checkObservationsProgress(updatedData);
      
      return updatedData;
    });
  };  const updateUserMomentum2D = (trial, phase, puck, component, value) => {
    const trialKey = `trial${trial}`;
    // Always update 2D data when called from 2D table
    const collisionType = '2D';
    setTrialData(prev => {
      const updatedData = {
        ...prev,
        [collisionType]: {
          ...prev[collisionType],
          [trialKey]: {
            ...prev[collisionType][trialKey],
            userMomentum2D: {
              ...prev[collisionType][trialKey]?.userMomentum2D,
              [phase]: {
                ...prev[collisionType][trialKey]?.userMomentum2D?.[phase],
                [puck]: {
                  ...prev[collisionType][trialKey]?.userMomentum2D?.[phase]?.[puck],
                  [component]: value
                }
              }
            }
          }
        }
      };
      
      // Check observations progress after updating data
      checkObservationsProgress(updatedData);
      
      return updatedData;
    });
  };// Add trial data to selected trial
  const addDataToTrial = (trialNumber) => {
    if (!simulationState.hasCollided || !simulationState.beforeCollision || !simulationState.afterCollision) {
      showNotification('No collision data available. Please run a simulation first.', 'error');
      return;
    }

    const spacingBefore1 = calculateSparkDotSpacingCm(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy);
    const spacingBefore2 = calculateSparkDotSpacingCm(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy);
    const spacingAfter1 = calculateSparkDotSpacingCm(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy);
    const spacingAfter2 = calculateSparkDotSpacingCm(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy);

    // Create different data structures based on collision mode
    let newTrialData;
    const currentCollisionType = simulationState.collisionType;    if (currentCollisionType === '1D') {
      // For 1D mode, only populate fields needed for 1D collision analysis
      const momentumBefore1 = calculateMomentum(simulationState.beforeCollision.puck1.mass, simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy);
      const momentumBefore2 = calculateMomentum(simulationState.beforeCollision.puck2.mass, simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy);
      const momentumAfter1 = calculateMomentum(simulationState.afterCollision.puck1.mass, simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy);
      const momentumAfter2 = calculateMomentum(simulationState.afterCollision.puck2.mass, simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy);

      newTrialData = {
        beforeCollision: {
          puck1: { 
            spacing: spacingBefore1.toFixed(1), 
            time: '0.1',
            momentum: momentumBefore1.toFixed(3)
          },
          puck2: { 
            spacing: spacingBefore2.toFixed(1), 
            time: '0.1',
            momentum: momentumBefore2.toFixed(3)
          }
        },
        afterCollision: {
          puck1: { 
            spacing: spacingAfter1.toFixed(1), 
            time: '0.1',
            momentum: momentumAfter1.toFixed(3)
          },
          puck2: { 
            spacing: spacingAfter2.toFixed(1), 
            time: '0.1',
            momentum: momentumAfter2.toFixed(3)
          }
        },
        userMomentum: {
          beforeCollision: { puck1: '', puck2: '' },
          afterCollision: { puck1: '', puck2: '' }
        },
        totalMomentum: {
          before: '',
          after: ''
        }
      };
    } else if (currentCollisionType === '2D') {
      // For 2D mode, populate all fields needed for 2D vector analysis
      const angleBefore1 = calculateAngleFromHorizontal(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy);
      const angleBefore2 = calculateAngleFromHorizontal(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy);
      const angleAfter1 = calculateAngleFromHorizontal(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy);
      const angleAfter2 = calculateAngleFromHorizontal(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy);

      const momentumXBefore1 = calculateMomentumX(simulationState.beforeCollision.puck1.mass, simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy);
      const momentumYBefore1 = calculateMomentumY(simulationState.beforeCollision.puck1.mass, simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy);
      const momentumXBefore2 = calculateMomentumX(simulationState.beforeCollision.puck2.mass, simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy);
      const momentumYBefore2 = calculateMomentumY(simulationState.beforeCollision.puck2.mass, simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy);
      const momentumXAfter1 = calculateMomentumX(simulationState.afterCollision.puck1.mass, simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy);
      const momentumYAfter1 = calculateMomentumY(simulationState.afterCollision.puck1.mass, simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy);
      const momentumXAfter2 = calculateMomentumX(simulationState.afterCollision.puck2.mass, simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy);
      const momentumYAfter2 = calculateMomentumY(simulationState.afterCollision.puck2.mass, simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy);

      newTrialData = {
        beforeCollision: {
          puck1: { 
            spacing: spacingBefore1.toFixed(1), 
            time: '0.1',
            angle: angleBefore1.toFixed(1),
            momentumX: momentumXBefore1.toFixed(3),
            momentumY: momentumYBefore1.toFixed(3)
          },
          puck2: { 
            spacing: spacingBefore2.toFixed(1), 
            time: '0.1',
            angle: angleBefore2.toFixed(1),
            momentumX: momentumXBefore2.toFixed(3),
            momentumY: momentumYBefore2.toFixed(3)
          }
        },
        afterCollision: {
          puck1: { 
            spacing: spacingAfter1.toFixed(1), 
            time: '0.1',
            angle: angleAfter1.toFixed(1),
            momentumX: momentumXAfter1.toFixed(3),
            momentumY: momentumYAfter1.toFixed(3)
          },
          puck2: { 
            spacing: spacingAfter2.toFixed(1), 
            time: '0.1',
            angle: angleAfter2.toFixed(1),
            momentumX: momentumXAfter2.toFixed(3),
            momentumY: momentumYAfter2.toFixed(3)
          }
        },
        userMomentum2D: {
          beforeCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          },
          afterCollision: { 
            puck1: { x: '', y: '' }, 
            puck2: { x: '', y: '' } 
          }
        },
        totalMomentum2D: {
          beforeX: '', beforeY: '',
          afterX: '', afterY: ''
        }
      };
    }

    // Update the trial data for the specific collision type
    setTrialData(prev => ({
      ...prev,
      [currentCollisionType]: {
        ...prev[currentCollisionType],
        [`trial${trialNumber}`]: newTrialData
      }
    }));

    // Mark this collision data as used by storing it
    setSimulationState(prev => ({
      ...prev,
      dataUsedForTrial: trialNumber
    }));

    setShowTrialSelector(false);
    showNotification(`Data added to Trial ${trialNumber} (${currentCollisionType} mode)`, 'success');
  };

  // Physics simulation functions
  const checkCollision = (puck1, puck2) => {
    const dx = puck1.x - puck2.x;
    const dy = puck1.y - puck2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (puck1.radius + puck2.radius);
  };
  const handleCollision = (p1, p2) => {
    // Calculate collision response using conservation of momentum
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Avoid division by zero
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity in collision normal direction
    const dvx = p1.vx - p2.vx;
    const dvy = p1.vy - p2.vy;
    const dvn = dvx * nx + dvy * ny;
    
    // Do not resolve if velocities are separating
    if (dvn > 0) return;
    
    // Add realistic coefficient of restitution variation
    // For physics pucks, coefficient of restitution is typically 0.85-0.95
    const baseRestitution = 0.9;
    const restitutionVariation = 0.05; // ±5% variation
    const restitutionError = (Math.random() - 0.5) * 2 * restitutionVariation;
    const coefficientOfRestitution = baseRestitution + restitutionError;
    
    // Collision impulse with coefficient of restitution
    const impulse = (1 + coefficientOfRestitution) * dvn / (p1.mass + p2.mass);
    
    // Update velocities
    p1.vx -= impulse * p2.mass * nx;
    p1.vy -= impulse * p2.mass * ny;
    p2.vx += impulse * p1.mass * nx;
    p2.vy += impulse * p1.mass * ny;
    
    // Separate pucks to avoid overlap
    const overlap = (p1.radius + p2.radius) - distance;
    const separationX = nx * overlap * 0.5;
    const separationY = ny * overlap * 0.5;
    
    p1.x += separationX;
    p1.y += separationY;
    p2.x -= separationX;
    p2.y -= separationY;
  };
  const animate = () => {
    setSimulationState(prev => {
      const newState = { ...prev };
      const p1 = { ...newState.puck1 };
      const p2 = { ...newState.puck2 };
      
      // Update frame counter
      newState.frameCounter = (newState.frameCounter || 0) + 1;
        // Add spark trail dots every 6 frames (approximately 1/10 second at 60fps)
      if (newState.frameCounter % 6 === 0) {
        newState.sparkTrail = [...(newState.sparkTrail || []), {
          puck1: { x: p1.x, y: p1.y },
          puck2: { x: p2.x, y: p2.y },
          timestamp: Date.now()
        }];
        
        // Keep only last 200 spark dots to prevent memory issues while preserving longer trails
        if (newState.sparkTrail.length > 200) {
          newState.sparkTrail = newState.sparkTrail.slice(-200);
        }
      }
      
      // Update positions
      p1.x += p1.vx;
      p1.y += p1.vy;
      p2.x += p2.vx;
      p2.y += p2.vy;
      
      // Boundary collisions (canvas is 500x400)
      if (p1.x <= p1.radius || p1.x >= 500 - p1.radius) {
        p1.vx *= -0.8; // Some energy loss
        p1.x = Math.max(p1.radius, Math.min(500 - p1.radius, p1.x));
      }
      if (p1.y <= p1.radius || p1.y >= 400 - p1.radius) {
        p1.vy *= -0.8;
        p1.y = Math.max(p1.radius, Math.min(400 - p1.radius, p1.y));
      }
      if (p2.x <= p2.radius || p2.x >= 500 - p2.radius) {
        p2.vx *= -0.8;
        p2.x = Math.max(p2.radius, Math.min(500 - p2.radius, p2.x));
      }
      if (p2.y <= p2.radius || p2.y >= 400 - p2.radius) {
        p2.vy *= -0.8;
        p2.y = Math.max(p2.radius, Math.min(400 - p2.radius, p2.y));
      }      // Check for collision between pucks
      if (checkCollision(p1, p2)) {
        // Capture before collision data only for the first collision
        if (!newState.hasCollided) {
          newState.beforeCollision = {
            puck1: { vx: p1.vx, vy: p1.vy, mass: p1.mass },
            puck2: { vx: p2.vx, vy: p2.vy, mass: p2.mass }
          };
        }
        
        handleCollision(p1, p2);
        
        // Capture after collision data only for the first collision
        if (!newState.hasCollided) {
          newState.hasCollided = true;
          newState.afterCollision = {
            puck1: { vx: p1.vx, vy: p1.vy, mass: p1.mass },
            puck2: { vx: p2.vx, vy: p2.vy, mass: p2.mass }
          };
        }
      }
      
      // Apply friction
      p1.vx *= 0.995;
      p1.vy *= 0.995;
      p2.vx *= 0.995;
      p2.vy *= 0.995;
      
      // Stop simulation if velocities are very low
      const totalKE = 0.5 * p1.mass * (p1.vx * p1.vx + p1.vy * p1.vy) + 
                     0.5 * p2.mass * (p2.vx * p2.vx + p2.vy * p2.vy);
      
      if (totalKE < 0.1 && newState.hasCollided) {
        p1.vx = 0;
        p1.vy = 0;
        p2.vx = 0;
        p2.vy = 0;
        newState.isRunning = false;
        newState.simulationEndTime = Date.now();
      }
      
      newState.puck1 = p1;
      newState.puck2 = p2;
      
      return newState;
    });
  };  const startSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Get current puck positions
    const puck1Pos = { x: simulationState.puck1.x, y: simulationState.puck1.y };
    const puck2Pos = { x: simulationState.puck2.x, y: simulationState.puck2.y };      // Use the launch angle from the slider to determine velocity direction
    // Convert angle to radians (angle is already in degrees from the slider)
    // For 1D mode, always use 0° angle; for 2D mode, use the slider value
    const effectiveAngle = simulationState.collisionType === '1D' ? 0 : simulationState.launchAngle;
    const angleRad = (effectiveAngle * Math.PI) / 180;
    
    // Add realistic random error variations to simulate real physics lab conditions
    // 1. Random speed variation (±15% launch speed error)
    const baseSpeed = simulationState.launchSpeed; // Use the slider-controlled speed
    const speedVariation = 0.15; // ±15%
    const speedError = (Math.random() - 0.5) * 2 * speedVariation; // Random between -0.15 and +0.15
    const speed = baseSpeed * (1 + speedError);
    
    // 2. Random mass variations (±0.8% manufacturing tolerance)
    const baseMass = 505; // grams
    const massVariation = 0.008; // ±0.8%
    const mass1Error = (Math.random() - 0.5) * 2 * massVariation;
    const mass2Error = (Math.random() - 0.5) * 2 * massVariation;
    const puck1Mass = baseMass * (1 + mass1Error);
    const puck2Mass = baseMass * (1 + mass2Error);
      
    // Calculate velocity components directly from angle (0° = rightward, positive angles = upward)
    const vx = Math.cos(angleRad) * speed;
    const vy = Math.sin(angleRad) * speed;
      setSimulationState(prev => ({
      ...prev,
      isRunning: true,
      hasBeenStarted: true, // Mark that simulation has been started
      hasCollided: false,
      puck1: { 
        ...prev.puck1,
        vx: vx, 
        vy: vy, 
        mass: 505
      },      puck2: { 
        ...prev.puck2,
        vx: 0, 
        vy: 0, 
        mass: 505
      },
      // Set initial before collision data
      beforeCollision: {
        puck1: { vx: vx, vy: vy, mass: 505 },
        puck2: { vx: 0, vy: 0, mass: 505 }
      },
      // Reset after collision data
      afterCollision: {
        puck1: { vx: 0, vy: 0, mass: 505 },
        puck2: { vx: 0, vy: 0, mass: 505 }
      }
    }));
  };

  const stopSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    setSimulationState(prev => ({
      ...prev,
      isRunning: false
    }));
  };  const resetSimulation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }    // Calculate initial position for puck 1 based on current angle
    const puck2Center = { x: 300, y: 200 };
    const circleCenter = { x: 400, y: 200 }; // Circle center moved further right for more pronounced glancing blows
    const radius = 300; // Moderate radius for good collision variety while keeping puck 1 well within screen bounds
    // Add 180° offset so angle 0° positions puck 1 on the left side
    // For 1D mode, always use 0° angle; for 2D mode, use the current slider value
    const effectiveAngle = simulationState.collisionType === '1D' ? 0 : simulationState.launchAngle;
    const angleRad = ((effectiveAngle + 180) * Math.PI) / 180;
    const initialPuck1X = circleCenter.x + radius * Math.cos(angleRad);
    const initialPuck1Y = circleCenter.y + radius * Math.sin(angleRad);setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      hasBeenStarted: false, // Reset the started flag so Start button becomes visible again
      hasCollided: false,
      puck1: { x: initialPuck1X, y: initialPuck1Y, vx: 0, vy: 0, mass: 505, radius: 20 },
      puck2: { x: 300, y: 200, vx: 0, vy: 0, mass: 505, radius: 20 },
      sparkTrail: [], // Clear the spark trail on reset
      frameCounter: 0,
      pucksVisible: true,
      simulationEndTime: null,
      dataUsedForTrial: null // Reset the data used flag
    }));
  };const updateLaunchAngle = (angle) => {
    // Calculate circular position for puck 1 around a center point to the right of puck 2
    const puck2Center = { x: 300, y: 200 }; // Fixed position for puck 2
    const circleCenter = { x: 400, y: 200 }; // Circle center moved further right for more pronounced glancing blows
    const radius = 300; // Moderate radius for good collision variety while keeping puck 1 well within screen bounds
    // Add 180° so that angle 0° positions puck 1 on the left side
    const angleRad = ((angle + 180) * Math.PI) / 180;
    
    // Calculate new position for puck 1 on the circle
    const newPuck1X = circleCenter.x + radius * Math.cos(angleRad);
    const newPuck1Y = circleCenter.y + radius * Math.sin(angleRad);
    
    setSimulationState(prev => ({
      ...prev,
      launchAngle: angle,
      puck1: {
        ...prev.puck1,
        x: newPuck1X,
        y: newPuck1Y
      }
    }));
  };  const updateLaunchSpeed = (speed) => {
    setSimulationState(prev => ({
      ...prev,
      launchSpeed: speed
    }));
  };  const updateCollisionMode = (mode) => {
    // Calculate the appropriate puck 1 position based on the new mode
    const puck2Center = { x: 300, y: 200 };
    const circleCenter = { x: 400, y: 200 };
    const radius = 300;
    
    // Use 0° for 1D mode, 1° for 2D mode (when switching from 1D to 2D)
    let newAngle;
    if (mode === '1D') {
      newAngle = 0;
    } else if (mode === '2D' && simulationState.collisionType === '1D') {
      // Switching from 1D to 2D, set to 1 degree
      newAngle = 1;
    } else {
      // Already in 2D mode, keep current angle
      newAngle = simulationState.launchAngle;
    }
    
    const angleRad = ((newAngle + 180) * Math.PI) / 180;
    const newPuck1X = circleCenter.x + radius * Math.cos(angleRad);
    const newPuck1Y = circleCenter.y + radius * Math.sin(angleRad);

    setSimulationState(prev => ({
      ...prev,
      collisionType: mode,
      launchAngle: newAngle,
      puck1: {
        ...prev.puck1,
        x: newPuck1X,
        y: newPuck1Y,
        vx: 0,
        vy: 0
      },
      // Reset collision data when switching modes
      hasCollided: false,
      sparkTrail: [],
      frameCounter: 0,
      dataUsedForTrial: null
    }));
  };

  // Helper function to check if current collision data can be used
  const canAddDataToTrial = () => {
    return !simulationState.isRunning && 
           simulationState.hasCollided && 
           !simulationState.dataUsedForTrial; // Only show if data hasn't been used yet
  };
  // Helper function to check trial data completion status
  const checkTrialDataCompletion = () => {
    let totalTrials = 0;
    let completedTrials = 0;
    let hasAnyData = false;

    // Check both 1D and 2D trial data
    ['1D', '2D'].forEach(collisionType => {
      ['trial1', 'trial2', 'trial3'].forEach(trialKey => {
        const trial = trialData[collisionType][trialKey];
        totalTrials++;

        // Check if trial has data based on collision type
        let hasData = false;
        if (collisionType === '1D') {
          // For 1D trials, check for spacing and momentum data
          hasData = trial?.beforeCollision?.puck1?.spacing && 
                   trial?.beforeCollision?.puck1?.momentum &&
                   trial?.afterCollision?.puck1?.spacing &&
                   trial?.afterCollision?.puck1?.momentum;
        } else if (collisionType === '2D') {
          // For 2D trials, check for spacing, angle, and momentum components
          hasData = trial?.beforeCollision?.puck1?.spacing && 
                   trial?.beforeCollision?.puck1?.angle &&
                   trial?.beforeCollision?.puck1?.momentumX &&
                   trial?.afterCollision?.puck1?.spacing &&
                   trial?.afterCollision?.puck1?.angle &&
                   trial?.afterCollision?.puck1?.momentumX;
        }

        if (hasData) {
          completedTrials++;
          hasAnyData = true;
        }
      });
    });

    return {
      totalTrials,
      completedTrials,
      hasAnyData,
      completionPercentage: totalTrials > 0 ? (completedTrials / totalTrials) * 100 : 0
    };
  };
  // Function to get current simulation status based on trial data
  const getSimulationStatus = () => {
    const trialStats = checkTrialDataCompletion();
    
    if (trialStats.completedTrials === 0) {
      return 'not-started';
    } else if (trialStats.completedTrials >= 6) {
      // Consider completed if all 6 trials are done (3 for 1D and 3 for 2D)
      return 'completed';
    } else {
      return 'in-progress';
    }
  };

  // Animation loop
  React.useEffect(() => {
    if (simulationState.isRunning) {
      const id = requestAnimationFrame(() => {
        animate();
        setAnimationId(id);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [simulationState.isRunning, simulationState.puck1, simulationState.puck2]);

  // Handle puck visibility after simulation ends
  React.useEffect(() => {
    if (simulationState.simulationEndTime && !simulationState.isRunning) {
      const timer = setTimeout(() => {
        setSimulationState(prev => ({
          ...prev,
          pucksVisible: false
        }));
      }, 5000); // Hide pucks 5 seconds after simulation ends

      return () => clearTimeout(timer);
    }
  }, [simulationState.simulationEndTime, simulationState.isRunning]);
  const scrollToSection = (sectionName) => {
    setCurrentSection(sectionName);
    const element = document.getElementById(`section-${sectionName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const inProgressCount = Object.values(sectionStatus).filter(status => status === 'in-progress').length;  // Show start lab screen if lab hasn't started
  if (!labStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Lab 1 - Conservation of Momentum</h1>
          {/* Introduction Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The purpose of this lab is to confirm if the law of conservation of momentum applies to 1-D and 2-D 
              collisions. Throughout the lab, keep in mind that you are not solving for any unknown; you will know 
              all the masses and all the velocities, and therefore all the momentums. What we want to examine is 
              whether or not the total initial momentum you measure at the start is the same as the total final 
              momentum at the end.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Also consider that although your final results will not have a 0% error (that 
              would be exceedingly rare!) you must make a reasonable judgment as to whether or not conservation 
              of momentum applied in your collisions.
            </p>
          </div>

          {/* Objective Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Objective</h2>
            <p className="text-gray-700 leading-relaxed">
              To determine if momentum is conserved during 1-D and 2-D collisions.
            </p>
          </div>
        </div>
          {/* Start Lab Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to Begin?</h2>
            <p className="text-gray-600 mb-4">
              This lab contains all parts of a lab report and an interactive simulation. You can save your progress and return later if needed.
            </p>            <button
              onClick={startLab}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200 text-lg"
            >
              Start Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lab 1 - Conservation of Momentum</h1>      {/* Combined Navigation & Progress */}
      <div className="sticky top-0 z-10 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'hypothesis', label: 'Hypothesis' },
                { key: 'procedure', label: 'Procedure' },
                { key: 'simulation', label: 'Simulation' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'error', label: 'Error' },
                { key: 'conclusion', label: 'Conclusion' }              ].map(section => {
                // Get the appropriate status for this section
                const sectionStatusValue = section.key === 'simulation' ? getSimulationStatus() : sectionStatus[section.key];
                
                return (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                      sectionStatusValue === 'completed'
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : sectionStatusValue === 'in-progress'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : currentSection === section.key 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >                    <span>{section.label}</span>
                    {sectionStatusValue === 'completed' && <span className="text-green-600">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Save and End Button */}
            <button 
              onClick={saveAndEnd}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded border border-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Save and End
            </button>
          </div>        </div>
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

      {/* Hypothesis Section */}
      <div id="section-hypothesis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.hypothesis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Hypothesis</span>
          {getStatusIcon(sectionStatus.hypothesis)}
        </h2>        <div className="space-y-4">
          <div>
            <label htmlFor="hypothesis-input" className="block text-sm font-medium text-gray-700 mb-2">
              Your Hypothesis:
            </label>
            <textarea
              id="hypothesis-input"
              value={sectionContent.hypothesis}
              onChange={(e) => updateSectionContent('hypothesis', e.target.value)}
              placeholder="If objects collide in a closed system, then..., because..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {sectionContent.hypothesis.length} characters
              </span>
              {(() => {
                const content = sectionContent.hypothesis.toLowerCase();
                const hasIf = content.includes('if');
                const hasThen = content.includes('then');
                const hasBecause = content.includes('because');
                const hasLength = sectionContent.hypothesis.trim().length > 20;
                
                if (hasIf && hasThen && hasBecause && hasLength) {
                  return <span className="text-xs text-green-600">✓ Complete hypothesis format</span>;
                } else if (sectionContent.hypothesis.trim().length > 0) {
                  const missing = [];
                  if (!hasIf) missing.push('if');
                  if (!hasThen) missing.push('then');
                  if (!hasBecause) missing.push('because');
                  
                  if (missing.length > 0) {
                    return <span className="text-xs text-yellow-600">Need: {missing.join(', ')}</span>;
                  } else if (!hasLength) {
                    return <span className="text-xs text-yellow-600">Need more detail</span>;
                  }
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>      {/* Procedure Section */}
      <div id="section-procedure" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.procedure)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Procedure</span>
          {getStatusIcon(sectionStatus.procedure)}
        </h2>
        <div className="space-y-4">
          {/* Equipment */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Equipment</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Air table</li>
              <li>• Two 505g pucks</li>
              <li>• Measurement tools (ruler/protractor)</li>
              <li>• Spark generator that will deliver one spark each 1/10 of a second through a wire in the puck to cause a small mark
 on the underside of the paper.</li>
            </ul>
          </div>          {/* Trial Procedures */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Experiments</h3>
              <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Part A: 1-D Head-on Collision</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  You will have one of the pucks motionless in the middle of the air table and hit it with the other puck in a head-on 1-D collision.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Part B: 2-D Glancing Collision</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  You will start again with one of the pucks motionless in the middle of the air table, but this time it will be hit by the other puck in a glancing 2-D collision.
                </p>
              </div>            </div>
          </div>          {/* Important Lab Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-700 text-sm leading-relaxed space-y-3">
              <p>
                Remember that this lab is fundamentally different from many of the questions you have been working 
                on for conservation of momentum. Up until now, you have most often used the conservation of 
                momentum in a situation where you have two objects colliding, but have had no knowledge of one of 
                the objects' motion at a particular time. You then used conservation of momentum to calculate that 
                missing motion. <strong>This is not the case in this lab!</strong>
              </p>
              
              <p>
                <strong>In this lab, you have all the information about all the motion of all the objects!</strong>
              </p>
              
              <p>Since you know:</p>
              <ul className="list-decimal ml-6 space-y-1">
                <li>the time (from how many spark dots are made)</li>
                <li>the displacement (from measuring the distance covered by the spark dots)</li>
                <li>the momentum (p = mv)</li>
                <li>even the direction (only applies to Part B)</li>
              </ul>
              
              <p>
                ...it may seem like you have nothing to calculate. That is not the case. What you need to remember 
                is that you are trying to <strong>confirm the conservation of momentum</strong>. To confirm it, you will need 
                to be able to show (within a reasonable error) that the momentum before the collision is equal to the 
                momentum after. You can do this by figuring out the total x and y components before and after the 
                collision and comparing them.
              </p>
            </div>
          </div>

          {/* Procedure Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="procedure-read-checkbox"
                checked={procedureRead}
                onChange={(e) => handleProcedureReadChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="procedure-read-checkbox" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                I have read and understood the experimental procedure above
              </label>
            </div>
          </div>
        </div>
      </div>      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(getSimulationStatus())}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Simulation</span>
          {getStatusIcon(getSimulationStatus())}
        </h2>
        <div className="space-y-6">          <div className="bg-gray-50 p-4 rounded-lg">            <p className="text-sm text-gray-600 mb-4">
              Use this interactive simulation to perform collision experiments. Toggle between 1D and 2D modes to create different collision types 
              and observe how momentum is conserved. Record your observations for analysis. All angles are measured from the horizontal.
            </p>              {/* Simulation Controls */}            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Mode:</label>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => updateCollisionMode('1D')}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      simulationState.collisionType === '1D'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    disabled={simulationState.isRunning}
                  >
                    1D
                  </button>
                  <button
                    onClick={() => updateCollisionMode('2D')}
                    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                      simulationState.collisionType === '2D'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    disabled={simulationState.isRunning}
                  >
                    2D
                  </button>
                </div>
              </div>              {/* Launch Angle - only visible in 2D mode */}
              {simulationState.collisionType === '2D' && (
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-gray-700">Angle:</label>
                  <input 
                    type="range"
                    min="1"
                    max="15"
                    value={simulationState.launchAngle}
                    onChange={(e) => updateLaunchAngle(Number(e.target.value))}
                    className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={simulationState.isRunning}
                  />
                  <span className="text-xs text-gray-600 w-8">{simulationState.launchAngle}°</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">Speed:</label>
                <span className="text-xs text-gray-500">Slow</span>
                <input 
                  type="range"
                  min="2"
                  max="6"
                  step="0.1"
                  value={simulationState.launchSpeed}
                  onChange={(e) => updateLaunchSpeed(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={simulationState.isRunning}
                />
                <span className="text-xs text-gray-500">Fast</span>
              </div>
                {/* Only show Start button if simulation hasn't been started yet */}
              {!simulationState.hasBeenStarted && (
                <button 
                  onClick={startSimulation}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  disabled={simulationState.isRunning}
                >
                  Start
                </button>
              )}              {/* Only show Reset button if simulation has been started */}              {simulationState.hasBeenStarted && (
                <button 
                  onClick={resetSimulation}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Trial Selector Modal */}
            {showTrialSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Select Trial to Add Data</h3>
                  <p className="text-gray-600 mb-4">Choose which trial to populate with the collision data from this simulation:</p>
                  
                  <div className="space-y-3 mb-6">                    {[1, 2, 3].map(trialNum => (
                      <button
                        key={trialNum}
                        onClick={() => addDataToTrial(trialNum)}
                        className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                      >                        <div className="font-medium">Trial {trialNum}</div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const currentTrialData = trialData[simulationState.collisionType][`trial${trialNum}`];
                            // Check if trial has data based on collision type
                            if (simulationState.collisionType === '1D') {
                              const hasData = currentTrialData?.beforeCollision?.puck1?.spacing || 
                                            currentTrialData?.beforeCollision?.puck1?.momentum ||
                                            currentTrialData?.afterCollision?.puck1?.spacing ||
                                            currentTrialData?.afterCollision?.puck1?.momentum;
                              return hasData ? 'Has data - will overwrite' : 'Empty - ready for data';
                            } else {
                              const hasData = currentTrialData?.beforeCollision?.puck1?.spacing || 
                                            currentTrialData?.beforeCollision?.puck1?.momentumX ||
                                            currentTrialData?.afterCollision?.puck1?.spacing ||
                                            currentTrialData?.afterCollision?.puck1?.momentumX;
                              return hasData ? 'Has data - will overwrite' : 'Empty - ready for data';
                            }
                          })()}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowTrialSelector(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}{/* Simulation Layout with Data on Left */}
            <div className="flex gap-4">              {/* Data Display Column */}
              <div className="flex flex-col space-y-4 w-64">                <div className="bg-blue-50 p-3 rounded border text-sm">
                  <h4 className="font-semibold text-blue-800 mb-2">Puck 1 (Blue)</h4>
                  {simulationState.hasCollided && simulationState.beforeCollision && (
                    <>                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="font-medium text-blue-700 mb-1">Before Collision:</div>
                        <div>Spacing: {simulationState.beforeCollision.puck1?.vx !== undefined && simulationState.beforeCollision.puck1?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.beforeCollision.puck1?.vx !== undefined && simulationState.beforeCollision.puck1?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.beforeCollision.puck1.vx, simulationState.beforeCollision.puck1.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-blue-700 mb-1">After Collision:</div>
                        <div>Spacing: {simulationState.afterCollision.puck1?.vx !== undefined && simulationState.afterCollision.puck1?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.afterCollision.puck1?.vx !== undefined && simulationState.afterCollision.puck1?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.afterCollision.puck1.vx, simulationState.afterCollision.puck1.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                    </>
                  )}
                </div>                <div className="bg-red-50 p-3 rounded border text-sm">
                  <h4 className="font-semibold text-red-800 mb-2">Puck 2 (Red)</h4>
                  {simulationState.hasCollided && simulationState.beforeCollision && (
                    <>                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="font-medium text-red-700 mb-1">Before Collision:</div>
                        <div>Spacing: {simulationState.beforeCollision.puck2?.vx !== undefined && simulationState.beforeCollision.puck2?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.beforeCollision.puck2?.vx !== undefined && simulationState.beforeCollision.puck2?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.beforeCollision.puck2.vx, simulationState.beforeCollision.puck2.vy).toFixed(1) : '0.0'}°</div>
                      </div>                      <div className="mt-1">
                        <div className="font-medium text-red-700 mb-1">After Collision:</div>
                        <div>Spacing: {simulationState.afterCollision.puck2?.vx !== undefined && simulationState.afterCollision.puck2?.vy !== undefined ? calculateSparkDotSpacingCm(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy).toFixed(1) : '0.0'} cm</div>
                        <div>Angle: {simulationState.afterCollision.puck2?.vx !== undefined && simulationState.afterCollision.puck2?.vy !== undefined ? calculateAngleFromHorizontal(simulationState.afterCollision.puck2.vx, simulationState.afterCollision.puck2.vy).toFixed(1) : '0.0'}°</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Add Data to Trial Button - moved to data column */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => canAddDataToTrial() && setShowTrialSelector(true)}
                    disabled={!canAddDataToTrial()}
                    className={`px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 w-full ${
                      canAddDataToTrial() 
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Data to Trial
                  </button>
                </div>
                
              </div>

              {/* Physics Canvas */}
              <div className="relative border-2 border-gray-300 rounded-lg bg-white" style={{ width: '500px', height: '400px' }}>
                {/* Canvas background with grid */}
                <svg width="500" height="400" className="absolute inset-0">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                    </pattern>
                  </defs>                  <rect width="100%" height="100%" fill="url(#grid)" />                  {/* Spark Trail Dots - persistent, no fading */}
                  {simulationState.sparkTrail && simulationState.sparkTrail.map((dot, index) => (
                    <g key={`trail-${dot.timestamp}-${index}`}>
                      {/* Puck 1 trail dot */}
                      <circle 
                        cx={dot.puck1.x} 
                        cy={dot.puck1.y} 
                        r="2"
                        fill="#3b82f6"
                        opacity="0.8"
                      />
                      {/* Puck 2 trail dot */}
                      <circle 
                        cx={dot.puck2.x} 
                        cy={dot.puck2.y} 
                        r="2"
                        fill="#ef4444"
                        opacity="0.8"
                      />
                    </g>
                  ))}
                  
                  {/* Puck 1 - only show if visible */}
                  {simulationState.pucksVisible && (
                    <>
                      <circle 
                        cx={simulationState.puck1.x} 
                        cy={simulationState.puck1.y} 
                        r={simulationState.puck1.radius}
                        fill="#3b82f6"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />
                      <text 
                        x={simulationState.puck1.x} 
                        y={simulationState.puck1.y + 5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold"
                      >
                        1
                      </text>
                    </>
                  )}
                  
                  {/* Puck 2 - only show if visible */}
                  {simulationState.pucksVisible && (
                    <>
                      <circle 
                        cx={simulationState.puck2.x} 
                        cy={simulationState.puck2.y} 
                        r={simulationState.puck2.radius}
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth="2"
                      />
                      <text 
                        x={simulationState.puck2.x} 
                        y={simulationState.puck2.y + 5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontWeight="bold"
                      >                        2
                      </text>
                    </>
                  )}
                  
                  {/* Scale ruler - visual reference for measurements */}
                  <g>
                    {/* Main ruler line */}
                    <line x1="20" y1="380" x2="120" y2="380" stroke="#333" strokeWidth="2"/>
                    
                    {/* Tick marks every 10 pixels (1 cm) */}
                    <line x1="20" y1="375" x2="20" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="30" y1="377" x2="30" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="40" y1="377" x2="40" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="50" y1="375" x2="50" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="60" y1="377" x2="60" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="70" y1="377" x2="70" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="80" y1="377" x2="80" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="90" y1="377" x2="90" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="100" y1="375" x2="100" y2="385" stroke="#333" strokeWidth="1"/>
                    <line x1="110" y1="377" x2="110" y2="383" stroke="#333" strokeWidth="1"/>
                    <line x1="120" y1="375" x2="120" y2="385" stroke="#333" strokeWidth="1"/>
                    
                    {/* Labels */}
                    <text x="20" y="395" textAnchor="middle" fontSize="10" fill="#333">0</text>
                    <text x="70" y="395" textAnchor="middle" fontSize="10" fill="#333">5 cm</text>
                    <text x="120" y="395" textAnchor="middle" fontSize="10" fill="#333">10 cm</text>                  </g>                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>{/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Observations</span>
          {getStatusIcon(sectionStatus.observations)}
        </h2>
        <div className="space-y-6">
          <p className="text-gray-700">
            Record your observations from the simulation experiments. Complete at least 3 trials for each collision type 
            and document the momentum values before and after collision.
          </p>          {/* Data Table for 1-D Collisions */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">1-D Collision Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Record spark tape spacing (automatically calculated from simulation), time intervals (0.1s), and momentum (kg⋅cm/s).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">Trial</th>
                    <th className="border border-gray-300 p-2" colSpan="3">Before Collision - Puck 1</th>
                    <th className="border border-gray-300 p-2" colSpan="3">Before Collision - Puck 2</th>
                    <th className="border border-gray-300 p-2" colSpan="3">After Collision - Puck 1</th>
                    <th className="border border-gray-300 p-2" colSpan="3">After Collision - Puck 2</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Momentum (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Momentum (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Momentum (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>                    <th className="border border-gray-300 p-2">Momentum (kg⋅cm/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(trial => {
                    const trialKey = `trial${trial}`;
                    const data = trialData['1D'][trialKey];
                    return (
                      <tr key={trial}>
                        <td className="border border-gray-300 p-2 text-center font-medium">{trial}</td>
                        {/* Before Collision - Puck 1 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck1?.spacing || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck1?.time || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum?.beforeCollision?.puck1 && 
                              validateMomentum(data.userMomentum.beforeCollision.puck1, data?.beforeCollision?.puck1?.momentum)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum?.beforeCollision?.puck1 || ''}
                            onChange={(e) => updateUserMomentum(trial, 'beforeCollision', 'puck1', e.target.value)}
                          />
                        </td>
                        {/* Before Collision - Puck 2 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck2?.spacing || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck2?.time || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum?.beforeCollision?.puck2 && 
                              validateMomentum(data.userMomentum.beforeCollision.puck2, data?.beforeCollision?.puck2?.momentum)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum?.beforeCollision?.puck2 || ''}
                            onChange={(e) => updateUserMomentum(trial, 'beforeCollision', 'puck2', e.target.value)}
                          />
                        </td>
                        {/* After Collision - Puck 1 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck1?.spacing || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck1?.time || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum?.afterCollision?.puck1 && 
                              validateMomentum(data.userMomentum.afterCollision.puck1, data?.afterCollision?.puck1?.momentum)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum?.afterCollision?.puck1 || ''}
                            onChange={(e) => updateUserMomentum(trial, 'afterCollision', 'puck1', e.target.value)}
                          />
                        </td>
                        {/* After Collision - Puck 2 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck2?.spacing || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck2?.time || '-'}
                        </td>                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum?.afterCollision?.puck2 && 
                              validateMomentum(data.userMomentum.afterCollision.puck2, data?.afterCollision?.puck2?.momentum)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum?.afterCollision?.puck2 || ''}
                            onChange={(e) => updateUserMomentum(trial, 'afterCollision', 'puck2', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>          {/* Data Table for 2-D Collisions */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">2-D Collision Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Record spark tape spacing, time intervals (0.1s), angles from horizontal, and X/Y momentum components for 2D vector analysis.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">Trial</th>
                    <th className="border border-gray-300 p-2" colSpan="5">Before Collision - Puck 1</th>
                    <th className="border border-gray-300 p-2" colSpan="5">Before Collision - Puck 2</th>
                    <th className="border border-gray-300 p-2" colSpan="5">After Collision - Puck 1</th>
                    <th className="border border-gray-300 p-2" colSpan="5">After Collision - Puck 2</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Angle (°)</th>
                    <th className="border border-gray-300 p-2">Momentum X (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Momentum Y (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Angle (°)</th>
                    <th className="border border-gray-300 p-2">Momentum X (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Momentum Y (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Angle (°)</th>
                    <th className="border border-gray-300 p-2">Momentum X (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Momentum Y (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Spacing (cm)</th>
                    <th className="border border-gray-300 p-2">Time (s)</th>
                    <th className="border border-gray-300 p-2">Angle (°)</th>
                    <th className="border border-gray-300 p-2">Momentum X (kg⋅cm/s)</th>                    <th className="border border-gray-300 p-2">Momentum Y (kg⋅cm/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(trial => {
                    const trialKey = `trial${trial}`;
                    const data = trialData['2D'][trialKey];
                    return (
                      <tr key={trial}>
                        <td className="border border-gray-300 p-2 text-center font-medium">{trial}</td>
                        {/* Before Collision - Puck 1 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck1?.spacing || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck1?.time || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck1?.angle || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.beforeCollision?.puck1?.x && 
                              validateMomentum(data.userMomentum2D.beforeCollision.puck1.x, data?.beforeCollision?.puck1?.momentumX)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.beforeCollision?.puck1?.x || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'beforeCollision', 'puck1', 'x', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.beforeCollision?.puck1?.y && 
                              validateMomentum(data.userMomentum2D.beforeCollision.puck1.y, data?.beforeCollision?.puck1?.momentumY)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.beforeCollision?.puck1?.y || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'beforeCollision', 'puck1', 'y', e.target.value)}
                          />
                        </td>
                        {/* Before Collision - Puck 2 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck2?.spacing || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck2?.time || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.beforeCollision?.puck2?.angle || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.beforeCollision?.puck2?.x && 
                              validateMomentum(data.userMomentum2D.beforeCollision.puck2.x, data?.beforeCollision?.puck2?.momentumX)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.beforeCollision?.puck2?.x || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'beforeCollision', 'puck2', 'x', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.beforeCollision?.puck2?.y && 
                              validateMomentum(data.userMomentum2D.beforeCollision.puck2.y, data?.beforeCollision?.puck2?.momentumY)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.beforeCollision?.puck2?.y || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'beforeCollision', 'puck2', 'y', e.target.value)}
                          />
                        </td>
                        {/* After Collision - Puck 1 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck1?.spacing || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck1?.time || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck1?.angle || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.afterCollision?.puck1?.x && 
                              validateMomentum(data.userMomentum2D.afterCollision.puck1.x, data?.afterCollision?.puck1?.momentumX)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.afterCollision?.puck1?.x || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'afterCollision', 'puck1', 'x', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.afterCollision?.puck1?.y && 
                              validateMomentum(data.userMomentum2D.afterCollision.puck1.y, data?.afterCollision?.puck1?.momentumY)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.afterCollision?.puck1?.y || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'afterCollision', 'puck1', 'y', e.target.value)}
                          />
                        </td>
                        {/* After Collision - Puck 2 */}
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck2?.spacing || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck2?.time || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {data?.afterCollision?.puck2?.angle || '-'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.afterCollision?.puck2?.x && 
                              validateMomentum(data.userMomentum2D.afterCollision.puck2.x, data?.afterCollision?.puck2?.momentumX)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.afterCollision?.puck2?.x || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'afterCollision', 'puck2', 'x', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-full text-center px-2 py-1 rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors ${
                              data?.userMomentum2D?.afterCollision?.puck2?.y && 
                              validateMomentum(data.userMomentum2D.afterCollision.puck2.y, data?.afterCollision?.puck2?.momentumY)
                                ? 'bg-green-100 border-green-400' 
                                : ''
                            }`}
                            value={data?.userMomentum2D?.afterCollision?.puck2?.y || ''}
                            onChange={(e) => updateUserMomentum2D(trial, 'afterCollision', 'puck2', 'y', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Analysis</span>
          {getStatusIcon(sectionStatus.analysis)}
        </h2>        <div className="space-y-6">
          <p className="text-gray-700">
            Analyze your data to determine whether momentum was conserved in your collision experiments. 
            Show calculations and compare theoretical expectations with experimental results.
          </p>

          {/* 1-D Collision Analysis Table */}
          <div className="bg-white border rounded-lg p-4">            <h3 className="font-semibold text-gray-800 mb-3">1-D Collision Analysis</h3>
            <p className="text-sm text-gray-600 mb-3">
              Calculate the total momentum before and after collision for each trial. The individual momentum values are copied from your student input in the observation data above.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2">Trial</th>
                    <th className="border border-gray-300 p-2" colSpan="2">Before Collision - Individual Momentum (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2" colSpan="2">After Collision - Individual Momentum (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Total Momentum Before (kg⋅cm/s)</th>
                    <th className="border border-gray-300 p-2">Total Momentum After (kg⋅cm/s)</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">Puck 1</th>
                    <th className="border border-gray-300 p-2">Puck 2</th>
                    <th className="border border-gray-300 p-2">Puck 1</th>
                    <th className="border border-gray-300 p-2">Puck 2</th>
                    <th className="border border-gray-300 p-2">Calculate</th>
                    <th className="border border-gray-300 p-2">Calculate</th>
                  </tr>
                </thead>                <tbody>
                  {[1, 2, 3].map(trial => {
                    const trialKey = `trial${trial}`;
                    const data = trialData['1D'][trialKey];
                    return (
                      <tr key={trial}>
                        <td className="border border-gray-300 p-2 text-center font-medium">{trial}</td>                        {/* Before Collision - Puck 1 Momentum (copied from user input in observations) */}
                        <td className="border border-gray-300 p-2 text-center bg-gray-50">
                          {data?.userMomentum?.beforeCollision?.puck1 || '-'}
                        </td>
                        {/* Before Collision - Puck 2 Momentum (copied from user input in observations) */}
                        <td className="border border-gray-300 p-2 text-center bg-gray-50">
                          {data?.userMomentum?.beforeCollision?.puck2 || '-'}
                        </td>
                        {/* After Collision - Puck 1 Momentum (copied from user input in observations) */}
                        <td className="border border-gray-300 p-2 text-center bg-gray-50">
                          {data?.userMomentum?.afterCollision?.puck1 || '-'}
                        </td>
                        {/* After Collision - Puck 2 Momentum (copied from user input in observations) */}
                        <td className="border border-gray-300 p-2 text-center bg-gray-50">
                          {data?.userMomentum?.afterCollision?.puck2 || '-'}
                        </td>{/* Total Momentum Before - Student Input */}
                        <td className="border border-gray-300 p-2">
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                            onChange={(e) => updateSectionContent('analysis', e.target.value)}
                          />
                        </td>
                        {/* Total Momentum After - Student Input */}
                        <td className="border border-gray-300 p-2">
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded border-2 border-dashed border-blue-300 bg-blue-50 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                            onChange={(e) => updateSectionContent('analysis', e.target.value)}
                          />                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>            </div>
          </div>
        </div>
      </div>

      {/* Error Section */}
      <div id="section-error" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.error)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Error</span>
          {getStatusIcon(sectionStatus.error)}
        </h2>        <div className="space-y-6">
          <p className="text-gray-700">
            Identify and analyze potential sources of error in your momentum conservation experiments. 
            Consider both systematic and random errors that might affect your results.
          </p>
        </div>
      </div>

      {/* Conclusion Section */}
      <div id="section-conclusion" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.conclusion)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Conclusion</span>
          {getStatusIcon(sectionStatus.conclusion)}
        </h2>        <div className="space-y-6">
          <p className="text-gray-700">
            Summarize your findings and draw conclusions about momentum conservation based on your experimental results. 
            Address the original objective and hypothesis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lab1_ConservationOfMomentum;
