# AI Voice Support - Documentation Files

This folder contains all the demo code files needed to implement AI Voice Support in any Laravel/PHP website. Now featuring **bilingual support (English/Arabic)**, **custom avatar customization**, and **Gemini Live API integration**.

## 📁 File Contents

| File | Description |
|------|-------------|
| `AI_VOICE_SUPPORT_IMPLEMENTATION_GUIDE.md` | Complete step-by-step implementation guide (Markdown) with Arabic version |
| `AI_VOICE_SUPPORT_IMPLEMENTATION_PROMPT.md` | AI agent prompt for automated implementation |
| `TROUBLESHOOTING.md` | **NEW** - Common errors and solutions guide |
| `ai-implementation-prompt.md` | AI agent prompt for automated implementation |
| `documentation.html` | Professional styled documentation page with language switcher |
| `index.html` | Demo HTML page to test the feature |
| `demo-ai-knowledge-base.js` | Sample knowledge base with company data |
| `demo-ai-voice-support.js` | **UPDATED v3.0** - Main JavaScript with correct API pattern |
| `demo-ai-voice-support.css` | Glassmorphism styles for the modal + custom avatar styles |
| `demo-ai-voice-support.blade.php` | Laravel Blade component template |
| `demo-AiVoiceSupportController.php` | Backend PHP controller for secure API calls |
| `demo-routes-example.php` | Route configuration examples |
| `favicon.png` | Documentation favicon |

## 🆕 Version 3.0 Changes

### Critical Bug Fixes
- **Fixed WebSocket Error**: Resolved `Cannot read properties of undefined (reading 'onmessage')` by using the correct callbacks-based pattern
- **Fixed API Method**: Changed from `client.liveConnect()` to `client.live.connect()`
- **Removed Async Iteration**: Replaced `for await...of session.receive()` with callbacks

### Correct Implementation Pattern
```javascript
// ✅ CORRECT - Use callbacks object in connect()
const session = await ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: { ... },
    callbacks: {
        onopen: () => { /* Connected */ },
        onmessage: async (message) => { /* Handle audio */ },
        onclose: () => { /* Disconnected */ },
        onerror: (error) => { /* Handle error */ }
    }
});
```

### Troubleshooting Guide
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common issues:
- `client.liveConnect is not a function`
- `session.on is not a function`
- `Cannot read properties of undefined (reading 'onmessage')`
- `ScriptProcessorNode` deprecation warning
- API key configuration issues
- CORS errors

## 🚀 Quick Start

### 1. Test the Demo
Open `index.html` in a browser to see the UI in action.

> **Note**: Full functionality requires a backend server with Gemini API configured.

### 2. View Documentation
Open `documentation.html` for the full styled implementation guide.

### 3. Installation Steps

1. **Copy Controller**
   ```
   demo-AiVoiceSupportController.php → app/Http/Controllers/Front/AiVoiceSupportController.php
   ```

2. **Copy Blade Template**
   ```
   demo-ai-voice-support.blade.php → resources/views/front/partials/ai-voice-support.blade.php
   ```

3. **Copy Assets**
   ```
   demo-ai-knowledge-base.js → public/assets/front/js/ai-knowledge-base.js
   demo-ai-voice-support.js → public/assets/front/js/ai-voice-support.js
   demo-ai-voice-support.css → public/assets/front/css/ai-voice-support.css
   ```

4. **Add Route** (see `demo-routes-example.php`)

5. **Configure .env**
   ```env
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
   GEMINI_VOICE=Puck
   ```

6. **Clear Cache**
   ```bash
   php artisan config:clear
   php artisan route:clear
   ```

## 🎨 Custom Avatar Setup

Replace the microphone icon with a custom character:

```html
<div class="ai-floating-wrapper">
  <div class="ai-floating-label">
    <span>🤖 AI Voice Agent</span>
  </div>
  <button class="ai-floating-btn" onclick="openAIVoiceSupport()">
    <img src="assets/img/your-avatar.gif" alt="AI Assistant" class="ai-btn-gif">
  </button>
</div>
```

## 📋 Requirements

- PHP 7.4+ with cURL extension
- Laravel 6+ (or any PHP framework)
- Google Gemini API Key
- Modern browser (Chrome, Edge, Safari)

## 🔧 Customization

### Change Colors
Edit CSS variables in `demo-ai-voice-support.css`:
```css
:root {
    --ai-primary-color: #f7931e;    /* Main button color */
    --ai-primary-dark: #e08100;     /* Darker shade */
    --ai-secondary-color: #1e2a3c;  /* Background color */
}
```

### Available AI Voices
| Voice | Type |
|-------|------|
| Puck | Male |
| Charon | Male |
| Kore | Female |
| Zephyr | Female |

## 🌐 Supported Languages

English, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Turkish, Hindi, Urdu

## 👨‍💻 Developer

**Developed by [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)**

## 📞 Support

For implementation assistance:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
2. Review the full documentation
3. Contact: [Mark Nader](https://www.linkedin.com/in/mark-nader-kamel)

---
*Version 3.0 - Gemini Live API with Fixed WebSocket Implementation*  
*Last updated: January 2026*
