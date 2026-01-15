# AI Voice Support Agent - Complete Implementation Prompt

## 🎯 Objective
Implement a fully functional AI Voice Support Agent using Google Gemini's Multimodal Live API with a custom animated avatar character, floating button with label, and bilingual support (English/Arabic).

---

## 📋 Implementation Requirements

### 1. Core Features to Implement

#### A. AI Voice Support Modal
- Full-screen modal overlay with glassmorphism design
- Real-time audio streaming using Gemini Live API
- Canvas-based audio visualizer
- Status indicators (Connecting, Connected, Listening, Speaking, Error)
- End call and retry buttons
- Responsive design for mobile devices

#### B. Custom Animated Avatar Floating Button
Replace the default microphone icon with a custom character:

**HTML Structure:**
```html
<div class="ai-floating-wrapper">
  <div class="ai-floating-label">
    <span>🤖 AI Voice Agent</span>
  </div>
  <button class="ai-floating-btn" onclick="openAIVoiceSupport()" aria-label="AI Voice Support">
    <img src="assets/img/wave.gif" alt="AI Assistant" class="ai-btn-gif">
  </button>
</div>
```

**CSS Styling for Avatar:**
```css
/* Floating AI Wrapper */
.ai-floating-wrapper {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

/* Speech Bubble Label */
.ai-floating-label {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    animation: labelFloat 3s ease-in-out infinite;
    position: relative;
}

/* Triangle pointer */
.ai-floating-label::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #6366f1;
}

@keyframes labelFloat {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(-5px); opacity: 0.9; }
}

/* Circular Avatar Button */
.ai-floating-btn {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border: 4px solid #a78bfa;
    outline: none;
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    animation: gentleFloat 4s ease-in-out infinite;
}

@keyframes gentleFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.02); }
}

.ai-floating-btn:hover {
    transform: scale(1.15);
    box-shadow: 0 15px 50px rgba(139, 92, 246, 0.6);
    animation-play-state: paused;
}

/* Avatar Image */
.ai-floating-btn .ai-btn-gif {
    width: 140%;
    height: 140%;
    object-fit: cover;
    object-position: center top;
    margin-top: 15px;
    pointer-events: none;
}
```

#### C. Backend Configuration (PHP)
Create `api/ai-config.php`:
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

$apiKey = getenv('GEMINI_API_KEY');
$model = getenv('GEMINI_MODEL') ?: 'gemini-2.5-flash-native-audio-preview-12-2025';
$voiceName = getenv('GEMINI_VOICE') ?: 'Puck'; // Male voice

if (!$apiKey) {
    echo json_encode(['success' => false, 'error' => 'API key not configured']);
    exit;
}

echo json_encode([
    'success' => true,
    'apiKey' => $apiKey,
    'model' => $model,
    'voiceName' => $voiceName,
    'systemInstruction' => 'You are a helpful AI voice assistant. Respond naturally and conversationally.'
]);
```

#### D. Environment Configuration (.env)
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_VOICE=Puck
```

**Available Voice Options:**
| Voice | Gender |
|-------|--------|
| Puck | Male |
| Charon | Male |
| Kore | Female |
| Zephyr | Female |

---

### 2. JavaScript Implementation

#### A. Dynamic Path Detection (for localhost vs production)
```javascript
config: {
    getConfigEndpoint() {
        // Detect if on localhost with subfolder or production at root
        const path = window.location.pathname;
        const basePath = path.includes('/aseu/') ? '/aseu' : '';
        return window.location.origin + basePath + '/api/ai-config.php';
    },
    voiceName: 'Puck',
    model: 'gemini-2.5-flash-native-audio-preview-12-2025'
}
```

#### B. Key JavaScript Functions
- `init()` - Initialize the voice support system
- `openModal()` - Open the voice modal and start session
- `closeModal()` - Close modal and end session
- `startSession()` - Connect to Gemini Live API
- `endSession()` - Disconnect and cleanup
- `startAudioCapture()` - Capture microphone input using ScriptProcessorNode
- `handleAudioMessage()` - Process and play audio responses
- `updateStatus()` - Update UI status display

