import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card } from '../ui/card';
import {
  Image,
  Link,
  Palette,
  Save,
  Loader2,
  Plus,
  Trash2,
  Star,
  StarOff,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { database, storage } from '../../firebase';
import { ref as dbRef, get, set, push, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

function BrandingOptions({ config, updateConfig }) {
  const { user } = useAuth();
  const [brandPresets, setBrandPresets] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load user's brand presets
  useEffect(() => {
    if (user) {
      loadBrandPresets();
    }
  }, [user]);

  const loadBrandPresets = async () => {
    setLoadingPresets(true);
    try {
      const presetsRef = dbRef(database, `users/${user.uid}/brandPresets`);
      const snapshot = await get(presetsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const presetsList = Object.entries(data).map(([id, preset]) => ({
          id,
          ...preset
        }));
        setBrandPresets(presetsList);
      }
    } catch (error) {
      console.error('Error loading brand presets:', error);
    } finally {
      setLoadingPresets(false);
    }
  };

  // Save current settings as a preset
  const saveAsPreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    setSavingPreset(true);
    try {
      const presetData = {
        name: presetName,
        logoUrl: config.logoUrl,
        logoPosition: config.logoPosition,
        logoSize: config.logoSize,
        logoOpacity: config.logoOpacity,
        logoLink: config.logoLink,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        textColor: config.textColor,
        endScreenMessage: config.endScreenMessage,
        endScreenCTA: config.endScreenCTA,
        endScreenURL: config.endScreenURL,
        createdAt: Date.now(),
        isDefault: false
      };

      const presetsRef = dbRef(database, `users/${user.uid}/brandPresets`);
      const newPresetRef = push(presetsRef);
      await set(newPresetRef, presetData);

      toast.success('Brand preset saved successfully!');
      setPresetName('');
      loadBrandPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast.error('Failed to save brand preset');
    } finally {
      setSavingPreset(false);
    }
  };

  // Load a preset
  const loadPreset = (preset) => {
    updateConfig({
      brandPresetId: preset.id,
      logoUrl: preset.logoUrl,
      logoPosition: preset.logoPosition,
      logoSize: preset.logoSize,
      logoOpacity: preset.logoOpacity,
      logoLink: preset.logoLink,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
      endScreenMessage: preset.endScreenMessage || '',
      endScreenCTA: preset.endScreenCTA || '',
      endScreenURL: preset.endScreenURL || '',
    });
    toast.success(`Loaded "${preset.name}" brand preset`);
  };

  // Delete a preset
  const deletePreset = async (presetId) => {
    if (window.confirm('Delete this brand preset?')) {
      try {
        const presetRef = dbRef(database, `users/${user.uid}/brandPresets/${presetId}`);
        await remove(presetRef);
        toast.success('Brand preset deleted');
        loadBrandPresets();
      } catch (error) {
        console.error('Error deleting preset:', error);
        toast.error('Failed to delete preset');
      }
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const logoRef = storageRef(storage, `brandLogos/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      updateConfig({ logoUrl: downloadURL });
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Presets */}
      {user && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Brand Presets</h3>

          {loadingPresets ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : brandPresets.length > 0 ? (
            <div className="space-y-2">
              {brandPresets.map((preset) => (
                <Card key={preset.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPreset(preset)}
                      >
                        Load
                      </Button>
                      <span className="font-medium">{preset.name}</span>
                      {preset.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePreset(preset.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No saved brand presets</p>
          )}

          {/* Save current as preset */}
          <div className="flex gap-2">
            <Input
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <Button
              onClick={saveAsPreset}
              disabled={savingPreset}
              size="sm"
            >
              {savingPreset ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Logo Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logo/Watermark
        </h3>

        {/* Logo Upload/URL */}
        <div className="space-y-2">
          <Label>Logo Image</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Logo URL"
              value={config.logoUrl}
              onChange={(e) => updateConfig({ logoUrl: e.target.value })}
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-upload').click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Logo Position */}
        <div className="space-y-2">
          <Label>Logo Position</Label>
          <RadioGroup
            value={config.logoPosition}
            onValueChange={(value) => updateConfig({ logoPosition: value })}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top-left" id="top-left" />
                <Label htmlFor="top-left">Top Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top-right" id="top-right" />
                <Label htmlFor="top-right">Top Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-left" id="bottom-left" />
                <Label htmlFor="bottom-left">Bottom Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom-right" id="bottom-right" />
                <Label htmlFor="bottom-right">Bottom Right</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Logo Size */}
        <div className="space-y-2">
          <Label>Logo Size</Label>
          <Select
            value={config.logoSize}
            onValueChange={(value) => updateConfig({ logoSize: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logo Opacity */}
        <div className="space-y-2">
          <Label>Logo Opacity: {config.logoOpacity}%</Label>
          <Slider
            value={[config.logoOpacity]}
            onValueChange={([value]) => updateConfig({ logoOpacity: value })}
            min={10}
            max={100}
            step={10}
          />
        </div>

        {/* Logo Link */}
        <div className="space-y-2">
          <Label htmlFor="logoLink">Logo Click URL</Label>
          <Input
            id="logoLink"
            placeholder="https://yourwebsite.com"
            value={config.logoLink}
            onChange={(e) => updateConfig({ logoLink: e.target.value })}
          />
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Brand Colors
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.accentColor}
                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                placeholder="#2563eb"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfig({ textColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.textColor}
                onChange={(e) => updateConfig({ textColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* End Screen */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">End Screen</h3>

        <div className="space-y-2">
          <Label htmlFor="endMessage">End Message</Label>
          <Input
            id="endMessage"
            placeholder="Thanks for watching!"
            value={config.endScreenMessage}
            onChange={(e) => updateConfig({ endScreenMessage: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endCTA">Call-to-Action Text</Label>
          <Input
            id="endCTA"
            placeholder="Visit our website"
            value={config.endScreenCTA}
            onChange={(e) => updateConfig({ endScreenCTA: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endURL">CTA Link</Label>
          <Input
            id="endURL"
            placeholder="https://yourwebsite.com"
            value={config.endScreenURL}
            onChange={(e) => updateConfig({ endScreenURL: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default BrandingOptions;