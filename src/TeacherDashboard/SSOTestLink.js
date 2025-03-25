import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Label } from "../components/ui/label";

const SSOTestLink = () => {
  // URL Configuration
  const [baseUrl, setBaseUrl] = useState('https://edge.rtdacademy.com/course/course.php');
  const [urlParams, setUrlParams] = useState('folder=0&cid=89&bypass=1');
  
  // Payload State
  const [customPayload, setCustomPayload] = useState(
    JSON.stringify({
      studentEmail: "test.student@example.com",
      timestamp: "Auto-generated on link creation",
      nonce: "Auto-generated on link creation",
      isEmulated: false
    }, null, 2)
  );
  
  // Generated Content
  const [generatedLink, setGeneratedLink] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

  const generateTestLink = () => {
    if (!ENCRYPTION_KEY) {
      setError('Missing encryption key');
      return;
    }

    try {
      // Parse the custom payload
      let payload;
      try {
        payload = JSON.parse(customPayload);
      } catch (e) {
        setError('Invalid JSON in payload');
        return;
      }

      // Always update timestamp and nonce with current values
      const currentPayload = {
        ...payload,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7)
      };

      // Encrypt the payload
      const payloadString = JSON.stringify(currentPayload);
      const encryptedPayload = CryptoJS.AES.encrypt(
        payloadString,
        ENCRYPTION_KEY
      ).toString();

      // Parse existing parameters and add ssoToken
      const params = new URLSearchParams(urlParams);
      params.append('ssoToken', encryptedPayload);

      const fullUrl = `${baseUrl}?${params.toString()}`;
      
      // Parse parameters for debug info
      const debugParams = {};
      params.forEach((value, key) => {
        if (key !== 'ssoToken') {
          debugParams[key] = value;
        }
      });

      // Update state with generated content
      setGeneratedLink(fullUrl);
      setDebugInfo({
        payload: currentPayload,
        payloadString,
        encryptedPayload,
        params: {
          baseUrl,
          urlParams: debugParams
        }
      });
      setError(null);
      
    } catch (error) {
      setError(`Generation failed: ${error.message}`);
      console.error('Link generation failed:', error);
    }
  };

  const resetPayload = () => {
    setCustomPayload(JSON.stringify({
      studentEmail: "test.student@example.com",
      timestamp: "Auto-generated on link creation",
      nonce: "Auto-generated on link creation",
      isEmulated: false
    }, null, 2));
  };

  const resetParams = () => {
    setUrlParams('folder=0&cid=89&bypass=1');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>SSO Test Link Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Generate SSO test links with custom base URL, parameters, and payload.
            Timestamp and nonce are automatically updated with each generation.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="url-params">
          <TabsList>
            <TabsTrigger value="url-params">URL Configuration</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            {(generatedLink || debugInfo) && <TabsTrigger value="output">Output</TabsTrigger>}
          </TabsList>

          <TabsContent value="url-params" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="Enter base URL"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="urlParams">URL Parameters</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetParams}
                  >
                    Reset Parameters
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Parameters in query string format (e.g., folder=0&cid=89&bypass=1)
                </div>
                <Input
                  id="urlParams"
                  value={urlParams}
                  onChange={(e) => setUrlParams(e.target.value)}
                  placeholder="Enter URL parameters"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payload" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="customPayload">JSON Payload</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetPayload}
                >
                  Reset to Default
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Note: timestamp and nonce are automatically generated when creating the link
              </div>
              <textarea
                id="customPayload"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="w-full h-48 p-2 font-mono text-sm border rounded-md"
                placeholder="Enter JSON payload"
              />
            </div>
          </TabsContent>

          <TabsContent value="output" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {debugInfo && (
              <>
                <div>
                  <h3 className="font-medium mb-2">Generated URL:</h3>
                  <div className="p-4 bg-gray-100 rounded-md break-all">
                    <code>{generatedLink}</code>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">URL Configuration:</h3>
                  <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                    {JSON.stringify(debugInfo.params, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Final Payload (with auto-generated values):</h3>
                  <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                    {JSON.stringify(debugInfo.payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Encrypted Token:</h3>
                  <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                    {debugInfo.encryptedPayload}
                  </pre>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <Button onClick={generateTestLink} className="w-full">
          Generate Link
        </Button>
      </CardContent>
    </Card>
  );
};

export default SSOTestLink;