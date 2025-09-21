import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

function SizeOptions({ config, updateConfig }) {
  const presetSizes = [
    { value: 'small', label: 'Small', width: '426', height: '240' },
    { value: 'medium', label: 'Medium', width: '640', height: '360' },
    { value: 'large', label: 'Large', width: '853', height: '480' },
    { value: 'hd', label: 'HD', width: '1280', height: '720' },
    { value: 'fullwidth', label: 'Full Width', width: '100%', height: '500' },
    { value: 'custom', label: 'Custom', width: config.width, height: config.height },
  ];

  const handleSizeChange = (value) => {
    updateConfig({ size: value });

    // Update dimensions for preset sizes
    const preset = presetSizes.find(s => s.value === value);
    if (preset && value !== 'custom') {
      updateConfig({
        size: value,
        width: preset.width,
        height: preset.height
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          📐 These settings only affect the <strong>embed code</strong> (iframe dimensions).
          They do not affect the direct share link appearance.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Preset Sizes</h3>
        <RadioGroup value={config.size} onValueChange={handleSizeChange}>
          <div className="grid grid-cols-2 gap-3">
            {presetSizes.map((size) => (
              <div key={size.value} className="flex items-center space-x-2">
                <RadioGroupItem value={size.value} id={size.value} />
                <Label htmlFor={size.value} className="cursor-pointer flex-1">
                  <span className="font-medium">{size.label}</span>
                  {size.value !== 'fullwidth' && size.value !== 'custom' && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {size.width}×{size.height}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Custom dimensions */}
      {config.size === 'custom' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium">Custom Dimensions</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="text"
                value={config.width}
                onChange={(e) => updateConfig({ width: e.target.value })}
                placeholder="e.g., 800 or 100%"
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="text"
                value={config.height}
                onChange={(e) => updateConfig({ height: e.target.value })}
                placeholder="e.g., 450"
              />
            </div>
          </div>
        </div>
      )}

      {/* Size tips */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-medium">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use "Full Width" for responsive blog posts</li>
          <li>HD size is best for high-quality presentations</li>
          <li>Small size works well for sidebars or thumbnails</li>
        </ul>
      </div>
    </div>
  );
}

export default SizeOptions;