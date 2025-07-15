import React, { useState, useEffect, useRef } from 'react';

const LEDCircuitSimulation = ({ selectedLED, onVoltageChange, onThresholdDetected, isExperimentMode = false }) => {
  const [voltage, setVoltage] = useState(0);
  const [isLEDGlowing, setIsLEDGlowing] = useState(false);
  const [hasDetectedThreshold, setHasDetectedThreshold] = useState(false);
  const canvasRef = useRef(null);
  
  // Realistic LED threshold voltages (in volts)
  const thresholdVoltages = {
    red: 1.8,
    amber: 2.0, 
    yellow: 2.1,
    green: 2.2,
    blue: 2.8
  };
  
  // LED colors for visual representation
  const ledColors = {
    red: '#ff0000',
    amber: '#ffbf00',
    yellow: '#ffff00', 
    green: '#00ff00',
    blue: '#0080ff'
  };
  
  // Check if LED should be glowing based on voltage
  useEffect(() => {
    const threshold = thresholdVoltages[selectedLED];
    const shouldGlow = voltage >= threshold;
    setIsLEDGlowing(shouldGlow);
    
    // Detect threshold crossing for data recording
    if (shouldGlow && !hasDetectedThreshold && isExperimentMode) {
      setHasDetectedThreshold(true);
      onThresholdDetected(voltage);
    }
    
    onVoltageChange(voltage);
  }, [voltage, selectedLED, hasDetectedThreshold, isExperimentMode, onVoltageChange, onThresholdDetected]);
  
  // Reset threshold detection when LED changes
  useEffect(() => {
    setHasDetectedThreshold(false);
    setVoltage(0);
  }, [selectedLED]);
  
  // Draw circuit diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Circuit components positions
    const batteryX = 50;
    const batteryY = height / 2;
    const potX = 200;
    const potY = height / 2;
    const ledX = 350;
    const ledY = height / 2;
    const resistorX = 450;
    const resistorY = height / 2;
    const voltmeterX = 350;
    const voltmeterY = height / 2 - 80;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Draw connecting wires
    ctx.beginPath();
    // Battery to potentiometer
    ctx.moveTo(batteryX + 30, batteryY);
    ctx.lineTo(potX - 20, potY);
    // Potentiometer to LED
    ctx.moveTo(potX + 20, potY);
    ctx.lineTo(ledX - 20, ledY);
    // LED to resistor
    ctx.moveTo(ledX + 20, ledY);
    ctx.lineTo(resistorX - 20, resistorY);
    // Return path
    ctx.moveTo(resistorX + 20, resistorY);
    ctx.lineTo(resistorX + 20, resistorY + 60);
    ctx.lineTo(batteryX, resistorY + 60);
    ctx.lineTo(batteryX, batteryY + 15);
    // Voltmeter connections
    ctx.moveTo(ledX - 20, ledY);
    ctx.lineTo(voltmeterX - 30, voltmeterY + 30);
    ctx.moveTo(ledX + 20, ledY);
    ctx.lineTo(voltmeterX + 30, voltmeterY + 30);
    ctx.stroke();
    
    // Draw battery
    ctx.fillStyle = '#333';
    ctx.fillRect(batteryX, batteryY - 15, 30, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('6V', batteryX + 5, batteryY + 5);
    
    // Draw potentiometer
    ctx.strokeStyle = '#333';
    ctx.strokeRect(potX - 20, potY - 15, 40, 30);
    ctx.fillStyle = '#333';
    ctx.fillText('1kΩ Pot', potX - 25, potY + 40);
    
    // Draw LED
    const ledRadius = 15;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, 0, 2 * Math.PI);
    
    // LED glow effect
    if (isLEDGlowing) {
      const ledColor = ledColors[selectedLED];
      
      // Outer glow
      const gradient = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, ledRadius * 2);
      gradient.addColorStop(0, ledColor);
      gradient.addColorStop(0.5, ledColor + '80');
      gradient.addColorStop(1, ledColor + '20');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Inner LED
      ctx.fillStyle = ledColor;
      ctx.beginPath();
      ctx.arc(ledX, ledY, ledRadius * 0.7, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ddd';
      ctx.fill();
    }
    
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    // LED label
    ctx.fillStyle = '#333';
    ctx.fillText(`${selectedLED.toUpperCase()} LED`, ledX - 20, ledY + 35);
    
    // Draw resistor
    ctx.strokeStyle = '#333';
    ctx.strokeRect(resistorX - 20, resistorY - 8, 40, 16);
    ctx.fillText('330Ω', resistorX - 15, resistorY + 35);
    
    // Draw voltmeter
    ctx.beginPath();
    ctx.arc(voltmeterX, voltmeterY, 25, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.fillText('V', voltmeterX - 5, voltmeterY + 5);
    ctx.fillText(`${voltage.toFixed(2)}V`, voltmeterX - 20, voltmeterY - 40);
    
  }, [selectedLED, voltage, isLEDGlowing]);
  
  const handleVoltageChange = (e) => {
    setVoltage(parseFloat(e.target.value));
  };
  
  const resetPotentiometer = () => {
    setVoltage(0);
    setHasDetectedThreshold(false);
  };
  
  return (
    <div className="led-circuit-simulation bg-white p-6 rounded-lg border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">LED Circuit Simulation</h3>
        <p className="text-sm text-gray-600 mb-2">
          Current LED: <span className="font-semibold" style={{color: ledColors[selectedLED]}}>{selectedLED.toUpperCase()}</span>
        </p>
      </div>
      
      <div className="circuit-display mb-4">
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={200} 
          className="border border-gray-300 rounded"
        />
      </div>
      
      <div className="controls space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Potentiometer Control (Voltage across LED)
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="0.01"
            value={voltage}
            onChange={handleVoltageChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0V</span>
            <span>3V</span>
            <span>6V</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <strong>Voltage Reading: {voltage.toFixed(2)}V</strong>
          </div>
          <button
            onClick={resetPotentiometer}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Reset to 0V
          </button>
        </div>
        
        <div className="status-indicator p-2 rounded text-sm">
          {isLEDGlowing ? (
            <div className="text-green-600 font-semibold">
              ✅ LED is glowing! Threshold voltage detected.
            </div>
          ) : (
            <div className="text-gray-600">
              🔍 Slowly increase voltage until LED begins to glow...
            </div>
          )}
        </div>
        
        {isExperimentMode && hasDetectedThreshold && (
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <p className="text-green-800 text-sm">
              <strong>Threshold detected at {voltage.toFixed(2)}V</strong> - Record this value!
            </p>
          </div>
        )}
      </div>
      
      <div className="safety-warning mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800 text-sm">
          <strong>⚠️ Safety Note:</strong> In a real lab, do not stare directly at bright LEDs as it can harm your vision.
        </p>
      </div>
    </div>
  );
};

export default LEDCircuitSimulation;