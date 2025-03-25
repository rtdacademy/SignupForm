import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AI_MODEL_MAPPING } from './utils/settings';
import normalizeTextForTTS from './utils/textNormalization';

// URL for streaming TTS
export const getStreamTTSUrl = () => {
  // In development, use the emulator URL
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001/rtd-academy/us-central1/streamTTS';
  }
  // In production, use the rewrote URL which avoids CORS issues
  return '/api/tts';
};

/**
 * Preprocesses text using Vertex AI to optimize for TTS readability
 * @param {Object} firebaseApp - Firebase app instance
 * @param {string} text - Text to normalize
 * @returns {Promise<string>} - Normalized text
 */
export const preprocessTextWithAI = async (firebaseApp, text) => {
  try {
    console.log('Preprocessing text with AI:', text.substring(0, 50) + '...');
    
    // First, apply basic normalization to reduce prompt size and handle common cases
    const preNormalizedText = normalizeTextForTTS(text);
    
    // Get Vertex AI instance
    const vertexAI = getVertexAI(firebaseApp);
    
    // Use standard model for preprocessing
    const preprocessingModel = getGenerativeModel(vertexAI, {
      model: AI_MODEL_MAPPING.standard.name,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1, // Lower temperature for more deterministic output
        topP: 0.8,
      },
    });
    
    // Simplified prompt - we now only need to handle cases not covered by our normalization
    const prompt = `
    You are a text normalization specialist for Text-to-Speech (TTS) systems. Your task is to refine the following text to make it more suitable for an AI voice to read aloud.

    The text has already undergone basic normalization for common cases like abbreviations, acronyms, numbers, and symbols. Focus on:

    1. Complex mathematical expressions or scientific notation not already handled
    2. Uncommon or domain-specific abbreviations
    3. Formatting lists for better speech flow
    4. Adding appropriate pauses where needed
    5. Ensuring specialized terms are pronounced correctly

    Important rules:
    - Preserve the exact meaning of the content
    - DO NOT add explanations or meta-text
    - Return ONLY the normalized text
    - If the text is already well-normalized, return it unchanged

    Text to refine:
    ${preNormalizedText}
    `;
    
    // Send request to the model
    const result = await preprocessingModel.generateContent(prompt);
    const response = await result.response;
    const preprocessedText = response.text();
    
    console.log('AI preprocessing complete, original length:', text.length, 'new length:', preprocessedText.length);
    return preprocessedText;
  } catch (error) {
    console.error('AI preprocessing failed:', error);
    
    // Try with fallback model if initial attempt failed
    try {
      console.log('Attempting with fallback model...');
      const vertexAI = getVertexAI(firebaseApp);
      
      const fallbackModel = getGenerativeModel(vertexAI, {
        model: AI_MODEL_MAPPING.fallback.name,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.1,
          topP: 0.8,
        },
      });
      
      // Very simple prompt for fallback
      const simplifiedPrompt = `
      Convert this text to be more easily read by a text-to-speech system.
      Make minimal changes needed for better pronunciation.
      
      Text: ${normalizeTextForTTS(text)}
      `;
      
      const result = await fallbackModel.generateContent(simplifiedPrompt);
      const response = await result.response;
      const preprocessedText = response.text();
      
      console.log('Fallback preprocessing complete');
      return preprocessedText;
    } catch (fallbackError) {
      console.error('Fallback preprocessing also failed:', fallbackError);
      // If all AI preprocessing fails, return the normalized text
      return normalizeTextForTTS(text);
    }
  }
};

/**
 * Synthesizes audio (non-streaming) from text
 * @param {Object} firebaseApp - Firebase app instance
 * @param {string} text - Text to synthesize
 * @returns {Promise<Audio>} - Audio element with synthesized speech
 */
export const synthesizeAudio = async (firebaseApp, text) => {
  try {
    console.log('Sending text to TTS:', text.substring(0, 50) + '...'); 
    const functions = getFunctions(firebaseApp);
    const textToSpeech = httpsCallable(functions, 'textToSpeech');
    
    const result = await textToSpeech({ text });
    console.log('TTS response received');
    const audioContent = result.data.audioContent;
    
    // Convert base64 to audio
    const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and return an Audio object
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    return audio;
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    return null;
  }
};

/**
 * Streams audio from text using Web Audio API
 * @param {string} text - Text to synthesize
 * @returns {Promise<Object>} - Controller for the streaming audio playback
 */
