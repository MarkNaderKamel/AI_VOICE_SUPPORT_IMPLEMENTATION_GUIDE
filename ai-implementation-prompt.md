# AI Voice Support Implementation Prompt

> **Use this prompt with any AI coding assistant (Claude, GPT-4, Gemini, etc.) to implement the AI Voice Support feature in your Laravel/Web project.**

---

## 🤖 PROMPT FOR AI AGENT

Copy and paste the following prompt to your AI coding assistant:

---

```
I need you to implement an AI Voice Support feature in my Laravel/Web application. This feature allows users to have real-time voice conversations with an AI assistant powered by Google's Gemini Multimodal Live API.

## PROJECT REQUIREMENTS

### 1. Technology Stack
- Backend: Laravel (PHP 7.4+)
- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- AI API: Google Gemini Multimodal Live API (gemini-2.5-flash-native-audio-preview)
- Audio: Web Audio API for real-time audio streaming

### 2. Features to Implement
- Real-time voice-to-voice conversations with AI
- Audio visualizer (canvas-based) showing audio waveforms
- Modal-based UI with modern dark theme
- Integration with custom knowledge base
- Secure API key handling (server-side only)
- Multiple voice options (Zephyr, Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, Schedar)

## IMPLEMENTATION STEPS

### STEP 1: Create the Laravel Controller

Create a new controller at: `app/Http/Controllers/Front/AiVoiceSupportController.php`

The controller must have:
1. A `getConfig()` method that returns:
   - `apiKey`: Retrieved from environment variable `GEMINI_API_KEY`
   - `model`: Set to `gemini-2.5-flash-native-audio-preview-12-2025`
   - `voice`: Set to `Zephyr` (or configurable)

2. Optional: A `query()` method for fallback text-based queries

Security requirements:
- API key must ONLY be stored in `.env` file
- Never expose API key in frontend code
- Add rate limiting (10 requests per minute recommended)

### STEP 2: Add Laravel Routes

Add to `routes/web.php`:

```php
// AI Voice Support Routes
Route::get('/api/ai-voice-support/config', 'Front\AiVoiceSupportController@getConfig')
    ->name('front.ai.voice.config');

Route::post('/api/ai-voice-support', 'Front\AiVoiceSupportController@query')
    ->name('front.ai.voice.query');
```

### STEP 3: Create the JavaScript Module

Create: `public/assets/front/js/ai-voice-support.js`

The JavaScript must implement:

1. **Configuration Object**:
   - `getConfigEndpoint()`: Function to build the API URL dynamically
   - `voiceName`: Default voice (Zephyr)
   - `model`: Gemini model name

2. **State Management**:
   - `session`: WebSocket session object
   - `stream`: Audio stream
   - `audioContext`: Web Audio API context
   - `isConnected`, `isConnecting`, `isSpeaking`: Status flags
   - `apiKey`: Retrieved from backend

3. **Core Functions**:
   - `init()`: Initialize the module, cache elements, bind events
   - `openModal()`: Show the voice support modal
   - `closeModal()`: Hide the modal and cleanup
   - `startSession()`: Connect to Gemini Live API via WebSocket
   - `endSession()`: Disconnect and cleanup resources

4. **Audio Handling**:
   - `startAudioCapture()`: Request microphone access, start streaming
   - `handleAudioMessage()`: Process incoming audio from AI
   - `playAudioChunk()`: Play PCM audio data

5. **Visualizer**:
   - Canvas-based audio visualizer with bars
   - Show waveform animation during speaking/listening

6. **API Connection Flow**:
   ```javascript
   // 1. Fetch config from backend
   const response = await fetch(getConfigEndpoint());
   const config = await response.json();
   
   // 2. Load Google GenAI SDK dynamically
   const { GoogleGenAI, Modality } = await import('@anthropic/genai');
   
   // 3. Initialize client
   const client = new GoogleGenAI({ apiKey: config.apiKey });
   
   // 4. Create live session
   const session = await client.live.connect({
       model: config.model,
       config: {
           responseModalities: [Modality.AUDIO],
           speechConfig: {
               voiceName: config.voice || 'Zephyr'
           },
           systemInstruction: KNOWLEDGE_BASE.systemPrompt
       }
   });
   
   // 5. Handle incoming messages
   session.on('message', (message) => {
       if (message.serverContent?.modelTurn?.parts) {
           // Process audio data
       }
   });
   ```

### STEP 4: Create the CSS Styles

Create: `public/assets/front/css/ai-voice-support.css`

Implement styles for:
1. **Modal Overlay**: Full-screen backdrop with blur effect
2. **Modal Container**: Centered card with rounded corners
3. **Glow Effect**: Pulsing background glow animation
4. **Visualizer**: Canvas container with gradient background
5. **Control Buttons**: End Call, Retry, Close buttons
6. **Status Display**: Connection status text
7. **Floating Button**: Optional FAB for triggering the modal

Color scheme:
- Primary: #f7931e (Orange)
- Primary Dark: #e08100
- Background: #1a1a2e
- Text: #ffffff, rgba(255,255,255,0.7)
- Success: #22c55e
- Error: #ef4444

### STEP 5: Create the Blade Template

Create: `resources/views/front/partials/ai-voice-support.blade.php`

Include:
1. Modal overlay container
2. Close button
3. Header with title and subtitle
4. Status display
5. Canvas element for visualizer
6. Wave animation fallback (CSS-based)
7. Control buttons (End Call, Retry)
8. Contact link for human support

### STEP 6: Create the Knowledge Base

Create: `public/assets/front/js/ai-knowledge-base.js`

Structure:
```javascript
const AI_KNOWLEDGE_BASE = {
    // Full document content as string
    documentContent: `Your company information here...`,
    
    // Structured company info
    company: {
        name: "Your Company",
        tagline: "Your tagline",
        website: "https://yoursite.com",
        email: "info@yoursite.com",
        phone: "+1234567890"
    },
    
    // Services array
    services: [
        { name: "Service 1", description: "...", pricing: "..." }
    ],
    
    // FAQ array
    faq: [
        { question: "...", answer: "..." }
    ],
    
    // System prompt for AI
    systemPrompt: `You are a helpful AI assistant for [Company Name].
    
CRITICAL RULES:
1. ONLY answer from the provided knowledge base
2. If information is not available, direct to contact page
3. NEVER invent or hallucinate information
4. Respond in the user's language
5. Be professional and helpful`
};
```

### STEP 7: Include in Layout

Add to your main layout file (e.g., `resources/views/layouts/app.blade.php`):

```blade
<!-- Before closing </body> -->
@include('front.partials.ai-voice-support')

