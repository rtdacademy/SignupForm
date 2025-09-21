import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Palette, Moon, Sun, Sunrise, Monitor, Sparkles, Leaf } from 'lucide-react';

function AppearanceOptions({ config, updateConfig }) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          🎨 These settings only affect the <strong>direct share link</strong> appearance.
          Embedded iframes will display as a clean player without these styles.
        </p>
      </div>

      {/* Theme selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Player Theme</h3>
        <RadioGroup value={config.theme} onValueChange={(value) => updateConfig({ theme: value })}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="dark" id="dark-theme" />
              <Label htmlFor="dark-theme" className="cursor-pointer flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <div>
                  <p className="font-medium">Dark</p>
                  <p className="text-xs text-muted-foreground">Classic dark theme</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="light" id="light-theme" />
              <Label htmlFor="light-theme" className="cursor-pointer flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <div>
                  <p className="font-medium">Light</p>
                  <p className="text-xs text-muted-foreground">Clean light theme</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="midnight" id="midnight-theme" />
              <Label htmlFor="midnight-theme" className="cursor-pointer flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="font-medium">Midnight</p>
                  <p className="text-xs text-muted-foreground">Deep blue theme</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="sunset" id="sunset-theme" />
              <Label htmlFor="sunset-theme" className="cursor-pointer flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">Sunset</p>
                  <p className="text-xs text-muted-foreground">Warm gradient</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="ocean" id="ocean-theme" />
              <Label htmlFor="ocean-theme" className="cursor-pointer flex items-center gap-2">
                <Monitor className="h-4 w-4 text-cyan-600" />
                <div>
                  <p className="font-medium">Ocean</p>
                  <p className="text-xs text-muted-foreground">Cool blue-green</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="forest" id="forest-theme" />
              <Label htmlFor="forest-theme" className="cursor-pointer flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Forest</p>
                  <p className="text-xs text-muted-foreground">Natural green</p>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Display options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="showTitle">Show Video Title</Label>
            <p className="text-sm text-muted-foreground">
              Display the video title above the player
            </p>
          </div>
          <Switch
            id="showTitle"
            checked={config.showTitle}
            onCheckedChange={(checked) => updateConfig({ showTitle: checked })}
          />
        </div>

        {config.showTitle && (
          <div className="p-4 border rounded-lg space-y-2">
            <Label htmlFor="customTitle">Custom Title (Optional)</Label>
            <Input
              id="customTitle"
              type="text"
              placeholder="Leave empty to use filename"
              value={config.customTitle || ''}
              onChange={(e) => updateConfig({ customTitle: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Set a custom title, or leave empty to use the original filename
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="minimalMode">Minimal Controls</Label>
            <p className="text-sm text-muted-foreground">
              Show only essential playback controls
            </p>
          </div>
          <Switch
            id="minimalMode"
            checked={config.minimalMode}
            onCheckedChange={(checked) => updateConfig({ minimalMode: checked })}
          />
        </div>

      </div>
    </div>
  );
}

export default AppearanceOptions;