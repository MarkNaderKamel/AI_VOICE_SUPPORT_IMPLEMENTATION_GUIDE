# AI Voice Support - Complete Troubleshooting Guide

> **Version 3.0** | Last Updated: January 2026  
> **Developer**: [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)

This comprehensive guide documents all errors encountered during AI Voice Support implementation and their complete solutions with step-by-step instructions.

---

## Table of Contents

1. [Error 1: client.liveConnect is not a function](#error-1-clientliveconnect-is-not-a-function)
2. [Error 2: session.on is not a function](#error-2-sessionon-is-not-a-function)
3. [Error 3: Cannot read properties of undefined (reading 'onmessage')](#error-3-cannot-read-properties-of-undefined-reading-onmessage)
4. [Error 4: Session does not have receive method](#error-4-session-does-not-have-receive-method)
5. [Error 5: ScriptProcessorNode is deprecated](#error-5-scriptprocessornode-is-deprecated)
6. [Error 6: API Key Not Configured](#error-6-api-key-not-configured)
7. [Error 7: CORS / Configuration Loading Failed](#error-7-cors--configuration-loading-failed)
8. [Error 8: Microphone Access Denied](#error-8-microphone-access-denied)
9. [Error 9: Audio Context Suspended](#error-9-audio-context-suspended)
10. [Error 10: No Audio Output](#error-10-no-audio-output)
11. [Complete Working Implementation](#complete-working-implementation)

---

## Error 1: client.liveConnect is not a function

### Error Message
```
TypeError: client.liveConnect is not a function
```

### When This Occurs
This error appears immediately when attempting to establish a connection with the Gemini Live API. The connection fails before any audio streaming begins.

### Root Cause
**Incorrect API method name used.** The Gemini SDK uses a nested structure where `live` is a property of the client object, and `connect()` is a method on that property.

### Wrong Code (Do NOT Use)
```javascript
// ❌ WRONG - This method does not exist
const client = new GoogleGenAI({ apiKey: apiKey });

const session = await client.liveConnect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
        responseModalities: ['AUDIO']
    }
});
```

### Correct Solution
```javascript
// ✅ CORRECT - Use client.live.connect() with nested 'live' property
const ai = new GoogleGenAI({ apiKey: apiKey });

// Note the '.live.' in the method chain
const session = await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
        responseModalities: ['AUDIO'],
        systemInstruction: 'You are a helpful assistant.',
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: 'Puck'  // Available: Puck, Charon, Kore, Zephyr
                }
            }
        }
    },
    callbacks: {
        onopen: () => { console.log('Connected'); },
        onmessage: async (msg) => { /* handle messages */ },
        onclose: () => { console.log('Disconnected'); },
        onerror: (err) => { console.error('Error:', err); }
    }
});
```

### Key Points
- The GoogleGenAI client has a `live` property that contains streaming methods
- Always use `ai.live.connect()` not `ai.liveConnect()`
- The `connect()` method returns a Promise that resolves to the session object

---

## Error 2: session.on is not a function

### Error Message
```
TypeError: this.session.on is not a function
```

### When This Occurs
This error appears after successfully creating a session, when attempting to set up event handlers using `.on()` syntax.

### Root Cause
**The Gemini Live API session does NOT use the EventEmitter pattern.** Unlike Node.js streams, Socket.IO, or other libraries that use `.on('event', handler)`, the Gemini SDK requires callbacks to be passed directly to the `connect()` method.

### Wrong Code (Do NOT Use)
```javascript
// ❌ WRONG - The session object does not have an .on() method
const session = await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: { responseModalities: ['AUDIO'] }
});

// None of these work:
session.on('open', () => {
    console.log('Connected');
});

session.on('message', (msg) => {
    console.log('Received:', msg);
});

session.on('error', (err) => {
    console.error('Error:', err);
});

session.on('close', () => {
    console.log('Disconnected');
});

// Also wrong:
session.addEventListener('message', handler);
session.onmessage = handler;
```

### Correct Solution
```javascript
// ✅ CORRECT - Pass callbacks directly in the connect() configuration
const session = await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
        responseModalities: ['AUDIO'],
        systemInstruction: 'You are a helpful assistant.'
    },
    
    // ✅ This is the ONLY way to handle events
    callbacks: {
        onopen: function() {
            console.log('WebSocket connection opened');
            // Initialize audio capture here
            this.updateStatus('listening', 'Listening...');
            this.startAudioCapture();
        }.bind(this),
        
        onmessage: async function(message) {
            // Handle incoming audio/text from Gemini
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (audioData) {
                // This is base64-encoded PCM audio
                await this.playAudio(audioData);
            }
            
            // Handle turn completion
            if (message.serverContent?.turnComplete) {
                console.log('AI finished speaking');
            }
            
            // Handle interruption (user spoke while AI was talking)
            if (message.serverContent?.interrupted) {
                this.stopCurrentPlayback();
            }
        }.bind(this),
        
        onclose: function() {
            console.log('WebSocket connection closed');
            this.isConnected = false;
            this.cleanup();
        }.bind(this),
        
        onerror: function(error) {
            console.error('WebSocket error:', error);
            this.updateStatus('error', 'Connection lost');
            this.showRetryButton();
        }.bind(this)
    }
});
```

### Key Points
- All four callbacks (`onopen`, `onmessage`, `onclose`, `onerror`) must be provided in the `callbacks` object
- Use `.bind(this)` if you need to access your class/object context inside callbacks
- Alternatively, use arrow functions or store `self = this` reference

---

## Error 3: Cannot read properties of undefined (reading 'onmessage')

### Error Message
```
Uncaught TypeError: Cannot read properties of undefined (reading 'onmessage')
    at WebSocket.onmessage (live.ts:196:58)
```

### When This Occurs
This error appears in the browser console with a stack trace pointing to the SDK's internal WebSocket handling. The modal typically shows "Connecting..." but never progresses to "Listening...".

### Root Cause
**Using async iteration pattern (`for await...of`) which is NOT supported in browser environments.** The `session.receive()` method either:
1. Does not exist in the browser version of the SDK
2. Returns `undefined`
3. Returns an object that cannot be iterated

The SDK's internal WebSocket handler expects callbacks but receives undefined.

### Wrong Code (Do NOT Use)
```javascript
// ❌ WRONG - Async iteration pattern causes WebSocket internal error

async startSession() {
    const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: { responseModalities: ['AUDIO'] }
    });
    
    this.session = session;
    
    // Start receiving messages (THIS CAUSES THE ERROR)
    this.startReceivingMessages();
}

async startReceivingMessages() {
    try {
        // ❌ receive() may not exist or return undefined
        const receiver = this.session.receive();
        
        // ❌ This for-await loop never works properly
        for await (const message of receiver) {
            this.handleMessage(message);
        }
    } catch (error) {
        console.error('Receive error:', error);
    }
}
```

### Why This Happens
The async iteration pattern (`for await...of`) works in some Node.js server environments but NOT in browsers. When the browser version of the SDK is loaded:
- `session.receive()` returns `undefined`
- The `for await` tries to iterate over `undefined`
- The SDK's WebSocket handler crashes because expected callbacks are missing

### Correct Solution
```javascript
// ✅ CORRECT - Use callbacks, completely remove async iteration

async startSession() {
    const self = this;
    
    // ✅ Pass callbacks directly - messages arrive via onmessage
    const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
            responseModalities: ['AUDIO']
        },
        callbacks: {
            onopen: function() {
                self.isConnected = true;
                self.initializeAudioCapture();
            },
            
            // ✅ ALL messages are handled here automatically
            onmessage: async function(message) {
                // Extract audio from the response structure
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                
                if (base64Audio) {
                    self.isSpeaking = true;
                    self.updateStatus('speaking', 'Speaking...');
                    
                    // Decode base64 to bytes
                    const audioBytes = self.base64ToBytes(base64Audio);
                    
                    // Create audio buffer and play
                    const audioBuffer = await self.decodeAudioData(audioBytes);
                    await self.playAudioBuffer(audioBuffer);
                }
                
                // Handle user interruption
                if (message.serverContent?.interrupted) {
                    self.stopAllPlayback();
                    self.isSpeaking = false;
                    self.updateStatus('listening', 'Listening...');
                }
                
                // Handle turn completion
                if (message.serverContent?.turnComplete) {
                    self.isSpeaking = false;
                    self.updateStatus('listening', 'Listening...');
                }
            },
            
            onclose: function() {
                self.isConnected = false;
                self.cleanup();
            },
            
            onerror: function(error) {
                console.error('Session error:', error);
                self.handleError(error);
            }
        }
    });
    
    this.session = session;
    
    // ❌ DO NOT call startReceivingMessages() or similar
    // ✅ Messages arrive automatically via the onmessage callback
}
```

### Steps to Fix in Existing Code
1. **Remove** any `session.receive()` calls
2. **Remove** any `for await...of` loops for messages
3. **Remove** any `startReceivingMessages()` functions
4. **Add** all message handling inside the `onmessage` callback
5. **Ensure** callbacks are defined in the `connect()` configuration

---

## Error 4: Session does not have receive method

### Error Message
```
Console Warning: Session does not have receive method, using alternative approach
```
or
```
TypeError: this.session.receive is not a function
```

### When This Occurs
When code tries to call `session.receive()` which doesn't exist in the browser SDK.

### Root Cause
The browser version of the Gemini SDK returns a different session object than server-side implementations. The `receive()` async generator method is not available.

### Solution
Use the callbacks pattern exclusively. See [Error 3](#error-3-cannot-read-properties-of-undefined-reading-onmessage) for the complete solution.

**Checklist:**
- [ ] Remove all `session.receive()` calls
- [ ] Remove all `for await...of` loops for messages  
- [ ] Handle all incoming data in the `onmessage` callback
- [ ] Ensure callbacks are defined in the `connect()` configuration

---

## Error 5: ScriptProcessorNode is deprecated

### Error Message
```
[Deprecation] The ScriptProcessorNode is deprecated. Use AudioWorkletNode instead.
    https://developer.chrome.com/blog/audio-worklet/
```

### Impact Level
⚠️ **Non-blocking warning** - The feature still works correctly. This is a future compatibility warning only.

### When This Occurs
This warning appears in the browser console when the audio capture starts. It does not prevent the feature from working.

### Root Cause
The audio processing uses `ScriptProcessorNode` which is deprecated by the Web Audio API specification. Browsers recommend using `AudioWorkletNode` instead for better performance and lower latency.

### Current Implementation (Still Works)
```javascript
// This works but shows deprecation warning
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = function(event) {
    const inputData = event.inputBuffer.getChannelData(0);
    
    // Convert to 16-bit PCM
    const pcmData = floatTo16BitPCM(inputData);
    
    // Send to Gemini
    session.sendRealtimeInput({
        media: {
            data: arrayBufferToBase64(pcmData.buffer),
            mimeType: `audio/pcm;rate=${audioContext.sampleRate}`
        }
    });
};

source.connect(processor);
processor.connect(audioContext.destination);
```

### Future-Proof Solution (Optional)
For future-proofing, migrate to AudioWorkletNode. This requires:

**Step 1: Create audio-processor.js (separate file)**
```javascript
// audio-processor.js
class AudioCaptureProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];
        this.bufferSize = 4096;
    }
    
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input[0]) {
            // Collect samples
            this.buffer.push(...input[0]);
            
            // When buffer is full, send to main thread
            if (this.buffer.length >= this.bufferSize) {
                const chunk = this.buffer.slice(0, this.bufferSize);
                this.buffer = this.buffer.slice(this.bufferSize);
                this.port.postMessage(new Float32Array(chunk));
            }
        }
        return true; // Keep processor alive
    }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
```

**Step 2: Use in main code**
```javascript
// Load the audio worklet module
await audioContext.audioWorklet.addModule('audio-processor.js');

// Create worklet node
const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');

// Handle audio data from worklet
workletNode.port.onmessage = (event) => {
    const audioData = event.data;
    const pcmData = floatTo16BitPCM(audioData);
    
    session.sendRealtimeInput({
        media: {
            data: arrayBufferToBase64(pcmData.buffer),
            mimeType: `audio/pcm;rate=${audioContext.sampleRate}`
        }
    });
};

// Connect audio graph
source.connect(workletNode);
workletNode.connect(audioContext.destination);
```

### Recommendation
- **For now**: Continue using ScriptProcessorNode - it works in all browsers
- **For future**: Plan migration to AudioWorkletNode when refactoring

---

## Error 6: API Key Not Configured

### Error Message
```
Error: API key not configured
```
or
```
Error: Configuration error
```

### When This Occurs
The modal shows "Configuration error" or "API key not configured" immediately when opened. No connection attempt is made.

### Root Cause
The `GEMINI_API_KEY` environment variable is either:
1. Not set in the `.env` file
2. Set incorrectly (spaces, quotes issues)
3. Not being read by the backend endpoint
4. Backend endpoint path is incorrect

### Solution

#### Step 1: Add API Key to .env
```bash
# Get your API key from: https://aistudio.google.com/apikey

# In your .env file (no spaces around =, no quotes):
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_VOICE=Puck
```

#### Step 2: Verify ai-config.php Reads Correctly
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Determine .env file location
$envFile = __DIR__ . '/core/.env';  // Adjust path for your project structure

// Alternative paths to try
if (!file_exists($envFile)) {
    $envFile = __DIR__ . '/../.env';
}
if (!file_exists($envFile)) {
    $envFile = __DIR__ . '/../core/.env';
}

if (!file_exists($envFile)) {
    echo json_encode(['success' => false, 'error' => 'Environment file not found']);
    exit;
}

// Parse .env file
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    // Skip comments
    if (strpos(trim($line), '#') === 0) continue;
    
    // Parse KEY=VALUE
    if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        
        // Remove quotes if present
        $value = trim($value, '"\'');
        
        putenv("$key=$value");
    }
}

// Get configuration
$apiKey = getenv('GEMINI_API_KEY');
$model = getenv('GEMINI_MODEL') ?: 'gemini-2.5-flash-native-audio-preview-12-2025';
$voiceName = getenv('GEMINI_VOICE') ?: 'Puck';

if (empty($apiKey)) {
    echo json_encode(['success' => false, 'error' => 'API key not configured']);
    exit;
}

echo json_encode([
    'success' => true,
    'apiKey' => $apiKey,
    'model' => $model,
    'voiceName' => $voiceName,
    'systemInstruction' => 'You are a helpful AI assistant.'
]);
```

#### Step 3: Clear Caches (Laravel)
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

#### Step 4: Test Endpoint Directly
Open in browser: `http://localhost/your-project/api/ai-config.php`

Expected response:
```json
{
  "success": true,
  "apiKey": "AIza...",
  "model": "gemini-2.5-flash-native-audio-preview-12-2025",
  "voiceName": "Puck"
}
```

---

## Error 7: CORS / Configuration Loading Failed

### Error Message
```
Access to fetch at 'http://...' from origin 'http://...' has been blocked by CORS policy
```
or
```
Failed to fetch
```
or
```
TypeError: NetworkError when attempting to fetch resource
```

### When This Occurs
Browser console shows CORS errors when the JavaScript tries to load configuration from the backend endpoint.

### Root Cause
1. Missing CORS headers on the PHP endpoint
2. Incorrect endpoint path in JavaScript (especially for subfolder installations)
3. PHP not being processed (shows raw PHP code)

### Solution

#### Step 1: Add CORS Headers to ai-config.php
```php
<?php
// Add these headers at the VERY TOP of the file
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rest of your code...
```

#### Step 2: Fix Endpoint Path in JavaScript
```javascript
getConfigEndpoint() {
    // Get current path
    const path = window.location.pathname;
    
    // Handle subfolder installations (e.g., localhost/my-project/)
    const subfolderMatch = path.match(/^\/([^\/]+)\//);
    const basePath = subfolderMatch ? '/' + subfolderMatch[1] : '';
    
    // Build full URL
    const endpoint = window.location.origin + basePath + '/api/ai-config.php';
    
    console.log('Config endpoint:', endpoint);  // Debug
    return endpoint;
}
```

#### Step 3: Test the Endpoint
Open directly in browser:
- `http://localhost/api/ai-config.php`
- `http://localhost/project-name/api/ai-config.php`

If you see **raw PHP code**, your server isn't processing PHP:
- Check Apache is running
- Check `.htaccess` has correct handler
- Check PHP is installed and configured

#### Step 4: Check .htaccess (for Apache)
```apache
# Ensure PHP files are processed
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Remove LiteSpeed handlers if present (for XAMPP/Apache)
# <IfModule lsapi_module>
#     SetHandler application/x-lsphp81
# </IfModule>
```

---

## Error 8: Microphone Access Denied

### Error Message
```
NotAllowedError: Permission denied
```
or
```
DOMException: Permission denied
```
or
```
NotFoundError: Requested device not found
```

### When This Occurs
- Browser shows permission denied error
- Microphone prompt never appears
- Modal shows "Connection failed" or remains stuck on "Connecting..."

### Root Causes
1. User explicitly denied microphone permission
2. Site not served over HTTPS (required in production)
3. Browser privacy settings blocking microphone access
4. Another application using the microphone exclusively
5. No microphone device available

### Solution

#### HTTPS Requirement
**Important:** Microphone access requires HTTPS in production environments. Only `localhost` is exempt.

```
✅ Works: https://example.com
✅ Works: http://localhost
✅ Works: http://127.0.0.1
❌ Fails: http://example.com (non-localhost HTTP)
```

#### Check Browser Permissions
1. Click the lock/info icon in the browser address bar
2. Find "Microphone" in the permissions list
3. Change from "Blocked" to "Allow"
4. Refresh the page

#### Handle Permission Gracefully in Code
```javascript
async requestMicrophoneAccess() {
    try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000
            }
        });
        
        console.log('Microphone access granted');
        return true;
        
    } catch (error) {
        console.error('Microphone access error:', error);
        
        switch (error.name) {
            case 'NotAllowedError':
                this.updateStatus('error', 'Microphone access denied. Please allow microphone access in your browser settings.');
                break;
                
            case 'NotFoundError':
                this.updateStatus('error', 'No microphone found. Please connect a microphone and try again.');
                break;
                
            case 'NotReadableError':
                this.updateStatus('error', 'Microphone is in use by another application. Please close other apps using the microphone.');
                break;
                
            case 'OverconstrainedError':
                // Try again with basic constraints
                try {
                    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    return true;
                } catch (e) {
                    this.updateStatus('error', 'Could not access microphone with required settings.');
                }
                break;
                
            default:
                this.updateStatus('error', 'Microphone error: ' + error.message);
        }
        
        this.showRetryButton();
        return false;
    }
}
```

#### Request Permission Before Connecting
```javascript
async openModal() {
    // Request permission first
    const hasPermission = await this.requestMicrophoneAccess();
    
    if (!hasPermission) {
        // Show instructions to user
        this.showPermissionInstructions();
        return;
    }
    
    // Only connect if permission granted
    await this.startSession();
}
```

---

## Error 9: Audio Context Suspended

### Error Message
```
The AudioContext was not allowed to start. It must be resumed after a user gesture.
```
or audio doesn't play/record even though no errors appear.

### Root Cause
Modern browsers require user interaction (click, tap, keypress) before allowing `AudioContext` to start. This is a security/UX measure to prevent auto-playing audio.

### Solution
Always resume `AudioContext` after user interaction:

```javascript
async startSession() {
    // Create audio contexts
    this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
    });
    this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
    });
    
    // ✅ CRITICAL: Resume audio contexts after user click
    await this.inputAudioContext.resume();
    await this.outputAudioContext.resume();
    
    console.log('Input AudioContext state:', this.inputAudioContext.state);  // Should be "running"
    console.log('Output AudioContext state:', this.outputAudioContext.state); // Should be "running"
    
    // Now proceed with connection...
}
```

### Best Practice
Call `startSession()` only as a result of user interaction (button click):

```javascript
// ✅ Good - triggered by user click
document.getElementById('startButton').addEventListener('click', () => {
    this.startSession();
});

// ❌ Bad - called on page load
window.addEventListener('load', () => {
    this.startSession();  // May fail due to autoplay policy
});
```

---

## Error 10: No Audio Output

### Symptoms
- Connection succeeds
- "Listening..." and "Speaking..." status changes work
- No audio is heard from the AI

### Possible Causes and Solutions

#### Cause 1: Audio Not Being Decoded Correctly
```javascript
// ✅ Correct audio decoding
async decodeAudioData(data, ctx, sampleRate, numChannels) {
    // data is Uint8Array of 16-bit PCM audio
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert 16-bit integer to float (-1.0 to 1.0)
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    
    return buffer;
}
```

#### Cause 2: Wrong Sample Rate
Gemini returns audio at **24000 Hz**. Ensure output AudioContext uses matching rate:
```javascript
this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
```

#### Cause 3: Audio Not Connected to Destination
```javascript
// Create output chain
this.outputNode = this.outputAudioContext.createGain();
this.outputNode.gain.value = 1.0;  // Full volume

// Connect to speakers
this.outputNode.connect(this.outputAudioContext.destination);

// When playing audio
const source = this.outputAudioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(this.outputNode);  // ✅ Connect to output chain
source.start();
```

#### Cause 4: Base64 Decoding Issue
```javascript
// ✅ Correct base64 to bytes conversion
base64ToBytes(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
```

---

## Complete Working Implementation

Here is a complete, tested implementation that avoids all errors above:

```javascript
const AIVoiceSupport = {
    // State
    session: null,
    inputAudioContext: null,
    outputAudioContext: null,
    mediaStream: null,
    outputNode: null,
    isConnected: false,
    isSpeaking: false,
    sourceNodes: new Set(),
    nextStartTime: 0,

    async startSession(apiKey, systemInstruction) {
        const self = this;
        
        // Create Gemini client
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        // Create separate audio contexts
        this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
        this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
        
        // Resume after user interaction
        await this.inputAudioContext.resume();
        await this.outputAudioContext.resume();
        
        // Setup output audio chain
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);
        
        // Get microphone
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const inputAudioContext = this.inputAudioContext;
        const stream = this.mediaStream;
        
        // ✅ CORRECT: Connect with callbacks
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: ['AUDIO'],
                systemInstruction: systemInstruction,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' }
                    }
                }
            },
            callbacks: {
                onopen: function() {
                    console.log('Connected to Gemini Live API');
                    self.isConnected = true;
                    self.updateStatus('listening', 'Listening...');
                    
                    // Start audio capture
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = function(event) {
                        if (!self.isConnected || self.isSpeaking) return;
                        
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = self.createAudioBlob(inputData, inputAudioContext.sampleRate);
                        
                        sessionPromise.then(function(session) {
                            try {
                                session.sendRealtimeInput({ media: pcmBlob });
                            } catch (e) {
                                console.error('Send error:', e);
                            }
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(inputAudioContext.destination);
                },
                
                onmessage: async function(message) {
                    const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    
                    if (audio) {
                        self.isSpeaking = true;
                        self.updateStatus('speaking', 'Speaking...');
                        
                        try {
                            const audioBuffer = await self.decodeAudioData(
                                self.base64ToBytes(audio),
                                self.outputAudioContext,
                                24000,
                                1
                            );
                            
                            self.nextStartTime = Math.max(self.nextStartTime, self.outputAudioContext.currentTime);
                            
                            const source = self.outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(self.outputNode);
                            
                            source.onended = function() {
                                self.sourceNodes.delete(source);
                                if (self.sourceNodes.size === 0) {
                                    self.isSpeaking = false;
                                    if (self.isConnected) {
                                        self.updateStatus('listening', 'Listening...');
                                    }
                                }
                            };
                            
                            source.start(self.nextStartTime);
                            self.nextStartTime += audioBuffer.duration;
                            self.sourceNodes.add(source);
                            
                        } catch (e) {
                            console.error('Audio decode error:', e);
                        }
                    }
                    
                    if (message.serverContent?.interrupted) {
                        self.sourceNodes.forEach(node => {
                            try { node.stop(); } catch (e) {}
                        });
                        self.sourceNodes.clear();
                        self.nextStartTime = 0;
                        self.isSpeaking = false;
                        self.updateStatus('listening', 'Listening...');
                    }
                },
                
                onclose: function() {
                    console.log('Session closed');
                    self.isConnected = false;
                    self.updateStatus('', 'Disconnected');
                },
                
                onerror: function(error) {
                    console.error('Session error:', error);
                    self.updateStatus('error', 'Connection error');
                }
            }
        });
        
        this.session = await sessionPromise;
    },
    
    createAudioBlob(data, sampleRate) {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
        }
        return {
            data: this.bytesToBase64(new Uint8Array(int16.buffer)),
            mimeType: `audio/pcm;rate=${sampleRate}`
        };
    },
    
    bytesToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },
    
    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },
    
    async decodeAudioData(data, ctx, sampleRate, numChannels) {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    },
    
    updateStatus(type, message) {
        console.log(`Status [${type}]: ${message}`);
        // Update your UI here
    },
    
    stopSession() {
        if (this.session) {
            try { this.session.close(); } catch (e) {}
            this.session = null;
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }
        
        if (this.inputAudioContext) {
            try { this.inputAudioContext.close(); } catch (e) {}
        }
        if (this.outputAudioContext) {
            try { this.outputAudioContext.close(); } catch (e) {}
        }
        
        this.sourceNodes.forEach(n => { try { n.stop(); } catch (e) {} });
        this.sourceNodes.clear();
        
        this.isConnected = false;
        this.isSpeaking = false;
    }
};
```

---

## Need More Help?

If you encounter issues not listed here:

1. **Check browser console** for detailed error messages and stack traces
2. **Verify API key** is valid at https://aistudio.google.com/
3. **Test endpoint directly** - open ai-config.php in browser
4. **Test in Chrome/Edge** - best WebRTC and Web Audio support
5. **Check network tab** for failed requests
6. **Enable verbose logging** - add console.log statements at key points

---

**Developed by [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)**  
AI Voice Support Documentation • Version 3.0
