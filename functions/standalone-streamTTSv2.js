// standalone-streamTTSv2.js - COMPLETELY ISOLATED V2 FUNCTION
// No imports from any other files in your project

const {onRequest} = require("firebase-functions/v2/https");
const {TextToSpeechClient} = require('@google-cloud/text-to-speech').v1;
const express = require('express');
const cors = require('cors');

// Self-contained TTS v2 function with no external dependencies
exports.streamTTSv2 = onRequest({
  region: 'us-central1',
  memory: '1GiB',
  cpu: 1,
  timeoutSeconds: 540,
  cors: [
    'http://localhost:3000', 
    'http://localhost:5000',
    'http://localhost:5001',
    'https://rtd-academy.web.app',
    'https://edbotz.web.app',
    'https://edbotz.com',
    'https://www.edbotz.com'
  ],
  healthCheckTimeout: 180
}, async (req, res) => {
  try {
    // Basic request handling
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const text = req.body.text;
    const chunkSize = req.body.chunkSize || 'medium';
    
    if (!text) {
      return res.status(400).send('Text parameter is required');
    }
    
    console.log(`Processing TTS request for text length: ${text.length}, chunk size: ${chunkSize}`);
    
    // Set up headers for streaming
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Create TTS client
    const client = new TextToSpeechClient();
    const stream = client.streamingSynthesize();
    
    // Get chunk size settings
    const getChunkSizeSettings = (requestedSize) => {
      const sizes = {
        small: { minBytes: 4000, bufferDelay: 0 },
        medium: { minBytes: 8000, bufferDelay: 10 },
        large: { minBytes: 16000, bufferDelay: 20 }
      };
      return sizes[requestedSize] || sizes.medium;
    };
    
    const chunkSettings = getChunkSizeSettings(chunkSize);
    
    // Track audio data
    let audioBuffer = Buffer.alloc(0);
    let headerSent = false;
    let totalAudioBytes = 0;
    
    // Generate WAV header
    const generateWavHeader = (dataLength) => {
      const sampleRate = 24000;
      const numChannels = 1;
      const bitsPerSample = 16;
      
      const headerBuffer = Buffer.alloc(44);
      headerBuffer.write('RIFF', 0);
      headerBuffer.writeUInt32LE(36 + dataLength, 4);
      headerBuffer.write('WAVE', 8);
      headerBuffer.write('fmt ', 12);
      headerBuffer.writeUInt32LE(16, 16);
      headerBuffer.writeUInt16LE(1, 20);
      headerBuffer.writeUInt16LE(numChannels, 22);
      headerBuffer.writeUInt32LE(sampleRate, 24);
      headerBuffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
      headerBuffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
      headerBuffer.writeUInt16LE(bitsPerSample, 34);
      headerBuffer.write('data', 36);
      headerBuffer.writeUInt32LE(dataLength, 40);
      
      return headerBuffer;
    };
    
    // Process audio data
    const processAndSendAudio = async (responseData, isLastChunk = false) => {
      if (!responseData || !responseData.audioContent || responseData.audioContent.length === 0) {
        return;
      }
      
      const newData = responseData.audioContent;
      audioBuffer = Buffer.concat([audioBuffer, newData]);
      totalAudioBytes += newData.length;
      
      if (!headerSent && audioBuffer.length > 0) {
        const estimatedSize = text.length * 75;
        const wavHeader = generateWavHeader(estimatedSize);
        res.write(wavHeader);
        headerSent = true;
        console.log('Sent WAV header with estimated size');
      }
      
      while (audioBuffer.length >= chunkSettings.minBytes || (isLastChunk && audioBuffer.length > 0)) {
        const chunkToSend = isLastChunk ? audioBuffer : audioBuffer.slice(0, chunkSettings.minBytes);
        
        res.write(chunkToSend);
        console.log(`Sent audio chunk of size: ${chunkToSend.length} bytes`);
        
        audioBuffer = isLastChunk ? Buffer.alloc(0) : audioBuffer.slice(chunkSettings.minBytes);
        
        if (chunkSettings.bufferDelay > 0 && !isLastChunk) {
          await new Promise(resolve => setTimeout(resolve, chunkSettings.bufferDelay));
        }
      }
    };
    
    // Handle streaming
    const functionPromise = new Promise((resolve, reject) => {
      let receivedChunks = 0;
      
      stream.on('data', async (response) => {
        receivedChunks++;
        console.log(`Received TTS chunk #${receivedChunks} of size: ${response.audioContent?.length || 0} bytes`);
        
        try {
          await processAndSendAudio(response);
        } catch (err) {
          console.error('Error processing audio chunk:', err);
        }
      });
      
      stream.on('end', async () => {
        console.log(`Stream ended after ${receivedChunks} chunks, total bytes: ${totalAudioBytes}`);
        
        try {
          await processAndSendAudio({ audioContent: Buffer.alloc(0) }, true);
          res.end();
          resolve();
        } catch (err) {
          console.error('Error finalizing audio stream:', err);
          res.end();
          resolve();
        }
      });
      
      stream.on('error', (err) => {
        console.error('Streaming TTS error:', err);
        
        if (!res.headersSent) {
          res.status(500).send(`Speech synthesis failed: ${err.message}`);
        } else {
          res.end();
        }
        reject(err);
      });
    });
    
    // Voice config
    const config = {
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Chirp-HD-O'
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 24000,
        effectsProfileId: ['headphone-class-device'],
        pitch: 0,
        speakingRate: 1.0
      }
    };
    
    // Send request
    stream.write({ streamingConfig: config });
    stream.write({ input: { text } });
    stream.end();
    
    return functionPromise;
  } catch (error) {
    console.error('Error in streamTTSv2:', error);
    
    if (!res.headersSent) {
      res.status(500).send(`Speech synthesis failed: ${error.message}`);
    } else {
      res.end();
    }
  }
});

// Completely isolated bootstrap code
if (process.env.K_SERVICE === 'streamTTSv2') {
  console.log('Initializing isolated Express server for streamTTSv2');
  
  const app = express();
  app.use(cors({ origin: true }));
  
  // Health check endpoints
  app.get('/_ah/warmup', (req, res) => {
    res.status(200).send('OK');
  });
  
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'streamTTSv2' });
  });
  
  // Route all traffic to the function
  app.all('/*', (req, res) => {
    exports.streamTTSv2(req, res);
  });
  
  const port = process.env.PORT || 8080;
  
  app.listen(port, () => {
    console.log(`streamTTSv2 isolated service listening on port ${port}`);
  }).on('error', (err) => {
    console.error('Express server error:', err);
  });
  
  console.log('Express initialization complete');
}