<link rel="stylesheet" href="{{ asset('assets/front/css/ai-voice-support.css') }}">
<script src="{{ asset('assets/front/js/ai-knowledge-base.js') }}"></script>
<script src="{{ asset('assets/front/js/ai-voice-support.js') }}"></script>
```

### STEP 8: Add Trigger Button

Add a button to trigger the modal:

```html
<!-- Option 1: Regular button -->
<button onclick="openAIVoiceSupport()">
    <i class="fas fa-microphone"></i> AI Voice Support
</button>

<!-- Option 2: Floating action button -->
<button class="ai-floating-btn" onclick="openAIVoiceSupport()">
    <i class="fas fa-microphone"></i>
</button>
```

### STEP 9: Environment Configuration

Add to your `.env` file:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

## IMPORTANT SECURITY NOTES

1. NEVER hardcode the API key in JavaScript
2. Always retrieve it from the backend via the /config endpoint
3. Add HTTPS in production
4. Consider adding rate limiting
5. Validate CORS headers appropriately

## TESTING CHECKLIST

After implementation, verify:
- [ ] Modal opens when trigger button is clicked
- [ ] Microphone permission is requested
- [ ] Connection to Gemini API succeeds (check console)
- [ ] Audio visualizer animates during conversation
- [ ] AI responds with voice output
- [ ] End Call button properly disconnects
- [ ] Modal closes cleanly
- [ ] No API key exposed in frontend source

## AVAILABLE VOICES

Choose from these Gemini voices:
- Zephyr (Default, natural male)
- Puck (Energetic)
- Charon (Deep, calm)
- Kore (Female, professional)
- Fenrir (Male, authoritative)
- Aoede (Female, warm)
- Leda (Female, friendly)
- Orus (Male, clear)
- Schedar (Male, deep)

## TROUBLESHOOTING COMMON ISSUES

1. **"Failed to connect"**: Check API key in .env, verify GEMINI_API_KEY is set correctly
2. **No audio output**: Check browser audio permissions, verify AudioContext is not suspended
3. **CORS errors**: Ensure backend returns proper headers or use same-origin requests
4. **"Session closed unexpectedly"**: Check network connectivity, may need to implement reconnection logic
5. **Console errors about @google/genai**: The SDK is loaded dynamically from CDN, ensure internet access

Please implement this feature in my project. Start by creating the controller, then the routes, JavaScript, CSS, Blade template, and knowledge base files.
```

---

## 📋 QUICK REFERENCE

### File Structure After Implementation

```
your-project/
├── app/
│   └── Http/
│       └── Controllers/
│           └── Front/
│               └── AiVoiceSupportController.php
├── routes/
│   └── web.php (add routes here)
├── resources/
│   └── views/
│       └── front/
│           └── partials/
│               └── ai-voice-support.blade.php
├── public/
│   └── assets/
│       └── front/
│           ├── css/
│           │   └── ai-voice-support.css
│           └── js/
│               ├── ai-voice-support.js
│               └── ai-knowledge-base.js
└── .env (add GEMINI_API_KEY)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai-voice-support/config` | Returns API config (key, model, voice) |
| POST | `/api/ai-voice-support` | Legacy text query endpoint (optional) |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API Key | `AIzaSy...` |

---

## 🔗 Resources

- [Google AI Studio](https://aistudio.google.com/) - Get API Key
- [Gemini Live API Documentation](https://ai.google.dev/api/multimodal-live)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Documentation Version**: 2.0  
**Last Updated**: January 2026  
**Developed by**: [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)
