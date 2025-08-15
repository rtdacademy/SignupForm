// VERTEX AI DISABLED DUE TO COST ISSUES - Using Gemini API instead
// import { getVertexAI, getGenerativeModel } from 'firebase/vertexai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AI_MODEL_MAPPING } from './utils/settings';
import normalizeTextForTTS from './utils/textNormalization';

export const getStreamTTSUrl = () => {
  // In development, use the emulator URL with v2 endpoint
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001/rtd-academy/us-central1/streamTTSv2';
  }
  
  // Check if we're on the custom domain
  if (window.location.hostname === 'edbotz.com' || window.location.hostname.includes('edbotz')) {
    // For custom domain, use absolute URL to the cloud function
    return 'https://us-central1-rtd-academy.cloudfunctions.net/streamTTSv2';
  }
  
  // For Firebase hosting domains, use the rewrite path
  return '/api/tts-v2';
};

// Fallback URL for when v2 fails - keeping this for reference but not using it
export const getFallbackStreamTTSUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001/rtd-academy/us-central1/streamTTS';
  }
  
  // Check if we're on the custom domain
  if (window.location.hostname === 'edbotz.com' || window.location.hostname.includes('edbotz')) {
    // For custom domain, use absolute URL to the cloud function
    return 'https://us-central1-rtd-academy.cloudfunctions.net/streamTTS';
  }
  
  // For Firebase hosting domains, use the rewrite path
  return '/api/tts';
};

/**
 * Preprocesses text using Vertex AI to optimize for TTS readability - DISABLED
 * @param {Object} firebaseApp - Firebase app instance
 * @param {string} text - Text to normalize
 * @returns {Promise<string>} - Normalized text
 */