export const streamAudio = async (text) => {
  let isActive = true;
  let sources = [];
  let startTime = 0;
  let audioContext = null;
  
  try {
    console.log('Starting streaming TTS for text:', text.substring(0, 50) + '...');
    
    // Create an AbortController for cancelling the fetch if needed
    const controller = new AbortController();
    
    // Initialize Web Audio API
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Fetch from our streaming endpoint
    const response = await fetch(getStreamTTSUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    console.log('Stream connection established, beginning audio processing...');
    
    // Create a ReadableStream to process the response
    const reader = response.body.getReader();
    
    // Extract WAV header information
    let headerProcessed = false;
    let wavFormat = {
      sampleRate: 24000,  // Default values
      numChannels: 1,
      bytesPerSample: 2
    };
    
    // Track buffered audio chunks
    const audioQueue = [];
    let isPlaying = false;
    let bytesReceived = 0;
    let wavHeaderSize = 44;  // Standard WAV header size
    
    // Function to start playing audio
    const startPlayback = async () => {
      if (isPlaying || audioQueue.length === 0 || !isActive) return;
      
      isPlaying = true;
      console.log(`Starting playback with ${audioQueue.length} chunks in queue`);
      
      try {
        while (audioQueue.length > 0 && isActive) {
          const audioData = audioQueue.shift();
          
          // Skip empty chunks
          if (!audioData || audioData.length === 0) continue;
          
          // Create and schedule the audio source
          const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          // Add to our list of sources to track
          sources.push(source);
          
          // Schedule this chunk to play after the current audio position
          const currentTime = audioContext.currentTime;
          source.start(startTime > 0 ? startTime : 0);
          
          // Update the next start time
          startTime = currentTime + audioBuffer.duration;
          
          console.log(`Playing chunk, duration: ${audioBuffer.duration}s, queue size: ${audioQueue.length}`);
          
          // Wait for this buffer to finish before processing the next one
          await new Promise(resolve => {
            source.onended = resolve;
            
            // Safety timeout in case onended doesn't fire
            setTimeout(resolve, audioBuffer.duration * 1000 + 100);
          });
        }
      } catch (error) {
        console.error('Error during audio playback:', error);
      } finally {
        isPlaying = false;
        
        // If there are new items in the queue, start playing them
        if (audioQueue.length > 0 && isActive) {
          startPlayback();
        }
      }
    };
    
    // Function to process WAV header
    const processWavHeader = (data) => {
      // Need at least 44 bytes for a standard WAV header
      if (data.length < 44) return false;
      
      // Check "RIFF" magic number
      const header = new Uint8Array(data.slice(0, 44));
      const riff = String.fromCharCode(...header.slice(0, 4));
      
      if (riff !== 'RIFF') {
        console.warn('Invalid WAV header, RIFF signature not found');
        return false;
      }
      
      // Extract format information from header
      const view = new DataView(header.buffer);
      const format = String.fromCharCode(...header.slice(8, 12));
      
      if (format !== 'WAVE') {
        console.warn('Invalid WAV header, WAVE format not found');
        return false;
      }
      
      // Find the "fmt " chunk
      let offset = 12;
      while (offset < header.length - 8) {
        const chunkId = String.fromCharCode(...header.slice(offset, offset + 4));
        const chunkSize = view.getUint32(offset + 4, true);
        
        if (chunkId === 'fmt ') {
          // Extract audio format information
          wavFormat.numChannels = view.getUint16(offset + 10, true);
          wavFormat.sampleRate = view.getUint32(offset + 12, true);
          wavFormat.bytesPerSample = view.getUint16(offset + 22, true) / 8;
          
          console.log(`WAV format: ${wavFormat.sampleRate}Hz, ${wavFormat.numChannels} channels, ${wavFormat.bytesPerSample *
8} bits per sample`);
          return true;
        }
        
        offset += 8 + chunkSize;
      }
      
      console.warn('Could not find fmt chunk in WAV header');
      return false;
    };
    
    // Process chunks as they arrive
    let buffer = new Uint8Array(0);
    let chunkCounter = 0;
    
    while (isActive) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('Stream complete, finalizing audio...');
        break;
      }
      
      if (!value || value.length === 0) continue;
      
      chunkCounter++;
      bytesReceived += value.length;
      console.log(`Received chunk #${chunkCounter} of ${value.length} bytes, total: ${bytesReceived}`);
      
      // For the first chunk, process WAV header
      if (!headerProcessed) {
        // Combine with existing buffer if needed
        const combinedData = new Uint8Array(buffer.length + value.length);
        combinedData.set(buffer);
        combinedData.set(value, buffer.length);
        buffer = combinedData;
        
        // Process header information
        headerProcessed = processWavHeader(buffer);
        
        if (headerProcessed) {
          // Skip the header for the first audio segment
          if (buffer.length > wavHeaderSize) {
            const audioData = buffer.slice(wavHeaderSize);
            
            // Create a valid WAV chunk by prepending a header
            const chunk = createWavChunk(audioData, wavFormat);
            audioQueue.push(chunk);
            
            // Start playback as soon as we have the first valid chunk
            if (!isPlaying) startPlayback();
          }
          
          // Reset buffer after header is processed
          buffer = new Uint8Array(0);
        }
      } else {
        // For subsequent chunks, create a valid WAV chunk and queue it
        const chunk = createWavChunk(value, wavFormat);
        audioQueue.push(chunk);
        
        // Start playback if it's not already running
        if (!isPlaying) startPlayback();
      }
    }
    
    // Helper function to create a valid WAV chunk from audio data
    function createWavChunk(audioData, format) {
      // Create a WAV header for this chunk
      const header = new ArrayBuffer(44);
      const view = new DataView(header);
      
      // "RIFF" chunk descriptor
      const textEncoder = new TextEncoder();
      
      const writeString = (view, offset, string) => {
        const bytes = textEncoder.encode(string);
        for (let i = 0; i < bytes.length; i++) {
          view.setUint8(offset + i, bytes[i]);
        }
      };
      
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + audioData.length, true);
      writeString(view, 8, 'WAVE');
      
      // "fmt " sub-chunk
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);                   // fmt chunk size
      view.setUint16(20, 1, true);                    // audio format (1 for PCM)
      view.setUint16(22, format.numChannels, true);   // number of channels
      view.setUint32(24, format.sampleRate, true);    // sample rate
      
      // Calculate bytes per second and block align
      const bytesPerSecond = format.sampleRate * format.numChannels * format.bytesPerSample;
      const blockAlign = format.numChannels * format.bytesPerSample;
      
      view.setUint32(28, bytesPerSecond, true);      // byte rate
      view.setUint16(32, blockAlign, true);          // block align
      view.setUint16(34, format.bytesPerSample * 8, true); // bits per sample
      
      // "data" sub-chunk
      writeString(view, 36, 'data');
      view.setUint32(40, audioData.length, true);     // data size
      
      // Combine header and audio data
      const wavChunk = new Uint8Array(header.byteLength + audioData.length);
      wavChunk.set(new Uint8Array(header), 0);
      wavChunk.set(audioData, header.byteLength);
      
      return wavChunk;
    }
    
    console.log(`Audio streaming complete, total bytes received: ${bytesReceived}`);
    
    return {
      stop: () => {
        console.log('Stopping audio playback');
        isActive = false;
        
        sources.forEach(source => {
          try {
            source.stop();
          } catch (e) {
            // Ignore errors if source already stopped
          }
        });
        
        if (audioContext) {
          audioContext.close().catch(e => console.error('Error closing audio context:', e));
        }
        
        controller.abort();
      },
      isActive: () => isActive && (isPlaying || audioQueue.length > 0)
    };
  } catch (error) {
    console.error('Stream audio error:', error);
    
    if (audioContext) {
      audioContext.close().catch(e => console.error('Error closing audio context:', e));
    }
    
    return null;
  }
};

