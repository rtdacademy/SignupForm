const functions = require('firebase-functions');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

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
        name: 'en-US-Journey-F'
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



exports.streamTextToSpeech = functions.https.onCall(async (data, context) => {
  const client = new TextToSpeechClient();
  
  try {
    // First request must contain only the streaming config
    const streamingConfig = {
      voice: {
        name: 'en-US-Journey-D',
        languageCode: 'en-US'
      },
      streamingAudioConfig: {
        audioEncoding: 'OGG_OPUS',
        sampleRateHertz: 24000
      }
    };

    // Create a streaming synthesis request object
    const initialRequest = {
      streamingConfig: streamingConfig
    };

    // Create the text request
    const textRequest = {
      input: {
        text: data.text
      }
    };

    // Get the stream
    const stream = client.streamingSynthesize();

    // Send the config request
    stream.write(initialRequest);
    
    // Send the text request
    stream.write(textRequest);
    
    // End the request stream
    stream.end();

    // Collect all audio chunks
    const audioChunks = [];
    for await (const response of stream) {
      audioChunks.push(response.audioContent);
    }

    // Return combined audio content
    return {
      audioContent: Buffer.concat(audioChunks).toString('base64')
    };

  } catch (error) {
    console.error('Streaming synthesis error:', error);
    throw new functions.https.HttpsError('internal', 'Speech synthesis failed: ' + error.message);
  }
});