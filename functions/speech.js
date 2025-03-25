const functions = require('firebase-functions');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { TextToSpeechClient: TextToSpeechBetaClient } = require('@google-cloud/text-to-speech').v1beta1;
const cors = require('cors')({
  origin: [
    'http://localhost:3000',  // Create React App default port
    'http://localhost:5000',  // Firebase hosting emulator port
    'http://localhost:5001',  // Cloud Functions emulator port
    'https://rtd-academy.web.app', 
    'https://edbotz.web.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Keep your existing function
exports.textToSpeech = functions.https.onCall(async (data, context) => {
  console.log('Received TTS request with data:', data);
  
  try {
    // Create client with v1 endpoint
    const client = new TextToSpeechClient({
      apiEndpoint: 'texttospeech.googleapis.com'
    });
    
    if (!data.text || data.text.trim() === '') {
      throw new functions.https.HttpsError('invalid-argument', 'Input text cannot be empty');
    }

    const request = {
      input: { text: data.text },
      voice: { 
        languageCode: 'en-US',
        name: 'en-US-Chirp-HD-O'
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
        pitch: 0,
        speakingRate: 0
      },
    };

    console.log('Sending request:', JSON.stringify(request, null, 2));

    const [response] = await client.synthesizeSpeech(request);

    console.log('Speech synthesis completed successfully');

    return {
      audioContent: response.audioContent.toString('base64')
    };
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new functions.https.HttpsError(
      'internal', 
      `Speech synthesis failed: ${error.message}`
    );
  }
});

exports.streamTTS = functions
  .runWith({
    timeoutSeconds: 540, // Increased from 300 to 540 (9 minutes)
    memory: '512MB'     // Increased from 256MB to 512MB
  })
  .https.onRequest((req, res) => {
    // Special handling for OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      // Set CORS headers for preflight requests
      res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    // Handle CORS for normal requests
    return cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      try {
        // Get the text from the request
        const text = req.body.text;
        
        if (!text) {
          return res.status(400).send('Text parameter is required');
        }
        
        console.log(`Processing streaming TTS request for text length: ${text.length}`);
        
        // Set up headers for streaming - using audio/wav
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Create the TTS client - use stable v1 API
        const { TextToSpeechClient } = require('@google-cloud/text-to-speech').v1;
        const client = new TextToSpeechClient();
        
        // Log the API version
        console.log('Using TextToSpeechClient v1');
        
        // Create the stream
        const stream = client.streamingSynthesize();
        
        // Track total audio size
        let totalAudioBytes = 0;
        let allAudioChunks = [];
        let headerSent = false;
        
        // Generate a WAV header
        const generateWavHeader = (dataLength) => {
          const sampleRate = 24000;
          const numChannels = 1;
          const bitsPerSample = 16;
          
          const headerBuffer = Buffer.alloc(44);
          
          // "RIFF" chunk descriptor
          headerBuffer.write('RIFF', 0);
          headerBuffer.writeUInt32LE(36 + dataLength, 4); // file size
          headerBuffer.write('WAVE', 8);
          
          // "fmt " sub-chunk
          headerBuffer.write('fmt ', 12);
          headerBuffer.writeUInt32LE(16, 16); // fmt chunk size
          headerBuffer.writeUInt16LE(1, 20); // audio format (1 for PCM)
          headerBuffer.writeUInt16LE(numChannels, 22);
          headerBuffer.writeUInt32LE(sampleRate, 24);
          headerBuffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
          headerBuffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
          headerBuffer.writeUInt16LE(bitsPerSample, 34); // bits per sample
          
          // "data" sub-chunk
          headerBuffer.write('data', 36);
          headerBuffer.writeUInt32LE(dataLength, 40); // data size
          
          return headerBuffer;
        };
        
        // Handle incoming data chunks
        let chunkCounter = 0;
        
        stream.on('data', (response) => {
          chunkCounter++;
          
          if (response.audioContent) {
            const chunkSize = response.audioContent.length;
            console.log(`Received chunk #${chunkCounter} of size: ${chunkSize} bytes`);
            
            if (chunkCounter === 1 && chunkSize > 0) {
              const firstBytes = Array.from(response.audioContent.slice(0, Math.min(16, chunkSize)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(' ');
              console.log(`First bytes of audio data: ${firstBytes}`);
            }
            
            // Store all chunks
            allAudioChunks.push(response.audioContent);
            totalAudioBytes += chunkSize;
            
            // For longer text, stream in real-time
            if (text.length > 200) {
              if (!headerSent) {
                // Send a WAV header with an estimated size
                const estimatedSize = text.length * 50;
                const wavHeader = generateWavHeader(estimatedSize);
                res.write(wavHeader);
                headerSent = true;
                console.log('Sent WAV header with estimated size');
              }
              
              res.write(response.audioContent);
              console.log(`Sent audio chunk #${chunkCounter} of size: ${chunkSize} bytes`);
            }
          }
        });
        
        // Create a promise that resolves when streaming is complete
        const functionPromise = new Promise((resolve, reject) => {
          // Handle stream end - resolve the promise when done
          stream.on('end', () => {
            console.log(`Stream ended successfully after ${chunkCounter} chunks, total audio size: ${totalAudioBytes} bytes`);
            
            // For shorter responses or if no audio was streamed yet, send everything at once
            if (!headerSent && totalAudioBytes > 0) {
              // Generate header with accurate size
              const wavHeader = generateWavHeader(totalAudioBytes);
              res.write(wavHeader);
              
              // Send all chunks
              for (const chunk of allAudioChunks) {
                res.write(chunk);
              }
              console.log(`Sent complete WAV file with accurate header (${totalAudioBytes} audio bytes)`);
            }
            
            res.end();
            resolve();
          });
          
          // Handle errors with detailed logging
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
        
        // Very minimal config - only specify the voice
        const config = {
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Chirp-HD-O'
          }
        };
        
        console.log('Using minimal voice config:', JSON.stringify(config, null, 2));
        
        // Send the streaming config first
        stream.write({ streamingConfig: config });
        
        // Send the text input
        stream.write({ input: { text } });
        
        // End the request stream (but the function will stay alive until promise resolves)
        stream.end();
        
        // Wait for the promise to resolve before ending the function
        return functionPromise;
        
      } catch (error) {
        console.error('Error in streamTTS:', error);
        console.error('Error stack:', error.stack);
        
        if (!res.headersSent) {
          res.status(500).send(`Speech synthesis failed: ${error.message}`);
        } else {
          res.end();
        }
      }
    });
  });