#### C. Audio Processing
- Input: 16kHz sample rate, mono, Int16 PCM
- Output: 24kHz sample rate, mono, Int16 PCM
- Use `sendRealtimeInput()` method for audio chunks
- Base64 encode audio data for transmission

---

### 3. UI/UX Enhancements Applied

#### A. Dark Glassmorphism Theme
```css
:root {
    --bg-dark: #0d1117;
    --bg-card: rgba(22, 27, 34, 0.95);
    --glass-blur: 20px;
    --border-light: rgba(255, 255, 255, 0.1);
}

.card {
    background: var(--bg-card);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border-light);
    border-radius: 20px;
}
```

#### B. Aurora Glow Effects (Masthead)
```css
.masthead::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(247, 147, 30, 0.1) 0%, transparent 50%);
    animation: aurora 15s ease-in-out infinite;
}
```

#### C. Card Hover Effects
```css
.card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    border-color: var(--primary-color);
}
```

#### D. Dropdown Z-Index Fix (for cards with dropdowns)
```css
.card:has(.dropdown-menu.show),
.card:focus-within {
    z-index: 100 !important;
}
```

Plus JavaScript event listeners for broader browser compatibility.

---

### 4. Documentation Updates

#### A. Bilingual Support (English/Arabic)
- Add language switcher buttons in header
- Create Arabic guide section with RTL support
- Add sidebar navigation for Arabic section

**Language Switcher HTML:**
```html
<div class="language-switcher">
    <button onclick="switchLanguage('en')" id="lang-en">🌐 English</button>
    <button onclick="switchLanguage('ar')" id="lang-ar">🌐 العربية</button>
</div>
```

#### B. Custom Avatar Documentation Section
Add a section in documentation explaining how to replace the microphone icon with custom avatar/GIF.

---

### 5. File Structure

```
project-root/
├── api/
│   └── ai-config.php              # Backend API config
├── assets/
│   ├── css/
│   │   ├── styles.css            # Modern UI styles
│   │   └── ai-voice-support.css  # Voice modal + avatar styles
│   ├── js/
│   │   ├── ai-voice-support.js   # Main voice module
│   │   └── ai-knowledge-base.js  # Company knowledge data
│   └── img/
│       └── wave.gif              # Animated avatar character
├── Documentation/
│   ├── documentation.html        # Styled docs with lang switcher
│   ├── README.md                 # Quick start guide
│   └── AI_VOICE_SUPPORT_IMPLEMENTATION_GUIDE.md
├── index.html                    # Main page with AI button
└── .env                          # API keys
```

---

### 6. Testing Checklist

- [ ] Avatar GIF displays correctly in circular frame
- [ ] "AI Voice Agent" label appears above avatar with speech bubble
- [ ] Floating animation is smooth
- [ ] Clicking avatar opens voice modal
- [ ] Modal connects to Gemini Live API
- [ ] Audio visualizer shows activity
- [ ] AI responds with configured voice (Puck = male)
- [ ] End call button works
- [ ] Modal closes properly
- [ ] Works on mobile devices
- [ ] Works on production server (dynamic path detection)

---

### 7. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on api/ai-config.php | Check dynamic path detection in JavaScript |
| Female voice instead of male | Set GEMINI_VOICE=Puck in .env |
| Avatar head cut off | Adjust margin-top and object-position in CSS |
| Orbit circles around avatar | Remove ::before and ::after pseudo-elements |
| Dropdowns hidden behind cards | Add z-index fix CSS and JavaScript |

---

## 🔧 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **AI API:** Google Gemini Multimodal Live API
- **SDK:** @google/genai (loaded via ESM)
- **Audio:** Web Audio API, ScriptProcessorNode
- **Backend:** PHP 7.4+
- **Design:** Glassmorphism, CSS animations, responsive layout

---

## 👨‍💻 Developer

**Developed by [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)**

---

*This prompt captures the complete implementation of AI Voice Support Agent with custom avatar, modern UI, and bilingual documentation. Use this prompt to replicate the implementation on any new project.*