/**
 * Unified TTS function with preprocessing
 * @param {Object} firebaseApp - Firebase app instance
 * @param {string} text - Text to synthesize
 * @param {boolean} useStreaming - Whether to use streaming or standard TTS
 * @param {boolean} skipAIPreprocessing - Whether to skip AI preprocessing and use only normalization
 * @returns {Promise<Object|Audio>} - Audio controller or element
 */
export const textToSpeech = async (firebaseApp, text, useStreaming = true, skipAIPreprocessing = false) => {
  try {
    // Apply normalization first
    let normalizedText = normalizeTextForTTS(text);
    
    // Apply AI preprocessing if not skipped
    if (!skipAIPreprocessing) {
      try {
        normalizedText = await preprocessTextWithAI(firebaseApp, normalizedText);
      } catch (aiError) {
        console.warn('AI preprocessing failed, continuing with basic normalization:', aiError);
        // We already have normalized text, so continue with that
      }
    }
    
    // Synthesize speech using appropriate method
    if (useStreaming) {
      return await streamAudio(normalizedText);
    } else {
      return await synthesizeAudio(firebaseApp, normalizedText);
    }
  } catch (error) {
    console.error('TTS processing failed:', error);
    
    // Ultimate fallback - use original text with basic normalization if all processing fails
    const fallbackText = normalizeTextForTTS(text);
    
    if (useStreaming) {
      return await streamAudio(fallbackText);
    } else {
      return await synthesizeAudio(firebaseApp, fallbackText);
    }
  }
};