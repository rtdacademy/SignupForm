import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Loader2 } from 'lucide-react';
// VERTEX AI DISABLED DUE TO COST ISSUES - Using Gemini API instead
// import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

const GeminiChat = ({ firebaseApp }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    // VERTEX AI DISABLED - Show disabled message
    setError('Gemini Chat via Vertex AI is temporarily disabled for maintenance. Please use the Gemini API chat component instead.');
    console.log('Vertex AI disabled in GeminiChat - cost optimization in progress');
    setModel(null);
  }, [firebaseApp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VERTEX AI DISABLED - Prevent any submissions
    setError('Gemini Chat via Vertex AI is temporarily disabled. Please use the Gemini API chat component instead.');
    return;

    /* DISABLED CODE - DO NOT REMOVE YET
    if (!prompt.trim() || !model) return;

    setLoading(true);
    setError(null);

    try {
      // Generate content using the model
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      setError('Error generating response: ' + err.message);
      console.error('Gemini API error:', err);
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gemini AI Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full min-h-[100px]"
          />
          
          <Button 
            type="submit" 
            disabled={loading || !model} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : 'Generate Response'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {response && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Response:</h3>
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiChat;