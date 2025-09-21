import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Code, Eye, Copy, Check, Link, Monitor, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';

function EmbedPreview({ embedCode, config, videoUrl, videoTitle }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeView, setActiveView] = useState('code');

  // Generate share link dynamically based on current config
  const generateShareLink = () => {
    const params = new URLSearchParams();

    params.append('theme', config.theme);
    if (!config.showTitle) params.append('title', '0');
    if (config.customTitle) params.append('customTitle', encodeURIComponent(config.customTitle));
    if (config.minimalMode) params.append('minimal', '1');

    const queryString = params.toString();
    return `${videoUrl}${queryString ? '?' + queryString : ''}`;
  };

  // Get the share link dynamically
  const shareLink = generateShareLink();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedCode(true);
      toast.success('Embed code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      toast.success('Share link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Create a visual preview of the EMBED (clean player)
  const renderEmbedPreview = () => {
    // For embed preview, show the clean player without styling
    // This is what the embedded iframe will actually look like
    const iframeSrc = videoUrl;

    // Determine dimensions for preview
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

    const isPercentageWidth = width.includes('%');

    // Create a key for iframe reload
    const iframeKey = `embed-${config.size}-${width}-${height}`;

    return (
      <div className="space-y-4">
        {/* Size indicator */}
        <div className="text-sm text-muted-foreground text-center">
          Embed Preview Size: {width} × {height}
        </div>

        {/* Actual video iframe preview */}
        <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
          <div
            style={{
              width: isPercentageWidth ? '100%' : `${Math.min(parseInt(width), 500)}px`,
              maxWidth: '100%',
            }}
          >
            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                paddingBottom: isPercentageWidth ? '56.25%' : undefined,
                height: isPercentageWidth ? 0 : `${Math.min(parseInt(height), 280)}px`,
              }}
            >
              {/* Actual video iframe */}
              <iframe
                key={iframeKey}
                src={iframeSrc}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Video Preview"
              />
            </div>
          </div>
        </div>

        {/* Embed note */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Note:</p>
          <p>Embedded videos display as clean players without themes or titles for seamless integration.</p>
        </div>
      </div>
    );
  };

  // Create a visual preview of the LINK (with theme and styling)
  const renderLinkPreview = () => {
    // For link preview, show with all the styling options
    const params = new URLSearchParams();

    params.append('theme', config.theme);
    if (!config.showTitle) params.append('title', '0');
    if (config.customTitle) params.append('customTitle', encodeURIComponent(config.customTitle));
    if (config.minimalMode) params.append('minimal', '1');

    const queryString = params.toString();
    const iframeSrc = `${videoUrl}${queryString ? '?' + queryString : ''}`;

    // Create a key for iframe reload based on theme settings
    const iframeKey = `link-${config.theme}-${config.showTitle}-${config.customTitle}-${config.minimalMode}`;

    return (
      <div className="space-y-4">
        {/* Theme indicator */}
        <div className="text-sm text-muted-foreground text-center">
          Link Preview: {config.theme} theme{config.showTitle ? ' with title' : ''}{config.minimalMode ? ', minimal controls' : ''}
        </div>

        {/* Styled video preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                key={iframeKey}
                src={iframeSrc}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Link Preview"
              />
            </div>
          </div>
        </div>

        {/* Link settings summary */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Link Settings:</p>
          <div className="space-y-0.5 mt-1">
            <p>• Theme: {config.theme}</p>
            {config.showTitle && <p>• Title: {config.customTitle || 'Using video filename'}</p>}
            {config.minimalMode && <p>• Minimal controls enabled</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="code" className="gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Code & Links</span>
            <span className="sm:hidden">Code</span>
          </TabsTrigger>
          <TabsTrigger value="embed-preview" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Embed Preview</span>
            <span className="sm:hidden">Embed</span>
          </TabsTrigger>
          <TabsTrigger value="link-preview" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Link Preview</span>
            <span className="sm:hidden">Link</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-1">
          <Card className="h-full">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Embed Code</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCode}
                  className="gap-2"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="flex-1 overflow-auto">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <code className="language-html">{embedCode}</code>
                </pre>
              </div>

              {/* Share Link Section */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Direct Share Link (with styling)</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyLink}
                    className="gap-2"
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
                <div className="bg-muted p-2 rounded text-xs break-all">
                  {shareLink}
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>

        <TabsContent value="embed-preview" className="flex-1 overflow-auto">
          <Card className="h-full">
            <div className="p-4 h-full overflow-auto">
              {renderEmbedPreview()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="link-preview" className="flex-1 overflow-auto">
          <Card className="h-full">
            <div className="p-4 h-full overflow-auto">
              {renderLinkPreview()}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EmbedPreview;