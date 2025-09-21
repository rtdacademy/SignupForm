import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Settings, Palette } from 'lucide-react';
import SizeOptions from './SizeOptions';
import AppearanceOptions from './AppearanceOptions';
import EmbedPreview from './EmbedPreview';

const LOCALSTORAGE_KEY = 'embedCustomizerConfig';

// Default configuration
const DEFAULT_CONFIG = {
  // Size settings
  size: 'medium', // small, medium, large, hd, fullwidth, custom
  width: '640',
  height: '360',

  // Appearance settings
  theme: 'dark', // dark, light
  showTitle: true,
  customTitle: '', // Custom title - if empty, uses filename
  minimalMode: false,
};

function EmbedCustomizer({ isOpen, onClose, videoUrl, videoTitle }) {
  // Load saved config from localStorage or use defaults
  const getInitialConfig = () => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        // Remove old showControls property if it exists
        delete parsedConfig.showControls;
        // Ensure customTitle exists
        if (parsedConfig.customTitle === undefined) {
          parsedConfig.customTitle = '';
        }
        return parsedConfig;
      }
    } catch (error) {
      console.error('Error loading saved config:', error);
    }
    return DEFAULT_CONFIG;
  };

  const [activeTab, setActiveTab] = useState('size');
  const [embedCode, setEmbedCode] = useState('');
  const [shareLink, setShareLink] = useState('');

  // Embed configuration state
  const [config, setConfig] = useState(getInitialConfig());

  // Save config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [config]);

  // Update embed code and share link whenever config changes
  useEffect(() => {
    generateEmbedCode();
    generateShareLink();
  }, [config, videoUrl]);

  // Generate the embed code based on current configuration
  const generateEmbedCode = () => {
    // For embeds, we only use the base URL without any styling parameters
    // The iframe should be a clean player that integrates with the host site
    const iframeSrc = videoUrl;

    // Determine dimensions
    let width = config.width;
    let height = config.height;

    if (config.size === 'small') {
      width = '426';
      height = '240';
    } else if (config.size === 'medium') {
      width = '640';
      height = '360';
    } else if (config.size === 'large') {
      width = '853';
      height = '480';
    } else if (config.size === 'hd') {
      width = '1280';
      height = '720';
    } else if (config.size === 'fullwidth') {
      width = '100%';
      height = '500';
    }

    // Generate the iframe code
    const code = `<iframe
  src="${iframeSrc}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allowfullscreen
></iframe>`;

    setEmbedCode(code);
  };

  // Update configuration
  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Generate share link
  const generateShareLink = () => {
    // Build query parameters
    const params = new URLSearchParams();

    // Add appearance parameters
    params.append('theme', config.theme);
    if (!config.showTitle) params.append('title', '0');
    if (config.customTitle) params.append('customTitle', encodeURIComponent(config.customTitle));
    if (config.minimalMode) params.append('minimal', '1');

    const queryString = params.toString();
    setShareLink(`${videoUrl}${queryString ? '?' + queryString : ''}`);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customize Video Embed</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 overflow-hidden">
          {/* Configuration Panel */}
          <div className="overflow-y-auto px-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="size" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Embed Size</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Link Style</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="size" className="mt-4">
                <SizeOptions config={config} updateConfig={updateConfig} />
              </TabsContent>

              <TabsContent value="appearance" className="mt-4">
                <AppearanceOptions config={config} updateConfig={updateConfig} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col gap-4 overflow-hidden min-h-[400px] lg:min-h-0">
            <EmbedPreview
              embedCode={embedCode}
              config={config}
              videoUrl={videoUrl}
              videoTitle={videoTitle}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="flex-shrink-0">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              localStorage.removeItem(LOCALSTORAGE_KEY);
              toast.success('Reset to default settings');
            }}
            className="flex-shrink-0"
          >
            Reset to Defaults
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EmbedCustomizer;