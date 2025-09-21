import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function PlaybackOptions({ config, updateConfig }) {
  // Calculate minutes and seconds from total seconds
  const minutes = Math.floor((config.startTime || 0) / 60);
  const seconds = (config.startTime || 0) % 60;

  // Update start time from minutes and seconds
  const updateStartTime = (mins, secs) => {
    const totalSeconds = (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0);
    updateConfig({ startTime: totalSeconds });
  };

  return (
    <div className="space-y-6">
      {/* Playback settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="loop">Loop</Label>
            <p className="text-sm text-muted-foreground">
              Restart video when it ends
            </p>
          </div>
          <Switch
            id="loop"
            checked={config.loop}
            onCheckedChange={(checked) => updateConfig({ loop: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="controls">Show Controls</Label>
            <p className="text-sm text-muted-foreground">
              Display playback controls
            </p>
          </div>
          <Switch
            id="controls"
            checked={config.controls}
            onCheckedChange={(checked) => updateConfig({ controls: checked })}
          />
        </div>
      </div>

      {/* Start time */}
      <div className="space-y-2">
        <Label>Start Time</Label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={minutes === 0 ? '0' : minutes || ''}
              onChange={(e) => {
                const mins = Math.max(0, parseInt(e.target.value) || 0);
                updateStartTime(mins, seconds);
              }}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
          <span className="text-muted-foreground">:</span>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={seconds === 0 ? '0' : seconds || ''}
              onChange={(e) => {
                const secs = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                updateStartTime(minutes, secs);
              }}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ startTime: 0 })}
            className="text-xs px-2 py-1 rounded border hover:bg-muted"
          >
            Reset
          </button>
        </div>
        {/* Quick presets */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Quick set:</span>
          {[
            { label: '30s', value: 30 },
            { label: '1m', value: 60 },
            { label: '2m', value: 120 },
            { label: '5m', value: 300 },
          ].map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => updateConfig({ startTime: preset.value })}
              className="text-xs px-2 py-1 rounded border hover:bg-muted"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Set the time where the video should start playing
        </p>
      </div>

      {/* Playback speed */}
      <div className="space-y-2">
        <Label htmlFor="speed">Default Playback Speed</Label>
        <Select value={config.playbackSpeed} onValueChange={(value) => updateConfig({ playbackSpeed: value })}>
          <SelectTrigger id="speed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5x (Slow)</SelectItem>
            <SelectItem value="0.75">0.75x</SelectItem>
            <SelectItem value="1">1x (Normal)</SelectItem>
            <SelectItem value="1.25">1.25x</SelectItem>
            <SelectItem value="1.5">1.5x</SelectItem>
            <SelectItem value="2">2x (Fast)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Playback tips */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-medium">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Loop is great for promotional content</li>
          <li>Start time helps highlight specific moments</li>
          <li>Hide controls for cleaner embedded displays</li>
          <li>Adjust playback speed for tutorial videos</li>
        </ul>
      </div>
    </div>
  );
}

export default PlaybackOptions;