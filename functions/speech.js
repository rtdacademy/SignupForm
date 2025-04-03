const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.textToSpeechV2 = onCall({
  concurrency: 50,
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  console.log('Received TTS request with data:', data);

  try {
    // Create client with v1 endpoint
    const client = new TextToSpeechClient({
      apiEndpoint: 'texttospeech.googleapis.com'
    });
    
    // For v2 onCall, the payload is nested inside data.data
    const text = data.data && data.data.text;
    
    if (!text || text.trim() === '') {
      throw new HttpsError('invalid-argument', 'Input text cannot be empty');
    }

    const request = {
      input: { text },
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
    throw new HttpsError('internal', `Speech synthesis failed: ${error.message}`);
  }
});
