// Import both generations of Cloud Functions
const functions = require('firebase-functions');
const {onRequest} = require("firebase-functions/v2/https");
const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
const express = require('express');
const cors = require('cors');

// Keep your existing Gen 1 callable function
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

