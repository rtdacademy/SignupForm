import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

const GeminiChat = ({ firebaseApp }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    // Initialize the generative model
    try {
      const vertexAI = getVertexAI(firebaseApp);
      const geminiModel = getGenerativeModel(vertexAI, { 
        model: "gemini-1.5-flash"
      });
      setModel(geminiModel);
    } catch (err) {
      setError('Error initializing model: ' + err.message);
      console.error('Model initialization error:', err);
    }
  }, [firebaseApp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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