export const preprocessTextWithAI = async (firebaseApp, text) => {
  // VERTEX AI DISABLED - Just return normalized text
  console.log('Vertex AI disabled - Skipping AI preprocessing, using basic normalization only');
  return normalizeTextForTTS(text);
  
  /* DISABLED CODE - DO NOT REMOVE YET
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
  */
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
 * Enhanced audio streaming with improved buffering, gain control, and error handling
 * @param {string} text - Text to synthesize
 * @param {string} chunkSize - Preferred chunk size ('small', 'medium', 'large')
 * @returns {Promise<Object>} - Controller for the streaming audio playback
 */
export const streamAudio = async (text, chunkSize = 'medium') => {
  let isActive = true;
  let audioContext = null;
  let sourceNode = null;
  let gainNode = null;
  
  try {
    console.log('Starting enhanced streaming TTS for text:', text.substring(0, 50) + '...');
    
    // Create an AbortController for cancelling the fetch if needed
    const controller = new AbortController();
    
    // Initialize Web Audio API with balanced latency
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: 'balanced'
    });
    
    // Create a gain node for smooth volume transitions
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0; // Start silent and fade in
    gainNode.connect(audioContext.destination);
    
    // Get the TTS endpoint URL
    const ttsUrl = getStreamTTSUrl();
    console.log(`Attempting to connect to ${ttsUrl} from origin ${window.location.origin}`);
    
    // Enhanced error handling with more detailed logging
    try {
      // Use appropriate credentials mode based on origin
      const isSameOrigin = 
        ttsUrl.startsWith(window.location.origin) || 
        ttsUrl.startsWith('/');
      
      const credentialsMode = isSameOrigin ? 'same-origin' : 'include';
      console.log(`Using credentials mode: ${credentialsMode}`);
      
      // Make the fetch request with appropriate credentials mode
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Priority': 'high'
        },
        body: JSON.stringify({ 
          text,
          chunkSize
        }),
        signal: controller.signal,
        credentials: credentialsMode
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`HTTP error with status: ${response.status}, statusText: ${response.statusText}`);
        console.error(`Response body: ${errorText || '[no response body]'}`);
        
        // Collect request headers for debugging
        const requestHeaders = {};
        for (const [key, value] of Object.entries(response.headers)) {
          requestHeaders[key] = value;
        }
        console.debug('Response headers:', requestHeaders);
        
        throw new Error(`TTS request failed with status: ${response.status}`);
      }
      
      // Successful connection to TTS service
      console.log(`Stream connection established, beginning audio processing...`);
      
      // Create a ReadableStream to process the response
      const reader = response.body.getReader();
      
      // Audio processing variables
      let audioBufferQueue = [];
      let totalBufferedDuration = 0;
      let isPlaying = false;
      let bytesReceived = 0;
      let wavHeaderProcessed = false;
      let accumulatedData = new Uint8Array(0);
      let wavFormat = {
        sampleRate: 24000,
        numChannels: 1,
        bytesPerSample: 2
      };
      
      // Function to play audio from the buffer queue
      const playNextBuffer = () => {
        if (!isActive || audioBufferQueue.length === 0) return;
        
        const audioBuffer = audioBufferQueue.shift();
        sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        
        // Connect through gain node for smooth transitions
        sourceNode.connect(gainNode);
        
        // Schedule the next buffer to play when this one ends
        sourceNode.onended = playNextBuffer;
        
        // Start playback
        sourceNode.start();
        
        // Fade in volume for the first buffer to avoid clicks
        if (!isPlaying) {
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.05);
          isPlaying = true;
        }
        
        // Update our tracking of buffer duration
        totalBufferedDuration -= audioBuffer.duration;
        
        console.log(`Playing buffer of duration: ${audioBuffer.duration}s, remaining buffers: ${audioBufferQueue.length}`);
      };
      
      // Process WAV data in larger, complete chunks to avoid boundary issues
      const processWavData = async (data, isComplete = false) => {
        try {
          // For the first chunk, extract WAV header information
          if (!wavHeaderProcessed && data.length >= 44) {
            // Extract WAV header
            const headerView = new DataView(data.buffer, data.byteOffset, 44);
            
            // Validate RIFF header and format chunk
            const riffHeader = String.fromCharCode(data[0], data[1], data[2], data[3]);
            if (riffHeader !== 'RIFF') {
              console.warn('Invalid WAV header: RIFF signature not found');
            } else {
              // Extract basic format information from a standard WAV header
              wavFormat.numChannels = headerView.getUint16(22, true);
              wavFormat.sampleRate = headerView.getUint32(24, true);
              wavFormat.bytesPerSample = headerView.getUint16(34, true) / 8;
              
              console.log(`WAV format: ${wavFormat.sampleRate}Hz, ${wavFormat.numChannels} channels, ${wavFormat.bytesPerSample * 8} bits`);
              wavHeaderProcessed = true;
            }
            
            // Keep the header in our accumulated data - don't remove it
            // We'll properly handle complete chunks for decoding
          }
          
          // Determine chunk size for processing - using frame alignment logic
          // Linear PCM frames are aligned to sample boundaries
          const MIN_CHUNK_SIZE = 4800; // 0.1 seconds at 24kHz, 2 bytes per sample, mono
          const bytesPerFrame = wavFormat.numChannels * wavFormat.bytesPerSample;
          
          // Process complete chunks when we have enough data or when we're finishing
          if (accumulatedData.length >= MIN_CHUNK_SIZE || isComplete) {
            // Ensure frame alignment by trimming to nearest frame boundary
            const frameCount = Math.floor(accumulatedData.length / bytesPerFrame);
            const alignedSize = frameCount * bytesPerFrame;
            
            // Only process if we have enough data
            if (alignedSize >= 44) { // Needs at least header + some data
              try {
                // Decode the aligned chunk
                const audioBuffer = await audioContext.decodeAudioData(accumulatedData.buffer.slice(0, alignedSize));
                
                // Add to buffer queue and update tracking
                audioBufferQueue.push(audioBuffer);
                totalBufferedDuration += audioBuffer.duration;
                
                console.log(`Decoded audio chunk of duration: ${audioBuffer.duration}s, size: ${alignedSize} bytes`);
                
                // Start playback after a short buffer (if not already playing)
                const PRE_BUFFER_DURATION = 0.5; // shorter buffer for faster start
                if (totalBufferedDuration >= PRE_BUFFER_DURATION && !isPlaying) {
                  playNextBuffer();
                }
                
                // Keep remaining data for next chunk
                accumulatedData = accumulatedData.slice(alignedSize);
              } catch (decodeError) {
                console.warn('Error decoding audio chunk:', decodeError);
                
                // If we can't decode, discard half of data and try again later
                if (accumulatedData.length > 1000) {
                  accumulatedData = accumulatedData.slice(Math.floor(accumulatedData.length / 2));
                } else {
                  // If chunk is small, just discard all and start fresh
                  accumulatedData = new Uint8Array(0);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing WAV data:', error);
        }
      };
      
      // Process stream chunks
      let chunkCounter = 0;
      
      while (isActive) {
        try {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('Stream complete, finalizing audio...');
            // Process any remaining data
            await processWavData(accumulatedData, true);
            break;
          }
          
          if (!value || value.length === 0) continue;
          
          chunkCounter++;
          bytesReceived += value.length;
          console.log(`Received chunk #${chunkCounter} of ${value.length} bytes, total: ${bytesReceived}`);
          
          // Append new data to our accumulated buffer
          const newAccumulatedData = new Uint8Array(accumulatedData.length + value.length);
          newAccumulatedData.set(accumulatedData);
          newAccumulatedData.set(value, accumulatedData.length);
          accumulatedData = newAccumulatedData;
          
          // Process the accumulated data
          await processWavData(accumulatedData);
        } catch (chunkError) {
          console.error('Error processing stream chunk:', chunkError);
          // Add a small delay before trying again
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`Audio streaming complete, total bytes received: ${bytesReceived}`);
      
    } catch (fetchError) {
      console.error('Error fetching TTS stream:', fetchError);
      throw new Error(`Failed to connect to TTS service: ${fetchError.message}`);
    }
    
    // Return controller object with enhanced stop method
    return {
      stop: () => {
        console.log('Stopping audio playback');
        isActive = false;
        
        // Fade out to avoid clicks when stopping
        if (gainNode && audioContext) {
          try {
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            
            // Stop the current source node after fade-out
            setTimeout(() => {
              if (sourceNode) {
                try {
                  sourceNode.stop();
                } catch (e) {
                  // Ignore errors if source already stopped
                }
              }
              
              // Clean up AudioContext after a short delay
              setTimeout(() => {
                if (audioContext) {
                  audioContext.close().catch(e => console.error('Error closing audio context:', e));
                }
              }, 200);
            }, 150);
          } catch (e) {
            console.warn('Error during audio fade-out:', e);
            // Fallback to immediate stop
            if (sourceNode) {
              try {
                sourceNode.stop();
              } catch (e) {}
            }
            if (audioContext) {
              audioContext.close().catch(e => {});
            }
          }
        } else {
          // No gain node, stop immediately
          if (sourceNode) {
            try {
              sourceNode.stop();
            } catch (e) {}
          }
          if (audioContext) {
            audioContext.close().catch(e => {});
          }
        }
        
        // Abort the fetch request
        controller.abort();
      },
      isActive: () => {
        return isActive && (isPlaying || audioBufferQueue.length > 0);
      },
      getPlaybackInfo: () => {
        return {
          bufferedDuration: totalBufferedDuration,
          queueLength: audioBufferQueue.length,
          bytesReceived: bytesReceived
        };
      }
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
 * @param {string} chunkSize - Preferred chunk size for streaming ('small', 'medium', 'large')
 * @returns {Promise<Object|Audio>} - Audio controller or element
 */
export const textToSpeech = async (firebaseApp, text, useStreaming = true, skipAIPreprocessing = false, chunkSize = 'medium') => {
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
      return await streamAudio(normalizedText, chunkSize);
    } else {
      return await synthesizeAudio(firebaseApp, normalizedText);
    }
  } catch (error) {
    console.error('TTS processing failed:', error);
    
    // Ultimate fallback - use original text with basic normalization if all processing fails
    const fallbackText = normalizeTextForTTS(text);
    
    if (useStreaming) {
      return await streamAudio(fallbackText, chunkSize);
    } else {
      return await synthesizeAudio(firebaseApp, fallbackText);
    }
  }
};